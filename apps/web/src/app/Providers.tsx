"use client";

import React from 'react';
import { ScheduleProvider } from "../lib/store";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ScheduleProvider>{children}</ScheduleProvider>;
}
