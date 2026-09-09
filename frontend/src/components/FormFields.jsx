export const Input = ({ label, error, className = "", ...props }) => (
  <label className="block">
    {label && <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>}
    <input
      className={`w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors
        focus:border-brand-600 focus:ring-1 focus:ring-brand-600
        ${error ? "border-red-400" : "border-slate-300"} ${className}`}
      {...props}
    />
    {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
  </label>
);

export const TextArea = ({ label, error, className = "", ...props }) => (
  <label className="block">
    {label && <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>}
    <textarea
      className={`w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors
        focus:border-brand-600 focus:ring-1 focus:ring-brand-600
        ${error ? "border-red-400" : "border-slate-300"} ${className}`}
      {...props}
    />
    {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
  </label>
);

export const Select = ({ label, error, className = "", children, ...props }) => (
  <label className="block">
    {label && <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>}
    <select
      className={`w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors
        focus:border-brand-600 focus:ring-1 focus:ring-brand-600
        ${error ? "border-red-400" : "border-slate-300"} ${className}`}
      {...props}
    >
      {children}
    </select>
    {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
  </label>
);
