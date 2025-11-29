// Facebook Pixel Helper Functions
import { FB_PIXEL_ID } from '../config/analytics.config';

// Check if fbq is available
const isFbqAvailable = () => {
  return typeof window !== 'undefined' && (window as any).fbq;
};

// Page view tracking
export const fbPageView = () => {
  if (isFbqAvailable()) {
    (window as any).fbq('track', 'PageView');
  }
};

// View content
export const fbTrackViewContent = (contentName: string, contentType: string, value?: number) => {
  if (isFbqAvailable()) {
    (window as any).fbq('track', 'ViewContent', {
      content_name: contentName,
      content_type: contentType,
      value: value,
      currency: 'INR',
    });
  }
};

// Add to cart
export const fbTrackAddToCart = (serviceName: string, price: number) => {
  if (isFbqAvailable()) {
    (window as any).fbq('track', 'AddToCart', {
      content_name: serviceName,
      value: price,
      currency: 'INR',
    });
  }
};

// Initiate checkout
export const fbTrackInitiateCheckout = (value: number) => {
  if (isFbqAvailable()) {
    (window as any).fbq('track', 'InitiateCheckout', {
      value: value,
      currency: 'INR',
    });
  }
};

// Purchase
export const fbTrackPurchase = (value: number, bookingId: string) => {
  if (isFbqAvailable()) {
    (window as any).fbq('track', 'Purchase', {
      value: value,
      currency: 'INR',
      content_ids: [bookingId],
    });
  }
};

// Lead (Contact form submission)
export const fbTrackLead = (formName: string) => {
  if (isFbqAvailable()) {
    (window as any).fbq('track', 'Lead', {
      content_name: formName,
    });
  }
};

// Complete registration
export const fbTrackCompleteRegistration = (registrationMethod: string) => {
  if (isFbqAvailable()) {
    (window as any).fbq('track', 'CompleteRegistration', {
      registration_method: registrationMethod,
    });
  }
};

// Search
export const fbTrackSearch = (searchString: string) => {
  if (isFbqAvailable()) {
    (window as any).fbq('track', 'Search', {
      search_string: searchString,
    });
  }
};

// Contact (Phone/WhatsApp click)
export const fbTrackContact = (contactMethod: string) => {
  if (isFbqAvailable()) {
    (window as any).fbq('track', 'Contact', {
      contact_method: contactMethod,
    });
  }
};

// Custom event
export const fbTrackCustomEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (isFbqAvailable()) {
    (window as any).fbq('trackCustom', eventName, parameters);
  }
};
