import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Paper,
  Button,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  TokenOutlined,
  PaidOutlined,
  SecurityOutlined,
  CreditCardOutlined,
  BarChartOutlined,
  AccountBalanceOutlined
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const FAQ = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // FAQ categories and questions
  const faqCategories = [
    {
      title: "For Token Projects",
      icon: <TokenOutlined fontSize="large" color="primary" />,
      questions: [
        {
          question: "How does Lakkhi Fund benefit my token price?",
          answer: "Lakkhi Fund benefits your token price in multiple ways: 1) By creating natural buying pressure as contributors need to acquire your token to participate, 2) By temporarily locking tokens which reduces circulating supply, 3) By demonstrating real utility for your token, and 4) By increasing visibility and growing your holder community."
        },
        {
          question: "Can I specify which token to use for my campaign?",
          answer: "Yes! As a campaign creator, you can specify your own token for fundraising. Simply provide the token contract address during campaign creation, and we'll validate and integrate it automatically."
        },
        {
          question: "Do I need to deposit tokens to create a campaign?",
          answer: "No, you don't need to deposit any tokens to create a campaign. However, you'll need to connect a wallet that can interact with your token contract for transaction verification."
        },
        {
          question: "How are funds released to campaign owners?",
          answer: "Funds are released based on your predefined milestones. You can request a release through the campaign dashboard, which transfers the tokens from the campaign contract to your designated wallet."
        },
        {
          question: "Can I set up recurring campaigns for my token?",
          answer: "Yes, you can create multiple campaigns for different purposes or set up recurring campaigns for ongoing funding needs. This is particularly useful for continuous development, marketing, or community initiatives."
        }
      ]
    },
    {
      title: "Fundraising Process",
      icon: <PaidOutlined fontSize="large" color="primary" />,
      questions: [
        {
          question: "How do I create a fundraising campaign?",
          answer: "Creating a campaign is simple: 1) Connect your wallet, 2) Navigate to 'Create Campaign', 3) Fill in your project details, token information, and funding goals, 4) Set your campaign duration and milestones, 5) Customize your campaign page with media and description, 6) Submit for review. Once approved, your campaign goes live!"
        },
        {
          question: "What types of projects are suitable for Lakkhi Fund?",
          answer: "Lakkhi Fund is ideal for Web3 projects, token initiatives, DeFi protocols, DAOs, NFT projects, blockchain games, and any good causes that want to leverage tokenized fundraising. Both established tokens and newer projects can benefit from our platform."
        },
        {
          question: "How long can my fundraising campaign run?",
          answer: "Campaign durations are flexible. You can set campaigns to run anywhere from a few days to several months, depending on your funding needs and project timeline."
        },
        {
          question: "Can I edit my campaign after it's launched?",
          answer: "Yes, you can update your campaign description, add updates, and modify certain non-financial details. However, for integrity reasons, funding goals, token address, and campaign duration cannot be changed after launch."
        },
        {
          question: "What happens if my campaign doesn't reach its funding goal?",
          answer: "Lakkhi Fund offers flexible funding options. You can choose between 'All-or-Nothing' where funds are returned to contributors if the goal isn't met, or 'Keep-What-You-Raise' where you receive whatever amount was raised regardless of meeting your goal."
        }
      ]
    },
    {
      title: "Card Payments & Tokens",
      icon: <CreditCardOutlined fontSize="large" color="primary" />,
      questions: [
        {
          question: "How do credit card contributions work with tokens?",
          answer: "When a supporter contributes via credit card, our system automatically converts the fiat payment to your specified token through integrated liquidity providers. This means even non-crypto users can effectively contribute in your token, expanding your potential contributor base significantly."
        },
        {
          question: "What currencies are accepted for card payments?",
          answer: "We accept most major currencies including USD, EUR, GBP, JPY, CAD, AUD, and many others. The payment is then converted to your token at the current market rate at the time of transaction."
        },
        {
          question: "Are there fees for credit card transactions?",
          answer: "Credit card transactions incur a small processing fee of 3.5% to cover payment processor charges and token swap fees. This is industry standard and ensures smooth conversion from fiat to your token."
        },
        {
          question: "How quickly are card payments converted to tokens?",
          answer: "Card payments are typically converted to tokens within minutes of the transaction being confirmed. The tokens are then automatically sent to the campaign's smart contract."
        },
        {
          question: "Do contributors receive tokens when they donate via card?",
          answer: "Contributors who donate via card don't directly receive tokens, but their contribution is converted to your token and added to the campaign pool. If you offer token rewards or incentives as part of your campaign, these can be distributed to all contributors regardless of payment method."
        }
      ]
    },
    {
      title: "Security & Transparency",
      icon: <SecurityOutlined fontSize="large" color="primary" />,
      questions: [
        {
          question: "How secure is the fundraising process?",
          answer: "All campaigns utilize secure smart contracts that have been audited by leading security firms. Funds are held in these contracts until explicitly released according to your predetermined milestones, providing security for both campaign creators and contributors."
        },
        {
          question: "Can contributors see how funds are being used?",
          answer: "Absolutely! All fund movements are recorded on the blockchain and visible through our transparent campaign dashboard. Additionally, campaign owners can post updates explaining how funds are being utilized, enhancing trust and community engagement."
        },
        {
          question: "What happens to the tokens during the campaign?",
          answer: "Contributed tokens are securely held in the campaign's smart contract until the release conditions are met. This ensures that funds can only be released according to the predefined milestones and requirements."
        },
        {
          question: "Are the smart contracts audited?",
          answer: "Yes, all smart contracts used by Lakkhi Fund have undergone rigorous security audits by reputable firms in the blockchain security space. Audit reports are publicly available on our documentation site."
        },
        {
          question: "How do you prevent fraudulent campaigns?",
          answer: "We implement a verification process for campaign creators, requiring identity verification and project validation before campaigns go live. Additionally, our community can report suspicious activities, and our team continuously monitors all campaigns."
        }
      ]
    },
    {
      title: "Marketing & Visibility",
      icon: <BarChartOutlined fontSize="large" color="primary" />,
      questions: [
        {
          question: "How does Lakkhi Fund help promote my campaign?",
          answer: "Your campaign gets featured on our platform which has a growing community of crypto enthusiasts and donors. Additionally, we provide social sharing tools, campaign analytics, and various promotional opportunities. Premium campaigns can also be featured in our newsletter, social media channels, and partner networks."
        },
        {
          question: "Can I integrate my campaign with my existing community?",
          answer: "Yes! We provide embeddable widgets, shareable links, and social media integration to help you promote your campaign within your existing community channels. You can also use our API for custom integrations with your website or app."
        },
        {
          question: "What analytics do you provide for campaign performance?",
          answer: "Our comprehensive analytics dashboard shows real-time data on contributions, contributor demographics, traffic sources, conversion rates, and social sharing metrics. This helps you optimize your campaign strategy and understand your supporter base better."
        },
        {
          question: "Can I offer rewards or incentives to contributors?",
          answer: "Absolutely! You can set up tiered reward structures based on contribution amounts. These can include exclusive content, community roles, NFTs, early access to features, or additional tokens. Incentives often lead to higher contribution amounts and more engagement."
        },
        {
          question: "How can I keep my contributors engaged throughout the campaign?",
          answer: "Our platform includes tools for posting regular updates, hosting virtual events, conducting polls, and sending notifications. Keeping contributors engaged increases the likelihood of additional contributions and sharing within their networks."
        }
      ]
    },
    {
      title: "Legal & Compliance",
      icon: <AccountBalanceOutlined fontSize="large" color="primary" />,
      questions: [
        {
          question: "What legal requirements should I be aware of?",
          answer: "While Lakkhi Fund provides the technical platform for fundraising, campaign creators are responsible for complying with relevant securities laws, anti-money laundering regulations, and tax obligations in their jurisdictions. We recommend consulting with legal experts specializing in blockchain and fundraising."
        },
        {
          question: "Are there any restricted jurisdictions?",
          answer: "Due to varying regulatory environments, certain jurisdictions may have restrictions on creating or contributing to campaigns. Please review our Terms of Service for the current list of restricted jurisdictions."
        },
        {
          question: "Do I need to KYC to create a campaign?",
          answer: "Yes, we require basic KYC (Know Your Customer) verification for campaign creators to maintain platform integrity and comply with financial regulations. This process is streamlined and secure."
        },
        {
          question: "How are taxes handled for contributions?",
          answer: "Tax treatment varies by jurisdiction and contribution type. Campaign creators should issue appropriate receipts and documentation to contributors. We provide reports of all transactions for your accounting purposes, but do not provide tax advice."
        },
        {
          question: "What happens if regulations change during my campaign?",
          answer: "Our legal team monitors regulatory developments closely. If significant regulatory changes occur, we'll work with you to ensure compliance, which may involve adjusting campaign parameters or providing additional documentation."
        }
      ]
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #1a237e 0%, #534bae 100%)',
          color: 'white',
          py: 6
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom align="center">
            Frequently Asked Questions
          </Typography>
          <Typography variant="h6" component="h2" align="center" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
            Everything you need to know about fundraising for your Web3 project or token on Lakkhi Fund
          </Typography>
        </Container>
      </Box>

      {/* FAQ Categories Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={3}>
          {faqCategories.map((category, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 3, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 3
                  }
                }}
              >
                <Box sx={{ mb: 2 }}>
                  {category.icon}
                </Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  {category.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {category.questions.length} questions
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* FAQ Questions Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 6 }}>
        <Container maxWidth="md">
          {faqCategories.map((category, categoryIndex) => (
            <Box key={categoryIndex} sx={{ mb: 6 }}>
              <Typography variant="h4" component="h2" gutterBottom>
                {category.title}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {category.questions.map((faq, faqIndex) => (
                <Accordion 
                  key={faqIndex}
                  expanded={expanded === `${categoryIndex}-${faqIndex}`} 
                  onChange={handleChange(`${categoryIndex}-${faqIndex}`)}
                  sx={{ 
                    mb: 2,
                    '&::before': {
                      display: 'none',
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel${categoryIndex}-${faqIndex}-content`}
                    id={`panel${categoryIndex}-${faqIndex}-header`}
                  >
                    <Typography variant="h6" component="h3">
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ))}
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 6 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Still have questions?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            Our team is ready to help you get started with your fundraising campaign
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large" 
              component={Link} 
              to="/contact"
              sx={{ px: 4 }}
            >
              Contact Us
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              component={Link} 
              to="/docs"
              sx={{ px: 4 }}
            >
              Documentation
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default FAQ; 