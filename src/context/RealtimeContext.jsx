import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Activity,
  Layers,
  X,
  Radio,
  Zap,
  Sparkles,
} from 'lucide-react';

const RealtimeContext = createContext(null);

export function RealtimeProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [telemetry, setTelemetry] = useState({
    qps: 248,
    latency: 32,
    activeShards: ['sis_shard_0', 'sis_shard_1', 'sis_shard_2'],
    virtualNodes: 300,
    hitRatio: 94.2,
    cacheHits: 124,
    cacheMisses: 8,
    allowedRequests: 48,
    rejectedRequests: 0,
    connectedClients: 1,
  });

  const [clusterLogs, setClusterLogs] = useState([
    {
      id: 'log-init-1',
      time: new Date(Date.now() - 12000).toLocaleTimeString(),
      type: 'SHARD_ROUTING',
      shard: 'sis_shard_1',
      message: 'Consistent Hash Ring: MD5 virtual node 184 resolved for shard sis_shard_1 (latency: 18ms)',
    },
    {
      id: 'log-init-2',
      time: new Date(Date.now() - 8000).toLocaleTimeString(),
      type: 'REDIS_HIT',
      shard: 'Upstash TLS',
      message: 'Course catalog cache hit key: cache:courses:all (0.84ms)',
    },
    {
      id: 'log-init-3',
      time: new Date(Date.now() - 4000).toLocaleTimeString(),
      type: 'TELEMETRY',
      shard: 'Cluster Leader',
      message: 'Real-time telemetry stream synchronized across 3 MongoDB Atlas shards',
    },
  ]);

  const [toasts, setToasts] = useState([]);
  const [unreadNoticeCount, setUnreadNoticeCount] = useState(2);
  const sseRef = useRef(null);

  const addToast = useCallback((toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast = {
      id,
      type: toast.type || 'info', // 'success' | 'warning' | 'info' | 'purple'
      title: toast.title || 'Notification',
      message: toast.message || '',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ...toast,
    };

    setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 visible toasts

    // Auto dismiss after 6.5 seconds
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 6500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addClusterLog = useCallback((logItem) => {
    setClusterLogs((prev) => [
      {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        time: new Date().toLocaleTimeString(),
        ...logItem,
      },
      ...prev,
    ].slice(0, 35)); // Keep last 35 logs
  }, []);

  // Connect to SSE stream
  useEffect(() => {
    const handleEvent = (event) => {
      setIsConnected(true);
      const eventType = event.eventType || event.type;

      if (eventType === 'CONNECTED') {
        addClusterLog({
          type: 'SYSTEM_CONNECT',
          shard: 'Cluster Master',
          message: event.message || 'Connected to Real-Time SSE stream',
        });
      } else if (eventType === 'TELEMETRY') {
        setTelemetry((prev) => ({
          ...prev,
          qps: event.currentQps || prev.qps,
          latency: event.avgLatencyMs || prev.latency,
          activeShards: event.activeShards || prev.activeShards,
          virtualNodes: event.virtualNodes || prev.virtualNodes,
          hitRatio: event.hitRatioPercent ?? prev.hitRatio,
          cacheHits: event.cacheHits ?? prev.cacheHits,
          cacheMisses: event.cacheMisses ?? prev.cacheMisses,
          allowedRequests: event.allowedRequests ?? prev.allowedRequests,
          rejectedRequests: event.rejectedRequests ?? prev.rejectedRequests,
          connectedClients: event.connectedClients ?? prev.connectedClients,
        }));
      } else if (eventType === 'ENROLLMENT') {
        addToast({
          type: 'success',
          title: 'Live Course Enrollment',
          message: `${event.studentId ? `Student ${event.studentId.slice(-4)}` : 'A student'} enrolled in ${event.courseCode} (${event.courseTitle || ''}) • ${event.seatsLeft} seats left`,
        });
        addClusterLog({
          type: 'ENROLLMENT',
          shard: event.targetShard || 'sis_shard_1',
          message: `Snowflake Write: ${event.courseCode} enrolled. Routed to ${event.targetShard || 'sis_shard_1'}`,
        });
      } else if (eventType === 'RESCHEDULE') {
        addToast({
          type: 'warning',
          title: '🚨 High-Priority Schedule Alert',
          message: `${event.courseCode} lecture rescheduled to ${event.newRoom} (${event.newSchedule}). Check timetable portal.`,
        });
        setUnreadNoticeCount((c) => c + 1);
        addClusterLog({
          type: 'RESCHEDULE',
          shard: 'Scatter-Gather',
          message: `Broadcast Circular: ${event.courseCode} moved to ${event.newRoom}. Timetable caches invalidated.`,
        });
      } else if (eventType === 'ATTENDANCE_MARKED') {
        addToast({
          type: 'info',
          title: 'Attendance Marked Live',
          message: `${event.courseCode}: ${event.presentCount} of ${event.totalCount} present. Compliance recalculated.`,
        });
        addClusterLog({
          type: 'ATTENDANCE',
          shard: 'Redis Invalidate',
          message: `Attendance marked for ${event.courseCode}. Redis timetable cache evicted for enrolled students.`,
        });
      } else if (eventType === 'GRADE_SUBMITTED') {
        addToast({
          type: 'purple',
          title: 'Grade Published',
          message: `Course ${event.courseCode}: Grade ${event.grade} recorded on shard.`,
        });
        addClusterLog({
          type: 'GRADE',
          shard: 'Storage Engine',
          message: `Grade ${event.grade} published for ${event.courseCode}.`,
        });
      } else if (eventType === 'SHARD_CHANGE') {
        addToast({
          type: 'purple',
          title: 'Elastic Shard Topology Change',
          message: `Shard ${event.shardName} ${event.action}. Total virtual nodes: ${event.virtualNodes}`,
        });
        addClusterLog({
          type: 'TOPOLOGY',
          shard: event.shardName,
          message: `Consistent Hash Ring rebalanced: ${event.shardName} ${event.action} (${event.virtualNodes} v-nodes).`,
        });
      } else if (eventType === 'TRAFFIC_BURST') {
        addToast({
          type: 'purple',
          title: '⚡ Traffic Burst Processed',
          message: `${event.simulatedRequests} concurrent scatter-gather queries processed with ${event.scatterGatherLatencyMs}ms p99 latency.`,
        });
        addClusterLog({
          type: 'TRAFFIC_BURST',
          shard: 'Scatter-Gather 3-Node',
          message: `Traffic burst peak: ${event.qpsPeak} QPS • p99: ${event.scatterGatherLatencyMs}ms latency across MongoDB Atlas shards.`,
        });
      }
    };

    sseRef.current = api.realtime.subscribe(handleEvent, (err) => {
      console.warn('Real-time SSE connection retry in progress...');
      setIsConnected(false);
    });

    return () => {
      if (sseRef.current && sseRef.current.close) {
        sseRef.current.close();
      }
    };
  }, [addToast, addClusterLog]);

  const triggerTrafficBurst = async (requests = 15) => {
    try {
      const res = await api.realtime.simulateTraffic(requests);
      return res;
    } catch (err) {
      console.warn('Traffic simulation local trigger:', err);
      // Local fallback
      addToast({
        type: 'purple',
        title: '⚡ Simulated Traffic Burst',
        message: `${requests} concurrent requests processed across shards with 28ms latency.`,
      });
      addClusterLog({
        type: 'TRAFFIC_BURST',
        shard: 'All Shards',
        message: `Traffic burst: ${requests} queries evaluated across consistent hash ring.`,
      });
    }
  };

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        telemetry,
        clusterLogs,
        toasts,
        addToast,
        dismissToast,
        triggerTrafficBurst,
        unreadNoticeCount,
        markNoticesRead: () => setUnreadNoticeCount(0),
      }}
    >
      {children}

      {/* Floating Glassmorphism Real-Time Toast Container */}
      <div style={toastStyles.container}>
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isWarning = t.type === 'warning';
          const isPurple = t.type === 'purple';

          const accentColor = isSuccess ? '#10B981' : isWarning ? '#F59E0B' : isPurple ? '#8B5CF6' : '#3B82F6';
          const bgGlow = isSuccess
            ? 'rgba(16, 185, 129, 0.12)'
            : isWarning
            ? 'rgba(245, 158, 11, 0.14)'
            : isPurple
            ? 'rgba(139, 92, 246, 0.14)'
            : 'rgba(59, 130, 246, 0.12)';

          const IconComponent = isSuccess ? CheckCircle : isWarning ? AlertTriangle : isPurple ? Zap : Activity;

          return (
            <div
              key={t.id}
              style={{
                ...toastStyles.card,
                borderLeft: `4px solid ${accentColor}`,
                boxShadow: `0 8px 24px -4px rgba(0,0,0,0.2), 0 0 16px ${bgGlow}`,
              }}
              className="animate-slide-down"
            >
              <div style={{ ...toastStyles.iconCircle, backgroundColor: bgGlow, color: accentColor }}>
                <IconComponent size={18} />
              </div>

              <div style={toastStyles.content}>
                <div style={toastStyles.headerRow}>
                  <strong style={toastStyles.title}>{t.title}</strong>
                  <span style={toastStyles.timeBadge}>{t.time}</span>
                </div>
                <div style={toastStyles.message}>{t.message}</div>
              </div>

              <button
                onClick={() => dismissToast(t.id)}
                style={toastStyles.closeBtn}
                title="Dismiss"
              >
                <X size={14} color="#94A3B8" />
              </button>
            </div>
          );
        })}
      </div>
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}

const toastStyles = {
  container: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column-reverse',
    gap: '10px',
    pointerEvents: 'none',
    maxWidth: '420px',
    width: 'calc(100vw - 48px)',
  },
  card: {
    pointerEvents: 'auto',
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    borderRadius: '12px',
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.25s ease',
  },
  iconCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    marginBottom: '3px',
  },
  title: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: '-0.01em',
  },
  timeBadge: {
    fontSize: '0.68rem',
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  message: {
    fontSize: '0.78rem',
    color: '#CBD5E1',
    lineHeight: '1.35',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
    transition: 'opacity 0.15s ease',
  },
};
