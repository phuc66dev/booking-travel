import { Profiler, type ReactNode, type ProfilerOnRenderCallback } from "react";

interface RenderSample {
  id: string;
  phase: string;
  actualDuration: number;
  baseDuration: number;
  commitTime: number;
}
interface QuerySample {
  key: string;
  event: string;
  status: string;
  fetchStatus: string;
  invalidated: boolean;
  at: number;
}
declare global {
  interface Window {
    __MEKONG_DIAGNOSTICS__?: {
      renders: RenderSample[];
      queries: QuerySample[];
    };
  }
}

function diagnostics() {
  return (window.__MEKONG_DIAGNOSTICS__ ??= { renders: [], queries: [] });
}

const recordRender: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  _start,
  commitTime,
) => {
  const samples = diagnostics().renders;
  samples.push({ id, phase, actualDuration, baseDuration, commitTime });
  if (samples.length > 2000) samples.shift();
};

export function profileView(id: string, view: ReactNode) {
  return import.meta.env.DEV ? (
    <Profiler id={id} onRender={recordRender}>
      {view}
    </Profiler>
  ) : (
    view
  );
}

export function recordQuery(sample: QuerySample) {
  if (!import.meta.env.DEV) return;
  const samples = diagnostics().queries;
  samples.push(sample);
  if (samples.length > 2000) samples.shift();
}
