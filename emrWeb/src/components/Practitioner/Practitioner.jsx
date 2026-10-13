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
  usePractitioner,
  usePractitioners,
  useCreatePractitioner,
  useUpdatePractitioner,
  useDeletePractitioner
} from '../../hooks/usePractitioners';

// Replace these with the exact values in your Java PractitionerType enum.
const PRACTITIONER_TYPE_OPTIONS = [
  { value: 'DOCTOR', label: 'Doctor' },
  { value: 'NURSE', label: 'Nurse' },
  { value: 'MIDWIFE', label: 'Midwife' },
  { value: 'PHARMACIST', label: 'Pharmacist' },
  { value: 'LABORATORY_TECHNICIAN', label: 'Laboratory Technician' },
  { value: 'OTHER', label: 'Other' }
];

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' }
];

const EMPTY_FORM = {
  username: '',
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  gender: '',
  practitionerNumber: '',
  practitionerType: '',
  professionalTitle: '',
  licenseNumber: '',
  registrationBody: '',
  qualification: '',
  specialty: '',
  active: true
};

function getPractitionerId(practitioner) {
  return practitioner?.id;
}

function getUser(practitioner) {
  return practitioner?.user || {};
}

function getFullName(practitioner) {
  const user = getUser(practitioner);

  return [user.firstName, user.lastName].filter(Boolean).join(' ');
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

function getInitials(practitioner) {
  const user = getUser(practitioner);

  return [user.firstName, user.lastName]
    .filter(Boolean)
    .map((name) => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
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
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '8px !important',
        '&:before': { display: 'none' },
        mb: 1.5
      }}
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

function PractitionerDetailsDrawer({ open, onClose, practitioner, onEdit }) {
  const practitionerId = getPractitionerId(practitioner);

  const { data: practitionerDetails, isLoading, isError, error } = usePractitioner(practitionerId);

  const fullPractitioner = practitionerDetails || practitioner;
  const user = getUser(fullPractitioner);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 500 },
          maxWidth: '100%'
        }
      }}
    >
      <Box sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Practitioner Details
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Professional and account information
            </Typography>
          </Box>

          <IconButton onClick={onClose} aria-label="Close drawer">
            <CloseOutlined />
          </IconButton>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {isLoading && !fullPractitioner ? (
          <Stack alignItems="center" sx={{ py: 5 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }} color="text.secondary">
              Loading practitioner...
            </Typography>
          </Stack>
        ) : !fullPractitioner ? (
          <Alert severity="info">Select a practitioner to view their details.</Alert>
        ) : (
          <>
            {isError && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {getErrorMessage(error, 'Could not load the full practitioner record.')}
              </Alert>
            )}

            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ width: 56, height: 56 }}>{getInitials(fullPractitioner)}</Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h6" fontWeight={800}>
                    {getFullName(fullPractitioner) || 'Unnamed practitioner'}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {fullPractitioner.practitionerNumber || 'No practitioner number'}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {formatValue(fullPractitioner.practitionerType)}
                  </Typography>

                  <Chip
                    size="small"
                    sx={{ mt: 1 }}
                    label={fullPractitioner.active ? 'Active' : 'Inactive'}
                    color={fullPractitioner.active ? 'success' : 'default'}
                  />
                </Box>
              </Stack>

              <Button fullWidth variant="contained" startIcon={<EditOutlined />} sx={{ mt: 2 }} onClick={onEdit}>
                Edit Practitioner
              </Button>
            </Paper>

            <Section title="Professional Information" defaultExpanded>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <InfoField label="Practitioner Number" value={fullPractitioner.practitionerNumber} />
                </Grid>

                <Grid size={6}>
                  <InfoField label="Practitioner Type" value={fullPractitioner.practitionerType} />
                </Grid>

                <Grid size={6}>
                  <InfoField label="Professional Title" value={fullPractitioner.professionalTitle} />
                </Grid>

                <Grid size={6}>
                  <InfoField label="Specialty" value={fullPractitioner.specialty} />
                </Grid>

                <Grid size={6}>
                  <InfoField label="Qualification" value={fullPractitioner.qualification} />
                </Grid>

                <Grid size={6}>
                  <InfoField label="License Number" value={fullPractitioner.licenseNumber} />
                </Grid>

                <Grid size={12}>
                  <InfoField label="Registration Body" value={fullPractitioner.registrationBody} />
                </Grid>
              </Grid>
            </Section>

            <Section title="User Account" defaultExpanded>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <InfoField label="First Name" value={user.firstName} />
                </Grid>

                <Grid size={6}>
                  <InfoField label="Last Name" value={user.lastName} />
                </Grid>

                <Grid size={6}>
                  <InfoField label="Username" value={user.username} />
                </Grid>

                <Grid size={6}>
                  <InfoField label="Gender" value={user.gender} />
                </Grid>

                <Grid size={12}>
                  <InfoField label="Email" value={user.email} />
                </Grid>

                <Grid size={12}>
                  <InfoField label="Phone Number" value={user.phoneNumber} />
                </Grid>

                <Grid size={6}>
                  <InfoField label="Role" value={user.role} />
                </Grid>

                <Grid size={6}>
                  <InfoField label="Account Status" value={user.userStatus} />
                </Grid>
              </Grid>
            </Section>

            <Section title="Addresses">
              {fullPractitioner.addresses?.length ? (
                <Stack spacing={2}>
                  {fullPractitioner.addresses.map((address, index) => (
                    <Box key={address.id || index}>
                      <Typography variant="caption" color="text.secondary">
                        Address {index + 1}
                      </Typography>

                      <Typography variant="body2">
                        {[address.line1, address.line2, address.street, address.city, address.district, address.country]
                          .filter(Boolean)
                          .join(', ') || 'Address details unavailable'}
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

            <Section title="Related and Emergency Contacts">
              {fullPractitioner.relatedContacts?.length ? (
                <Stack spacing={2}>
                  {fullPractitioner.relatedContacts.map((contact, index) => (
                    <Box key={contact.id || index}>
                      <Typography variant="caption" color="text.secondary">
                        Contact {index + 1}
                      </Typography>

                      <Typography variant="body2">
                        {[contact.name, contact.relationship, contact.system, contact.value, contact.phoneNumber]
                          .filter(Boolean)
                          .join(' · ') || 'Contact details unavailable'}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No related contacts recorded.
                </Typography>
              )}
            </Section>

            <Section title="Record Information">
              <Grid container spacing={2}>
                <Grid size={12}>
                  <InfoField label="Practitioner ID" value={fullPractitioner.id} />
                </Grid>
              </Grid>
            </Section>
          </>
        )}
      </Box>
    </Drawer>
  );
}

function PractitionerFormDrawer({ open, onClose, practitioner, onSaved }) {
  const isEdit = Boolean(practitioner);

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const createPractitioner = useCreatePractitioner();
  const updatePractitioner = useUpdatePractitioner();

  useEffect(() => {
    if (!open) return;

    setErrorMessage('');

    if (practitioner) {
      const user = getUser(practitioner);

      setForm({
        username: user.username || '',
        email: user.email || '',
        password: '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        gender: user.gender || '',
        practitionerNumber: practitioner.practitionerNumber || '',
        practitionerType: practitioner.practitionerType || '',
        professionalTitle: practitioner.professionalTitle || '',
        licenseNumber: practitioner.licenseNumber || '',
        registrationBody: practitioner.registrationBody || '',
        qualification: practitioner.qualification || '',
        specialty: practitioner.specialty || '',
        active: practitioner.active ?? true
      });
    } else {
      setForm({ ...EMPTY_FORM });
    }
  }, [practitioner, open]);

  const handleChange = (field) => (event) => {
    setForm((previous) => ({
      ...previous,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!form.username.trim() || !form.email.trim() || !form.firstName.trim() || !form.lastName.trim() || !form.practitionerType) {
      setErrorMessage('Username, email, first name, last name and practitioner type are required.');
      return;
    }

    if (!isEdit && !form.password) {
      setErrorMessage('A password is required when creating a new account.');
      return;
    }

    // Adapt this payload to your actual backend DTO.
    // Never send a raw User entity containing an unencoded password.
    const userPayload = {
      username: form.username.trim(),
      email: form.email.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phoneNumber: form.phoneNumber.trim() || null,
      gender: form.gender || null
    };

    if (form.password) {
      userPayload.password = form.password;
    }

    const practitionerPayload = {
      practitionerNumber: form.practitionerNumber.trim() || null,
      practitionerType: form.practitionerType,
      professionalTitle: form.professionalTitle.trim() || null,
      licenseNumber: form.licenseNumber.trim() || null,
      registrationBody: form.registrationBody.trim() || null,
      qualification: form.qualification.trim() || null,
      specialty: form.specialty.trim() || null,
      active: Boolean(form.active)
    };

    try {
      setSaving(true);

      if (isEdit) {
        await updatePractitioner.mutateAsync({
          id: getPractitionerId(practitioner),
          payload: {
            ...practitionerPayload,
            user: userPayload
          }
        });
      } else {
        await createPractitioner.mutateAsync({
          ...practitionerPayload,
          user: {
            ...userPayload,
            password: form.password
          }
        });
      }

      await onSaved?.();
      onClose();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, `Failed to ${isEdit ? 'update' : 'create'} practitioner.`));
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
          width: { xs: '100%', sm: 500 },
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
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h5" fontWeight={800}>
              {isEdit ? 'Edit Practitioner' : 'Add Practitioner'}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Account and professional information
            </Typography>
          </Box>

          <IconButton onClick={onClose} aria-label="Close form">
            <CloseOutlined />
          </IconButton>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {isEdit && (
          <Alert severity="info" sx={{ mb: 2 }}>
            The practitioner ID and practitioner number are not editable here.
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Stack spacing={2}>
          <Section title="User Account" defaultExpanded>
            <Stack spacing={2}>
              <TextField label="Username" value={form.username} onChange={handleChange('username')} required fullWidth />

              <TextField label="Email" type="email" value={form.email} onChange={handleChange('email')} required fullWidth />

              <TextField
                label={isEdit ? 'New Password (optional)' : 'Password'}
                type="password"
                value={form.password}
                onChange={handleChange('password')}
                required={!isEdit}
                autoComplete="new-password"
                fullWidth
                helperText={isEdit ? 'Leave blank to keep the existing password.' : 'The backend must securely hash this password.'}
              />

              <TextField label="First Name" value={form.firstName} onChange={handleChange('firstName')} required fullWidth />

              <TextField label="Last Name" value={form.lastName} onChange={handleChange('lastName')} required fullWidth />

              <TextField label="Phone Number" value={form.phoneNumber} onChange={handleChange('phoneNumber')} fullWidth />

              <FormControl fullWidth>
                <InputLabel id="practitioner-gender-label">Gender</InputLabel>

                <Select labelId="practitioner-gender-label" label="Gender" value={form.gender} onChange={handleChange('gender')}>
                  <MenuItem value="">
                    <em>Not specified</em>
                  </MenuItem>

                  {GENDER_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Section>

          <Section title="Professional Information" defaultExpanded>
            <Stack spacing={2}>
              <TextField
                label="Practitioner Number"
                value={form.practitionerNumber}
                onChange={handleChange('practitionerNumber')}
                fullWidth
                disabled={isEdit}
                helperText={isEdit ? 'Practitioner number cannot be edited.' : 'Leave blank if generated by the backend.'}
              />

              <FormControl fullWidth required>
                <InputLabel id="practitioner-type-label">Practitioner Type</InputLabel>

                <Select
                  labelId="practitioner-type-label"
                  label="Practitioner Type"
                  value={form.practitionerType}
                  onChange={handleChange('practitionerType')}
                >
                  {PRACTITIONER_TYPE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField label="Professional Title" value={form.professionalTitle} onChange={handleChange('professionalTitle')} fullWidth />

              <TextField label="Specialty" value={form.specialty} onChange={handleChange('specialty')} fullWidth />

              <TextField label="Qualification" value={form.qualification} onChange={handleChange('qualification')} fullWidth />

              <TextField label="License Number" value={form.licenseNumber} onChange={handleChange('licenseNumber')} fullWidth />

              <TextField label="Registration Body" value={form.registrationBody} onChange={handleChange('registrationBody')} fullWidth />

              <FormControl fullWidth>
                <InputLabel id="practitioner-active-label">Status</InputLabel>

                <Select
                  labelId="practitioner-active-label"
                  label="Status"
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
            </Stack>
          </Section>
        </Stack>

        <Box sx={{ flex: 1, minHeight: 24 }} />

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button variant="outlined" color="inherit" onClick={onClose} disabled={saving}>
            Cancel
          </Button>

          <Button
            variant="contained"
            type="submit"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Practitioner'}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}

export default function PractitionersPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');

  const [selectedPractitioner, setSelectedPractitioner] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formPractitioner, setFormPractitioner] = useState(null);
  const [actionError, setActionError] = useState('');

  const { practitioners = [], totalElements = 0, isLoading, isError, mutate } = usePractitioners({ page, size });

  const deletePractitioner = useDeletePractitioner();

  const visiblePractitioners = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return practitioners;

    return practitioners.filter((practitioner) => {
      const user = getUser(practitioner);

      const searchable = [
        practitioner.practitionerNumber,
        practitioner.practitionerType,
        practitioner.specialty,
        practitioner.licenseNumber,
        user.firstName,
        user.lastName,
        user.email,
        user.username
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [practitioners, search]);

  const stats = useMemo(
    () => ({
      total: totalElements,
      active: practitioners.filter((p) => p.active).length,
      inactive: practitioners.filter((p) => !p.active).length,
      doctors: practitioners.filter((p) => p.practitionerType === 'DOCTOR').length,
      licensed: practitioners.filter((p) => Boolean(p.licenseNumber)).length
    }),
    [practitioners, totalElements]
  );

  const handleView = (practitioner) => {
    setSelectedPractitioner(practitioner);
    setDetailsOpen(true);
  };

  const handleAdd = () => {
    setFormPractitioner(null);
    setFormOpen(true);
  };

  const handleEdit = (practitioner) => {
    setFormPractitioner(practitioner);
    setDetailsOpen(false);
    setFormOpen(true);
  };

  const handleDelete = async (practitioner) => {
    const confirmed = window.confirm(`Deactivate ${getFullName(practitioner) || 'this practitioner'}?`);

    if (!confirmed) return;

    try {
      setActionError('');

      await deletePractitioner.mutateAsync(getPractitionerId(practitioner));

      await mutate();

      if (getPractitionerId(selectedPractitioner) === getPractitionerId(practitioner)) {
        setDetailsOpen(false);
        setSelectedPractitioner(null);
      }
    } catch (error) {
      setActionError(getErrorMessage(error, 'Failed to deactivate practitioner.'));
    }
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
            Practitioners
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Manage healthcare professionals and their credentials.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<ReloadOutlined />} onClick={() => mutate()}>
            Refresh
          </Button>

          <Button variant="contained" startIcon={<UserAddOutlined />} onClick={handleAdd}>
            Add Practitioner
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
          Failed to load practitioners. Please refresh and try again.
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 4, lg: 2.4 }}>
          <StatCard label="Total Practitioners" value={stats.total} color="primary.main" />
        </Grid>

        <Grid size={{ xs: 6, sm: 4, lg: 2.4 }}>
          <StatCard label="Active" value={stats.active} color="success.main" description="On this page" />
        </Grid>

        <Grid size={{ xs: 6, sm: 4, lg: 2.4 }}>
          <StatCard label="Inactive" value={stats.inactive} color="text.secondary" description="On this page" />
        </Grid>

        <Grid size={{ xs: 6, sm: 4, lg: 2.4 }}>
          <StatCard label="Doctors" value={stats.doctors} color="#2563eb" description="On this page" />
        </Grid>

        <Grid size={{ xs: 6, sm: 4, lg: 2.4 }}>
          <StatCard label="With License" value={stats.licensed} color="#9333ea" description="On this page" />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 2, minWidth: 0 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by practitioner number, name, type or specialty..."
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
                px: { xs: 0.5, sm: 1.5 },
                py: 1.5,
                overflowWrap: 'anywhere'
              }
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '20%' }}>Practitioner No.</TableCell>

                <TableCell sx={{ width: '23%' }}>Name</TableCell>

                <TableCell sx={{ width: '20%', display: { xs: 'none', sm: 'table-cell' } }}>Type</TableCell>

                <TableCell sx={{ width: '19%', display: { xs: 'none', md: 'table-cell' } }}>Specialty</TableCell>

                <TableCell sx={{ width: '12%', display: { xs: 'none', sm: 'table-cell' } }}>Status</TableCell>

                <TableCell align="right" sx={{ width: { xs: '57%', sm: '26%', md: '18%' } }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={28} />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Loading practitioners...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : visiblePractitioners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">
                      {search ? 'No matching practitioners on this page.' : 'No practitioners registered yet.'}
                    </Typography>

                    {!search && (
                      <Button sx={{ mt: 1 }} startIcon={<UserAddOutlined />} onClick={handleAdd}>
                        Add first practitioner
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                visiblePractitioners.map((practitioner) => (
                  <TableRow key={getPractitionerId(practitioner)} hover onClick={() => handleView(practitioner)} sx={{ cursor: 'pointer' }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="primary.main">
                        {practitioner.practitionerNumber || '—'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {getFullName(practitioner) || '—'}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{formatValue(practitioner.practitionerType)}</TableCell>

                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{formatValue(practitioner.specialty)}</TableCell>

                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Chip
                        size="small"
                        label={practitioner.active ? 'Active' : 'Inactive'}
                        color={practitioner.active ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                      <Tooltip title="View details">
                        <IconButton size="small" onClick={() => handleView(practitioner)}>
                          <EyeOutlined />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Edit practitioner">
                        <IconButton size="small" onClick={() => handleEdit(practitioner)}>
                          <EditOutlined />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Deactivate practitioner">
                        <IconButton size="small" color="error" onClick={() => handleDelete(practitioner)}>
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

      <PractitionerDetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        practitioner={selectedPractitioner}
        onEdit={() => handleEdit(selectedPractitioner)}
      />

      <PractitionerFormDrawer open={formOpen} onClose={() => setFormOpen(false)} practitioner={formPractitioner} onSaved={() => mutate()} />
    </Box>
  );
}
