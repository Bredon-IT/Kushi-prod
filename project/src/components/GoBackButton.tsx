import React from 'react';
import { ArrowLeft } from 'lucide-react';
// 1. Import from react-router-dom
import { useNavigate } from 'react-router-dom'; 

const GoBackButton: React.FC = () => {
  // 2. Initialize the hook
  const navigate = useNavigate();

  // Function to navigate to the previous page using React Router
  const goBack = () => {
    // 3. Use navigate(-1) which is the preferred way to go back
    // It's cleaner and handles SPA history better than window.history.back()
    navigate(-1); 
    
    // Optional Fallback: If you MUST have a fallback, you can use a try/catch or
    // check history length, but navigate(-1) is generally robust.
    // E.g., const historyLength = window.history.length;
    // if (historyLength <= 2) { navigate('/'); } // Go to home if near the start
  };

  return (
    <button
      onClick={goBack}
      className="fixed bottom-6 left-6 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-110 z-50"
      aria-label="Go back to the previous page"
    >
      <ArrowLeft size={24} />
    </button>
  );
};

export default GoBackButton;