# Smart Lock Software

A modern web application for managing smart locks, biometric access, and device security. This system allows users to manage devices, monitor access logs, and control biometric authentication methods including fingerprints, facial recognition, and RFID cards.

## Features

- **User Authentication**: Secure login using AWS Amplify and Cognito
- **Dashboard**: Real-time monitoring of lock status and access statistics
- **Device Management**: Add, configure, and control smart lock devices
- **Biometric Authentication**:
  - Fingerprint management
  - Facial recognition
  - RFID card control
- **Access Logs**: Comprehensive history of all access attempts with detailed information
- **User Profile**: Personal information management and account settings
- **Real-time Updates**: Using WebSocket connections to receive instant device status updates

## Technology Stack

- **Frontend**:
  - React with Vite
  - Tailwind CSS for styling
  - React Router for navigation
  - Redux Toolkit for state management
  - React Icons for UI elements
  - Recharts for data visualization
  
- **Backend**:
  - AWS Amplify for authentication and API management
  - WebSockets for real-time communication
  - AWS services integration

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Project Structure

- `src/api/`: API integration and request handlers
- `src/assets/`: Static assets like images
- `src/components/`: Reusable UI components
  - `BiometricManagement/`: Components for managing biometric access
  - `Dashboard/`: Dashboard related components
  - `DeviceModal/`: Device management modals
  - `Shared/`: Common components used across the application
- `src/config/`: Configuration files including WebSocket setup
- `src/hooks/`: Custom React hooks
- `src/lib/`: Utility libraries
- `src/pages/`: Main page components
- `src/utils/`: Helper functions and utilities

## Key Components

### Biometric Management

- **Fingerprint**: Enroll and manage fingerprint access
- **FaceID**: Facial recognition enrollment and management
- **RFID**: RFID card registration and control

### Device Management

- Device configuration
- Unlock mechanisms
- Access permissions

### Access Monitoring

- Real-time access logs
- Filtering and search functionality
- Visual access history

## Styling

The application uses a consistent design system with:
- Primary colors: `#24303f` (dark blue) and `#ebf45d` (yellow)
- Modern UI with card-based layouts
- Responsive design for all screen sizes
- Consistent modal and notification systems

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
