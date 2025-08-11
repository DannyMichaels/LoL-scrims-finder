import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useAlerts from '../../hooks/useAlerts';

// Components
import Navbar from '../../components/shared/Navbar/Navbar';
import { InnerColumn } from '../../components/shared/PageComponents';
import GlassPanel from '../../components/shared/GlassPanel';
import Loading from '../../components/shared/Loading';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import { Helmet } from 'react-helmet';

// Charts
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Icons
import PersonIcon from '@mui/icons-material/Person';
import GamesIcon from '@mui/icons-material/SportsEsports';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import RefreshIcon from '@mui/icons-material/Refresh';
import BlockIcon from '@mui/icons-material/Block';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

// Services
import { getAdminDashboardStats } from '../../services/admin.services';

const COLORS = {
  primary: '#2196F3',
  secondary: '#FF9800',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#00BCD4',
};

// Stat Card Component
const StatCard = ({ title, value, icon, color, change, subtitle }) => (
  <GlassPanel sx={{ height: '100%', p: 2 }}>
    <Grid container spacing={2} alignItems="center">
      <Grid item>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>{icon}</Avatar>
      </Grid>
      <Grid item xs>
        <Typography variant="body2" color="textSecondary">
          {title}
        </Typography>
        <Typography variant="h4">{value?.toLocaleString() || 0}</Typography>
        {subtitle && (
          <Typography variant="caption" color="textSecondary">
            {subtitle}
          </Typography>
        )}
        {change !== undefined && (
          <Typography
            variant="body2"
            sx={{
              color: change >= 0 ? COLORS.success : COLORS.error,
              display: 'flex',
              alignItems: 'center',
              mt: 0.5,
            }}>
            {change >= 0 ? <TrendingUpIcon fontSize="small" /> : null}
            {change >= 0 ? '+' : ''}
            {change}% from last week
          </Typography>
        )}
      </Grid>
    </Grid>
  </GlassPanel>
);

// Recent Activity Table Component
const RecentActivityTable = ({ activities }) => (
  <GlassPanel sx={{ p: 2, height: '100%' }}>
    <Typography variant="h6" gutterBottom>
      Recent Activity
    </Typography>
    <Divider sx={{ my: 2 }} />
    <Grid container direction="column" spacing={2}>
      {activities?.slice(0, 10).map((activity, index) => (
        <Grid item key={index}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <Avatar sx={{ width: 32, height: 32 }}>
                {activity.type === 'scrim' && <GamesIcon />}
                {activity.type === 'user' && <PersonIcon />}
                {activity.type === 'ban' && <BlockIcon />}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="body2">{activity.description}</Typography>
              <Typography variant="caption" color="textSecondary">
                {new Date(activity.timestamp).toLocaleString()}
              </Typography>
            </Grid>
            {activity.status && (
              <Grid item>
                <Chip
                  label={activity.status}
                  size="small"
                  color={
                    activity.status === 'active'
                      ? 'success'
                      : activity.status === 'pending'
                      ? 'warning'
                      : 'default'
                  }
                />
              </Grid>
            )}
          </Grid>
        </Grid>
      ))}
    </Grid>
  </GlassPanel>
);

export default function AdminDashboard() {
  const { currentUser, isCurrentUserAdmin } = useAuth();
  const { setCurrentAlert } = useAlerts();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isCurrentUserAdmin) {
      setCurrentAlert({
        type: 'Error',
        message: 'You do not have permission to view this page',
      });
      history.push('/');
      return;
    }

    fetchDashboardData();
  }, [isCurrentUserAdmin, history]);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const data = await getAdminDashboardStats();
      setDashboardData(data);
    } catch (error) {
      setCurrentAlert({
        type: 'Error',
        message: 'Failed to load dashboard data',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (loading) {
    return <Loading text="Loading Dashboard..." />;
  }

  // Mock data for charts (replace with real data from backend)
  const userGrowthData = [
    { month: 'Jan', users: 450 },
    { month: 'Feb', users: 520 },
    { month: 'Mar', users: 580 },
    { month: 'Apr', users: 690 },
    { month: 'May', users: 750 },
    { month: 'Jun', users: 820 },
  ];

  const scrimActivityData = [
    { day: 'Mon', scrims: 45 },
    { day: 'Tue', scrims: 52 },
    { day: 'Wed', scrims: 48 },
    { day: 'Thu', scrims: 70 },
    { day: 'Fri', scrims: 85 },
    { day: 'Sat', scrims: 95 },
    { day: 'Sun', scrims: 88 },
  ];

  const regionDistribution = [
    { name: 'NA', value: 35, color: COLORS.primary },
    { name: 'EUW', value: 30, color: COLORS.secondary },
    { name: 'EUNE', value: 15, color: COLORS.success },
    { name: 'LAN', value: 12, color: COLORS.warning },
    { name: 'OCE', value: 8, color: COLORS.info },
  ];

  const rankDistribution = [
    { rank: 'Iron', count: 50 },
    { rank: 'Bronze', count: 120 },
    { rank: 'Silver', count: 200 },
    { rank: 'Gold', count: 250 },
    { rank: 'Platinum', count: 180 },
    { rank: 'Diamond', count: 100 },
    { rank: 'Master+', count: 30 },
  ];

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Admin Dashboard | Bootcamp LoL Scrim Gym</title>
        <meta
          name="description"
          content="Admin Dashboard for Bootcamp LoL Scrim Gym"
        />
      </Helmet>

      <Navbar />
      <InnerColumn>
        {/* Header */}
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}>
          <Grid item>
            <Typography variant="h1">Admin Dashboard</Typography>
            <Typography variant="body2" color="textSecondary">
              Welcome back, {currentUser?.name}
            </Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshIcon className={refreshing ? 'spinning' : ''} />
            </IconButton>
          </Grid>
        </Grid>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={dashboardData?.totalUsers || 2834}
              icon={<PersonIcon />}
              color={COLORS.primary}
              change={12}
              subtitle="Active this month: 450"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Scrims"
              value={dashboardData?.totalScrims || 4608}
              icon={<GamesIcon />}
              color={COLORS.secondary}
              change={8}
              subtitle="This week: 234"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Today"
              value={dashboardData?.activeToday || 145}
              icon={<GroupIcon />}
              color={COLORS.success}
              change={-5}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Bans"
              value={dashboardData?.banStatistics?.activeBans || 0}
              icon={<BlockIcon />}
              color={COLORS.error}
              subtitle={`Expired: ${dashboardData?.banStatistics?.expiredBans || 0} | Total: ${dashboardData?.banStatistics?.totalBannedUsers || 0}`}
            />
          </Grid>
        </Grid>

        {/* Charts Row 1 */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* User Growth Chart */}
          <Grid item xs={12} md={8}>
            <GlassPanel sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                User Growth
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={COLORS.primary}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={COLORS.primary}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke={COLORS.primary}
                    fill="url(#colorUsers)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </GlassPanel>
          </Grid>

          {/* Region Distribution */}
          <Grid item xs={12} md={4}>
            <GlassPanel sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Region Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={regionDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value">
                    {regionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </GlassPanel>
          </Grid>
        </Grid>

        {/* Charts Row 2 */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Scrim Activity */}
          <Grid item xs={12} md={6}>
            <GlassPanel sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Weekly Scrim Activity
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={scrimActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="day" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip />
                  <Bar dataKey="scrims" fill={COLORS.secondary} />
                </BarChart>
              </ResponsiveContainer>
            </GlassPanel>
          </Grid>

          {/* Rank Distribution */}
          <Grid item xs={12} md={6}>
            <GlassPanel sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Rank Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={rankDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="rank" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS.info} />
                </BarChart>
              </ResponsiveContainer>
            </GlassPanel>
          </Grid>
        </Grid>

        {/* Ban Statistics Row */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Ban Statistics Chart */}
          <Grid item xs={12} md={4}>
            <GlassPanel sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Ban Statistics Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { 
                        name: 'Active Bans', 
                        value: dashboardData?.banStatistics?.activeBans || 0,
                        color: COLORS.error 
                      },
                      { 
                        name: 'Expired (Not Lifted)', 
                        value: dashboardData?.banStatistics?.expiredBans || 0,
                        color: COLORS.warning 
                      },
                      { 
                        name: 'Unbanned Users', 
                        value: (dashboardData?.banStatistics?.totalBannedUsers || 0) - 
                               (dashboardData?.banStatistics?.activeBans || 0) - 
                               (dashboardData?.banStatistics?.expiredBans || 0),
                        color: COLORS.success 
                      }
                    ].filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value">
                    {[
                      { 
                        name: 'Active Bans', 
                        value: dashboardData?.banStatistics?.activeBans || 0,
                        color: COLORS.error 
                      },
                      { 
                        name: 'Expired (Not Lifted)', 
                        value: dashboardData?.banStatistics?.expiredBans || 0,
                        color: COLORS.warning 
                      },
                      { 
                        name: 'Unbanned Users', 
                        value: (dashboardData?.banStatistics?.totalBannedUsers || 0) - 
                               (dashboardData?.banStatistics?.activeBans || 0) - 
                               (dashboardData?.banStatistics?.expiredBans || 0),
                        color: COLORS.success 
                      }
                    ].filter(item => item.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="textSecondary">
                Total Bans in History: {dashboardData?.banStatistics?.totalBans || 0}
              </Typography>
              {dashboardData?.banStatistics?.expiredBans > 0 && (
                <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                  ⚠️ {dashboardData?.banStatistics?.expiredBans} ban(s) expired but not lifted
                </Typography>
              )}
            </GlassPanel>
          </Grid>

          {/* Quick Ban Actions */}
          <Grid item xs={12} md={8}>
            <GlassPanel sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Ban Management
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" gutterBottom>
                    Quick Statistics:
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="error.main">
                    <strong>{dashboardData?.banStatistics?.activeBans || 0}</strong> Active Bans
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="warning.main">
                    <strong>{dashboardData?.banStatistics?.expiredBans || 0}</strong> Expired (Need Lifting)
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="success.main">
                    <strong>{(dashboardData?.banStatistics?.totalBannedUsers || 0) - 
                            (dashboardData?.banStatistics?.activeBans || 0) - 
                            (dashboardData?.banStatistics?.expiredBans || 0)}</strong> Lifted
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="info.main">
                    <strong>{dashboardData?.banStatistics?.totalBans || 0}</strong> Total Bans
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" gutterBottom>
                    Actions:
                  </Typography>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    size="small"
                    color="warning"
                    onClick={async () => {
                      try {
                        // Call endpoint to lift expired bans
                        const response = await fetch('/api/admin/lift-expired-bans', {
                          method: 'POST',
                          headers: {
                            'Authorization': localStorage.getItem('token'),
                            'Content-Type': 'application/json'
                          }
                        });
                        if (response.ok) {
                          fetchDashboardData();
                        }
                      } catch (error) {
                        console.error('Failed to lift expired bans:', error);
                      }
                    }}
                    disabled={!dashboardData?.banStatistics?.expiredBans}>
                    Lift All Expired Bans
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => history.push('/admin/ban-history')}>
                    View Ban History
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => history.push('/bans')}>
                    Manage Bans
                  </Button>
                </Grid>
              </Grid>
            </GlassPanel>
          </Grid>
        </Grid>

        {/* Tables Row */}
        <Grid container spacing={3} alignItems="stretch">
          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <RecentActivityTable
              activities={[
                {
                  type: 'scrim',
                  description: 'New scrim created: "High Elo 5v5"',
                  timestamp: new Date(),
                  status: 'active',
                },
                {
                  type: 'user',
                  description: 'New user registered: TestPlayer123',
                  timestamp: new Date(Date.now() - 3600000),
                },
                {
                  type: 'ban',
                  description: 'User banned: ToxicPlayer',
                  timestamp: new Date(Date.now() - 7200000),
                  status: 'banned',
                },
                {
                  type: 'scrim',
                  description: 'Scrim completed: "Gold/Plat Custom"',
                  timestamp: new Date(Date.now() - 10800000),
                  status: 'completed',
                },
              ]}
            />
          </Grid>

          {/* System Status */}
          <Grid item xs={12} md={6}>
            <GlassPanel sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container direction="column" spacing={2}>
                <Grid item>
                  <Grid
                    container
                    justifyContent="space-between"
                    alignItems="center">
                    <Grid item xs>
                      <Typography variant="body2">Database</Typography>
                    </Grid>
                    <Grid item>
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Operational"
                        color="success"
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <Grid
                    container
                    justifyContent="space-between"
                    alignItems="center">
                    <Grid item xs>
                      <Typography variant="body2">WebSocket Server</Typography>
                    </Grid>
                    <Grid item>
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Connected"
                        color="success"
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <Grid
                    container
                    justifyContent="space-between"
                    alignItems="center">
                    <Grid item xs>
                      <Typography variant="body2">Riot API</Typography>
                    </Grid>
                    <Grid item>
                      <Chip
                        icon={<WarningIcon />}
                        label="Rate Limited"
                        color="warning"
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <Grid
                    container
                    justifyContent="space-between"
                    alignItems="center">
                    <Grid item xs>
                      <Typography variant="body2">Email Service</Typography>
                    </Grid>
                    <Grid item>
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Active"
                        color="success"
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="textSecondary" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={1} sx={{ mt: 1 }}>
                <Grid item>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => history.push('/admin/scrims/create')}>
                    Create Scrim
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => history.push('/admin/ban-history')}>
                    Ban History
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => window.location.reload()}>
                    Clear Cache
                  </Button>
                </Grid>
              </Grid>
            </GlassPanel>
          </Grid>
        </Grid>
      </InnerColumn>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .spinning {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </>
  );
}
