import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadialBarChart,
  RadialBar,
  LineChart,
  Line,
} from 'recharts';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import GlassPanel from '../shared/GlassPanel';

const COLORS = {
  win: '#4CAF50',
  loss: '#f44336',
  primary: '#2196F3',
  secondary: '#FF9800',
  accent: '#9C27B0',
};

export default function UserStatsCharts({ stats, userParticipatedScrims, user }) {
  const theme = useTheme();
  const [activityFilter, setActivityFilter] = useState('all');
  const [timeRange, setTimeRange] = useState(6); // months
  const [customDateRange, setCustomDateRange] = useState({
    start: moment().subtract(6, 'months'),
    end: moment(),
  });
  const [useCustomRange, setUseCustomRange] = useState(false);

  // Prepare data for Win/Loss Pie Chart
  const winLossData = stats ? [
    {
      name: 'Wins',
      value: Math.round(
        (stats.userGamesPlayedCount * stats.userWinrate) / 100
      ),
    },
    {
      name: 'Losses',
      value:
        stats.userGamesPlayedCount -
        Math.round((stats.userGamesPlayedCount * stats.userWinrate) / 100),
    },
  ] : [];

  // Prepare data for Level Progress Radial Chart
  const levelProgressData = stats ? [
    {
      name: 'Progress',
      value: stats.expProgressPercent,
      fill: COLORS.primary,
    },
  ] : [];

  // Prepare data for Games Played vs Casted Bar Chart
  const gamesData = stats ? [
    {
      name: 'Played',
      count: stats.userGamesPlayedCount,
    },
    {
      name: 'Casted',
      count: stats.userGamesCastedCount,
    },
  ] : [];

  // Prepare monthly activity data with filters
  const monthlyActivityData = useMemo(() => {
    const monthlyData = {};
    let startDate, endDate;

    if (useCustomRange) {
      startDate = customDateRange.start;
      endDate = customDateRange.end;
    } else {
      // Find the date range based on actual scrim data
      if (userParticipatedScrims && userParticipatedScrims.length > 0) {
        // Sort scrims by date to find the most recent ones
        const sortedScrims = [...userParticipatedScrims].sort((a, b) => 
          new Date(b.gameStartTime) - new Date(a.gameStartTime)
        );
        
        // Get the most recent scrim date
        endDate = moment(sortedScrims[0].gameStartTime);
        
        // Start from timeRange months before the most recent activity
        startDate = endDate.clone().subtract(timeRange, 'months');
        
        // But don't go earlier than the oldest scrim
        const oldestScrimDate = moment(sortedScrims[sortedScrims.length - 1].gameStartTime);
        if (startDate.isBefore(oldestScrimDate)) {
          startDate = oldestScrimDate;
        }
      } else {
        // Fallback if no scrims
        endDate = moment();
        startDate = moment().subtract(timeRange, 'months');
      }
    }

    // Initialize months based on date range
    const current = startDate.clone().startOf('month');
    while (current.isSameOrBefore(endDate, 'month')) {
      const monthKey = current.format('MMM YY');
      monthlyData[monthKey] = { 
        month: monthKey, 
        played: 0,
        casted: 0,
        total: 0
      };
      current.add(1, 'month');
    }

    // Count games per month with filtering
    userParticipatedScrims.forEach((scrim) => {
      const scrimDate = moment(scrim.gameStartTime);
      
      // Check if scrim is within date range
      if (scrimDate.isBetween(startDate, endDate, null, '[]')) {
        const monthKey = scrimDate.format('MMM YY');
        
        if (monthlyData[monthKey]) {
          // Check if user was a player or caster
          const wasPlayer = [...(scrim.teamOne || []), ...(scrim.teamTwo || [])]
            .some(player => player._user === user?._id);
          const wasCaster = (scrim.casters || [])
            .some(casterId => casterId === user?._id);

          if (wasPlayer) {
            monthlyData[monthKey].played += 1;
          }
          if (wasCaster) {
            monthlyData[monthKey].casted += 1;
          }
          monthlyData[monthKey].total += 1;
        }
      }
    });

    return Object.values(monthlyData);
  }, [userParticipatedScrims, timeRange, customDateRange, useCustomRange, user?._id]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload[0]) {
      return (
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '8px',
            borderRadius: '4px',
            color: 'white',
          }}>
          {label && <p style={{ margin: 0 }}><strong>{label}</strong></p>}
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: 0, color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      return (
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '8px',
            borderRadius: '4px',
            color: 'white',
          }}>
          <p style={{ margin: 0 }}>
            <strong>{payload[0].name}</strong>: {payload[0].value} games
          </p>
        </div>
      );
    }
    return null;
  };

  if (!stats) return null;

  return (
    <Grid container spacing={3} style={{ marginTop: '24px' }} alignItems="stretch">
      {/* Win Rate Pie Chart - show placeholder if no games played */}
      {stats.userGamesPlayedCount > 0 ? (
        <Grid item xs={12} sm={6} md={3} style={{ display: 'flex' }}>
          <GlassPanel sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" align="center" gutterBottom>
              Win Rate
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={winLossData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value">
                  <Cell fill={COLORS.win} />
                  <Cell fill={COLORS.loss} />
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <Typography variant="body2" align="center" style={{ marginTop: '8px' }}>
              {stats.userWinrate}% Win Rate
            </Typography>
          </GlassPanel>
        </Grid>
      ) : (
        <Grid item xs={12} sm={6} md={3} style={{ display: 'flex' }}>
          <GlassPanel sx={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '290px' }}>
            <Typography variant="h6" align="center" gutterBottom>
              Win Rate
            </Typography>
            <Typography variant="body2" align="center" color="textSecondary" sx={{ padding: '40px 20px' }}>
              No games played yet
            </Typography>
          </GlassPanel>
        </Grid>
      )}

      {/* Level Progress Radial Chart */}
      <Grid item xs={12} sm={6} md={3} style={{ display: 'flex' }}>
        <GlassPanel sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" align="center" gutterBottom>
            Level Progress
          </Typography>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              barSize={10}
              data={levelProgressData}>
              <RadialBar
                minAngle={15}
                background
                clockWise
                dataKey="value"
                fill={COLORS.primary}
              />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: '24px', fill: '#fff' }}>
                {`${stats.expProgressPercent || 0}%`}
              </text>
              <text
                x="50%"
                y="50%"
                dy={20}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: '12px', fill: '#999' }}>
                to Level {stats.userLevel + 1}
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </GlassPanel>
      </Grid>

      {/* Games Played vs Casted */}
      <Grid item xs={12} sm={6} md={3} style={{ display: 'flex' }}>
        <GlassPanel sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" align="center" gutterBottom>
            Game Participation
          </Typography>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={gamesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill={COLORS.secondary} />
            </BarChart>
          </ResponsiveContainer>
        </GlassPanel>
      </Grid>

      {/* Total Stats Summary */}
      <Grid item xs={12} sm={6} md={3} style={{ display: 'flex' }}>
        <GlassPanel
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          <Typography variant="h6" align="center" gutterBottom>
            Stats Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="h4" align="center" color="primary">
                {stats.userLevel}
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Level
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h4" align="center" style={{ color: COLORS.win }}>
                {stats.userExp}
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Total EXP
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h4" align="center" style={{ color: COLORS.secondary }}>
                {stats.userGamesPlayedCount + stats.userGamesCastedCount}
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Total Games
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h4" align="center" style={{ color: COLORS.accent }}>
                {stats.userWinrate}%
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Win Rate
              </Typography>
            </Grid>
          </Grid>
        </GlassPanel>
      </Grid>

      {/* Monthly Activity Line Chart */}
      <Grid item xs={12}>
        <GlassPanel>
          <Grid container alignItems="center" justifyContent="space-between" style={{ marginBottom: '16px' }}>
            <Grid item>
              <Typography variant="h6">
                Activity Over Time
              </Typography>
            </Grid>
            <Grid item>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <ToggleButtonGroup
                    value={activityFilter}
                    exclusive
                    onChange={(e, newFilter) => newFilter && setActivityFilter(newFilter)}
                    size="small"
                  >
                    <ToggleButton value="all">
                      All
                    </ToggleButton>
                    <ToggleButton value="played">
                      Played
                    </ToggleButton>
                    <ToggleButton value="casted">
                      Casted
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
                <Grid item>
                  <ButtonGroup size="small">
                    <Button 
                      variant={!useCustomRange && timeRange === 3 ? "contained" : "outlined"}
                      onClick={() => {
                        setTimeRange(3);
                        setUseCustomRange(false);
                      }}
                    >
                      3M
                    </Button>
                    <Button 
                      variant={!useCustomRange && timeRange === 6 ? "contained" : "outlined"}
                      onClick={() => {
                        setTimeRange(6);
                        setUseCustomRange(false);
                      }}
                    >
                      6M
                    </Button>
                    <Button 
                      variant={!useCustomRange && timeRange === 12 ? "contained" : "outlined"}
                      onClick={() => {
                        setTimeRange(12);
                        setUseCustomRange(false);
                      }}
                    >
                      1Y
                    </Button>
                    <Button 
                      variant={useCustomRange ? "contained" : "outlined"}
                      onClick={() => setUseCustomRange(true)}
                    >
                      Custom
                    </Button>
                  </ButtonGroup>
                </Grid>
                {useCustomRange && (
                  <LocalizationProvider dateAdapter={AdapterMoment}>
                    <Grid item>
                      <DatePicker
                        label="Start Date"
                        value={customDateRange.start}
                        onChange={(newValue) => {
                          setCustomDateRange(prev => ({ ...prev, start: newValue }));
                        }}
                        renderInput={(params) => (
                          <TextField {...params} size="small" sx={{ width: 150 }} />
                        )}
                        maxDate={customDateRange.end}
                      />
                    </Grid>
                    <Grid item>
                      <DatePicker
                        label="End Date"
                        value={customDateRange.end}
                        onChange={(newValue) => {
                          setCustomDateRange(prev => ({ ...prev, end: newValue }));
                        }}
                        renderInput={(params) => (
                          <TextField {...params} size="small" sx={{ width: 150 }} />
                        )}
                        minDate={customDateRange.start}
                        maxDate={moment()}
                      />
                    </Grid>
                  </LocalizationProvider>
                )}
              </Grid>
            </Grid>
          </Grid>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {(activityFilter === 'all' || activityFilter === 'played') && (
                <Line
                  type="monotone"
                  dataKey="played"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  dot={{ fill: COLORS.primary, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Games Played"
                  hide={activityFilter === 'casted'}
                />
              )}
              {(activityFilter === 'all' || activityFilter === 'casted') && (
                <Line
                  type="monotone"
                  dataKey="casted"
                  stroke={COLORS.secondary}
                  strokeWidth={2}
                  dot={{ fill: COLORS.secondary, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Games Casted"
                  hide={activityFilter === 'played'}
                />
              )}
              {activityFilter === 'all' && (
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke={COLORS.accent}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: COLORS.accent, r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Total"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </GlassPanel>
      </Grid>
    </Grid>
  );
}