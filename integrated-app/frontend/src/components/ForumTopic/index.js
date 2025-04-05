import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Button, 
  TextField, 
  Avatar, 
  Grid, 
  CircularProgress,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Breadcrumbs,
  Alert
} from '@mui/material';
import { 
  Reply as ReplyIcon, 
  CheckCircle as CheckCircleIcon,
  MoreVert as MoreVertIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Flag as FlagIcon,
  Pin as PinIcon
} from '@mui/icons-material';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

const ForumTopic = ({ currentUser }) => {
  const { campaignId, topicId } = useParams();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [topic, setTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState(null);
  const [newReply, setNewReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyToEdit, setReplyToEdit] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedReply, setSelectedReply] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    const loadTopicData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Load topic, replies and campaign info
        const [topicRes, repliesRes, campaignRes] = await Promise.all([
          axios.get(`/api/campaigns/${campaignId}/forum-topics/${topicId}/`),
          axios.get(`/api/campaigns/${campaignId}/forum-topics/${topicId}/replies/`),
          axios.get(`/api/campaigns/${campaignId}/`)
        ]);
        
        setTopic(topicRes.data);
        setReplies(repliesRes.data);
        setCampaign(campaignRes.data);
        
        // Increment view count
        await axios.post(`/api/campaigns/${campaignId}/forum-topics/${topicId}/view/`);
      } catch (err) {
        setError('Failed to load forum topic. Please try again later.');
        console.error('Error loading topic data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTopicData();
  }, [campaignId, topicId]);

  const handleMenuOpen = (event, reply) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedReply(reply);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedReply(null);
  };

  const handleEditClick = () => {
    if (!selectedReply) return;
    setReplyToEdit(selectedReply);
    setEditContent(selectedReply.content);
    handleMenuClose();
  };

  const handleSaveEdit = async () => {
    if (!replyToEdit || !editContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await axios.patch(
        `/api/campaigns/${campaignId}/forum-topics/${topicId}/replies/${replyToEdit.id}/`,
        { content: editContent }
      );
      
      // Update the reply in the list
      setReplies(replies.map(r => r.id === replyToEdit.id ? response.data : r));
      setReplyToEdit(null);
      setEditContent('');
    } catch (err) {
      console.error('Error updating reply:', err);
      setError('Failed to update reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setReplyToEdit(null);
    setEditContent('');
  };

  const handleDeleteClick = () => {
    if (!selectedReply) return;
    setConfirmAction('delete');
    setConfirmDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedReply) return;
    
    try {
      await axios.delete(`/api/campaigns/${campaignId}/forum-topics/${topicId}/replies/${selectedReply.id}/`);
      // Remove the reply from the list
      setReplies(replies.filter(r => r.id !== selectedReply.id));
      setConfirmDialogOpen(false);
    } catch (err) {
      console.error('Error deleting reply:', err);
      setError('Failed to delete reply. Please try again.');
    }
  };

  const handleSubmitReply = async () => {
    if (!newReply.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `/api/campaigns/${campaignId}/forum-topics/${topicId}/replies/`,
        { content: newReply }
      );
      
      // Add the new reply to the list
      setReplies([...replies, response.data]);
      setNewReply('');
    } catch (err) {
      console.error('Error posting reply:', err);
      setError('Failed to post reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsSolution = async (reply) => {
    try {
      const response = await axios.post(
        `/api/campaigns/${campaignId}/forum-topics/${topicId}/replies/${reply.id}/mark_solution/`
      );
      
      // Update replies to reflect the solution status
      setReplies(replies.map(r => ({
        ...r,
        is_solution: r.id === reply.id ? response.data.is_solution : false
      })));
      
      handleMenuClose();
    } catch (err) {
      console.error('Error marking solution:', err);
      setError('Failed to mark solution. Please try again.');
    }
  };

  const handleTopicClose = async () => {
    try {
      const response = await axios.post(
        `/api/campaigns/${campaignId}/forum-topics/${topicId}/close/`
      );
      
      // Update topic closed status
      setTopic({
        ...topic,
        is_closed: response.data.is_closed
      });
    } catch (err) {
      console.error('Error toggling topic close status:', err);
      setError('Failed to update topic status. Please try again.');
    }
  };

  const handleTopicPin = async () => {
    try {
      const response = await axios.post(
        `/api/campaigns/${campaignId}/forum-topics/${topicId}/pin/`
      );
      
      // Update topic pinned status
      setTopic({
        ...topic,
        is_pinned: response.data.is_pinned
      });
    } catch (err) {
      console.error('Error toggling topic pin status:', err);
      setError('Failed to update topic status. Please try again.');
    }
  };

  // Check if user is topic author, campaign owner, or has admin rights
  const canModerate = () => {
    if (!topic || !currentUser || !campaign) return false;
    return (
      currentUser.id === topic.author.id || 
      currentUser.id === campaign.owner.id ||
      (campaign.collaborators && campaign.collaborators.some(
        c => c.user.id === currentUser.id && ['owner', 'admin'].includes(c.role)
      ))
    );
  };

  // Check if user can edit a reply
  const canEditReply = (reply) => {
    if (!currentUser) return false;
    return currentUser.id === reply.author.id;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(`/campaigns/${campaignId}`)}
          sx={{ mt: 2 }}
        >
          Back to Campaign
        </Button>
      </Box>
    );
  }

  if (!topic) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning">Topic not found</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(`/campaigns/${campaignId}`)}
          sx={{ mt: 2 }}
        >
          Back to Campaign
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Breadcrumb navigation */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link to={`/campaigns/${campaignId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {campaign?.title || 'Campaign'}
        </Link>
        <Link to={`/campaigns/${campaignId}#forum`} style={{ textDecoration: 'none', color: 'inherit' }}>
          Forum
        </Link>
        <Typography color="text.primary">{topic.title}</Typography>
      </Breadcrumbs>
      
      {/* Topic Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h5" component="h1">
              {topic.is_pinned && '📌 '}
              {topic.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Started by {topic.author.username} on {formatDate(topic.created_at)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {canModerate() && (
              <>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={topic.is_pinned ? <PinIcon color="primary" /> : <PinIcon />}
                  onClick={handleTopicPin}
                >
                  {topic.is_pinned ? 'Unpin' : 'Pin'}
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={topic.is_closed ? <CheckCircleIcon /> : <CloseIcon />}
                  onClick={handleTopicClose}
                  color={topic.is_closed ? 'success' : 'warning'}
                >
                  {topic.is_closed ? 'Reopen' : 'Close'}
                </Button>
              </>
            )}
          </Box>
        </Box>
        
        {topic.is_closed && (
          <Alert severity="info" sx={{ mb: 2 }}>
            This topic has been closed and no new replies can be added.
          </Alert>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <Box className="markdown-content" sx={{ my: 2 }}>
          <ReactMarkdown>
            {topic.content}
          </ReactMarkdown>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {topic.views} {topic.views === 1 ? 'view' : 'views'}
          </Typography>
        </Box>
      </Paper>
      
      {/* Replies */}
      {replies.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Replies
          </Typography>
          
          {replies.map((reply) => (
            <Paper 
              key={reply.id} 
              sx={{ 
                p: 3, 
                mb: 2, 
                borderLeft: reply.is_solution ? '4px solid green' : 'none',
                backgroundColor: reply.is_solution ? 'rgba(0, 128, 0, 0.05)' : 'inherit'
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm="auto">
                  <Avatar>{reply.author.username.charAt(0).toUpperCase()}</Avatar>
                </Grid>
                <Grid item xs>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle1">
                        {reply.author.username}
                        {reply.is_solution && (
                          <Chip 
                            size="small" 
                            icon={<CheckCircleIcon />} 
                            label="Solution" 
                            color="success"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(reply.created_at)}
                        {reply.updated_at !== reply.created_at && ' (edited)'}
                      </Typography>
                    </Box>
                    
                    {(canEditReply(reply) || canModerate()) && (
                      <Box>
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleMenuOpen(e, reply)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                  
                  {replyToEdit && replyToEdit.id === reply.id ? (
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        variant="outlined"
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button 
                          onClick={handleCancelEdit} 
                          sx={{ mr: 1 }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="contained" 
                          onClick={handleSaveEdit}
                          disabled={isSubmitting}
                        >
                          Save Changes
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box className="markdown-content" sx={{ mt: 2 }}>
                      <ReactMarkdown>
                        {reply.content}
                      </ReactMarkdown>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Box>
      )}
      
      {/* Reply Form */}
      {!topic.is_closed && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Post a Reply
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Write your reply here..."
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            variant="outlined"
            disabled={isSubmitting}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<ReplyIcon />}
              onClick={handleSubmitReply}
              disabled={isSubmitting || !newReply.trim()}
            >
              {isSubmitting ? 'Submitting...' : 'Post Reply'}
            </Button>
          </Box>
        </Paper>
      )}
      
      {/* Reply Options Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        {canEditReply(selectedReply) && (
          <MenuItem onClick={handleEditClick}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit Reply
          </MenuItem>
        )}
        
        {canEditReply(selectedReply) && (
          <MenuItem onClick={handleDeleteClick}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete Reply
          </MenuItem>
        )}
        
        {canModerate() && (
          <MenuItem onClick={() => handleMarkAsSolution(selectedReply)}>
            <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
            {selectedReply?.is_solution ? 'Unmark as Solution' : 'Mark as Solution'}
          </MenuItem>
        )}
        
        <MenuItem onClick={handleMenuClose}>
          <FlagIcon fontSize="small" sx={{ mr: 1 }} />
          Report
        </MenuItem>
      </Menu>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          {confirmAction === 'delete' && (
            <Typography>Are you sure you want to delete this reply? This action cannot be undone.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          {confirmAction === 'delete' && (
            <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ForumTopic; 