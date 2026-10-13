import { useMemo, useState } from 'react';

// material-ui
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
  Typography
} from '@mui/material';

// icons
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import LinkOutlined from '@ant-design/icons/LinkOutlined';
import ReloadOutlined from '@ant-design/icons/ReloadOutlined';

// hooks
import {
  useDeleteHospitalAdmin,
  useHospitalAdmins,
  useLinkHospitalAdminToHospital,
  useUpdateHospitalAdmin
} from '../../hooks/useHospitalAdmins';
import { useHospitals } from '../../hooks/useObservations';

function getAdminId(admin) {
  return admin?.id || admin?.adminId || admin?.userId || admin?.user?.id;
}

function getUserId(admin) {
  return admin?.userId || admin?.user?.id || admin?.id;
}

function getName(admin) {
  const user = admin?.user;

  return admin?.fullName || user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || admin?.name || 'Hospital Admin';
}

function getEmail(admin) {
  return admin?.email || admin?.user?.email || 'No email';
}

function getPhone(admin) {
  return admin?.phoneNumber || admin?.phone || admin?.user?.phoneNumber || 'Not provided';
}

function getInitials(name) {
  return name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getHospitals(admin) {
  if (Array.isArray(admin?.hospitals)) return admin.hospitals;
  if (admin?.hospital) return [admin.hospital];
  return [];
}

function getHospitalName(hospital) {
  return hospital?.name || hospital?.hospitalName || 'Hospital';
}

function HospitalAdminDetailsDrawer({ open, onClose, admin, onEdit }) {
  const hospitals = getHospitals(admin);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 430, p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Typography variant="h5" fontWeight={700}>
            Admin Details
          </Typography>

          <Button size="small" variant="outlined" onClick={onEdit}>
            Edit
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {!admin ? (
          <Alert severity="info">Select a hospital admin to view details.</Alert>
        ) : (
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 56, height: 56 }}>{getInitials(getName(admin))}</Avatar>

              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {getName(admin)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getEmail(admin)}
                </Typography>
              </Box>
            </Stack>

            <Divider />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Phone Number
                </Typography>
                <Typography fontWeight={600}>{getPhone(admin)}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Job Title
                </Typography>
                <Typography fontWeight={600}>{admin?.jobTitle || admin?.position || 'Not provided'}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Department
                </Typography>
                <Typography fontWeight={600}>{admin?.department || 'Not provided'}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Employee Number
                </Typography>
                <Typography fontWeight={600}>{admin?.employeeNumber || admin?.staffId || 'Not provided'}</Typography>
              </Grid>
            </Grid>

            <Divider />

            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Linked Hospitals
              </Typography>

              {hospitals.length === 0 ? (
                <Alert severity="warning">This admin is not linked to any hospital.</Alert>
              ) : (
                <Stack spacing={1}>
                  {hospitals.map((hospital) => (
                    <Paper key={hospital.id} variant="outlined" sx={{ p: 1.5 }}>
                      <Typography fontWeight={600}>{getHospitalName(hospital)}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {hospital?.address?.district || hospital?.location || 'No location'}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}

function HospitalAdminEditDrawer({ open, onClose, admin, actorId, onSaved }) {
  const [form, setForm] = useState({
    phoneNumber: '',
    jobTitle: '',
    department: '',
    employeeNumber: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const updateHospitalAdmin = useUpdateHospitalAdmin();

  useMemo(() => {
    if (!admin) return;

    setForm({
      phoneNumber: admin?.phoneNumber || admin?.phone || '',
      jobTitle: admin?.jobTitle || admin?.position || '',
      department: admin?.department || '',
      employeeNumber: admin?.employeeNumber || admin?.staffId || ''
    });
  }, [admin]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async () => {
    if (!admin) return;

    try {
      setSaving(true);
      setError('');

      const payload = {
        phoneNumber: form.phoneNumber,
        jobTitle: form.jobTitle,
        department: form.department,
        employeeNumber: form.employeeNumber
      };

      await updateHospitalAdmin.mutateAsync({ userId: getUserId(admin), payload, actorId });
      await onSaved?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update hospital admin profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 430, p: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Edit Hospital Admin
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Update hospital admin profile information.
        </Typography>

        <Divider sx={{ my: 2 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2}>
          <TextField label="Phone Number" value={form.phoneNumber} onChange={handleChange('phoneNumber')} fullWidth />

          <TextField label="Job Title" value={form.jobTitle} onChange={handleChange('jobTitle')} fullWidth />

          <TextField label="Department" value={form.department} onChange={handleChange('department')} fullWidth />

          <TextField label="Employee Number" value={form.employeeNumber} onChange={handleChange('employeeNumber')} fullWidth />

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
}

function LinkHospitalDrawer({ open, onClose, admin, onSaved }) {
  const { hospitals = [], isLoading } = useHospitals?.() || {};

  const [hospitalId, setHospitalId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const linkHospitalAdminToHospital = useLinkHospitalAdminToHospital();

  const linkedHospitalIds = getHospitals(admin).map((hospital) => hospital.id);

  const availableHospitals = hospitals.filter((hospital) => !linkedHospitalIds.includes(hospital.id));

  const handleLink = async () => {
    if (!admin || !hospitalId) return;

    try {
      setSaving(true);
      setError('');

      await linkHospitalAdminToHospital.mutateAsync({ userId: getUserId(admin), hospitalId });
      await onSaved?.();

      setHospitalId('');
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to link admin to hospital.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 430, p: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Link Admin to Hospital
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Assign {admin ? getName(admin) : 'admin'} to a hospital.
        </Typography>

        <Divider sx={{ my: 2 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Hospital</InputLabel>
            <Select label="Hospital" value={hospitalId} onChange={(event) => setHospitalId(event.target.value)} disabled={isLoading}>
              {availableHospitals.map((hospital) => (
                <MenuItem key={hospital.id} value={hospital.id}>
                  {getHospitalName(hospital)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {availableHospitals.length === 0 && (
            <Alert severity="info">No available hospital found or this admin is already linked to all listed hospitals.</Alert>
          )}

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="contained" onClick={handleLink} disabled={!hospitalId || saving}>
              {saving ? 'Linking...' : 'Link Hospital'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
}

export default function HospitalAdminsPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const { admins, totalElements, isLoading, isError, mutate } = useHospitalAdmins({ page, size });

  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [actionError, setActionError] = useState('');
  const deleteHospitalAdmin = useDeleteHospitalAdmin();

  // Replace this with your real logged-in user id from auth context.
  const actorId = localStorage.getItem('userId');

  const handleView = (admin) => {
    setSelectedAdmin(admin);
    setDetailsOpen(true);
  };

  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setEditOpen(true);
  };

  const handleLink = (admin) => {
    setSelectedAdmin(admin);
    setLinkOpen(true);
  };

  const handleDelete = async (admin) => {
    const confirmed = window.confirm('Delete this hospital admin profile?');
    if (!confirmed) return;

    try {
      setActionError('');
      await deleteHospitalAdmin.mutateAsync(getUserId(admin));
      await mutate();
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Failed to delete hospital admin profile.');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Hospital Admins
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage hospital administrators, hospital assignment, and administrative profiles.
          </Typography>
        </Box>

        <Button variant="outlined" startIcon={<ReloadOutlined />} onClick={() => mutate()}>
          Refresh
        </Button>
      </Stack>

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load hospital admins.
        </Alert>
      )}

      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Admin</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Job Title</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Hospitals</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Stack alignItems="center" sx={{ py: 5 }}>
                      <CircularProgress size={28} />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Loading hospital admins...
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Alert severity="info">No hospital admins found.</Alert>
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => {
                  const name = getName(admin);
                  const hospitals = getHospitals(admin);

                  return (
                    <TableRow key={getAdminId(admin)} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar>{getInitials(name)}</Avatar>
                          <Box>
                            <Typography fontWeight={700}>{name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {getEmail(admin)}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>{getPhone(admin)}</TableCell>

                      <TableCell>{admin?.jobTitle || admin?.position || 'Not provided'}</TableCell>

                      <TableCell>{admin?.department || 'Not provided'}</TableCell>

                      <TableCell>
                        {hospitals.length === 0 ? (
                          <Chip label="Not linked" size="small" />
                        ) : (
                          <Stack spacing={0.5}>
                            {hospitals.slice(0, 2).map((hospital) => (
                              <Chip key={hospital.id} label={getHospitalName(hospital)} size="small" color="primary" variant="outlined" />
                            ))}

                            {hospitals.length > 2 && (
                              <Typography variant="caption" color="text.secondary">
                                +{hospitals.length - 2} more
                              </Typography>
                            )}
                          </Stack>
                        )}
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="View">
                          <IconButton onClick={() => handleView(admin)}>
                            <EyeOutlined />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEdit(admin)}>
                            <EditOutlined />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Link hospital">
                          <IconButton onClick={() => handleLink(admin)}>
                            <LinkOutlined />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete">
                          <IconButton color="error" onClick={() => handleDelete(admin)}>
                            <DeleteOutlined />
                          </IconButton>
                        </Tooltip>
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
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={size}
          onRowsPerPageChange={(event) => {
            setSize(Number(event.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      <HospitalAdminDetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        admin={selectedAdmin}
        onEdit={() => {
          setDetailsOpen(false);
          setEditOpen(true);
        }}
      />

      <HospitalAdminEditDrawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        admin={selectedAdmin}
        actorId={actorId}
        onSaved={mutate}
      />

      <LinkHospitalDrawer open={linkOpen} onClose={() => setLinkOpen(false)} admin={selectedAdmin} onSaved={mutate} />
    </Box>
  );
}
