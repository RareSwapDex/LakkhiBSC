import React, { useState, useEffect } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import axios from 'axios';

const CampaignUpdates = ({ campaign, onUpdate }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (!campaign.updates) {
      campaign.updates = [];
    }
  }, [campaign]);

  const handleOpenDialog = (type, data = null) => {
    setDialogType(type);
    setFormData(data || {});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData(null);
    setSelectedImage(null);
    setSelectedFile(null);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFormData(prev => ({
        ...prev,
        attachment: file
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'image' || key === 'attachment') {
          if (formData[key]) {
            formDataToSend.append(key, formData[key]);
          }
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      switch (dialogType) {
        case 'add':
          await axios.post(`/api/campaigns/${campaign.id}/updates/`, formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          setSuccess('Update added successfully');
          onUpdate();
          break;
        case 'edit':
          await axios.patch(`/api/campaigns/${campaign.id}/updates/${formData.id}/`, formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          setSuccess('Update edited successfully');
          onUpdate();
          break;
        case 'delete':
          await axios.delete(`/api/campaigns/${campaign.id}/updates/${formData.id}/`);
          setSuccess('Update deleted successfully');
          onUpdate();
          break;
        default:
          break;
      }
      handleCloseDialog();
    } catch (err) {
      console.error('Error submitting update:', err);
      setError(err.response?.data?.detail || err.message || 'Operation failed');
    }
  };

  const renderDialog = () => {
    switch (dialogType) {
      case 'add':
      case 'edit':
        return (
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
            <DialogTitle>
              {dialogType === 'add' ? 'Add Update' : 'Edit Update'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    multiline
                    rows={4}
                    label="Content"
                    value={formData.content || ''}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    component="label"
                    startIcon={<ImageIcon />}
                  >
                    Add Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Button>
                  {selectedImage && (
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      {selectedImage.name}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    component="label"
                    startIcon={<AttachFileIcon />}
                  >
                    Add Attachment
                    <input
                      type="file"
                      hidden
                      onChange={handleFileChange}
                    />
                  </Button>
                  {selectedFile && (
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      {selectedFile.name}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleSubmit} variant="contained" color="primary">
                {dialogType === 'add' ? 'Add Update' : 'Save Changes'}
              </Button>
            </DialogActions>
          </Dialog>
        );
      
      case 'delete':
        return (
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <DialogTitle>Delete Update</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete this update? This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleSubmit} variant="contained" color="error">
                Delete
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
          <Typography variant="h6">
            Campaign Updates
          </Typography>
          {campaign.is_owner && (
            <Button
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('add')}
              variant="outlined"
            >
              Add Update
            </Button>
          )}
        </Box>

        <List>
          {campaign.updates?.length > 0 ? (
            campaign.updates.map((update, index) => (
              <React.Fragment key={update.id}>
                <ListItem
                  secondaryAction={
                    campaign.is_owner && (
                      <Box>
                        <Tooltip title="Edit">
                          <IconButton
                            edge="end"
                            onClick={() => handleOpenDialog('edit', update)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            edge="end"
                            onClick={() => handleOpenDialog('delete', update)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      <ImageIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">
                          {update.title}
                        </Typography>
                        <Chip
                          label={new Date(update.created_at).toLocaleDateString()}
                          size="small"
                          color="default"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {update.content}
                        </Typography>
                        {update.image && (
                          <Box sx={{ mb: 1 }}>
                            <img
                              src={update.image}
                              alt={update.title}
                              style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                            />
                          </Box>
                        )}
                        {update.attachment && (
                          <Button
                            size="small"
                            startIcon={<AttachFileIcon />}
                            href={update.attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Attachment
                          </Button>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < campaign.updates.length - 1 && <Divider />}
              </React.Fragment>
            ))
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No updates have been posted yet.
              </Typography>
              {campaign.is_owner && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('add')}
                  sx={{ mt: 2 }}
                >
                  Add First Update
                </Button>
              )}
            </Box>
          )}
        </List>
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

export default CampaignUpdates; 