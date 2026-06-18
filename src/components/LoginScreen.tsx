import React, { useState } from 'react';
import { useAuth } from '../context/auth-context';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { ArrowLeft, Mail } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { setGuestMode } = useAuth();
  
  // Modes: 'welcome' | 'login' | 'signup'
  const [mode, setMode] = useState<'welcome' | 'login' | 'signup'>('welcome');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Google sign-in works inside Electron when standard User-Agent is set
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(credential.user, {
          displayName: displayName
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Pane - Form Flow */}
      <div className="login-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/esd.svg" style={{ width: '32px', height: '32px' }} alt="ESD Logo" />
          <span style={{ fontWeight: 600, letterSpacing: '-0.02em', fontSize: '1rem' }}>ESD Desktop</span>
        </div>

        <div className="login-content">
          {mode === 'welcome' && (
            <>
              <div className="login-header-group">
                <h1 className="login-title">Welcome to eigenspacedesign</h1>
                <p className="login-subtitle">
                  ESD is a seamless way to contribute to projects on ESD. Sign in below to get started with your existing projects.
                </p>
                <div className="login-signup-link">
                  New to ESD? <a href="#" onClick={(e) => { e.preventDefault(); setMode('signup'); setError(''); }}>Create your free account.</a>
                </div>
              </div>

              <div className="login-buttons">
                {error && <div className="form-error">{error}</div>}
                
                <button 
                  className="btn btn-primary btn-block" 
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" style={{ fill: 'currentColor' }}>
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    />
                  </svg>
                  {loading ? 'Connecting...' : 'Sign in to ESD.com'}
                </button>

                <button 
                  className="btn btn-outline btn-block" 
                  onClick={() => { setMode('login'); setError(''); }}
                  disabled={loading}
                >
                  <Mail size={18} />
                  Sign in with Email
                </button>
              </div>

              <div className="skip-step-link">
                <span onClick={setGuestMode}>Skip this step</span>
              </div>
            </>
          )}

          {mode === 'login' && (
            <>
              <div className="login-header-group">
                <button className="btn btn-ghost" style={{ alignSelf: 'flex-start', padding: '4px 8px', marginLeft: '-8px' }} onClick={() => setMode('welcome')}>
                  <ArrowLeft size={16} /> Back
                </button>
                <h1 className="login-title" style={{ fontSize: '1.75rem', marginTop: '8px' }}>Sign in to ESD</h1>
                <p className="login-subtitle">Please Enter your account credentials to view and manage projects.</p>
              </div>

              <form onSubmit={handleEmailLogin} className="email-form">
                {error && <div className="form-error">{error}</div>}

                <div className="email-form-group">
                  <label htmlFor="email">Email address</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      id="email"
                      type="email" 
                      className="input-field"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="email-form-group">
                  <label htmlFor="password">Password</label>
                  <input 
                    id="password"
                    type="password" 
                    className="input-field"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <div className="login-signup-link" style={{ textAlign: 'center' }}>
                Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('signup'); setError(''); }}>Sign Up</a>
              </div>
            </>
          )}

          {mode === 'signup' && (
            <>
              <div className="login-header-group">
                <button className="btn btn-ghost" style={{ alignSelf: 'flex-start', padding: '4px 8px', marginLeft: '-8px' }} onClick={() => setMode('welcome')}>
                  <ArrowLeft size={16} /> Back
                </button>
                <h1 className="login-title" style={{ fontSize: '1.75rem', marginTop: '8px' }}>Create ESD Account</h1>
                <p className="login-subtitle">Create a new local account to build and synchronize structures.</p>
              </div>

              <form onSubmit={handleEmailSignup} className="email-form">
                {error && <div className="form-error">{error}</div>}

                <div className="email-form-group">
                  <label htmlFor="name">Username / Display Name</label>
                  <input 
                    id="name"
                    type="text" 
                    className="input-field"
                    placeholder="Enter display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>

                <div className="email-form-group">
                  <label htmlFor="signup-email">Email address</label>
                  <input 
                    id="signup-email"
                    type="email" 
                    className="input-field"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="email-form-group">
                  <label htmlFor="signup-password">Password</label>
                  <input 
                    id="signup-password"
                    type="password" 
                    className="input-field"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>

              <div className="login-signup-link" style={{ textAlign: 'center' }}>
                Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); setError(''); }}>Sign In</a>
              </div>
            </>
          )}
        </div>

        <div className="login-footer">
          <div>
            By creating an account, you agree to the <a href="#">Terms of Service</a>. For more information about ESD's privacy practices, see the <a href="#">ESD Privacy Statement</a>.
          </div>
          <div>
            ESD Desktop sends usage metrics to improve the product and inform feature decisions. Read more about what metrics are sent and how we use them <a href="#">here</a>.
          </div>
        </div>
      </div>

      {/* Right Pane - Celestial Animation */}
      <div className="login-right">
        <div className="cosmic-scene">
          <div className="space-grid" />
          
          {/* Static twinkling background stars */}
          <div className="star" style={{ top: '15%', left: '20%', width: '3px', height: '3px', animationDelay: '0s' }} />
          <div className="star" style={{ top: '25%', left: '75%', width: '2px', height: '2px', animationDelay: '0.5s' }} />
          <div className="star" style={{ top: '70%', left: '15%', width: '4px', height: '4px', animationDelay: '1.2s' }} />
          <div className="star" style={{ top: '80%', left: '80%', width: '3px', height: '3px', animationDelay: '0.8s' }} />
          <div className="star" style={{ top: '40%', left: '85%', width: '2px', height: '2px', animationDelay: '1.5s' }} />
          <div className="star" style={{ top: '85%', left: '45%', width: '3px', height: '3px', animationDelay: '0.3s' }} />
          <div className="star" style={{ top: '10%', left: '60%', width: '2px', height: '2px', animationDelay: '2.1s' }} />

          {/* Orbit rings */}
          <div className="orbit orbit-1" />
          <div className="orbit orbit-2" />
          <div className="orbit orbit-3" />

          {/* Orbiting celestial objects */}
          <div className="orbiting-body speed-fast">
            <div className="planet planet-alpha" />
          </div>

          <div className="orbiting-body speed-slow">
            <div className="saturn-container">
              <div className="saturn" />
              <div className="saturn-ring" />
            </div>
          </div>

          {/* Central Earth Globe */}
          <div className="earth-globe">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              {/* Earth outlines */}
              <circle cx="50" cy="50" r="46" strokeWidth="1" strokeDasharray="3 3" />
              {/* Abstract continents outline */}
              <path d="M30 40 C 25 35, 15 45, 20 60 C 25 70, 35 65, 40 60 C 45 55, 35 45, 30 40 Z" strokeWidth="1.5" />
              <path d="M65 30 C 60 20, 75 15, 80 25 C 85 35, 75 45, 70 50 C 65 55, 70 65, 80 60 C 90 55, 85 75, 75 80 C 65 85, 55 75, 60 65 C 65 55, 70 40, 65 30 Z" strokeWidth="1.5" />
              {/* Orbiting Moon */}
              <circle cx="20" cy="20" r="4" fill="#fafafa" style={{ animation: 'rotate-orbit 8s linear infinite', transformOrigin: '50px 50px' }} />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
