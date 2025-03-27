import React from 'react';
import { Container } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';

const WhitepaperPage = () => {
  const whitepaper = `
# Lakkhi Fund: A Decentralized Fundraising Platform for Web3 Token Projects
**Version 1.0.2**

## Abstract

This whitepaper introduces Lakkhi Fund, a decentralized crowdfunding platform designed specifically for Web3 projects and token creators. Unlike traditional fundraising platforms, Lakkhi Fund allows projects to raise funds in their own tokens while enabling contributions from both crypto and non-crypto users. The platform incorporates advanced gas fee optimization, wallet-based authentication, and token customization to create a seamless fundraising experience while providing tangible benefits to token economies.

## 1. Introduction

### 1.1 Problem Statement

Web3 projects and token creators face significant challenges when raising funds:

- Traditional crowdfunding platforms don't support token-based fundraising
- Existing crypto platforms create friction for non-crypto users
- High gas fees discourage small contributions
- Projects need to create utility for their tokens to increase adoption
- Centralized platforms require trust in intermediaries

Lakkhi Fund addresses these challenges through a decentralized approach that puts projects and their tokens at the center of the fundraising process.

### 1.2 Vision

Our vision is to create a global fundraising platform where any Web3 project can easily raise funds in their own token while simultaneously:

1. Increasing token visibility and utility
2. Creating buying pressure for the token
3. Reducing circulating supply
4. Reaching both crypto and non-crypto contributors

## 2. Platform Architecture

### 2.1 System Overview

Lakkhi Fund combines blockchain technology with user-friendly interfaces to create a seamless fundraising experience. The platform consists of:

1. **Frontend Application**: React-based user interface for campaign creation, management, and contributions
2. **Backend API**: Django-based system that handles business logic, authentication, and blockchain interactions
3. **Smart Contracts**: Ethereum/BSC compatible contracts for token staking and fund management
4. **Decentralized Wallet System**: Wallet-based authentication and verification

### 2.2 Key Technical Components

#### 2.2.1 Custom Token Integration

Projects can specify any ERC20/BEP20 token for their fundraising campaign. The system:
- Validates token contracts on-chain
- Retrieves token metadata (name, symbol, decimals, supply)
- Configures smart contracts to work with the specified token
- Provides caching mechanisms to optimize blockchain calls

#### 2.2.2 Decentralized Authentication

Unlike traditional platforms, Lakkhi Fund uses wallet addresses for authentication:
- Users connect their Web3 wallets (MetaMask, WalletConnect, etc.)
- Signature-based verification proves wallet ownership
- Campaign ownership is tied directly to wallet addresses
- No username/password combinations to manage or secure

#### 2.2.3 Gas Fee Optimization

To minimize transaction costs, the platform incorporates:
- Dynamic gas pricing (90-92% of current gas price)
- Smart gas estimation based on operation complexity
- Multi-level caching to reduce blockchain calls
- Batch processing for certain operations

#### 2.2.4 Credit Card to Token Bridge

A key innovation of Lakkhi Fund is the ability for non-crypto users to contribute via credit card:
- Credit card payments are automatically converted to the project's token
- This creates buying pressure for the token
- Contributors receive the equivalent amount of tokens
- Project owners receive funds in their preferred token
`;

  return (
    <Container className="my-5">
      <article className="markdown-body">
        <ReactMarkdown>{whitepaper}</ReactMarkdown>
      </article>
    </Container>
  );
};

export default WhitepaperPage;
