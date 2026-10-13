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

import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from '../../../hooks/useRooms';
import { useWards } from '../../../hooks/useWards';

const ROOM_STATUS_OPTIONS = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED', 'CLOSED'];
const ROOM_TYPE_OPTIONS = ['SINGLE', 'DOUBLE', 'WARD', 'ICU', 'VIP', 'ISOLATION'];

const EMPTY_FORM = {
  wardId: '',
  roomNumber: '',
  roomType: 'SINGLE',
  capacity: 1,
  status: 'AVAILABLE',
  description: ''
};

function getRoomId(room) {
  return room?.id;
}
function formatValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value).replaceAll('_', ' ');
}
function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}
function getRoomsFromPage(payload) {
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
    case 'MAINTENANCE':
      return 'warning';
    case 'RESERVED':
      return 'secondary';
    case 'CLOSED':
      return 'error';
    default:
      return 'default';
  }
}

export default function RoomsPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formRoom, setFormRoom] = useState(null);
  const [actionError, setActionError] = useState('');

  const { data, isLoading, isError, refetch, isFetching } = useRooms({ page, size });
  const { data: wardsData } = useWards({ page: 0, size: 100 });
  const wardsList = getRoomsFromPage(wardsData);
  const deleteRoom = useDeleteRoom();

  const rooms = getRoomsFromPage(data);
  const totalElements = getTotalElements(data);

  const visibleRooms = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rooms.filter((room) => {
      if (statusFilter && room.status !== statusFilter) return false;
      if (!query) return true;
      const wardName = room.ward?.name || '';
      return [room.roomNumber, room.roomType, wardName, room.description].filter(Boolean).join(' ').toLowerCase().includes(query);
    });
  }, [rooms, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: totalElements,
      available: rooms.filter((r) => r.status === 'AVAILABLE').length,
      occupied: rooms.filter((r) => r.status === 'OCCUPIED').length,
      maintenance: rooms.filter((r) => r.status === 'MAINTENANCE').length,
      icu: rooms.filter((r) => r.roomType === 'ICU').length
    }),
    [rooms, totalElements]
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
            Rooms
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage hospital rooms and capacity allocations.
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
              setFormRoom(null);
              setFormOpen(true);
            }}
          >
            Add Room
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
          Failed to load rooms.
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} lg={2.4}>
          <Box component={Paper} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Total Rooms
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
              Maintenance
            </Typography>
            <Typography variant="h4" fontWeight={800} color="warning.main" sx={{ mt: 1 }}>
              {stats.maintenance}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={4} lg={2.4}>
          <Box component={Paper} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              ICU Rooms
            </Typography>
            <Typography variant="h4" fontWeight={800} color="#2563eb" sx={{ mt: 1 }}>
              {stats.icu}
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
                placeholder="Search by room number, type or ward..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="">All Statuses</MenuItem>
                  {ROOM_STATUS_OPTIONS.map((st) => (
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
                <TableCell>Room No.</TableCell>
                <TableCell>Ward</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : visibleRooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">No rooms found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                visibleRooms.map((room) => (
                  <TableRow
                    key={room.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedRoom(room);
                      setDetailsOpen(true);
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight={600}>{room.roomNumber}</Typography>
                    </TableCell>
                    <TableCell>{room.ward?.name || room.ward?.code || '—'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={room.roomType} variant="outlined" />
                    </TableCell>
                    <TableCell>{room.capacity}</TableCell>
                    <TableCell>
                      <Chip size="small" label={room.status} color={getStatusColor(room.status)} />
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedRoom(room);
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
                              setFormRoom(room);
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
                              if (window.confirm(`Delete room ${room.roomNumber}?`)) {
                                try {
                                  await deleteRoom.mutateAsync(room.id);
                                  refetch();
                                } catch (err) {
                                  setActionError('Failed to delete room.');
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

      {/* Room Details Drawer */}
      <Drawer
        anchor="right"
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 500 }, maxWidth: '100%' } }}
      >
        <Box sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" fontWeight={800}>
              Room Details
            </Typography>
            <IconButton onClick={() => setDetailsOpen(false)}>
              <CloseOutlined />
            </IconButton>
          </Stack>
          <Divider sx={{ my: 2 }} />
          {selectedRoom && (
            <>
              <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight={800}>
                  Room {selectedRoom.roomNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ward: {selectedRoom.ward?.name || '—'}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip size="small" label={selectedRoom.status} color={getStatusColor(selectedRoom.status)} />
                  <Chip size="small" variant="outlined" label={selectedRoom.roomType} />
                </Stack>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<EditOutlined />}
                  sx={{ mt: 2 }}
                  onClick={() => {
                    setFormRoom(selectedRoom);
                    setDetailsOpen(false);
                    setFormOpen(true);
                  }}
                >
                  Edit Room
                </Button>
              </Paper>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Capacity
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {selectedRoom.capacity}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formatValue(selectedRoom.description)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Room ID
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {selectedRoom.id}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Drawer>

      {/* Room Form Drawer */}
      <RoomFormDrawer open={formOpen} onClose={() => setFormOpen(false)} room={formRoom} wardsList={wardsList} onSaved={() => refetch()} />
    </Box>
  );
}

function RoomFormDrawer({ open, onClose, room, wardsList, onSaved }) {
  const isEdit = Boolean(room);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();

  useEffect(() => {
    if (!open) return;
    setErrorMessage('');
    if (room) {
      setForm({
        wardId: room.ward?.id || room.wardId || '',
        roomNumber: room.roomNumber || '',
        roomType: room.roomType || 'SINGLE',
        capacity: room.capacity || 1,
        status: room.status || 'AVAILABLE',
        description: room.description || ''
      });
    } else {
      setForm({ ...EMPTY_FORM });
    }
  }, [room, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!form.wardId || !form.roomNumber.trim()) {
      setErrorMessage('Ward and room number are required.');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        ward: { id: form.wardId },
        roomNumber: form.roomNumber.trim(),
        roomType: form.roomType,
        capacity: Number(form.capacity) || 1,
        status: form.status,
        description: form.description.trim() || null
      };
      if (isEdit) {
        await updateRoom.mutateAsync({ id: getRoomId(room), payload });
      } else {
        await createRoom.mutateAsync(payload);
      }
      await onSaved?.();
      onClose();
    } catch (err) {
      setErrorMessage(getErrorMessage(err, `Failed to ${isEdit ? 'update' : 'create'} room.`));
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
            {isEdit ? 'Edit Room' : 'Add Room'}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseOutlined />
          </IconButton>
        </Stack>
        <Divider sx={{ my: 2 }} />
        {isEdit && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Room ID is system-managed.
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Stack spacing={2}>
          <FormControl fullWidth required>
            <InputLabel>Ward</InputLabel>
            <Select value={form.wardId} label="Ward" onChange={(e) => setForm({ ...form, wardId: e.target.value })}>
              {wardsList.map((w) => (
                <MenuItem key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Room Number"
            value={form.roomNumber}
            onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
            required
            fullWidth
          />
          <FormControl fullWidth required>
            <InputLabel>Room Type</InputLabel>
            <Select value={form.roomType} label="Room Type" onChange={(e) => setForm({ ...form, roomType: e.target.value })}>
              {ROOM_TYPE_OPTIONS.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Capacity"
            type="number"
            inputProps={{ min: 1 }}
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            required
            fullWidth
          />
          <FormControl fullWidth required>
            <InputLabel>Status</InputLabel>
            <Select value={form.status} label="Status" onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {ROOM_STATUS_OPTIONS.map((st) => (
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
            {saving ? 'Saving...' : 'Save Room'}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
