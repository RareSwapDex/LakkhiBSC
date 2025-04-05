# Campaign Components

This document provides a detailed description of the components in the campaign management system.

## Frontend Components

### 1. CampaignForm

The `CampaignForm` component provides a comprehensive, tabbed interface for campaign creation and editing.

#### Features
- Multi-step, tabbed campaign creation process
- Template selection for rapid campaign setup
- Rich text content editing
- Media upload with drag-and-drop support
- Form validation and progress tracking
- Autosave functionality
- Visual preview before submission

#### Implementation Details
```jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Paper, Tabs, Tab, /* other imports */
} from '@mui/material';

const CampaignForm = ({ campaign, isEditMode = false }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    // Basic fields
    title: '',
    description: '',
    fund_amount: '',
    // Other fields...
  });
  
  // Tab panels for different campaign sections
  return (
    <Box>
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tab label="Basics" />
        <Tab label="Detailed Story" />
        <Tab label="Team" />
        <Tab label="Social Links" />
        <Tab label="Milestones" />
        <Tab label="Updates" />
        <Tab label="Schedule" />
        <Tab label="Rewards" />
        <Tab label="Legal" />
        <Tab label="Preview" />
      </Tabs>
      
      {/* Tab content panels */}
    </Box>
  );
};
```

#### Supported Tabs
1. **Basics** - Core campaign information (title, description, funding goal)
2. **Detailed Story** - Rich text story with media uploads
3. **Team** - Team member profiles with roles and social links
4. **Social Links** - Campaign's social media profiles
5. **Milestones** - Funding milestones with descriptions and targets
6. **Updates** - Campaign progress updates (post-creation)
7. **Schedule** - Campaign start and end dates
8. **Rewards** - Backer reward tiers
9. **Legal** - Terms acceptance and legal documentation
10. **Preview** - Visual preview of the complete campaign

### 2. CampaignDetails

The `CampaignDetails` component displays a comprehensive view of a campaign with tabbed navigation to all campaign information.

#### Features
- Blockchain details display with explorer links
- Creator verification badge
- Tabbed interface for campaign information
- Team profiles with social links
- Milestone progress tracking
- Forum integration
- Contribution button and progress bar

#### Implementation Details
```jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, /* other imports */ } from '@mui/material';
import ReactMarkdown from 'react-markdown';

const CampaignDetails = ({ campaign, isOwner }) => {
  const [activeTab, setActiveTab] = useState(0);
  
  return (
    <Box>
      {/* Campaign Header */}
      <Paper>
        <Typography variant="h4">{campaign.title}</Typography>
        {campaign.is_verified && <VerifiedIcon />}
        {/* Progress bar and stats */}
      </Paper>
      
      {/* Blockchain Information */}
      <Paper>
        <Typography>Network: {getBlockchainName(campaign.blockchain)}</Typography>
        <Typography>Contract: {campaign.contract_address}</Typography>
      </Paper>
      
      {/* Tabs Navigation */}
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tab label="Story" />
        <Tab label="Team" />
        <Tab label="Milestones" />
        <Tab label="Forum" />
        <Tab label="Updates" />
      </Tabs>
      
      {/* Tab content */}
    </Box>
  );
};
```

### 3. ForumTopic

The `ForumTopic` component enables community discussion within campaigns through a forum system.

#### Features
- Thread-based discussions
- Nested replies
- Solution marking
- Topic pinning and closing
- Moderation tools for campaign owners
- Avatar display
- Markdown support in posts

#### Implementation Details
```jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, /* other imports */ } from '@mui/material';
import ReactMarkdown from 'react-markdown';

const ForumTopic = ({ currentUser }) => {
  const [topic, setTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  
  // Moderation permissions check
  const canModerate = () => {
    // Check if user is topic author, campaign owner, or has admin rights
  };
  
  return (
    <Box>
      {/* Topic Header */}
      <Paper>
        <Typography variant="h5">{topic.title}</Typography>
        {canModerate() && (
          <Box>
            <Button onClick={handleTopicPin}>Pin/Unpin</Button>
            <Button onClick={handleTopicClose}>Close/Reopen</Button>
          </Box>
        )}
      </Paper>
      
      {/* Replies */}
      <Box>
        {replies.map(reply => (
          <Paper>
            <Typography>{reply.content}</Typography>
            {/* Reply options */}
          </Paper>
        ))}
      </Box>
      
      {/* Reply Form */}
      <Paper>
        <TextField
          multiline
          placeholder="Write your reply..."
          value={newReply}
          onChange={(e) => setNewReply(e.target.value)}
        />
        <Button onClick={handleSubmitReply}>Post Reply</Button>
      </Paper>
    </Box>
  );
};
```

### 4. CampaignUpdates

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

### 5. CollaborationManager

The `CollaborationManager` component allows campaign owners to invite and manage team collaborators with specific permissions.

#### Features
- Invite collaborators by email
- Set granular permissions (editing, updates, funds, etc.)
- Collaborator role assignment
- Accept/decline invitation workflow
- Manage existing collaborators
- Permission-based access control

#### Implementation Details
```jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, /* other imports */ } from '@mui/material';

const CollaborationManager = ({ campaign }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [newCollaborator, setNewCollaborator] = useState({ email: '', role: 'editor' });
  
  // Load current collaborators
  useEffect(() => {
    // Fetch collaborators from API
  }, [campaign.id]);
  
  // Invite new collaborator
  const handleInvite = async () => {
    // Create invitation
  };
  
  return (
    <Box>
      <Typography variant="h6">Team Collaborators</Typography>
      
      {/* Existing Collaborators List */}
      <Paper>
        {collaborators.map(collab => (
          <Box key={collab.id}>
            <Typography>{collab.user.username}</Typography>
            <Typography>Role: {collab.role}</Typography>
            {/* Permission toggles */}
          </Box>
        ))}
      </Paper>
      
      {/* Invite Form */}
      <Paper>
        <TextField
          label="Email"
          value={newCollaborator.email}
          onChange={(e) => setNewCollaborator({ ...newCollaborator, email: e.target.value })}
        />
        <Select
          value={newCollaborator.role}
          onChange={(e) => setNewCollaborator({ ...newCollaborator, role: e.target.value })}
        >
          <MenuItem value="owner">Owner</MenuItem>
          <MenuItem value="admin">Administrator</MenuItem>
          <MenuItem value="editor">Editor</MenuItem>
          <MenuItem value="viewer">Viewer</MenuItem>
        </Select>
        <Button onClick={handleInvite}>Send Invitation</Button>
      </Paper>
    </Box>
  );
};
```

## Backend Components

### 1. Models

#### Blockchain Model
```python
class Blockchain(models.Model):
    """
    Model for supported blockchains (EVM-compatible only)
    """
    NETWORK_CHOICES = [
        ('BSC', 'Binance Smart Chain'),
        ('ETH', 'Ethereum'),
        ('BASE', 'Base'),
    ]
    
    name = models.CharField(max_length=50, choices=NETWORK_CHOICES, unique=True)
    network_id = models.CharField(max_length=10)
    rpc_url = models.URLField(max_length=200)
    explorer_url = models.URLField(max_length=200)
    icon = models.ImageField(upload_to='blockchain_icons/', null=True, blank=True)
    is_enabled = models.BooleanField(default=True)
    gas_limit = models.PositiveIntegerField(default=2000000)
```

#### CreatorVerification Model
```python
class CreatorVerification(models.Model):
    """
    Model for tracking creator verification status
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='verification')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    social_proof_url = models.URLField(max_length=255, blank=True, null=True)
    github_username = models.CharField(max_length=100, blank=True, null=True)
    website_url = models.URLField(max_length=255, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    verification_date = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, null=True)
```

#### Collaborator Model
```python
class Collaborator(models.Model):
    """
    Model for campaign collaborators
    """
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('admin', 'Administrator'),
        ('editor', 'Editor'),
        ('viewer', 'Viewer'),
    ]
    
    campaign = models.ForeignKey('Campaign', on_delete=models.CASCADE, related_name='collaborators')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='collaborations')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='viewer')
    can_edit_basics = models.BooleanField(default=False)
    can_edit_story = models.BooleanField(default=False)
    can_manage_team = models.BooleanField(default=False)
    can_manage_milestones = models.BooleanField(default=False)
    can_manage_rewards = models.BooleanField(default=False)
    can_post_updates = models.BooleanField(default=False)
    can_manage_funds = models.BooleanField(default=False)
    invited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='collaborator_invites')
    invitation_accepted = models.BooleanField(default=False)
```

#### Forum Models
```python
class ForumTopic(models.Model):
    """
    Model for campaign forum topics
    """
    campaign = models.ForeignKey('Campaign', on_delete=models.CASCADE, related_name='forum_topics')
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='forum_topics')
    is_pinned = models.BooleanField(default=False)
    is_closed = models.BooleanField(default=False)
    views = models.PositiveIntegerField(default=0)

class ForumReply(models.Model):
    """
    Model for campaign forum replies
    """
    topic = models.ForeignKey(ForumTopic, on_delete=models.CASCADE, related_name='replies')
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='forum_replies')
    is_solution = models.BooleanField(default=False)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
```

#### Enhanced Campaign Model
```python
class Campaign(models.Model):
    """
    Campaign model for managing fundraising campaigns
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('funded', 'Funded'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Basic Information
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='campaigns')
    title = models.CharField(max_length=200)
    description = models.TextField()
    fund_amount = models.DecimalField(max_digits=18, decimal_places=8)
    currency = models.CharField(max_length=10, default='USD')
    
    # Detailed Story
    story = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='campaign_images/', null=True, blank=True)
    video_url = models.URLField(max_length=255, blank=True, null=True)
    
    # Blockchain Information
    blockchain = models.ForeignKey(Blockchain, on_delete=models.SET_NULL, null=True)
    contract_address = models.CharField(max_length=42, blank=True, null=True)
    
    # Status and Verification
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_verified = models.BooleanField(default=False)
    
    # Collaboration Settings
    allow_team_applications = models.BooleanField(default=False)
    is_collaborative = models.BooleanField(default=False)
    
    # Community Settings
    enable_forum = models.BooleanField(default=True)
    forum_moderation_required = models.BooleanField(default=False)
    
    # Helpful Properties
    @property
    def has_forum_activity(self):
        return self.forum_topics.exists()
        
    @property
    def team_size(self):
        return self.collaborators.count() + 1
        
    @property
    def days_remaining(self):
        if not self.end_date:
            return None
        delta = self.end_date - timezone.now()
        return max(0, delta.days)
        
    def can_user_edit(self, user):
        # Check if a user has edit permissions
        if user == self.owner:
            return True
        try:
            collab = self.collaborators.get(user=user, invitation_accepted=True)
            return collab.role in ['owner', 'admin', 'editor']
        except Collaborator.DoesNotExist:
            return False
```

### 2. API Endpoints

#### Blockchain API
```python
class BlockchainViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for blockchain information
    """
    queryset = Blockchain.objects.filter(is_enabled=True)
    serializer_class = BlockchainSerializer
    
    @action(detail=True, methods=['get'])
    def gas_price(self, request, pk=None):
        """Get current gas price for the blockchain"""
        blockchain = self.get_object()
        
        # Get gas price from blockchain RPC
        web3 = Web3(Web3.HTTPProvider(blockchain.rpc_url))
        gas_price = web3.eth.gas_price
        
        return Response({
            'gas_price': str(gas_price),
            'gas_price_gwei': str(web3.from_wei(gas_price, 'gwei')),
            'updated_at': timezone.now(),
        })
```

#### Creator Verification API
```python
class CreatorVerificationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for creator verification requests
    """
    serializer_class = CreatorVerificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def my_verification(self, request):
        """Get the current user's verification status"""
        try:
            verification = CreatorVerification.objects.get(user=request.user)
            serializer = self.get_serializer(verification)
            return Response(serializer.data)
        except CreatorVerification.DoesNotExist:
            return Response({'status': 'not_requested'}, status=404)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def verify(self, request, pk=None):
        """Approve a verification request (admin only)"""
        verification = self.get_object()
        verification.status = 'verified'
        verification.verification_date = timezone.now()
        verification.save()
        
        # Update user's campaigns
        Campaign.objects.filter(owner=verification.user).update(is_verified=True)
        
        return Response({'status': 'verified'})
```

#### Collaborator API
```python
class CollaboratorViewSet(viewsets.ModelViewSet):
    """
    API endpoint for campaign collaborators
    """
    serializer_class = CollaboratorSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    def accept(self, request, campaign_pk=None, pk=None):
        """Accept a collaboration invitation"""
        invitation = self.get_object()
        if invitation.user != request.user:
            raise PermissionDenied("This is not your invitation")
        
        invitation.invitation_accepted = True
        invitation.save()
        return Response({'status': 'accepted'})
    
    @action(detail=True, methods=['post'])
    def decline(self, request, campaign_pk=None, pk=None):
        """Decline a collaboration invitation"""
        invitation = self.get_object()
        if invitation.user != request.user:
            raise PermissionDenied("This is not your invitation")
        
        invitation.delete()
        return Response({'status': 'declined'})
```

#### Forum API
```python
class ForumTopicViewSet(viewsets.ModelViewSet):
    """
    API endpoint for campaign forum topics
    """
    serializer_class = ForumTopicSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @action(detail=True, methods=['post'])
    def view(self, request, campaign_pk=None, pk=None):
        """Increment view count for a topic"""
        topic = self.get_object()
        topic.views += 1
        topic.save()
        return Response({'views': topic.views})
    
    @action(detail=True, methods=['post'])
    def pin(self, request, campaign_pk=None, pk=None):
        """Pin/unpin a topic (campaign owner or moderator only)"""
        topic = self.get_object()
        # Check permissions...
        topic.is_pinned = not topic.is_pinned
        topic.save()
        return Response({'is_pinned': topic.is_pinned})
    
    @action(detail=True, methods=['post'])
    def close(self, request, campaign_pk=None, pk=None):
        """Close/reopen a topic (owner, moderator or topic author)"""
        topic = self.get_object()
        # Check permissions...
        topic.is_closed = not topic.is_closed
        topic.save()
        return Response({'is_closed': topic.is_closed})

class ForumReplyViewSet(viewsets.ModelViewSet):
    """
    API endpoint for campaign forum replies
    """
    serializer_class = ForumReplySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @action(detail=True, methods=['post'])
    def mark_solution(self, request, campaign_pk=None, topic_pk=None, pk=None):
        """Mark/unmark a reply as the solution"""
        reply = self.get_object()
        topic = reply.topic
        
        # Check permissions...
        
        # Unmark any existing solutions
        ForumReply.objects.filter(topic=topic, is_solution=True).update(is_solution=False)
        
        # Mark this reply as solution if it wasn't already
        reply.is_solution = not reply.is_solution
        reply.save()
        return Response({'is_solution': reply.is_solution})
```

## Integration with Web3

### Multi-Chain Support

The campaign platform now fully supports multiple EVM-compatible blockchains, including:

1. **Ethereum (ETH)** - The original Ethereum blockchain
2. **Binance Smart Chain (BSC)** - Binance's EVM-compatible blockchain
3. **Base** - Layer 2 rollup for Ethereum

All smart contracts are written in Solidity and deployed consistently across these chains.

### Blockchain Integration Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Campaign Form  │────►│  Blockchain     │────►│  Smart Contract  │
│  (Chain Select) │     │  API Gateway    │     │  Deployment      │
└─────────────────┘     └─────────────────┘     └──────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  Web3 Provider  │
                        │  (MetaMask)     │
                        └─────────────────┘
```

### Connector Implementation

The platform uses a unified connector approach to handle all EVM-compatible chains:

```javascript
const connectToBlockchain = async (chainId) => {
  // Request network switch in MetaMask
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: Web3.utils.toHex(chainId) }],
    });
    
    // Connect Web3
    const web3 = new Web3(ethereum);
    const accounts = await web3.eth.requestAccounts();
    
    return {
      web3,
      account: accounts[0],
      connected: true
    };
  } catch (error) {
    console.error('Error connecting to blockchain:', error);
    throw error;
  }
};
```

## Community Features

The platform includes several community features to enhance engagement:

1. **Forum System** - Thread-based discussions on campaign pages
2. **Creator Verification** - Trusted creator status with verification badge
3. **Team Collaboration** - Multiple contributors with role-based permissions
4. **Update Notifications** - Real-time updates for campaign activities
5. **Solution Marking** - Highlight helpful answers in forum discussions

## Conclusion

These improvements create a more comprehensive and feature-rich crowdfunding platform with enhanced community engagement, decentralized governance, and multi-chain support. The tabbed interface provides a better user experience for both campaign creators and supporters, while the collaboration tools enable team-based projects to work effectively. 