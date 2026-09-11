import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  getSummaryApi, getTasksTrendApi, getStatusByMemberApi,
  getWorkloadByProjectApi, getTimeByTaskTypeApi, getActivityFeedApi,
} from "../api/dashboardApi";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import { Input } from "../components/FormFields";
import { getMondayISO, formatDate } from "../utils/date";

const COLORS = ["#2F5D5C", "#4A8F8C", "#D97706", "#2563EB", "#16A34A"];

const MetricCard = ({ label, value, accent }) => (
  <Card>
    <p className="text-sm text-slate-500">{label}</p>
    <p className={`mt-1 font-heading text-3xl font-semibold ${accent || "text-slate-900"}`}>{value}</p>
  </Card>
);

const TeamDashboardPage = () => {
  const [weekStart, setWeekStart] = useState(getMondayISO());
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [statusByMember, setStatusByMember] = useState([]);
  const [workload, setWorkload] = useState([]);
  const [timeByType, setTimeByType] = useState(null);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    getSummaryApi({ weekStart }).then((res) => setSummary(res.data));
    getStatusByMemberApi({ weekStart }).then((res) => setStatusByMember(res.data));
  }, [weekStart]);

  useEffect(() => {
    getTasksTrendApi({ weeks: 8 }).then((res) => setTrend(res.data));
    getWorkloadByProjectApi({}).then((res) => setWorkload(res.data));
    getTimeByTaskTypeApi().then((res) => setTimeByType(res.data));
    getActivityFeedApi({ limit: 8 }).then((res) => setActivity(res.data));
  }, []);

  // Turn { development: 20, testing: 5, ... } into an array for the pie chart
  const timeByTypeData = timeByType
    ? Object.entries(timeByType).map(([key, value]) => ({ name: key, value }))
    : [];

  // Count how many members are in each status bucket, for the bar chart
  const statusCounts = ["not_started", "draft", "submitted", "needs_correction", "approved"].map((status) => ({
    status,
    count: statusByMember.filter((m) => m.status === status).length,
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-slate-900">Team Dashboard</h1>
          <p className="text-sm text-slate-500">Overview for the selected week</p>
        </div>
        <Input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Submitted this week" value={summary?.totalSubmittedThisWeek ?? "—"} />
        <MetricCard
          label="Compliance rate"
          value={summary ? `${summary.complianceRatePercent}%` : "—"}
          accent="text-brand-700"
        />
        <MetricCard
          label="Needs correction"
          value={summary?.needsCorrectionCount ?? "—"}
          accent="text-amber-600"
        />
        <MetricCard label="Open blockers" value={summary?.openBlockers ?? "—"} accent="text-red-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tasks completed trend */}
        <Card>
          <h3 className="font-heading text-base font-semibold text-slate-800">Tasks Completed Trend</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="weekStart" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="completedTasks" stroke="#2F5D5C" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Status by member */}
        <Card>
          <h3 className="font-heading text-base font-semibold text-slate-800">
            Submission Status by Team Member
          </h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusCounts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="status" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#4A8F8C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Workload by project */}
        <Card>
          <h3 className="font-heading text-base font-semibold text-slate-800">Workload by Project</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workload} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="project" tick={{ fontSize: 11 }} width={90} />
                <Tooltip />
                <Bar dataKey="taskCount" fill="#2F5D5C" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Time by task type */}
        <Card>
          <h3 className="font-heading text-base font-semibold text-slate-800">Time Spent by Task Type</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={timeByTypeData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {timeByTypeData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent activity feed */}
      <Card className="mt-6">
        <h3 className="font-heading text-base font-semibold text-slate-800">Recent Activity</h3>
        <div className="mt-3 flex flex-col divide-y divide-slate-100">
          {activity.length === 0 && <p className="py-3 text-sm text-slate-400">No recent activity.</p>}
          {activity.map((a) => (
            <div key={a.reportId} className="flex items-center justify-between py-2.5 text-sm">
              <div>
                <span className="font-medium text-slate-700">{a.userName}</span>{" "}
                <span className="text-slate-500">· {a.projectName} · week of {formatDate(a.weekStartDate)}</span>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default TeamDashboardPage;
