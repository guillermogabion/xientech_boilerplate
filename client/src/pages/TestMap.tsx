import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

interface MapProps {
    incidents: any[]; // You can pass your list of incidents here
}

function LocationMarker({ onLocationSelected }: { onLocationSelected: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            onLocationSelected(lat, lng);
        },
    });
    return null; // This component doesn't render anything itself
}

const TestMap = ({ incidents }: MapProps) => {
    const [newPin, setNewPin] = React.useState<{lat: number, lng: number} | null>(null);
    const center: [number, number] = [12.5186, 124.6346]; 

    const handleMapClick = (lat: number, lng: number) => {
        setNewPin({ lat, lng });
        console.log(`Pinned at: Lat ${lat}, Lng ${lng}`);
        // If you are using a form, you can send these values back to your inputs here
    };

    return (
        <div className="space-y-4">
            <div className="h-[400px] w-full rounded-lg overflow-hidden border border-stroke">
                <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    
                    {/* EXISTING PINS */}
                    {incidents.map((incident) => (
                        incident.latitude && incident.longitude && (
                            <Marker key={incident.id} position={[incident.latitude, incident.longitude]}>
                                <Popup>Past Incident: {incident.caseNumber}</Popup>
                            </Marker>
                        )
                    ))}

                    {/* THE CLICK LISTENER */}
                    <LocationMarker onLocationSelected={handleMapClick} />

                    {/* THE NEW TEMPORARY PIN */}
                    {newPin && (
                        <Marker position={[newPin.lat, newPin.lng]}>
                            <Popup>
                                <strong>New Incident Location</strong> <br />
                                Lat: {newPin.lat.toFixed(4)} <br />
                                Lng: {newPin.lng.toFixed(4)}
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
            
            {newPin && (
                <div className="p-3 bg-gray-100 dark:bg-meta-4 rounded text-sm">
                    📍 Selected Location: <strong>{newPin.lat.toFixed(6)}, {newPin.lng.toFixed(6)}</strong>
                </div>
            )}
        </div>
    );
};

export default TestMap;