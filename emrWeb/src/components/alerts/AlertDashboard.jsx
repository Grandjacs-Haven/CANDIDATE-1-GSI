import { useMemo, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';

// icons
import BellOutlined from '@ant-design/icons/BellOutlined';
import ClockCircleOutlined from '@ant-design/icons/ClockCircleOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import CloseCircleOutlined from '@ant-design/icons/CloseCircleOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import ReloadOutlined from '@ant-design/icons/ReloadOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import CarOutlined from '@ant-design/icons/CarOutlined';
import MedicineBoxOutlined from '@ant-design/icons/MedicineBoxOutlined';
import WarningOutlined from '@ant-design/icons/WarningOutlined';

import { useAlerts } from 'hooks/useEmergencyAlerts';

// ==============================|| HELPERS ||============================== //

function extractAlerts(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function getStatusMeta(status) {
  switch (status) {
    case 'PENDING':
      return {
        label: 'Pending',
        color: '#d97706',
        bg: alpha('#d97706', 0.08),
        border: alpha('#d97706', 0.22),
        icon: <ClockCircleOutlined />
      };

    case 'BOOKED':
    case 'ACCEPTED':
      return {
        label: 'Accepted',
        color: '#2563eb',
        bg: alpha('#2563eb', 0.08),
        border: alpha('#2563eb', 0.22),
        icon: <CheckCircleOutlined />
      };

    case 'ON_THE_WAY':
      return {
        label: 'On The Way',
        color: '#2563eb',
        bg: alpha('#2563eb', 0.08),
        border: alpha('#2563eb', 0.22),
        icon: <CarOutlined />
      };

    case 'ARRIVED':
      return {
        label: 'Arrived',
        color: '#059669',
        bg: alpha('#059669', 0.08),
        border: alpha('#059669', 0.22),
        icon: <MedicineBoxOutlined />
      };

    case 'FAILED':
    case 'CANCELLED':
    case 'REJECTED':
      return {
        label: status === 'FAILED' ? 'Failed' : status === 'REJECTED' ? 'Rejected' : 'Cancelled',
        color: '#dc2626',
        bg: alpha('#dc2626', 0.08),
        border: alpha('#dc2626', 0.22),
        icon: <CloseCircleOutlined />
      };

    default:
      return {
        label: status || 'Unknown',
        color: '#6b7280',
        bg: alpha('#6b7280', 0.08),
        border: alpha('#6b7280', 0.22),
        icon: <WarningOutlined />
      };
  }
}

function getBedTypeColor(type) {
  switch (type) {
    case 'ICU':
      return '#dc2626';
    case 'HDU':
      return '#ea580c';
    case 'EMERGENCY':
      return '#d97706';
    case 'PRIVATE':
      return '#2563eb';
    case 'MATERNITY':
      return '#7c3aed';
    case 'GENERAL':
    default:
      return '#059669';
  }
}

function formatDateTime(value) {
  if (!value) return '—';

  try {
    return new Date(value).toLocaleString();
  } catch {
    return '—';
  }
}

function formatTimeAgo(value) {
  if (!value) return '—';

  const now = new Date();
  const then = new Date(value);
  const diff = Math.floor((now - then) / 1000);

  if (Number.isNaN(diff)) return '—';
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

function normalizeAlert(alert, index) {
  return {
    ...alert,
    id: alert?.id || alert?.alertId || `alert-${index}`,
    patientId: alert?.patientId || alert?.patient?.id,
    hospitalId: alert?.hospitalId || alert?.hospital?.id,
    hospitalName: alert?.hospitalName || alert?.hospital?.name || 'Unknown Hospital',
    requestedBedType: alert?.requestedBedType || alert?.bedType || 'GENERAL',
    status: alert?.status || 'PENDING',
    estimatedArrivalTimeMinutes: alert?.estimatedArrivalTimeMinutes ?? alert?.etaMinutes,
    patientNotes: alert?.patientNotes || alert?.notes || alert?.message || 'No patient notes provided',
    createdAt: alert?.createdAt || alert?.triggeredAt || alert?.requestedAt || new Date().toISOString()
  };
}

// ==============================|| STATUS CHIP ||============================== //

function StatusChip({ status }) {
  const meta = getStatusMeta(status);

  return (
    <Chip
      size="small"
      icon={<Box sx={{ color: meta.color, display: 'flex', '& svg': { fontSize: 13 } }}>{meta.icon}</Box>}
      label={meta.label}
      sx={{
        height: 26,
        borderRadius: 1,
        fontWeight: 700,
        fontSize: '0.72rem',
        color: meta.color,
        backgroundColor: meta.bg,
        border: '1px solid',
        borderColor: meta.border,
        '& .MuiChip-icon': {
          ml: 1
        }
      }}
    />
  );
}

// ==============================|| BED TYPE CHIP ||============================== //

function BedTypeChip({ type }) {
  const color = getBedTypeColor(type);

  return (
    <Chip
      size="small"
      label={type || 'GENERAL'}
      sx={{
        height: 24,
        borderRadius: 1,
        fontWeight: 700,
        fontSize: '0.7rem',
        color,
        backgroundColor: alpha(color, 0.08),
        border: '1px solid',
        borderColor: alpha(color, 0.2)
      }}
    />
  );
}

// ==============================|| STAT CARD ||============================== //

function StatCard({ title, value, subtitle, color, icon }) {
  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(color, 0.08)}, ${alpha(color, 0.02)})`
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Stack spacing={0.75}>
          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
            {title}
          </Typography>

          <Typography variant="h4" fontWeight={800} sx={{ color }}>
            {value}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        </Stack>

        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
            backgroundColor: alpha(color, 0.1),
            border: '1px solid',
            borderColor: alpha(color, 0.18),
            '& svg': {
              fontSize: 20
            }
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}

// ==============================|| ALERT ROW ||============================== //

function AlertRow({ alert, onView }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: '140px 1fr 140px 120px 120px 70px'
        },
        gap: 1.5,
        alignItems: 'center',
        px: 2.5,
        py: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        transition: '0.15s ease',
        '&:hover': {
          backgroundColor: alpha('#64748b', 0.04)
        }
      }}
    >
      <Stack spacing={0.25}>
        <Typography variant="body2" fontWeight={700}>
          {formatTimeAgo(alert.createdAt)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatDateTime(alert.createdAt)}
        </Typography>
      </Stack>

      <Stack spacing={0.35}>
        <Typography variant="body2" fontWeight={700}>
          {alert.hospitalName}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Patient ID: {alert.patientId || '—'}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {alert.patientNotes}
        </Typography>
      </Stack>

      <Stack spacing={0.5}>
        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          Bed Requested
        </Typography>
        <BedTypeChip type={alert.requestedBedType} />
      </Stack>

      <Stack spacing={0.5}>
        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          ETA
        </Typography>
        <Typography variant="body2" fontWeight={700}>
          {alert.estimatedArrivalTimeMinutes ? `${alert.estimatedArrivalTimeMinutes} min` : '—'}
        </Typography>
      </Stack>

      <Stack spacing={0.5}>
        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          Status
        </Typography>
        <StatusChip status={alert.status} />
      </Stack>

      <Stack direction="row" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
        <Tooltip title="View details">
          <IconButton size="small" onClick={() => onView(alert)}>
            <EyeOutlined />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}

// ==============================|| DETAILS DRAWER ||============================== //

function AlertDetailsDrawer({ open, alert, onClose }) {
  if (!alert) return null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 430 } } }}>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Alert Details
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Emergency request information
            </Typography>
          </Box>

          <IconButton onClick={onClose}>
            <CloseOutlined />
          </IconButton>
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        <Stack spacing={2.5}>
          <Stack spacing={0.75}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              Status
            </Typography>
            <StatusChip status={alert.status} />
          </Stack>

          <Stack spacing={0.75}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              Hospital
            </Typography>
            <Typography variant="body1" fontWeight={700}>
              {alert.hospitalName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {alert.hospitalId || 'No hospital ID'}
            </Typography>
          </Stack>

          <Stack spacing={0.75}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              Patient
            </Typography>
            <Typography variant="body2">{alert.patientId || '—'}</Typography>
          </Stack>

          <Stack spacing={0.75}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              Requested Bed Type
            </Typography>
            <BedTypeChip type={alert.requestedBedType} />
          </Stack>

          <Stack spacing={0.75}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              Estimated Arrival
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              {alert.estimatedArrivalTimeMinutes ? `${alert.estimatedArrivalTimeMinutes} minutes` : 'Not provided'}
            </Typography>
          </Stack>

          <Stack spacing={0.75}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              Patient Notes
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                backgroundColor: alpha('#64748b', 0.04)
              }}
            >
              <Typography variant="body2">{alert.patientNotes}</Typography>
            </Paper>
          </Stack>

          <Stack spacing={0.75}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              Created At
            </Typography>
            <Typography variant="body2">{formatDateTime(alert.createdAt)}</Typography>
          </Stack>

          <Divider />

          <Stack direction="row" spacing={1}>
            <Button fullWidth variant="contained" sx={{ textTransform: 'none', fontWeight: 700 }}>
              Take Action
            </Button>
            <Button fullWidth variant="outlined" sx={{ textTransform: 'none', fontWeight: 700 }}>
              Assign Bed
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
}

// ==============================|| MAIN PAGE ||============================== //

export default function AlertMonitorDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [bedTypeFilter, setBedTypeFilter] = useState('ALL');
  const [selectedAlert, setSelectedAlert] = useState(null);

  const { data, isLoading, isFetching, error, refetch } = useAlerts({ size: 100 });

  const alerts = useMemo(() => {
    return extractAlerts(data).map(normalizeAlert);
  }, [data]);

  const stats = useMemo(() => {
    const pending = alerts.filter((a) => a.status === 'PENDING').length;
    const onTheWay = alerts.filter((a) => a.status === 'ON_THE_WAY').length;
    const arrived = alerts.filter((a) => a.status === 'ARRIVED').length;
    const failed = alerts.filter((a) => ['FAILED', 'REJECTED', 'CANCELLED'].includes(a.status)).length;

    return {
      total: alerts.length,
      pending,
      onTheWay,
      arrived,
      failed
    };
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSearch =
        !searchQuery ||
        alert.hospitalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.patientNotes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.patientId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.hospitalId?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || alert.status === statusFilter;
      const matchesBedType = bedTypeFilter === 'ALL' || alert.requestedBedType === bedTypeFilter;

      return matchesSearch && matchesStatus && matchesBedType;
    });
  }, [alerts, searchQuery, statusFilter, bedTypeFilter]);

  return (
    <>
      <Grid container spacing={2.5}>
        {/* HEADER */}
        <Grid size={12}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              background: `linear-gradient(135deg, ${alpha('#0f172a', 0.04)}, ${alpha('#2563eb', 0.04)})`
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
              spacing={2}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563eb',
                    backgroundColor: alpha('#2563eb', 0.1),
                    border: '1px solid',
                    borderColor: alpha('#2563eb', 0.18),
                    '& svg': { fontSize: 24 }
                  }}
                >
                  <BellOutlined />
                </Box>

                <Box>
                  <Typography variant="h4" fontWeight={800} fontSize={{ xs: '1.35rem', md: '1.6rem' }}>
                    Emergency Command Center
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monitor hospital alerts, bed requests, and patient emergency movement.
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label="Live Monitoring"
                  size="small"
                  sx={{
                    borderRadius: 1,
                    fontWeight: 800,
                    color: '#059669',
                    backgroundColor: alpha('#059669', 0.08),
                    border: '1px solid',
                    borderColor: alpha('#059669', 0.18)
                  }}
                />

                <Button
                  variant="contained"
                  startIcon={<ReloadOutlined />}
                  onClick={() => refetch()}
                  disabled={isFetching}
                  sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 700 }}
                >
                  {isFetching ? 'Refreshing...' : 'Refresh'}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        {/* STATS */}
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Pending" value={stats.pending} subtitle="Awaiting action" color="#d97706" icon={<ClockCircleOutlined />} />
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="On The Way" value={stats.onTheWay} subtitle="Patients in transit" color="#2563eb" icon={<CarOutlined />} />
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Arrived" value={stats.arrived} subtitle="Reached hospital" color="#059669" icon={<MedicineBoxOutlined />} />
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Failed" value={stats.failed} subtitle="Needs review" color="#dc2626" icon={<CloseCircleOutlined />} />
        </Grid>

        {/* FILTERS */}
        <Grid size={12}>
          <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={1.5} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by hospital, patient ID, notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlined />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Statuses</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="BOOKED">Booked</MenuItem>
                  <MenuItem value="ACCEPTED">Accepted</MenuItem>
                  <MenuItem value="ON_THE_WAY">On The Way</MenuItem>
                  <MenuItem value="ARRIVED">Arrived</MenuItem>
                  <MenuItem value="FAILED">Failed</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Bed Type"
                  value={bedTypeFilter}
                  onChange={(e) => setBedTypeFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Bed Types</MenuItem>
                  <MenuItem value="GENERAL">General</MenuItem>
                  <MenuItem value="EMERGENCY">Emergency</MenuItem>
                  <MenuItem value="ICU">ICU</MenuItem>
                  <MenuItem value="HDU">HDU</MenuItem>
                  <MenuItem value="PRIVATE">Private</MenuItem>
                  <MenuItem value="MATERNITY">Maternity</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* ALERT LIST */}
        <Grid size={12}>
          <Paper sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2.5, py: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Emergency Alerts
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Showing {filteredAlerts.length} of {alerts.length} alerts
                </Typography>
              </Box>

              <Chip
                label={`${stats.total} Total`}
                size="small"
                sx={{
                  borderRadius: 1,
                  fontWeight: 800
                }}
              />
            </Stack>

            <Divider />

            {error && (
              <Box sx={{ p: 2 }}>
                <Alert severity="error">Failed to load emergency alerts. Please refresh or check the backend.</Alert>
              </Box>
            )}

            {isLoading ? (
              <Stack spacing={0} sx={{ p: 2 }}>
                {[1, 2, 3, 4].map((item) => (
                  <Skeleton key={item} height={72} />
                ))}
              </Stack>
            ) : filteredAlerts.length === 0 ? (
              <Box sx={{ p: 5, textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={800}>
                  No alerts found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try changing your filters or refreshing the page.
                </Typography>
              </Box>
            ) : (
              <Box>
                {filteredAlerts.map((alert) => (
                  <AlertRow key={alert.id} alert={alert} onView={setSelectedAlert} />
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <AlertDetailsDrawer open={Boolean(selectedAlert)} alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </>
  );
}
