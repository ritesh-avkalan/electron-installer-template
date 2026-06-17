import React from 'react';
import { AuthProvider, useAuth } from './context/auth-context';
import { ProjectsProvider } from './context/projects-context';
import { LoginScreen } from './components/LoginScreen';
import { MyProjectsScreen } from './components/MyProjectsScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-secondary)',
        gap: '16px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--accent-color)',
          borderRadius: '50%',
          animation: 'rotate-orbit 1s linear infinite'
        }} />
        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Initializing ESD Environment...</span>
      </div>
    );
  }

  if (!profile) {
    return <LoginScreen />;
  }

  return <>{children}</>;
};

const MainAppContent: React.FC = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-secondary)',
        gap: '16px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--accent-color)',
          borderRadius: '50%',
          animation: 'rotate-orbit 1s linear infinite'
        }} />
        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Initializing ESD Environment...</span>
      </div>
    );
  }

  return profile ? (
    <ProtectedRoute>
      <MyProjectsScreen />
    </ProtectedRoute>
  ) : (
    <LoginScreen />
  );
};

function App() {
  return (
    <AuthProvider>
      <ProjectsProvider>
        <MainAppContent />
      </ProjectsProvider>
    </AuthProvider>
  );
}

export default App;
