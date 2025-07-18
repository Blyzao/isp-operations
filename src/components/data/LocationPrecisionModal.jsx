import React, { useState, useEffect } from "react";
import { X, MapPin, Navigation, Target, AlertTriangle } from "lucide-react";
import { GoogleMap, Marker } from "@react-google-maps/api";

function LocationPrecisionModal({
  isOpen,
  onClose,
  defaultLocation,
  lieuLocation,
  onLocationUpdate,
}) {
  const [selectedLocation, setSelectedLocation] = useState(defaultLocation || lieuLocation);
  const [viewMode, setViewMode] = useState("map");
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [distance, setDistance] = useState(0);
  const [error, setError] = useState(null);

  const mapStyles = { height: "500px", width: "100%" };

  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (window.google && window.google.maps) {
        setIsGoogleLoaded(true);
        return;
      }

      if (window.googleMapsLoading) {
        const checkLoaded = setInterval(() => {
          if (window.google && window.google.maps) {
            setIsGoogleLoaded(true);
            clearInterval(checkLoaded);
          }
        }, 100);
        return;
      }

      window.googleMapsLoading = true;

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      }&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsGoogleLoaded(true);
        window.googleMapsLoading = false;
      };
      script.onerror = () => {
        console.error("Erreur lors du chargement de Google Maps");
        setError("Erreur lors du chargement de Google Maps");
        window.googleMapsLoading = false;
      };
      document.head.appendChild(script);
    };

    if (isOpen) {
      loadGoogleMaps();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedLocation && lieuLocation) {
      const calculatedDistance = calculateDistance(
        selectedLocation.lat,
        selectedLocation.lng,
        lieuLocation.lat,
        lieuLocation.lng
      );
      setDistance(calculatedDistance);
    }
  }, [selectedLocation, lieuLocation]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c * 1000; // Convert to meters
    return Math.round(distance);
  };

  const handleMapClick = (e) => {
    const newLocation = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setSelectedLocation(newLocation);
  };

  const handleMarkerDragEnd = (e) => {
    const newLocation = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setSelectedLocation(newLocation);
  };

  const handleSave = () => {
    if (distance > 200) {
      setError(
        "La distance ne peut pas dépasser 200 mètres par rapport à la position du lieu."
      );
      return;
    }
    onLocationUpdate(selectedLocation);
    onClose();
  };

  const handleReset = () => {
    setSelectedLocation(lieuLocation);
    setError(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[102] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-xl border border-gray-100 animate-scale-in mx-4">
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Précision de localisation
                </h2>
                <p className="text-blue-200 text-xs">
                  Affiner la position géographique de l'incident
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations et contrôles */}
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Position du lieu
                </h3>
                <p className="text-xs text-blue-700">
                  Latitude: {lieuLocation?.lat?.toFixed(6)}
                </p>
                <p className="text-xs text-blue-700">
                  Longitude: {lieuLocation?.lng?.toFixed(6)}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Position précise
                </h3>
                <p className="text-xs text-gray-700">
                  Latitude: {selectedLocation?.lat?.toFixed(6)}
                </p>
                <p className="text-xs text-gray-700">
                  Longitude: {selectedLocation?.lng?.toFixed(6)}
                </p>
              </div>

              <div
                className={`border rounded-lg p-4 ${
                  distance > 200
                    ? "bg-red-50 border-red-200"
                    : "bg-green-50 border-green-200"
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Navigation className="w-4 h-4" />
                  <h3 className="font-semibold">Distance</h3>
                </div>
                <p
                  className={`text-lg font-bold ${
                    distance > 200 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {distance} mètres
                </p>
                {distance > 200 && (
                  <p className="text-xs text-red-600 mt-1">
                    Maximum autorisé: 200 mètres
                  </p>
                )}
              </div>

              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("map")}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    viewMode === "map"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Carte
                </button>
                <button
                  onClick={() => setViewMode("satellite")}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    viewMode === "satellite"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Satellite
                </button>
              </div>

              <button
                onClick={handleReset}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 text-sm"
              >
                Réinitialiser à la position du lieu
              </button>
            </div>

            {/* Carte */}
            <div className="lg:col-span-2">
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                {isGoogleLoaded ? (
                  <GoogleMap
                    mapContainerStyle={mapStyles}
                    zoom={18}
                    center={selectedLocation}
                    onClick={handleMapClick}
                    mapTypeId={viewMode === "satellite" ? "satellite" : "roadmap"}
                    options={{
                      streetViewControl: false,
                      fullscreenControl: false,
                      mapTypeControl: true,
                      zoomControl: true,
                      rotateControl: false,
                      scaleControl: true,
                    }}
                  >
                    {/* Marker for lieu position */}
                    {lieuLocation && (
                      <Marker
                        position={lieuLocation}
                        icon={{
                          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5S14.5 7.62 14.5 9S13.38 11.5 12 11.5Z" fill="#3B82F6"/>
                            </svg>
                          `),
                          scaledSize: { width: 24, height: 24 },
                        }}
                        title="Position du lieu"
                      />
                    )}

                    {/* Marker for precise position */}
                    {selectedLocation && (
                      <Marker
                        position={selectedLocation}
                        draggable={true}
                        onDragEnd={handleMarkerDragEnd}
                        icon={{
                          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5S14.5 7.62 14.5 9S13.38 11.5 12 11.5Z" fill="#EF4444"/>
                            </svg>
                          `),
                          scaledSize: { width: 24, height: 24 },
                        }}
                        title="Position précise de l'incident"
                      />
                    )}

                  </GoogleMap>
                ) : (
                  <div
                    className="flex items-center justify-center bg-gray-100"
                    style={mapStyles}
                  >
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">
                        Chargement de la carte...
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <p className="mb-1">
                  <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  Position du lieu
                </p>
                <p className="mb-1">
                  <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  Position précise de l'incident (déplaçable)
                </p>
                <p className="text-blue-600 font-medium">
                  Cliquez sur la carte ou déplacez le marqueur rouge pour
                  préciser la localisation
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={distance > 200}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              <MapPin className="w-4 h-4" />
              <span>Valider la sélection</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}

export default LocationPrecisionModal;