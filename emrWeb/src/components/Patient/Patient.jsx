
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
  Select
} from '@mui/material';

import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import ReloadOutlined from '@ant-design/icons/ReloadOutlined';
import UserAddOutlined from '@ant-design/icons/UserAddOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import DownOutlined from '@ant-design/icons/DownOutlined';

import {
  usePatient,
  usePatients,
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient
} from '../../hooks/usePatients';

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' }
];

// Keep these values consistent with your Java MaritalStatus enum.
const MARITAL_STATUS_OPTIONS = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'MARRIED', label: 'Married' },
  { value: 'DIVORCED', label: 'Divorced' },
  { value: 'WIDOWED', label: 'Widowed' }
];

const EMPTY_FORM = {
  firstName: '',
  middleName: '',
  lastName: '',
  gender: '',
  birthDate: '',
  maritalStatus: '',
  isAlive: true,
  active: true,
  multipleBirth: false,
  multipleBirthOrder: '',
  addresses: [],
  patientContact: [],
  nextOfKinContact: []
};

function getPatientId(patient) {
  return patient?.id;
}

function getPatientName(patient) {
  return [
    patient?.firstName,
    patient?.middleName,
    patient?.lastName
  ]
    .filter(Boolean)
    .join(' ');
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value).replaceAll('_', ' ');
}

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString();
}

function getAlive(patient) {
  return patient?.isAlive ?? patient?.alive ?? true;
}

function getInitials(patient) {
  return [patient?.firstName, patient?.lastName]
    .filter(Boolean)
    .map((name) => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getContactValue(contact) {
  if (!contact) return '—';

  return [
    contact?.system,
    contact?.value,
    contact?.use,
    contact?.relationship
  ]
    .filter(Boolean)
    .join(' · ') || '—';
}

function getAddressValue(address) {
  if (!address) return '—';

  return [
    address?.line1,
    address?.line2,
    address?.street,
    address?.city,
    address?.district,
    address?.state,
    address?.country,
    address?.postalCode
  ]
    .filter(Boolean)
    .join(', ') || '—';
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

function StatCard({ label, value, description, color }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        height: '100%',
        borderRadius: 2
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>

      <Typography
        variant="h4"
        fontWeight={800}
        sx={{ color, mt: 1 }}
      >
        {value}
      </Typography>

      {description && (
        <Typography
          variant="caption"
          color="text.secondary"
        >
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
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '8px !important',
        '&:before': { display: 'none' },
        mb: 1.5
      }}
    >
      <AccordionSummary
        expandIcon={<DownOutlined />}
        sx={{ px: 2 }}
      >
        <Typography fontWeight={700}>
          {title}
        </Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 2, pb: 2 }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
}

function InfoField({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={600}
        sx={{ overflowWrap: 'anywhere' }}
      >
        {formatValue(value)}
      </Typography>
    </Box>
  );
}

function PatientDetailsDrawer({
  open,
  onClose,
  patient,
  onEdit
}) {
  const patientId = getPatientId(patient);

  const {
    data: patientDetails,
    isLoading,
    isError,
    error
  } = usePatient(patientId);

  const fullPatient = patientDetails || patient;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 480 },
          maxWidth: '100%'
        }
      }}
    >
      <Box
        sx={{
          p: 3,
          height: '100%',
          overflowY: 'auto'
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Patient Details
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Patient registration and demographic information
            </Typography>
          </Box>

          <IconButton onClick={onClose} aria-label="Close drawer">
            <CloseOutlined />
          </IconButton>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {isLoading && !fullPatient ? (
          <Stack alignItems="center" sx={{ py: 5 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }} color="text.secondary">
              Loading patient...
            </Typography>
          </Stack>
        ) : !fullPatient ? (
          <Alert severity="info">
            Select a patient to view their details.
          </Alert>
        ) : (
          <>
            {isError && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {getErrorMessage(
                  error,
                  'Could not load the full patient record.'
                )}
              </Alert>
            )}

            <Paper
              variant="outlined"
              sx={{ p: 2, mb: 2, borderRadius: 2 }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
              >
                <Avatar sx={{ width: 54, height: 54 }}>
                  {getInitials(fullPatient)}
                </Avatar>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="h6" fontWeight={800}>
                    {getPatientName(fullPatient) || 'Unnamed patient'}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {fullPatient.patientNumber || 'No patient number'}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}
                  >
                    <Chip
                      size="small"
                      label={getAlive(fullPatient) ? 'Alive' : 'Deceased'}
                      color={getAlive(fullPatient) ? 'success' : 'error'}
                    />

                    <Chip
                      size="small"
                      label={fullPatient.active ? 'Active' : 'Inactive'}
                      color={fullPatient.active ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </Stack>
                </Box>
              </Stack>

              <Button
                fullWidth
                variant="contained"
                startIcon={<EditOutlined />}
                sx={{ mt: 2 }}
                onClick={onEdit}
              >
                Edit Patient
              </Button>
            </Paper>

            <Section title="Personal Information" defaultExpanded>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <InfoField
                    label="First Name"
                    value={fullPatient.firstName}
                  />
                </Grid>

                <Grid size={6}>
                  <InfoField
                    label="Middle Name"
                    value={fullPatient.middleName}
                  />
                </Grid>

                <Grid size={6}>
                  <InfoField
                    label="Last Name"
                    value={fullPatient.lastName}
                  />
                </Grid>

                <Grid size={6}>
                  <InfoField
                    label="Gender"
                    value={fullPatient.gender}
                  />
                </Grid>

                <Grid size={6}>
                  <InfoField
                    label="Date of Birth"
                    value={formatDate(fullPatient.birthDate)}
                  />
                </Grid>

                <Grid size={6}>
                  <InfoField
                    label="Marital Status"
                    value={fullPatient.maritalStatus}
                  />
                </Grid>

                <Grid size={6}>
                  <InfoField
                    label="Multiple Birth"
                    value={fullPatient.multipleBirth}
                  />
                </Grid>

                {fullPatient.multipleBirth && (
                  <Grid size={6}>
                    <InfoField
                      label="Birth Order"
                      value={fullPatient.multipleBirthOrder}
                    />
                  </Grid>
                )}
              </Grid>
            </Section>

            <Section title="Addresses">
              {fullPatient.addresses?.length ? (
                <Stack spacing={2}>
                  {fullPatient.addresses.map((address, index) => (
                    <Box key={address.id || index}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Address {index + 1}
                      </Typography>

                      <Typography variant="body2">
                        {getAddressValue(address)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No addresses recorded.
                </Typography>
              )}
            </Section>

            <Section title="Patient Contacts">
              {fullPatient.patientContact?.length ? (
                <Stack spacing={2}>
                  {fullPatient.patientContact.map((contact, index) => (
                    <Box key={contact.id || index}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Contact {index + 1}
                      </Typography>

                      <Typography variant="body2">
                        {getContactValue(contact)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No patient contacts recorded.
                </Typography>
              )}
            </Section>

            <Section title="Next of Kin Contacts">
              {fullPatient.nextOfKinContact?.length ? (
                <Stack spacing={2}>
                  {fullPatient.nextOfKinContact.map((contact, index) => (
                    <Box key={contact.id || index}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Next-of-kin contact {index + 1}
                      </Typography>

                      <Typography variant="body2">
                        {getContactValue(contact)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No next-of-kin contacts recorded.
                </Typography>
              )}
            </Section>

            <Section title="Record Information">
              <Grid container spacing={2}>
                <Grid size={6}>
                  <InfoField label="Patient ID" value={patientId} />
                </Grid>

                <Grid size={6}>
                  <InfoField
                    label="Patient Number"
                    value={fullPatient.patientNumber}
                  />
                </Grid>
              </Grid>
            </Section>
          </>
        )}
      </Box>
    </Drawer>
  );
}

function PatientFormDrawer({
  open,
  onClose,
  patient,
  onSaved
}) {
  const isEdit = Boolean(patient);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();

  useEffect(() => {
    if (!open) return;

    setErrorMessage('');

    if (patient) {
      setForm({
        firstName: patient.firstName || '',
        middleName: patient.middleName || '',
        lastName: patient.lastName || '',
        gender: patient.gender || '',
        birthDate: patient.birthDate || '',
        maritalStatus: patient.maritalStatus || '',
        isAlive: getAlive(patient),
        active: patient.active ?? true,
        multipleBirth: patient.multipleBirth ?? false,
        multipleBirthOrder: patient.multipleBirthOrder ?? '',
        addresses: patient.addresses || [],
        patientContact: patient.patientContact || [],
        nextOfKinContact: patient.nextOfKinContact || []
      });
    } else {
      setForm({
        ...EMPTY_FORM,
        addresses: [],
        patientContact: [],
        nextOfKinContact: []
      });
    }
  }, [patient, open]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;

    setForm((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const handleBooleanChange = (field) => (event) => {
    setForm((previous) => ({
      ...previous,
      [field]: event.target.checked
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!form.firstName.trim() || !form.lastName.trim() || !form.gender) {
      setErrorMessage(
        'First name, last name and gender are required.'
      );
      return;
    }

    const payload = {
      firstName: form.firstName.trim(),
      middleName: form.middleName.trim() || null,
      lastName: form.lastName.trim(),
      gender: form.gender,
      birthDate: form.birthDate || null,
      maritalStatus: form.maritalStatus || null,
      isAlive: Boolean(form.isAlive),
      active: Boolean(form.active),
      multipleBirth: Boolean(form.multipleBirth),
      multipleBirthOrder: form.multipleBirth
        ? (form.multipleBirthOrder === ''
            ? null
            : Number(form.multipleBirthOrder))
        : null
    };

    try {
      setSaving(true);

      if (isEdit) {
        await updatePatient.mutateAsync({
          id: getPatientId(patient),
          payload
        });
      } else {
        await createPatient.mutateAsync(payload);
      }

      await onSaved?.();
      onClose();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          `Failed to ${isEdit ? 'update' : 'register'} patient.`
        )
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 480 },
          maxWidth: '100%'
        }
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 3,
          height: '100%',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h5" fontWeight={800}>
              {isEdit ? 'Edit Patient' : 'Register Patient'}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {isEdit
                ? 'Update the patient's demographic information.'
                : 'Enter the patient's registration details.'}
            </Typography>
          </Box>

          <IconButton onClick={onClose} aria-label="Close form">
            <CloseOutlined />
          </IconButton>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {isEdit && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Patient ID and patient number are not editable here.
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Stack spacing={2}>
          {isEdit && (
            <TextField
              label="Patient Number"
              value={patient?.patientNumber || ''}
              fullWidth
              disabled
            />
          )}

          <Section title="Personal Information" defaultExpanded>
            <Stack spacing={2}>
              <TextField
                label="First Name"
                value={form.firstName}
                onChange={handleChange('firstName')}
                required
                fullWidth
              />

              <TextField
                label="Middle Name"
                value={form.middleName}
                onChange={handleChange('middleName')}
                fullWidth
              />

              <TextField
                label="Last Name"
                value={form.lastName}
                onChange={handleChange('lastName')}
                required
                fullWidth
              />

              <FormControl fullWidth required>
                <InputLabel id="patient-gender-label">
                  Gender
                </InputLabel>

                <Select
                  labelId="patient-gender-label"
                  label="Gender"
                  value={form.gender}
                  onChange={handleChange('gender')}
                >
                  {GENDER_OPTIONS.map((option) => (
                    <MenuItem
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Date of Birth"
                type="date"
                value={form.birthDate}
                onChange={handleChange('birthDate')}
                fullWidth
                slotProps={{
                  inputLabel: { shrink: true }
                }}
              />

              <FormControl fullWidth>
                <InputLabel id="patient-marital-label">
                  Marital Status
                </InputLabel>

                <Select
                  labelId="patient-marital-label"
                  label="Marital Status"
                  value={form.maritalStatus}
                  onChange={handleChange('maritalStatus')}
                >
                  <MenuItem value="">
                    <em>Not specified</em>
                  </MenuItem>

                  {MARITAL_STATUS_OPTIONS.map((option) => (
                    <MenuItem
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Section>

          <Section title="Patient Status" defaultExpanded>
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="patient-life-status-label">
                  Life Status
                </InputLabel>

                <Select
                  labelId="patient-life-status-label"
                  label="Life Status"
                  value={form.isAlive ? 'ALIVE' : 'DECEASED'}
                  onChange={(event) => {
                    setForm((previous) => ({
                      ...previous,
                      isAlive: event.target.value === 'ALIVE'
                    }));
                  }}
                >
                  <MenuItem value="ALIVE">Alive</MenuItem>
                  <MenuItem value="DECEASED">Deceased</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="patient-active-label">
                  Registration Status
                </InputLabel>

                <Select
                  labelId="patient-active-label"
                  label="Registration Status"
                  value={form.active ? 'ACTIVE' : 'INACTIVE'}
                  onChange={(event) => {
                    setForm((previous) => ({
                      ...previous,
                      active: event.target.value === 'ACTIVE'
                    }));
                  }}
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="patient-multiple-birth-label">
                  Multiple Birth
                </InputLabel>

                <Select
                  labelId="patient-multiple-birth-label"
                  label="Multiple Birth"
                  value={form.multipleBirth ? 'YES' : 'NO'}
                  onChange={(event) => {
                    setForm((previous) => ({
                      ...previous,
                      multipleBirth: event.target.value === 'YES',
                      multipleBirthOrder:
                        event.target.value === 'YES'
                          ? previous.multipleBirthOrder
                          : ''
                    }));
                  }}
                >
                  <MenuItem value="NO">No</MenuItem>
                  <MenuItem value="YES">Yes</MenuItem>
                </Select>
              </FormControl>

              {form.multipleBirth && (
                <TextField
                  label="Multiple Birth Order"
                  type="number"
                  value={form.multipleBirthOrder}
                  onChange={handleChange('multipleBirthOrder')}
                  inputProps={{ min: 1, step: 1 }}
                  fullWidth
                />
              )}
            </Stack>
          </Section>
        </Stack>

        <Box sx={{ flex: 1, minHeight: 24 }} />

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            type="submit"
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            {saving
              ? 'Saving...'
              : isEdit
                ? 'Save Changes'
                : 'Register Patient'}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}

export default function PatientsPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formPatient, setFormPatient] = useState(null);
  const [actionError, setActionError] = useState('');

  const {
    patients = [],
    totalElements = 0,
    isLoading,
    isError,
    mutate
  } = usePatients({ page, size });

  const deletePatient = useDeletePatient();

  // This filters the current page. Prefer backend search for all records.
  const visiblePatients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return patients;

    return patients.filter((patient) => {
      const searchable = [
        patient.patientNumber,
        patient.firstName,
        patient.middleName,
        patient.lastName,
        patient.gender
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [patients, search]);

  const stats = useMemo(() => ({
    total: totalElements,
    male: patients.filter((p) => p.gender === 'MALE').length,
    female: patients.filter((p) => p.gender === 'FEMALE').length,
    alive: patients.filter(getAlive).length,
    deceased: patients.filter((p) => !getAlive(p)).length
  }), [patients, totalElements]);

  const handleView = (patient) => {
    setSelectedPatient(patient);
    setDetailsOpen(true);
  };

  const handleAdd = () => {
    setFormPatient(null);
    setFormOpen(true);
  };

  const handleEdit = (patient) => {
    setFormPatient(patient);
    setDetailsOpen(false);
    setFormOpen(true);
  };

  const handleDelete = async (patient) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${getPatientName(patient)}?`
    );

    if (!confirmed) return;

    try {
      setActionError('');
      await deletePatient.mutateAsync(getPatientId(patient));
      await mutate();

      if (getPatientId(selectedPatient) === getPatientId(patient)) {
        setDetailsOpen(false);
        setSelectedPatient(null);
      }
    } catch (error) {
      setActionError(
        getErrorMessage(error, 'Failed to deactivate patient.')
      );
    }
  };

  const handleSaved = async () => {
    await mutate();
  };

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
            Patients
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Register patients and manage demographic information.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<ReloadOutlined />}
            onClick={() => mutate()}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<UserAddOutlined />}
            onClick={handleAdd}
          >
            Add Patient
          </Button>
        </Stack>
      </Stack>

      {actionError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setActionError('')}
        >
          {actionError}
        </Alert>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load patients. Please refresh and try again.
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 4, lg: 2.4 }}>
          <StatCard
            label="Total Patients"
            value={stats.total}
            color="primary.main"
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 4, lg: 2.4 }}>
          <StatCard
            label="Male"
            value={stats.male}
            color="#2563eb"
            description="On this page"
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 4, lg: 2.4 }}>
          <StatCard
            label="Female"
            value={stats.female}
            color="#9333ea"
            description="On this page"
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 4, lg: 2.4 }}>
          <StatCard
            label="Alive"
            value={stats.alive}
            color="success.main"
            description="On this page"
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 4, lg: 2.4 }}>
          <StatCard
            label="Deceased"
            value={stats.deceased}
            color="error.main"
            description="On this page"
          />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 2, minWidth: 0 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search current page by patient number or name..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </Box>

        <Divider />

        <TableContainer sx={{ width: '100%' }}>
          <Table
            size="small"
            sx={{
              width: '100%',
              tableLayout: 'fixed',
              '& th, & td': {
                px: { xs: 0.75, sm: 1.5 },
                py: 1.5,
                overflowWrap: 'anywhere'
              }
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '18%' }}>
                  Patient Number
                </TableCell>

                <TableCell sx={{ width: '19%' }}>
                  First Name
                </TableCell>

                <TableCell sx={{ width: '19%' }}>
                  Last Name
                </TableCell>

                <TableCell sx={{ width: '12%', display: { xs: 'none', sm: 'table-cell' } }}>
                  Gender
                </TableCell>

                <TableCell sx={{ width: '15%', display: { xs: 'none', md: 'table-cell' } }}>
                  Date of Birth
                </TableCell>

                <TableCell sx={{ width: '11%', display: { xs: 'none', sm: 'table-cell' } }}>
                  Status
                </TableCell>

                <TableCell align="right" sx={{ width: '21%' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={28} />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Loading patients...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : visiblePatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">
                      {search
                        ? 'No matching patients on this page.'
                        : 'No patients registered yet.'}
                    </Typography>

                    {!search && (
                      <Button
                        sx={{ mt: 1 }}
                        startIcon={<UserAddOutlined />}
                        onClick={handleAdd}
                      >
                        Register first patient
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                visiblePatients.map((patient) => (
                  <TableRow
                    key={getPatientId(patient)}
                    hover
                    onClick={() => handleView(patient)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="primary.main"
                      >
                        {patient.patientNumber || '—'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {patient.firstName || '—'}
                    </TableCell>

                    <TableCell>
                      {patient.lastName || '—'}
                    </TableCell>

                    <TableCell
                      sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                    >
                      {formatValue(patient.gender)}
                    </TableCell>

                    <TableCell
                      sx={{ display: { xs: 'none', md: 'table-cell' } }}
                    >
                      {formatDate(patient.birthDate)}
                    </TableCell>

                    <TableCell
                      sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                    >
                      <Chip
                        size="small"
                        label={getAlive(patient) ? 'Alive' : 'Deceased'}
                        color={getAlive(patient) ? 'success' : 'error'}
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell
                      align="right"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Tooltip title="View details">
                        <IconButton
                          size="small"
                          onClick={() => handleView(patient)}
                        >
                          <EyeOutlined />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Edit patient">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(patient)}
                        >
                          <EditOutlined />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Deactivate patient">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(patient)}
                        >
                          <DeleteOutlined />
                        </IconButton>
                      </Tooltip>
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
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={size}
          onRowsPerPageChange={(event) => {
            setSize(Number(event.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 15, 25, 50]}
        />
      </Paper>

      <PatientDetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        patient={selectedPatient}
        onEdit={() => handleEdit(selectedPatient)}
      />

      <PatientFormDrawer
        open={formOpen}
        onClose={() => setFormOpen(false)}
        patient={formPatient}
        onSaved={handleSaved}
      />
    </Box>
  );
}
