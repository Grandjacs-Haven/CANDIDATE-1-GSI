import { useEffect, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
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
  Select,
  Autocomplete
} from '@mui/material';

import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import ReloadOutlined from '@ant-design/icons/ReloadOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import DownOutlined from '@ant-design/icons/DownOutlined';

import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointment,
  useDeleteAppointment,
  useAppointment
} from '../../hooks/useAppointments';
import { usePatients } from '../../hooks/usePatients';
import { usePractitioners } from '../../hooks/usePractitioners';

const APPOINTMENT_TYPE_OPTIONS = ['SCHEDULED', 'WALK_IN', 'EMERGENCY', 'FOLLOW_UP'];
const APPOINTMENT_STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

const EMPTY_FORM = {
  patientId: '',
  doctorId: '',
  appointmentType: 'SCHEDULED',
  status: 'PENDING',
  scheduledStartTime: '',
  actualArrivalTime: ''
};

function getAppointmentId(appointment) {
  return appointment?.id;
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value).replaceAll('_', ' ');
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

function getItemsFromPage(payload) {
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
    case 'CONFIRMED':
      return 'primary';
    case 'ARRIVED':
      return 'info';
    case 'IN_PROGRESS':
      return 'warning';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
    case 'NO_SHOW':
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

function AppointmentDetailsDrawer({ open, onClose, appointment, onEdit, patientsMap, practitionersMap }) {
  const appointmentId = getAppointmentId(appointment);
  const { data: appointmentDetails } = useAppointment ? useAppointment(appointmentId) : { data: null };
  const fullAppointment = appointmentDetails || appointment;

  const patient = patientsMap[fullAppointment?.patientId];
  const doctor = practitionersMap[fullAppointment?.doctorId];

  const patientName = patient ? `${patient.firstName || ''} ${patient.lastName || ''}`.trim() : fullAppointment?.patientId;
  const doctorName = doctor
    ? `${doctor.user?.firstName || ''} ${doctor.user?.lastName || ''}`.trim()
    : fullAppointment?.doctorId || 'Unassigned';

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 500 }, maxWidth: '100%' } }}>
      <Box sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Appointment Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Scheduling and arrival timestamps
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="Close drawer">
            <CloseOutlined />
          </IconButton>
        </Stack>
        <Divider sx={{ my: 2 }} />
        {!fullAppointment ? (
          <Alert severity="info">Select an appointment to view details.</Alert>
        ) : (
          <>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={800}>
                {patientName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Doctor: {doctorName}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip size="small" label={fullAppointment.status} color={getStatusColor(fullAppointment.status)} />
                <Chip size="small" variant="outlined" label={fullAppointment.appointmentType} />
              </Stack>
              <Button fullWidth variant="contained" startIcon={<EditOutlined />} sx={{ mt: 2 }} onClick={onEdit}>
                Edit Appointment
              </Button>
            </Paper>

            <Section title="Appointment Details" defaultExpanded>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <InfoField label="Type" value={fullAppointment.appointmentType} />
                </Grid>
                <Grid item xs={6}>
                  <InfoField label="Status" value={fullAppointment.status} />
                </Grid>
                <Grid item xs={12}>
                  <InfoField
                    label="Scheduled Start Time"
                    value={fullAppointment.scheduledStartTime ? new Date(fullAppointment.scheduledStartTime).toLocaleString() : null}
                  />
                </Grid>
                <Grid item xs={12}>
                  <InfoField
                    label="Actual Arrival Time"
                    value={fullAppointment.actualArrivalTime ? new Date(fullAppointment.actualArrivalTime).toLocaleString() : null}
                  />
                </Grid>
              </Grid>
            </Section>

            <Section title="Participant Information" defaultExpanded>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <InfoField label="Patient Name" value={patientName} />
                </Grid>
                <Grid item xs={12}>
                  <InfoField label="Patient Phone" value={patient?.phoneNumber} />
                </Grid>
                <Grid item xs={12}>
                  <InfoField label="Assigned Doctor" value={doctorName} />
                </Grid>
                <Grid item xs={12}>
                  <InfoField label="Doctor Specialty" value={doctor?.specialty} />
                </Grid>
              </Grid>
            </Section>

            <Section title="System Record">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <InfoField label="Appointment ID" value={fullAppointment.id} />
                </Grid>
                <Grid item xs={12}>
                  <InfoField label="Patient ID" value={fullAppointment.patientId} />
                </Grid>
                <Grid item xs={12}>
                  <InfoField label="Doctor ID" value={fullAppointment.doctorId} />
                </Grid>
              </Grid>
            </Section>
          </>
        )}
      </Box>
    </Drawer>
  );
}

function AppointmentFormDrawer({ open, onClose, appointment, patientsList, practitionersList, onSaved }) {
  const isEdit = Boolean(appointment);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();

  useEffect(() => {
    if (!open) return;
    setErrorMessage('');
    if (appointment) {
      setForm({
        patientId: appointment.patientId || '',
        doctorId: appointment.doctorId || '',
        appointmentType: appointment.appointmentType || 'SCHEDULED',
        status: appointment.status || 'PENDING',
        scheduledStartTime: appointment.scheduledStartTime ? new Date(appointment.scheduledStartTime).toISOString().slice(0, 16) : '',
        actualArrivalTime: appointment.actualArrivalTime ? new Date(appointment.actualArrivalTime).toISOString().slice(0, 16) : ''
      });
      setSelectedPatient(patientsList.find((p) => p.id === appointment.patientId) || null);
      setSelectedDoctor(practitionersList.find((d) => d.id === appointment.doctorId) || null);
    } else {
      setForm({ ...EMPTY_FORM });
      setSelectedPatient(null);
      setSelectedDoctor(null);
    }
  }, [appointment, open, patientsList, practitionersList]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!form.patientId || !form.appointmentType || !form.status) {
      setErrorMessage('Patient, appointment type, and status are required.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        patientId: form.patientId,
        doctorId: form.doctorId || null,
        appointmentType: form.appointmentType,
        status: form.status,
        scheduledStartTime: form.scheduledStartTime ? new Date(form.scheduledStartTime).toISOString() : null,
        actualArrivalTime: form.actualArrivalTime ? new Date(form.actualArrivalTime).toISOString() : null
      };

      if (isEdit) {
        await updateAppointment.mutateAsync({ id: getAppointmentId(appointment), payload });
      } else {
        await createAppointment.mutateAsync(payload);
      }

      await onSaved?.();
      onClose();
    } catch (err) {
      setErrorMessage(getErrorMessage(err, `Failed to ${isEdit ? 'update' : 'create'} appointment.`));
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
          <Box>
            <Typography variant="h5" fontWeight={800}>
              {isEdit ? 'Edit Appointment' : 'Book Appointment'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Schedule patient visit or emergency arrival
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseOutlined />
          </IconButton>
        </Stack>
        <Divider sx={{ my: 2 }} />

        {isEdit && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Appointment ID is system-managed.
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Stack spacing={2}>
          {/* Patient Selector */}
          <Autocomplete
            options={patientsList}
            getOptionLabel={(p) => `${p.firstName || ''} ${p.lastName || ''} (${p.patientNumber || p.id.slice(0, 8)})`}
            value={selectedPatient}
            onChange={(_, val) => {
              setSelectedPatient(val);
              setForm((prev) => ({ ...prev, patientId: val ? val.id : '' }));
            }}
            renderInput={(params) => <TextField {...params} label="Select Patient" required fullWidth />}
          />

          {/* Doctor / Practitioner Selector */}
          <Autocomplete
            options={practitionersList}
            getOptionLabel={(d) =>
              `${d.user?.firstName || ''} ${d.user?.lastName || ''} - ${d.specialty || d.practitionerType || 'Doctor'}`
            }
            value={selectedDoctor}
            onChange={(_, val) => {
              setSelectedDoctor(val);
              setForm((prev) => ({ ...prev, doctorId: val ? val.id : '' }));
            }}
            renderInput={(params) => (
              <TextField {...params} label="Assigned Doctor / Practitioner" fullWidth helperText="Optional for unassigned walk-in/triage" />
            )}
          />

          <FormControl fullWidth required>
            <InputLabel>Appointment Type</InputLabel>
            <Select
              value={form.appointmentType}
              label="Appointment Type"
              onChange={(e) => setForm({ ...form, appointmentType: e.target.value })}
            >
              {APPOINTMENT_TYPE_OPTIONS.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth required>
            <InputLabel>Status</InputLabel>
            <Select value={form.status} label="Status" onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {APPOINTMENT_STATUS_OPTIONS.map((st) => (
                <MenuItem key={st} value={st}>
                  {st}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Scheduled Start Time"
            type="datetime-local"
            value={form.scheduledStartTime}
            onChange={(e) => setForm({ ...form, scheduledStartTime: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Actual Arrival Time"
            type="datetime-local"
            value={form.actualArrivalTime}
            onChange={(e) => setForm({ ...form, actualArrivalTime: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Stack>

        <Box sx={{ flex: 1, minHeight: 24 }} />
        <Divider sx={{ my: 2 }} />
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button variant="outlined" color="inherit" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" type="submit" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Book Appointment'}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}

export default function AppointmentsPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formAppointment, setFormAppointment] = useState(null);
  const [actionError, setActionError] = useState('');

  const { data, isLoading, isError, refetch, isFetching } = useAppointments({ page, size });
  const { data: patientsData } = usePatients({ page: 0, size: 100 });
  const { data: practitionersData } = usePractitioners({ page: 0, size: 100 });

  const deleteAppointment = useDeleteAppointment();

  const appointments = getItemsFromPage(data);
  const totalElements = getTotalElements(data);
  const patientsList = getItemsFromPage(patientsData);
  const practitionersList = getItemsFromPage(practitionersData);

  const patientsMap = useMemo(() => {
    const map = {};
    patientsList.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [patientsList]);

  const practitionersMap = useMemo(() => {
    const map = {};
    practitionersList.forEach((pr) => {
      map[pr.id] = pr;
    });
    return map;
  }, [practitionersList]);

  const visibleAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return appointments.filter((app) => {
      if (statusFilter && app.status !== statusFilter) return false;
      if (!query) return true;

      const patient = patientsMap[app.patientId];
      const doctor = practitionersMap[app.doctorId];
      const patientName = patient ? `${patient.firstName || ''} ${patient.lastName || ''}` : '';
      const doctorName = doctor ? `${doctor.user?.firstName || ''} ${doctor.user?.lastName || ''}` : '';

      return [app.appointmentType, app.status, patientName, doctorName].filter(Boolean).join(' ').toLowerCase().includes(query);
    });
  }, [appointments, search, statusFilter, patientsMap, practitionersMap]);

  const stats = useMemo(
    () => ({
      total: totalElements,
      scheduled: appointments.filter((a) => a.appointmentType === 'SCHEDULED').length,
      walkIn: appointments.filter((a) => a.appointmentType === 'WALK_IN').length,
      emergency: appointments.filter((a) => a.appointmentType === 'EMERGENCY').length,
      arrivedOrCompleted: appointments.filter((a) => a.status === 'ARRIVED' || a.status === 'COMPLETED').length
    }),
    [appointments, totalElements]
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
            Appointments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage outpatient visits, walk-ins, and emergency scheduling.
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
              setFormAppointment(null);
              setFormOpen(true);
            }}
          >
            Book Appointment
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
          Failed to load appointments.
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} lg={2.4}>
          <StatCard label="Total Appointments" value={stats.total} color="primary.main" />
        </Grid>
        <Grid item xs={6} sm={4} lg={2.4}>
          <StatCard label="Scheduled" value={stats.scheduled} color="#2563eb" description="On this page" />
        </Grid>
        <Grid item xs={6} sm={4} lg={2.4}>
          <StatCard label="Walk-Ins" value={stats.walkIn} color="#9333ea" description="On this page" />
        </Grid>
        <Grid item xs={6} sm={4} lg={2.4}>
          <StatCard label="Emergency" value={stats.emergency} color="error.main" description="On this page" />
        </Grid>
        <Grid item xs={6} sm={4} lg={2.4}>
          <StatCard label="Arrived / Completed" value={stats.arrivedOrCompleted} color="success.main" description="On this page" />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 2, minWidth: 0, mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by patient, doctor, or type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="">All Statuses</MenuItem>
                  {APPOINTMENT_STATUS_OPTIONS.map((st) => (
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
                <TableCell>Patient Name</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Scheduled Start</TableCell>
                <TableCell>Actual Arrival</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : visibleAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">No appointments found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                visibleAppointments.map((app) => {
                  const patient = patientsMap[app.patientId];
                  const doctor = practitionersMap[app.doctorId];
                  const patientName = patient ? `${patient.firstName || ''} ${patient.lastName || ''}`.trim() : '—';
                  const doctorName = doctor ? `${doctor.user?.firstName || ''} ${doctor.user?.lastName || ''}`.trim() : 'Unassigned';

                  return (
                    <TableRow
                      key={app.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedAppointment(app);
                        setDetailsOpen(true);
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem' }}>{patientName[0] || 'P'}</Avatar>
                          <Typography variant="body2" fontWeight={600}>
                            {patientName}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{doctorName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={app.appointmentType} variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={app.status} color={getStatusColor(app.status)} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {app.scheduledStartTime ? new Date(app.scheduledStartTime).toLocaleString() : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {app.actualArrivalTime ? new Date(app.actualArrivalTime).toLocaleString() : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="View">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedAppointment(app);
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
                                setFormAppointment(app);
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
                                if (window.confirm(`Cancel or remove this appointment?`)) {
                                  try {
                                    await deleteAppointment.mutateAsync(app.id);
                                    refetch();
                                  } catch (err) {
                                    setActionError('Failed to delete appointment.');
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
                  );
                })
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

      <AppointmentDetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        appointment={selectedAppointment}
        onEdit={() => {
          setFormAppointment(selectedAppointment);
          setDetailsOpen(false);
          setFormOpen(true);
        }}
        patientsMap={patientsMap}
        practitionersMap={practitionersMap}
      />

      <AppointmentFormDrawer
        open={formOpen}
        onClose={() => setFormOpen(false)}
        appointment={formAppointment}
        patientsList={patientsList}
        practitionersList={practitionersList}
        onSaved={() => refetch()}
      />
    </Box>
  );
}
