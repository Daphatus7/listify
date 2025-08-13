"use client";

import React from 'react';
import { ScheduleProvider } from "../lib/store";
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from "../lib/theme";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ScheduleProvider>
        {children}
      </ScheduleProvider>
    </ThemeProvider>
  );
}
