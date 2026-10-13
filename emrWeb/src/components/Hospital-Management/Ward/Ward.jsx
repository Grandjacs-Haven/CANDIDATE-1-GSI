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

import { useWards, useCreateWard, useUpdateWard, useDeleteWard, useWard } from '../../../hooks/useWards';

const WARD_STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'CLOSED'];
const WARD_TYPE_OPTIONS = ['GENERAL', 'ICU', 'EMERGENCY', 'PEDIATRIC', 'MATERNITY', 'SURGICAL', 'PRIVATE'];

const EMPTY_FORM = {
  code: '',
  name: '',
  wardType: 'GENERAL',
  status: 'ACTIVE',
  description: ''
};

function getWardId(ward) {
  return ward?.id;
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value).replaceAll('_', ' ');
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

function getWardsFromPage(payload) {
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
    case 'ACTIVE':
      return 'success';
    case 'INACTIVE':
      return 'default';
    case 'MAINTENANCE':
      return 'warning';
    case 'CLOSED':
      return 'error';
    default:
      return 'default';
  }
}

function StatCard({ label, value, description, color }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4" fontWeight={800} sx={{ color, mt: 1 }}>
        {value}
      </Typography>
      {description && (
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      )}
    </Paper>
  );
}

function Section({ title, children, defaultExpanded = false }) {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      elevation={0}
      sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px !important', '&:before': { display: 'none' }, mb: 1.5 }}
    >
      <AccordionSummary expandIcon={<DownOutlined />} sx={{ px: 2 }}>
        <Typography fontWeight={700}>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, pb: 2 }}>{children}</AccordionDetails>
    </Accordion>
  );
}

function InfoField({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
        {formatValue(value)}
      </Typography>
    </Box>
  );
}

function WardDetailsDrawer({ open, onClose, ward, onEdit }) {
  const wardId = getWardId(ward);
  const { data: wardDetails } = useWard ? useWard(wardId) : { data: null };
  const fullWard = wardDetails || ward;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 500 }, maxWidth: '100%' } }}>
      <Box sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Ward Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ward clinical configuration and status
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="Close drawer">
            <CloseOutlined />
          </IconButton>
        </Stack>
        <Divider sx={{ my: 2 }} />
        {!fullWard ? (
          <Alert severity="info">Select a ward to view details.</Alert>
        ) : (
          <>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={800}>
                {fullWard.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Code: {fullWard.code}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip size="small" label={fullWard.status || 'UNKNOWN'} color={getStatusColor(fullWard.status)} />
                <Chip size="small" variant="outlined" label={fullWard.wardType} />
              </Stack>
              <Button fullWidth variant="contained" startIcon={<EditOutlined />} sx={{ mt: 2 }} onClick={onEdit}>
                Edit Ward
              </Button>
            </Paper>

            <Section title="Ward Information" defaultExpanded>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <InfoField label="Ward Code" value={fullWard.code} />
                </Grid>
                <Grid item xs={6}>
                  <InfoField label="Ward Type" value={fullWard.wardType} />
                </Grid>
                <Grid item xs={12}>
                  <InfoField label="Ward Name" value={fullWard.name} />
                </Grid>
                <Grid item xs={6}>
                  <InfoField label="Status" value={fullWard.status} />
                </Grid>
                <Grid item xs={12}>
                  <InfoField label="Description" value={fullWard.description} />
                </Grid>
              </Grid>
            </Section>

            <Section title="System Metadata">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <InfoField label="Ward ID" value={fullWard.id} />
                </Grid>
              </Grid>
            </Section>
          </>
        )}
      </Box>
    </Drawer>
  );
}

function WardFormDrawer({ open, onClose, ward, onSaved }) {
  const isEdit = Boolean(ward);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const createWard = useCreateWard();
  const updateWard = useUpdateWard();

  useEffect(() => {
    if (!open) return;
    setErrorMessage('');
    if (ward) {
      setForm({
        code: ward.code || '',
        name: ward.name || '',
        wardType: ward.wardType || 'GENERAL',
        status: ward.status || 'ACTIVE',
        description: ward.description || ''
      });
    } else {
      setForm({ ...EMPTY_FORM });
    }
  }, [ward, open]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!form.code.trim() || !form.name.trim() || !form.wardType || !form.status) {
      setErrorMessage('Code, name, ward type and status are required.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        code: form.code.trim(),
        name: form.name.trim(),
        wardType: form.wardType,
        status: form.status,
        description: form.description.trim() || null
      };

      if (isEdit) {
        await updateWard.mutateAsync({ id: getWardId(ward), payload });
      } else {
        await createWard.mutateAsync(payload);
      }

      await onSaved?.();
      onClose();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, `Failed to ${isEdit ? 'update' : 'create'} ward.`));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 500 }, maxWidth: '100%' } }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ p: 3, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h5" fontWeight={800}>
              {isEdit ? 'Edit Ward' : 'Add Ward'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ward clinical unit setup
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="Close form">
            <CloseOutlined />
          </IconButton>
        </Stack>
        <Divider sx={{ my: 2 }} />

        {isEdit && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Ward ID and Code are system-managed identifiers.
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Stack spacing={2}>
          <TextField label="Ward Code" value={form.code} onChange={handleChange('code')} required fullWidth />
          <TextField label="Ward Name" value={form.name} onChange={handleChange('name')} required fullWidth />

          <FormControl fullWidth required>
            <InputLabel>Ward Type</InputLabel>
            <Select value={form.wardType} label="Ward Type" onChange={handleChange('wardType')}>
              {WARD_TYPE_OPTIONS.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth required>
            <InputLabel>Status</InputLabel>
            <Select value={form.status} label="Status" onChange={handleChange('status')}>
              {WARD_STATUS_OPTIONS.map((st) => (
                <MenuItem key={st} value={st}>
                  {st}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField label="Description" multiline rows={3} value={form.description} onChange={handleChange('description')} fullWidth />
        </Stack>

        <Box sx={{ flex: 1, minHeight: 24 }} />
        <Divider sx={{ my: 2 }} />
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button variant="outlined" color="inherit" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" type="submit" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Ward'}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}

export default function WardsPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const [selectedWard, setSelectedWard] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formWard, setFormWard] = useState(null);
  const [actionError, setActionError] = useState('');

  const { data, isLoading, isError, refetch, isFetching } = useWards({ page, size });
  const deleteWard = useDeleteWard();

  const wards = getWardsFromPage(data);
  const totalElements = getTotalElements(data);

  const visibleWards = useMemo(() => {
    const query = search.trim().toLowerCase();
    return wards.filter((ward) => {
      if (statusFilter && ward.status !== statusFilter) return false;
      if (!query) return true;
      return [ward.code, ward.name, ward.wardType, ward.description].filter(Boolean).join(' ').toLowerCase().includes(query);
    });
  }, [wards, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: totalElements,
      active: wards.filter((w) => w.status === 'ACTIVE').length,
      maintenance: wards.filter((w) => w.status === 'MAINTENANCE').length,
      icu: wards.filter((w) => w.wardType === 'ICU').length,
      general: wards.filter((w) => w.wardType === 'GENERAL').length
    }),
    [wards, totalElements]
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
            Wards
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage hospital inpatient wards and units.
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
              setFormWard(null);
              setFormOpen(true);
            }}
          >
            Add Ward
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
          Failed to load wards.
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} lg={2.4}>
          <StatCard label="Total Wards" value={stats.total} color="primary.main" />
        </Grid>
        <Grid item xs={6} sm={4} lg={2.4}>
          <StatCard label="Active" value={stats.active} color="success.main" description="On this page" />
        </Grid>
        <Grid item xs={6} sm={4} lg={2.4}>
          <StatCard label="Maintenance" value={stats.maintenance} color="warning.main" description="On this page" />
        </Grid>
        <Grid item xs={6} sm={4} lg={2.4}>
          <StatCard label="ICU Units" value={stats.icu} color="#2563eb" description="On this page" />
        </Grid>
        <Grid item xs={6} sm={4} lg={2.4}>
          <StatCard label="General" value={stats.general} color="#9333ea" description="On this page" />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 2, minWidth: 0, mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by code, name or type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="">All Statuses</MenuItem>
                  {WARD_STATUS_OPTIONS.map((st) => (
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
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
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
              ) : visibleWards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">No wards found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                visibleWards.map((ward) => (
                  <TableRow
                    key={ward.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedWard(ward);
                      setDetailsOpen(true);
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight={600}>{ward.code}</Typography>
                    </TableCell>
                    <TableCell>{ward.name}</TableCell>
                    <TableCell>
                      <Chip size="small" label={ward.wardType} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={ward.status} color={getStatusColor(ward.status)} />
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedWard(ward);
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
                              setFormWard(ward);
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
                              if (window.confirm(`Delete ward ${ward.code}?`)) {
                                try {
                                  await deleteWard.mutateAsync(ward.id);
                                  refetch();
                                } catch (err) {
                                  setActionError('Failed to delete ward.');
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

      <WardDetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        ward={selectedWard}
        onEdit={() => {
          setFormWard(selectedWard);
          setDetailsOpen(false);
          setFormOpen(true);
        }}
      />
      <WardFormDrawer open={formOpen} onClose={() => setFormOpen(false)} ward={formWard} onSaved={() => refetch()} />
    </Box>
  );
}
