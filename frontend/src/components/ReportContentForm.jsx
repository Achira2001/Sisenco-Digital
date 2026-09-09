import { Input, Select, TextArea } from "./FormFields";
import Button from "./Button";

const emptyTask = () => ({
  taskName: "",
  priority: "medium",
  plannedPercent: 0,
  actualPercent: 0,
  status: "not_started",
  timePlannedHours: 0,
  timeSpentHours: 0,
  deliverable: "",
});

const ReportContentForm = ({ value, onChange, readOnly = false }) => {
  const update = (patch) => onChange({ ...value, ...patch });

  // Update a completed task
  const updateTask = (index, patch) => {
    const tasks = [...value.tasksCompleted];
    tasks[index] = { ...tasks[index], ...patch };
    update({ tasksCompleted: tasks });
  };
  // Add a new completed task
  const addTask = () => update({ tasksCompleted: [...value.tasksCompleted, emptyTask()] });
  // Remove a completed task
  const removeTask = (index) =>
    update({ tasksCompleted: value.tasksCompleted.filter((_, i) => i !== index) });

  // Update a planned task
  const updatePlanned = (index, text) => {
    const list = [...value.tasksPlannedNextWeek];
    list[index] = text;
    update({ tasksPlannedNextWeek: list });
  };
  // Add a new planned task
  const addPlanned = () => update({ tasksPlannedNextWeek: [...value.tasksPlannedNextWeek, ""] });
  // Remove a planned task
  const removePlanned = (index) =>
    update({ tasksPlannedNextWeek: value.tasksPlannedNextWeek.filter((_, i) => i !== index) });

  // Update a blocker
  const updateBlocker = (index, patch) => {
    const list = [...value.blockers];
    list[index] = { ...list[index], ...patch };
    update({ blockers: list });
  };
  // Add a new blocker
  const addBlocker = () => update({ blockers: [...value.blockers, { description: "", isKeyIssue: false }] });
  // Remove a blocker
  const removeBlocker = (index) => update({ blockers: value.blockers.filter((_, i) => i !== index) });
  // Mark one blocker as the key issue
  const setKeyIssue = (index) =>
    update({ blockers: value.blockers.map((b, i) => ({ ...b, isKeyIssue: i === index })) });

  // Update an achievement
  const updateAchievement = (index, patch) => {
    const list = [...value.achievements];
    list[index] = { ...list[index], ...patch };
    update({ achievements: list });
  };
  // Add a new achievement
  const addAchievement = () =>
    update({ achievements: [...value.achievements, { description: "", isKeyAchievement: false }] });
  // Remove an achievement
  const removeAchievement = (index) =>
    update({ achievements: value.achievements.filter((_, i) => i !== index) });
  // Mark one achievement as the key achievement
  const setKeyAchievement = (index) =>
    update({ achievements: value.achievements.map((a, i) => ({ ...a, isKeyAchievement: i === index })) });

  const sectionTitle = "font-heading text-base font-semibold text-slate-800";

  return (
    <div className="flex flex-col gap-8">
      {/* Tasks completed */}
      <section>
        <h3 className={sectionTitle}>Tasks Completed</h3>
        <div className="mt-3 overflow-x-auto rounded-md border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Task</th>
                <th className="px-3 py-2">Priority</th>
                <th className="px-3 py-2">Planned %</th>
                <th className="px-3 py-2">Actual %</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Hrs planned</th>
                <th className="px-3 py-2">Hrs spent</th>
                <th className="px-3 py-2">Deliverable</th>
                {!readOnly && <th className="px-3 py-2"></th>}
              </tr>
            </thead>
            <tbody>
              {value.tasksCompleted.map((task, i) => (
                <tr key={i} className="border-t border-slate-100">
                  {readOnly ? (
                    <>
                      <td className="px-3 py-2">{task.taskName}</td>
                      <td className="px-3 py-2 capitalize">{task.priority}</td>
                      <td className="px-3 py-2">{task.plannedPercent}%</td>
                      <td className="px-3 py-2">{task.actualPercent}%</td>
                      <td className="px-3 py-2 capitalize">{task.status.replace("_", " ")}</td>
                      <td className="px-3 py-2">{task.timePlannedHours}</td>
                      <td className="px-3 py-2">{task.timeSpentHours}</td>
                      <td className="px-3 py-2">{task.deliverable}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-2 py-1.5 min-w-[160px]">
                        <Input value={task.taskName} onChange={(e) => updateTask(i, { taskName: e.target.value })} placeholder="Task name" />
                      </td>
                      <td className="px-2 py-1.5">
                        <Select value={task.priority} onChange={(e) => updateTask(i, { priority: e.target.value })}>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </Select>
                      </td>
                      <td className="px-2 py-1.5 w-20">
                        <Input type="number" min="0" max="100" value={task.plannedPercent} onChange={(e) => updateTask(i, { plannedPercent: Number(e.target.value) })} />
                      </td>
                      <td className="px-2 py-1.5 w-20">
                        <Input type="number" min="0" max="100" value={task.actualPercent} onChange={(e) => updateTask(i, { actualPercent: Number(e.target.value) })} />
                      </td>
                      <td className="px-2 py-1.5">
                        <Select value={task.status} onChange={(e) => updateTask(i, { status: e.target.value })}>
                          <option value="not_started">Not started</option>
                          <option value="in_progress">In progress</option>
                          <option value="completed">Completed</option>
                          <option value="blocked">Blocked</option>
                        </Select>
                      </td>
                      <td className="px-2 py-1.5 w-20">
                        <Input type="number" min="0" value={task.timePlannedHours} onChange={(e) => updateTask(i, { timePlannedHours: Number(e.target.value) })} />
                      </td>
                      <td className="px-2 py-1.5 w-20">
                        <Input type="number" min="0" value={task.timeSpentHours} onChange={(e) => updateTask(i, { timeSpentHours: Number(e.target.value) })} />
                      </td>
                      <td className="px-2 py-1.5 min-w-[140px]">
                        <Input value={task.deliverable} onChange={(e) => updateTask(i, { deliverable: e.target.value })} placeholder="Output/link" />
                      </td>
                      <td className="px-2 py-1.5">
                        <button type="button" onClick={() => removeTask(i)} className="text-xs text-red-500 hover:underline">
                          Remove
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {value.tasksCompleted.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-4 text-center text-slate-400">
                    No tasks added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!readOnly && (
          <Button type="button" variant="secondary" onClick={addTask} className="mt-2">
            + Add task
          </Button>
        )}
      </section>

      {/* Tasks planned next week */}
      <section>
        <h3 className={sectionTitle}>Tasks Planned for Next Week</h3>
        <div className="mt-3 flex flex-col gap-2">
          {value.tasksPlannedNextWeek.map((item, i) =>
            readOnly ? (
              <p key={i} className="text-sm text-slate-700">
                • {item}
              </p>
            ) : (
              <div key={i} className="flex gap-2">
                <Input value={item} onChange={(e) => updatePlanned(i, e.target.value)} placeholder="Planned task" className="flex-1" />
                <button type="button" onClick={() => removePlanned(i)} className="text-xs text-red-500 hover:underline">
                  Remove
                </button>
              </div>
            )
          )}
          {readOnly && value.tasksPlannedNextWeek.length === 0 && (
            <p className="text-sm text-slate-400">Nothing planned yet.</p>
          )}
        </div>
        {!readOnly && (
          <Button type="button" variant="secondary" onClick={addPlanned} className="mt-2">
            + Add planned task
          </Button>
        )}
      </section>

      {/* Blockers */}
      <section>
        <h3 className={sectionTitle}>Blockers / Challenges</h3>
        <div className="mt-3 flex flex-col gap-2">
          {value.blockers.map((b, i) =>
            readOnly ? (
              <p key={i} className="text-sm text-slate-700">
                {b.isKeyIssue && <span className="mr-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">Key Issue</span>}
                {b.description}
              </p>
            ) : (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" name="keyIssue" checked={b.isKeyIssue} onChange={() => setKeyIssue(i)} title="Mark as key issue" />
                <Input value={b.description} onChange={(e) => updateBlocker(i, { description: e.target.value })} placeholder="Describe the blocker" className="flex-1" />
                <button type="button" onClick={() => removeBlocker(i)} className="text-xs text-red-500 hover:underline">
                  Remove
                </button>
              </div>
            )
          )}
          {readOnly && value.blockers.length === 0 && <p className="text-sm text-slate-400">No blockers this week.</p>}
        </div>
        {!readOnly && (
          <Button type="button" variant="secondary" onClick={addBlocker} className="mt-2">
            + Add blocker
          </Button>
        )}
      </section>

      {/* Achievements */}
      <section>
        <h3 className={sectionTitle}>Achievements / Highlights</h3>
        <div className="mt-3 flex flex-col gap-2">
          {value.achievements.map((a, i) =>
            readOnly ? (
              <p key={i} className="text-sm text-slate-700">
                {a.isKeyAchievement && <span className="mr-1 rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">Key Achievement</span>}
                {a.description}
              </p>
            ) : (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" name="keyAchievement" checked={a.isKeyAchievement} onChange={() => setKeyAchievement(i)} title="Mark as key achievement" />
                <Input value={a.description} onChange={(e) => updateAchievement(i, { description: e.target.value })} placeholder="Describe the achievement" className="flex-1" />
                <button type="button" onClick={() => removeAchievement(i)} className="text-xs text-red-500 hover:underline">
                  Remove
                </button>
              </div>
            )
          )}
          {readOnly && value.achievements.length === 0 && <p className="text-sm text-slate-400">No achievements listed.</p>}
        </div>
        {!readOnly && (
          <Button type="button" variant="secondary" onClick={addAchievement} className="mt-2">
            + Add achievement
          </Button>
        )}
      </section>

      {/* Hours by task type */}
      <section>
        <h3 className={sectionTitle}>
          Hours Worked by Type <span className="font-normal text-slate-400">(optional)</span>
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {["development", "testing", "meetings", "documentation", "other"].map((key) =>
            readOnly ? (
              <div key={key}>
                <p className="text-xs capitalize text-slate-400">{key}</p>
                <p className="text-sm font-medium text-slate-800">{value.hoursByType?.[key] || 0} hrs</p>
              </div>
            ) : (
              <Input
                key={key}
                type="number"
                min="0"
                label={key[0].toUpperCase() + key.slice(1)}
                value={value.hoursByType?.[key] || 0}
                onChange={(e) => update({ hoursByType: { ...value.hoursByType, [key]: Number(e.target.value) } })}
              />
            )
          )}
        </div>
      </section>

      {/* Notes */}
      <section>
        <h3 className={sectionTitle}>
          Notes / Links <span className="font-normal text-slate-400">(optional)</span>
        </h3>
        {readOnly ? (
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{value.notes || "—"}</p>
        ) : (
          <TextArea rows={3} value={value.notes} onChange={(e) => update({ notes: e.target.value })} placeholder="Any extra context or links" className="mt-2" />
        )}
      </section>
    </div>
  );
};

export const emptyReportContent = () => ({
  tasksCompleted: [],
  tasksPlannedNextWeek: [],
  blockers: [],
  achievements: [],
  hoursByType: { development: 0, testing: 0, meetings: 0, documentation: 0, other: 0 },
  notes: "",
});

export default ReportContentForm;
