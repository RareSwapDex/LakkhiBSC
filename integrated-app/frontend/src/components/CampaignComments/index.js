import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import axios from 'axios';

const CampaignComments = ({ campaign, onUpdate }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [editingComment, setEditingComment] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [campaign.id]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/campaigns/${campaign.id}/comments/`);
      setComments(response.data);
    } catch (err) {
      setError('Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(`/api/campaigns/${campaign.id}/comments/`, {
        content: newComment,
      });
      setComments([response.data, ...comments]);
      setNewComment('');
      setSuccess('Comment added successfully');
    } catch (err) {
      setError('Failed to add comment');
    }
  };

  const handleMenuOpen = (event, comment) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedComment(null);
  };

  const handleEdit = () => {
    setEditingComment(selectedComment);
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/campaigns/${campaign.id}/comments/${selectedComment.id}/`);
      setComments(comments.filter(c => c.id !== selectedComment.id));
      setSuccess('Comment deleted successfully');
      handleMenuClose();
    } catch (err) {
      setError('Failed to delete comment');
    }
  };

  const handleReport = async () => {
    try {
      await axios.post(`/api/campaigns/${campaign.id}/comments/${selectedComment.id}/report/`);
      setSuccess('Comment reported successfully');
      handleMenuClose();
    } catch (err) {
      setError('Failed to report comment');
    }
  };

  const handleUpdateComment = async () => {
    try {
      const response = await axios.patch(
        `/api/campaigns/${campaign.id}/comments/${editingComment.id}/`,
        { content: editingComment.content }
      );
      setComments(comments.map(c => c.id === editingComment.id ? response.data : c));
      setEditingComment(null);
      setSuccess('Comment updated successfully');
    } catch (err) {
      setError('Failed to update comment');
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Comments & Discussions
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            disabled={!newComment.trim()}
          >
            Post Comment
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {comments.map((comment, index) => (
              <React.Fragment key={comment.id}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <Tooltip title="More options">
                        <IconButton
                          edge="end"
                          onClick={(e) => handleMenuOpen(e, comment)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemAvatar>
                    <Avatar src={comment.user.avatar}>
                      {comment.user.name[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">
                          {comment.user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(comment.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      editingComment?.id === comment.id ? (
                        <Box sx={{ mt: 1 }}>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            value={editingComment.content}
                            onChange={(e) => setEditingComment({
                              ...editingComment,
                              content: e.target.value
                            })}
                            sx={{ mb: 1 }}
                          />
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              onClick={() => setEditingComment(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={handleUpdateComment}
                            >
                              Save
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {comment.content}
                        </Typography>
                      )
                    }
                  />
                </ListItem>
                {index < comments.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedComment?.user.id === campaign.current_user?.id ? (
          <>
            <MenuItem onClick={handleEdit}>
              <EditIcon sx={{ mr: 1 }} /> Edit
            </MenuItem>
            <MenuItem onClick={handleDelete}>
              <DeleteIcon sx={{ mr: 1 }} /> Delete
            </MenuItem>
          </>
        ) : (
          <MenuItem onClick={handleReport}>
            <FlagIcon sx={{ mr: 1 }} /> Report
          </MenuItem>
        )}
      </Menu>

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

export default CampaignComments; 