import React from 'react';
import { Incident } from '../lib/supabase';
import styles from '../styles/dashboard.module.css';

interface IncidentListProps {
  incidents: Incident[];
  loading: boolean;
  onSelect: (incident: Incident) => void;
  selectedId: string | null;
}

const TYPE_ICON: Record<string, string> = {
  freefall: '🪂',
  impact: '💥',
  panic: '🆘',
};

const TYPE_COLOR: Record<string, string> = {
  freefall: '#ff9800',
  impact: '#f44336',
  panic: '#e91e63',
};

export function IncidentList({ incidents, loading, onSelect, selectedId }: IncidentListProps) {
  if (loading) {
    return <div className={styles.listEmpty}>Loading incidents…</div>;
  }

  if (incidents.length === 0) {
    return <div className={styles.listEmpty}>No incidents recorded yet.</div>;
  }

  return (
    <ul className={styles.incidentList}>
      {incidents.map((inc) => {
        const date = new Date(inc.timestamp);
        const color = TYPE_COLOR[inc.incident_type] ?? '#ffffff';
        const icon = TYPE_ICON[inc.incident_type] ?? '⚠️';

        return (
          <li
            key={inc.id}
            className={`${styles.incidentItem} ${selectedId === inc.id ? styles.incidentItemSelected : ''}`}
            onClick={() => onSelect(inc)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(inc)}
            aria-selected={selectedId === inc.id}
          >
            <span className={styles.incidentIcon}>{icon}</span>
            <div className={styles.incidentDetails}>
              <span className={styles.incidentType} style={{ color }}>
                {inc.incident_type.toUpperCase()}
              </span>
              <span className={styles.incidentTime}>
                {date.toLocaleDateString()} {date.toLocaleTimeString()}
              </span>
              <span className={styles.incidentCoords}>
                {inc.latitude.toFixed(5)}, {inc.longitude.toFixed(5)}
              </span>
            </div>
            <span className={styles.incidentG}>{inc.max_g_force.toFixed(2)} G</span>
          </li>
        );
      })}
    </ul>
  );
}
