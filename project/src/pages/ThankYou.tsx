import React from "react";
import { useEffect } from "react";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
 
const ThankYou: React.FC = () => {
  const navigate = useNavigate();

   useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
 
  return (
    <div className="min-h-[calc(80vh-4rem)] flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-200 my-0">
       
        <CheckCircle className="text-green-600 mx-auto mb-4" size={60} />
 
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Thank You!
        </h1>
       
        <p className="text-gray-600 text-sm mb-6">
          Your message has been successfully submitted.  
          Our team will contact you shortly.
        </p>
 
        <button
          onClick={() => navigate("/")}
          className="w-full bg-gradient-to-r from-peach-300 to-navy-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md"
        >
          Go to Home <ArrowRight size={18} />
        </button>
 
      </div>
    </div>
  );
};
 
export default ThankYou;
 
 git 