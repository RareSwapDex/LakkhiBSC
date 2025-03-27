# Lakkhi Fundraising Platform

A BSC blockchain-based fundraising platform that allows users to create campaigns, donate with credit cards, and manage fundraising activities.

## Features

### Campaign Creation and Management
- Create campaigns with detailed information
- Set funding goals and campaign duration
- Add incentives/rewards for donors
- Track campaign progress

### Donation Flow
- Donate to campaigns using credit cards
- Automatic wallet creation linked to email
- BNB purchase through Mercuryo integration
- Token swap on the backend
- Smart contract integration for fund management

## Project Structure

This project consists of two main components:

### Backend (Django)
- Built with Django and Django REST Framework
- Handles user authentication and campaign management
- Custom wallet solution for blockchain operations
- Processes payments through Mercuryo

### Frontend (React)
- Built with React and React Bootstrap
- User-friendly interface for campaign browsing and donation
- Admin panel for campaign creation and management

## Installation

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Apply migrations:
   ```
   python manage.py migrate
   ```

5. Run the server:
   ```
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Configuration

### Backend Configuration
- Set up environment variables in `.env` file for tokens and API keys
- Configure wallet API credentials
- Set up Mercuryo integration for payment processing

### Frontend Configuration
- Configure API endpoint in `.env` file

## Testing BSC Mainnet on Localhost

To test the BSC mainnet blockchain integration with localhost:

1. Set up environment variables (replace with your values):
   ```
   # In a terminal window:
   export WALLET_API_KEY=your-wallet-api-key
   export WALLET_SECRET=your-wallet-secret
   export ADMIN_PRIVATE_KEY=your-admin-wallet-private-key
   export ADMIN_ADDRESS=your-admin-wallet-address
   ```

2. Start the backend (Django):
   ```
   cd integrated-app/backend
   python manage.py runserver
   ```

3. In a new terminal, start the frontend (React):
   ```
   cd integrated-app/frontend
   npm install  # Only needed first time
   npm start
   ```

4. Access the application at http://localhost:3000

5. For blockchain operations:
   - Make sure you have MetaMask installed with BSC Mainnet configured
   - The token address is currently set to: 0x264387ad73d19408e34b5d5e13a93174a35cea33
   - All blockchain operations will be performed on BSC mainnet
   - The application will swap BNB to LAKKHI via PancakeSwap

## API Endpoints

### Campaign Management
- `GET /api/projects/`: List all campaigns
- `GET /api/projects/:id/`: Get campaign details
- `POST /api/projects/add/`: Create a new campaign
- `PUT /api/projects/:id/publish/`: Publish a campaign

### Donation Processing
- `POST /api/wallet/create/`: Create a wallet for a user
- `POST /api/payment/process/`: Process a payment
- `POST /api/payment/mercuryo/callback/`: Handle Mercuryo payment callbacks

## License

This project is proprietary and confidential. 