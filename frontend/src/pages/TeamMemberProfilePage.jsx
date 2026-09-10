import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAllReportsApi } from "../api/reportApi";
import { getUsersApi } from "../api/userApi";
import StatusBadge from "../components/StatusBadge";
import Card from "../components/Card";
import { formatDate } from "../utils/date";

const TeamMemberProfilePage = () => {
  const { userId } = useParams();
  const [member, setMember] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getUsersApi({ includeInactive: true }),
      getAllReportsApi({ user: userId, limit: 50 }),
    ])
      .then(([usersRes, reportsRes]) => {
        setMember(usersRes.data.find((u) => u._id === userId));
        setReports(reportsRes.data.reports);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <p className="text-sm text-slate-400">Loading...</p>;

  const stats = {
    total: reports.length,
    approved: reports.filter((r) => r.status === "approved").length,
    needsCorrection: reports.filter((r) => r.status === "needs_correction").length,
    submitted: reports.filter((r) => r.status === "submitted").length,
  };

  return (
    <div>
      <Link to="/team" className="text-sm text-brand-700 hover:underline">
        ← Back to Team Members
      </Link>

      <div className="mt-3 mb-6">
        <h1 className="font-heading text-2xl font-semibold text-slate-900">{member?.name}</h1>
        <p className="text-sm text-slate-500">{member?.email}</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-slate-500">Total reports</p>
          <p className="mt-1 font-heading text-2xl font-semibold text-slate-900">{stats.total}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Approved</p>
          <p className="mt-1 font-heading text-2xl font-semibold text-green-600">{stats.approved}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Needs correction</p>
          <p className="mt-1 font-heading text-2xl font-semibold text-amber-600">{stats.needsCorrection}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Awaiting review</p>
          <p className="mt-1 font-heading text-2xl font-semibold text-blue-600">{stats.submitted}</p>
        </Card>
      </div>

      <Card className="p-0">
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
                <td className="px-4 py-3">{formatDate(r.weekStartDate)}</td>
                <td className="px-4 py-3">{r.project?.name}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/reports/${r._id}`} className="text-brand-700 hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  No reports yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default TeamMemberProfilePage;
