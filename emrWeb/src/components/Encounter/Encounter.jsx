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

import { useEncounters, useCreateEncounter, useUpdateEncounter, useDeleteEncounter, useEncounter } from '../../hooks/useEncounters-history';
import { useAppointments } from '../../hooks/useAppointments';
import { usePatients } from '../../hooks/usePatients';
import { usePractitioners } from '../../hooks/usePractitioners';

const ENCOUNTER_STATUS_OPTIONS = ['PLANNED', 'ARRIVED', 'IN_PROGRESS', 'TRIAGED', 'FINISHED', 'CANCELLED'];
const ENCOUNTER_CLASS_OPTIONS = ['AMBULATORY', 'EMERGENCY', 'INPATIENT', 'OBSERVATION', 'VIRTUAL'];
const ENCOUNTER_TYPE_OPTIONS = ['CONSULTATION', 'FOLLOW_UP', 'PROCEDURE', 'EMERGENCY_CARE', 'ROUTINE_CHECKUP'];
const ENCOUNTER_PRIORITY_OPTIONS = ['ROUTINE', 'URGENT', 'EMERGENCY', 'STAT'];

const EMPTY_FORM = {
  encounterNumber: '',
  appointmentId: '',
  status: 'PLANNED',
  encounterClass: 'AMBULATORY',
  encounterType: 'CONSULTATION',
  priority: 'ROUTINE',
  actualStart: '',
  actualEnd: ''
};

function getEncounterId(encounter) {
  return encounter?.id;
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value).replaceAll('_', ' ');
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

function getEncountersFromPage(payload) {
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
    case 'IN_PROGRESS':
      return 'info';
    case 'FINISHED':
      return 'success';
    case 'ARRIVED':
      return 'primary';
    case 'PLANNED':
      return 'default';
    case 'TRIAGED':
      return 'secondary';
    case 'CANCELLED':
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

function EncounterDetailsDrawer({ open, onClose, encounter, onEdit, patientsMap, practitionersMap }) {
  const encounterId = getEncounterId(encounter);
  const { data: encounterDetails } = useEncounter ? useEncounter(encounterId) : { data: null };
  const fullEncounter = encounterDetails || encounter;

  const patient = patientsMap[fullEncounter?.appointmentId] || null;
  const doctor = practitionersMap[fullEncounter?.doctorId] || null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 500 }, maxWidth: '100%' } }}>
      <Box sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Encounter Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Clinical visit and care settings
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="Close drawer">
            <CloseOutlined />
          </IconButton>
        </Stack>
        <Divider sx={{ my: 2 }} />
        {!fullEncounter ? (
          <Alert severity="info">Select an encounter to view details.</Alert>
        ) : (
          <>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={800}>
                {fullEncounter.encounterNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Class: {formatValue(fullEncounter.encounterClass)}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip size="small" label={fullEncounter.status} color={getStatusColor(fullEncounter.status)} />
                <Chip size="small" variant="outlined" label={fullEncounter.priority} />
              </Stack>
              <Button fullWidth variant="contained" startIcon={<EditOutlined />} sx={{ mt: 2 }} onClick={onEdit}>
                Edit Encounter
              </Button>
            </Paper>

            <Section title="Encounter Information" defaultExpanded>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <InfoField label="Encounter Number" value={fullEncounter.encounterNumber} />
                </Grid>
                <Grid item xs={6}>
                  <InfoField label="Status" value={fullEncounter.status} />
                </Grid>
                <Grid item xs={6}>
                  <InfoField label="Class" value={fullEncounter.encounterClass} />
                </Grid>
                <Grid item xs={6}>
                  <InfoField label="Type" value={fullEncounter.encounterType} />
                </Grid>
                <Grid item xs={6}>
                  <InfoField label="Priority" value={fullEncounter.priority} />
                </Grid>
                <Grid item xs={6}>
                  <InfoField label="Appointment ID" value={fullEncounter.appointmentId} />
                </Grid>
                <Grid item xs={6}>
                  <InfoField
                    label="Actual Start"
                    value={fullEncounter.actualStart ? new Date(fullEncounter.actualStart).toLocaleString() : null}
                  />
                </Grid>
                <Grid item xs={6}>
                  <InfoField
                    label="Actual End"
                    value={fullEncounter.actualEnd ? new Date(fullEncounter.actualEnd).toLocaleString() : null}
                  />
                </Grid>
              </Grid>
            </Section>

            <Section title="Participant Context">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <InfoField
                    label="Patient Name"
                    value={patient ? `${patient.firstName || ''} ${patient.lastName || ''}` : 'Linked via Appointment'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <InfoField
                    label="Doctor / Practitioner"
                    value={doctor ? `${doctor.user?.firstName || ''} ${doctor.user?.lastName || ''}` : 'Assigned Practitioner'}
                  />
                </Grid>
              </Grid>
            </Section>

            <Section title="System Metadata">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <InfoField label="Encounter ID" value={fullEncounter.id} />
                </Grid>
              </Grid>
            </Section>
          </>
        )}
      </Box>
    </Drawer>
  );
}

function EncounterFormDrawer({ open, onClose, encounter, appointmentsList, patientsMap, practitionersMap, onSaved }) {
  const isEdit = Boolean(encounter);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const createEncounter = useCreateEncounter();
  const updateEncounter = useUpdateEncounter();

  useEffect(() => {
    if (!open) return;
    setErrorMessage('');
    if (encounter) {
      setForm({
        encounterNumber: encounter.encounterNumber || '',
        appointmentId: encounter.appointmentId || '',
        status: encounter.status || 'PLANNED',
        encounterClass: encounter.encounterClass || 'AMBULATORY',
        encounterType: encounter.encounterType || 'CONSULTATION',
        priority: encounter.priority || 'ROUTINE',
        actualStart: encounter.actualStart ? encounter.actualStart.slice(0, 16) : '',
        actualEnd: encounter.actualEnd ? encounter.actualEnd.slice(0, 16) : ''
      });
      const matchAppt = appointmentsList.find((a) => a.id === encounter.appointmentId);
      setSelectedAppointment(matchAppt || null);
    } else {
      setForm({ ...EMPTY_FORM });
      setSelectedAppointment(null);
    }
  }, [encounter, open, appointmentsList]);

  const handleAppointmentSelect = (event, newValue) => {
    setSelectedAppointment(newValue);
    if (newValue) {
      setForm((prev) => ({
        ...prev,
        appointmentId: newValue.id
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        appointmentId: ''
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!form.encounterNumber.trim() || !form.appointmentId || !form.status || !form.encounterClass || !form.priority) {
      setErrorMessage('Encounter number, appointment, status, class and priority are required.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        encounterNumber: form.encounterNumber.trim(),
        appointmentId: form.appointmentId,
        status: form.status,
        encounterClass: form.encounterClass,
        encounterType: form.encounterType || null,
        priority: form.priority,
        actualStart: form.actualStart ? new Date(form.actualStart).toISOString() : null,
        actualEnd: form.actualEnd ? new Date(form.actualEnd).toISOString() : null
      };

      if (isEdit) {
        await updateEncounter.mutateAsync({ id: getEncounterId(encounter), payload });
      } else {
        await createEncounter.mutateAsync(payload);
      }

      await onSaved?.();
      onClose();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, `Failed to ${isEdit ? 'update' : 'create'} encounter.`));
    } finally {
      setSaving(false);
    }
  };

  const apptPatient = selectedAppointment ? patientsMap[selectedAppointment.patientId] : null;
  const apptDoctor = selectedAppointment ? practitionersMap[selectedAppointment.doctorId] : null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 550 }, maxWidth: '100%' } }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ p: 3, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h5" fontWeight={800}>
              {isEdit ? 'Edit Encounter' : 'Add Encounter'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Patient visit care and appointment linkage
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="Close form">
            <CloseOutlined />
          </IconButton>
        </Stack>
        <Divider sx={{ my: 2 }} />

        {isEdit && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Encounter ID and Number are system-tracked.
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Stack spacing={2}>
          <TextField
            label="Encounter Number"
            value={form.encounterNumber}
            onChange={(e) => setForm({ ...form, encounterNumber: e.target.value })}
            required
            fullWidth
          />

          {/* Appointment Search & Selector */}
          <Autocomplete
            options={appointmentsList}
            getOptionLabel={(option) => `Appt #${option.id.slice(0, 8)} - Type: ${option.appointmentType} (${option.status})`}
            value={selectedAppointment}
            onChange={handleAppointmentSelect}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search & Select Appointment"
                required
                fullWidth
                helperText="Walk-ins and emergencies also receive appointments"
              />
            )}
          />

          {selectedAppointment && (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Selected Appointment Details
              </Typography>
              <Typography variant="body2">
                <strong>Type:</strong> {selectedAppointment.appointmentType}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> {selectedAppointment.status}
              </Typography>
              <Typography variant="body2">
                <strong>Patient:</strong> {apptPatient ? `${apptPatient.firstName} ${apptPatient.lastName}` : selectedAppointment.patientId}
              </Typography>
              <Typography variant="body2">
                <strong>Scheduled:</strong>{' '}
                {selectedAppointment.scheduledStartTime ? new Date(selectedAppointment.scheduledStartTime).toLocaleString() : 'Immediate'}
              </Typography>
            </Paper>
          )}

          <FormControl fullWidth required>
            <InputLabel>Status</InputLabel>
            <Select value={form.status} label="Status" onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {ENCOUNTER_STATUS_OPTIONS.map((st) => (
                <MenuItem key={st} value={st}>
                  {st}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth required>
            <InputLabel>Encounter Class</InputLabel>
            <Select
              value={form.encounterClass}
              label="Encounter Class"
              onChange={(e) => setForm({ ...form, encounterClass: e.target.value })}
            >
              {ENCOUNTER_CLASS_OPTIONS.map((cls) => (
                <MenuItem key={cls} value={cls}>
                  {cls}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Encounter Type</InputLabel>
            <Select value={form.encounterType} label="Encounter Type" onChange={(e) => setForm({ ...form, encounterType: e.target.value })}>
              {ENCOUNTER_TYPE_OPTIONS.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth required>
            <InputLabel>Priority</InputLabel>
            <Select value={form.priority} label="Priority" onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {ENCOUNTER_PRIORITY_OPTIONS.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Actual Start"
                type="datetime-local"
                value={form.actualStart}
                onChange={(e) => setForm({ ...form, actualStart: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Actual End"
                type="datetime-local"
                value={form.actualEnd}
                onChange={(e) => setForm({ ...form, actualEnd: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Stack>

        <Box sx={{ flex: 1, minHeight: 24 }} />
        <Divider sx={{ my: 2 }} />
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button variant="outlined" color="inherit" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" type="submit" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Encounter'}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}

export default function EncountersPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const [selectedEncounter, setSelectedEncounter] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formEncounter, setFormEncounter] = useState(null);
  const [actionError, setActionError] = useState('');

  const { data, isLoading, isError, refetch, isFetching } = useEncounters({ page, size });
  const { data: appointmentsData } = useAppointments({ page: 0, size: 100 });
  const { data: patientsData } = usePatients({ page: 0, size: 100 });
  const { data: practitionersData } = usePractitioners({ page: 0, size: 100 });

  const deleteEncounter = useDeleteEncounter();

  const encounters = getEncountersFromPage(data);
  const totalElements = getTotalElements(data);
  const appointmentsList = getEncountersFromPage(appointmentsData);
  const patientsList = getEncountersFromPage(patientsData);
  const practitionersList = getEncountersFromPage(practitionersData);

  const appointmentsMap = useMemo(() => {
    const map = {};
    appointmentsList.forEach((a) => {
      map[a.id] = a;
    });
    return map;
  }, [appointmentsList]);

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

  const visibleEncounters = useMemo(() => {
    const query = search.trim().toLowerCase();
    return encounters.filter((enc) => {
      if (statusFilter && enc.status !== statusFilter) return false;
      if (!query) return true;
      const appt = appointmentsMap[enc.appointmentId];
      const patient = appt ? patientsMap[appt.patientId] : null;
      const patientName = patient ? `${patient.firstName || ''} ${patient.lastName || ''}` : '';
      return [enc.encounterNumber, enc.encounterClass, enc.encounterType, enc.priority, patientName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [encounters, search, statusFilter, appointmentsMap, patientsMap]);

  const stats = useMemo(
    () => ({
      total: totalElements,
      inProgress: encounters.filter((e) => e.status === 'IN_PROGRESS').length,
      finished: encounters.filter((e) => e.status === 'FINISHED').length,
      emergency: encounters.filter((e) => e.encounterClass === 'EMERGENCY').length,
      ambulatory: encounters.filter((e) => e.encounterClass === 'AMBULATORY').length
    }),
    [encounters, totalElements]
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
            Encounters
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage patient clinical visits, admissions, and care settings.
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
              setFormEncounter(null);
              setFormOpen(true);
            }}
          >
            Add Encounter
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
          Failed to load encounters.
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} lg={2.4}>
          <StatCard label="Total Encounters" value={stats.total} color="primary.main" />
        </Grid>
        <Grid item xs={6} sm={4} lg={2.4}>
          <StatCard label="In Progress" value={stats.inProgress} color="info.main" description="On this page" />
        </Grid>
        <Grid item xs={6} sm={4} lg={2.4}>
          <StatCard label="Finished" value={stats.finished} color="success.main" description="On this page" />
        </Grid>
        <Grid item xs={6} sm={4} lg={2.4}>
          <StatCard label="Emergency" value={stats.emergency} color="error.main" description="On this page" />
        </Grid>
        <Grid item xs={6} sm={4} lg={2.4}>
          <StatCard label="Ambulatory" value={stats.ambulatory} color="#2563eb" description="On this page" />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 2, minWidth: 0, mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by encounter number, patient, class or type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="">All Statuses</MenuItem>
                  {ENCOUNTER_STATUS_OPTIONS.map((st) => (
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
                <TableCell>Encounter No.</TableCell>
                <TableCell>Patient Name</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
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
              ) : visibleEncounters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">No encounters found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                visibleEncounters.map((enc) => {
                  const appt = appointmentsMap[enc.appointmentId];
                  const patient = appt ? patientsMap[appt.patientId] : null;
                  const patientName = patient ? `${patient.firstName || ''} ${patient.lastName || ''}`.trim() : '—';
                  const doctor = appt && appt.doctorId ? practitionersMap[appt.doctorId] : null;
                  const doctorName = doctor ? `${doctor.user?.firstName || ''} ${doctor.user?.lastName || ''}`.trim() : '—';

                  return (
                    <TableRow
                      key={enc.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedEncounter(enc);
                        setDetailsOpen(true);
                      }}
                    >
                      <TableCell>
                        <Typography fontWeight={600}>{enc.encounterNumber}</Typography>
                      </TableCell>
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
                        <Chip size="small" label={enc.encounterClass} variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={enc.priority} color={enc.priority === 'EMERGENCY' ? 'error' : 'default'} />
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={enc.status} color={getStatusColor(enc.status)} />
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="View">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedEncounter(enc);
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
                                setFormEncounter(enc);
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
                                if (window.confirm(`Delete encounter ${enc.encounterNumber}?`)) {
                                  try {
                                    await deleteEncounter.mutateAsync(enc.id);
                                    refetch();
                                  } catch (err) {
                                    setActionError('Failed to delete encounter.');
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

      <EncounterDetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        encounter={selectedEncounter}
        onEdit={() => {
          setFormEncounter(selectedEncounter);
          setDetailsOpen(false);
          setFormOpen(true);
        }}
        patientsMap={patientsMap}
        practitionersMap={practitionersMap}
      />
      <EncounterFormDrawer
        open={formOpen}
        onClose={() => setFormOpen(false)}
        encounter={formEncounter}
        appointmentsList={appointmentsList}
        patientsMap={patientsMap}
        practitionersMap={practitionersMap}
        onSaved={() => refetch()}
      />
    </Box>
  );
}
