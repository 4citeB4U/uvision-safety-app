'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Incident } from '../lib/supabase';

// Leaflet must be loaded client-side only (no SSR)
const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false },
);
const CircleMarker = dynamic(
  () => import('react-leaflet').then((m) => m.CircleMarker),
  { ssr: false },
);
const Tooltip = dynamic(
  () => import('react-leaflet').then((m) => m.Tooltip),
  { ssr: false },
);

const TYPE_COLOR: Record<string, string> = {
  freefall: '#ff9800',
  impact: '#f44336',
  panic: '#e91e63',
};

interface IncidentMapProps {
  incidents: Incident[];
  selectedId: string | null;
  onSelect: (incident: Incident) => void;
}

export function IncidentMap({ incidents, selectedId, onSelect }: IncidentMapProps) {
  // Default centre (world view) — shifts to first incident if available
  const centre: [number, number] =
    incidents.length > 0
      ? [incidents[0].latitude, incidents[0].longitude]
      : [20, 0];

  return (
    <MapContainer
      center={centre}
      zoom={incidents.length > 0 ? 13 : 2}
      style={{ width: '100%', height: '100%', background: '#0d1117' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {incidents.map((inc) => {
        const isSelected = selectedId === inc.id;
        const color = TYPE_COLOR[inc.incident_type] ?? '#ffffff';

        return (
          <CircleMarker
            key={inc.id}
            center={[inc.latitude, inc.longitude]}
            radius={isSelected ? 14 : 9}
            pathOptions={{
              color: isSelected ? '#ffffff' : color,
              fillColor: color,
              fillOpacity: 0.85,
              weight: isSelected ? 3 : 1.5,
            }}
            eventHandlers={{ click: () => onSelect(inc) }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
              <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                <strong>{inc.incident_type.toUpperCase()}</strong> — {inc.max_g_force.toFixed(2)} G
                <br />
                {new Date(inc.timestamp).toLocaleString()}
              </span>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
