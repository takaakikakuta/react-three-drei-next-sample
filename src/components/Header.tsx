import React, { useState } from 'react'

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
      setIsOpen(!isOpen);
    };

  return (
    <>
    
      <div className="absolute top-0 left-0 w-full bg-transparent group z-20 h-20">
        <div className="bg-gray-900 w-full h-10 md:h-20 absolute md:top-[-5rem] z-10 transform transition-transform duration-300 ease-in-out md:group-hover:translate-y-full top-0 opacity-100">
          <div className="relative container mx-auto h-full">
            <div className="flex items-center justify-between h-full px-4">
                <div className="text-white">Logo</div>
                <div className="md:hidden text-white" onClick={toggleMenu}>
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16m-7 6h7"
                        />
                    </svg>
                </div>
            </div>
          </div>
        {isOpen && (
          <div className="absolute top-10 left-0 w-full bg-gray-900 z-10 md:hidden">
            <div className="flex flex-col items-start p-4 text-white">
              <a href="#" className="py-2">Home</a>
              <a href="#" className="py-2">About</a>
              <a href="#" className="py-2">Contact</a>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}

export default Header
