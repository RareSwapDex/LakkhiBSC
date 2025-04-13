const whitepaperContent = {
  logo: "/images/logo-final.png",
  primaryColor: "#f39c12",
  secondaryColor: "#2ecc71",
  title: "Lakkhi Fund Whitepaper",
  subtitle: "Token-Based Fundraising with 100% Donation Pass-Through",
  version: "v1.2",
  sections: [
    {
      id: "introduction",
      title: "1. Introduction",
      content: [
        {
          type: "heading",
          text: "1.1 Problem Statement"
        },
        {
          type: "paragraph",
          text: "Web3 projects and token creators face significant challenges when raising funds:"
        },
        {
          type: "list",
          items: [
            "Traditional crowdfunding platforms don't support token-based fundraising",
            "Existing crypto platforms create friction for non-crypto users",
            "High gas fees discourage small contributions",
            "Projects need to create utility for their tokens to increase adoption",
            "Centralized platforms take excessive fees from donations, reducing impact",
            "Lack of transparency in how funds are managed and distributed"
          ]
        },
        {
          type: "paragraph",
          text: "Lakkhi Fund addresses these challenges through a decentralized approach that puts projects and their tokens at the center of the fundraising process, ensuring 100% of donations reach the intended recipients."
        },
        {
          type: "heading",
          text: "1.2 Vision"
        },
        {
          type: "paragraph",
          text: "Our vision is to create a global fundraising platform where any Web3 project can easily raise funds in their own token while simultaneously:"
        },
        {
          type: "list",
          items: [
            "Ensuring 100% of donations go directly to projects",
            "Increasing token visibility and utility",
            "Creating buying pressure for the token",
            "Reducing circulating supply",
            "Reaching both crypto and non-crypto contributors",
            "Providing complete transparency through blockchain technology"
          ]
        }
      ]
    },
    {
      id: "platform-architecture",
      title: "2. Platform Architecture",
      content: [
        {
          type: "heading",
          text: "2.1 System Overview"
        },
        {
          type: "paragraph",
          text: "Lakkhi Fund combines blockchain technology with user-friendly interfaces to create a seamless fundraising experience. The platform consists of:"
        },
        {
          type: "list",
          items: [
            "Frontend Application: React-based user interface for campaign creation, management, and contributions",
            "Backend API: Django-based system that handles business logic, authentication, and blockchain interactions",
            "Smart Contracts: Ethereum/BSC compatible contracts for token staking and fund management",
            "Decentralized Wallet System: Wallet-based authentication and verification",
            "Direct Fund Routing: Ensures 100% of donations go straight to project wallets"
          ]
        },
        {
          type: "heading",
          text: "2.2 Key Technical Components"
        },
        {
          type: "subheading",
          text: "2.2.1 Custom Token Integration"
        },
        {
          type: "paragraph",
          text: "Projects can specify any ERC20/BEP20 token for their fundraising campaign. The system:"
        },
        {
          type: "list",
          items: [
            "Validates token contracts on-chain",
            "Retrieves token metadata (name, symbol, decimals, supply)",
            "Configures smart contracts to work with the specified token",
            "Provides caching mechanisms to optimize blockchain calls",
            "Ensures compatibility with major exchanges and wallets"
          ]
        },
        {
          type: "subheading",
          text: "2.2.2 Decentralized Authentication"
        },
        {
          type: "paragraph",
          text: "Unlike traditional platforms, Lakkhi Fund uses wallet addresses for authentication:"
        },
        {
          type: "list",
          items: [
            "Users connect their Web3 wallets (MetaMask, WalletConnect, etc.)",
            "Signature-based verification proves wallet ownership",
            "Campaign ownership is tied directly to wallet addresses",
            "No username/password combinations to manage or secure",
            "Complete ownership control for project creators"
          ]
        },
        {
          type: "subheading",
          text: "2.2.3 Gas Fee Optimization"
        },
        {
          type: "paragraph",
          text: "To minimize transaction costs, the platform incorporates:"
        },
        {
          type: "list",
          items: [
            "Dynamic gas pricing (90-92% of current gas price)",
            "Smart gas estimation based on operation complexity",
            "Multi-level caching to reduce blockchain calls",
            "Batch processing for certain operations",
            "Layer 2 support for reduced gas costs (upcoming)"
          ]
        },
        {
          type: "subheading",
          text: "2.2.4 Credit Card to Token Bridge"
        },
        {
          type: "paragraph",
          text: "A key innovation of Lakkhi Fund is the ability for non-crypto users to contribute via credit card:"
        },
        {
          type: "list",
          items: [
            "Credit card payments are automatically converted to the project's token",
            "This creates buying pressure for the token",
            "Contributors receive the equivalent amount of tokens",
            "Project owners receive 100% of funds in their preferred token",
            "Seamless experience for non-crypto users"
          ]
        }
      ]
    },
    {
      id: "token-customization",
      title: "3. Token Customization System",
      content: [
        {
          type: "heading",
          text: "3.1 Technical Implementation"
        },
        {
          type: "paragraph",
          text: "The token customization system enables projects to use their own token for fundraising:"
        },
        {
          type: "list",
          items: [
            "Backend database stores the token address with each project",
            "API endpoints validate token contracts and retrieve metadata",
            "Smart contracts are dynamically configured with the specified token",
            "Frontend components allow selection and validation of tokens",
            "Token metrics dashboard shows real-time performance"
          ]
        },
        {
          type: "heading",
          text: "3.2 Benefits for Projects"
        },
        {
          type: "paragraph",
          text: "Using custom tokens provides several advantages:"
        },
        {
          type: "list",
          items: [
            "Increased Utility: Creates a new use case for the project's token",
            "Enhanced Visibility: Exposes the token to new potential holders",
            "Supply Management: Contributes to reducing circulating supply",
            "Market Impact: Creates buying pressure through credit card conversions",
            "Community Building: Fosters a stronger token-based community",
            "Token Value: Potential positive impact on token value through increased demand"
          ]
        }
      ]
    },
    {
      id: "wallet-implementation",
      title: "4. Decentralized Wallet Implementation",
      content: [
        {
          type: "heading",
          text: "4.1 Architecture"
        },
        {
          type: "paragraph",
          text: "The platform uses a fully decentralized wallet system:"
        },
        {
          type: "list",
          items: [
            "Replaced centralized wallet services with direct blockchain interaction",
            "Implemented cryptographic signature verification for security",
            "Connected wallet addresses serve as campaign owners",
            "Smart contracts are deployed with wallet owners as beneficiaries",
            "Direct payment routing ensures 100% of donations reach projects"
          ]
        },
        {
          type: "heading",
          text: "4.2 Security Considerations"
        },
        {
          type: "list",
          items: [
            "Signature-based verification ensures only wallet owners can create campaigns",
            "Funds are directly controlled by wallet owners through smart contracts",
            "No platform database access is needed to manage funds",
            "Critical operations require wallet signature verification",
            "Regular security audits by third-party experts",
            "Open-source codebase for transparency and community review"
          ]
        }
      ]
    },
    {
      id: "gas-optimization",
      title: "5. Gas Fee Optimization Strategy",
      content: [
        {
          type: "heading",
          text: "5.1 Technical Implementation"
        },
        {
          type: "paragraph",
          text: "Gas fees are optimized through several mechanisms:"
        },
        {
          type: "list",
          items: [
            "Dynamic pricing uses 90-92% of current gas price to reduce costs",
            "Smart estimation adjusts limits based on token complexity and operation type",
            "Transaction fee display shows estimated costs before confirmation",
            "Different strategies for creators (cost optimization) vs. contributors (balance between cost and speed)",
            "EIP-1559 support for more predictable transaction fees"
          ]
        },
        {
          type: "heading",
          text: "5.2 Performance Enhancement"
        },
        {
          type: "paragraph",
          text: "Multi-level caching significantly improves platform performance:"
        },
        {
          type: "list",
          items: [
            "Token information cached for 24 hours",
            "Popular tokens list cached for 1 hour",
            "Background cache updater refreshes token information periodically",
            "Response compression optimizes API responses",
            "CDN integration for static assets",
            "Optimized frontend bundle size for faster loading"
          ]
        }
      ]
    },
    {
      id: "user-experience",
      title: "6. User Experience",
      content: [
        {
          type: "heading",
          text: "6.1 For Project Creators"
        },
        {
          type: "paragraph",
          text: "Project creators benefit from:"
        },
        {
          type: "list",
          items: [
            "Simple Campaign Creation: Intuitive interface for creating campaigns",
            "Token Selection: Ability to use their own token for fundraising",
            "Campaign Management: Tools for updates, analytics, and communication",
            "Multiple Payment Options: Accept both token and credit card contributions",
            "100% Donation Pass-Through: All donations go directly to your project",
            "Transparent Fee Structure: One-time campaign creation fee with no hidden costs"
          ]
        },
        {
          type: "heading",
          text: "6.2 For Contributors"
        },
        {
          type: "paragraph",
          text: "Contributors enjoy:"
        },
        {
          type: "list",
          items: [
            "Flexible Contribution: Contribute with crypto or credit card",
            "Token Transparency: Clear information about which token they're receiving",
            "Cost Efficiency: Optimized gas fees for crypto contributors",
            "No Crypto Knowledge Required: Credit card users don't need wallets or tokens",
            "Maximum Impact: 100% of your donation reaches the project",
            "Trust and Verification: Blockchain-based verification of fund movement"
          ]
        }
      ]
    },
    {
      id: "business-model",
      title: "7. Business Model",
      content: [
        {
          type: "heading",
          text: "7.1 Fee Structure"
        },
        {
          type: "paragraph",
          text: "Lakkhi Fund's transparent fee structure ensures maximum impact for donors:"
        },
        {
          type: "list",
          items: [
            "Campaign Creation Fee: One-time fee paid by project creators during campaign setup (coming soon)",
            "Zero Donation Fees: 100% of all donations go directly to the projects",
            "No Hidden Costs: All platform fees are clearly disclosed upfront",
            "Third-Party Processing: Credit card processor fees are separate and not kept by Lakkhi Fund"
          ]
        },
        {
          type: "heading",
          text: "7.2 Sustainability"
        },
        {
          type: "paragraph",
          text: "Our business model is designed to balance platform sustainability with maximizing impact:"
        },
        {
          type: "list",
          items: [
            "Creator-Supported: Project creators, not donors, support platform costs",
            "Zero Donation Skimming: Unlike traditional platforms that take 5-10% of donations",
            "Transparent Operations: Clear separation between platform revenue and project funds",
            "Efficient Cost Structure: Optimized operations to keep campaign creation fees reasonable",
            "Value-Driven: Fees aligned with the value received by project creators"
          ]
        },
        {
          type: "heading",
          text: "7.3 Campaign Creation Fee Details"
        },
        {
          type: "paragraph",
          text: "The upcoming campaign creation fee will include:"
        },
        {
          type: "list",
          items: [
            "Smart Contract Deployment: Covers gas costs for contract creation",
            "Token Integration: Technical implementation of custom token support",
            "Campaign Hosting: Ongoing availability of campaign page and materials",
            "Support Services: Technical assistance for campaign creators",
            "Analytics Dashboard: Access to comprehensive performance metrics"
          ]
        }
      ]
    },
    {
      id: "roadmap",
      title: "8. Roadmap",
      content: [
        {
          type: "heading",
          text: "8.1 Current Implementation"
        },
        {
          type: "paragraph",
          text: "The platform currently supports:"
        },
        {
          type: "list",
          items: [
            "Custom token selection for campaigns",
            "Wallet-based authentication and verification",
            "Gas fee optimization",
            "Campaign creation and management",
            "Basic analytics and communication tools",
            "100% donation pass-through to projects"
          ]
        },
        {
          type: "heading",
          text: "8.2 Future Enhancements"
        },
        {
          type: "paragraph",
          text: "Planned improvements include:"
        },
        {
          type: "list",
          items: [
            "Campaign Creation Fee Implementation: Sustainable funding model",
            "Token Whitelisting: Admin controls to limit which tokens can be used",
            "Token Price Feeds: Real-time price information for supported tokens",
            "Multi-token Support: Allow campaigns to accept multiple token types",
            "Layer 2 Integration: Support for L2 solutions to further reduce gas costs",
            "Enhanced Analytics: Deeper insights into campaign performance",
            "Mobile Application: Native mobile experience for both creators and contributors",
            "Expanded Payment Options: Additional fiat gateways for broader reach"
          ]
        }
      ]
    },
    {
      id: "conclusion",
      title: "9. Conclusion",
      content: [
        {
          type: "paragraph",
          text: "Lakkhi Fund represents a new paradigm in Web3 fundraising by placing tokens at the center of the fundraising process while ensuring 100% of donations reach their intended recipients. By allowing projects to raise funds in their own tokens while enabling non-crypto users to participate, the platform creates a powerful ecosystem that benefits all participants."
        },
        {
          type: "paragraph",
          text: "The combination of token customization, decentralized authentication, gas optimization, and our transparent fee structure creates a secure, efficient, and user-friendly platform that addresses the unique needs of Web3 projects and token creators."
        },
        {
          type: "paragraph",
          text: "Lakkhi Fund is not just a fundraising platform—it's a token utility booster and impact maximizer, creating real value for projects and their communities through innovative technology and thoughtful design while ensuring every donation dollar goes directly to the intended cause."
        },
        {
          type: "heading",
          text: "Contact Information"
        },
        {
          type: "paragraph",
          text: "For more information about Lakkhi Fund, please contact us at:"
        },
        {
          type: "list",
          items: [
            "Email: info@lakkhifund.com",
            "Twitter: @LakkhiFund",
            "Telegram: t.me/LakkhiFund",
            "Discord: discord.gg/lakkhifund"
          ]
        }
      ]
    }
  ]
};

export default whitepaperContent;