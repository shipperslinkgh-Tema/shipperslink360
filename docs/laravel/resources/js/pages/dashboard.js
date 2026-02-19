/**
 * Dashboard – Chart.js initialisation + live stat refresh
 */
import {
    Chart,
    BarController,
    LineController,
    DoughnutController,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

Chart.register(
    BarController, LineController, DoughnutController,
    BarElement, LineElement, PointElement, ArcElement,
    CategoryScale, LinearScale, Tooltip, Legend, Filler
);

/* ── Shared palette ─────────────────────────────────────────── */
const palette = {
    blue:   'rgba(59,  130, 246, 1)',
    blueFill: 'rgba(59, 130, 246, 0.15)',
    green:  'rgba(34,  197, 94,  1)',
    amber:  'rgba(245, 158, 11,  1)',
    red:    'rgba(239, 68,  68,  1)',
    cyan:   'rgba(6,   182, 212, 1)',
    grid:   'rgba(255, 255, 255, 0.06)',
    text:   'rgba(156, 163, 175, 1)',
};

function defaultOptions(extra = {}) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: palette.text, font: { size: 12 } },
            },
            tooltip: {
                backgroundColor: '#1f2937',
                titleColor: '#f9fafb',
                bodyColor:  '#d1d5db',
                borderColor: '#374151',
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                ticks:  { color: palette.text },
                grid:   { color: palette.grid },
            },
            y: {
                ticks:  { color: palette.text },
                grid:   { color: palette.grid },
                beginAtZero: true,
            },
        },
        ...extra,
    };
}

/* ── Shipment volume bar chart ──────────────────────────────── */
const shipmentCtx = document.getElementById('shipmentVolumeChart');
if (shipmentCtx) {
    const labels = JSON.parse(shipmentCtx.dataset.labels || '[]');
    const sea    = JSON.parse(shipmentCtx.dataset.sea    || '[]');
    const air    = JSON.parse(shipmentCtx.dataset.air    || '[]');
    const road   = JSON.parse(shipmentCtx.dataset.road   || '[]');

    new Chart(shipmentCtx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Sea',  data: sea,  backgroundColor: palette.blue,  borderRadius: 4 },
                { label: 'Air',  data: air,  backgroundColor: palette.cyan,  borderRadius: 4 },
                { label: 'Road', data: road, backgroundColor: palette.green, borderRadius: 4 },
            ],
        },
        options: defaultOptions(),
    });
}

/* ── Revenue trend line chart ───────────────────────────────── */
const revenueCtx = document.getElementById('revenueTrendChart');
if (revenueCtx) {
    const labels  = JSON.parse(revenueCtx.dataset.labels   || '[]');
    const revenue = JSON.parse(revenueCtx.dataset.revenue  || '[]');
    const costs   = JSON.parse(revenueCtx.dataset.costs    || '[]');

    new Chart(revenueCtx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Revenue (GHS)',
                    data: revenue,
                    borderColor: palette.green,
                    backgroundColor: 'rgba(34,197,94,0.1)',
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'Costs (GHS)',
                    data: costs,
                    borderColor: palette.red,
                    backgroundColor: 'rgba(239,68,68,0.1)',
                    fill: true,
                    tension: 0.4,
                },
            ],
        },
        options: defaultOptions(),
    });
}

/* ── Clearance status doughnut ──────────────────────────────── */
const clearanceCtx = document.getElementById('clearanceStatusChart');
if (clearanceCtx) {
    const data   = JSON.parse(clearanceCtx.dataset.values || '[0,0,0,0]');
    const labels = ['At Port', 'In Transit', 'Customs', 'Delivered'];

    new Chart(clearanceCtx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: [palette.amber, palette.blue, palette.red, palette.green],
                borderWidth: 0,
                hoverOffset: 8,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: palette.text, padding: 16, usePointStyle: true },
                },
            },
        },
    });
}

/* ── Auto-refresh KPI cards every 60 s ─────────────────────── */
function refreshDashboardStats() {
    window.axios.get('/dashboard/stats')
        .then(res => {
            const stats = res.data;
            Object.entries(stats).forEach(([key, value]) => {
                const el = document.querySelector(`[data-stat="${key}"]`);
                if (el) el.textContent = value;
            });
        })
        .catch(() => {}); // silently ignore errors
}

setInterval(refreshDashboardStats, 60_000);
