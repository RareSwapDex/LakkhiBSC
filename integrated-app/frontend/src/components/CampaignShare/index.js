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
  IconButton,
  Snackbar,
  Alert,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  LinkedIn,
  WhatsApp,
  Telegram,
  ContentCopy,
  Share,
} from '@mui/icons-material';
import axios from 'axios';

const CampaignShare = ({ campaign }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleOpenDialog = async () => {
    try {
      const response = await axios.post(`/api/campaigns/${campaign.id}/share-link/`);
      setShareLink(response.data.share_link);
      setOpenDialog(true);
    } catch (err) {
      setError('Failed to generate share link');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setShareLink('');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy link');
    }
  };

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(campaign.title)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareLink)}&title=${encodeURIComponent(campaign.title)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${campaign.title} ${shareLink}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(campaign.title)}`,
  };

  return (
    <Box>
      <Button
        startIcon={<Share />}
        onClick={handleOpenDialog}
        variant="outlined"
        color="primary"
      >
        Share Campaign
      </Button>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Share Campaign</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Share this campaign with your network
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  value={shareLink}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <Tooltip title="Copy link">
                        <IconButton onClick={handleCopyLink}>
                          <ContentCopy />
                        </IconButton>
                      </Tooltip>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Share on social media
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    href={shareUrls.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                  >
                    <Facebook />
                  </IconButton>
                  <IconButton
                    href={shareUrls.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                  >
                    <Twitter />
                  </IconButton>
                  <IconButton
                    href={shareUrls.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                  >
                    <LinkedIn />
                  </IconButton>
                  <IconButton
                    href={shareUrls.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                  >
                    <WhatsApp />
                  </IconButton>
                  <IconButton
                    href={shareUrls.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                  >
                    <Telegram />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>

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
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
      >
        <Alert severity="success" onClose={() => setCopied(false)}>
          Link copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CampaignShare; 