import React, { useEffect, useState } from 'react';
import { FaBiking, FaRunning, FaWalking, FaDumbbell } from 'react-icons/fa';
import './styles/ActivityCards.css';
import { api } from '../apiClient';

const iconMap = {
    cycling: <FaBiking />,
    running: <FaRunning />,
    walking: <FaWalking />,
    cardio: <FaRunning />,
    strength: <FaDumbbell />,
    flexibility: <FaWalking />,
};

const getActivityIcon = (type) => {
    if (!type) return <FaDumbbell />;
    const key = String(type).toLowerCase();
    return iconMap[key] || <FaDumbbell />;
};

const ActivityCards = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        api
            .get('/api/activities')
            .then((response) => setActivities(Array.isArray(response.data) ? response.data : []))
            .catch((err) => {
                console.error('Error fetching activities:', err);
                setError(err.message || 'Failed to load activities');
                setActivities([]);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="activity-cards">
            {loading && <p className="activity-cards-loading">Loading activities...</p>}
            {error && <p className="activity-cards-error">{error}</p>}
            {!loading && !error && activities.length === 0 && (
                <p className="activity-cards-empty">No activities yet.</p>
            )}
            {activities.map((activity, index) => (
                <div className="activity-card" key={activity.id || index}>
                    <div className="activity-header">
                        <div className="activity-icon">{getActivityIcon(activity.type)}</div>
                        <div className="activity-name">{activity.name}</div>
                    </div>
                    <div className="activity-info">
                        <div className="activity-details">Goal: {activity.goal}</div>
                        <div className="progress-header">
                            <span className="progress-label">Progress</span>
                            <span className="progress-percent">{activity.progress}%</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress" style={{ width: `${activity.progress}%` }}></div>
                        </div>
                        <div className="current-progress">
                            <span>{activity.current}</span>
                            <span className="days-left">{activity.daysLeft} days left</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActivityCards;
