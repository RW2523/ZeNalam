import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
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
import { API_BASE_URL } from '../config';
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
    backgroundColor: 'rgba(106, 76, 147, 0.2)',
    borderColor: '#6a4c93',
    borderWidth: 2,
    pointBackgroundColor: '#ff6f61',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#ff6f61',
    pointHoverBorderColor: '#fff',
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

    useEffect(() => {
        setLoading(true);
        setFetchError(null);
        axios
            .get(`${API_BASE_URL}/api/overviews`)
            .then((response) => {
                const { months = [], steps = [], timeProgress = 0, stepProgress = 0, targetProgress = 0 } = response.data;
                setChartData({
                    labels: Array.isArray(months) ? months : [],
                    datasets: [
                        {
                            ...emptyDataset,
                            data: Array.isArray(steps) ? steps : [],
                        },
                    ],
                });
                setStats({ timeProgress, stepProgress, targetProgress });
            })
            .catch((err) => {
                console.error('Failed to fetch overview data:', err);
                setFetchError(err.message || 'Failed to load overview');
                setChartData({ labels: [], datasets: [{ ...emptyDataset, data: [] }] });
                setStats({ timeProgress: 0, stepProgress: 0, targetProgress: 0 });
            })
            .finally(() => setLoading(false));
    }, []);

    const options = {
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    color: '#fff',
                },
            },
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    color: '#fff',
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
                        <h3>Total Time</h3>
                        <div className="progress-bar">
                            <div className="progress" style={{ width: `${stats.timeProgress}%` }}></div>
                        </div>
                        <div className="details">
                            <span>{stats.timeProgress * 10} Hr</span>
                            <span>May</span>
                        </div>
                    </div>
                    <div className="stat">
                        <h3>Total Steps</h3>
                        <div className="progress-bar">
                            <div className="progress" style={{ width: `${stats.stepProgress}%` }}></div>
                        </div>
                        <div className="details">
                            <span>{stats.stepProgress * 100} St</span>
                            <span>May</span>
                        </div>
                    </div>
                    <div className="stat">
                        <h3>Target</h3>
                        <div className="progress-bar">
                            <div className="progress" style={{ width: `${stats.targetProgress}%` }}></div>
                        </div>
                        <div className="details">
                            <span>{stats.targetProgress * 100} St</span>
                            <span>May</span>
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
