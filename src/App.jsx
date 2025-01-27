import './App.css';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Layout from './components/shared/Layout';
import Profile from './pages/Profile';

import { Routes, Route, Navigate } from "react-router-dom";

import PropTypes from 'prop-types';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);

const formFields = {
  signUp: {
    email: {
      order:1
    },
    preferred_username: {
      order: 2
    },
    phone_number: {
      order: 3,
      dialCode: '+84'
    },
    birthdate: {
      order: 4
    },
    password: {
      order: 5
    },
    confirm_password: {
      order: 6
    }
  },
}

const signUpAttributes=['birthdate', 'preferred_username', 'phone_number']

function RequireAuth({ children }) {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  if (authStatus !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Authenticator.Provider>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route 
          path="/login" 
          element={
            <Authenticator formFields={formFields} signUpAttributes={signUpAttributes}>
              {({ user }) => (
                user ? (
                  <Navigate to='/dashboard' replace />
                ) : (
                  <Home />
                )
              )}
            </Authenticator>
          } 
        />

        <Route 
          path='/dashboard'
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path='profile' element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Authenticator.Provider>
  );
}

RequireAuth.propTypes = {
  children: PropTypes.node.isRequired,
};

export default App;