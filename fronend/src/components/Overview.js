import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { api } from '../apiClient';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import './styles/Overview.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const emptyDataset = {
    label: 'Steps',
    data: [],
    backgroundColor: 'rgba(201, 162, 39, 0.15)',
    borderColor: '#c9a227',
    borderWidth: 2,
    pointBackgroundColor: '#c9a227',
    pointBorderColor: '#ffffff',
    pointHoverBackgroundColor: '#e8c547',
    pointHoverBorderColor: '#ffffff',
    fill: true,
};

const Overview = () => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [{ ...emptyDataset }],
    });

    const [stats, setStats] = useState({
        timeProgress: 0,
        stepProgress: 0,
        targetProgress: 0,
    });

    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [periodLabel, setPeriodLabel] = useState('Period');

    useEffect(() => {
        setLoading(true);
        setFetchError(null);
        api
            .get('/api/overviews')
            .then((response) => {
                const { months = [], steps = [], timeProgress = 0, stepProgress = 0, targetProgress = 0 } = response.data;
                const m = Array.isArray(months) ? months : [];
                setChartData({
                    labels: m,
                    datasets: [
                        {
                            ...emptyDataset,
                            data: Array.isArray(steps) ? steps : [],
                        },
                    ],
                });
                setStats({ timeProgress, stepProgress, targetProgress });
                setPeriodLabel(m.length ? m[m.length - 1] : 'Latest');
            })
            .catch((err) => {
                console.error('Failed to fetch overview data:', err);
                setFetchError(err.message || 'Failed to load overview');
                setChartData({ labels: [], datasets: [{ ...emptyDataset, data: [] }] });
                setStats({ timeProgress: 0, stepProgress: 0, targetProgress: 0 });
                setPeriodLabel('—');
            })
            .finally(() => setLoading(false));
    }, []);

    const options = {
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.12)',
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.85)',
                },
            },
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.12)',
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.85)',
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
        },
        elements: {
            line: {
                tension: 0.4,
            },
        },
    };

    return (
        <div className="overview">
            <h2>Overview</h2>
            {loading && <p className="overview-loading">Loading...</p>}
            {fetchError && <p className="overview-error">{fetchError}</p>}
            <div className="overview-content">
                <div className="stats">
                    <div className="stat">
                        <h3>Total time</h3>
                        <div className="progress-bar">
                            <div className="progress" style={{ width: `${stats.timeProgress}%` }}></div>
                        </div>
                        <div className="details">
                            <span>{stats.timeProgress * 10} hr</span>
                            <span>{periodLabel}</span>
                        </div>
                    </div>
                    <div className="stat">
                        <h3>Total steps</h3>
                        <div className="progress-bar">
                            <div className="progress" style={{ width: `${stats.stepProgress}%` }}></div>
                        </div>
                        <div className="details">
                            <span>{stats.stepProgress * 100} st</span>
                            <span>{periodLabel}</span>
                        </div>
                    </div>
                    <div className="stat">
                        <h3>Target</h3>
                        <div className="progress-bar">
                            <div className="progress" style={{ width: `${stats.targetProgress}%` }}></div>
                        </div>
                        <div className="details">
                            <span>{stats.targetProgress * 100} st</span>
                            <span>{periodLabel}</span>
                        </div>
                    </div>
                </div>
                <div className="chart">
                    <Line data={chartData} options={options} />
                </div>
            </div>
        </div>
    );
};

export default Overview;
