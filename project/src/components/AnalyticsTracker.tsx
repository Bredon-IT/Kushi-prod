import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pageview } from '../utils/analytics';
import { fbPageView } from '../utils/fbPixel';

const AnalyticsTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view in Google Analytics
    pageview(location.pathname + location.search);
    
    // Track page view in Facebook Pixel
    fbPageView();
  }, [location]);

  return null; // This component doesn't render anything
};

export default AnalyticsTracker;
