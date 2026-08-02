import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import NavBar from '../components/NavBar';
import { axiosServer } from '../api/axiosServer'

function LandingPage() {
  const navigate = useNavigate();
  const [shadowStyle, setShadowStyle] = useState({
    textShadow: '0px 4px 20px rgba(102, 212, 81, 0.15)'
  });

  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // This appends to your base URL, calling http://localhost:8000/api/v1/health-check
        const response = await axiosServer.get('/api/v1/health-check');
        const message = response.data.message;
        setStatus(message);
        console.log("Nishpadya System Status: " + message);
      } catch (error) {
        console.error("Connection failed:", error);
        setStatus("Failed to connect to backend");
      }
    };
    checkConnection();
  }, []);

  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const rect = currentTarget.getBoundingClientRect();

    // Calculate distance from center of page
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Subtle vector displacement
    const moveX = (clientX - centerX) / 45;
    const moveY = (clientY - centerY) / 45;

    setShadowStyle({
      textShadow: `${-moveX}px ${-moveY}px 14px rgba(102, 212, 81, 0.45), ${-moveX * 1.5}px ${-moveY * 1.5}px 28px rgba(0, 0, 0, 0.7)`
    });
  };

  const handleMouseLeave = () => {
    setShadowStyle({
      textShadow: '0px 4px 20px rgba(102, 212, 81, 0.15)'
    });
  };

  const handleGetItDone = () => {
    navigate('/login');
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-screen bg-[#0c0f0a] text-white flex flex-col font-sans select-none transition-all duration-300"
    >
      {/* Navigation Bar */}
      <NavBar
        signUpText="Sign-up"
        logInText="Log-in"
        onSignUpClick={() => navigate('/login', { state: { mode: 'signup' } })}
        onLogInClick={() => navigate('/login', { state: { mode: 'login' } })}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 max-w-4xl mx-auto">
        <h1
          style={shadowStyle}
          className="text-4xl md:text-5xl lg:text-6xl font-sans font-medium tracking-tight mb-8 leading-tight transition-all duration-75 ease-out"
        >
          Only aim is to get it done!.....
        </h1>

        <p className="text-neutral-400 text-sm md:text-[15px] leading-relaxed max-w-2xl mb-12">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
          Lorem Ipsum has been the industry's standard dummy text ever since 1966,
          when designers at Letraset and James Mosley, the librarian at St Bride Printing
          Library in London, took a 1914 Cicero translation and scrambled it to make
          dummy text for Letraset's Body Type sheets.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
          <button
            type="button"
            onClick={handleGetItDone}
            className="bg-[#D9D9D9] hover:bg-[#c8c8c8] text-black font-sans font-semibold text-[15px] py-3 px-8 rounded-[8px] transition-all duration-200 active:scale-95 cursor-pointer shadow-md leading-normal"
          >
            Lets get it Done!
          </button>
          <button
            type="button"
            className="golden-shine-btn text-black font-sans font-semibold text-[15px] py-3 px-8 rounded-[8px] transition-all duration-200 active:scale-95 cursor-pointer shadow-md leading-normal"
          >
            CheckOut Plans!
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
