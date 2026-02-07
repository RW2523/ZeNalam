import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const DonutChart = () => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: ['#00b894', '#fdcb6e', '#e17055', '#6c5ce7'],
        }],
    });

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/workout-distribution`)
            .then(response => {
                setChartData({
                    labels: response.data.labels,
                    datasets: [{
                        data: response.data.values,
                        backgroundColor: ['#00b894', '#fdcb6e', '#e17055', '#6c5ce7'],
                        hoverBackgroundColor: ['#00b894', '#fdcb6e', '#e17055', '#6c5ce7'],
                    }],
                });
            })
            .catch(error => console.error('Error fetching chart data:', error));
    }, []);

    return (
        <div style={{ width: '100%', height: '300px' }}>
            <Doughnut data={chartData} options={{ plugins: { legend: { display: true, position: 'right' } } }} />
        </div>
    );
};

export default DonutChart;
