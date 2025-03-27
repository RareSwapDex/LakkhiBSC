# Campaign Components

This document provides a detailed description of the new components added to the campaign management system.

## Frontend Components

### 1. CampaignUpdates

The `CampaignUpdates` component allows campaign owners to post rich text updates with images and attachments, keeping contributors informed about campaign progress.

#### Features
- Create, edit, and delete campaign updates
- Rich text content
- Image upload support
- File attachment support
- Chronological list view of updates
- Owner-only edit controls

#### Implementation Details
```jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Dialog, /* other imports */
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, /* other icons */
} from '@mui/icons-material';

const CampaignUpdates = ({ campaign, onUpdate }) => {
  // State management for dialogs, forms, notifications
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(null);
  const [formData, setFormData] = useState(null);
  
  // Form handling functions
  const handleSubmit = async () => {
    // API calls to create/edit/delete updates
    // Uses FormData to handle file uploads
  };
  
  return (
    <Box>
      <Paper>
        {/* Header with add button for owners */}
        <List>
          {/* Updates list with media rendering */}
        </List>
      </Paper>
      
      {/* Dialogs for CRUD operations */}
    </Box>
  );
};
```

#### API Integration
- `POST /api/campaigns/:id/updates/` - Create new update
- `PATCH /api/campaigns/:id/updates/:updateId/` - Edit update
- `DELETE /api/campaigns/:id/updates/:updateId/` - Delete update

#### Real-time Updates
Updates are broadcasted via WebSockets to all connected clients when an update is created, edited, or deleted.

---

### 2. CampaignComments

The `CampaignComments` component enables community engagement through a discussion system, allowing contributors and visitors to comment on campaigns.

#### Features
- Comment posting
- Comment editing and deletion
- Report inappropriate comments
- Real-time updates for new comments
- User avatar and name display

#### Implementation Details
```jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, /* other imports */
} from '@mui/material';
import {
  Send as SendIcon, MoreVert as MoreVertIcon, /* other icons */
} from '@mui/icons-material';

const CampaignComments = ({ campaign, onUpdate }) => {
  // State for comments, form, editing, etc.
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  // Comment operations
  const handleSubmit = async (e) => {
    // Post new comment
  };
  
  const handleDelete = async () => {
    // Delete comment
  };
  
  const handleReport = async () => {
    // Report comment
  };
  
  return (
    <Box>
      <Paper>
        {/* Comment form */}
        <List>
          {/* Comments list */}
        </List>
      </Paper>
      
      {/* Context menu for comment actions */}
    </Box>
  );
};
```

#### API Integration
- `GET /api/campaigns/:id/comments/` - Fetch comments
- `POST /api/campaigns/:id/comments/` - Create comment
- `PATCH /api/campaigns/:id/comments/:commentId/` - Edit comment
- `DELETE /api/campaigns/:id/comments/:commentId/` - Delete comment
- `POST /api/campaigns/:id/comments/:commentId/report/` - Report comment

---

### 3. CampaignAnalytics

The `CampaignAnalytics` component provides detailed insights into campaign performance through data visualization and metrics.

#### Features
- Contribution trends over time
- Donor distribution by amount
- Payment method breakdown
- Milestone progress tracking
- Key performance indicators
- Export functionality (CSV, PDF, Excel)

#### Implementation Details
```jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, /* other imports */
} from '@mui/material';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, /* chart imports */ } from 'chart.js';

const CampaignAnalytics = ({ campaign }) => {
  // State for analytics data
  const [analytics, setAnalytics] = useState(null);
  
  // Chart rendering functions
  const renderContributionTrend = () => {
    // Line chart for daily contributions
  };
  
  const renderDonorDistribution = () => {
    // Bar chart for donor distribution
  };
  
  return (
    <Box>
      <Paper>
        {/* Header with export controls */}
        <Grid container>
          {/* Metric cards */}
          {/* Charts and visualizations */}
          {/* Milestone progress */}
        </Grid>
      </Paper>
    </Box>
  );
};
```

#### API Integration
- `GET /api/campaigns/:id/analytics/` - Fetch analytics data
- `GET /api/campaigns/:id/analytics/export/?format=csv` - Export analytics

---

### 4. CampaignShare

The `CampaignShare` component facilitates sharing campaigns on social media platforms.

#### Features
- Generate shareable links
- Share on Facebook, Twitter, LinkedIn, WhatsApp
- Copy link to clipboard
- QR code generation

#### Implementation Details
```jsx
import React, { useState } from 'react';
import {
  Box, Button, Dialog, /* other imports */
} from '@mui/material';
import {
  Share as ShareIcon, Facebook, Twitter, /* other icons */
} from '@mui/icons-material';

const CampaignShare = ({ campaign }) => {
  // State for dialog and share link
  const [openDialog, setOpenDialog] = useState(false);
  const [shareLink, setShareLink] = useState('');
  
  // Generate and handle sharing
  const generateShareLink = async () => {
    // API call to generate trackable link
  };
  
  const handleSocialShare = (platform) => {
    // Platform-specific share handling
  };
  
  return (
    <Box>
      <Button startIcon={<ShareIcon />} onClick={() => setOpenDialog(true)}>
        Share
      </Button>
      
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        {/* Share options */}
        {/* Copy link button */}
        {/* Social media buttons */}
      </Dialog>
    </Box>
  );
};
```

#### API Integration
- `POST /api/campaigns/:id/share-links/` - Generate trackable share link

---

### 5. MobileCampaignView

The `MobileCampaignView` component provides a responsive design optimized for mobile devices.

#### Features
- Condensed layout for small screens
- Touch-friendly controls
- Optimized media display
- Simplified navigation

#### Implementation Details
```jsx
import React from 'react';
import {
  Box, Paper, Typography, useTheme, useMediaQuery, /* other imports */
} from '@mui/material';

const MobileCampaignView = ({ campaign }) => {
  // Mobile-specific layout and functionality
  return (
    <Box>
      <Paper>
        {/* Compact campaign header */}
        {/* Progress indicators */}
        {/* Action buttons */}
        {/* Tabbed content for updates/comments */}
      </Paper>
    </Box>
  );
};
```

## Backend Components

### 1. Models

#### Update Model
```python
class Update(models.Model):
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='updates')
    title = models.CharField(max_length=200)
    content = models.TextField()
    image = models.ImageField(upload_to='campaign_updates/', null=True, blank=True)
    attachment = models.FileField(upload_to='campaign_attachments/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.campaign.title} - {self.title}"
```

#### Comment Model
```python
class Comment(models.Model):
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_edited = models.BooleanField(default=False)
    reported = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.campaign.title}"
```

### 2. API ViewSets

#### UpdateViewSet
```python
class UpdateViewSet(viewsets.ModelViewSet):
    serializer_class = UpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Update.objects.filter(campaign_id=self.kwargs['campaign_pk'])

    def perform_create(self, serializer):
        campaign = get_object_or_404(Campaign, pk=self.kwargs['campaign_pk'])
        if campaign.owner != self.request.user:
            raise PermissionDenied("Only campaign owners can create updates")
        serializer.save(campaign=campaign)
```

#### CommentViewSet
```python
class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(campaign_id=self.kwargs['campaign_pk'])

    def perform_create(self, serializer):
        campaign = get_object_or_404(Campaign, pk=self.kwargs['campaign_pk'])
        serializer.save(campaign=campaign, user=self.request.user)
        
    @action(detail=True, methods=['post'])
    def report(self, request, campaign_pk=None, pk=None):
        comment = self.get_object()
        comment.reported = True
        comment.save()
        return Response({'status': 'comment reported'})
```

### 3. WebSocket Consumer

The `CampaignConsumer` handles real-time updates for campaign activity.

```python
class CampaignConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.campaign_id = self.scope['url_route']['kwargs']['campaign_id']
        self.room_group_name = f'campaign_{self.campaign_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        
    async def receive(self, text_data):
        # Handle incoming messages
        
    async def contribution_message(self, event):
        # Broadcast contribution updates
        
    async def update_message(self, event):
        # Broadcast campaign updates
        
    async def comment_message(self, event):
        # Broadcast new comments
```

## Custom Hooks

### 1. useWebSocket

The `useWebSocket` hook manages WebSocket connections for real-time updates.

```javascript
import { useState, useEffect, useRef } from 'react';

const useWebSocket = (url) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const ws = useRef(null);

  useEffect(() => {
    const connect = () => {
      try {
        ws.current = new WebSocket(url);

        ws.current.onopen = () => {
          setIsConnected(true);
          setError(null);
        };

        ws.current.onclose = () => {
          setIsConnected(false);
        };

        ws.current.onerror = (event) => {
          setError('WebSocket connection error');
        };

        ws.current.onmessage = (event) => {
          setLastMessage(event);
        };
      } catch (err) {
        setError('Failed to establish WebSocket connection');
      }
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  const sendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      setError('WebSocket is not connected');
    }
  };

  return { isConnected, lastMessage, error, sendMessage };
};

export default useWebSocket;
```

### 2. useCampaignData

The `useCampaignData` hook manages campaign data fetching and manipulation.

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

const useCampaignData = (campaignId) => {
  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contributions, setContributions] = useState([]);

  const fetchCampaignData = async () => {
    try {
      setLoading(true);
      const [campaignResponse, contributionsResponse] = await Promise.all([
        axios.get(`/api/campaigns/${campaignId}/`),
        axios.get(`/api/campaigns/${campaignId}/contributions/`),
      ]);

      setCampaignData(campaignResponse.data);
      setContributions(contributionsResponse.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch campaign data');
    } finally {
      setLoading(false);
    }
  };

  // Additional methods for campaign data management

  useEffect(() => {
    if (campaignId) {
      fetchCampaignData();
    }
  }, [campaignId]);

  return {
    campaignData,
    contributions,
    loading,
    error,
    fetchCampaignData,
    // Additional methods
  };
};

export default useCampaignData;
```

## Integration with Existing System

The new components integrate seamlessly with the existing campaign system:

1. The campaign creation and staking contract deployment remain unchanged
2. The payment processing flow for credit card and token donations is preserved
3. The fund release mechanism is enhanced but maintains compatibility with existing contracts
4. Campaign owner permissions are respected across all new components

The system maintains backward compatibility while providing a significantly enhanced user experience through real-time updates, rich media support, and community engagement features. 