import { useMemo, useState } from 'react';
import { Box, Button, Drawer, IconButton, Stack, Typography, Paper, Grid, TextField } from '@mui/material';
import { Table, message, Popconfirm } from 'antd';
import { alpha, useTheme } from '@mui/material/styles';

import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import DoneAllOutlined from '@mui/icons-material/DoneAllOutlined';
import LocalHospitalOutlined from '@mui/icons-material/LocalHospitalOutlined';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import NotificationsActiveOutlined from '@mui/icons-material/NotificationsActiveOutlined';
import DirectionsCarOutlined from '@mui/icons-material/DirectionsCarOutlined';
import BedOutlined from '@mui/icons-material/BedOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import FilterOutlined from '@mui/icons-material/FilterOutlined';

import { useAlerts, useCancelAlert, useCheckInToBed, useDeleteAlert, useMarkAlertAsArrived } from 'hooks/useEmergencyAlerts';

// ==============================|| CONSTANTS ||============================== //

const STATUS_META = {
  PENDING: { label: 'PENDING', tone: '#d97706', bg: alpha('#d97706', 0.06), border: alpha('#d97706', 0.15) },
  ON_THE_WAY: { label: 'EN ROUTE', tone: '#2563eb', bg: alpha('#2563eb', 0.06), border: alpha('#2563eb', 0.15) },
  ARRIVED: { label: 'ARRIVED', tone: '#7c3aed', bg: alpha('#7c3aed', 0.06), border: alpha('#7c3aed', 0.15) },
  OCCUPIED: { label: 'OCCUPIED', tone: '#059669', bg: alpha('#059669', 0.06), border: alpha('#059669', 0.15) },
  COMPLETED: { label: 'COMPLETED', tone: '#059669', bg: alpha('#059669', 0.06), border: alpha('#059669', 0.15) },
  FAILED: { label: 'FAILED', tone: '#dc2626', bg: alpha('#dc2626', 0.06), border: alpha('#dc2626', 0.15) },
  CANCELLED: { label: 'CANCELLED', tone: '#6b7280', bg: alpha('#6b7280', 0.06), border: alpha('#6b7280', 0.15) }
};

const BED_TYPES = {
  ICU: { label: 'ICU', color: '#dc2626' },
  GENERAL: { label: 'General', color: '#059669' },
  PRIVATE: { label: 'Private', color: '#2563eb' },
  EMERGENCY: { label: 'Emergency', color: '#d97706' },
  MATERNITY: { label: 'Maternity', color: '#7c3aed' }
};

// ==============================|| HELPERS ||============================== //

function getAlertsFromPage(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function getTotalElements(payload) {
  if (typeof payload?.totalElements === 'number') return payload.totalElements;
  if (typeof payload?.total === 'number') return payload.total;
  if (Array.isArray(payload)) return payload.length;
  return 0;
}

function getStatusMeta(status) {
  return STATUS_META[status] || STATUS_META.PENDING;
}

function getBedTypeMeta(type) {
  return BED_TYPES[type] || BED_TYPES.GENERAL;
}

function formatTimeAgo(date) {
  if (!date) return '—';
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatDateTime(date) {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ==============================|| COMPONENTS ||============================== //

function StatusBadge({ status }) {
  const meta = getStatusMeta(status);
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.5,
        py: 0.5,
        borderRadius: 0.5,
        backgroundColor: meta.bg,
        border: '1px solid',
        borderColor: meta.border
      }}
    >
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: meta.tone }} />
      <Typography
        variant="caption"
        fontWeight={700}
        fontSize="0.7rem"
        sx={{ color: meta.tone, textTransform: 'uppercase', letterSpacing: 0.5 }}
      >
        {meta.label}
      </Typography>
    </Box>
  );
}

function StatCard({ label, value, subtext, tone, icon }) {
  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 0.5,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper'
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Stack spacing={1}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontSize="0.7rem"
            fontWeight={600}
            sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={700} fontSize="1.75rem" sx={{ color: tone || 'text.primary' }}>
            {value}
          </Typography>
          {subtext && (
            <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
              {subtext}
            </Typography>
          )}
        </Stack>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tone ? alpha(tone, 0.08) : alpha('#6b7280', 0.08),
            border: '1px solid',
            borderColor: tone ? alpha(tone, 0.15) : alpha('#6b7280', 0.15)
          }}
        >
          <Box sx={{ color: tone || '#6b7280', fontSize: 18, display: 'flex', alignItems: 'center' }}>{icon}</Box>
        </Box>
      </Stack>
    </Paper>
  );
}

// ==============================|| PAGE ||============================== //

export default function AlertsPage() {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const actorId = localStorage.getItem('userId');

  const { data, isLoading } = useAlerts({ page, size: 20 });
  const markArrived = useMarkAlertAsArrived();
  const checkIn = useCheckInToBed();
  const cancelAlert = useCancelAlert();
  const deleteAlert = useDeleteAlert();

  const alerts = getAlertsFromPage(data);
  const totalElements = getTotalElements(data);

  const stats = useMemo(() => {
    const incoming = alerts.filter((a) => ['PENDING', 'ON_THE_WAY'].includes(a.status)).length;
    const critical = alerts.filter((a) => a.status === 'ON_THE_WAY' && a.estimatedArrivalTimeMinutes <= 5).length;
    const occupied = alerts.filter((a) => a.status === 'OCCUPIED').length;
    const completed = alerts.filter((a) => a.status === 'COMPLETED').length;
    return { incoming, critical, occupied, completed, total: alerts.length };
  }, [alerts]);

  const handleAction = async (action, alertId) => {
    try {
      if (action === 'arrive') await markArrived.mutateAsync({ alertId, actorId });
      if (action === 'checkIn') await checkIn.mutateAsync({ alertId, actorId });
      if (action === 'cancel') await cancelAlert.mutateAsync(alertId);
      if (action === 'delete') await deleteAlert.mutateAsync(alertId);

      setSelectedAlert(null);
      message.success('Action completed successfully');
    } catch (error) {
      message.error(error?.response?.data?.message || 'Action failed');
    }
  };

  const columns = [
    {
      title: 'Alert',
      key: 'alert',
      width: 280,
      render: (_, alert) => {
        const meta = getStatusMeta(alert.status);
        return (
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: meta.bg,
                border: '1px solid',
                borderColor: meta.border
              }}
            >
              <Typography variant="body2" fontWeight={700} sx={{ color: meta.tone }}>
                {alert.requestedBedType?.slice(0, 2) || 'AL'}
              </Typography>
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} fontSize="0.875rem" noWrap>
                {alert.message || 'Emergency Alert'}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                {formatTimeAgo(alert.createdAt)} • {alert.patientId?.slice(0, 8) || 'Unknown'}
              </Typography>
            </Box>
          </Stack>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 140,
      render: (status) => <StatusBadge status={status} />
    },
    {
      title: 'Bed Type',
      dataIndex: 'requestedBedType',
      width: 120,
      render: (type) => {
        const meta = getBedTypeMeta(type);
        return (
          <Box
            sx={{
              display: 'inline-flex',
              px: 1,
              py: 0.25,
              borderRadius: 0.5,
              backgroundColor: alpha(meta.color, 0.08),
              border: '1px solid',
              borderColor: alpha(meta.color, 0.15)
            }}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              fontSize="0.65rem"
              sx={{ color: meta.color, textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              {meta.label}
            </Typography>
          </Box>
        );
      }
    },
    {
      title: 'ETA',
      dataIndex: 'estimatedArrivalTimeMinutes',
      width: 100,
      render: (eta, record) => {
        if (!eta)
          return (
            <Typography variant="body2" fontSize="0.875rem" color="text.secondary">
              —
            </Typography>
          );
        const color = record.status === 'ON_THE_WAY' && eta <= 5 ? '#dc2626' : record.status === 'ON_THE_WAY' ? '#d97706' : '#6b7280';
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <AccessTimeOutlined sx={{ fontSize: 14, color }} />
            <Typography variant="body2" fontWeight={600} fontSize="0.875rem" sx={{ color }}>
              {eta}m
            </Typography>
          </Stack>
        );
      }
    },
    {
      title: 'Bed',
      dataIndex: 'bedNumber',
      width: 100,
      render: (bed) => (
        <Typography variant="body2" fontWeight={600} fontSize="0.875rem" fontFamily="monospace" color={bed ? '#2563eb' : 'text.secondary'}>
          {bed || '—'}
        </Typography>
      )
    },
    {
      title: 'Hospital',
      dataIndex: 'hospitalId',
      width: 140,
      render: (id) => (
        <Typography variant="body2" fontSize="0.875rem" color="text.secondary" fontFamily="monospace">
          {id ? id.slice(0, 8) : 'Not selected'}
        </Typography>
      )
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      width: 160,
      render: (date) => (
        <Typography variant="body2" fontSize="0.875rem" color="text.secondary">
          {formatDateTime(date)}
        </Typography>
      )
    },
    {
      title: '',
      key: 'action',
      width: 60,
      fixed: 'right',
      render: (_, alert) => (
        <IconButton size="small" onClick={() => setSelectedAlert(alert)} sx={{ borderRadius: 0.5 }}>
          <VisibilityOutlined fontSize="small" sx={{ color: '#6b7280' }} />
        </IconButton>
      )
    }
  ];

  return (
    <Box>
      {/* HEADER */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} mb={3}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: alpha('#dc2626', 0.08),
              border: '1px solid',
              borderColor: alpha('#dc2626', 0.15)
            }}
          >
            <NotificationsActiveOutlined sx={{ color: '#dc2626', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700} fontSize="1.25rem">
              Emergency Alerts
            </Typography>
            <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
              Real-time ambulance and admission tracking
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchOutlined style={{ color: '#9ca3af', marginRight: 8, fontSize: 16 }} />
            }}
            sx={{ width: 200, '& .MuiOutlinedInput-root': { borderRadius: 0.5, fontSize: '0.875rem' } }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<FilterOutlined />}
            sx={{ borderRadius: 0.5, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
          >
            Filter
          </Button>
        </Stack>
      </Stack>

      {/* STATS */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Incoming" value={stats.incoming} subtext="Ambulances en route" tone="#d97706" icon={<DirectionsCarOutlined />} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Critical ETA" value={stats.critical} subtext="≤ 5 minutes" tone="#dc2626" icon={<AccessTimeOutlined />} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Occupied" value={stats.occupied} subtext="Patients admitted" tone="#059669" icon={<BedOutlined />} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Completed" value={stats.completed} subtext="Total processed" tone="#6b7280" icon={<CheckCircleOutlined />} />
        </Grid>
      </Grid>

      {/* TABLE */}
      <Paper
        sx={{
          borderRadius: 0.5,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden'
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            px: 3,
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: alpha(theme.palette.grey[50], 0.5)
          }}
        >
          <Typography variant="h6" fontWeight={600} fontSize="1rem">
            Active Alerts
          </Typography>
          <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
            {totalElements} total records
          </Typography>
        </Stack>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={alerts}
          loading={isLoading}
          pagination={{
            current: page + 1,
            pageSize: 20,
            total: totalElements,
            onChange: (newPage) => setPage(newPage - 1),
            showSizeChanger: false,
            style: { padding: '16px 24px', margin: 0 }
          }}
          scroll={{ x: 1000 }}
          rowClassName={() => 'alert-row'}
          components={{
            header: {
              cell: (props) => (
                <th
                  {...props}
                  style={{
                    ...props.style,
                    backgroundColor: alpha(theme.palette.grey[50], 0.5),
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#6b7280',
                    padding: '12px 24px',
                    borderBottom: '1px solid',
                    borderColor: theme.palette.divider
                  }}
                />
              )
            },
            body: {
              row: (props) => (
                <tr
                  {...props}
                  style={{
                    ...props.style,
                    cursor: 'pointer',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = alpha(theme.palette.grey[50], 0.3);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                />
              ),
              cell: (props) => (
                <td
                  {...props}
                  style={{
                    ...props.style,
                    padding: '16px 24px',
                    borderBottom: '1px solid',
                    borderColor: theme.palette.divider
                  }}
                />
              )
            }
          }}
        />
      </Paper>

      {/* DRAWER */}
      <Drawer anchor="right" open={Boolean(selectedAlert)} onClose={() => setSelectedAlert(null)} PaperProps={{ sx: { width: 480, p: 0 } }}>
        {selectedAlert && (
          <Box>
            {/* Drawer Header */}
            <Stack
              spacing={2}
              sx={{
                p: 3,
                backgroundColor: alpha(getStatusMeta(selectedAlert.status).tone, 0.04),
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack spacing={1}>
                  <StatusBadge status={selectedAlert.status} />
                  <Typography variant="h6" fontWeight={700} fontSize="1.125rem">
                    {selectedAlert.message || 'Emergency Alert'}
                  </Typography>
                </Stack>
                <IconButton size="small" onClick={() => setSelectedAlert(null)} sx={{ borderRadius: 0.5 }}>
                  <CancelOutlined fontSize="small" sx={{ color: '#6b7280' }} />
                </IconButton>
              </Stack>
              <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                Alert ID: {selectedAlert.id} • Created {formatDateTime(selectedAlert.createdAt)}
              </Typography>
            </Stack>

            {/* Drawer Body */}
            <Stack spacing={3} sx={{ p: 3 }}>
              {/* Patient Info */}
              <Paper sx={{ p: 2.5, borderRadius: 0.5, border: '1px solid', borderColor: 'divider' }}>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  fontSize="0.7rem"
                  sx={{ textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}
                >
                  Patient Information
                </Typography>
                <Stack spacing={2} mt={1.5}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                      Patient ID
                    </Typography>
                    <Typography variant="body2" fontWeight={600} fontSize="0.875rem" fontFamily="monospace">
                      {selectedAlert.patientId}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                      Hospital
                    </Typography>
                    <Typography variant="body2" fontWeight={600} fontSize="0.875rem">
                      {selectedAlert.hospitalId || 'Not selected'}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                      Admission ID
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      fontSize="0.875rem"
                      fontFamily="monospace"
                      color={selectedAlert.admissionId ? '#059669' : 'text.secondary'}
                    >
                      {selectedAlert.admissionId || 'Not created'}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>

              {/* Bed Info */}
              <Paper sx={{ p: 2.5, borderRadius: 0.5, border: '1px solid', borderColor: 'divider' }}>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  fontSize="0.7rem"
                  sx={{ textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}
                >
                  Bed Assignment
                </Typography>
                <Stack spacing={2} mt={1.5}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                      Requested Type
                    </Typography>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        px: 1,
                        py: 0.25,
                        borderRadius: 0.5,
                        backgroundColor: alpha(getBedTypeMeta(selectedAlert.requestedBedType).color, 0.08),
                        border: '1px solid',
                        borderColor: alpha(getBedTypeMeta(selectedAlert.requestedBedType).color, 0.15)
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        fontSize="0.65rem"
                        sx={{ color: getBedTypeMeta(selectedAlert.requestedBedType).color, textTransform: 'uppercase' }}
                      >
                        {getBedTypeMeta(selectedAlert.requestedBedType).label}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                      Bed Number
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      fontSize="0.875rem"
                      fontFamily="monospace"
                      color={selectedAlert.bedNumber ? '#2563eb' : 'text.secondary'}
                    >
                      {selectedAlert.bedNumber || 'Not assigned'}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                      ETA
                    </Typography>
                    <Typography variant="body2" fontWeight={600} fontSize="0.875rem">
                      {selectedAlert.estimatedArrivalTimeMinutes ? `${selectedAlert.estimatedArrivalTimeMinutes} minutes` : 'N/A'}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>

              {/* Notes */}
              {selectedAlert.patientNotes && (
                <Paper
                  sx={{ p: 2.5, borderRadius: 0.5, backgroundColor: alpha('#f3f4f6', 0.5), border: '1px solid', borderColor: 'divider' }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    fontSize="0.7rem"
                    sx={{ textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}
                  >
                    Clinical Notes
                  </Typography>
                  <Typography variant="body2" fontSize="0.875rem" color="text.secondary" sx={{ mt: 1, lineHeight: 1.6 }}>
                    {selectedAlert.patientNotes}
                  </Typography>
                </Paper>
              )}

              {/* Actions */}
              <Stack spacing={1.5}>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  fontSize="0.7rem"
                  sx={{ textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}
                >
                  Workflow Actions
                </Typography>

                {selectedAlert.status === 'ON_THE_WAY' && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<DoneAllOutlined />}
                    onClick={() => handleAction('arrive', selectedAlert.id)}
                    sx={{ borderRadius: 0.5, textTransform: 'none', fontWeight: 600, py: 1.25 }}
                  >
                    Mark Patient Arrived
                  </Button>
                )}

                {selectedAlert.status === 'ARRIVED' && (
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    startIcon={<LocalHospitalOutlined />}
                    onClick={() => handleAction('checkIn', selectedAlert.id)}
                    sx={{ borderRadius: 0.5, textTransform: 'none', fontWeight: 600, py: 1.25 }}
                  >
                    Check Patient Into Bed
                  </Button>
                )}

                {['PENDING', 'ON_THE_WAY', 'ARRIVED'].includes(selectedAlert.status) && (
                  <Button
                    fullWidth
                    variant="outlined"
                    color="warning"
                    startIcon={<CancelOutlined />}
                    onClick={() => handleAction('cancel', selectedAlert.id)}
                    sx={{ borderRadius: 0.5, textTransform: 'none', fontWeight: 600, py: 1.25 }}
                  >
                    Cancel Alert
                  </Button>
                )}

                {['PENDING', 'FAILED', 'CANCELLED', 'COMPLETED'].includes(selectedAlert.status) && (
                  <Popconfirm title="Permanently delete this alert?" onConfirm={() => handleAction('delete', selectedAlert.id)}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteOutlineOutlined />}
                      sx={{ borderRadius: 0.5, textTransform: 'none', fontWeight: 600, py: 1.25 }}
                    >
                      Delete Alert
                    </Button>
                  </Popconfirm>
                )}

                {['OCCUPIED', 'COMPLETED', 'CANCELLED', 'FAILED'].includes(selectedAlert.status) && (
                  <Typography variant="caption" color="text.secondary" fontSize="0.75rem" textAlign="center" sx={{ py: 1 }}>
                    No active workflow action available for this alert status.
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
