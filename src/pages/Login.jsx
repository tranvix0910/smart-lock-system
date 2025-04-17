import { useTheme, View, Text, Heading, Button } from "@aws-amplify/ui-react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { MdLock, MdFingerprint, MdCreditCard, MdSecurity } from "react-icons/md";
import { FaFaceSmile } from "react-icons/fa6";

// CSS tùy chỉnh
const customStyles = `
  [data-amplify-authenticator] {
    --amplify-components-button-primary-background-color: #2563eb;
    --amplify-components-button-primary-hover-background-color: #1d4ed8;
    --amplify-components-button-primary-focus-background-color: #1d4ed8;
    --amplify-components-fieldcontrol-focus-border-color: #3b82f6;
    --amplify-components-tabs-item-active-color: #2563eb;
    --amplify-components-tabs-item-active-border-color: #2563eb;
    --amplify-components-button-link-color: #2563eb;
    --amplify-components-button-link-hover-color: #1d4ed8;
    max-width: 500px;
    margin: 0 auto;
    border-radius: 12px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  
  .amplify-button[data-variation='primary'] {
    border-radius: 6px;
    font-weight: 500;
  }
  
  .amplify-input, .amplify-select {
    border-radius: 6px;
  }
  
  body {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  }
  
  .text-primary {
    color: #2563eb !important;
  }
  
  .text-primary-dark {
    color: #1d4ed8 !important;
  }
`;

const components = {
  Header() {
    const { tokens } = useTheme();

    return (
      <View textAlign="center" padding={tokens.space.xl}>
        <div className="flex items-center justify-center">
          <MdSecurity className="text-3xl text-primary mr-2" style={{ color: '#2563eb' }} />
          <span className="text-xl font-bold text-primary" style={{ color: '#2563eb' }}>Smart Lock System</span>
        </div>
      </View>
    );
  },

  Footer() {
    const { tokens } = useTheme();

    return (
      <View textAlign="center" padding={tokens.space.medium}>
        <Text color={tokens.colors.neutral[80]} style={{ fontSize: '0.875rem' }}>
          &copy; {new Date().getFullYear()} Smart Lock System - All Rights Reserved
        </Text>
      </View>
    );
  },

  SignIn: {
    Header() {
      return (
        <div className="px-4 pb-4" style={{ padding: '0 1rem 1rem 1rem' }}>
          <Heading level={3} style={{ 
            marginBottom: '0.5rem', 
            textAlign: 'center', 
            fontWeight: '600',
            color: '#1e293b'
          }}>
            Welcome Back
          </Heading>
          <Text style={{ 
            textAlign: 'center', 
            fontSize: '0.875rem', 
            color: '#64748b',
            marginBottom: '1rem'
          }}>
            Sign in to access your dashboard
          </Text>
          
          <div style={{ 
            background: 'linear-gradient(to right, #eff6ff, #eef2ff)', 
            borderRadius: '0.5rem', 
            padding: '1rem', 
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  borderRadius: '0.5rem', 
                  backgroundColor: '#dbeafe', 
                  color: '#2563eb', 
                  marginRight: '0.75rem' 
                }}>
                  <FaFaceSmile style={{ fontSize: '1.25rem' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>Facial Recognition</h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Advanced biometric security</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  borderRadius: '0.5rem', 
                  backgroundColor: '#dbeafe', 
                  color: '#2563eb', 
                  marginRight: '0.75rem' 
                }}>
                  <MdFingerprint style={{ fontSize: '1.25rem' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>Fingerprint Access</h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Secure fingerprint scanning</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  borderRadius: '0.5rem', 
                  backgroundColor: '#dbeafe', 
                  color: '#2563eb', 
                  marginRight: '0.75rem' 
                }}>
                  <MdCreditCard style={{ fontSize: '1.25rem' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>RFID Card Support</h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Compatible with standard RFID cards</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    },
    Footer() {
      const { toForgotPassword } = useAuthenticator();

      return (
        <View textAlign="center" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.5rem', 
          paddingTop: '0.5rem',
          alignItems: 'center' 
        }}>
          <Button
            fontWeight="normal"
            onClick={toForgotPassword}
            size="small"
            variation="link"
            style={{ color: '#2563eb' }}
          >
            Forgot password?
          </Button>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '0.75rem', 
            color: '#64748b', 
            gap: '0.25rem'
          }}>
            <MdLock style={{ color: '#94a3b8' }} />
            <span>Secured with enterprise-grade encryption</span>
          </div>
        </View>
      );
    },
  },
  SignUp: {
    Header() {
      return (
        <div style={{ padding: '0 1rem 1rem 1rem' }}>
          <Heading level={3} style={{ 
            marginBottom: '0.5rem', 
            textAlign: 'center', 
            fontWeight: '600',
            color: '#1e293b'
          }}>
            Create Account
          </Heading>
          <Text style={{ 
            textAlign: 'center', 
            fontSize: '0.875rem', 
            color: '#64748b',
            marginBottom: '1rem'
          }}>
            Join Smart Lock System and enhance your security
          </Text>
        </div>
      );
    },
    Footer() {
      const { toSignIn } = useAuthenticator();

      return (
        <View textAlign="center">
          <Button
            fontWeight="normal"
            onClick={toSignIn}
            size="small"
            variation="link"
            style={{ color: '#2563eb' }}
          >
            Already have an account? Sign in
          </Button>
        </View>
      );
    },
  },
  ConfirmSignUp: {
    Header() {
      return (
        <div style={{ padding: '0 1rem 1rem 1rem' }}>
          <Heading level={3} style={{ 
            marginBottom: '0.5rem', 
            textAlign: 'center', 
            fontWeight: '600',
            color: '#1e293b'
          }}>
            Confirm Your Account
          </Heading>
          <Text style={{ 
            textAlign: 'center', 
            fontSize: '0.875rem', 
            color: '#64748b',
            marginBottom: '1rem'
          }}>
            Enter the confirmation code sent to your email
          </Text>
        </div>
      );
    },
    Footer() {
      return (
        <div style={{ 
          textAlign: 'center', 
          fontSize: '0.75rem', 
          color: '#64748b', 
          paddingTop: '0.5rem' 
        }}>
          Check your inbox or spam folder for the confirmation code
        </div>
      );
    },
  },
  SetupTotp: {
    Header() {
      return (
        <div style={{ padding: '0 1rem 1rem 1rem' }}>
          <Heading level={3} style={{ 
            marginBottom: '0.5rem', 
            textAlign: 'center', 
            fontWeight: '600',
            color: '#1e293b'
          }}>
            Set Up MFA
          </Heading>
          <Text style={{ 
            textAlign: 'center', 
            fontSize: '0.875rem', 
            color: '#64748b',
            marginBottom: '1rem'
          }}>
            Enhance your account security with multi-factor authentication
          </Text>
        </div>
      );
    },
    Footer() {
      return (
        <div style={{ 
          textAlign: 'center', 
          fontSize: '0.75rem', 
          color: '#64748b', 
          paddingTop: '0.5rem' 
        }}>
          Scan the QR code with an authenticator app like Google Authenticator or Authy
        </div>
      );
    },
  },
  ConfirmSignIn: {
    Header() {
      return (
        <div style={{ padding: '0 1rem 1rem 1rem' }}>
          <Heading level={3} style={{ 
            marginBottom: '0.5rem', 
            textAlign: 'center', 
            fontWeight: '600',
            color: '#1e293b'
          }}>
            Verify Your Identity
          </Heading>
          <Text style={{ 
            textAlign: 'center', 
            fontSize: '0.875rem', 
            color: '#64748b',
            marginBottom: '1rem'
          }}>
            Enter the verification code to continue
          </Text>
        </div>
      );
    },
    Footer() {
      return (
        <div style={{ 
          textAlign: 'center', 
          fontSize: '0.75rem', 
          color: '#64748b', 
          paddingTop: '0.5rem' 
        }}>
          This additional step helps keep your account secure
        </div>
      );
    },
  },
  ForgotPassword: {
    Header() {
      return (
        <div style={{ padding: '0 1rem 1rem 1rem' }}>
          <Heading level={3} style={{ 
            marginBottom: '0.5rem', 
            textAlign: 'center', 
            fontWeight: '600',
            color: '#1e293b'
          }}>
            Reset Password
          </Heading>
          <Text style={{ 
            textAlign: 'center', 
            fontSize: '0.875rem', 
            color: '#64748b',
            marginBottom: '1rem'
          }}>
            Enter your email to receive password reset instructions
          </Text>
        </div>
      );
    },
    Footer() {
      return (
        <div style={{ 
          textAlign: 'center', 
          fontSize: '0.75rem', 
          color: '#64748b', 
          paddingTop: '0.5rem' 
        }}>
          We&apos;ll send instructions to your registered email address
        </div>
      );
    },
  },
  ConfirmResetPassword: {
    Header() {
      return (
        <div style={{ padding: '0 1rem 1rem 1rem' }}>
          <Heading level={3} style={{ 
            marginBottom: '0.5rem', 
            textAlign: 'center', 
            fontWeight: '600',
            color: '#1e293b'
          }}>
            Create New Password
          </Heading>
          <Text style={{ 
            textAlign: 'center', 
            fontSize: '0.875rem', 
            color: '#64748b',
            marginBottom: '1rem'
          }}>
            Enter the code and your new password
          </Text>
        </div>
      );
    },
    Footer() {
      return (
        <div style={{ 
          textAlign: 'center', 
          fontSize: '0.75rem', 
          color: '#64748b', 
          paddingTop: '0.5rem' 
        }}>
          Create a strong password with a mix of letters, numbers and symbols
        </div>
      );
    },
  },
  SelectMfaType: {
    Header() {
      return (
        <div style={{ padding: '0 1rem 1rem 1rem' }}>
          <Heading level={3} style={{ 
            marginBottom: '0.5rem', 
            textAlign: 'center', 
            fontWeight: '600',
            color: '#1e293b'
          }}>
            Choose MFA Method
          </Heading>
          <Text style={{ 
            textAlign: 'center', 
            fontSize: '0.875rem', 
            color: '#64748b',
            marginBottom: '1rem'
          }}>
            Select your preferred multi-factor authentication method
          </Text>
        </div>
      );
    },
    Footer() {
      return (
        <div style={{ 
          textAlign: 'center', 
          fontSize: '0.75rem', 
          color: '#64748b', 
          paddingTop: '0.5rem' 
        }}>
          Adding MFA significantly enhances your account security
        </div>
      );
    },
  },
  SetupEmail: {
    Header() {
      return (
        <div style={{ padding: '0 1rem 1rem 1rem' }}>
          <Heading level={3} style={{ 
            marginBottom: '0.5rem', 
            textAlign: 'center', 
            fontWeight: '600',
            color: '#1e293b'
          }}>
            Email MFA Setup
          </Heading>
          <Text style={{ 
            textAlign: 'center', 
            fontSize: '0.875rem', 
            color: '#64748b',
            marginBottom: '1rem'
          }}>
            Verification codes will be sent to your email
          </Text>
        </div>
      );
    },
    Footer() {
      return (
        <div style={{ 
          textAlign: 'center', 
          fontSize: '0.75rem', 
          color: '#64748b', 
          paddingTop: '0.5rem' 
        }}>
          Make sure you have access to your email before proceeding
        </div>
      );
    },
  },
};

export { components, customStyles };