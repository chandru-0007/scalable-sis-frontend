import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import AuthView from './views/AuthView';
import DashboardView from './views/DashboardView';
import CourseSearchView from './views/CourseSearchView';
import AttendanceView from './views/AttendanceView';
import TimetableWeeklyView from './views/TimetableWeeklyView';
import NoticesView from './views/NoticesView';
import SystemMonitorView from './views/SystemMonitorView';
import FacultyPortalView from './views/FacultyPortalView';
import AdminPortalView from './views/AdminPortalView';
import ParentPortalView from './views/ParentPortalView';

export default function App() {
  const { isAuthenticated, loading, refreshProfile } = useAuth();
  const [currentView, setCurrentView] = useState(() => {
    const hash = window.location.hash.replace('#', '').trim();
    return hash || 'dashboard';
  });

  // Sync hash routing and refresh profile on view changes
  React.useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash) {
        setCurrentView(hash);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  React.useEffect(() => {
    if (isAuthenticated && refreshProfile) {
      refreshProfile();
    }
  }, [currentView, isAuthenticated]);

  const handleNavigate = (view) => {
    window.location.hash = view;
    setCurrentView(view);
  };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingBox}>
          <div className="spinner" style={{ width: '32px', height: '32px', borderColor: 'rgba(16, 185, 129, 0.2)', borderTopColor: '#10B981' }} />
          <div style={{ color: '#0F172A', fontWeight: '700', fontSize: '1rem', marginTop: '16px' }}>
            Loading SIS University Portal...
          </div>
          <div style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '4px' }}>
            Connecting to MongoDB Atlas Shards & Upstash Cloud Redis
          </div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, display Figma split Auth / Sign-in & Register view
  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <div style={styles.layout}>
      {/* Figma Dark Navy Sidebar */}
      <Sidebar currentView={currentView} setCurrentView={handleNavigate} />

      {/* Main Content Area */}
      <div style={styles.mainContent}>
        <Topbar />

        <main style={styles.viewContainer}>
          {currentView === 'dashboard' && <DashboardView onNavigate={handleNavigate} />}
          {currentView === 'search' && <CourseSearchView />}
          {currentView === 'registration' && <CourseSearchView />}
          {currentView === 'attendance' && <AttendanceView />}
          {currentView === 'timetable' && <TimetableWeeklyView />}
          {currentView === 'notifications' && <NoticesView />}
          {currentView === 'system' && <SystemMonitorView />}
          {currentView === 'faculty' && <FacultyPortalView />}
          {currentView === 'admin' && <AdminPortalView />}
          {currentView === 'parent' && <ParentPortalView />}
        </main>
      </div>
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    minWidth: 0,
    overflowY: 'auto',
  },
  viewContainer: {
    flex: 1,
  },
  loadingScreen: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#F8FAFC',
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '36px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
  },
};
