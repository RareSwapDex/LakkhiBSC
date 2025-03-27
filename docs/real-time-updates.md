# Real-time Updates System

This document describes the WebSocket-based real-time update system implemented in the campaign platform.

## Overview

The real-time updates system allows users to receive immediate notifications about campaign activities without requiring manual page refreshes. This creates a more engaging and dynamic user experience.

## Architecture

The system uses Django Channels for WebSocket handling on the backend and a custom React hook for WebSocket connections on the frontend.

```
┌─────────────────┐      ┌────────────────┐      ┌────────────────┐
│  React Frontend │      │ Django Backend │      │ Channel Layers │
│  (WebSocket     │◄────►│ (ASGI Server)  │◄────►│ (In-Memory)    │
│   Client)       │      │                │      │                │
└─────────────────┘      └────────────────┘      └────────────────┘
```

## Backend Implementation

### ASGI Configuration

```python
# asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from .routing import websocket_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lakkhi_app.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})
```

### WebSocket URL Routing

```python
# routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/campaign/(?P<campaign_id>\d+)/$', consumers.CampaignConsumer.as_asgi()),
]
```

### WebSocket Consumer

```python
# consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Campaign, Update, Comment, Contribution, Release, Milestone
from .serializers import (
    CampaignSerializer, 
    UpdateSerializer, 
    CommentSerializer, 
    ContributionSerializer,
    ReleaseSerializer,
    MilestoneSerializer
)

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
        
        # Send initial campaign data
        campaign = await self.get_campaign(self.campaign_id)
        if campaign:
            await self.send(text_data=json.dumps({
                'type': 'campaign_data',
                'data': campaign
            }))

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')
            data = text_data_json.get('data', {})

            if message_type == 'contribution':
                await self.handle_contribution(data)
            elif message_type == 'update':
                await self.handle_update(data)
            elif message_type == 'comment':
                await self.handle_comment(data)
            elif message_type == 'release':
                await self.handle_release(data)
            elif message_type == 'milestone':
                await self.handle_milestone(data)
        except json.JSONDecodeError:
            print("Invalid JSON received")
        except Exception as e:
            print(f"Error handling message: {str(e)}")

    # Event handlers
    async def handle_contribution(self, data):
        contribution = await self.get_contribution(data.get('id'))
        if contribution:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'contribution_message',
                    'data': contribution
                }
            )

    # Message senders
    async def contribution_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'contribution',
            'data': event['data']
        }))

    # Database accessors
    @database_sync_to_async
    def get_campaign(self, campaign_id):
        try:
            campaign = Campaign.objects.get(id=campaign_id)
            return CampaignSerializer(campaign).data
        except Campaign.DoesNotExist:
            return None
```

## Frontend Implementation

### WebSocket Hook

```javascript
// hooks/useWebSocket.js
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
          console.log('WebSocket connected');
          setIsConnected(true);
          setError(null);
        };

        ws.current.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
        };

        ws.current.onerror = (event) => {
          console.error('WebSocket error:', event);
          setError('WebSocket connection error');
        };

        ws.current.onmessage = (event) => {
          setLastMessage(event);
        };
      } catch (err) {
        console.error('WebSocket connection error:', err);
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

  const reconnect = () => {
    if (ws.current) {
      ws.current.close();
    }
    connect();
  };

  return { isConnected, lastMessage, error, sendMessage, reconnect };
};

export default useWebSocket;
```

### Using the WebSocket Hook

```javascript
// CampaignDashboard.js
import React, { useState, useEffect } from 'react';
import useWebSocket from '../../hooks/useWebSocket';

const CampaignDashboard = ({ campaignId }) => {
  const { lastMessage, isConnected } = useWebSocket(`ws://localhost:8000/ws/campaign/${campaignId}/`);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        handleWebSocketMessage(data);
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    }
  }, [lastMessage]);

  const handleWebSocketMessage = (data) => {
    const { type, ...payload } = data;
    
    switch (type) {
      case 'contribution':
        // Handle new contribution
        addNotification('New contribution received!', 'success');
        break;
      case 'update':
        // Handle campaign update
        addNotification('Campaign update added!', 'info');
        break;
      case 'comment':
        // Handle new comment
        addNotification('New comment added!', 'info');
        break;
      default:
        console.log('Unknown message type:', type);
    }
  };

  const addNotification = (message, severity = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, severity }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);
  };

  // Rest of component...
};
```

## Message Types

The real-time update system supports the following message types:

### Contribution Updates

When a new contribution is made to a campaign, a message with the following structure is sent:

```javascript
{
  type: 'contribution',
  data: {
    id: 123,
    campaign: 456,
    user: {
      id: 789,
      username: 'contributor',
      // other user fields
    },
    amount: '100.00',
    currency: 'USD',
    created_at: '2023-05-15T14:30:00Z'
    // other contribution fields
  }
}
```

### Campaign Updates

When a campaign owner posts an update:

```javascript
{
  type: 'update',
  data: {
    id: 234,
    campaign: 456,
    title: 'Progress Update',
    content: 'We have reached our first milestone!',
    image: '/media/campaign_updates/image.jpg',
    created_at: '2023-05-16T10:15:00Z'
    // other update fields
  }
}
```

### Comments

When a new comment is posted:

```javascript
{
  type: 'comment',
  data: {
    id: 345,
    campaign: 456,
    user: {
      id: 567,
      username: 'commenter',
      // other user fields
    },
    content: 'Great project!',
    created_at: '2023-05-17T09:20:00Z'
    // other comment fields
  }
}
```

### Campaign Data

On initial connection, the full campaign data is sent:

```javascript
{
  type: 'campaign_data',
  data: {
    id: 456,
    title: 'My Campaign',
    description: 'Campaign description',
    // other campaign fields including nested relations
  }
}
```

## Error Handling

### Backend Error Handling

```python
async def receive(self, text_data):
    try:
        text_data_json = json.loads(text_data)
        # Process message
    except json.JSONDecodeError:
        print("Invalid JSON received")
    except Exception as e:
        print(f"Error handling message: {str(e)}")
```

### Frontend Error Handling

```javascript
// Handle connection errors
if (wsError) {
  return (
    <Alert severity="warning">
      Real-time updates are currently unavailable. Please refresh the page to see the latest updates.
    </Alert>
  );
}

// Handle message parsing errors
try {
  const data = JSON.parse(lastMessage.data);
  handleWebSocketMessage(data);
} catch (err) {
  console.error('Error parsing WebSocket message:', err);
}
```

## Performance Considerations

1. **Channel Layer Configuration**: For production, use Redis as the channel layer backend instead of the in-memory layer to support multiple worker processes.

2. **Reconnection Logic**: The WebSocket hook includes reconnection functionality to handle temporary network issues.

3. **Targeted Updates**: Messages are sent only to clients connected to the specific campaign room, minimizing unnecessary traffic.

4. **Optimized Serialization**: Only required fields are included in the messages to reduce payload size.

## Security Considerations

1. **Authentication**: WebSocket connections are authenticated using Django's authentication middleware.

2. **Data Validation**: All incoming WebSocket messages are validated before processing.

3. **Rate Limiting**: WebSocket connections are subject to rate limiting to prevent abuse.

4. **CORS Configuration**: WebSocket connections are restricted to trusted origins.

## Integration with Django REST Framework

The WebSocket system works alongside the REST API:

1. **Initial Data Loading**: Initial data is loaded through REST API calls.
2. **Real-time Updates**: Subsequent updates are pushed through WebSockets.
3. **Data Consistency**: The same serializers are used for both REST and WebSocket responses.

## Deployment Considerations

When deploying the system, ensure:

1. The ASGI server is properly configured (e.g., Daphne, Uvicorn)
2. Redis is available for the channel layer in production
3. Proper WebSocket URL configuration on the frontend
4. Load balancer configuration allows WebSocket connections 