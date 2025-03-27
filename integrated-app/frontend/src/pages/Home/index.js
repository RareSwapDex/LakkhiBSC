import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardMedia,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  TrendingUp, 
  Paid, 
  Security, 
  CurrencyExchange, 
  Visibility, 
  BarChart,
  AccountBalance,
  Insights,
  PriceChange,
  CreditCard 
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #1a237e 0%, #534bae 100%)',
          color: 'white',
          pt: 10,
          pb: 6
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
                Empower Your Web3 Project
              </Typography>
              <Typography variant="h5" component="h2" sx={{ mb: 4, opacity: 0.9 }}>
                Boost your token's visibility and liquidity through decentralized fundraising
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  component={Link} 
                  to="/create-campaign"
                  sx={{ 
                    bgcolor: '#ff9100', 
                    '&:hover': { bgcolor: '#ff6d00' },
                    px: 4,
                    py: 1.5
                  }}
                >
                  Create a Campaign
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  component={Link} 
                  to="/campaigns"
                  sx={{ 
                    color: 'white', 
                    borderColor: 'white',
                    '&:hover': { 
                      borderColor: 'white', 
                      bgcolor: 'rgba(255,255,255,0.1)' 
                    },
                    px: 4,
                    py: 1.5
                  }}
                >
                  Explore Campaigns
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/assets/hero-image.png"
                alt="Lakkhi Fund Hero"
                sx={{
                  width: '100%',
                  maxWidth: 500,
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: 3,
                  display: { xs: 'none', md: 'block' },
                  mx: 'auto'
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Why Choose Lakkhi Fund
        </Typography>
        <Typography variant="h6" component="h3" align="center" color="text.secondary" sx={{ mb: 6 }}>
          The premier fundraising platform for Web3 projects and token creators
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PriceChange color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h5" component="h3">
                    Token Price Impact
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  Fundraising campaigns can positively impact your token's market value by increasing visibility, 
                  creating utility, and reducing sell pressure through staking mechanisms.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CurrencyExchange color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h5" component="h3">
                    Dual Payment Options
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  Accept contributions directly in your token or through credit card payments that automatically 
                  convert to your token, expanding your donor base beyond crypto users.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Visibility color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h5" component="h3">
                    Increased Visibility
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  Gain exposure to new audiences and communities, bringing attention to your project 
                  and token through our growing platform of donors and supporters.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            How It Works
          </Typography>
          <Typography variant="h6" component="h3" align="center" color="text.secondary" sx={{ mb: 6 }}>
            Simple process to start fundraising with your token
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 3, height: '100%', bgcolor: 'white' }}>
                <Typography variant="h2" color="primary" align="center" sx={{ mb: 2 }}>1</Typography>
                <Typography variant="h5" component="h3" align="center" gutterBottom>
                  Create Your Campaign
                </Typography>
                <Typography variant="body1" color="text.secondary" align="center">
                  Set up your fundraising campaign with details about your project, funding goal, 
                  token address, and campaign duration. Customize your campaign page with rich media.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 3, height: '100%', bgcolor: 'white' }}>
                <Typography variant="h2" color="primary" align="center" sx={{ mb: 2 }}>2</Typography>
                <Typography variant="h5" component="h3" align="center" gutterBottom>
                  Receive Contributions
                </Typography>
                <Typography variant="body1" color="text.secondary" align="center">
                  Supporters can contribute directly with your token or through credit card payments. 
                  All funds are secured in a transparent smart contract until campaign completion.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 3, height: '100%', bgcolor: 'white' }}>
                <Typography variant="h2" color="primary" align="center" sx={{ mb: 2 }}>3</Typography>
                <Typography variant="h5" component="h3" align="center" gutterBottom>
                  Release Funds
                </Typography>
                <Typography variant="body1" color="text.secondary" align="center">
                  Once your campaign reaches its goals, release funds according to your predefined 
                  milestones. Keep supporters engaged with regular updates and progress reports.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Token Benefits Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Token Price Benefits
        </Typography>
        <Typography variant="h6" component="h3" align="center" color="text.secondary" sx={{ mb: 6 }}>
          How fundraising on Lakkhi Fund can positively impact your token
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <TrendingUp color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Increased Demand" 
                  secondary="Contributors need to acquire your token to participate, creating natural buying pressure."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Paid color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Locked Liquidity" 
                  secondary="Tokens contributed to campaigns are temporarily locked, reducing circulating supply."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BarChart color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Market Signal" 
                  secondary="Successful fundraising signals project strength and community support to the market."
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Security color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Community Growth" 
                  secondary="Attract new token holders who become invested in your project's long-term success."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Insights color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Real Utility" 
                  secondary="Demonstrate practical use cases for your token beyond speculation."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AccountBalance color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Funding Without Dilution" 
                  secondary="Raise funds without creating new tokens or diluting existing holders."
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Container>

      {/* Credit Card Integration Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h2" gutterBottom>
                Beyond Crypto Users
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Lakkhi Fund bridges the gap between traditional finance and Web3, allowing anyone to support your project with a credit card.
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CreditCard color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Seamless Card Payments" 
                    secondary="Contributors can support your project even if they don't own cryptocurrency."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CurrencyExchange color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Automatic Token Acquisition" 
                    secondary="Card payments are automatically converted to your token, creating buy pressure."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Visibility color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Wider Audience" 
                    secondary="Reach traditional donors and introduce them to your Web3 project."
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/assets/card-payments.png"
                alt="Credit Card Payments"
                sx={{
                  width: '100%',
                  maxWidth: 450,
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: 3,
                  display: { xs: 'none', md: 'block' },
                  mx: 'auto'
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #1a237e 0%, #534bae 100%)',
          color: 'white',
          py: 8
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Ready to Launch Your Campaign?
          </Typography>
          <Typography variant="h6" component="h3" sx={{ mb: 4, opacity: 0.9 }}>
            Join the growing list of Web3 projects fundraising through Lakkhi Fund
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            component={Link} 
            to="/create-campaign"
            sx={{ 
              bgcolor: '#ff9100', 
              '&:hover': { bgcolor: '#ff6d00' },
              px: 6,
              py: 2,
              fontSize: '1.2rem'
            }}
          >
            Create Your Campaign
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                Lakkhi Fund
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The premier decentralized fundraising platform for Web3 projects and token creators.
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                Platform
              </Typography>
              <nav>
                <Link to="/campaigns" style={{ display: 'block', color: 'inherit', textDecoration: 'none', marginBottom: '0.5rem' }}>
                  Campaigns
                </Link>
                <Link to="/create-campaign" style={{ display: 'block', color: 'inherit', textDecoration: 'none', marginBottom: '0.5rem' }}>
                  Create Campaign
                </Link>
                <Link to="/how-it-works" style={{ display: 'block', color: 'inherit', textDecoration: 'none', marginBottom: '0.5rem' }}>
                  How It Works
                </Link>
              </nav>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                Resources
              </Typography>
              <nav>
                <Link to="/faq" style={{ display: 'block', color: 'inherit', textDecoration: 'none', marginBottom: '0.5rem' }}>
                  FAQ
                </Link>
                <Link to="/docs" style={{ display: 'block', color: 'inherit', textDecoration: 'none', marginBottom: '0.5rem' }}>
                  Documentation
                </Link>
                <Link to="/token-benefits" style={{ display: 'block', color: 'inherit', textDecoration: 'none', marginBottom: '0.5rem' }}>
                  Token Benefits
                </Link>
              </nav>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                Legal
              </Typography>
              <nav>
                <Link to="/terms" style={{ display: 'block', color: 'inherit', textDecoration: 'none', marginBottom: '0.5rem' }}>
                  Terms of Service
                </Link>
                <Link to="/privacy" style={{ display: 'block', color: 'inherit', textDecoration: 'none', marginBottom: '0.5rem' }}>
                  Privacy Policy
                </Link>
                <Link to="/cookies" style={{ display: 'block', color: 'inherit', textDecoration: 'none', marginBottom: '0.5rem' }}>
                  Cookie Policy
                </Link>
              </nav>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                Connect
              </Typography>
              <nav>
                <Link to="/contact" style={{ display: 'block', color: 'inherit', textDecoration: 'none', marginBottom: '0.5rem' }}>
                  Contact Us
                </Link>
                <a href="https://twitter.com/lakkhifund" target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: 'inherit', textDecoration: 'none', marginBottom: '0.5rem' }}>
                  Twitter
                </a>
                <a href="https://discord.gg/lakkhifund" target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: 'inherit', textDecoration: 'none', marginBottom: '0.5rem' }}>
                  Discord
                </a>
              </nav>
            </Grid>
          </Grid>
          <Box mt={5}>
            <Divider />
            <Box mt={3} display="flex" justifyContent="space-between" flexWrap="wrap">
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} Lakkhi Fund. All rights reserved.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Powered by Ethereum & Polygon
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 