// Google Analytics Helper Functions
import { GA_TRACKING_ID } from '../config/analytics.config';

// Page view tracking
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', GA_TRACKING_ID(), {
      page_path: url,
    });
  }
};

// Event tracking
interface EventParams {
  action: string;
  category: string;
  label?: string;
  value?: number | string;
}

export const event = ({ action, category, label, value }: EventParams) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Specific event helpers
export const trackServiceView = (serviceName: string, serviceId: string | number) => {
  event({
    action: 'view_service',
    category: 'Services',
    label: serviceName,
    value: Number(serviceId),
  });
};

export const trackAddToCart = (serviceName: string, price: number) => {
  event({
    action: 'add_to_cart',
    category: 'Ecommerce',
    label: serviceName,
    value: price,
  });
};

export const trackBookingInitiated = (serviceType: string) => {
  event({
    action: 'begin_checkout',
    category: 'Ecommerce',
    label: serviceType,
  });
};

export const trackBookingCompleted = (bookingId: string, totalAmount: number) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'purchase', {
      transaction_id: bookingId,
      value: totalAmount,
      currency: 'INR',
      event_category: 'Ecommerce',
    });
  }
};

export const trackPaymentSuccess = (paymentId: string, amount: number) => {
  event({
    action: 'payment_success',
    category: 'Payment',
    label: paymentId,
    value: amount,
  });
};

export const trackPaymentFailure = (reason: string) => {
  event({
    action: 'payment_failure',
    category: 'Payment',
    label: reason,
  });
};

export const trackFormSubmit = (formName: string) => {
  event({
    action: 'form_submit',
    category: 'Engagement',
    label: formName,
  });
};

export const trackPhoneClick = () => {
  event({
    action: 'phone_click',
    category: 'Contact',
    label: 'Phone Number',
  });
};

export const trackWhatsAppClick = () => {
  event({
    action: 'whatsapp_click',
    category: 'Contact',
    label: 'WhatsApp Button',
  });
};

export const trackNewsletterSignup = (email: string) => {
  event({
    action: 'newsletter_signup',
    category: 'Engagement',
    label: email,
  });
};

export const trackSocialMediaClick = (platform: string, sharedUrl?: string) => {
  event({
    action: 'social_media_click',
    category: 'Social',
    label: platform,
    value: sharedUrl,
  });
};

export const trackBlogView = (blogTitle: string) => {
  event({
    action: 'blog_view',
    category: 'Content',
    label: blogTitle,
  });
};

export const trackSearchQuery = (searchTerm: string) => {
  event({
    action: 'search',
    category: 'Engagement',
    label: searchTerm,
  });
};
