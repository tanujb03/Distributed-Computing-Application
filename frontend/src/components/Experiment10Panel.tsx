import React, { useCallback, useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Play, RefreshCw, XCircle } from 'lucide-react';

type Json = Record<string, any>;
const button = 'inline-flex items-center gap-2 rounded-lg border border-[#2b4b7a] bg-[#182a44] px-3 py-2 text-xs font-semibold text-[#89ceff] transition hover:bg-[#233d64] disabled:cursor-not-allowed disabled:opacity-50';
const field = 'rounded-lg border border-[#253e65] bg-[#070e1d] px-3 py-2 text-xs text-white outline-none focus:border-[#89ceff]';
const panel = 'rounded-xl border border-[#1e2f4d] bg-[#0e172a] p-4';

async function request<T = Json>(url: string, init?: RequestInit): Promise<T | null> {
  const response = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  if (response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || body.error || `${response.status} ${response.statusText}`);
  return body as T;
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-lg border border-[#1e2f4d] bg-[#091122] p-3"><div className="text-[9px] uppercase tracking-wider text-[#8299b8]">{label}</div><div className="mt-1 truncate text-sm font-bold text-white">{value}</div></div>;
}

function Matrix({ title, values }: { title: string; values?: number[][] }) {
  return <div className="overflow-x-auto rounded-lg border border-[#1e2f4d] bg-[#091122] p-3"><div className="mb-2 text-xs font-semibold text-white">{title}</div>
    {values?.length ? <table className="font-mono text-xs text-[#b9d8ff]"><tbody>{values.map((row, i) => <tr key={i}>{row.map((value, j) => <td key={j} className="px-2 py-1 text-right">{value}</td>)}</tr>)}</tbody></table> : <div className="text-xs text-[#8299b8]">No matrix result yet.</div>}
  </div>;
}

export default function Experiment10Panel() {
  const [status, setStatus] = useState<Json | null>(null);
  const [latest, setLatest] = useState<Json | null>(null);
  const [runs, setRuns] = useState<Json[]>([]);
  const [events, setEvents] = useState<Json[]>([]);
  const [matrixSize, setMatrixSize] = useState(200);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    const [runtime, last, history, eventLog] = await Promise.all([
      request<Json>('/api/experiments/10/status'),
      request<Json>('/api/experiments/10/latest').catch(() => null),
      request<Json[]>('/api/experiments/10/runs'),
      request<Json[]>('/api/experiments/10/events')
    ]);
    setStatus(runtime);
    setLatest(last);
    setRuns(history ?? []);
    setEvents(eventLog ?? []);
  }, []);

  useEffect(() => { void refresh().catch(e => setError(e instanceof Error ? e.message : String(e))); }, [refresh]);

  const execute = async () => {
    if (!Number.isInteger(matrixSize) || matrixSize < 2 || matrixSize > (status?.maximumMatrixSize ?? 512)) {
      setError(`Enter a whole-number matrix dimension from 2 to ${status?.maximumMatrixSize ?? 512}.`);
      return;
    }
    setBusy(true); setError('');
    try {
      const result = await request<Json>('/api/experiments/10/run', { method: 'POST', body: JSON.stringify({ matrixSize }) });
      setLatest({ runId: result?.runId, status: result?.status, startedAt: result?.startedAt,
        completedAt: result?.completedAt, parameters: { matrixSize: result?.matrixSize },
        summary: { ...(result?.result ?? {}), durationMillis: result?.durationMillis,
          stdout: result?.stdout, stderr: result?.stderr, command: result?.command }, error: result?.error });
      if (result?.status !== 'SUCCEEDED') setError(result?.error || 'MPI process failed; the run is recorded as failed.');
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      await refresh().catch(() => undefined);
    } finally { setBusy(false); }
  };

  const result: Json = latest?.summary ?? {};
  const ranks = Number(status?.ranks ?? result.processCount ?? 4);
  const n = Number(result.matrixSize ?? latest?.parameters?.matrixSize ?? matrixSize);
  const rowsPerRank = Number(result.rowsPerRank ?? Math.ceil(n / ranks));
  const assignments: Json[] = result.rowAssignments ?? Array.from({ length: ranks }, (_, rank) => ({ rank,
    fromRow: Math.min(rank * rowsPerRank, n), toRowExclusive: Math.min((rank + 1) * rowsPerRank, n) }));
  const success = latest?.status === 'SUCCEEDED' && result.correct === true;
  const small = n <= 8 && !result.previewOnly;

  return <div className="space-y-4">
    <section className={panel}>
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-sm font-bold text-white">Experiment 10 — Parallel Matrix Multiplication using MPI</h2>
        <p className="mt-1 text-xs text-[#8299b8]">Distribute matrix computation, gather partial results, and compare sequential and parallel execution time.</p></div>
        <button className={button} disabled={busy} onClick={() => void refresh().catch(e => setError(String(e)))}><RefreshCw className="h-3 w-3"/>Refresh</button></div>
      {error && <div role="alert" className="mt-3 rounded-lg border border-rose-800 bg-rose-950/40 p-3 text-xs text-rose-200"><AlertTriangle className="mr-2 inline h-4 w-4"/>{error}</div>}
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4"><Metric label="MPI runtime" value={status?.configured ? 'READY' : 'NOT READY'}/><Metric label="MPI processes" value={status?.ranks ?? '—'}/><Metric label="Last run" value={latest?.status ?? 'No execution yet'}/><Metric label="Last execution" value={latest?.startedAt ? new Date(latest.startedAt).toLocaleString() : '—'}/></div>
      <p className={`mt-2 text-[11px] ${status?.configured ? 'text-emerald-300' : 'text-amber-200'}`}>{status?.message ?? 'Checking MPJ runner…'}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2"><label htmlFor="exp10-size" className="text-xs text-[#8299b8]">Square matrix dimension</label>
        <input id="exp10-size" aria-label="Matrix dimension" className={field} type="number" min={2} max={status?.maximumMatrixSize ?? 512} step={1} value={matrixSize} onChange={e => setMatrixSize(Number(e.target.value))}/>
        <button className={button} disabled={busy || !status?.configured || !Number.isInteger(matrixSize) || matrixSize < 2 || matrixSize > (status?.maximumMatrixSize ?? 512)} onClick={() => void execute()}><Play className="h-3 w-3"/>{busy ? 'Running MPI processes…' : 'Run Experiment 10'}</button>
        {latest?.runId && <span className="text-[11px] text-[#8299b8]">Run #{latest.runId}</span>}
      </div>
    </section>

    <section className={panel}><h3 className="text-sm font-bold text-white">MPI row-wise execution flow</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-4"><div className="rounded-lg border border-cyan-800/70 bg-cyan-950/20 p-3 text-center"><div className="text-[10px] font-bold text-cyan-300">ROOT · RANK 0</div><div className="mt-1 text-xs text-white">Initialize A and B</div></div>
        {['MPI_Bcast(B)', 'MPI_Scatter(rows of A)', 'Local C rows', 'MPI_Gather(C)'].map((name, i) => <div key={name} className="rounded-lg border border-[#2b4b7a] bg-[#091122] p-3 text-center"><div className="text-[10px] font-bold text-[#89ceff]">{i + 1}. COLLECTIVE</div><div className="mt-1 text-xs text-white">{name}</div></div>)}</div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{assignments.map((assignment, i) => <div key={assignment.rank ?? i} className="rounded-lg border border-[#1e2f4d] bg-[#091122] p-3 text-center"><div className="text-xs font-bold text-white">Rank {assignment.rank ?? i}{Number(assignment.rank ?? i) === 0 ? ' · ROOT' : ''}</div><div className="mt-1 text-[10px] text-[#8299b8]">A rows [{assignment.fromRow}, {assignment.toRowExclusive})</div><div className="mt-1 text-[10px] text-cyan-200">{assignment.toRowExclusive === assignment.fromRow ? 'No matrix rows (padding only)' : 'Computes assigned C rows'}</div></div>)}</div>
      <div className="mt-3 text-[11px] text-[#8299b8]">MPJ uses equal-count Scatter/Gather buffers. Zero-row padding preserves every real row when the matrix dimension does not divide evenly across ranks.</div>
    </section>

    <section className={panel}><h3 className="text-sm font-bold text-white">Measured execution and correctness</h3>
      {latest ? <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Dimension" value={`${n} × ${n}`}/><Metric label="Sequential time" value={result.sequentialMillis == null ? '—' : `${Number(result.sequentialMillis).toFixed(3)} ms`}/><Metric label="Parallel end-to-end" value={result.parallelMillis == null ? '—' : `${Number(result.parallelMillis).toFixed(3)} ms`}/><Metric label="Speedup" value={result.speedup == null ? '—' : `${Number(result.speedup).toFixed(4)}×`}/><div className="sm:col-span-2 lg:col-span-4 flex items-center gap-2 rounded-lg border border-[#1e2f4d] bg-[#091122] p-3 text-xs">{success ? <CheckCircle2 className="h-4 w-4 text-emerald-400"/> : <XCircle className="h-4 w-4 text-rose-400"/>}<span className={success ? 'text-emerald-200' : 'text-rose-200'}>Result correctness: {success ? 'Sequential and MPI matrices match' : latest.status === 'FAILED' ? `Run failed: ${latest.error ?? 'see execution history'}` : 'Not verified'}</span><span className="ml-auto text-[#8299b8]">{latest.status}</span></div></div> : <div className="mt-3 rounded-lg border border-dashed border-[#2b4b7a] p-4 text-xs text-[#8299b8]">No saved execution yet. Run the experiment to populate real timings and correctness results.</div>}
      {latest && <p className="mt-2 text-[10px] text-[#8299b8]">Sequential timing includes only multiplication. Parallel timing includes Bcast, Scatter, local multiplication, Gather and a synchronization barrier; input generation and MPI startup are excluded. Small runs can be slower because of communication overhead.</p>}
    </section>

    <section className={panel}><h3 className="text-sm font-bold text-white">Matrix inputs and result</h3>
      {latest ? <><p className="mb-3 mt-1 text-[11px] text-[#8299b8]">{small ? 'Showing complete matrices from the verified run.' : `Showing the returned top-left preview for ${n} × ${n} matrices.`}</p><div className="grid gap-3 lg:grid-cols-3"><Matrix title="Matrix A" values={result.matrixA}/><Matrix title="Matrix B" values={result.matrixB}/><Matrix title="Matrix C = A × B" values={result.matrixC}/></div></> : <p className="mt-2 text-xs text-[#8299b8]">The deterministic 2 × 2 demonstration uses A = [[1, 2], [3, 4]] and B = [[5, 6], [7, 8]]. Its expected C is [[19, 22], [43, 50]]. No result is assumed before execution.</p>}
    </section>

    <div className="grid gap-4 xl:grid-cols-2"><section className={panel}><div className="mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-[#89ceff]"/><h3 className="text-sm font-bold text-white">Persisted execution events</h3></div>{events.length ? <div className="max-h-80 space-y-2 overflow-auto">{[...events].reverse().map(event => <div key={event.eventId} className="flex flex-wrap justify-between gap-2 rounded border border-[#1e2f4d] bg-[#091122] px-3 py-2 text-[11px]"><span className="font-semibold text-emerald-200">{event.eventType}</span><span className="text-[#8299b8]">{new Date(event.occurredAt).toLocaleString()}</span></div>)}</div> : <p className="text-xs text-[#8299b8]">No Experiment 10 events persisted yet.</p>}</section>
      <section className={panel}><h3 className="mb-3 text-sm font-bold text-white">Recent Experiment 10 runs</h3>{runs.length ? <div className="max-h-80 space-y-2 overflow-auto">{runs.map(run => <div key={run.runId} className="rounded border border-[#1e2f4d] bg-[#091122] px-3 py-2 text-[11px]"><div className="flex justify-between gap-2"><b className={run.status === 'SUCCEEDED' ? 'text-emerald-200' : 'text-rose-200'}>Run #{run.runId} · {run.status}</b><span className="text-[#8299b8]">{new Date(run.startedAt).toLocaleString()}</span></div><div className="mt-1 text-[#8299b8]">{run.parameters?.matrixSize} × {run.parameters?.matrixSize} · {run.parameters?.processCount} ranks</div></div>)}</div> : <p className="text-xs text-[#8299b8]">Run history will appear after the first execution.</p>}</section></div>
  </div>;
}
