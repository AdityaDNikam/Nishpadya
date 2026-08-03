import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import NavBar from '../components/NavBar';
import Forms from '../components/Forms';
import { axiosServer } from '../api/axiosServer';


function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Set initial state from navigation parameters
  const [isSignUpMode, setIsSignUpMode] = useState(() => {
    if (location.state && location.state.mode) {
      return location.state.mode === 'signup';
    }
    return true;
  });

  // Watch for dynamic mode changes (e.g. clicking buttons repeatedly)
  useEffect(() => {
    if (location.state && location.state.mode) {
      setIsSignUpMode(location.state.mode === 'signup');
      setError(null);
    }
  }, [location.state]);

  const [shadowStyle, setShadowStyle] = useState({
    textShadow: '0px 4px 20px rgba(102, 212, 81, 0.15)'
  });

  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const rect = currentTarget.getBoundingClientRect();

    // Relative position from center of page
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Vector displacement for shadow
    const moveX = (clientX - centerX) / 40;
    const moveY = (clientY - centerY) / 40;

    setShadowStyle({
      textShadow: `${-moveX}px ${-moveY}px 12px rgba(102, 212, 81, 0.4), ${-moveX * 1.5}px ${-moveY * 1.5}px 24px rgba(0, 0, 0, 0.7)`
    });
  };

  const handleMouseLeave = () => {
    setShadowStyle({
      textShadow: '0px 4px 20px rgba(102, 212, 81, 0.15)'
    });
  };

  const handleHomeRedirect = () => {
    navigate('/');
  };

  const handleToggleMode = () => {
    setIsSignUpMode((prev) => !prev);
    setError(null);
  };

  const handleFormSubmit = async (data) => {
    setError(null);
    setLoading(true);
    try {
      if (isSignUpMode) {
        // Map form fields to register API parameters
        const payload = {
          name: data['Name'],
          email: data['Email'],
          password: data['Password']
        };

        const response = await axiosServer.post('/api/v1/users/register', payload);
        alert(response.data.message || 'Registration successful! Please log in.');
        setIsSignUpMode(false);
      } else {
        // Map form fields to login API parameters
        const payload = {
          email: data['Name/Email'],
          password: data['Password']
        };

        const response = await axiosServer.post('/api/v1/users/login', payload);
        
        // Save user data to localStorage
        const userData = response.data.data?.loggedInUser;
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
        }

        alert(response.data.message || 'Logged in successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      const errMsg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-screen bg-[#0c0f0a] text-white flex flex-col font-sans select-none transition-all duration-300"
    >
      {/* Navigation Bar */}
      <NavBar
        signUpText="Home"
        logInText={isSignUpMode ? "Log-in" : "Sign-up"}
        onSignUpClick={handleHomeRedirect}
        onLogInClick={handleToggleMode}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24 px-6 py-12 md:py-24 max-w-5xl mx-auto w-full">
        {/* Left Side: Dynamic Form */}
        <div className="w-full flex flex-col items-center md:items-end justify-center gap-4">
          {isSignUpMode ? (
            <Forms
              title="Sign-Up"
              fields={['Name', 'Email', 'Password', 'Img Name For Avatar']}
              onSubmit={handleFormSubmit}
            />
          ) : (
            <Forms
              title="Log-In"
              fields={['Name/Email', 'Password']}
              onSubmit={handleFormSubmit}
            />
          )}
          {error && (
            <div className="w-full max-w-[340px] text-red-500 text-sm text-center bg-red-950/20 border border-red-900/50 rounded-lg py-2 px-3 mt-2">
              {error}
            </div>
          )}
          {loading && (
            <div className="w-full max-w-[340px] text-green-400 text-sm text-center bg-green-950/20 border border-green-900/50 rounded-lg py-2 px-3 mt-2 animate-pulse">
              Processing request...
            </div>
          )}
        </div>

        {/* Right Side: Animated Brand Title */}
        <div className="w-full text-center md:text-left flex flex-col justify-center">
          <h1
            style={shadowStyle}
            className="text-5xl md:text-6xl font-logo font-black tracking-tight mb-4 text-[#66D451] transition-all duration-75 ease-out"
          >
            Nishpadya
          </h1>
          <p className="text-xl md:text-2xl font-sans font-medium text-neutral-200 leading-normal max-w-sm">
            We Believe In Getting Things Done!
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
