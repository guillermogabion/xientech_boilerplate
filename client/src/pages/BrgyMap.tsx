import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

// Fix for default Leaflet icon missing in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// 1. Helper: Move map view manually
function ChangeView({ center }: { center: LatLngExpression }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

// 2. Helper: Click to drop pin - UPDATED TYPE to allow null
function LocationMarker({ onLocationSelected }: { onLocationSelected: (lat: number | null, lng: number | null) => void }) {
    useMapEvents({
        click(e) {
            onLocationSelected(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// 3. Helper: Search bar - UPDATED TYPE to allow null
function SearchField({ onLocationSelected }: { onLocationSelected: (lat: number | null, lng: number | null) => void }) {
    const map = useMap();
    useEffect(() => {
        const provider = new OpenStreetMapProvider({
            params: { 'accept-language': 'en', countrycodes: 'ph' },
        });

        const searchControl = new (GeoSearchControl as any)({
            provider: provider,
            style: 'bar',
            showMarker: false,
            autoClose: true,
            searchLabel: 'Search landmark...',
        });

        map.addControl(searchControl);
        map.on('geosearch/showlocation', (result: any) => {
            onLocationSelected(result.location.y, result.location.x);
        });

        return () => { map.removeControl(searchControl); };
    }, [map, onLocationSelected]);
    return null;
}

// 4. Helper: Focus on the specific Barangay
function BarangayFocus({ barangay }: { barangay: string }) {
    const map = useMap();
    useEffect(() => {
        if (!barangay || barangay.length < 2) return;
        const provider = new OpenStreetMapProvider();
        const query = `${barangay}, Bobon, Northern Samar, Philippines`;

        provider.search({ query }).then((results) => {
            if (results && results.length > 0) {
                const bestResult = results[0];
                map.flyTo([bestResult.y, bestResult.x], 17);
            }
        });
    }, [barangay, map]);
    return null;
}

// 5. Helper: Find User GPS
function UserLocation() {
    const map = useMap();
    useEffect(() => {
        map.locate().on("locationfound", (e) => {
            map.flyTo(e.latlng, 17);
        });
    }, [map]);
    return null;
}

interface MapProps {
    incidents: any[];
    onLocationSelect?: (lat: number | null, lng: number | null) => void;
    currentPin?: { lat: number | null; lng: number | null } | null;
    barangayName?: string;
}

const BrgyMap = ({ incidents, onLocationSelect, currentPin, barangayName }: MapProps) => {
    const bobonPoblacion: LatLngExpression = [12.5275, 124.5625];
    
    // Safety check for initial center

    const getMarkerIcon = (incidentType: string, isCurrentPin: boolean = false) => {
        // Keywords for "high-alert" incidents
        const highAlertKeywords = ["murder", "brutal", "bloody", "assault", "physical injuries", "rape"];
        const isHighAlert = highAlertKeywords.some(keyword => 
            incidentType?.toLowerCase().includes(keyword)
        );

        let color = "#3b82f6"; // Default Blue (Tailwind primary)
        if (isCurrentPin) color = "#10b981"; // Emerald for the pin you are currently dropping
        if (isHighAlert) color = "#ef4444"; // Red for brutal/bloody incidents

        // Creating a custom DivIcon with an SVG
        return L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="
                    background-color: ${color}; 
                    width: 24px; 
                    height: 24px; 
                    border-radius: 50% 50% 50% 0; 
                    transform: rotate(-45deg); 
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                "></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 24],
            popupAnchor: [0, -24]
        });
    };
    const [initialCenter] = React.useState<LatLngExpression>(
        (currentPin?.lat && currentPin?.lng) 
            ? [currentPin.lat, currentPin.lng] 
            : bobonPoblacion
    );

    const handleMapClick = (lat: number | null, lng: number | null) => {
        if (onLocationSelect) onLocationSelect(lat, lng);
    };

    return (
        <div className="space-y-4">
            <div className="h-[400px] w-full rounded-lg overflow-hidden border border-stroke dark:border-strokedark shadow-default">
                <MapContainer 
                    center={initialCenter} 
                    zoom={14} 
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    
                    <SearchField onLocationSelected={handleMapClick} />
                    
                    {!currentPin?.lat && (
                        barangayName ? <BarangayFocus barangay={barangayName} /> : <UserLocation />
                    )}

                    <LocationMarker onLocationSelected={handleMapClick} />

                    {/* Final safety check before rendering marker */}
                    {currentPin?.lat != null && currentPin?.lng != null && (
                        <Marker position={[currentPin.lat, currentPin.lng] as LatLngExpression}
                        icon={getMarkerIcon("new", true)}
                        >
                            <Popup>Incident Location</Popup>
                        </Marker>
                    )}

                    {/* Past Incidents (Optional, but included if you want them visible) */}
                    {incidents?.map((incident) => (
                        incident.latitude && incident.longitude && (
                            <Marker key={incident.id} position={[incident.latitude, incident.longitude]}
                            icon={getMarkerIcon(incident.incidentType || incident.narrative)}
                            >
                                <Popup>Case: {incident.caseNumber}</Popup>
                            </Marker>
                        )
                    ))}
                </MapContainer>
            </div>

            {currentPin?.lat != null && currentPin?.lng != null && (
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-blue-600">📍</span>
                        <span className="dark:text-white">
                            Coordinates: <strong>{currentPin.lat.toFixed(6)}, {currentPin.lng.toFixed(6)}</strong>
                        </span>
                    </div>
                    <button 
                        type="button"
                        onClick={() => handleMapClick(null, null)}
                        className="text-red-500 hover:text-red-700 font-medium underline"
                    >
                        Remove Pin
                    </button>
                </div>
            )}
        </div>
    );
};

export default BrgyMap;