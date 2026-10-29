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
import AssignmentsView from './views/AssignmentsView';
import ResultsView from './views/ResultsView';
import { HeroScrollDemo } from './components/ui/demo';

const ROLE_CONFIG = {
  STUDENT: {
    allowedViews: ['dashboard', 'assignments', 'results', 'search', 'registration', 'attendance', 'timetable', 'notifications', 'scroll-demo'],
    defaultView: 'dashboard',
  },
  FACULTY: {
    allowedViews: ['faculty', 'faculty-assignments', 'faculty-attendance', 'faculty-grades', 'timetable', 'notifications', 'scroll-demo'],
    defaultView: 'faculty',
  },
  ADMIN: {
    allowedViews: ['admin', 'admin-onboard', 'admin-reschedule', 'admin-faculty', 'admin-debarment', 'system', 'notifications', 'scroll-demo'],
    defaultView: 'admin-onboard',
  },
  PARENT: {
    allowedViews: ['parent', 'notifications', 'scroll-demo'],
    defaultView: 'parent',
  },
};

export default function App() {
  const { user, isAuthenticated, loading, refreshProfile } = useAuth();
  const role = (user?.role || 'STUDENT').toUpperCase();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [currentView, setCurrentView] = useState(() => {
    const hash = window.location.hash.replace('#', '').trim();
    return hash || 'dashboard';
  });

  // Sync hash routing
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

  const handleNavigate = (view) => {
    window.location.hash = view;
    setCurrentView(view);
  };

  // Enforce role-based access control & default landing redirect
  React.useEffect(() => {
    if (!isAuthenticated) return;
    const config = ROLE_CONFIG[role] || ROLE_CONFIG.STUDENT;

    // If current view is not permitted for the active persona, redirect to default landing
    if (!config.allowedViews.includes(currentView)) {
      handleNavigate(config.defaultView);
    }
  }, [role, currentView, isAuthenticated]);

  React.useEffect(() => {
    if (isAuthenticated && refreshProfile) {
      refreshProfile();
    }
  }, [isAuthenticated]);

  return (
    <>
      {/* Atmospheric Canvas with 3 Ambient Mesh Orbs */}
      <div className="ambient-canvas" aria-hidden="true">
        <div className="ambient-orb orb-sky" />
        <div className="ambient-orb orb-pink" />
        <div className="ambient-orb orb-lavender" />
      </div>

      {loading ? (
        <div style={styles.loadingScreen}>
          <div style={styles.loadingBox}>
            <div className="spinner" style={{ width: '36px', height: '36px', borderWidth: '3px' }} />
            <div style={{ color: 'var(--text-main)', fontWeight: '700', fontSize: '16px', marginTop: '18px', letterSpacing: '-0.015em' }}>
              Loading SIS University Portal...
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
              Connecting to university academic services...
            </div>
          </div>
        </div>
      ) : !isAuthenticated ? (
        <AuthView />
      ) : (
        <div style={styles.layout} className="sis-app-layout">
          {/* Mobile Drawer Backdrop */}
          {mobileMenuOpen && (
            <div
              className="mobile-drawer-backdrop"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation overlay"
            />
          )}

          {/* Soft UI Sidebar — Collapsible on mobile/tablet, pinned on desktop */}
          <Sidebar
            currentView={currentView}
            setCurrentView={handleNavigate}
            mobileOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />

          {/* Main Content Area */}
          <div style={styles.mainContent} className="sis-main-content">
            <Topbar onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)} />

            <main style={styles.viewContainer} className="sis-view-container">
              <div style={styles.contentWrapper} className="sis-content-wrapper">
                {/* Student Persona Views */}
                {currentView === 'dashboard' && <DashboardView onNavigate={handleNavigate} />}
                {currentView === 'assignments' && <AssignmentsView />}
                {currentView === 'results' && <ResultsView />}
                {currentView === 'search' && <CourseSearchView />}
                {currentView === 'registration' && <CourseSearchView />}
                {currentView === 'attendance' && <AttendanceView />}
                {currentView === 'timetable' && <TimetableWeeklyView />}

                {/* Faculty Persona Views */}
                {currentView === 'faculty' && <FacultyPortalView activeSubTab="courses" onNavigate={handleNavigate} />}
                {currentView === 'faculty-assignments' && <FacultyPortalView activeSubTab="assignments" onNavigate={handleNavigate} />}
                {currentView === 'faculty-attendance' && <FacultyPortalView activeSubTab="attendance" onNavigate={handleNavigate} />}
                {currentView === 'faculty-grades' && <FacultyPortalView activeSubTab="grades" onNavigate={handleNavigate} />}

                {/* Admin Persona Views */}
                {currentView === 'admin' && <AdminPortalView initialTab="courses" onNavigate={handleNavigate} />}
                {currentView === 'admin-onboard' && <AdminPortalView initialTab="onboard" onNavigate={handleNavigate} />}
                {currentView === 'admin-reschedule' && <AdminPortalView initialTab="reschedule" onNavigate={handleNavigate} />}
                {currentView === 'admin-faculty' && <AdminPortalView initialTab="faculty" onNavigate={handleNavigate} />}
                {currentView === 'admin-debarment' && <AdminPortalView initialTab="debarred" onNavigate={handleNavigate} />}
                {currentView === 'system' && <SystemMonitorView />}

                {/* Parent Persona Views */}
                {currentView === 'parent' && <ParentPortalView />}

                {/* University Notices (Accessible to all roles) */}
                {currentView === 'notifications' && <NoticesView />}

                {/* 3D Container Scroll Animation Showcase */}
                {currentView === 'scroll-demo' && (
                  <div style={{ width: '100%', paddingBottom: '60px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 24px',
                      background: 'var(--glass-bg)',
                      backdropFilter: 'var(--glass-blur)',
                      borderRadius: 'var(--radius-squircle)',
                      border: '1px solid var(--glass-border)',
                      marginBottom: '20px',
                    }}>
                      <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                          3D Container Scroll Animation
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                          Interactive 3D perspective scrolling effect powered by framer-motion.
                        </p>
                      </div>
                      <button
                        onClick={() => handleNavigate('dashboard')}
                        className="btn-secondary"
                        style={{ padding: '8px 18px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer' }}
                      >
                        &larr; Back to Dashboard
                      </button>
                    </div>
                    <HeroScrollDemo />
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  layout: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1,
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    minWidth: 0,
    overflowY: 'auto',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  viewContainer: {
    flex: 1,
    padding: '0 16px 36px 16px',
  },
  contentWrapper: {
    maxWidth: '1440px',
    margin: '0 auto',
    width: '100%',
  },
  loadingScreen: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: 'transparent',
    position: 'relative',
    zIndex: 10,
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '44px 56px',
    backgroundColor: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    borderRadius: 'var(--radius-squircle)',
    border: '1px solid var(--glass-border)',
    borderTop: '1.5px solid var(--glass-border-highlight)',
    boxShadow: 'var(--glass-shadow-elevated)',
  },
};
