/**
 * Estilo claro (branco) do Google Maps, alinhado ao layout do app (HOME_COLORS).
 * Suave, minimalista e com destaque para os pontos de geofence.
 */
export const MAP_LIGHT_STYLE = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#F5F7FA' }],
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'on' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4B5563' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#FFFFFF' }],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9CA3AF' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#EEF2FF' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3B5BDB' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#E6F4EA' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#059669' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#FFFFFF' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#FFFFFF' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#E2E8F0' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#CBD5E1' }],
  },
  {
    featureType: 'road.local',
    elementType: 'geometry',
    stylers: [{ color: '#F8FAFC' }],
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [{ color: '#E2E8F0' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#E0F2FE' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#0284C7' }],
  },
];

/** Estilo escuro do Google Maps, combinando com o tema escuro do app. */
export const MAP_DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#171C30' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#A3AAC2' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0E1222' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#262C47' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1E2540' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#8A92AD' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#14302A' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2A3050' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8A92AD' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3A4268' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1E2540' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0A0E1C' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#6F7894' }] },
];
