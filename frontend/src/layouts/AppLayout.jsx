import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const memberLinks = [
  { to: "/my-reports", label: "My Reports" },
  { to: "/my-reports/new", label: "New Report" },
];

const managerLinks = [
  { to: "/team-dashboard", label: "Team Dashboard" },
  { to: "/team-reports", label: "All Reports" },
  { to: "/projects", label: "Projects" },
  { to: "/team", label: "Team Members" },
];

const linkClasses = ({ isActive }) =>
  `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-brand-800 text-white" : "text-brand-100/80 hover:bg-brand-800/60 hover:text-white"
  }`;

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === "manager" ? managerLinks : memberLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col bg-brand-900 px-4 py-6">
        <div className="mb-8 px-2">
          <h1 className="font-heading text-lg font-semibold text-white">Weekly Reports</h1>
          <p className="text-xs text-brand-100/60">Team Dashboard</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClasses}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-800">{user?.name}</p>
              <p className="text-xs capitalize text-slate-400">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              Log out
            </button>
          </div>
        </header>
        <main className="flex-1 px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
