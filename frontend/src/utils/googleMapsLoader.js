/**
 * Utility to load Google Maps API dynamically with proper async/defer handling
 */

let mapsLoadPromise = null;

export const loadGoogleMaps = async () => {
  // If already loading or loaded, return the promise
  if (mapsLoadPromise) {
    return mapsLoadPromise;
  }

  // If already loaded, resolve immediately
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  // Create a new promise for loading
  mapsLoadPromise = new Promise((resolve, reject) => {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        console.error('Google Maps API key not found in environment variables');
        reject(new Error('Google Maps API key not configured'));
        return;
      }

      // Create script tag with proper async loading
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async`;
      script.async = true;
      script.defer = true;

      // Handle load success
      script.addEventListener('load', () => {
        console.log('✅ Google Maps API loaded successfully');
        if (window.google && window.google.maps) {
          resolve(window.google.maps);
        } else {
          reject(new Error('Google Maps not available after loading'));
        }
      });

      // Handle load error
      script.addEventListener('error', () => {
        console.error('❌ Failed to load Google Maps API');
        mapsLoadPromise = null; // Reset so we can retry
        reject(new Error('Failed to load Google Maps API'));
      });

      // Add to document head
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      mapsLoadPromise = null; // Reset so we can retry
      reject(error);
    }
  });

  return mapsLoadPromise;
};

/**
 * Wait for Google Maps to be available
 */
export const waitForGoogleMaps = async (maxAttempts = 50) => {
  for (let i = 0; i < maxAttempts; i++) {
    if (window.google && window.google.maps) {
      return window.google.maps;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Google Maps failed to load after 5 seconds');
};
