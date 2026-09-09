const STATUS_CONFIG = {
  draft: { label: "Draft", classes: "bg-slate-100 text-slate-600" },
  submitted: { label: "Submitted", classes: "bg-blue-100 text-blue-700" },
  needs_correction: { label: "Needs Correction", classes: "bg-amber-100 text-amber-700" },
  approved: { label: "Approved", classes: "bg-green-100 text-green-700" },
  not_started: { label: "Not Started", classes: "bg-slate-50 text-slate-400" },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
