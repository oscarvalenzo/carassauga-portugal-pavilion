import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Location {
  id: string;
  name: string;
  emoji: string;
  lat: number;
  lng: number;
  color: string;
  isLive?: boolean;
}

interface FamilyMember {
  id: number;
  name: string;
  location: {
    lat: number;
    lng: number;
    zone?: string;
  };
}

interface LeafletMapProps {
  locations: Location[];
  familyMembers: FamilyMember[];
  userLocation: { lat: number; lng: number };
  onLocationClick: (location: Location) => void;
}

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function LeafletMap({
  locations,
  familyMembers,
  userLocation,
  onLocationClick,
}: LeafletMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 17,
      zoomControl: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    return () => {
      // Cleanup markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [userLocation]);

  // Add location markers
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add location markers
    locations.forEach((location) => {
      const customIcon = L.divIcon({
        className: 'custom-location-marker',
        html: `
          <div style="
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: ${location.color};
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            cursor: pointer;
            transition: transform 0.2s;
            ${location.isLive ? 'animation: pulse 2s infinite;' : ''}
          ">
            ${location.emoji}
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
      });

      const marker = L.marker([location.lat, location.lng], { icon: customIcon })
        .addTo(map.current!)
        .bindPopup(`
          <div style="text-align: center; padding: 8px; min-width: 120px;">
            <div style="font-size: 24px; margin-bottom: 4px;">${location.emoji}</div>
            <div style="font-weight: bold; font-size: 14px; color: #001011;">${location.name}</div>
            ${location.isLive ? '<div style="color: #ef4444; font-size: 12px; margin-top: 4px;">🔴 LIVE</div>' : ''}
          </div>
        `);

      marker.on('click', () => {
        onLocationClick(location);
      });

      markersRef.current.push(marker);
    });

    // Add family member markers
    familyMembers.forEach((member, index) => {
      const colors = ['#6ccff6', '#ef4444', '#f97316', '#8b5cf6'];
      const color = colors[index % colors.length];

      const customIcon = L.divIcon({
        className: 'family-marker',
        html: `
          <div style="
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: ${color};
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      });

      const marker = L.marker([member.location.lat, member.location.lng], { icon: customIcon })
        .addTo(map.current!)
        .bindPopup(`
          <div style="text-align: center; padding: 6px; min-width: 100px;">
            <div style="font-weight: bold; font-size: 12px; color: #001011;">${member.name}</div>
            <div style="font-size: 10px; color: #666; margin-top: 2px;">${member.location.zone || 'Unknown'}</div>
          </div>
        `);

      markersRef.current.push(marker);
    });

    // Add user location marker
    const userIcon = L.divIcon({
      className: 'user-marker',
      html: `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #98ce00;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          color: #001011;
        ">
          YOU
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(map.current!)
      .bindPopup(`
        <div style="text-align: center; padding: 8px; min-width: 100px;">
          <div style="font-weight: bold; font-size: 14px; color: #001011;">YOU</div>
          <div style="font-size: 11px; color: #666; margin-top: 2px;">Current Location</div>
        </div>
      `);

    markersRef.current.push(userMarker);

  }, [locations, familyMembers, userLocation, onLocationClick]);

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" style={{ minHeight: '500px' }} />
      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
          }
        }
        .custom-location-marker {
          background: transparent !important;
          border: none !important;
        }
        .family-marker {
          background: transparent !important;
          border: none !important;
        }
        .user-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
        }
        .leaflet-popup-content {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
