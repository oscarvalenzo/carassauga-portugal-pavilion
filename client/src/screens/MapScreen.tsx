import { useState } from 'react';
import { 
  Users, 
  MapPin, 
  Navigation, 
  Zap,
  Clock,
  Star,
  X,
  ChevronRight,
  Radio
} from 'lucide-react';
import { useFamilyTracking } from '../hooks/useFamilyTracking';
import { useHomeData } from '../hooks/useHomeData';
import LeafletMap from '../components/LeafletMap';

interface MapScreenProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

// Pavilion center coordinates (example: Mississauga Celebration Square or similar venue)
const PAVILION_CENTER = {
  lat: 43.5890,
  lng: -79.6441,
};

// Pavilion locations with coordinates (relative to center)
const LOCATIONS = [
  {
    id: 'food-court',
    name: 'Food Court',
    emoji: '🍽️',
    x: 120,
    y: 200,
    lat: PAVILION_CENTER.lat + 0.0003,
    lng: PAVILION_CENTER.lng - 0.0002,
    color: '#98ce00',
    type: 'dining',
    description: 'Traditional Portuguese cuisine',
    activities: ['Bacalhau à Brás', 'Pastéis de Nata', 'Caldo Verde']
  },
  {
    id: 'main-stage',
    name: 'Main Stage',
    emoji: '🎭',
    x: 270,
    y: 190,
    lat: PAVILION_CENTER.lat + 0.0002,
    lng: PAVILION_CENTER.lng + 0.0003,
    color: '#6ccff6',
    type: 'performance',
    description: 'Live Fado performance',
    isLive: true,
    activities: ['Watch Fado', 'Dance Workshop', 'Music Trivia']
  },
  {
    id: 'photo-wall',
    name: 'Photo Wall',
    emoji: '📸',
    x: 280,
    y: 320,
    lat: PAVILION_CENTER.lat - 0.0001,
    lng: PAVILION_CENTER.lng + 0.0004,
    color: '#6ccff6',
    type: 'activity',
    description: 'AR photo opportunities',
    activities: ['AR Photo Booth', 'Digital Passport', 'Share to Social']
  },
  {
    id: 'trivia-zone',
    name: 'Trivia Zone',
    emoji: '🧠',
    x: 120,
    y: 320,
    lat: PAVILION_CENTER.lat - 0.0002,
    lng: PAVILION_CENTER.lng - 0.0003,
    color: '#757780',
    type: 'game',
    description: 'Test your knowledge',
    activities: ['Portuguese History', 'Food Quiz', 'Culture Facts']
  },
  {
    id: 'heritage-display',
    name: 'Heritage',
    emoji: '🏛️',
    x: 200,
    y: 260,
    lat: PAVILION_CENTER.lat + 0.0001,
    lng: PAVILION_CENTER.lng + 0.0001,
    color: '#6ccff6',
    type: 'culture',
    description: 'Cultural exhibits',
    activities: ['Learn History', 'Traditional Crafts', 'Language Lessons']
  },
  {
    id: 'gift-shop',
    name: 'Gift Shop',
    emoji: '🎁',
    x: 90,
    y: 390,
    lat: PAVILION_CENTER.lat - 0.0003,
    lng: PAVILION_CENTER.lng - 0.0004,
    color: '#98ce00',
    type: 'shopping',
    description: 'Souvenirs and crafts',
    activities: ['Browse Items', 'Redeem Points', 'Special Offers']
  },
  {
    id: 'kids-zone',
    name: 'Kids Zone',
    emoji: '🎨',
    x: 310,
    y: 390,
    lat: PAVILION_CENTER.lat - 0.0004,
    lng: PAVILION_CENTER.lng + 0.0005,
    color: '#98ce00',
    type: 'family',
    description: 'Activities for children',
    activities: ['Face Painting', 'Games', 'Story Time']
  }
];

export default function MapScreen({ showToast }: MapScreenProps) {
  const { familyMembers, loading } = useFamilyTracking(1);
  const { liveEvents } = useHomeData();
  const [selectedLocation, setSelectedLocation] = useState<typeof LOCATIONS[0] | null>(null);
  const [showFamilyList, setShowFamilyList] = useState(false);

  // Get user's current location (mock - in real app would use geolocation)
  const userLocation = { 
    x: 200, 
    y: 380,
    lat: PAVILION_CENTER.lat,
    lng: PAVILION_CENTER.lng
  };

  // Convert family members to map coordinates
  const mapFamilyMembers = familyMembers.map(member => ({
    ...member,
    location: {
      ...member.location,
      lat: PAVILION_CENTER.lat + (member.location.x / 100 - 0.5) * 0.001,
      lng: PAVILION_CENTER.lng + (member.location.y / 100 - 0.5) * 0.001,
    }
  }));

  // Count people in each location/zone
  const getPeopleCount = (locationName: string): number => {
    // Map location names to zone names from family members
    const zoneMapping: Record<string, string[]> = {
      'Food Court': ['Food Court'],
      'Main Stage': ['Main Stage'],
      'Photo Wall': ['AR Photo Wall', 'Photo Wall'],
      'Trivia Zone': ['Trivia Zone'],
      'Heritage': ['Heritage'],
      'Gift Shop': ['Gift Shop'],
      'Kids Zone': ['Kids Zone'],
    };

    const zones = zoneMapping[locationName] || [];
    return familyMembers.filter(member => 
      zones.some(zone => member.location.zone?.includes(zone) || zone.includes(member.location.zone || ''))
    ).length;
  };

  const handleNavigate = (location: typeof LOCATIONS[0]) => {
    const distance = Math.round(Math.sqrt(
      Math.pow(location.x - userLocation.x, 2) + 
      Math.pow(location.y - userLocation.y, 2)
    ) / 50); // Rough conversion to minutes
    
    showToast(`📍 Navigate to ${location.name} (${Math.max(1, distance)} min walk)`, 'info');
    setSelectedLocation(null);
  };

  return (
    <div className="animate-fadeIn bg-background min-h-full font-sf-text text-primary-dark">
      {/* Header */}
      <div className="bg-white px-6 py-16 flex items-center justify-between border-b border-secondary/10">
        <div>
          <h2 className="font-sf-display text-sf-4xl font-bold tracking-sf-tighter mb-2">Pavilion Map</h2>
          <p className="font-sf-text text-sf-sm text-secondary font-medium tracking-tight">
            {liveEvents.length > 0 && `🔴 ${liveEvents.length} live event${liveEvents.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <button 
          onClick={() => setShowFamilyList(!showFamilyList)}
          className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 active:scale-95 transition-all relative"
        >
          <Users size={22} strokeWidth={2} className="text-primary-dark" />
          {familyMembers.length > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center font-sf-text text-[10px] font-bold text-primary-dark shadow-md">
              {familyMembers.length}
            </div>
          )}
        </button>
      </div>

      {/* Family List Overlay */}
      {showFamilyList && (
        <div className="absolute top-32 right-6 bg-white rounded-2xl shadow-2xl border border-secondary/10 p-4 z-50 animate-slideUp w-64">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sf-text font-bold text-sf-base tracking-tight">Family Nearby</h3>
            <button onClick={() => setShowFamilyList(false)} className="text-secondary hover:text-primary-dark">
              <X size={18} strokeWidth={2} />
            </button>
          </div>
          <div className="space-y-3">
            {familyMembers.map((member, index) => (
              <div key={member.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/5">
                <div 
                  className={`w-10 h-10 rounded-full ${
                    index === 0 ? 'bg-gradient-to-br from-primary to-primary/80' : 'bg-secondary/20'
                  } flex items-center justify-center font-sf-text font-bold text-sf-sm ${
                    index === 0 ? 'text-primary-dark' : 'text-primary-dark'
                  }`}
                >
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-sf-text font-bold text-sf-sm tracking-tight">{member.name.split(' ')[0]}</div>
                  <div className="font-sf-text text-sf-xs text-secondary tracking-tight">{member.location.zone}</div>
                </div>
                {index === 0 && (
                  <div className="px-2 py-1 bg-primary/10 rounded-full font-sf-text text-[10px] font-bold text-primary tracking-tight">
                    YOU
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="bg-background px-6 py-6">
        {/* Family Status Card - Always Visible */}
        <div className="bg-white border border-secondary/10 rounded-3xl shadow-md p-5 mb-6 animate-slideUp">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-md">
                <Users size={22} strokeWidth={2.5} className="text-primary-dark" />
              </div>
              <div>
                <h3 className="font-sf-text font-bold text-sf-base tracking-tight text-primary-dark">
                  Santos Family
                </h3>
                <p className="font-sf-text text-sf-sm text-secondary font-medium tracking-tight">
                  {familyMembers.length} nearby
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowFamilyList(!showFamilyList)}
              className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center hover:bg-secondary/20 active:scale-95 transition-all"
            >
              <ChevronRight size={20} strokeWidth={2} className={`text-primary-dark transition-transform ${showFamilyList ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {/* Family Members Grid - Quick View */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {familyMembers.slice(0, 4).map((member, index) => {
              const colors = [
                'from-primary to-primary/80',
                'from-[#6ccff6] to-[#6ccff6]/80',
                'from-red-500 to-red-500/80',
                'from-orange-500 to-orange-500/80'
              ];
              return (
                <div key={member.id} className="flex flex-col items-center gap-2 min-w-[70px]">
                  <div className={`w-14 h-14 bg-gradient-to-br ${colors[index]} rounded-full flex items-center justify-center font-sf-text font-bold text-white shadow-md relative`}>
                    {member.name.charAt(0)}
                    {index === 0 && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-primary-dark shadow-sm">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="font-sf-text text-sf-xs font-bold text-primary-dark tracking-tight truncate max-w-[70px]">
                      {member.name.split(' ')[0]}
                    </div>
                    <div className="font-sf-text text-[10px] text-secondary tracking-tight truncate max-w-[70px]">
                      {member.location.zone}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map Container */}
        <div className="bg-white rounded-3xl shadow-md border border-secondary/10 p-4 relative" style={{ minHeight: '500px' }}>
          <LeafletMap
            locations={LOCATIONS.map(loc => ({
              id: loc.id,
              name: loc.name,
              emoji: loc.emoji,
              lat: loc.lat,
              lng: loc.lng,
              color: loc.color,
              isLive: loc.isLive,
            }))}
            familyMembers={mapFamilyMembers}
            userLocation={userLocation}
            onLocationClick={(loc) => {
              const fullLocation = LOCATIONS.find(l => l.id === loc.id);
              if (fullLocation) setSelectedLocation(fullLocation);
            }}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white px-6 py-5 border-t border-secondary/10">
        <div className="flex gap-6 overflow-x-auto pb-2">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="w-4 h-4 rounded-full bg-primary border-2 border-white shadow-sm" />
            <span className="font-sf-text text-sf-xs font-bold text-primary-dark tracking-tight">You</span>
          </div>
          {familyMembers.slice(1, 4).map((member, index) => {
            const colors = ['bg-[#6ccff6]', 'bg-red-500', 'bg-orange-500'];
            const color = colors[index % colors.length];
            return (
              <div key={member.id} className="flex items-center gap-2 whitespace-nowrap">
                <div className={`w-4 h-4 rounded-full ${color} border-2 border-white shadow-sm`} />
                <span className="font-sf-text text-sf-xs font-bold text-primary-dark tracking-tight">
                  {member.name.split(' ')[0]}
                </span>
              </div>
            );
          })}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Radio size={14} className="text-red-500" strokeWidth={2.5} />
            <span className="font-sf-text text-sf-xs font-bold text-primary-dark tracking-tight">Live Event</span>
          </div>
        </div>
      </div>

      {/* Location Detail Modal */}
      {selectedLocation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl animate-slideUp max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-br from-primary/10 to-primary/5 px-6 py-8 border-b border-secondary/10">
              <button
                onClick={() => setSelectedLocation(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-xl flex items-center justify-center hover:bg-white active:scale-95 transition-all shadow-md"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
              
              <div className="text-center">
                <div className="text-6xl mb-4">{selectedLocation.emoji}</div>
                <h3 className="font-sf-display text-sf-3xl font-bold tracking-tight mb-2">
                  {selectedLocation.name}
                </h3>
                <p className="font-sf-text text-sf-base text-secondary font-medium tracking-tight">
                  {selectedLocation.description}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Live indicator */}
              {selectedLocation.isLive && (
                <div className="mb-6 flex items-center justify-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-sf-text text-sf-sm font-bold text-red-600 tracking-tight">
                    LIVE NOW - Fado Performance in Progress
                  </span>
                </div>
              )}

              {/* Activities */}
              <div className="mb-6">
                <h4 className="font-sf-text font-bold text-sf-base mb-4 tracking-tight">
                  Available Activities
                </h4>
                <div className="space-y-2">
                  {selectedLocation.activities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-secondary/5 rounded-2xl hover:bg-secondary/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-sf-text text-sf-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <span className="font-sf-text text-sf-sm font-medium tracking-tight">
                          {activity}
                        </span>
                      </div>
                      <ChevronRight size={18} className="text-secondary" strokeWidth={2} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation button */}
              <button 
                onClick={() => handleNavigate(selectedLocation)}
                className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-dark px-6 py-4 rounded-full font-sf-text font-bold text-sf-base flex items-center justify-center gap-3 hover:shadow-lg active:scale-95 transition-all shadow-md tracking-tight"
              >
                <Navigation size={20} strokeWidth={2.5} />
                <span>Navigate Here</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
