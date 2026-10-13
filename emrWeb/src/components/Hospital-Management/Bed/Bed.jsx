import { useEffect, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';

import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import ReloadOutlined from '@ant-design/icons/ReloadOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import DownOutlined from '@ant-design/icons/DownOutlined';

import { useBeds, useCreateBed, useUpdateBed, useDeleteBed } from '../../../hooks/useBeds';
import { useRooms } from '../../../hooks/useRooms';

const BED_STATUS_OPTIONS = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE', 'OUT_OF_SERVICE'];

const EMPTY_FORM = {
  roomId: '',
  bedNumber: '',
  bedStatus: 'AVAILABLE',
  description: ''
};

function getBedId(bed) {
  return bed?.id;
}
function formatValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value).replaceAll('_', ' ');
}
function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}
function getBedsFromPage(payload) {
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
function getStatusColor(status) {
  switch (status) {
    case 'AVAILABLE':
      return 'success';
    case 'OCCUPIED':
      return 'info';
    case 'RESERVED':
      return 'secondary';
    case 'MAINTENANCE':
      return 'warning';
    case 'OUT_OF_SERVICE':
      return 'error';
    default:
      return 'default';
  }
}

export default function BedsPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const [selectedBed, setSelectedBed] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formBed, setFormBed] = useState(null);
  const [actionError, setActionError] = useState('');

  const { data, isLoading, isError, refetch, isFetching } = useBeds({ page, size });
  const { data: roomsData } = useRooms({ page: 0, size: 100 });
  const roomsList = getBedsFromPage(roomsData);
  const deleteBed = useDeleteBed();

  const beds = getBedsFromPage(data);
  const totalElements = getTotalElements(data);

  const visibleBeds = useMemo(() => {
    const query = search.trim().toLowerCase();
    return beds.filter((bed) => {
      if (statusFilter && bed.bedStatus !== statusFilter) return false;
      if (!query) return true;
      const roomNum = bed.room?.roomNumber || '';
      const wardName = bed.room?.ward?.name || '';
      return [bed.bedNumber, roomNum, wardName, bed.description].filter(Boolean).join(' ').toLowerCase().includes(query);
    });
  }, [beds, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: totalElements,
      available: beds.filter((b) => b.bedStatus === 'AVAILABLE').length,
      occupied: beds.filter((b) => b.bedStatus === 'OCCUPIED').length,
      reserved: beds.filter((b) => b.bedStatus === 'RESERVED').length,
      maintenance: beds.filter((b) => b.bedStatus === 'MAINTENANCE').length
    }),
    [beds, totalElements]
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, minWidth: 0 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Beds
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage hospital ward beds and operational statuses.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<ReloadOutlined />} onClick={() => refetch()} disabled={isFetching}>
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<PlusOutlined />}
            onClick={() => {
              setFormBed(null);
              setFormOpen(true);
            }}
          >
            Add Bed
          </Button>
        </Stack>
      </Stack>

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError('')}>
          {actionError}
        </Alert>
      )}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load beds.
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} lg={2.4}>
          <Box component={Paper} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Total Beds
            </Typography>
            <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ mt: 1 }}>
              {stats.total}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={4} lg={2.4}>
          <Box component={Paper} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Available
            </Typography>
            <Typography variant="h4" fontWeight={800} color="success.main" sx={{ mt: 1 }}>
              {stats.available}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={4} lg={2.4}>
          <Box component={Paper} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Occupied
            </Typography>
            <Typography variant="h4" fontWeight={800} color="info.main" sx={{ mt: 1 }}>
              {stats.occupied}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={4} lg={2.4}>
          <Box component={Paper} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Reserved
            </Typography>
            <Typography variant="h4" fontWeight={800} color="secondary.main" sx={{ mt: 1 }}>
              {stats.reserved}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={4} lg={2.4}>
          <Box component={Paper} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Maintenance
            </Typography>
            <Typography variant="h4" fontWeight={800} color="warning.main" sx={{ mt: 1 }}>
              {stats.maintenance}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 2, minWidth: 0, mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by bed number, room or ward..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="">All Statuses</MenuItem>
                  {BED_STATUS_OPTIONS.map((st) => (
                    <MenuItem key={st} value={st}>
                      {st}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        <Divider />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Bed No.</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Ward</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : visibleBeds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">No beds found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                visibleBeds.map((bed) => (
                  <TableRow
                    key={bed.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedBed(bed);
                      setDetailsOpen(true);
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight={600}>{bed.bedNumber}</Typography>
                    </TableCell>
                    <TableCell>{bed.room?.roomNumber || '—'}</TableCell>
                    <TableCell>{bed.room?.ward?.name || '—'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={bed.bedStatus} color={getStatusColor(bed.bedStatus)} />
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedBed(bed);
                              setDetailsOpen(true);
                            }}
                          >
                            <EyeOutlined />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setFormBed(bed);
                              setFormOpen(true);
                            }}
                          >
                            <EditOutlined />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={async () => {
                              if (window.confirm(`Delete bed ${bed.bedNumber}?`)) {
                                try {
                                  await deleteBed.mutateAsync(bed.id);
                                  refetch();
                                } catch (err) {
                                  setActionError('Failed to delete bed.');
                                }
                              }
                            }}
                          >
                            <DeleteOutlined />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={size}
          onRowsPerPageChange={(e) => {
            setSize(Number(e.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* Bed Details Drawer */}
      <Drawer
        anchor="right"
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 500 }, maxWidth: '100%' } }}
      >
        <Box sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" fontWeight={800}>
              Bed Details
            </Typography>
            <IconButton onClick={() => setDetailsOpen(false)}>
              <CloseOutlined />
            </IconButton>
          </Stack>
          <Divider sx={{ my: 2 }} />
          {selectedBed && (
            <>
              <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight={800}>
                  Bed {selectedBed.bedNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Room: {selectedBed.room?.roomNumber || '—'} | Ward: {selectedBed.room?.ward?.name || '—'}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip size="small" label={selectedBed.bedStatus} color={getStatusColor(selectedBed.bedStatus)} />
                </Stack>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<EditOutlined />}
                  sx={{ mt: 2 }}
                  onClick={() => {
                    setFormBed(selectedBed);
                    setDetailsOpen(false);
                    setFormOpen(true);
                  }}
                >
                  Edit Bed
                </Button>
              </Paper>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formatValue(selectedBed.description)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Bed ID
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {selectedBed.id}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Drawer>

      {/* Bed Form Drawer */}
      <BedFormDrawer open={formOpen} onClose={() => setFormOpen(false)} bed={formBed} roomsList={roomsList} onSaved={() => refetch()} />
    </Box>
  );
}

function BedFormDrawer({ open, onClose, bed, roomsList, onSaved }) {
  const isEdit = Boolean(bed);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const createBed = useCreateBed();
  const updateBed = useUpdateBed();

  useEffect(() => {
    if (!open) return;
    setErrorMessage('');
    if (bed) {
      setForm({
        roomId: bed.room?.id || bed.roomId || '',
        bedNumber: bed.bedNumber || '',
        bedStatus: bed.bedStatus || 'AVAILABLE',
        description: bed.description || ''
      });
    } else {
      setForm({ ...EMPTY_FORM });
    }
  }, [bed, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!form.roomId || !form.bedNumber.trim()) {
      setErrorMessage('Room and bed number are required.');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        room: { id: form.roomId },
        bedNumber: form.bedNumber.trim(),
        bedStatus: form.bedStatus,
        description: form.description.trim() || null
      };
      if (isEdit) {
        await updateBed.mutateAsync({ id: getBedId(bed), payload });
      } else {
        await createBed.mutateAsync(payload);
      }
      await onSaved?.();
      onClose();
    } catch (err) {
      setErrorMessage(getErrorMessage(err, `Failed to ${isEdit ? 'update' : 'create'} bed.`));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 500 } } }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ p: 3, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight={800}>
            {isEdit ? 'Edit Bed' : 'Add Bed'}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseOutlined />
          </IconButton>
        </Stack>
        <Divider sx={{ my: 2 }} />
        {isEdit && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Bed ID is system-managed.
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Stack spacing={2}>
          <FormControl fullWidth required>
            <InputLabel>Room</InputLabel>
            <Select value={form.roomId} label="Room" onChange={(e) => setForm({ ...form, roomId: e.target.value })}>
              {roomsList.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  Room {r.roomNumber} ({r.ward?.name || 'Ward'})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Bed Number"
            value={form.bedNumber}
            onChange={(e) => setForm({ ...form, bedNumber: e.target.value })}
            required
            fullWidth
          />
          <FormControl fullWidth required>
            <InputLabel>Status</InputLabel>
            <Select value={form.bedStatus} label="Status" onChange={(e) => setForm({ ...form, bedStatus: e.target.value })}>
              {BED_STATUS_OPTIONS.map((st) => (
                <MenuItem key={st} value={st}>
                  {st}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Description"
            multiline
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth
          />
        </Stack>
        <Box sx={{ flex: 1, minHeight: 24 }} />
        <Divider sx={{ my: 2 }} />
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button variant="outlined" color="inherit" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Bed'}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
