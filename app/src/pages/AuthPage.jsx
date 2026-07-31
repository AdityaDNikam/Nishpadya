import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Forms from '../components/Forms';

function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
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
  };

  const handleFormSubmit = (data) => {
    console.log(isSignUpMode ? 'Sign-up Form Data:' : 'Log-in Form Data:', data);
    alert(`${isSignUpMode ? 'Sign-up' : 'Log-in'} successful!\nRedirecting to User Dashboard...`);
    navigate('/dashboard');
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
        <div className="w-full flex justify-center md:justify-end">
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
