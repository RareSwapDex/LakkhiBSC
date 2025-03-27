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
  Circle
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Terms = () => {
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
            Terms of Service
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
          <Typography color="text.primary">Terms of Service</Typography>
        </Breadcrumbs>
      </Container>

      {/* Content */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Paper sx={{ p: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="body1" paragraph>
              Welcome to Lakkhi Fund, a decentralized fundraising platform for Web3 projects and token creators. These Terms of Service ("Terms") govern your access to and use of the Lakkhi Fund platform, website, and services.
            </Typography>
            <Typography variant="body1" paragraph>
              By accessing or using Lakkhi Fund, you agree to be bound by these Terms. If you disagree with any part of the Terms, you may not access or use our platform.
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Definitions */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              1. Definitions
            </Typography>
            <Typography variant="body1" paragraph>
              For the purpose of these Terms, the following definitions apply:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="'Platform'" 
                  secondary="refers to the Lakkhi Fund website, applications, smart contracts, and services."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="'Campaign Creator'" 
                  secondary="refers to any individual or entity that creates a fundraising campaign on the Platform."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="'Contributor'" 
                  secondary="refers to any individual or entity that contributes to a campaign on the Platform."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="'Token'" 
                  secondary="refers to any cryptocurrency, digital asset, or blockchain-based token used on the Platform."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="'Smart Contract'" 
                  secondary="refers to self-executing contracts with the terms of the agreement directly written into code on the blockchain."
                />
              </ListItem>
            </List>
          </Box>

          {/* Eligibility */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              2. Eligibility
            </Typography>
            <Typography variant="body1" paragraph>
              To use the Platform, you must:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Be at least 18 years old." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Have the capacity to enter into a legally binding agreement." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Not be prohibited from using the Platform under applicable laws." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Complete any required verification processes if you are a Campaign Creator." />
              </ListItem>
            </List>
            <Typography variant="body1" paragraph>
              By using the Platform, you represent and warrant that you meet all eligibility requirements.
            </Typography>
          </Box>

          {/* Campaign Creation and Token Requirements */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              3. Campaign Creation and Token Requirements
            </Typography>
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
              3.1 Campaign Creation
            </Typography>
            <Typography variant="body1" paragraph>
              As a Campaign Creator, you must:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Provide accurate, complete, and up-to-date information about your campaign and your token project." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Specify a valid token contract address for your campaign's fundraising token." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Set realistic funding goals and transparent milestones for your campaign." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Complete identity verification if required for your campaign type or funding amount." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Comply with all applicable laws and regulations related to fundraising, securities, and financial transactions." />
              </ListItem>
            </List>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
              3.2 Token Requirements
            </Typography>
            <Typography variant="body1" paragraph>
              Tokens used for fundraising on the Platform must:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Be deployed on a supported blockchain network (Ethereum, Polygon, or other networks as specified by Lakkhi Fund)." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Comply with relevant token standards (e.g., ERC-20, ERC-777) and be technically compatible with our smart contracts." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Not be designed to defraud users or manipulate markets (e.g., no honeypot tokens, flash loan attack vectors, or reentrancy vulnerabilities)." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Have sufficient liquidity for credit card payment conversions if this feature is enabled for your campaign." />
              </ListItem>
            </List>
            <Typography variant="body1" paragraph>
              Lakkhi Fund reserves the right to reject any token or campaign that does not meet these requirements or that poses risks to our platform or users.
            </Typography>
          </Box>

          {/* Contributions and Payments */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              4. Contributions and Payments
            </Typography>
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
              4.1 Token Contributions
            </Typography>
            <Typography variant="body1" paragraph>
              When making contributions using tokens:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Contributions are processed through our smart contracts on the blockchain." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="You must have a compatible wallet with sufficient tokens and gas fees to complete the transaction." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="All contributions are subject to blockchain confirmation and may be delayed due to network congestion." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Lakkhi Fund charges a platform fee of 2.5% on all token contributions, which is automatically deducted by the smart contract." />
              </ListItem>
            </List>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
              4.2 Credit Card Payments
            </Typography>
            <Typography variant="body1" paragraph>
              When making contributions using credit cards:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Credit card payments are processed by our third-party payment processors and converted to the campaign's specified token." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="A processing fee of 3.5% applies to all credit card transactions to cover payment processor charges and token conversion costs." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Token conversion rates are determined at the time of transaction based on current market prices." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Credit card payments may require additional verification or authentication steps." />
              </ListItem>
            </List>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
              4.3 Refunds and Campaign Failure
            </Typography>
            <Typography variant="body1" paragraph>
              The refund policy depends on the campaign type:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="For 'All-or-Nothing' campaigns, if the funding goal is not reached by the deadline, all contributions will be automatically refunded to the Contributors, minus gas fees where applicable." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="For 'Keep-What-You-Raise' campaigns, funds are released to the Campaign Creator regardless of whether the funding goal is met." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Credit card payments that have been converted to tokens cannot be directly refunded to the original payment method but will be refunded in tokens to a wallet address provided by the Contributor." />
              </ListItem>
            </List>
          </Box>

          {/* Fund Release and Campaign Owner Obligations */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              5. Fund Release and Campaign Owner Obligations
            </Typography>
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
              5.1 Fund Release Mechanism
            </Typography>
            <Typography variant="body1" paragraph>
              Funds collected through successful campaigns are released as follows:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Campaign Creators can request fund releases based on predefined milestones set during campaign creation." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Each release request must include a detailed description of how the funds will be used and progress updates on the project." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Fund releases are executed through the campaign smart contract and sent to the wallet address specified by the Campaign Creator." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Lakkhi Fund reserves the right to delay or deny fund release requests that appear fraudulent or violate these Terms." />
              </ListItem>
            </List>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
              5.2 Campaign Owner Obligations
            </Typography>
            <Typography variant="body1" paragraph>
              As a Campaign Creator, you agree to:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Use the funds raised exclusively for the purposes described in your campaign." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Provide regular updates to Contributors about the progress of your project and the use of funds." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Fulfill any rewards or incentives promised to Contributors." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Respond promptly to inquiries from Contributors and Lakkhi Fund." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Comply with all applicable laws and regulations related to your campaign and project." />
              </ListItem>
            </List>
            <Typography variant="body1" paragraph>
              Failure to meet these obligations may result in suspension of fund releases, account termination, or legal action.
            </Typography>
          </Box>

          {/* Smart Contract Interactions and Risks */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              6. Smart Contract Interactions and Risks
            </Typography>
            <Typography variant="body1" paragraph>
              By using Lakkhi Fund, you acknowledge and accept the following:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Blockchain Immutability" 
                  secondary="All transactions on the blockchain are immutable and cannot be reversed once confirmed. Lakkhi Fund cannot undo or reverse transactions that have been confirmed on the blockchain."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Smart Contract Risks" 
                  secondary="While our smart contracts have been audited, they may still contain bugs, vulnerabilities, or other issues that could result in loss of funds. You use our smart contracts at your own risk."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Gas Fees" 
                  secondary="All blockchain transactions require gas fees, which are separate from and in addition to our platform fees. Lakkhi Fund is not responsible for gas fees or for transactions that fail due to insufficient gas."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Wallet Security" 
                  secondary="You are responsible for maintaining the security of your own wallet. Lakkhi Fund cannot recover lost wallet access or private keys."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Market Volatility" 
                  secondary="The value of cryptocurrencies and tokens can be highly volatile. Lakkhi Fund is not responsible for any losses due to market fluctuations."
                />
              </ListItem>
            </List>
          </Box>

          {/* Prohibited Activities */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              7. Prohibited Activities
            </Typography>
            <Typography variant="body1" paragraph>
              You agree not to use the Platform to:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Conduct fraudulent fundraising campaigns or promote scams." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Violate any applicable laws, regulations, or third-party rights." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Fundraise for illegal activities, money laundering, or terrorist financing." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Deploy or promote tokens designed to defraud users or manipulate markets." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Circumvent or manipulate platform fees or campaign mechanisms." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Interfere with or disrupt the Platform or servers or networks connected to the Platform." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Attempt to gain unauthorized access to any part of the Platform." />
              </ListItem>
            </List>
            <Typography variant="body1" paragraph>
              Lakkhi Fund reserves the right to investigate and take appropriate legal action against anyone who, in our sole discretion, violates this provision.
            </Typography>
          </Box>

          {/* Intellectual Property */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              8. Intellectual Property
            </Typography>
            <Typography variant="body1" paragraph>
              The Platform and its original content, features, and functionality are owned by Lakkhi Fund and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
            </Typography>
            <Typography variant="body1" paragraph>
              By creating a campaign on the Platform, you grant Lakkhi Fund a non-exclusive, worldwide, royalty-free license to use, reproduce, distribute, and display your campaign content for the purpose of operating and promoting the Platform.
            </Typography>
            <Typography variant="body1" paragraph>
              You represent and warrant that you own or have the necessary rights to all content you submit to the Platform, and that such content does not infringe any third-party rights.
            </Typography>
          </Box>

          {/* Limitation of Liability */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              9. Limitation of Liability
            </Typography>
            <Typography variant="body1" paragraph>
              To the maximum extent permitted by law, Lakkhi Fund and its directors, employees, partners, agents, suppliers, or affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Your access to or use of or inability to access or use the Platform." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Any conduct or content of any third party on the Platform, including Campaign Creators." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Unauthorized access, use, or alteration of your transmissions or content." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Bugs, viruses, trojan horses, or the like that may be transmitted to or through the Platform." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Smart contract bugs, errors, or vulnerabilities." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary="Blockchain network congestion, failures, or changes." />
              </ListItem>
            </List>
          </Box>

          {/* Governing Law */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              10. Governing Law
            </Typography>
            <Typography variant="body1" paragraph>
              These Terms shall be governed by and construed in accordance with the laws of the United Kingdom, without regard to its conflict of law provisions.
            </Typography>
            <Typography variant="body1" paragraph>
              Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in the United Kingdom.
            </Typography>
          </Box>

          {/* Changes to Terms */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              11. Changes to Terms
            </Typography>
            <Typography variant="body1" paragraph>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </Typography>
            <Typography variant="body1" paragraph>
              By continuing to access or use our Platform after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Platform.
            </Typography>
          </Box>

          {/* Contact Us */}
          <Box>
            <Typography variant="h4" component="h2" gutterBottom>
              12. Contact Us
            </Typography>
            <Typography variant="body1" paragraph>
              If you have any questions about these Terms, please contact us at:
            </Typography>
            <Typography variant="body1" component="div">
              <strong>Email:</strong> <MuiLink href="mailto:legal@lakkhifund.com">legal@lakkhifund.com</MuiLink>
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

export default Terms; 