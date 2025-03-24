import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    CategoryScale,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register components for the Pie chart and the datalabels plugin
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, ChartDataLabels);

const DashboardChartsNew = () => {
    const data1 = [
        { label: "Total Employee", y: 132 },
        { label: "Teaching", y: 1 },
        { label: "Non Teaching", y: 131 },
    ];

    const total = data1.reduce((sum, item) => sum + item.y, 0);

    const data = {
        labels: data1.map(item => item.label),
        datasets: [
            {
                label: 'Employee Distribution',
                data: data1.map(item => item.y),
                backgroundColor: [
                    'rgba(63, 81, 181, 0.8)', // Primary blue
                    'rgba(233, 30, 99, 0.8)', // Pink
                    'rgba(0, 188, 212, 0.8)', // Teal
                ],
                hoverBackgroundColor: [
                    'rgba(63, 81, 181, 1)',
                    'rgba(233, 30, 99, 1)',
                    'rgba(0, 188, 212, 1)',
                ],
                borderColor: '#fff',
                borderWidth: 3,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#333',
                    font: {
                        size: 16,
                        weight: '500',
                    },
                    padding: 20,
                },
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        const value = tooltipItem.raw;
                        const percentage = ((value / total) * 100).toFixed(2);
                        return `${tooltipItem.label}: ${value} (${percentage}%)`;
                    },
                },
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#333',
                borderWidth: 1,
            },
            datalabels: {
                formatter: function (value) {
                    const percentage = ((value / total) * 100).toFixed(2);
                    return `${value} (${percentage}%)`;
                },
                color: '#fff',
                anchor: 'center',
                align: 'center',
                font: {
                    weight: 'bold',
                    size: 16,
                },
            },
        },
    };

    return (
        <div style={styles.card}>
            <div style={styles.header}>
                <h6 style={styles.title}>Employee Distribution</h6>
            </div>
            <div style={styles.chartContainer}>
                <Pie data={data} options={options} style={styles.pie} />
            </div>
        </div>
    );
};

const styles = {
    card: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '25px',
        margin: 'auto',
        textAlign: 'center',
    },
    // pie: {
    //     height: '250px',
    // },
    header: {
        marginBottom: '25px',
    },
    title: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#333',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    chartContainer: {
        position: 'relative',
    },
};

export default DashboardChartsNew;
