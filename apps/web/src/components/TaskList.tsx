"use client";

import React, { useMemo, useState } from 'react';
import { useSchedule } from "../lib/store";
import {
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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
    <Paper variant="outlined" sx={{ p: 2, width: '100%', maxWidth: 380 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Tasks</Typography>
      <Stack component="form" onSubmit={onAdd} direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          label="New task"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
        />
        <TextField
          size="small"
          label="Duration"
          type="number"
          inputProps={{ min: 5, step: 5 }}
          value={duration}
          onChange={(e)=>setDuration(parseInt(e.target.value||'0',10))}
          InputProps={{ endAdornment: <InputAdornment position="end">min</InputAdornment> }}
          sx={{ width: 140 }}
        />
        <Button type="submit" variant="contained">Add</Button>
      </Stack>

      <Stack spacing={1.5}>
        {visibleTasks.map(t => (
          <Paper key={t.id} variant="outlined" className={completingId===t.id? 'animate-completeFade': ''} sx={{ p: 1.5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
              <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap>{t.title}</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" color="text.secondary">Duration</Typography>
                  <TextField
                    size="small"
                    type="number"
                    inputProps={{ min: 5, step: 5 }}
                    value={t.durationMinutes}
                    onChange={(e)=>{
                      const val = parseInt(e.target.value||'0',10);
                      if (!Number.isNaN(val)) {
                        dispatch({ type: 'editTask', id: t.id, patch: { durationMinutes: Math.max(5, val) } });
                      }
                    }}
                    sx={{ width: 110 }}
                    InputProps={{ endAdornment: <InputAdornment position="end">min</InputAdornment> }}
                  />
                </Stack>
              </Stack>
              <Stack direction="row" spacing={0.5}>
                <IconButton size="small" color="error" aria-label="remove" onClick={()=>dispatch({ type: 'removeTask', id: t.id })}>
                  <DeleteOutlineIcon />
                </IconButton>
                <IconButton size="small" color="success" aria-label="complete" onClick={()=>onComplete(t.id)}>
                  <CheckCircleIcon />
                </IconButton>
              </Stack>
            </Stack>
          </Paper>
        ))}
        {visibleTasks.length===0 && (
          <Typography variant="body2" color="text.secondary">No active tasks. Add one above.</Typography>
        )}
      </Stack>
    </Paper>
  );
}
