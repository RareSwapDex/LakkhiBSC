# Campaign Creation Documentation

## Overview

The campaign creation system has been completely redesigned to provide a better user experience with multiple enhancements:

1. **Progress Indicator**: Visual progress tracking across multiple form sections
2. **Form State Persistence**: Auto-saving drafts to prevent data loss
3. **Field-Level Validation**: Real-time feedback as users complete each field
4. **Enhanced Token Validation**: Better token lookup and validation UI
5. **Contract Owner Experience**: Improved wallet address input with ENS support
6. **Form Submission UX**: Confirmation modal with checklist and gas estimates
7. **Mobile Experience**: Responsive design optimized for all devices
8. **Live Preview**: Real-time visualization of how the campaign will look
9. **Error Handling**: Better recovery options and actionable messages
10. **Performance Optimization**: Improved component structure and state management

## Component Structure

### New Components

- **FormProgressBar**: Displays completion status for multi-step forms
- **FormField**: Enhanced form control with built-in validation
- **TokenSelector**: Improved token selection and validation interface
- **ContractOwnerSelector**: Specialized input for wallet addresses with ENS support
- **SubmitConfirmationModal**: Pre-submission review with checklist and gas estimates
- **LivePreview**: Real-time preview of campaign appearance on desktop and mobile

### Custom Hooks

- **useFormPersistence**: Manages form state persistence to localStorage

## File Structure

```
integrated-app/frontend/src/
├── components/
│   ├── ContractOwnerSelector/
│   │   ├── index.js - Contract owner wallet selector with ENS support
│   │   └── styles.css
│   ├── FormField/
│   │   ├── index.js - Enhanced form control with built-in validation
│   │   └── styles.css
│   ├── FormProgressBar/
│   │   ├── index.js - Visual progress indicator for multi-step forms
│   │   └── styles.css
│   ├── LivePreview/
│   │   ├── index.js - Real-time campaign preview component
│   │   └── styles.css
│   ├── SubmitConfirmationModal/
│   │   ├── index.js - Pre-submission review and confirmation
│   │   └── styles.css
│   └── TokenSelector/
│       ├── index.js - Enhanced token selector with validation
│       └── styles.css
├── hooks/
│   └── useFormPersistence.js - Custom hook for form persistence
└── pages/
    └── admin/
        ├── CreateCampaignPage.js - Main campaign creation page
        └── CreateCampaignPage.css - Styles for campaign creation
```

## Key Features Explained

### 1. Progress Indicator

The FormProgressBar component visually represents the user's progress through the multi-step form. It shows:
- Current active step highlighted
- Completed steps with checkmarks
- Overall percentage of completion

Steps are automatically marked as completed when all required fields are valid.

```jsx
<FormProgressBar 
  steps={formSteps} 
  activeStep={activeTab} 
  completedSteps={completedSteps} 
/>
```

### 2. Form State Persistence

The useFormPersistence hook automatically saves form data to localStorage as users navigate between tabs:

```jsx
const [formData, setFormData, persistForm, clearPersistedForm] = useFormPersistence(
  'lakkhi_campaign_form',
  initialFormState,
  false // Save manually rather than on every change
);
```

Features:
- Auto-save when changing tabs
- Manual save button
- 24-hour expiration for saved data
- Clear saved data on form submission

### 3. Field-Level Validation

The FormField component provides immediate validation feedback:

```jsx
<FormField
  label="Campaign Title"
  value={formData.basics.projectTitle}
  onChange={(e) => handleInputChange('basics', 'projectTitle', e.target.value)}
  required
  validate={(val) => val && val.trim().length > 0}
  errorMessage="Campaign title is required"
/>
```

Validation occurs:
- When the field loses focus (onBlur)
- When manually triggered (validateSection)
- When navigating between tabs

### 4. Token Validation UI

The TokenSelector component provides:
- Popular token suggestions by chain
- Token validation with clear feedback
- Market data and price information
- Token details with supply and decimals

### 5. Contract Owner Experience

The ContractOwnerSelector component offers:
- ENS name lookup and resolution (on Ethereum mainnet)
- "My Wallet" quick selection option
- Address format validation
- Clear visual differentiation from creator wallet

### 6. Form Submission UX

The SubmitConfirmationModal provides:
- Campaign summary review
- Estimated gas costs (low/medium/high)
- Pre-submission checklist
- Animated deploying state

### 7. Mobile Experience

Mobile optimizations include:
- Responsive layouts that adjust to screen size
- Touch-friendly input controls
- Optimized preview for mobile view
- Address truncation for small screens

### 8. Live Preview

The LivePreview component shows:
- Real-time visualization of campaign appearance
- Desktop and mobile toggle views
- Tabs for different sections (overview, milestones, team)
- Progress visualization

### 9. Error Handling

Improved error handling includes:
- Field-level validation messages
- Smart contract deployment error recovery
- Network and wallet connection guidance
- Gas estimation errors

### 10. Performance Optimization

Performance improvements include:
- Component splitting for better code organization
- Memoization of expensive renders
- Lazy loading for preview components
- Optimized validation logic

## Usage Guidelines

1. **Form Navigation**: Use the tab navigation or "Next" buttons to move between sections
2. **Validation**: Fields are validated in real-time; errors are shown in red
3. **Saving Progress**: Form is auto-saved when changing tabs; use "Save Draft" for manual save
4. **Token Validation**: Always validate your token before proceeding
5. **Contract Owner**: Double-check the contract owner address as it cannot be changed later
6. **Preview**: Use the preview tab to see how your campaign will appear to supporters
7. **Submission**: Review all details in the confirmation modal before final submission

## Technical Implementation

The campaign creation process follows these technical steps:

1. Form data collection with validation
2. Smart contract validation (token and owner address)
3. Preview generation
4. Pre-submission confirmation
5. Smart contract deployment
6. Backend campaign record creation
7. Redirection to the new campaign page

## Troubleshooting

Common issues and solutions:

1. **Token Not Found**: Verify the token address and blockchain network
2. **ENS Resolution Failed**: Make sure you're connected to Ethereum mainnet
3. **Contract Creation Failed**: Check wallet balance for gas fees
4. **Form Validation Errors**: Look for red error messages and fix all issues
5. **Data Loss**: Try recovering from localStorage with the form persistence feature 