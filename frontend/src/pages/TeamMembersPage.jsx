import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUsersApi, createUserApi, updateUserRoleApi, setUserActiveStatusApi } from "../api/userApi";
import Card from "../components/Card";
import Button from "../components/Button";
import { Input, Select } from "../components/FormFields";

const emptyForm = { name: "", email: "", password: "", role: "member" };

const TeamMembersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const fetchUsers = () => {
    setLoading(true);
    getUsersApi({ includeInactive: true })
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(fetchUsers, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createUserApi(form);
      setForm(emptyForm);
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add team member");
    }
  };

  const handleRoleChange = async (id, role) => {
    await updateUserRoleApi(id, role);
    fetchUsers();
  };

  const handleToggleActive = async (u) => {
    await setUserActiveStatusApi(u._id, !u.isActive);
    fetchUsers();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-slate-900">Team Members</h1>
          <p className="text-sm text-slate-500">Manage accounts and roles</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>+ Add Team Member</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleAddUser} className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:items-end">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input
              label="Temporary password"
              type="text"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
              placeholder="Share with them directly"
            />
            <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="member">Team Member</option>
              <option value="manager">Manager</option>
            </Select>
            <div className="sm:col-span-4 flex justify-end gap-3">
              {error && <p className="mr-auto self-center text-sm text-red-600">{error}</p>}
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Member</Button>
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
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    {u.role === "member" ? (
                      <Link to={`/team/${u._id}`} className="font-medium text-brand-700 hover:underline">
                        {u.name}
                      </Link>
                    ) : (
                      <span className="font-medium text-slate-800">{u.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <Select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)} className="w-32">
                      <option value="member">Member</option>
                      <option value="manager">Manager</option>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${u.isActive ? "text-green-600" : "text-slate-400"}`}>
                      {u.isActive ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u._id !== currentUser._id && (
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={u.isActive ? "text-red-500 hover:underline" : "text-green-600 hover:underline"}
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
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

export default TeamMembersPage;
