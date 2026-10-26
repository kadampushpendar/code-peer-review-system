import { useEffect, useState } from 'react';
import { Bell, CheckCircle2, MessageSquare, Clock } from 'lucide-react';
import { api } from '../services/api';

export default function Notifications() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  const load = () =>
    api.notifications()
      .then(setItems)
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  async function handleReadAll() {
    try {
      await api.markAllRead();
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  if (error) {
    return (
      <div className="error-banner" style={{ margin: '20px 0' }}>
        System error: {error}
      </div>
    );
  }

  if (!items) {
    return (
      <div className="empty">
        <b>Loading Notifications...</b>
        <span>Querying peer alert stream.</span>
      </div>
    );
  }

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <>
      <div className="heading">
        <div>
          <span className="eyebrow">
            <span className="online" /> SYSTEM LOGS & ALERTS
          </span>
          <h1>Notifications</h1>
          <p>Real-time review assignments, peer annotations, and score releases.</p>
        </div>

        {unreadCount > 0 && (
          <button className="btn outline" onClick={handleReadAll}>
            <CheckCircle2 size={13} /> Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      <div className="panel notifications">
        {items.length === 0 ? (
          <div className="empty">
            <b>All caught up</b>
            <span>You have no notifications in your activity feed.</span>
          </div>
        ) : (
          items.map((n) => (
            <div
              key={n.id}
              className={`notification ${n.read ? '' : 'unread'}`}
            >
              <div className="notification-icon">
                {n.message.includes('comment') ? (
                  <MessageSquare size={16} />
                ) : (
                  <Bell size={16} />
                )}
              </div>
              <div>
                <b>{n.message}</b>
                <p>Peer evaluation event triggered in module workspace.</p>
                <small>
                  <Clock size={11} /> {new Date(n.createdAt).toLocaleString()}
                </small>
              </div>
              {!n.read && <div className="unread-dot" title="Unread notification" />}
            </div>
          ))
        )}
      </div>
    </>
  );
}
