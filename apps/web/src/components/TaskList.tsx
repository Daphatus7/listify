"use client";

import React, { useMemo, useState } from 'react';
import { useSchedule } from "../lib/store";

export default function TaskList() {
  const { state, dispatch } = useSchedule();
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const visibleTasks = useMemo(() => state.tasks.filter(t => t.status !== 'done'), [state.tasks]);

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    dispatch({ type: 'addTask', title: title.trim(), durationMinutes: Math.max(5, duration) });
    setTitle("");
    setDuration(30);
  };

  const onComplete = (id: string) => {
    setCompletingId(id);
    setTimeout(() => {
      dispatch({ type: 'completeTask', id });
      setCompletingId(null);
    }, 600);
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-lg font-semibold mb-3">Tasks</h2>
      <form onSubmit={onAdd} className="flex gap-2 mb-4">
        <input
          className="flex-1 border rounded px-2 py-1 bg-transparent"
          placeholder="New task title"
          value={title}
          onChange={e=>setTitle(e.target.value)}
        />
        <input
          type="number"
          className="w-24 border rounded px-2 py-1 bg-transparent"
          min={5}
          step={5}
          value={duration}
          onChange={e=>setDuration(parseInt(e.target.value||'0',10))}
          title="Duration (minutes)"
        />
        <button className="px-3 py-1 rounded bg-black text-white dark:bg-white dark:text-black border border-transparent hover:opacity-90" type="submit">Add</button>
      </form>

      <ul className="space-y-2">
        {visibleTasks.map(t => (
          <li key={t.id} className={`border rounded p-2 flex items-center justify-between ${completingId===t.id? 'animate-completeFade': ''}`}>
            <div className="flex flex-col">
              <span className="font-medium">{t.title}</span>
              <div className="text-xs opacity-80 flex items-center gap-2 mt-1">
                <label className="opacity-70">Duration</label>
                <input
                  type="number"
                  min={5}
                  step={5}
                  className="w-20 border rounded px-1 py-0.5 bg-transparent"
                  value={t.durationMinutes}
                  onChange={e=>{
                    const val = parseInt(e.target.value||'0',10);
                    if (!Number.isNaN(val)) {
                      dispatch({ type: 'editTask', id: t.id, patch: { durationMinutes: Math.max(5, val) } });
                    }
                  }}
                  title="Duration (minutes)"
                />
                <span>min</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs px-2 py-1 border rounded hover:bg-black/5" onClick={()=>dispatch({ type: 'removeTask', id: t.id })}>Remove</button>
              <button className="text-xs px-2 py-1 border rounded bg-emerald-600 text-white hover:bg-emerald-700" onClick={()=>onComplete(t.id)}>Complete</button>
            </div>
          </li>
        ))}
        {visibleTasks.length===0 && (
          <li className="text-sm opacity-60">No active tasks. Add one above.</li>
        )}
      </ul>
    </div>
  );
}
