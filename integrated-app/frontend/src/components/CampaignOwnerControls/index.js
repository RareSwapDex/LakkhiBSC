import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Divider,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import axios from 'axios';

const CampaignOwnerControls = ({ campaign, onUpdate }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState(null);

  const handleOpenDialog = (type, data = null) => {
    setDialogType(type);
    setFormData(data || {});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData(null);
  };

  const handleSubmit = async () => {
    try {
      switch (dialogType) {
        case 'edit':
          await axios.patch(`/api/campaigns/${campaign.id}/`, formData);
          setSuccess('Campaign updated successfully');
          onUpdate();
          break;
        case 'milestone':
          await axios.post(`/api/campaigns/${campaign.id}/milestones/`, formData);
          setSuccess('Milestone added successfully');
          onUpdate();
          break;
        case 'release':
          await axios.post(`/api/campaigns/${campaign.id}/releases/`, formData);
          setSuccess('Funds release request submitted successfully');
          onUpdate();
          break;
        default:
          break;
      }
      handleCloseDialog();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`/api/campaigns/${campaign.id}/export/`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `campaign-${campaign.id}-report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export campaign report');
    }
  };

  const renderDialog = () => {
    switch (dialogType) {
      case 'edit':
        return (
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
            <DialogTitle>Edit Campaign</DialogTitle>
            <DialogContent>
              {campaign.is_contract_owner && !campaign.is_owner && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  As the contract owner, you can edit campaign details but not core token information.
                </Alert>
              )}
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="End Date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleSubmit} variant="contained" color="primary">
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>
        );
      
      case 'milestone':
        return (
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
            <DialogTitle>Add Milestone</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    InputProps={{
                      startAdornment: '$',
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Release Date"
                    value={formData.release_date}
                    onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleSubmit} variant="contained" color="primary">
                Add Milestone
              </Button>
            </DialogActions>
          </Dialog>
        );
      
      case 'release':
        return (
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <DialogTitle>Release Funds</DialogTitle>
            <DialogContent>
              {campaign.is_owner && !campaign.is_contract_owner && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Your release request will need to be approved by the contract owner wallet.
                </Alert>
              )}
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Amount to Release"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    InputProps={{
                      startAdornment: '$',
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Release Notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleSubmit} variant="contained" color="primary">
                {campaign.is_contract_owner ? 'Release Funds' : 'Request Fund Release'}
              </Button>
            </DialogActions>
          </Dialog>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              Campaign Management
              {campaign.is_owner && (
                <Chip 
                  label="Campaign Creator" 
                  size="small" 
                  color="primary" 
                  sx={{ ml: 1 }} 
                />
              )}
              {campaign.is_contract_owner && (
                <Chip 
                  label="Contract Owner" 
                  size="small" 
                  color="secondary" 
                  icon={<AccountBalanceWalletIcon fontSize="small" />}
                  sx={{ ml: 1 }} 
                />
              )}
            </Typography>
            {campaign.contract_owner && (
              <Typography variant="caption" color="text.secondary">
                Contract Owner: {campaign.contract_owner.slice(0,6)}...{campaign.contract_owner.slice(-4)}
              </Typography>
            )}
          </Box>
          <Button
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            variant="outlined"
          >
            Export Report
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              startIcon={<EditIcon />}
              onClick={() => handleOpenDialog('edit', campaign)}
              variant="outlined"
            >
              Edit Campaign
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('milestone')}
              variant="outlined"
            >
              Add Milestone
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              startIcon={<DeleteIcon />}
              onClick={() => handleOpenDialog('release')}
              variant="outlined"
              color="primary"
            >
              {campaign.is_contract_owner ? 'Release Funds' : 'Request Fund Release'}
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" gutterBottom>
          Recent Actions
        </Typography>
        <Grid container spacing={2}>
          {campaign.recent_actions?.map((action, index) => (
            <Grid item xs={12} key={index}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {new Date(action.timestamp).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  {action.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {renderDialog()}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CampaignOwnerControls; 