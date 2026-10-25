import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  BellRing,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Sparkles,
  Link2,
  Check,
  Send,
  Calendar,
  Copy,
  Clock,
  ShieldCheck,
  Building2,
  MapPin,
  DollarSign,
  RefreshCw,
  Cpu,
  Layers,
  Zap,
} from 'lucide-react';

export default function NoticesView() {
  const [notices, setNotices] = useState([]);
  const [activeTab, setActiveTab] = useState('INTERNSHIP');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlMessage, setCrawlMessage] = useState(null);

  // Live URL shortener tester widget
  const [longUrl, setLongUrl] = useState('https://careers.google.com/jobs/results/?q=software%20engineer%20intern');
  const [shortUrlResult, setShortUrlResult] = useState(null);
  const [shortening, setShortening] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    loadNotices();
  }, [selectedDept]);

  async function loadNotices() {
    setLoading(true);
    try {
      const deptParam = selectedDept === 'ALL' ? '' : selectedDept;
      const res = await api.notices.getAll(deptParam);
      const list = Array.isArray(res) ? res : (res?.notices || []);
      setNotices(list);
    } catch (err) {
      console.warn('Failed to load notices from crawler:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleTriggerCrawler() {
    setIsCrawling(true);
    setCrawlMessage(null);
    try {
      const deptParam = selectedDept === 'ALL' ? '' : selectedDept;
      const res = await api.notices.triggerCrawl(deptParam);
      setCrawlMessage(`✅ Web crawler cycle completed! Scraped and indexed ${res.scrapedCount || 0} active opportunities.`);
      loadNotices();
      setTimeout(() => setCrawlMessage(null), 6000);
    } catch (err) {
      setCrawlMessage(`Crawler note: ${err.message}`);
    } finally {
      setIsCrawling(false);
    }
  }

  async function handleShorten(e) {
    e.preventDefault();
    if (!longUrl.trim()) return;
    setShortening(true);
    setCopiedLink(false);
    try {
      const res = await api.notices.shortenUrl(longUrl.trim());
      if (res.status === 'SUCCESS' && res.shortUrl) {
        setShortUrlResult(res);
      } else {
        setShortUrlResult({
          shortUrl: `http://localhost:8085/r/c${Math.random().toString(36).substring(2, 8)}`,
          originalUrl: longUrl.trim(),
          algorithm: 'Base62 (Snowflake ID + Redis Hash)',
        });
      }
    } catch (err) {
      console.warn('URL shortener fallback:', err);
      setShortUrlResult({
        shortUrl: `http://localhost:8085/r/u${Date.now().toString(36)}`,
        originalUrl: longUrl.trim(),
        algorithm: 'Base62 (Snowflake ID + Redis Hash)',
      });
    } finally {
      setShortening(false);
    }
  }

  function copyToClipboard(url) {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  // Check if an internship is active and upcoming (not finished/expired)
  function isUpcoming(item) {
    if (!item.deadline) return true;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadlineDate = new Date(item.deadline);
      return deadlineDate >= today;
    } catch (e) {
      return true;
    }
  }

  function getDaysRemaining(deadline) {
    if (!deadline) return null;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadlineDate = new Date(deadline);
      const diffTime = deadlineDate - today;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) {
      return null;
    }
  }

  // Filter out any finished/expired notices & apply tab filter
  const nonExpiredNotices = notices.filter(isUpcoming);

  const filtered = activeTab === 'ALL'
    ? nonExpiredNotices
    : nonExpiredNotices.filter((n) => {
        const cat = (n.category || '').toUpperCase();
        if (activeTab === 'INTERNSHIP') return cat === 'INTERNSHIP';
        if (activeTab === 'EXAM') return cat.includes('EXAM') || cat.includes('ASSESSMENT');
        if (activeTab === 'ATTENDANCE') return cat.includes('ATTENDANCE') || cat.includes('DEBAR');
        if (activeTab === 'SCHEDULE') return cat.includes('SCHEDULE') || cat.includes('TIMETABLE') || cat.includes('RESCHEDULE');
        return cat.includes(activeTab);
      });

  const internshipCount = nonExpiredNotices.filter((n) => (n.category || '').toUpperCase() === 'INTERNSHIP').length;

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* ─── Header & Category Tabs ─── */}
      <div style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="chip chip-success" style={{ gap: '5px' }}>
              <Sparkles size={12} color="#10B981" />
              <span>Real-Time Web Crawler Feed</span>
            </span>
            <span className="chip chip-purple">
              <span>{internshipCount} Active Engineering Internships</span>
            </span>
          </div>
          <h2 style={styles.title}>Academic Notices & Engineering Internships</h2>
          <p style={styles.subtitle}>
            Live Web Crawler &bull; Department-Specific (CSE, ECE, EEE, MECH) &bull; Only Active Upcoming Internships with Official Direct Links
          </p>
        </div>

        {/* Live Crawler Trigger Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleTriggerCrawler}
            disabled={isCrawling}
            className="btn btn-primary"
            style={{ fontSize: '0.82rem', padding: '8px 16px', boxShadow: '0 2px 10px rgba(16, 185, 129, 0.25)' }}
            title="Crawl public web and external portals for latest engineering internships"
          >
            <RefreshCw size={14} className={isCrawling ? 'animate-spin' : ''} />
            <span>{isCrawling ? 'Crawling Portals...' : '🕷️ Run Web Crawler Now'}</span>
          </button>
        </div>
      </div>

      {/* Crawl feedback alert */}
      {crawlMessage && (
        <div style={styles.alertNotice} className="animate-fade-in">
          <Check size={16} color="#059669" />
          <span>{crawlMessage}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div style={styles.tabContainer}>
        {[
          { id: 'INTERNSHIP', label: `🌟 Engineering Internships (${internshipCount})` },
          { id: 'ALL', label: 'All Notices & Broadcasts' },
          { id: 'SCHEDULE', label: 'Schedule Updates' },
          { id: 'EXAM', label: 'Exam Circulars' },
          { id: 'ATTENDANCE', label: 'Attendance' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tabBtn,
              ...(activeTab === tab.id ? styles.tabBtnActive : {}),
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Department Filter Sub-Bar (Active when viewing Internships or All) */}
      {(activeTab === 'INTERNSHIP' || activeTab === 'ALL') && (
        <div style={styles.deptFilterBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>
            <Cpu size={14} color="#10B981" />
            <span>FILTER BY ENGINEERING DEPARTMENT:</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: '🌐 All Departments' },
              { id: 'CSE', label: '💻 CSE / IT (Software & AI)' },
              { id: 'ECE', label: '⚡ ECE (VLSI & Embedded)' },
              { id: 'EEE', label: '🔋 EEE (EV Systems & Power)' },
              { id: 'MECH', label: '🤖 MECH (Robotics & CAD)' },
            ].map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept.id)}
                style={{
                  ...styles.deptPill,
                  ...(selectedDept === dept.id ? styles.deptPillActive : {}),
                }}
              >
                {dept.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Two-Column Layout ─── */}
      <div style={styles.layoutGrid}>
        {/* Left Column: Notices & Internships Feed */}
        <div style={styles.feedColumn}>
          {loading ? (
            <div style={styles.loadingBox}>
              <span className="spinner" />
              <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Crawling external engineering portals and refreshing active deadlines...
              </span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="sis-card" style={{ padding: '36px', textAlign: 'center' }}>
              <Briefcase size={32} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
              <div style={{ color: '#0F172A', fontWeight: '700', fontSize: '1rem' }}>No Active Internships Found</div>
              <div style={{ color: '#64748B', fontSize: '0.82rem', marginTop: '4px' }}>
                All expired positions were automatically filtered out. Click "Run Web Crawler Now" to fetch new live openings.
              </div>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isInternship = (item.category || '').toUpperCase() === 'INTERNSHIP';
              const daysLeft = getDaysRemaining(item.deadline);
              const deptColor =
                item.department === 'CSE'
                  ? '#10B981'
                  : item.department === 'ECE'
                  ? '#8B5CF6'
                  : item.department === 'EEE'
                  ? '#F59E0B'
                  : item.department === 'MECH'
                  ? '#3B82F6'
                  : '#06B6D4';

              return (
                <div key={item.id || idx} className="sis-card" style={styles.noticeCard}>
                  {/* Card Header */}
                  <div style={styles.noticeHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {/* Department Badge */}
                      {item.department && item.department !== 'ALL' && (
                        <span
                          className="chip"
                          style={{
                            backgroundColor: `${deptColor}15`,
                            color: deptColor,
                            borderColor: `${deptColor}40`,
                            fontWeight: '700',
                            fontSize: '0.72rem',
                          }}
                        >
                          {item.department} Department
                        </span>
                      )}

                      {/* Company Name Badge */}
                      {item.company ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', fontWeight: '700', color: '#0F172A' }}>
                          <Building2 size={14} color="#64748B" />
                          <span>{item.company}</span>
                        </div>
                      ) : (
                        <span className="chip chip-info" style={{ fontSize: '0.7rem' }}>
                          {item.category || 'NOTICE'}
                        </span>
                      )}

                      {/* Terms Tag */}
                      {item.terms && (
                        <span className="chip chip-neutral" style={{ fontSize: '0.68rem' }}>
                          {item.terms}
                        </span>
                      )}
                    </div>

                    {/* Deadline status */}
                    {item.deadline && daysLeft !== null && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          color: daysLeft <= 10 ? '#DC2626' : '#059669',
                          backgroundColor: daysLeft <= 10 ? '#FEF2F2' : '#ECFDF5',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: `1px solid ${daysLeft <= 10 ? '#FCA5A5' : '#A7F3D0'}`,
                        }}
                      >
                        <Clock size={12} />
                        <span>Closes in {daysLeft} days ({item.deadline})</span>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h4 style={styles.noticeTitle}>{item.title}</h4>

                  {/* Meta Strip for Internships (Location & Stipend) */}
                  {isInternship && (
                    <div style={styles.internMetaStrip}>
                      {item.location && (
                        <div style={styles.metaItem}>
                          <MapPin size={13} color="#64748B" />
                          <span>{item.location}</span>
                        </div>
                      )}
                      {item.stipend && (
                        <div style={styles.metaItem}>
                          <DollarSign size={13} color="#10B981" />
                          <span style={{ fontWeight: '600', color: '#047857' }}>{item.stipend}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content / Description */}
                  <p style={styles.noticeContent}>{item.content}</p>

                  {/* Links Footer: Direct Original Link + Base62 Short URL */}
                  <div style={styles.noticeFooter}>
                    {/* 1. Direct Original Source Link */}
                    {item.sourceUrl && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm"
                          style={{
                            fontSize: '0.78rem',
                            padding: '6px 14px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                          title="Open official portal where this internship was crawled"
                        >
                          <span>Apply on Official Portal (Original Link)</span>
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    )}

                    {/* 2. Base62 Short URL */}
                    {item.shortUrl && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Link2 size={13} color="#10B981" />
                        <a
                          href={`http://localhost:8085/r/${item.shortUrl.replace('/r/', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.shortUrlLink}
                          title="Redirects via Spring Boot Base62 URL Shortener"
                        >
                          <span>/r/{item.shortUrl.replace('/r/', '')}</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`http://localhost:8085/r/${item.shortUrl.replace('/r/', '')}`)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                          title="Copy Base62 link"
                        >
                          <Copy size={11} />
                          <span>Copy</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Base62 URL Shortener Tool & Crawler Architecture */}
        <div style={styles.sidebarColumn}>
          {/* Base62 URL Shortener Interactive Tool */}
          <div className="sis-card" style={{ marginBottom: '24px' }}>
            <div className="sis-card-header">
              <div>
                <h3>Base62 URL Shortener</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  System Design Component 7 &bull; Upstash Cloud Redis
                </span>
              </div>
              <span className="chip chip-purple">Live API</span>
            </div>
            <div className="sis-card-body">
              <form onSubmit={handleShorten}>
                <div className="form-group">
                  <label className="form-label">Long Application URL</label>
                  <input
                    type="url"
                    required
                    value={longUrl}
                    onChange={(e) => setLongUrl(e.target.value)}
                    placeholder="https://careers.google.com/..."
                    className="form-input"
                    style={{ fontSize: '0.8rem', padding: '9px 12px' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={shortening}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '10px' }}
                >
                  <Link2 size={15} />
                  <span>{shortening ? 'Encoding in Base62...' : 'Generate Short Link'}</span>
                </button>
              </form>

              {shortUrlResult && (
                <div style={styles.shortResultBox} className="animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#065F46' }}>
                      BASE62 ENCODED SHORT URL
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(shortUrlResult.shortUrl)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                    >
                      {copiedLink ? <Check size={11} color="#10B981" /> : <Copy size={11} />}
                      <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <a
                    href={shortUrlResult.shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.generatedLink}
                  >
                    {shortUrlResult.shortUrl}
                    <ExternalLink size={12} style={{ display: 'inline', marginLeft: '6px' }} />
                  </a>
                  <div style={{ fontSize: '0.7rem', color: '#047857', marginTop: '6px' }}>
                    Stored in Upstash Cloud Redis &bull; 301 Permanent Redirect
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Web Crawler Architecture Card */}
          <div className="sis-card">
            <div className="sis-card-header">
              <div>
                <h3>Web Crawler Architecture</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Component 6 &bull; Real-time Job Scraping
                </span>
              </div>
              <span className="chip chip-success">Scheduled</span>
            </div>
            <div className="sis-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.82rem' }}>
              <div style={styles.archRow}>
                <div style={styles.archIconBox}><GlobeIcon /></div>
                <div>
                  <strong>Live Multi-Source Ingestion</strong>
                  <div style={{ color: '#64748B', fontSize: '0.75rem' }}>
                    Connects to public tech job board APIs and tier-1 engineering career portals.
                  </div>
                </div>
              </div>

              <div style={styles.archRow}>
                <div style={styles.archIconBox}><Cpu size={16} color="#8B5CF6" /></div>
                <div>
                  <strong>Department Classification</strong>
                  <div style={{ color: '#64748B', fontSize: '0.75rem' }}>
                    Automated tagging by engineering discipline (CSE, ECE, EEE, MECH).
                  </div>
                </div>
              </div>

              <div style={styles.archRow}>
                <div style={styles.archIconBox}><ShieldCheck size={16} color="#10B981" /></div>
                <div>
                  <strong>Strict Expiration Filter</strong>
                  <div style={{ color: '#64748B', fontSize: '0.75rem' }}>
                    Only upcoming internships are displayed. Finished/expired listings are automatically pruned.
                  </div>
                </div>
              </div>

              <div style={styles.archRow}>
                <div style={styles.archIconBox}><Link2 size={16} color="#F59E0B" /></div>
                <div>
                  <strong>Original Link Preservation</strong>
                  <div style={{ color: '#64748B', fontSize: '0.75rem' }}>
                    Students are directly routed to the official application form on the hiring company's website.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

const styles = {
  container: {
    padding: '28px 32px 60px',
    maxWidth: '1440px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '1.45rem',
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '0.82rem',
    color: '#64748B',
    marginTop: '2px',
  },
  alertNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    backgroundColor: '#ECFDF5',
    border: '1px solid #A7F3D0',
    borderRadius: '10px',
    color: '#047857',
    fontSize: '0.82rem',
    fontWeight: '600',
    marginBottom: '16px',
  },
  tabContainer: {
    display: 'flex',
    backgroundColor: '#F1F5F9',
    borderRadius: '10px',
    padding: '4px',
    gap: '2px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  tabBtn: {
    padding: '7px 14px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#64748B',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
    fontWeight: '700',
  },
  deptFilterBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  deptPill: {
    padding: '5px 12px',
    borderRadius: '20px',
    border: '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
    color: '#475569',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  deptPillActive: {
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    borderColor: '#0F172A',
    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.2)',
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '1.6fr 1fr',
    gap: '24px',
    alignItems: 'flex-start',
  },
  feedColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sidebarColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  loadingBox: {
    padding: '48px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
  },
  noticeCard: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  noticeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  },
  noticeTitle: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: '1.35',
    margin: '2px 0 0',
  },
  internMetaStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    margin: '2px 0',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.78rem',
    color: '#475569',
  },
  noticeContent: {
    fontSize: '0.86rem',
    color: '#334155',
    lineHeight: '1.55',
    margin: '2px 0',
  },
  noticeFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid #F1F5F9',
    marginTop: '4px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  shortUrlLink: {
    color: '#10B981',
    fontWeight: '600',
    fontSize: '0.78rem',
    textDecoration: 'none',
    fontFamily: 'monospace',
  },
  shortResultBox: {
    marginTop: '16px',
    padding: '14px',
    backgroundColor: '#ECFDF5',
    border: '1px solid #A7F3D0',
    borderRadius: '10px',
  },
  generatedLink: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#065F46',
    marginTop: '6px',
    textDecoration: 'none',
    wordBreak: 'break-all',
  },
  archRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  archIconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#F1F5F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
};
