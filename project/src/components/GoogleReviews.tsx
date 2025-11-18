import React, { useEffect } from "react";
 
const GoogleReviews: React.FC = () => {
  useEffect(() => {
    // Load Elfsight script
    if (!document.querySelector('script[src="https://elfsightcdn.com/platform.js"]')) {
      const script = document.createElement("script");
      script.src = "https://elfsightcdn.com/platform.js";
      script.async = true;
      document.body.appendChild(script);
    }
 
    // 🛑 Hide Branding inside iframe
    const iframeCleaner = setInterval(() => {
      const iframe = document.querySelector('iframe[title="Elfsight"]');
      if (iframe) {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) return;
 
        const branding = iframeDoc.querySelector(
          ".eapps-link, .eapps-widget-toolbar, [title*='Free Google Reviews widget']"
        );
 
        if (branding) {
          branding.style.display = "none";
          branding.style.visibility = "hidden";
          branding.style.opacity = "0";
          console.log("Iframe branding removed 👍");
          clearInterval(iframeCleaner);
        }
      }
    }, 1200);
 
    // 🔥 Remove Branding outside iframe (FREE GOOGLE REVIEWS WIDGET button)
    const brandingCleaner = setInterval(() => {
      const brandingEl = document.querySelector(
        'a[href*="google-reviews-widget"], .eapps-widget-toolbar, .eapps-link'
      );
      if (brandingEl) {
        brandingEl.remove();
        console.log("External branding removed 🎉");
        clearInterval(brandingCleaner);
      }
    }, 1000);
 
    return () => {
      clearInterval(iframeCleaner);
      clearInterval(brandingCleaner);
    };
  }, []);
 
  return (
    <section
      className="bg-white py-4"
      style={{ overflow: "hidden" }}
    >
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-4 text-center">
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