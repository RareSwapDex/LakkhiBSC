import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Breadcrumbs,
  Link as MuiLink,
  useTheme
} from '@mui/material';
import {
  Security,
  Circle
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Privacy = () => {
  const theme = useTheme();
  const lastUpdated = "June 15, 2023";

  return (
    <Box>
      {/* Header */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #1a237e 0%, #534bae 100%)',
          color: 'white',
          py: 6
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom align="center">
            Privacy Policy
          </Typography>
          <Typography variant="h6" component="div" align="center" sx={{ opacity: 0.9 }}>
            Last Updated: {lastUpdated}
          </Typography>
        </Container>
      </Box>

      {/* Breadcrumbs */}
      <Container maxWidth="lg" sx={{ mt: 3, mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <MuiLink component={Link} to="/" color="inherit">
            Home
          </MuiLink>
          <Typography color="text.primary">Privacy Policy</Typography>
        </Breadcrumbs>
      </Container>

      {/* Content */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Paper sx={{ p: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="body1" paragraph>
              At Lakkhi Fund, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </Typography>
            <Typography variant="body1" paragraph>
              We recognize the importance of privacy, especially in the Web3 space, and strive to be transparent about our data practices. 
              Please read this policy carefully to understand our practices regarding your information and how we will treat it.
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Information We Collect */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Information We Collect
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
              Information You Provide to Us
            </Typography>
            <Typography variant="body1" paragraph>
              We collect information that you voluntarily provide when using our platform, including:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Account Information: Email address, name, profile picture, and other details you provide when creating an account." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Campaign Information: Details about your fundraising campaign, including project description, funding goals, and token information." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Wallet Information: Public wallet addresses used to interact with our platform." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="KYC Information: For campaign creators, we may collect identification documents and other verification information to comply with legal requirements." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Communication Data: Information provided in communications with us, including support requests, feedback, and survey responses." />
              </ListItem>
            </List>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
              Information Collected Automatically
            </Typography>
            <Typography variant="body1" paragraph>
              When you use our platform, we automatically collect certain information, including:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Usage Data: Information about how you interact with our platform, such as pages visited, features used, and actions taken." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Device Information: Information about the device you use to access our platform, including device type, operating system, browser type, and IP address." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Blockchain Data: Public blockchain transactions related to your interactions with our smart contracts." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Cookies and Similar Technologies: Information collected through cookies and similar technologies about your browsing behavior and preferences." />
              </ListItem>
            </List>
          </Box>

          {/* How We Use Your Information */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              How We Use Your Information
            </Typography>
            <Typography variant="body1" paragraph>
              We use the information we collect for various purposes, including:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="To provide and maintain our platform, including processing transactions, managing campaigns, and facilitating donations." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="To verify the identity of campaign creators and prevent fraud or misuse of our platform." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="To communicate with you about your account, campaigns, transactions, and platform updates." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="To personalize your experience and provide content and features that match your interests." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="To analyze and improve our platform, including monitoring usage patterns and enhancing functionality." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="To comply with legal obligations and enforce our terms of service." />
              </ListItem>
            </List>
          </Box>

          {/* Blockchain Data and Privacy */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Blockchain Data and Privacy
            </Typography>
            <Typography variant="body1" paragraph>
              As a Web3 platform, Lakkhi Fund interacts with public blockchains. Users should be aware of the following:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Public Nature of Blockchain" 
                  secondary="Blockchain transactions are publicly visible by design. Any transaction you make through our platform will be recorded on the blockchain and viewable by anyone." 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Wallet Addresses" 
                  secondary="Your public wallet address will be associated with your transactions on our platform and visible on the blockchain." 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Smart Contract Interactions" 
                  secondary="All interactions with our smart contracts are recorded on the blockchain and cannot be deleted or modified." 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Immutability" 
                  secondary="Due to the immutable nature of blockchains, transaction data cannot be deleted, even if you close your account with us." 
                />
              </ListItem>
            </List>
          </Box>

          {/* Sharing Your Information */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Sharing Your Information
            </Typography>
            <Typography variant="body1" paragraph>
              We may share your information in the following circumstances:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Service Providers" 
                  secondary="We may share information with third-party service providers who perform services on our behalf, such as payment processing, KYC verification, data analysis, and customer support." 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Campaign Display" 
                  secondary="Information about campaigns and their creators is publicly displayed on our platform to facilitate fundraising." 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Legal Requirements" 
                  secondary="We may disclose information if required to do so by law or in response to valid requests by public authorities." 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Business Transfers" 
                  secondary="If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction." 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="With Your Consent" 
                  secondary="We may share your information with your consent or at your direction." 
                />
              </ListItem>
            </List>
          </Box>

          {/* Data Security */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Data Security
            </Typography>
            <Typography variant="body1" paragraph>
              We implement appropriate technical and organizational measures to protect your information from unauthorized access, loss, or alteration. Our security measures include:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Security fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText primary="Encryption of sensitive data both in transit and at rest" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Security fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText primary="Regular security assessments and penetration testing" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Security fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText primary="Access controls and authentication requirements" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Security fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText primary="Regular monitoring for suspicious activities" />
              </ListItem>
            </List>
            <Typography variant="body1" paragraph sx={{ mt: 2 }}>
              While we strive to protect your information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security of your information.
            </Typography>
          </Box>

          {/* Your Rights and Choices */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Your Rights and Choices
            </Typography>
            <Typography variant="body1" paragraph>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Access and Portability" 
                  secondary="You can request a copy of your personal information or ask us to transfer it to another service." 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Correction" 
                  secondary="You can request that we correct inaccurate or incomplete information." 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Deletion" 
                  secondary="You can request that we delete your personal information, except for information that must be retained for legal or compliance purposes or information stored on the blockchain, which cannot be deleted due to its immutable nature." 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Objection and Restriction" 
                  secondary="You can object to certain processing of your information or request that we restrict how we use it." 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Withdrawal of Consent" 
                  secondary="You can withdraw your consent for processing where we rely on consent as the legal basis." 
                />
              </ListItem>
            </List>
            <Typography variant="body1" paragraph sx={{ mt: 2 }}>
              To exercise these rights, please contact us at <MuiLink href="mailto:privacy@lakkhifund.com">privacy@lakkhifund.com</MuiLink>.
            </Typography>
          </Box>

          {/* International Data Transfers */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              International Data Transfers
            </Typography>
            <Typography variant="body1" paragraph>
              Lakkhi Fund operates globally, and your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. 
              We ensure that appropriate safeguards are in place to protect your information when transferred internationally.
            </Typography>
          </Box>

          {/* Children's Privacy */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Children's Privacy
            </Typography>
            <Typography variant="body1" paragraph>
              Our platform is not intended for children under the age of 18. We do not knowingly collect personal information from children under 18. If you believe we have collected information from a child under 18, please contact us immediately.
            </Typography>
          </Box>

          {/* Changes to this Privacy Policy */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Changes to this Privacy Policy
            </Typography>
            <Typography variant="body1" paragraph>
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on our platform with a new effective date. Your continued use of our platform after such changes constitutes your acceptance of the updated policy.
            </Typography>
          </Box>

          {/* Contact Us */}
          <Box>
            <Typography variant="h4" component="h2" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body1" paragraph>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
            </Typography>
            <Typography variant="body1" component="div">
              <strong>Email:</strong> <MuiLink href="mailto:privacy@lakkhifund.com">privacy@lakkhifund.com</MuiLink>
            </Typography>
            <Typography variant="body1" component="div">
              <strong>Address:</strong> Lakkhi Fund, 123 Blockchain Street, Cryptoville, CV1 2WB, United Kingdom
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Privacy; 