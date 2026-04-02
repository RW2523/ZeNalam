import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { api } from '../apiClient';

const COLORS = ['#1a2744', '#c9a227', '#243352', '#8a7020', '#3d5a80'];
const COLORS_HOVER = ['#243352', '#e8c547', '#1a2744', '#c9a227', '#5c7a9e'];

const DonutChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: COLORS,
    }],
  });
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    api.get('/api/workout-distribution')
      .then((response) => {
        const labels = response.data?.labels || [];
        const values = response.data?.values || [];
        const isEmpty = !labels.length || !values.length;
        setEmpty(isEmpty);
        const n = Math.max(labels.length, 1);
        setChartData({
          labels,
          datasets: [{
            data: isEmpty ? [1] : values,
            backgroundColor: isEmpty ? ['var(--zen-border)'] : COLORS.slice(0, labels.length),
            hoverBackgroundColor: isEmpty ? ['var(--zen-border)'] : COLORS_HOVER.slice(0, labels.length),
          }],
        });
      })
      .catch(() => {
        setEmpty(true);
        setChartData({
          labels: ['No data'],
          datasets: [{ data: [1], backgroundColor: ['var(--zen-border)'], hoverBackgroundColor: ['var(--zen-border)'] }],
        });
      });
  }, []);

  return (
    <div style={{ width: '100%', height: '300px', position: 'relative' }}>
      {empty && (
        <p style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          margin: 0,
          fontSize: '0.85rem',
          color: 'var(--zen-text-muted)',
          textAlign: 'center',
          zIndex: 1,
          pointerEvents: 'none',
          maxWidth: '12rem',
        }}
        >
          Distribution appears when overview data exists in the database.
        </p>
      )}
      <Doughnut
        data={chartData}
        options={{
          plugins: {
            legend: { display: true, position: 'right', labels: { color: 'var(--zen-text)', font: { family: 'var(--zen-font)' } } },
          },
        }}
      />
    </div>
  );
};

export default DonutChart;
