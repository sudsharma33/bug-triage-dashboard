import { useMemo } from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

Chart.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
);

const SEV_ORDER = ['Critical', 'High', 'Medium', 'Low'];
const SEV_COLORS = {
  Critical: '#b91c1c',
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#10b981',
};
const STATUS_ORDER = ['Open', 'In Progress', 'Fixed', 'Closed', 'Reopened'];
const STATUS_COLORS = {
  Open: '#ef4444',
  'In Progress': '#3b82f6',
  Fixed: '#8b5cf6',
  Closed: '#10b981',
  Reopened: '#f59e0b',
};
const PRIORITY_ORDER = ['P1', 'P2', 'P3', 'P4'];
const PRIORITY_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6'];

function countBy(arr, key, order) {
  const map = {};
  order.forEach(k => { map[k] = 0; });
  arr.forEach(item => {
    const v = item[key];
    if (v != null) map[v] = (map[v] || 0) + 1;
  });
  return map;
}

function Dashboard({ bugs, onNewBug }) {
  const stats = useMemo(() => {
    const total = bugs.length;
    const open = bugs.filter(b => b.status === 'Open' || b.status === 'Reopened').length;
    const critical = bugs.filter(
      b => (b.severity === 'Critical' || b.severity === 'High') && b.status !== 'Closed'
    ).length;
    const closed = bugs.filter(b => b.status === 'Closed').length;
    return { total, open, critical, closed };
  }, [bugs]);

  const sevCounts = useMemo(() => countBy(bugs, 'severity', SEV_ORDER), [bugs]);
  const statusCounts = useMemo(() => countBy(bugs, 'status', STATUS_ORDER), [bugs]);
  const priorityCounts = useMemo(() => countBy(bugs, 'priority', PRIORITY_ORDER), [bugs]);

  const moduleCounts = useMemo(() => {
    const map = {};
    bugs.forEach(b => {
      if (b.module) map[b.module] = (map[b.module] || 0) + 1;
    });
    return map;
  }, [bugs]);

  const trend = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push(d);
    }
    const counts = days.map(d => {
      const next = d.getTime() + 24 * 3600 * 1000;
      return bugs.filter(b => {
        const t = new Date(b.createdAt).getTime();
        return t >= d.getTime() && t < next;
      }).length;
    });
    return {
      labels: days.map(d => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
      counts,
    };
  }, [bugs]);

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>An overview of all logged bugs.</p>
        </div>
        <button className="btn btn-primary" onClick={onNewBug}>+ New Bug</button>
      </div>

      <div className="stat-grid">
        <div className="stat-card accent-blue">
          <div className="label">Total Bugs</div>
          <div className="value">{stats.total}</div>
        </div>
        <div className="stat-card accent-red">
          <div className="label">Open</div>
          <div className="value">{stats.open}</div>
        </div>
        <div className="stat-card accent-amber">
          <div className="label">Critical / High</div>
          <div className="value">{stats.critical}</div>
        </div>
        <div className="stat-card accent-green">
          <div className="label">Closed</div>
          <div className="value">{stats.closed}</div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Bugs by Severity</h3>
          <div className="chart-wrap">
            <Doughnut
              data={{
                labels: Object.keys(sevCounts),
                datasets: [{
                  data: Object.values(sevCounts),
                  backgroundColor: Object.keys(sevCounts).map(k => SEV_COLORS[k]),
                }],
              }}
              options={{ ...baseOptions, plugins: { legend: { position: 'bottom' } } }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Bugs by Status</h3>
          <div className="chart-wrap">
            <Bar
              data={{
                labels: Object.keys(statusCounts),
                datasets: [{
                  data: Object.values(statusCounts),
                  backgroundColor: Object.keys(statusCounts).map(k => STATUS_COLORS[k]),
                  borderRadius: 6,
                }],
              }}
              options={{
                ...baseOptions,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Bugs by Priority</h3>
          <div className="chart-wrap">
            <Bar
              data={{
                labels: Object.keys(priorityCounts),
                datasets: [{
                  data: Object.values(priorityCounts),
                  backgroundColor: Object.keys(priorityCounts).map(
                    (_, i) => PRIORITY_COLORS[i % PRIORITY_COLORS.length]
                  ),
                  borderRadius: 6,
                }],
              }}
              options={{
                ...baseOptions,
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Bugs by Module</h3>
          <div className="chart-wrap">
            <Bar
              data={{
                labels: Object.keys(moduleCounts),
                datasets: [{
                  data: Object.values(moduleCounts),
                  backgroundColor: '#6366f1',
                  borderRadius: 6,
                }],
              }}
              options={{
                ...baseOptions,
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
              }}
            />
          </div>
        </div>

        <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
          <h3>Bugs Logged — Last 7 Days</h3>
          <div className="chart-wrap">
            <Line
              data={{
                labels: trend.labels,
                datasets: [{
                  label: 'New Bugs',
                  data: trend.counts,
                  borderColor: '#6366f1',
                  backgroundColor: 'rgba(99,102,241,.15)',
                  fill: true,
                  tension: 0.35,
                  pointBackgroundColor: '#6366f1',
                }],
              }}
              options={{
                ...baseOptions,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
