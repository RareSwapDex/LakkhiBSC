import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Chip,
  Divider,
  LinearProgress,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Link as MuiLink,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  TextField,
  CircularProgress
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { 
  InfoOutlined,
  Share as ShareIcon,
  Verified as VerifiedIcon,
  Launch as LaunchIcon,
  People as PeopleIcon,
  Timeline as TimelineIcon,
  Forum as ForumIcon,
  Description as DescriptionIcon,
  Link as LinkIcon,
  Twitter as TwitterIcon,
  Telegram as TelegramIcon,
  GitHub as GitHubIcon,
  Message as MessageIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CampaignDetails = ({ campaign, isOwner }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [forumTopics, setForumTopics] = useState([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [newTopicDialogOpen, setNewTopicDialogOpen] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', content: '' });
  
  // Get blockchain info
  const getBlockchainIcon = (blockchain) => {
    switch(blockchain?.name) {
      case 'ETH': return '🔷'; // Ethereum logo
      case 'BSC': return '🟡'; // BSC logo
      case 'BASE': return '🔵'; // Base logo
      default: return '🔗'; // Default chain icon
    }
  };
  
  const getBlockchainName = (blockchain) => {
    return blockchain?.name || 'Unknown Chain';
  };
  
  const getExplorerLink = (blockchain, address) => {
    if (!blockchain || !address) return '#';
    return `${blockchain.explorer_url}/address/${address}`;
  };

  // Load forum topics when tab changes to forum
  useEffect(() => {
    if (activeTab === 3 && campaign?.id) {
      loadForumTopics();
    }
  }, [activeTab, campaign?.id]);

  const loadForumTopics = async () => {
    if (!campaign?.id) return;
    
    setIsLoadingTopics(true);
    try {
      const response = await axios.get(`/api/campaigns/${campaign.id}/forum-topics/`);
      setForumTopics(response.data);
    } catch (error) {
      console.error('Error loading forum topics:', error);
    } finally {
      setIsLoadingTopics(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCreateTopic = async () => {
    if (!campaign?.id || !newTopic.title || !newTopic.content) return;
    
    try {
      await axios.post(`/api/campaigns/${campaign.id}/forum-topics/`, newTopic);
      setNewTopic({ title: '', content: '' });
      setNewTopicDialogOpen(false);
      loadForumTopics();
    } catch (error) {
      console.error('Error creating forum topic:', error);
    }
  };

  // Format time remaining
  const formatTimeRemaining = () => {
    if (!campaign.end_date) return 'No deadline';
    const days = campaign.days_remaining;
    if (days <= 0) return 'Campaign ended';
    return `${days} days left`;
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h4" component="h1">
                {campaign.title}
              </Typography>
              {campaign.is_verified && (
                <Tooltip title="Verified Campaign">
                  <VerifiedIcon color="primary" sx={{ ml: 1 }} />
                </Tooltip>
              )}
            </Box>
            
            <Typography color="text.secondary" gutterBottom>
              {campaign.description}
            </Typography>
            
            <Box sx={{ display: 'flex', mt: 2 }}>
              <Chip 
                icon={<PeopleIcon />} 
                label={`${campaign.total_contributors || 0} Contributors`} 
                sx={{ mr: 1 }} 
                variant="outlined" 
              />
              <Chip 
                icon={<TimelineIcon />} 
                label={formatTimeRemaining()} 
                sx={{ mr: 1 }} 
                variant="outlined" 
                color={campaign.days_remaining > 5 ? 'default' : 'warning'}
              />
              {campaign.enable_forum && (
                <Chip 
                  icon={<ForumIcon />} 
                  label={`${campaign.has_forum_activity ? 'Active' : 'New'} Forum`} 
                  variant="outlined" 
                  color={campaign.has_forum_activity ? 'success' : 'default'}
                />
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                {campaign.currency} {campaign.total_raised || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                raised of {campaign.currency} {campaign.fund_amount} goal
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={campaign.progress_percentage || 0}
                sx={{ height: 10, borderRadius: 5, mb: 2 }}
              />
              
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                size="large" 
                component={Link} 
                to={`/contribute/${campaign.id}`}
                sx={{ mb: 1 }}
              >
                Support This Campaign
              </Button>
              
              <Button 
                variant="outlined" 
                startIcon={<ShareIcon />} 
                fullWidth
              >
                Share
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Blockchain Information Card */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Blockchain Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>Network:</Typography>
              <Chip
                icon={<Box component="span">{getBlockchainIcon(campaign.blockchain)}</Box>}
                label={getBlockchainName(campaign.blockchain)}
                size="small"
                variant="outlined"
              />
            </Box>
          </Grid>
          {campaign.contract_address && (
            <Grid item xs={12} sm={6} md={9}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>Contract:</Typography>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  {campaign.contract_address.substring(0, 6)}...{campaign.contract_address.substring(campaign.contract_address.length - 4)}
                </Typography>
                <IconButton 
                  size="small" 
                  component="a" 
                  href={getExplorerLink(campaign.blockchain, campaign.contract_address)} 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LaunchIcon fontSize="small" />
                </IconButton>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
      
      {/* Tabs Navigation */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Story" />
          <Tab label="Team" />
          <Tab label="Milestones" />
          <Tab label="Forum" />
          <Tab label="Updates" />
        </Tabs>
      </Box>
      
      {/* Tab Content */}
      <Box>
        {/* Story Tab */}
        {activeTab === 0 && (
          <Paper sx={{ p: 3 }}>
            {campaign.image && (
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <img 
                  src={campaign.image} 
                  alt={campaign.title}
                  style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }}
                />
              </Box>
            )}
            
            <Box className="markdown-content">
              <ReactMarkdown>
                {campaign.story || 'No detailed story available for this campaign.'}
              </ReactMarkdown>
            </Box>
            
            {/* Social Links */}
            {(campaign.website || campaign.twitter || campaign.telegram || campaign.discord || campaign.github) && (
              <Box sx={{ mt: 4 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Connect With Us
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {campaign.website && (
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<LinkIcon />}
                      component="a"
                      href={campaign.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Website
                    </Button>
                  )}
                  {campaign.twitter && (
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<TwitterIcon />}
                      component="a"
                      href={campaign.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Twitter
                    </Button>
                  )}
                  {campaign.telegram && (
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<TelegramIcon />}
                      component="a"
                      href={campaign.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Telegram
                    </Button>
                  )}
                  {campaign.github && (
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<GitHubIcon />}
                      component="a"
                      href={campaign.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </Paper>
        )}
        
        {/* Team Tab */}
        {activeTab === 1 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Team Members
            </Typography>
            
            {campaign.team_members && campaign.team_members.length > 0 ? (
              <Grid container spacing={3}>
                {campaign.team_members.map((member, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar 
                            src={member.image} 
                            alt={member.name}
                            sx={{ width: 60, height: 60, mr: 2 }}
                          />
                          <Box>
                            <Typography variant="subtitle1">{member.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{member.role}</Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" paragraph>
                          {member.bio}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {member.linkedin && (
                            <IconButton 
                              size="small" 
                              color="primary" 
                              component="a"
                              href={member.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <LinkIcon fontSize="small" />
                            </IconButton>
                          )}
                          {member.twitter && (
                            <IconButton 
                              size="small" 
                              color="primary"
                              component="a"
                              href={member.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <TwitterIcon fontSize="small" />
                            </IconButton>
                          )}
                          {member.github && (
                            <IconButton 
                              size="small" 
                              color="primary"
                              component="a"
                              href={member.github}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <GitHubIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body1">
                No team members have been added to this campaign yet.
              </Typography>
            )}
            
            {/* Show collaborators information if owner */}
            {isOwner && campaign.collaborators && campaign.collaborators.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Collaborators
                </Typography>
                <Grid container spacing={2}>
                  {campaign.collaborators.map((collab, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle2">{collab.user.username}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Role: {collab.role}
                        </Typography>
                        {!collab.invitation_accepted && (
                          <Chip size="small" label="Invitation Pending" color="warning" sx={{ mt: 1 }} />
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Paper>
        )}
        
        {/* Milestones Tab */}
        {activeTab === 2 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Campaign Milestones
            </Typography>
            
            {campaign.milestones && campaign.milestones.length > 0 ? (
              campaign.milestones.map((milestone, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6">
                        {milestone.title}
                      </Typography>
                      <Chip 
                        label={milestone.completed ? 'Completed' : 'In Progress'} 
                        color={milestone.completed ? 'success' : 'primary'}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" paragraph>
                      {milestone.description}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Target: {campaign.currency} {milestone.target_amount}
                        </Typography>
                      </Grid>
                      {milestone.due_date && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Due: {new Date(milestone.due_date).toLocaleDateString()}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                    
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={milestone.progress_percentage || 0}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {milestone.progress_percentage || 0}% complete
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography variant="body1">
                No milestones have been defined for this campaign yet.
              </Typography>
            )}
          </Paper>
        )}
        
        {/* Forum Tab */}
        {activeTab === 3 && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Community Forum
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<MessageIcon />}
                onClick={() => setNewTopicDialogOpen(true)}
              >
                New Topic
              </Button>
            </Box>
            
            {isLoadingTopics ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : forumTopics.length > 0 ? (
              forumTopics.map((topic, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">
                        {topic.is_pinned && '📌 '}
                        {topic.title}
                      </Typography>
                      <Box>
                        {topic.is_closed && (
                          <Chip label="Closed" size="small" sx={{ mr: 1 }} />
                        )}
                        <Chip 
                          label={`${topic.replies_count || 0} replies`} 
                          size="small" 
                          color={topic.replies_count > 0 ? 'primary' : 'default'}
                        />
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Started by {topic.author.username} on {new Date(topic.created_at).toLocaleDateString()}
                    </Typography>
                    
                    <Button 
                      variant="text" 
                      sx={{ mt: 2 }} 
                      component={Link}
                      to={`/campaigns/${campaign.id}/forum/${topic.id}`}
                    >
                      View Discussion
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography variant="body1" align="center" sx={{ py: 4 }}>
                No forum topics yet. Be the first to start a discussion!
              </Typography>
            )}
          </Paper>
        )}
        
        {/* Updates Tab */}
        {activeTab === 4 && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Campaign Updates
              </Typography>
              {isOwner && (
                <Button 
                  variant="contained" 
                  startIcon={<DescriptionIcon />}
                  component={Link}
                  to={`/campaigns/${campaign.id}/updates/new`}
                >
                  Post Update
                </Button>
              )}
            </Box>
            
            {campaign.updates && campaign.updates.length > 0 ? (
              campaign.updates.map((update, index) => (
                <Card key={index} sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {update.title}
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Posted on {new Date(update.created_at).toLocaleDateString()}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box className="markdown-content">
                      <ReactMarkdown>
                        {update.content}
                      </ReactMarkdown>
                    </Box>
                    
                    {update.image && (
                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <img 
                          src={update.image} 
                          alt={update.title}
                          style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }}
                        />
                      </Box>
                    )}
                    
                    {update.attachment && (
                      <Button
                        variant="outlined"
                        startIcon={<DescriptionIcon />}
                        component="a"
                        href={update.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ mt: 2 }}
                      >
                        Download Attachment
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography variant="body1" align="center" sx={{ py: 4 }}>
                No updates have been posted yet.
              </Typography>
            )}
          </Paper>
        )}
      </Box>
      
      {/* New Topic Dialog */}
      <Dialog 
        open={newTopicDialogOpen} 
        onClose={() => setNewTopicDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Topic</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Topic Title"
            fullWidth
            variant="outlined"
            value={newTopic.title}
            onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Content"
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={newTopic.content}
            onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewTopicDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateTopic}
            variant="contained"
            disabled={!newTopic.title || !newTopic.content}
          >
            Create Topic
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CampaignDetails; 