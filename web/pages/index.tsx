import React, { useEffect, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';

import { supabase, Incident } from '../lib/supabase';
import { IncidentList } from '../components/IncidentList';
import styles from '../styles/dashboard.module.css';

// Load the map client-side only (Leaflet requires window)
const IncidentMap = dynamic(
  () => import('../components/IncidentMap').then((m) => m.IncidentMap),
  { ssr: false, loading: () => <div style={{ flex: 1, background: '#0d1117' }} /> },
);

interface Props {
  initialIncidents: Incident[];
}

const Dashboard: NextPage<Props> = ({ initialIncidents }) => {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading] = useState(false);

  // Poll for new incidents every 10 seconds
  useEffect(() => {
    if (!supabase) return;

    const interval = setInterval(async () => {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (!error && data) {
        setIncidents(data as Incident[]);
      }
    }, 10_000);

    return () => clearInterval(interval);
  }, []);

  // Summary stats
  const panicCount = incidents.filter((i) => i.incident_type === 'panic').length;
  const freefallCount = incidents.filter((i) => i.incident_type === 'freefall').length;
  const impactCount = incidents.filter((i) => i.incident_type === 'impact').length;
  const maxG =
    incidents.length > 0 ? Math.max(...incidents.map((i) => i.max_g_force)) : 0;

  return (
    <>
      <Head>
        <title>UVision — Safety Dashboard</title>
        <meta name="description" content="UVision personal safety incident dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.dashboard}>
        {/* ── Header ── */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.headerTitle}>UVISION</h1>
            <p className={styles.headerSubtitle}>SAFETY DASHBOARD</p>
          </div>
          <div style={{ textAlign: 'right', color: '#555', fontSize: '12px' }}>
            {incidents.length} incident{incidents.length !== 1 ? 's' : ''} recorded
            <br />
            <span style={{ color: '#333' }}>Auto-refreshes every 10 s</span>
          </div>
        </header>

        {/* ── Main content ── */}
        <main className={styles.main}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <p className={styles.sidebarTitle}>Recent Incidents</p>
              <p className={styles.sidebarCount}>{incidents.length}</p>
            </div>
            <IncidentList
              incidents={incidents}
              loading={loading}
              onSelect={(inc) => setSelectedId(inc.id)}
              selectedId={selectedId}
            />
          </aside>

          {/* Map */}
          <div className={styles.mapArea}>
            <IncidentMap
              incidents={incidents}
              selectedId={selectedId}
              onSelect={(inc) => setSelectedId(inc.id)}
            />
          </div>
        </main>

        {/* ── Stats footer ── */}
        <footer className={styles.statsBar}>
          <div className={styles.statItem}>
            <span>🆘 PANIC</span>
            <span className={styles.statValue}>{panicCount}</span>
          </div>
          <div className={styles.statItem}>
            <span>🪂 FREEFALL</span>
            <span className={styles.statValue}>{freefallCount}</span>
          </div>
          <div className={styles.statItem}>
            <span>💥 IMPACT</span>
            <span className={styles.statValue}>{impactCount}</span>
          </div>
          <div className={styles.statItem}>
            <span>⚡ MAX G</span>
            <span className={styles.statValue}>{maxG.toFixed(2)} G</span>
          </div>
        </footer>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  if (!supabase) {
    return { props: { initialIncidents: [] } };
  }

  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(100);

  return {
    props: {
      initialIncidents: error ? [] : (data as Incident[]),
    },
  };
};

export default Dashboard;
