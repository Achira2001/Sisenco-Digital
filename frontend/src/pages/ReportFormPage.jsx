import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjectsApi } from "../api/projectApi";
import { createReportApi, submitReportApi } from "../api/reportApi";
import ReportContentForm, { emptyReportContent } from "../components/ReportContentForm";
import { Input, Select } from "../components/FormFields";
import Button from "../components/Button";
import Card from "../components/Card";
import { getMondayISO, addDaysISO } from "../utils/date";

const ReportFormPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [weekStartDate, setWeekStartDate] = useState(getMondayISO());
  const [project, setProject] = useState("");
  const [content, setContent] = useState(emptyReportContent());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProjectsApi()
      .then((res) => {
        setProjects(res.data);
        if (res.data.length > 0) setProject(res.data[0]._id);
      })
      .catch(() => setError("Could not load projects"));
  }, []);

  const weekEndDate = addDaysISO(weekStartDate, 6);

  const handleSave = async (alsoSubmit) => {
    setError("");
    if (!project) {
      setError("Please select a project");
      return;
    }
    setSaving(true);
    try {
      const res = await createReportApi({
        project,
        weekStartDate,
        weekEndDate,
        ...content,
      });
      if (alsoSubmit) {
        await submitReportApi(res.data._id);
      }
      navigate("/my-reports");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save report");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-slate-900">New Weekly Report</h1>
        <p className="text-sm text-slate-500">
          Week of {weekStartDate} to {weekEndDate}
        </p>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Week start date"
            type="date"
            value={weekStartDate}
            onChange={(e) => setWeekStartDate(e.target.value)}
          />
          <Select label="Project / Category" value={project} onChange={(e) => setProject(e.target.value)}>
            {projects.length === 0 && <option value="">No projects available</option>}
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card>
        <ReportContentForm value={content} onChange={setContent} />
      </Card>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" disabled={saving} onClick={() => handleSave(false)}>
          Save Draft
        </Button>
        <Button disabled={saving} onClick={() => handleSave(true)}>
          Save & Submit
        </Button>
      </div>
    </div>
  );
};

export default ReportFormPage;
