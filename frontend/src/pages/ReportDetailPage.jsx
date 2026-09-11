import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getReportByIdApi, updateReportApi, submitReportApi, reviewReportApi } from "../api/reportApi";
import ReportContentForm from "../components/ReportContentForm";
import StatusBadge from "../components/StatusBadge";
import Card from "../components/Card";
import Button from "../components/Button";
import { TextArea } from "../components/FormFields";
import { formatDate } from "../utils/date";

const EDITABLE_STATUSES = ["draft", "needs_correction"];

const ReportDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [selectedVersion, setSelectedVersion] = useState(null); // null = current live content
  const [reviewComment, setReviewComment] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const fetchReport = () => {
    setLoading(true);
    getReportByIdApi(id)
      .then((res) => {
        setReport(res.data);
        setContent({
          tasksCompleted: res.data.tasksCompleted,
          tasksPlannedNextWeek: res.data.tasksPlannedNextWeek,
          blockers: res.data.blockers,
          achievements: res.data.achievements,
          hoursByType: res.data.hoursByType,
          notes: res.data.notes,
        });
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load report"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  if (loading) return <p className="text-sm text-slate-400">Loading...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!report) return null;

  const isOwner = report.user._id === user._id;
  const isManager = user.role === "manager";
  const isEditable = isOwner && EDITABLE_STATUSES.includes(report.status);
  const canReview = isManager && report.status === "submitted";

  const handleSaveDraft = async () => {
    setSaving(true);
    setError("");
    try {
      await updateReportApi(id, content);
      fetchReport();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      await updateReportApi(id, content); // save latest edits first
      await submitReportApi(id);
      navigate("/my-reports");
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit report");
    } finally {
      setSaving(false);
    }
  };

  const handleReview = async (action) => {
    if (action === "request_changes" && !reviewComment.trim()) {
      setError("Please enter a comment explaining what needs to change");
      return;
    }
    setReviewing(true);
    setError("");
    try {
      await reviewReportApi(id, { action, comment: reviewComment });
      setReviewComment("");
      fetchReport();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit review");
    } finally {
      setReviewing(false);
    }
  };

  // Shows either the current content or a selected past version.
  const displayedContent = selectedVersion !== null ? report.versions[selectedVersion] : content;

  return (
    <div className="mx-auto max-w-4xl">
      <Link to={isManager ? "/team-reports" : "/my-reports"} className="text-sm text-brand-700 hover:underline">
        ← Back
      </Link>

      <div className="mt-3 mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-slate-900">
            {formatDate(report.weekStartDate)} – {formatDate(report.weekEndDate)}
          </h1>
          <p className="text-sm text-slate-500">
            {report.project?.name} · {report.user?.name}
          </p>
        </div>
        <StatusBadge status={report.status} />
      </div>

      {report.status === "needs_correction" && report.latestReviewComment && (
        <Card className="mb-6 border-amber-300 bg-amber-50">
          <p className="text-sm font-medium text-amber-800">Manager requested changes:</p>
          <p className="mt-1 text-sm text-amber-700">{report.latestReviewComment}</p>
        </Card>
      )}

      {selectedVersion !== null && (
        <div className="mb-4 flex items-center justify-between rounded-md bg-slate-100 px-4 py-2 text-sm text-slate-600">
          <span>Viewing version {report.versions[selectedVersion].versionNumber} (read-only)</span>
          <button onClick={() => setSelectedVersion(null)} className="text-brand-700 hover:underline">
            Back to current
          </button>
        </div>
      )}

      <Card>
        <ReportContentForm
          value={displayedContent}
          onChange={setContent}
          readOnly={!isEditable || selectedVersion !== null}
        />
      </Card>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {isEditable && selectedVersion === null && (
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" disabled={saving} onClick={handleSaveDraft}>
            Save Changes
          </Button>
          <Button disabled={saving} onClick={handleSubmit}>
            {report.status === "needs_correction" ? "Resubmit for Review" : "Submit for Review"}
          </Button>
        </div>
      )}

      {canReview && (
        <Card className="mt-6">
          <h3 className="font-heading text-base font-semibold text-slate-800">Review this report</h3>
          <TextArea
            className="mt-3"
            rows={3}
            placeholder="Comment (required if requesting changes)"
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
          />
          <div className="mt-3 flex justify-end gap-3">
            <Button variant="danger" disabled={reviewing} onClick={() => handleReview("request_changes")}>
              Request Changes
            </Button>
            <Button disabled={reviewing} onClick={() => handleReview("approve")}>
              Approve
            </Button>
          </div>
        </Card>
      )}

      {/* Version history */}
      {report.versions?.length > 0 && (
        <Card className="mt-6">
          <h3 className="font-heading text-base font-semibold text-slate-800">Version History</h3>
          <div className="mt-3 flex flex-col gap-2">
            {report.versions.map((v, i) => (
              <div
                key={v.versionNumber}
                className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-medium text-slate-700">Version {v.versionNumber}</span>{" "}
                  <span className="text-slate-400">· submitted {formatDate(v.submittedAt)}</span>
                  {v.reviewAction === "changes_requested" && (
                    <span className="ml-2 text-amber-600">— changes requested: "{v.reviewComment}"</span>
                  )}
                  {v.reviewAction === "approved" && <span className="ml-2 text-green-600">— approved</span>}
                  {v.reviewAction === "pending" && <span className="ml-2 text-blue-600">— pending review</span>}
                </div>
                <button onClick={() => setSelectedVersion(i)} className="text-brand-700 hover:underline">
                  View
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReportDetailPage;
