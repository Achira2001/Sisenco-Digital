import { useEffect, useState } from "react";
import { getProjectsApi, createProjectApi, updateProjectApi, deleteProjectApi } from "../api/projectApi";
import Card from "../components/Card";
import Button from "../components/Button";
import { Input, TextArea } from "../components/FormFields";

const emptyForm = { name: "", description: "" };

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchProjects = () => {
    setLoading(true);
    getProjectsApi({ includeInactive: true })
      .then((res) => setProjects(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(fetchProjects, []);

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const startEdit = (project) => {
    setEditingId(project._id);
    setForm({ name: project.name, description: project.description });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await updateProjectApi(editingId, form);
      } else {
        await createProjectApi(form);
      }
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save project");
    }
  };

  const handleArchive = async (project) => {
    if (!window.confirm(`Archive "${project.name}"? It will be hidden from new reports.`)) return;
    await deleteProjectApi(project._id);
    fetchProjects();
  };

  const handleRestore = async (project) => {
    await updateProjectApi(project._id, { isActive: true });
    fetchProjects();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-slate-900">Projects & Categories</h1>
          <p className="text-sm text-slate-500">Manage the projects team members can tag reports with</p>
        </div>
        <Button onClick={startCreate}>+ Add Project</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Project name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <TextArea
              label="Description"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingId ? "Save Changes" : "Create Project"}</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-0">
        {loading ? (
          <p className="p-6 text-sm text-slate-400">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                  <td className="px-4 py-3 text-slate-500">{p.description || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${p.isActive ? "text-green-600" : "text-slate-400"}`}>
                      {p.isActive ? "Active" : "Archived"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => startEdit(p)} className="mr-3 text-brand-700 hover:underline">
                      Edit
                    </button>
                    {p.isActive ? (
                      <button onClick={() => handleArchive(p)} className="text-red-500 hover:underline">
                        Archive
                      </button>
                    ) : (
                      <button onClick={() => handleRestore(p)} className="text-green-600 hover:underline">
                        Restore
                      </button>
                    )}
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

export default ProjectsPage;
