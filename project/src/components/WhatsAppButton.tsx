import React from "react";

const WhatsAppButton: React.FC = () => {
  const openWhatsApp = () => {
    window.open(
      "https://wa.me/919606999084?text=Hello! I would like to inquire about your professional cleaning services.",
      "_blank"
    );
  };

  return (
    <button
      onClick={openWhatsApp}
      className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-110 z-50"
      aria-label="Contact us on WhatsApp"
    >
      {/* ✅ WhatsApp SVG Logo */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="currentColor"
        className="w-6 h-6 text-white"
      >
        <path d="M19.11 17.59c-.31-.16-1.83-.9-2.12-1.01-.28-.1-.49-.16-.7.16s-.8 1.01-.98 1.21-.36.24-.67.08c-.31-.16-1.29-.48-2.46-1.54-.91-.81-1.52-1.8-1.7-2.1-.18-.31-.02-.48.13-.64.13-.13.31-.36.46-.54.15-.18.2-.31.31-.52.1-.21.05-.39-.03-.54-.08-.16-.7-1.68-.96-2.31-.25-.6-.5-.52-.7-.53h-.6c-.21 0-.54.08-.82.39-.28.31-1.08 1.05-1.08 2.55s1.1 2.96 1.26 3.16c.16.21 2.18 3.33 5.29 4.67.74.32 1.31.51 1.75.65.73.23 1.39.2 1.91.12.58-.09 1.83-.75 2.09-1.47.26-.73.26-1.35.18-1.47-.08-.12-.28-.2-.58-.36zM16.03 3.2C8.96 3.2 3.2 8.96 3.2 16.03c0 2.82.92 5.43 2.49 7.57L4.64 28.8l5.42-1.49a12.76 12.76 0 0 0 5.96 1.52c7.07 0 12.83-5.76 12.83-12.83S23.1 3.2 16.03 3.2zm0 22.99c-2.3 0-4.43-.71-6.21-1.93l-.44-.29-3.21.88.86-3.13-.29-.47a10.96 10.96 0 0 1-1.73-5.94c0-6.06 4.93-10.99 10.99-10.99s10.99 4.93 10.99 10.99-4.93 10.99-10.99 10.99z" />
      </svg>
    </button>
  );
};

export default WhatsAppButton;
