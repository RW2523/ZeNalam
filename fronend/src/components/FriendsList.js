import React, { useState, useEffect } from 'react';
import './styles/FriendsList.css';
import { FaUserFriends } from "react-icons/fa";
import { api } from '../apiClient';

const FriendsList = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await api.get('/api/content/community-feed');
                if (!cancelled) {
                    setItems(Array.isArray(res.data) ? res.data : []);
                    setError(null);
                }
            } catch (e) {
                if (!cancelled) {
                    setError(e.message || 'Could not load community feed.');
                    setItems([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="friends-list">
            <div className="header-section">
                <h2><FaUserFriends /> Community</h2>
                <span className="friends-sub">Recent activity</span>
            </div>
            {loading && <p className="friends-status">Loading…</p>}
            {error && <p className="friends-error">{error}</p>}
            {!loading && !error && items.length === 0 && (
                <p className="friends-status">No community entries yet.</p>
            )}
            <ul className="friends-ul">
                {items.map((row) => (
                    <li key={row.id}>
                        <img className="friend-image" src={row.imageUrl} alt="" />
                        <div className="friend-info">
                            <span className="friend-name">{row.displayName}</span>
                            <span className="friend-activity">{row.activityDescription}</span>
                            <span className="friend-time">{row.timeLabel}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FriendsList;
