import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllReportsApi } from "../api/reportApi";
import { getUsersApi } from "../api/userApi";
import { getProjectsApi } from "../api/projectApi";
import { Select, Input } from "../components/FormFields";
import StatusBadge from "../components/StatusBadge";
import Card from "../components/Card";
import Button from "../components/Button";
import { formatDate } from "../utils/date";

const PAGE_SIZE = 10;

const TeamReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);

  const [filters, setFilters] = useState({ user: "", project: "", status: "", weekStart: "", weekEnd: "" });

  useEffect(() => {
    getUsersApi().then((res) => setMembers(res.data.filter((u) => u.role === "member")));
    getProjectsApi().then((res) => setProjects(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: PAGE_SIZE };
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    getAllReportsApi(params)
      .then((res) => {
        setReports(res.data.reports);
        setTotal(res.data.total);
      })
      .finally(() => setLoading(false));
  }, [filters, page]);

  const updateFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-slate-900">All Reports</h1>
      <p className="mb-6 text-sm text-slate-500">Browse and review reports across the whole team</p>

      <Card className="mb-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Select label="Team member" value={filters.user} onChange={(e) => updateFilter("user", e.target.value)}>
            <option value="">All members</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </Select>
          <Select label="Project" value={filters.project} onChange={(e) => updateFilter("project", e.target.value)}>
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </Select>
          <Select label="Status" value={filters.status} onChange={(e) => updateFilter("status", e.target.value)}>
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="needs_correction">Needs Correction</option>
            <option value="approved">Approved</option>
          </Select>
          <Input label="From week" type="date" value={filters.weekStart} onChange={(e) => updateFilter("weekStart", e.target.value)} />
          <Input label="To week" type="date" value={filters.weekEnd} onChange={(e) => updateFilter("weekEnd", e.target.value)} />
        </div>
      </Card>

      <Card className="p-0">
        {loading ? (
          <p className="p-6 text-sm text-slate-400">Loading...</p>
        ) : reports.length === 0 ? (
          <p className="p-6 text-sm text-slate-400">No reports match these filters.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Week</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">{r.user?.name}</td>
                  <td className="px-4 py-3">{formatDate(r.weekStartDate)}</td>
                  <td className="px-4 py-3">{r.project?.name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/reports/${r._id}`} className="text-brand-700 hover:underline">
                      {r.status === "submitted" ? "Review" : "View"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages} ({total} reports)
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamReportsPage;
