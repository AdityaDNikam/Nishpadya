import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import NavBar from '../components/NavBar';

function ErrorPage() {
  const navigate = useNavigate();
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
      textShadow: `${-moveX}px ${-moveY}px 12px rgba(102, 212, 81, 0.45), ${-moveX * 1.5}px ${-moveY * 1.5}px 24px rgba(0, 0, 0, 0.7)`
    });
  };

  const handleMouseLeave = () => {
    setShadowStyle({
      textShadow: '0px 4px 20px rgba(102, 212, 81, 0.15)'
    });
  };

  const handleSignInRedirect = () => {
    navigate('/login');
  };

  const handleHomeRedirect = () => {
    navigate('/');
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-screen bg-[#0c0f0a] text-white flex flex-col font-sans select-none transition-all duration-300"
    >
      {/* Navigation Bar at the top */}
      <NavBar 
        signUpText="Sign-in" 
        logInText="Home" 
        onSignUpClick={handleSignInRedirect}
        onLogInClick={handleHomeRedirect}
      />

      {/* Centered Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <h1 
          style={shadowStyle}
          className="text-3xl md:text-4xl lg:text-5xl font-sans font-medium text-[#66D451] tracking-wide text-center transition-all duration-75 ease-out"
        >
          I'm Still Working On It!!
        </h1>
      </div>
    </div>
  );
}

export default ErrorPage;
