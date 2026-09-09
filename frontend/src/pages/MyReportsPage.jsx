import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyReportsApi } from "../api/reportApi";
import StatusBadge from "../components/StatusBadge";
import Card from "../components/Card";
import Button from "../components/Button";
import { formatDate } from "../utils/date";

const MyReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyReportsApi({ limit: 50 })
      .then((res) => setReports(res.data.reports))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-slate-900">My Reports</h1>
          <p className="text-sm text-slate-500">Your weekly report history</p>
        </div>
        <Link to="/my-reports/new">
          <Button>+ New Report</Button>
        </Link>
      </div>

      <Card className="p-0">
        {loading ? (
          <p className="p-6 text-sm text-slate-400">Loading...</p>
        ) : reports.length === 0 ? (
          <p className="p-6 text-sm text-slate-400">
            No reports yet. Click "New Report" to create your first one.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Week</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    {formatDate(r.weekStartDate)} – {formatDate(r.weekEndDate)}
                  </td>
                  <td className="px-4 py-3">{r.project?.name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/reports/${r._id}`} className="text-brand-700 hover:underline">
                      {["draft", "needs_correction"].includes(r.status) ? "Edit" : "View"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

export default MyReportsPage;
