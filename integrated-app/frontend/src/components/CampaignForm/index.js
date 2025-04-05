import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  Chip,
  Tooltip,
  LinearProgress,
  Divider,
  Card,
  CardContent,
  Collapse,
  Switch,
  FormControlLabel,
  Backdrop,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TemplateIcon from '@mui/icons-material/AutoAwesome';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash/debounce';

// Custom styled components for better UI
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  backgroundColor: theme.palette.background.default,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const PreviewImage = styled('img')({
  maxWidth: '100%',
  maxHeight: '200px',
  objectFit: 'cover',
  borderRadius: '4px',
});

// Campaign templates for quick start
const CAMPAIGN_TEMPLATES = [
  {
    id: 'product',
    name: 'Product Launch',
    description: 'For new products, services, or applications',
    icon: '🚀',
    presets: {
      milestones: [
        { title: 'Alpha Release', description: 'First test version', amount: '', release_date: '' },
        { title: 'Beta Release', description: 'Public beta testing', amount: '', release_date: '' },
        { title: 'Full Launch', description: 'Official product release', amount: '', release_date: '' }
      ]
    }
  },
  {
    id: 'nonprofit',
    name: 'Nonprofit / Charity',
    description: 'For charity, social impact, or community projects',
    icon: '💙',
    presets: {
      milestones: [
        { title: 'Initial Goal', description: 'First funding objective', amount: '', release_date: '' },
        { title: 'Expansion Goal', description: 'Expanding reach and impact', amount: '', release_date: '' }
      ]
    }
  },
  {
    id: 'creative',
    name: 'Creative Project',
    description: 'For artists, writers, musicians, and creators',
    icon: '🎨',
    presets: {
      milestones: [
        { title: 'Initial Concept', description: 'First draft or prototype', amount: '', release_date: '' },
        { title: 'Production Phase', description: 'Creating the final product', amount: '', release_date: '' },
        { title: 'Release', description: 'Public release and distribution', amount: '', release_date: '' }
      ]
    }
  }
];

// Tab panel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`campaign-tabpanel-${index}`}
      aria-labelledby={`campaign-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Field help component for tooltips
const FieldHelp = ({ text }) => (
  <Tooltip title={text}>
    <HelpOutlineIcon sx={{ ml: 1, fontSize: 16, color: 'text.secondary' }} />
  </Tooltip>
);

const CampaignForm = ({ campaign, isEditMode = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(!isEditMode);
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Initial form data state with empty values
  const initialFormData = {
    // Basics
    title: '',
    description: '',
    fund_amount: '',
    currency: 'USD',
    min_contribution: '',
    max_contribution: '',
    
    // Detailed Story
    story: '',
    image: null,
    image_preview: null,
    video_url: '',
    
    // Team
    team_members: [],
    
    // Social Links
    website: '',
    twitter: '',
    telegram: '',
    discord: '',
    github: '',
    
    // Milestones
    milestones: [{ title: '', description: '', amount: '', release_date: '' }],
    
    // Updates
    updates: [],
    
    // Schedule
    start_date: '',
    end_date: '',
    schedule: [],
    
    // Rewards
    rewards: [],
    
    // Legal
    terms_accepted: false,
    legal_documents: [],
  };
  
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formProgress, setFormProgress] = useState(0);

  // Effect to load campaign data in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchCampaign = async () => {
        try {
          setIsLoading(true);
          const response = await axios.get(`/api/campaigns/${id}/`);
          
          // Transform API data to form structure
          const campaignData = response.data;
          setFormData({
            ...initialFormData,
            ...campaignData,
            image_preview: campaignData.image ? campaignData.image : null,
            team_members: campaignData.team_members || [],
            rewards: campaignData.rewards || [],
          });
          
          setIsLoading(false);
        } catch (err) {
          setError('Failed to load campaign data');
          setIsLoading(false);
        }
      };
      
      fetchCampaign();
    }
  }, [isEditMode, id]);

  // Calculate form completion progress
  useEffect(() => {
    const requiredFields = [
      'title', 'description', 'fund_amount', 'currency', 
      'story', 'start_date', 'end_date'
    ];
    
    const completedFields = requiredFields.filter(field => 
      formData[field] && String(formData[field]).trim() !== ''
    ).length;
    
    // Add milestone validation
    const milestoneValidation = formData.milestones.length > 0 && 
      formData.milestones.every(m => m.title && m.amount);
    
    // Calculate percentage (giving extra weight to different sections)
    const basePercentage = (completedFields / requiredFields.length) * 70;
    const milestonePercentage = milestoneValidation ? 15 : 0;
    const teamPercentage = formData.team_members.length > 0 ? 10 : 0;
    const rewardsPercentage = formData.rewards.length > 0 ? 5 : 0;
    
    setFormProgress(Math.min(100, basePercentage + milestonePercentage + teamPercentage + rewardsPercentage));
  }, [formData]);

  // Create debounced autosave function
  const debouncedSave = useCallback(
    debounce(async (data) => {
      if (!isEditMode || !id) return; // Only autosave in edit mode
      
      try {
        setIsSaving(true);
        await axios.patch(`/api/campaigns/${id}/`, data);
        setLastSaved(new Date());
        setIsSaving(false);
      } catch (err) {
        console.error('Autosave failed:', err);
        setIsSaving(false);
      }
    }, 2000),
    [isEditMode, id]
  );

  // Validate the current tab
  const validateTab = (tabIndex) => {
    const newErrors = {};
    
    switch (tabIndex) {
      case 0: // Basics
        if (!formData.title) newErrors.title = 'Title is required';
        if (!formData.description) newErrors.description = 'Description is required';
        if (!formData.fund_amount) newErrors.fund_amount = 'Funding goal is required';
        break;
      case 1: // Detailed Story
        if (!formData.story) newErrors.story = 'Story is required';
        break;
      case 4: // Milestones
        formData.milestones.forEach((milestone, index) => {
          if (!milestone.title) newErrors[`milestone_${index}_title`] = 'Title is required';
          if (!milestone.amount) newErrors[`milestone_${index}_amount`] = 'Amount is required';
        });
        break;
      case 6: // Schedule
        if (!formData.start_date) newErrors.start_date = 'Start date is required';
        if (!formData.end_date) newErrors.end_date = 'End date is required';
        if (formData.start_date && formData.end_date && 
            new Date(formData.end_date) <= new Date(formData.start_date)) {
          newErrors.end_date = 'End date must be after start date';
        }
        break;
      case 8: // Legal
        if (!formData.terms_accepted) newErrors.terms_accepted = 'You must accept the terms';
        break;
      default:
        break;
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle tab changes with validation
  const handleTabChange = (event, newValue) => {
    const currentTabValid = validateTab(activeTab);
    
    if (currentTabValid || newValue < activeTab) {
      setActiveTab(newValue);
    }
  };

  // Apply template to form data
  const applyTemplate = (templateId) => {
    const template = CAMPAIGN_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    
    setFormData(prev => ({
      ...prev,
      ...template.presets
    }));
    
    setSelectedTemplate(templateId);
    setShowTemplateSelector(false);
  };
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: newValue
      };
      
      // Trigger autosave
      debouncedSave(newData);
      
      return newData;
    });
    
    // Clear validation error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // File size validation (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        image: file,
        image_preview: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };
  
  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleImageUpload({ target: { files: [file] } });
      }
      e.dataTransfer.clearData();
    }
  };

  // Team members handlers
  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      team_members: [
        ...prev.team_members,
        { name: '', role: '', bio: '', image: null, linkedin: '', twitter: '', github: '' }
      ]
    }));
  };
  
  const removeTeamMember = (index) => {
    setFormData(prev => ({
      ...prev,
      team_members: prev.team_members.filter((_, i) => i !== index)
    }));
  };
  
  const handleTeamMemberChange = (index, field, value) => {
    const newTeamMembers = [...formData.team_members];
    newTeamMembers[index] = {
      ...newTeamMembers[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      team_members: newTeamMembers
    }));
  };

  // Milestone handlers
  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        { title: '', description: '', amount: '', release_date: '' }
      ]
    }));
  };
  
  const removeMilestone = (index) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };
  
  const handleMilestoneChange = (index, field, value) => {
    const newMilestones = [...formData.milestones];
    newMilestones[index] = {
      ...newMilestones[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      milestones: newMilestones
    }));
    
    // Clear validation error when field is edited
    if (formErrors[`milestone_${index}_${field}`]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`milestone_${index}_${field}`];
        return newErrors;
      });
    }
  };

  // Reward handlers
  const addReward = () => {
    setFormData(prev => ({
      ...prev,
      rewards: [
        ...prev.rewards,
        { 
          title: '', 
          description: '', 
          amount: '', 
          quantity: '', 
          estimated_delivery: '',
          shipping_required: false,
          shipping_locations: [] 
        }
      ]
    }));
  };
  
  const removeReward = (index) => {
    setFormData(prev => ({
      ...prev,
      rewards: prev.rewards.filter((_, i) => i !== index)
    }));
  };
  
  const handleRewardChange = (index, field, value) => {
    const newRewards = [...formData.rewards];
    newRewards[index] = {
      ...newRewards[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      rewards: newRewards
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all tabs
    const errors = {};
    const tabsToValidate = [0, 1, 4, 6, 8]; // Only validate tabs with required fields
    
    tabsToValidate.forEach(tabIndex => {
      switch (tabIndex) {
        case 0: // Basics
          if (!formData.title) errors.title = 'Title is required';
          if (!formData.description) errors.description = 'Description is required';
          if (!formData.fund_amount) errors.fund_amount = 'Funding goal is required';
          break;
        case 1: // Detailed Story
          if (!formData.story) errors.story = 'Story is required';
          break;
        case 4: // Milestones
          formData.milestones.forEach((milestone, index) => {
            if (!milestone.title) errors[`milestone_${index}_title`] = 'Title is required';
            if (!milestone.amount) errors[`milestone_${index}_amount`] = 'Amount is required';
          });
          break;
        case 6: // Schedule
          if (!formData.start_date) errors.start_date = 'Start date is required';
          if (!formData.end_date) errors.end_date = 'End date is required';
          if (formData.start_date && formData.end_date && 
              new Date(formData.end_date) <= new Date(formData.start_date)) {
            errors.end_date = 'End date must be after start date';
          }
          break;
        case 8: // Legal
          if (!formData.terms_accepted) errors.terms_accepted = 'You must accept the terms';
          break;
        default:
          break;
      }
    });
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      
      // Find the first tab with errors and switch to it
      for (const tabIndex of tabsToValidate) {
        const hasErrorInTab = Object.keys(errors).some(key => {
          if (tabIndex === 0 && ['title', 'description', 'fund_amount', 'currency'].includes(key)) return true;
          if (tabIndex === 1 && ['story', 'image', 'video_url'].includes(key)) return true;
          if (tabIndex === 4 && key.startsWith('milestone_')) return true;
          if (tabIndex === 6 && ['start_date', 'end_date'].includes(key)) return true;
          if (tabIndex === 8 && ['terms_accepted', 'kyc_completed'].includes(key)) return true;
          return false;
        });
        
        if (hasErrorInTab) {
          setActiveTab(tabIndex);
          break;
        }
      }
      
      setError('Please fix the errors before submitting');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Prepare form data for API
      const apiFormData = new FormData();
      
      // Add all text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'image' && key !== 'image_preview' && key !== 'team_members' && 
            key !== 'milestones' && key !== 'rewards') {
          apiFormData.append(key, formData[key]);
        }
      });
      
      // Add image if available
      if (formData.image) {
        apiFormData.append('image', formData.image);
      }
      
      // Add JSON arrays for nested data
      apiFormData.append('team_members', JSON.stringify(formData.team_members));
      apiFormData.append('milestones', JSON.stringify(formData.milestones));
      apiFormData.append('rewards', JSON.stringify(formData.rewards));
      
      let response;
      if (isEditMode && id) {
        response = await axios.patch(`/api/campaigns/${id}/`, apiFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await axios.post('/api/campaigns/', apiFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      setSuccess(true);
      setIsLoading(false);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate(`/campaigns/${isEditMode ? id : response.data.id}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save campaign');
      setIsLoading(false);
    }
  };

  // Template selector component
  const TemplateSelector = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom align="center">
        Choose a Campaign Template
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Start with a template or create from scratch
      </Typography>
      
      <Grid container spacing={3} justifyContent="center">
        {CAMPAIGN_TEMPLATES.map(template => (
          <Grid item xs={12} sm={4} key={template.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderColor: selectedTemplate === template.id ? 'primary.main' : 'transparent',
                borderWidth: 2,
                borderStyle: 'solid',
                '&:hover': { boxShadow: 6 }
              }}
              onClick={() => applyTemplate(template.id)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h3" sx={{ mr: 2 }}>{template.icon}</Typography>
                  <Typography variant="h6">{template.name}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {template.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        
        <Grid item xs={12} sm={4}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.2s',
              borderColor: !selectedTemplate ? 'primary.main' : 'transparent',
              borderWidth: 2,
              borderStyle: 'solid',
              '&:hover': { boxShadow: 6 }
            }}
            onClick={() => {
              setSelectedTemplate(null);
              setShowTemplateSelector(false);
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h3" sx={{ mr: 2 }}>✏️</Typography>
                <Typography variant="h6">Start from Scratch</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Build your campaign with a blank template
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button
          variant="contained"
          onClick={() => setShowTemplateSelector(false)}
          disabled={!selectedTemplate && selectedTemplate !== null}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );

  // If loading, show spinner
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show template selector if not in edit mode and user hasn't chosen yet
  if (showTemplateSelector && !isEditMode) {
    return <TemplateSelector />;
  }

  return (
    <Box>
      {/* Progress indicator */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Campaign completion: {Math.round(formProgress)}%
          </Typography>
          
          {lastSaved && (
            <Typography variant="body2" color="text.secondary">
              {isSaving ? 'Saving...' : `Last saved: ${lastSaved.toLocaleTimeString()}`}
            </Typography>
          )}
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={formProgress} 
          sx={{ height: 8, borderRadius: 4, mt: 1 }} 
        />
      </Paper>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="campaign creation tabs"
        >
          <Tab label="Basics" icon={formErrors.title || formErrors.description || formErrors.fund_amount ? <ErrorIcon color="error" /> : null} iconPosition="end" />
          <Tab label="Story" icon={formErrors.story ? <ErrorIcon color="error" /> : null} iconPosition="end" />
          <Tab label="Team" />
          <Tab label="Social Links" />
          <Tab label="Milestones" icon={Object.keys(formErrors).some(key => key.startsWith('milestone_')) ? <ErrorIcon color="error" /> : null} iconPosition="end" />
          <Tab label="Updates" />
          <Tab label="Schedule" icon={formErrors.start_date || formErrors.end_date ? <ErrorIcon color="error" /> : null} iconPosition="end" />
          <Tab label="Rewards" />
          <Tab label="Legal" icon={formErrors.terms_accepted ? <ErrorIcon color="error" /> : null} iconPosition="end" />
          <Tab label="Preview" />
        </Tabs>

        {/* Basics Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Campaign Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                error={!!formErrors.title}
                helperText={formErrors.title || "A compelling title that describes your campaign"}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                error={!!formErrors.description}
                helperText={formErrors.description || "A brief summary of your campaign (1-2 paragraphs)"}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Funding Goal"
                name="fund_amount"
                value={formData.fund_amount}
                onChange={handleChange}
                required
                error={!!formErrors.fund_amount}
                helperText={formErrors.fund_amount}
                InputProps={{ 
                  startAdornment: formData.currency,
                  readOnly: isEditMode // Disable in edit mode
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  label="Currency"
                  disabled={isEditMode} // Disable in edit mode
                >
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="GBP">GBP</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Minimum Contribution"
                name="min_contribution"
                value={formData.min_contribution}
                onChange={handleChange}
                helperText="Optional: Minimum amount a supporter can contribute"
                InputProps={{ startAdornment: formData.currency }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Maximum Contribution"
                name="max_contribution"
                value={formData.max_contribution}
                onChange={handleChange}
                helperText="Optional: Maximum amount a supporter can contribute"
                InputProps={{ startAdornment: formData.currency }}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Detailed Story Tab */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={8}
                label="Story"
                name="story"
                value={formData.story}
                onChange={handleChange}
                required
                error={!!formErrors.story}
                helperText={formErrors.story || "Tell your campaign's story in detail"}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Campaign Image
              </Typography>
              
              <UploadBox
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                sx={{ 
                  backgroundColor: isDragging ? 'action.hover' : 'background.default',
                  border: isDragging ? '2px solid' : '2px dashed',
                  borderColor: isDragging ? 'primary.main' : 'divider'
                }}
              >
                {formData.image_preview ? (
                  <Box>
                    <PreviewImage src={formData.image_preview} alt="Preview" />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Click or drag to replace
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <CloudUploadIcon fontSize="large" color="primary" />
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      Click or drag to upload campaign image
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Supports JPG, PNG (max 5MB)
                    </Typography>
                  </Box>
                )}
                <VisuallyHiddenInput
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </UploadBox>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Video URL"
                name="video_url"
                value={formData.video_url}
                onChange={handleChange}
                helperText="Add a YouTube or Vimeo URL to showcase your campaign"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Team Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Team Members</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={addTeamMember}
              variant="outlined"
            >
              Add Team Member
            </Button>
          </Box>
          
          {formData.team_members.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No team members added yet. Add team members to increase trust in your campaign.
              </Typography>
            </Paper>
          ) : (
            formData.team_members.map((member, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={member.name}
                      onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Role"
                      value={member.role}
                      onChange={(e) => handleTeamMemberChange(index, 'role', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Bio"
                      value={member.bio}
                      onChange={(e) => handleTeamMemberChange(index, 'bio', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="LinkedIn"
                      value={member.linkedin}
                      onChange={(e) => handleTeamMemberChange(index, 'linkedin', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Twitter"
                      value={member.twitter}
                      onChange={(e) => handleTeamMemberChange(index, 'twitter', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="GitHub"
                      value={member.github}
                      onChange={(e) => handleTeamMemberChange(index, 'github', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton
                        onClick={() => removeTeamMember(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            ))
          )}
        </TabPanel>

        {/* Social Links Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="body2" color="text.secondary" paragraph>
            Add your campaign's social media links to help supporters connect with you.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                InputProps={{
                  startAdornment: 'https://'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Twitter"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                InputProps={{
                  startAdornment: 'twitter.com/'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Telegram"
                name="telegram"
                value={formData.telegram}
                onChange={handleChange}
                InputProps={{
                  startAdornment: 't.me/'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Discord"
                name="discord"
                value={formData.discord}
                onChange={handleChange}
                InputProps={{
                  startAdornment: 'discord.gg/'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="GitHub"
                name="github"
                value={formData.github}
                onChange={handleChange}
                InputProps={{
                  startAdornment: 'github.com/'
                }}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Milestones Tab */}
        <TabPanel value={activeTab} index={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Milestones</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={addMilestone}
              variant="outlined"
            >
              Add Milestone
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Milestones help break down your campaign into achievable goals and build trust with supporters.
          </Typography>
          
          {formData.milestones.map((milestone, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">Milestone {index + 1}</Typography>
                {formData.milestones.length > 1 && (
                  <IconButton
                    onClick={() => removeMilestone(index)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Milestone Title"
                    value={milestone.title}
                    onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                    required
                    error={!!formErrors[`milestone_${index}_title`]}
                    helperText={formErrors[`milestone_${index}_title`]}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Description"
                    value={milestone.description}
                    onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Amount"
                    value={milestone.amount}
                    onChange={(e) => handleMilestoneChange(index, 'amount', e.target.value)}
                    required
                    error={!!formErrors[`milestone_${index}_amount`]}
                    helperText={formErrors[`milestone_${index}_amount`]}
                    InputProps={{ startAdornment: formData.currency }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Estimated Completion Date"
                    value={milestone.release_date}
                    onChange={(e) => handleMilestoneChange(index, 'release_date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}
        </TabPanel>

        {/* Updates Tab */}
        <TabPanel value={activeTab} index={5}>
          {isEditMode ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Campaign Updates</Typography>
                <Button variant="outlined" startIcon={<AddIcon />}>
                  Post New Update
                </Button>
              </Box>
              
              {formData.updates && formData.updates.length > 0 ? (
                formData.updates.map((update, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1">{update.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(update.created_at).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {update.content}
                    </Typography>
                  </Paper>
                ))
              ) : (
                <Typography variant="body1">
                  No updates posted yet.
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="body1">
              You can post updates after creating your campaign.
            </Typography>
          )}
        </TabPanel>

        {/* Schedule Tab */}
        <TabPanel value={activeTab} index={6}>
          <Typography variant="body2" color="text.secondary" paragraph>
            Set your campaign schedule. Choose dates that give you enough time to prepare 
            and promote your campaign.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Start Date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                error={!!formErrors.start_date}
                helperText={formErrors.start_date}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="End Date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                error={!!formErrors.end_date}
                helperText={formErrors.end_date}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Rewards Tab */}
        <TabPanel value={activeTab} index={7}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Rewards</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={addReward}
              variant="outlined"
            >
              Add Reward Tier
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Rewards give supporters incentives to back your campaign. Create attractive tiers 
            at different price points.
          </Typography>
          
          {formData.rewards.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No reward tiers added yet. Adding rewards can significantly increase contributions.
              </Typography>
            </Paper>
          ) : (
            formData.rewards.map((reward, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Reward Title"
                      value={reward.title}
                      onChange={(e) => handleRewardChange(index, 'title', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Amount"
                      value={reward.amount}
                      onChange={(e) => handleRewardChange(index, 'amount', e.target.value)}
                      InputProps={{ startAdornment: formData.currency }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Description"
                      value={reward.description}
                      onChange={(e) => handleRewardChange(index, 'description', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Quantity"
                      value={reward.quantity}
                      onChange={(e) => handleRewardChange(index, 'quantity', e.target.value)}
                      helperText="Leave blank for unlimited"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Estimated Delivery"
                      value={reward.estimated_delivery}
                      onChange={(e) => handleRewardChange(index, 'estimated_delivery', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={reward.shipping_required}
                          onChange={(e) => handleRewardChange(index, 'shipping_required', e.target.checked)}
                        />
                      }
                      label="Physical reward requiring shipping"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton
                        onClick={() => removeReward(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            ))
          )}
        </TabPanel>

        {/* Legal Tab */}
        <TabPanel value={activeTab} index={8}>
          <Typography variant="h6" gutterBottom>Legal Requirements</Typography>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Terms and Conditions</Typography>
            <Typography variant="body2" paragraph>
              By creating this campaign, you agree to our platform's terms and conditions, 
              including fulfillment responsibilities, fee structures, and campaign guidelines.
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  name="terms_accepted"
                  checked={formData.terms_accepted}
                  onChange={handleChange}
                />
              }
              label="I accept the terms and conditions"
            />
            {formErrors.terms_accepted && (
              <Typography variant="caption" color="error">
                {formErrors.terms_accepted}
              </Typography>
            )}
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Decentralized Platform Notice</Typography>
            <Typography variant="body2" paragraph>
              This is a decentralized platform where you maintain full control over your campaign and funds.
              While this means greater freedom, it also means greater responsibility. Please ensure you're
              following applicable laws in your jurisdiction.
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              As a decentralized platform, we do not collect or store identification information.
              All transactions are public on the blockchain and cannot be reversed.
            </Typography>
          </Paper>
        </TabPanel>

        {/* Preview Tab */}
        <TabPanel value={activeTab} index={9}>
          <Typography variant="h5" gutterBottom>
            Campaign Preview
          </Typography>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h4" gutterBottom>
                  {formData.title || 'Campaign Title'}
                </Typography>
                
                <Typography variant="body1" paragraph>
                  {formData.description || 'Campaign description will appear here.'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                {formData.image_preview ? (
                  <PreviewImage 
                    src={formData.image_preview} 
                    alt="Campaign" 
                    sx={{ width: '100%', maxHeight: '200px' }}
                  />
                ) : (
                  <Box 
                    sx={{ 
                      height: '200px', 
                      backgroundColor: 'grey.100', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No image uploaded
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Paper>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Campaign Details
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Funding Goal
                </Typography>
                <Typography variant="body1">
                  {formData.fund_amount ? `${formData.currency} ${formData.fund_amount}` : 'Not set'}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body1">
                  {formData.start_date && formData.end_date ? 
                    `${new Date(formData.start_date).toLocaleDateString()} - ${new Date(formData.end_date).toLocaleDateString()}` : 
                    'Not set'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Milestones
                </Typography>
                {formData.milestones.length > 0 ? (
                  formData.milestones.map((milestone, index) => (
                    <Box key={index} sx={{ mt: 1 }}>
                      <Typography variant="body1">
                        {milestone.title || `Milestone ${index + 1}`} - 
                        {milestone.amount ? ` ${formData.currency} ${milestone.amount}` : ' Amount not set'}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body1">No milestones added</Typography>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Team
                </Typography>
                {formData.team_members.length > 0 ? (
                  formData.team_members.map((member, index) => (
                    <Box key={index} sx={{ mt: 1 }}>
                      <Typography variant="body1">
                        {member.name || `Team Member ${index + 1}`} - {member.role || 'Role not set'}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body1">No team members added</Typography>
                )}
              </Grid>
            </Grid>
          </Paper>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              Ready to launch your campaign? Click the button below to create your campaign.
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleSubmit}
              disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={20} /> : null}
            >
              {isEditMode ? 'Save Changes' : 'Create Campaign'}
            </Button>
          </Box>
        </TabPanel>

        {/* Navigation Buttons */}
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={() => setActiveTab(prev => Math.max(0, prev - 1))}
            disabled={activeTab === 0}
          >
            Previous
          </Button>
          
          {activeTab === 9 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={20} /> : null}
            >
              {isEditMode ? 'Save Changes' : 'Create Campaign'}
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (validateTab(activeTab)) {
                  setActiveTab(prev => Math.min(9, prev + 1));
                }
              }}
              variant="contained"
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>

      {/* Auto-save indicator */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isSaving}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography sx={{ mt: 2 }}>Saving changes...</Typography>
        </Box>
      </Backdrop>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          {isEditMode ? 'Campaign updated successfully!' : 'Campaign created successfully!'} Redirecting...
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CampaignForm; 