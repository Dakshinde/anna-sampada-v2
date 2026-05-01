import React, { useState, useContext, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Send, CheckCircle, AlertTriangle, MapPin, Navigation, Filter } from 'lucide-react';
import { apiRequest } from '../../services/api.service'; // Import your central service
import { loadGoogleMaps, waitForGoogleMaps } from '../../utils/googleMapsLoader';

// This file is now connected and working
const UserNGOConnectPage = () => {
  const { user } = useAuth();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [facilitiesList, setFacilitiesList] = useState([]);
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mapLoading, setMapLoading] = useState(true);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [facilityFilter, setFacilityFilter] = useState('all'); // all|ngo|oldage|shelter
  
  const [formData, setFormData] = useState({
    foodDetails: '', // Renamed from 'Food Type'
    quantity: '',
    pickupAddress: '',
    donorContact: user?.phone || user?.email || '', // Pre-fill from Auth
    // We removed 'availableUntil' to match the backend
  });
  
  // Color code for facility types
  const facilityColors = {
    ngo: '#10B981', // green
    oldage: '#F59E0B', // amber
    shelter: '#3B82F6'  // blue
  };

  // Load Google Maps on mount
  useEffect(() => {
    const initializeMaps = async () => {
      try {
        await loadGoogleMaps();
        await waitForGoogleMaps();
        setMapsLoaded(true);
        console.log('✅ Google Maps ready');
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load Google Maps. Please check your API key configuration.');
        setMapLoading(false);
      }
    };

    initializeMaps();
  }, []);

  // Initialize Google Map
  useEffect(() => {
    if (!mapRef.current || !userLocation || !mapsLoaded) return;

    try {
      const maps = window.google.maps;
      if (!maps) {
        console.error('Google Maps not available');
        return;
      }

      // Clear old map if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }

      // Create map instance
      const map = new maps.Map(mapRef.current, {
        zoom: 14,
        center: userLocation,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: false,
      });

      mapInstanceRef.current = map;
      setMapLoading(false);

      // Clear old markers
      markersRef.current.forEach(marker => {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
      });
      markersRef.current = [];

      // Add user location marker
      const userMarker = new maps.Marker({
        position: userLocation,
        map: map,
        title: 'Your Location',
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      });
      markersRef.current.push(userMarker);

      // Store info windows to prevent multiple open
      let currentInfoWindow = null;

      // Add facility markers
      filteredFacilities.forEach((facility, idx) => {
        const markerIcon = facility.type === 'ngo' ? 'green' :
                          facility.type === 'oldage' ? 'yellow' :
                          'blue';

        const marker = new maps.Marker({
          position: facility.location,
          map: map,
          title: facility.name,
          icon: `http://maps.google.com/mapfiles/ms/icons/${markerIcon}-dot.png`,
        });

        // Create info window
        const infoWindow = new maps.InfoWindow({
          content: `
            <div style="padding: 8px; font-family: Arial, sans-serif;">
              <h3 style="margin: 0 0 4px 0; font-weight: bold;">${facility.name}</h3>
              <p style="margin: 0 0 4px 0; font-size: 12px;">${facility.address}</p>
              <p style="margin: 0; font-size: 12px; color: #666;">
                Rating: ${facility.rating !== 'N/A' ? facility.rating + '⭐' : 'N/A'}
              </p>
            </div>
          `,
        });

        marker.addListener('click', () => {
          // Close previous info window
          if (currentInfoWindow) currentInfoWindow.close();
          // Open new one
          infoWindow.open(map, marker);
          currentInfoWindow = infoWindow;
          // Select facility
          setSelectedNgo(facility);
        });

        markersRef.current.push(marker);
      });

      // Fit map bounds to show all markers
      if (markersRef.current.length > 1) {
        const bounds = new maps.LatLngBounds();
        markersRef.current.forEach(marker => {
          if (marker && marker.getPosition) {
            bounds.extend(marker.getPosition());
          }
        });
        map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
      }

    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Error initializing map. Please refresh the page.');
    }

  }, [userLocation, filteredFacilities, mapsLoaded]);

  // Get user location on mount
  useEffect(() => {
    setMapLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setMapLoading(false);
          fetchFacilities(latitude, longitude);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Unable to access your location. Please enable location permissions.');
          setMapLoading(false);
          // Fallback to a default location (e.g., Mumbai)
          setUserLocation({ lat: 19.0760, lng: 72.8777 });
          fetchFacilities(19.0760, 72.8777);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setMapLoading(false);
    }
  }, []);

  // Fetch facilities from backend
  const fetchFacilities = async (lat, lng, type = 'all') => {
    try {
      const data = await apiRequest(`/api/get-facilities?lat=${lat}&lng=${lng}&type=${type}`, {
        method: 'GET',
      });
      setFacilitiesList(data);
      setFilteredFacilities(data);
      setError('');
    } catch (err) {
      console.error('Error fetching facilities:', err);
      setError('Failed to fetch nearby facilities. Please try again.');
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFacilityFilter(newFilter);
    if (newFilter === 'all') {
      setFilteredFacilities(facilitiesList);
    } else {
      setFilteredFacilities(facilitiesList.filter(f => f.type === newFilter));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Ensure an NGO is selected before attempting to notify
    if (!selectedNgo) {
      setError('Please select a facility from the map or list.');
      return;
    }
    
    setLoading(true);

    try {
      // Constructing the payload exactly as your Flask notify-ngo endpoint expects
      const payload = {
        ngo_name: selectedNgo.name,
        foodDetails: `${formData.foodDetails} (Quantity: ${formData.quantity} kg)`,
        pickupAddress: formData.pickupAddress,
        donorContact: formData.donorContact,
      };

      // --- [CENTRALIZED API CONNECTION] ---
      // This automatically uses your Render URL in production and localhost in dev
      const data = await apiRequest('/api/notify-ngo', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Clear selection and form on success for a premium user experience
      setSuccess(`Notification sent to ${selectedNgo.name}!`);
      setSelectedNgo(null); 
      setFormData({ 
        foodDetails: '', 
        quantity: '', 
        pickupAddress: formData.pickupAddress, 
        donorContact: user?.phone || user?.email || '' 
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFacilityLabel = (type) => {
    const labels = {
      ngo: 'NGOs & Food Banks',
      oldage: 'Old Age Homes',
      shelter: 'Shelters & Community'
    };
    return labels[type] || type;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-green-800 dark:text-green-200 animate-slide-down">
        Connect with NGOs & Facilities
      </h1>
      
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* --- FOOD DONATION FORM --- */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
            1. Fill Donation Details
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Food Type & Details
              </label>
              <input
                type="text"
                name="foodDetails"
                value={formData.foodDetails}
                onChange={handleChange}
                placeholder="e.g., Cooked Rice, Fresh Vegetables"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-green-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity (in kg, approx.)
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="5"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-green-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Pickup Address
              </label>
              <textarea
                rows="3"
                name="pickupAddress"
                value={formData.pickupAddress}
                onChange={handleChange}
                placeholder="Enter your complete address"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-green-500 focus:outline-none"
                required
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Contact (Phone or Email)
              </label>
              <input
                type="text"
                name="donorContact"
                value={formData.donorContact}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-green-500 focus:outline-none"
                required
              />
            </div>
            
            {/* --- Selected Facility Display --- */}
            {selectedNgo && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Selected Facility:</p>
                <p className="font-semibold text-green-700 dark:text-green-400">{selectedNgo.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedNgo.address}</p>
              </div>
            )}
            
            {/* --- Error/Success Messages --- */}
            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
                <AlertTriangle size={18} /> {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
                <CheckCircle size={18} /> {success}
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={loading || !selectedNgo}
              className="w-full py-4 bg-green-600 dark:bg-green-500 text-white rounded-xl 
                         hover:bg-green-700 dark:hover:bg-green-600 transform hover:scale-105 
                         transition-all duration-300 shadow-lg font-semibold disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 
               selectedNgo ? `Notify ${selectedNgo.name}` : 'Please Select a Facility'}
            </button>
          </form>
        </div>
        
        {/* --- MAP AND FACILITIES LIST --- */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 animate-fade-in animation-delay-200">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-green-600" />
            2. Select from Map
          </h2>
          
          {/* --- Filter Buttons --- */}
          <div className="mb-4 flex flex-wrap gap-2">
            {['all', 'ngo', 'oldage', 'shelter'].map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  facilityFilter === filter
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {filter === 'all' ? 'All' : getFacilityLabel(filter)}
              </button>
            ))}
          </div>
          
          {/* --- Google Map --- */}
          <div
            ref={mapRef}
            className="w-full h-64 rounded-xl shadow-md mb-4 bg-gray-200 dark:bg-gray-700"
          >
            {mapLoading && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="animate-spin mx-auto mb-2 text-green-600" size={32} />
                  <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
                </div>
              </div>
            )}
          </div>
          
          {/* --- Facilities List --- */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredFacilities.length > 0 ? (
              filteredFacilities.map((facility, index) => (
                <button
                  key={`${facility.id}-${facility.type}-${index}`}
                  type="button"
                  onClick={() => setSelectedNgo(facility)}
                  className={`w-full flex items-start justify-between p-4 bg-gray-50 
                              dark:bg-gray-700 rounded-xl hover:shadow-md 
                              transition-all duration-300 border-2 text-left
                              ${selectedNgo?.id === facility.id 
                                ? 'border-green-500 shadow-md bg-green-50 dark:bg-green-900/20' 
                                : 'border-transparent dark:border-gray-700'
                              }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block w-3 h-3 rounded-full" 
                            style={{backgroundColor: facilityColors[facility.type]}}></span>
                      <h3 className="font-semibold text-gray-800 dark:text-white">{facility.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{facility.address}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {getFacilityLabel(facility.type)} • Rating: {facility.rating !== 'N/A' ? facility.rating + '⭐' : 'N/A'}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">No facilities found nearby.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNGOConnectPage;