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

import { useOnboardStaff, useUsers, useUpdateUser, useDeleteUser, useUser } from '../../hooks/useUsers';

const USER_STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
const USER_ROLES = ['DOCTOR', 'HOSPITAL_ADMIN', 'ADMIN'];

const EMPTY_FORM = {
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
  userRole: 'DOCTOR',
  status: 'ACTIVE'
};

function getUserId(user) {
  return user?.id || user?.userId;
}

function getFullName(user) {
  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || user?.name || 'Unknown User';
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

function getInitials(user) {
  const name = getFullName(user);
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

function getUsersFromPage(payload) {
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
    case 'SUSPENDED':
      return 'error';
    default:
      return 'default';
  }
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

function UserDetailsDrawer({ open, onClose, user, onEdit }) {
  const userId = getUserId(user);
  const { data: userDetails } = useUser ? useUser(userId) : { data: null };
  const fullUser = userDetails || user;

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
              User Details
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Account and role configuration
            </Typography>
          </Box>

          <IconButton onClick={onClose} aria-label="Close drawer">
            <CloseOutlined />
          </IconButton>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {!fullUser ? (
          <Alert severity="info">Select a user to view their details.</Alert>
        ) : (
          <>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ width: 56, height: 56 }}>{getInitials(fullUser)}</Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h6" fontWeight={800}>
                    {getFullName(fullUser)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    @{fullUser.username || 'no-username'}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip size="small" label={fullUser.status || 'UNKNOWN'} color={getStatusColor(fullUser.status)} />
                    <Chip size="small" variant="outlined" label={fullUser.userRole || fullUser.role || 'USER'} />
                  </Stack>
                </Box>
              </Stack>

              <Button fullWidth variant="contained" startIcon={<EditOutlined />} sx={{ mt: 2 }} onClick={onEdit}>
                Edit User
              </Button>
            </Paper>

            <Section title="Account Information" defaultExpanded>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <InfoField label="Username" value={fullUser.username} />
                </Grid>

                <Grid item xs={6}>
                  <InfoField label="Role" value={fullUser.userRole || fullUser.role} />
                </Grid>

                <Grid item xs={12}>
                  <InfoField label="Email" value={fullUser.email} />
                </Grid>

                <Grid item xs={12}>
                  <InfoField label="Phone Number" value={fullUser.phoneNumber || fullUser.phone} />
                </Grid>

                <Grid item xs={6}>
                  <InfoField label="First Name" value={fullUser.firstName} />
                </Grid>

                <Grid item xs={6}>
                  <InfoField label="Last Name" value={fullUser.lastName} />
                </Grid>

                <Grid item xs={6}>
                  <InfoField label="Status" value={fullUser.status} />
                </Grid>

                <Grid item xs={6}>
                  <InfoField label="Created At" value={fullUser.createdAt ? new Date(fullUser.createdAt).toLocaleString() : null} />
                </Grid>
              </Grid>
            </Section>

            <Section title="System Record">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <InfoField label="User ID" value={getUserId(fullUser)} />
                </Grid>
              </Grid>
            </Section>
          </>
        )}
      </Box>
    </Drawer>
  );
}

function UserFormDrawer({ open, onClose, user, onSaved }) {
  const isEdit = Boolean(user);

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onboardStaff = useOnboardStaff();
  const updateUser = useUpdateUser ? useUpdateUser() : { mutateAsync: async () => {} };

  useEffect(() => {
    if (!open) return;
    setErrorMessage('');

    if (user) {
      setForm({
        username: user.username || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || user.phone || '',
        password: '',
        userRole: user.userRole || user.role || 'DOCTOR',
        status: user.status || 'ACTIVE'
      });
    } else {
      setForm({ ...EMPTY_FORM });
    }
  }, [user, open]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setErrorMessage('First name, last name, and email are required.');
      return;
    }

    if (!isEdit && (!form.username.trim() || !form.password)) {
      setErrorMessage('Username and temporary password are required for new users.');
      return;
    }

    try {
      setSaving(true);

      if (isEdit) {
        await updateUser.mutateAsync({
          id: getUserId(user),
          payload: {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim(),
            phoneNumber: form.phoneNumber.trim() || null,
            userRole: form.userRole,
            status: form.status
          }
        });
      } else {
        await onboardStaff.mutateAsync(form);
      }

      await onSaved?.();
      onClose();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, `Failed to ${isEdit ? 'update' : 'create'} user.`));
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
              {isEdit ? 'Edit User' : 'Add User'}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Staff onboarding and account details
            </Typography>
          </Box>

          <IconButton onClick={onClose} aria-label="Close form">
            <CloseOutlined />
          </IconButton>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {isEdit && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Username and user ID are system-managed and cannot be edited.
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Stack spacing={2}>
          <Section title="User Credentials" defaultExpanded>
            <Stack spacing={2}>
              <TextField label="Username" value={form.username} onChange={handleChange('username')} required fullWidth disabled={isEdit} />

              {!isEdit && (
                <TextField
                  label="Temporary Password"
                  type="password"
                  value={form.password}
                  onChange={handleChange('password')}
                  required
                  fullWidth
                />
              )}

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label="First Name" value={form.firstName} onChange={handleChange('firstName')} required fullWidth />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField label="Last Name" value={form.lastName} onChange={handleChange('lastName')} required fullWidth />
                </Grid>
              </Grid>

              <TextField label="Email" type="email" value={form.email} onChange={handleChange('email')} required fullWidth />

              <TextField label="Phone Number" value={form.phoneNumber} onChange={handleChange('phoneNumber')} fullWidth />

              <FormControl fullWidth required>
                <InputLabel>User Role</InputLabel>
                <Select value={form.userRole} label="User Role" onChange={handleChange('userRole')}>
                  {USER_ROLES.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {isEdit && (
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={form.status} label="Status" onChange={handleChange('status')}>
                    {USER_STATUSES.map((st) => (
                      <MenuItem key={st} value={st}>
                        {st}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
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
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Save User'}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}

export default function UsersPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formUser, setFormUser] = useState(null);
  const [actionError, setActionError] = useState('');

  const queryParams = useMemo(
    () => ({
      page,
      size,
      sort: 'createdAt,desc',
      ...(status ? { status } : {})
    }),
    [page, size, status]
  );

  const { data, isLoading, isError, error, refetch, isFetching } = useUsers(queryParams);
  const deleteUser = useDeleteUser ? useDeleteUser() : { mutateAsync: async () => {} };

  const users = getUsersFromPage(data);
  const totalElements = getTotalElements(data);

  const visibleUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) => {
      const searchable = [user.username, user.firstName, user.lastName, user.email, user.phoneNumber, user.userRole, user.status]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [users, search]);

  const stats = useMemo(
    () => ({
      total: totalElements,
      active: users.filter((u) => u.status === 'ACTIVE').length,
      inactive: users.filter((u) => u.status === 'INACTIVE').length,
      suspended: users.filter((u) => u.status === 'SUSPENDED').length,
      doctors: users.filter((u) => (u.userRole || u.role) === 'DOCTOR').length
    }),
    [users, totalElements]
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setSize(Number(event.target.value));
    setPage(0);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(0);
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  const handleAdd = () => {
    setFormUser(null);
    setFormOpen(true);
  };

  const handleEdit = (user) => {
    setFormUser(user);
    setDetailsOpen(false);
    setFormOpen(true);
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(`Deactivate ${getFullName(user)}?`);
    if (!confirmed) return;

    try {
      setActionError('');
      await deleteUser.mutateAsync(getUserId(user));
      await refetch();

      if (getUserId(selectedUser) === getUserId(user)) {
        setDetailsOpen(false);
        setSelectedUser(null);
      }
    } catch (err) {
      setActionError(getErrorMessage(err, 'Failed to delete or deactivate user.'));
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
            Users
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View system users and onboard hospital staff.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<ReloadOutlined />} onClick={() => refetch()} disabled={isFetching}>
            Refresh
          </Button>

          <Button variant="contained" startIcon={<UserAddOutlined />} onClick={handleAdd}>
            Add User
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
          {error?.response?.data?.message || 'Failed to load users.'}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} lg={2.4}>
          <StatCard label="Total Users" value={stats.total} color="primary.main" />
        </Grid>
        <Grid item xs={6} sm={4} lg={2.4}>
          <StatCard label="Active" value={stats.active} color="success.main" description="On this page" />
        </Grid>
        <Grid item xs={6} sm={4} lg={2.4}>
          <StatCard label="Inactive" value={stats.inactive} color="text.secondary" description="On this page" />
        </Grid>
        <Grid item xs={6} sm={4} lg={2.4}>
          <StatCard label="Suspended" value={stats.suspended} color="error.main" description="On this page" />
        </Grid>
        <Grid item xs={6} sm={4} lg={2.4}>
          <StatCard label="Doctors" value={stats.doctors} color="#2563eb" description="On this page" />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 2, minWidth: 0, mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by username, name, email, role or phone..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={status} label="Status" onChange={handleStatusChange}>
                  <MenuItem value="">All Statuses</MenuItem>
                  {USER_STATUSES.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        <TableContainer sx={{ width: '100%' }}>
          <Table size="small" sx={{ width: '100%', tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '22%' }}>User</TableCell>
                <TableCell sx={{ width: '22%' }}>Email</TableCell>
                <TableCell sx={{ width: '15%' }}>Phone</TableCell>
                <TableCell sx={{ width: '13%' }}>Role</TableCell>
                <TableCell sx={{ width: '13%' }}>Status</TableCell>
                <TableCell align="right" sx={{ width: '15%' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Loading users...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : visibleUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      No users found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                visibleUsers.map((user) => {
                  const userId = getUserId(user);

                  return (
                    <TableRow
                      key={userId}
                      hover
                      sx={{ cursor: 'pointer', '&:last-child td': { border: 0 } }}
                      onClick={() => handleView(user)}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem' }}>{getInitials(user)}</Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {getFullName(user)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap display="block">
                              @{user.username || '—'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {user.email || '—'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {user.phoneNumber || user.phone || '—'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip size="small" label={user.userRole || user.role || 'UNKNOWN'} variant="outlined" />
                      </TableCell>

                      <TableCell>
                        <Chip size="small" label={user.status || 'UNKNOWN'} color={getStatusColor(user.status)} />
                      </TableCell>

                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleView(user)}>
                              <EyeOutlined />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit User">
                            <IconButton size="small" onClick={() => handleEdit(user)}>
                              <EditOutlined />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Deactivate / Delete">
                            <IconButton size="small" color="error" onClick={() => handleDelete(user)}>
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
          onPageChange={handleChangePage}
          rowsPerPage={size}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 20, 50]}
        />
      </Paper>

      <UserDetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        user={selectedUser}
        onEdit={() => handleEdit(selectedUser)}
      />

      <UserFormDrawer open={formOpen} onClose={() => setFormOpen(false)} user={formUser} onSaved={() => refetch()} />
    </Box>
  );
}
