/**
 * Finance Module – Chart.js initialisation for P&L, Revenue, and Expenses
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

const text = 'rgba(156,163,175,1)';
const grid = 'rgba(255,255,255,0.06)';

function baseScale() {
    return {
        x: { ticks: { color: text }, grid: { color: grid } },
        y: { ticks: { color: text }, grid: { color: grid }, beginAtZero: true },
    };
}

/* ── P&L Bar Chart ──────────────────────────────────────────── */
const plCtx = document.getElementById('plChart');
if (plCtx) {
    const labels  = JSON.parse(plCtx.dataset.labels   || '[]');
    const revenue = JSON.parse(plCtx.dataset.revenue  || '[]');
    const cogs    = JSON.parse(plCtx.dataset.cogs     || '[]');
    const opex    = JSON.parse(plCtx.dataset.opex     || '[]');
    const profit  = JSON.parse(plCtx.dataset.profit   || '[]');

    new Chart(plCtx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Revenue',      data: revenue, backgroundColor: 'rgba(34,197,94,0.8)',  borderRadius: 4 },
                { label: 'COGS',         data: cogs,    backgroundColor: 'rgba(239,68,68,0.7)',  borderRadius: 4 },
                { label: 'OpEx',         data: opex,    backgroundColor: 'rgba(245,158,11,0.7)', borderRadius: 4 },
                {
                    label: 'Net Profit',
                    data: profit,
                    type: 'line',
                    borderColor: 'rgba(59,130,246,1)',
                    backgroundColor: 'rgba(59,130,246,0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y',
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { labels: { color: text, font: { size: 12 } } },
                tooltip: {
                    backgroundColor: '#1f2937',
                    titleColor: '#f9fafb',
                    bodyColor:  '#d1d5db',
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: GHS ${Number(ctx.raw).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`,
                    },
                },
            },
            scales: baseScale(),
        },
    });
}

/* ── Expense Breakdown Doughnut ─────────────────────────────── */
const expCtx = document.getElementById('expenseCategoryChart');
if (expCtx) {
    const labels = JSON.parse(expCtx.dataset.labels || '[]');
    const values = JSON.parse(expCtx.dataset.values || '[]');

    new Chart(expCtx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    '#3b82f6','#10b981','#f59e0b','#ef4444',
                    '#8b5cf6','#06b6d4','#f97316','#14b8a6',
                ],
                borderWidth: 0,
                hoverOffset: 8,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: text, padding: 12, usePointStyle: true },
                },
            },
        },
    });
}

/* ── Receivables Aging Bar Chart ────────────────────────────── */
const agingCtx = document.getElementById('agingChart');
if (agingCtx) {
    const labels = ['Current', '1-30 Days', '31-60 Days', '61-90 Days', '90+ Days'];
    const values = JSON.parse(agingCtx.dataset.values || '[0,0,0,0,0]');

    new Chart(agingCtx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Outstanding (GHS)',
                data: values,
                backgroundColor: [
                    'rgba(34,197,94,0.8)',
                    'rgba(59,130,246,0.8)',
                    'rgba(245,158,11,0.8)',
                    'rgba(249,115,22,0.8)',
                    'rgba(239,68,68,0.8)',
                ],
                borderRadius: 6,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ` GHS ${Number(ctx.raw).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`,
                    },
                },
            },
            scales: baseScale(),
        },
    });
}

/* ── Invoice Status Doughnut ────────────────────────────────── */
const invCtx = document.getElementById('invoiceStatusChart');
if (invCtx) {
    const paid      = parseInt(invCtx.dataset.paid      || 0);
    const pending   = parseInt(invCtx.dataset.pending   || 0);
    const overdue   = parseInt(invCtx.dataset.overdue   || 0);
    const cancelled = parseInt(invCtx.dataset.cancelled || 0);

    new Chart(invCtx, {
        type: 'doughnut',
        data: {
            labels: ['Paid', 'Pending', 'Overdue', 'Cancelled'],
            datasets: [{
                data: [paid, pending, overdue, cancelled],
                backgroundColor: ['#10b981','#f59e0b','#ef4444','#6b7280'],
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
                    labels: { color: text, padding: 16, usePointStyle: true },
                },
            },
        },
    });
}

/* ── P&L Date Range Filter ──────────────────────────────────── */
const dateRangeForm = document.getElementById('plDateRangeForm');
if (dateRangeForm) {
    dateRangeForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const params = new URLSearchParams(new FormData(this));
        window.location.href = `/finance?tab=pl&${params.toString()}`;
    });
}
