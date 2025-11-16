import React, { useEffect } from "react";

const GoogleReviews: React.FC = () => {
  useEffect(() => {
    // Load the Elfsight script only once
    if (!document.querySelector('script[src="https://elfsightcdn.com/platform.js"]')) {
      const script = document.createElement("script");
      script.src = "https://elfsightcdn.com/platform.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <section
      className="bg-white py-2 md:py-6 border-t border-gray-200"
      style={{ overflow: "hidden" }} // ✅ contain Elfsight padding
    >
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <div
          className="elfsight-app-fbc5a718-3c29-414c-8710-06d622eca56c"
          data-elfsight-app-lazy
          style={{
            marginBottom: 0,
            paddingBottom: 0,
            overflow: "hidden",
          }}
        ></div>
      </div>
    </section>
  );
};

export default GoogleReviews;
