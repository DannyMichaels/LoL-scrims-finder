const cron = require('node-cron');
const User = require('../models/user.model');
const Ban = require('../models/ban.model');
const { unbanUser } = require('../utils/adminUtils');

// Function to check and unban expired users
const checkAndUnbanExpiredUsers = async () => {
  try {
    console.log('[CRON] Checking for expired bans...');
    
    const currentDate = new Date();
    
    // Find all users with active bans that have expired
    const usersWithExpiredBans = await User.find({
      'currentBan.isActive': true,
      'currentBan.dateTo': { $lte: currentDate }
    });
    
    if (usersWithExpiredBans.length === 0) {
      console.log('[CRON] No expired bans found.');
      return;
    }
    
    console.log(`[CRON] Found ${usersWithExpiredBans.length} expired ban(s) to lift.`);
    
    let unbannedCount = 0;
    let errors = [];
    
    for (const user of usersWithExpiredBans) {
      try {
        // Unban the user
        await unbanUser(user);
        unbannedCount++;
        console.log(`[CRON] Unbanned user: ${user.name} (${user.email})`);
      } catch (error) {
        console.error(`[CRON] Error unbanning user ${user.name}:`, error.message);
        errors.push({ user: user.name, error: error.message });
      }
    }
    
    console.log(`[CRON] Ban check complete. Unbanned ${unbannedCount} user(s).`);
    
    if (errors.length > 0) {
      console.log(`[CRON] Errors encountered: ${errors.length}`);
      console.log('[CRON] Error details:', errors);
    }
    
  } catch (error) {
    console.error('[CRON] Error in ban check job:', error);
  }
};

// Function to run a manual check (can be called from admin endpoint)
const manualLiftExpiredBans = async () => {
  console.log('[MANUAL] Running manual expired ban check...');
  await checkAndUnbanExpiredUsers();
  return true;
};

// Initialize cron jobs
const initializeCronJobs = () => {
  // Schedule the job to run every day at 2:00 AM
  // Format: '0 2 * * *' = minute hour day month dayOfWeek
  cron.schedule('0 2 * * *', checkAndUnbanExpiredUsers, {
    scheduled: true,
    timezone: "America/New_York" // Adjust timezone as needed
  });
  
  console.log('[CRON] Scheduled daily ban check job at 2:00 AM');
  
  // Also run once on startup to catch any expired bans
  setTimeout(() => {
    console.log('[CRON] Running initial ban check on startup...');
    checkAndUnbanExpiredUsers();
  }, 5000); // Wait 5 seconds after startup
  
  // Optional: Schedule more frequent checks during development
  if (process.env.NODE_ENV === 'development') {
    // Run every hour in development
    cron.schedule('0 * * * *', checkAndUnbanExpiredUsers, {
      scheduled: true,
      timezone: "America/New_York"
    });
    console.log('[CRON] Development mode: Scheduled hourly ban checks');
  }
};

module.exports = {
  initializeCronJobs,
  manualLiftExpiredBans,
  checkAndUnbanExpiredUsers
};