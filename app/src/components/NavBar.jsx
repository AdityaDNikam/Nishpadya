import React from 'react';

function NavBar({ signUpText = 'Sign-up', logInText = 'Log-in', onSignUpClick, onLogInClick }) {
    return (
        <nav className="w-full bg-black py-4 px-6 md:px-12 flex items-center justify-between select-none">
            {/* Logo */}
            <div className="text-[#66D451] font-logo text-[26px] font-black tracking-tight leading-none">
                NIshpadya
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={onSignUpClick}
                    className={signUpText === 'Upgrade' 
                      ? "golden-shine-btn text-black font-sans font-semibold text-sm md:text-[15px] py-[6px] px-[22px] rounded-[10px] transition-all duration-200 active:scale-95 cursor-pointer leading-normal"
                      : "bg-[#ffffff] text-[#66D451] font-sans font-semibold text-sm md:text-[15px] py-[6px] px-[22px] rounded-[10px] transition-all duration-200 hover:bg-[#c8c8c8] active:scale-95 cursor-pointer leading-normal"}
                >
                    {signUpText}
                </button>
                <button
                    type="button"
                    onClick={onLogInClick}
                    className="bg-[#66D451] text-white font-sans font-semibold text-sm md:text-[15px] py-[6px] px-[22px] rounded-[10px] transition-all duration-200 hover:bg-[#59bd45] active:scale-95 cursor-pointer leading-normal"
                >
                    {logInText}
                </button>
            </div>
        </nav>
    );
}

export default NavBar;