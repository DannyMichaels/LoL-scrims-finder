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
import {
  getAdminDashboardStats,
  liftExpiredBans,
  getRecentActivities,
  getServerStatus,
} from '../../services/admin.services';

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
const RecentActivityTable = ({ activities, history }) => {
  const hasActivities = activities && activities.length > 0;
  
  return (
    <GlassPanel sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Recent Activity
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Grid container direction="column" spacing={2}>
        {!hasActivities ? (
          <Grid item>
            <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
              No recent activities found
            </Typography>
          </Grid>
        ) : (
          activities.slice(0, 10).map((activity, index) => {
            const getClickHandler = () => {
              if (activity.type === 'scrim' && activity.details?.scrimId) {
                history.push(`/scrims/${activity.details.scrimId}`);
              } else if (activity.type === 'user' && activity.details?.userName) {
                history.push(
                  `/users/${activity.details.userName}?region=${activity.details.region}`
                );
              } else if (
                activity.type === 'ban' &&
                activity.details?.userId &&
                activity.details?.userName
              ) {
                history.push(`/users/${activity.details.userName}`);
              }
            };

            const getStatusColor = () => {
              switch (activity.status) {
                case 'active':
                  return 'success';
                case 'completed':
                  return 'info';
                case 'banned':
                  return 'error';
                case 'lifted':
                  return 'warning';
                case 'new':
                  return 'primary';
                default:
                  return 'default';
              }
            };

            return (
              <Grid item key={index}>
                <Tooltip
                  title={
                    activity.type === 'scrim'
                      ? `Click to view scrim details`
                      : activity.type === 'user'
                      ? `Click to view ${activity.details?.userName}'s profile`
                      : activity.type === 'ban'
                      ? `${
                          activity.details?.reason
                            ? `Reason: ${activity.details.reason}`
                            : 'Click to view user'
                        }`
                      : ''
                  }>
                  <Grid
                    container
                    alignItems="center"
                    spacing={2}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
                      borderRadius: 1,
                      p: 0.5,
                    }}
                    onClick={getClickHandler}>
                    <Grid item>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor:
                            activity.type === 'scrim'
                              ? COLORS.primary
                              : activity.type === 'user'
                              ? COLORS.success
                              : activity.type === 'ban'
                              ? COLORS.error
                              : COLORS.info,
                        }}>
                        {activity.type === 'scrim' && <GamesIcon />}
                        {activity.type === 'user' && <PersonIcon />}
                        {activity.type === 'ban' && <BlockIcon />}
                      </Avatar>
                    </Grid>
                    <Grid item xs>
                      <Typography variant="body2">
                        {activity.description}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(activity.timestamp).toLocaleString()}
                        {activity.details?.region &&
                          ` • ${activity.details.region}`}
                        {activity.details?.rank && ` • ${activity.details.rank}`}
                      </Typography>
                    </Grid>
                    {activity.status && (
                      <Grid item>
                        <Chip
                          label={activity.status}
                          size="small"
                          color={getStatusColor()}
                        />
                      </Grid>
                    )}
                  </Grid>
                </Tooltip>
              </Grid>
            );
          })
        )}
      </Grid>
    </GlassPanel>
  );
};

export default function AdminDashboard() {
  const { currentUser, isCurrentUserAdmin } = useAuth();
  const { setCurrentAlert } = useAlerts();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [serverStatus, setServerStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userGrowthRange, setUserGrowthRange] = useState('6M');

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
      const [statsData, activitiesData, statusData] = await Promise.all([
        getAdminDashboardStats(),
        getRecentActivities().catch(() => []),
        getServerStatus().catch(() => null),
      ]);
      setDashboardData(statsData);
      setRecentActivities(activitiesData || []);
      setServerStatus(statusData);
    } catch (error) {
      console.error('Dashboard error:', error);
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

  // Generate user growth data based on selected range
  const getUserGrowthData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    let monthsToShow = 6;
    if (userGrowthRange === '3M') monthsToShow = 3;
    if (userGrowthRange === '1Y') monthsToShow = 12;
    
    const data = [];
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
      const monthName = months[monthIndex];
      const yearSuffix = year !== currentYear ? ` '${String(year).slice(-2)}` : '';
      
      // Mock data - in production this would come from backend
      const baseUsers = dashboardData?.totalUsers || 500;
      const growth = Math.floor(Math.random() * 50) + 20;
      
      data.push({
        month: `${monthName}${yearSuffix}`,
        users: Math.floor(baseUsers - (monthsToShow - i) * growth),
        fullDate: `${monthName} ${year}`
      });
    }
    return data;
  };
  
  const userGrowthData = getUserGrowthData();

  const scrimActivityData = [
    { day: 'Mon', scrims: 45 },
    { day: 'Tue', scrims: 52 },
    { day: 'Wed', scrims: 48 },
    { day: 'Thu', scrims: 70 },
    { day: 'Fri', scrims: 85 },
    { day: 'Sat', scrims: 95 },
    { day: 'Sun', scrims: 88 },
  ];

  const regionDistribution = dashboardData?.regionDistribution || [
    { name: 'NA', value: 35, color: COLORS.primary },
    { name: 'EUW', value: 30, color: COLORS.secondary },
    { name: 'EUNE', value: 15, color: COLORS.success },
    { name: 'LAN', value: 12, color: COLORS.warning },
    { name: 'OCE', value: 8, color: COLORS.info },
  ];

  const rankDistribution = dashboardData?.rankDistribution || [
    { rank: 'Iron', count: 50 },
    { rank: 'Bronze', count: 120 },
    { rank: 'Silver', count: 200 },
    { rank: 'Gold', count: 250 },
    { rank: 'Platinum', count: 180 },
    { rank: 'Diamond', count: 100 },
    { rank: 'Master+', count: 30 },
  ];
  
  // Helper function to get status icon and color
  const getStatusDisplay = (status) => {
    switch(status) {
      case 'operational':
        return { icon: <CheckCircleIcon />, color: 'success', label: 'Operational' };
      case 'warning':
        return { icon: <WarningIcon />, color: 'warning', label: 'Warning' };
      case 'error':
        return { icon: <ErrorIcon />, color: 'error', label: 'Error' };
      case 'inactive':
        return { icon: <ErrorIcon />, color: 'default', label: 'Inactive' };
      default:
        return { icon: <WarningIcon />, color: 'default', label: 'Unknown' };
    }
  };

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
              value={dashboardData?.totalUsers || 0}
              icon={<PersonIcon />}
              color={COLORS.primary}
              change={12}
              subtitle="Active this month: 450"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Scrims"
              value={dashboardData?.totalScrims || 0}
              icon={<GamesIcon />}
              color={COLORS.secondary}
              change={8}
              subtitle="This week: 234"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Today"
              value={dashboardData?.activeToday || 0}
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
              subtitle={`Expired: ${
                dashboardData?.banStatistics?.expiredBans || 0
              } | Total: ${
                dashboardData?.banStatistics?.totalBannedUsers || 0
              }`}
            />
          </Grid>
        </Grid>

        {/* Charts Row 1 */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* User Growth Chart */}
          <Grid item xs={12} md={8}>
            <GlassPanel sx={{ p: 2 }}>
              <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Grid item>
                  <Typography variant="h6">
                    User Growth
                  </Typography>
                </Grid>
                <Grid item>
                  <Grid container spacing={1}>
                    {['3M', '6M', '1Y'].map((range) => (
                      <Grid item key={range}>
                        <Button
                          size="small"
                          variant={userGrowthRange === range ? 'contained' : 'outlined'}
                          onClick={() => setUserGrowthRange(range)}
                          sx={{ minWidth: 40 }}>
                          {range}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
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
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none' }}
                    formatter={(value) => [`${value} users`, 'Total Users']}
                    labelFormatter={(label) => `Period: ${label}`}
                  />
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
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS.primary} />
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
                        color: COLORS.error,
                      },
                      {
                        name: 'Expired (Not Lifted)',
                        value: dashboardData?.banStatistics?.expiredBans || 0,
                        color: COLORS.warning,
                      },
                      {
                        name: 'Unbanned Users',
                        value:
                          (dashboardData?.banStatistics?.totalBannedUsers ||
                            0) -
                          (dashboardData?.banStatistics?.activeBans || 0) -
                          (dashboardData?.banStatistics?.expiredBans || 0),
                        color: COLORS.success,
                      },
                    ].filter((item) => item.value > 0)}
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
                        color: COLORS.error,
                      },
                      {
                        name: 'Expired (Not Lifted)',
                        value: dashboardData?.banStatistics?.expiredBans || 0,
                        color: COLORS.warning,
                      },
                      {
                        name: 'Unbanned Users',
                        value:
                          (dashboardData?.banStatistics?.totalBannedUsers ||
                            0) -
                          (dashboardData?.banStatistics?.activeBans || 0) -
                          (dashboardData?.banStatistics?.expiredBans || 0),
                        color: COLORS.success,
                      },
                    ]
                      .filter((item) => item.value > 0)
                      .map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="textSecondary">
                Total Bans in History:{' '}
                {dashboardData?.banStatistics?.totalBans || 0}
              </Typography>
              {dashboardData?.banStatistics?.expiredBans > 0 && (
                <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                  ⚠️ {dashboardData?.banStatistics?.expiredBans} ban(s) expired
                  but not lifted
                </Typography>
              )}
            </GlassPanel>
          </Grid>

          {/* Quick Ban Actions */}
          <Grid item xs={12} md={8}>
            <GlassPanel
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
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
                    <strong>
                      {dashboardData?.banStatistics?.activeBans || 0}
                    </strong>{' '}
                    Active Bans
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="warning.main">
                    <strong>
                      {dashboardData?.banStatistics?.expiredBans || 0}
                    </strong>{' '}
                    Expired (Need Lifting)
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="success.main">
                    <strong>
                      {(dashboardData?.banStatistics?.totalBannedUsers || 0) -
                        (dashboardData?.banStatistics?.activeBans || 0) -
                        (dashboardData?.banStatistics?.expiredBans || 0)}
                    </strong>{' '}
                    Lifted
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="info.main">
                    <strong>
                      {dashboardData?.banStatistics?.totalBans || 0}
                    </strong>{' '}
                    Total Bans
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
                        setRefreshing(true);
                        const response = await liftExpiredBans();
                        if (response.success) {
                          setCurrentAlert({
                            type: 'Success',
                            message:
                              response.message ||
                              'Expired bans have been lifted',
                          });
                          fetchDashboardData();
                        }
                      } catch (error) {
                        console.error('Failed to lift expired bans:', error);
                        setCurrentAlert({
                          type: 'Error',
                          message: 'Failed to lift expired bans',
                        });
                      } finally {
                        setRefreshing(false);
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
                    onClick={() => history.push('/admin/bans')}>
                    View Ban History
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => history.push('/admin/bans')}>
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
              activities={recentActivities}
              history={history}
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
                {serverStatus?.services ? (
                  <>
                    <Grid item>
                      <Grid
                        container
                        justifyContent="space-between"
                        alignItems="center">
                        <Grid item xs>
                          <Typography variant="body2">Database</Typography>
                          {serverStatus.services.database?.latency && (
                            <Typography variant="caption" color="textSecondary">
                              Latency: {serverStatus.services.database.latency}
                            </Typography>
                          )}
                        </Grid>
                        <Grid item>
                          <Chip
                            icon={getStatusDisplay(serverStatus.services.database?.status).icon}
                            label={getStatusDisplay(serverStatus.services.database?.status).label}
                            color={getStatusDisplay(serverStatus.services.database?.status).color}
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
                          {serverStatus.services.websocket?.connections !== undefined && (
                            <Typography variant="caption" color="textSecondary">
                              {serverStatus.services.websocket.connections} connections
                            </Typography>
                          )}
                        </Grid>
                        <Grid item>
                          <Chip
                            icon={getStatusDisplay(serverStatus.services.websocket?.status).icon}
                            label={getStatusDisplay(serverStatus.services.websocket?.status).label}
                            color={getStatusDisplay(serverStatus.services.websocket?.status).color}
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
                            icon={getStatusDisplay(serverStatus.services.riotApi?.status).icon}
                            label={getStatusDisplay(serverStatus.services.riotApi?.status).label}
                            color={getStatusDisplay(serverStatus.services.riotApi?.status).color}
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
                            icon={getStatusDisplay(serverStatus.services.emailService?.status).icon}
                            label={getStatusDisplay(serverStatus.services.emailService?.status).label}
                            color={getStatusDisplay(serverStatus.services.emailService?.status).color}
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </>
                ) : (
                  <Grid item>
                    <Typography variant="body2" color="textSecondary" align="center">
                      Unable to fetch server status
                    </Typography>
                  </Grid>
                )}
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
                    onClick={() => history.push('/scrims/new')}>
                    Create Scrim
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => history.push('/admin/bans')}>
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