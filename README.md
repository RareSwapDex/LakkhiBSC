# Lakkhi BSC

A BSC blockchain-based fundraising platform that allows users to create campaigns, donate with BNB, and manage fundraising activities.

## Features

- Create and manage campaigns with blockchain integration
- Support for BSC, Ethereum, Solana, and Base blockchains
- Token swap functionality via PancakeSwap
- Smart contract creation for campaigns

## Setup

### Backend (Django)

```
cd integrated-app/backend
python3 manage.py migrate
python3 manage.py runserver 8080
```

### Frontend (React)

```
cd integrated-app/frontend
npm install
npm start
```

## Environment Variables

Update the .env files in both backend and frontend directories before deploying.
