import React, { useCallback, useEffect, useState } from 'react';

type Json = Record<string, any>;
const box = 'rounded-xl border border-[#1e2f4d] bg-[#0e172a] p-4';
const button = 'rounded-lg border border-[#2b4b7a] bg-[#182a44] px-3 py-2 text-xs font-semibold text-[#89ceff] hover:bg-[#233d64] disabled:opacity-50';
const field = 'rounded-lg border border-[#253e65] bg-[#070e1d] px-3 py-2 text-xs text-white';

async function api<T = Json>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || body.error || `${response.status} ${response.statusText}: ${JSON.stringify(body)}`);
  return body as T;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className={box}><h2 className="mb-3 text-sm font-bold text-white">{title}</h2>{children}</section>;
}
function Result({ value }: { value: unknown }) {
  return <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-[#040812] p-3 text-[11px] text-emerald-300">{JSON.stringify(value, null, 2)}</pre>;
}

export function LiveDashboard() {
  const [data, setData] = useState<Json | null>(null);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => { try { setData(await api('/api/dashboard')); setError(''); } catch (e) { setError(String(e)); } }, []);
  useEffect(() => { void refresh(); const timer = setInterval(() => void refresh(), 3000); return () => clearInterval(timer); }, [refresh]);
  return <div className="space-y-5 p-5 text-[#dce2f7]">
    <div className="flex items-center justify-between"><div><h1 className="text-xl font-bold text-white">Live Cluster Dashboard</h1><p className="text-xs text-[#8299b8]">Runtime state is read from the Java RMI nodes through Spring Boot.</p></div><button className={button} onClick={() => void refresh()}>Refresh</button></div>
    {error && <div role="alert" className="rounded border border-rose-700 bg-rose-950/50 p-3 text-sm text-rose-200">Backend error: {error}</div>}
    {data && <><div className="grid gap-3 sm:grid-cols-4">{[['Cluster', data.clusterStatus], ['Nodes online', `${data.onlineNodes ?? 0} / ${data.totalNodes ?? 0}`], ['Leader', data.leaderId ?? 'Unknown'], ['Stored job records', (data.nodes ?? []).reduce((n: number, x: Json) => n + (x.jobRecordCount ?? 0), 0)]].map(([k,v]) => <div key={String(k)} className={box}><div className="text-[10px] uppercase text-[#8299b8]">{k}</div><div className="mt-1 text-lg font-bold text-white">{String(v)}</div></div>)}</div>
      <Panel title="RMI nodes and current worker load"><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="text-[#8299b8]"><tr><th className="p-2">Node</th><th className="p-2">Endpoint</th><th className="p-2">Status</th><th className="p-2">Leader</th><th className="p-2">Load</th><th className="p-2">Job records</th></tr></thead><tbody>{(data.nodes ?? []).map((n: Json) => <tr key={n.id} className="border-t border-[#1e2f4d]"><td className="p-2">Node {n.id}</td><td className="p-2">{n.host}:{n.port}</td><td className="p-2">{n.status}</td><td className="p-2">{n.leaderId ?? '—'}</td><td className="p-2">{n.currentLoad ?? '—'}</td><td className="p-2">{n.jobRecordCount ?? '—'}</td></tr>)}</tbody></table></div></Panel></>}
  </div>;
}

export function LiveExperiments() {
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const [clocks, setClocks] = useState<Json | null>(null); const [clockResult, setClockResult] = useState<Json | null>(null);
  const [election, setElection] = useState<Json | null>(null); const [replication, setReplication] = useState<Json | null>(null);
  const [loads, setLoads] = useState<Json | null>(null); const [dispatch, setDispatch] = useState<Json | null>(null);
  const [spark, setSpark] = useState<Json | null>(null); const [latest, setLatest] = useState<Json | null>(null);
  const [nodeId, setNodeId] = useState(1); const [jobId, setJobId] = useState(7001); const [jobType, setJobType] = useState('MAPREDUCE'); const [version, setVersion] = useState(1); const [mode, setMode] = useState('SYNC');
  const run = async (action: () => Promise<void>) => { setBusy(true); setError(''); try { await action(); } catch (e) { setError(String(e)); } finally { setBusy(false); } };
  const refreshClocks = () => run(async () => setClocks(await api('/api/experiments/3/clocks')));
  const refreshLoads = () => run(async () => setLoads(await api('/api/experiments/6/workers/loads')));
  useEffect(() => { void run(async () => { const [c,l,s] = await Promise.all([api('/api/experiments/3/clocks'), api('/api/experiments/6/workers/loads'), api('/api/experiments/7')]); setClocks(c); setLoads(l); setLatest(s); setSpark(s); }); }, []);
  const post = (url: string, body: Json) => api(url, { method: 'POST', body: JSON.stringify(body) });
  return <div className="space-y-5 p-5 text-[#dce2f7]">
    <div><h1 className="text-xl font-bold text-white">Live Experiments 3–7</h1><p className="text-xs text-[#8299b8]">Controls call Spring Boot endpoints that invoke the configured RMI nodes or Apache Spark.</p></div>
    {error && <div role="alert" className="rounded border border-rose-700 bg-rose-950/50 p-3 text-sm text-rose-200">Request failed: {error}</div>}
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Experiment 3 · Berkeley clock synchronization"><div className="flex flex-wrap gap-2"><button className={button} disabled={busy} onClick={() => void refreshClocks()}>Read node clocks</button><select className={field} value={nodeId} onChange={e => setNodeId(Number(e.target.value))}>{[1,2,3,4].map(id => <option key={id}>{id}</option>)}</select><button className={button} disabled={busy} onClick={() => void run(async () => { setClockResult(await post('/api/experiments/3/synchronize', { nodeId })); setClocks(await api('/api/experiments/3/clocks')); })}>Synchronize through node {nodeId}</button></div>{clocks && <Result value={clocks}/ >}{clockResult && <Result value={clockResult}/>}</Panel>
      <Panel title="Experiment 4 · Java RMI elections"><div className="flex gap-2"><select className={field} value={nodeId} onChange={e => setNodeId(Number(e.target.value))}>{[1,2,3,4].map(id => <option key={id}>{id}</option>)}</select>{(['bully','ring'] as const).map(algorithm => <button key={algorithm} className={button} disabled={busy} onClick={() => void run(async () => setElection(await post(`/api/experiments/4/elections/${algorithm}`, { nodeId })))}>Run {algorithm} election</button>)}</div>{election && <Result value={election}/>}</Panel>
      <Panel title="Experiment 5 · Replication on RMI nodes"><div className="flex flex-wrap gap-2"><input className={field} aria-label="Job ID" type="number" value={jobId} onChange={e => setJobId(Number(e.target.value))}/><input className={field} aria-label="Version" type="number" value={version} onChange={e => setVersion(Number(e.target.value))}/><select className={field} value={mode} onChange={e => setMode(e.target.value)}><option value="SYNC">Synchronous</option><option value="ASYNC">Asynchronous</option></select><button className={button} disabled={busy} onClick={() => void run(async () => setReplication(await post('/api/experiments/5/replication', {jobId, jobType, status:'RUNNING', version, primaryNodeId:nodeId, mode})))}>Replicate version</button><button className={button} disabled={busy} onClick={() => void run(async () => setReplication(await api(`/api/experiments/5/jobs/${jobId}/replicas`)))}>Read replica state</button></div>{replication && <Result value={replication}/>}</Panel>
      <Panel title="Experiment 6 · Actual LoadBalancer dispatch"><div className="flex flex-wrap gap-2"><input className={field} aria-label="Dispatch job ID" type="number" value={jobId+1} onChange={e => setJobId(Number(e.target.value)-1)}/><input className={field} aria-label="Job type" value={jobType} onChange={e => setJobType(e.target.value)}/><button className={button} disabled={busy} onClick={() => void run(async () => {setDispatch(await post('/api/experiments/6/jobs/dispatch',{jobId:jobId+1,jobType,status:'QUEUED',version:0}));setLoads(await api('/api/experiments/6/workers/loads'));})}>Dispatch to worker</button><button className={button} disabled={busy} onClick={() => void refreshLoads()}>Refresh loads</button></div>{dispatch && <Result value={dispatch}/ >}{loads && <Result value={loads}/>}</Panel>
      <Panel title="Experiment 7 · Apache Spark MapReduce"><div className="flex gap-2"><button className={button} disabled={busy} onClick={() => void run(async () => {const records = ['MAPREDUCE','SPARK_RDD','MAPREDUCE','MPI_COLLECTIVE','SPARK_RDD','MAPREDUCE','MPI_COLLECTIVE','SPARK_RDD'].map((type,i)=>({jobId:8100+i,jobType:type,status:'COMPLETED',version:1}));const result = await post('/api/experiments/7/run',{jobRecords:records,partitions:2});setSpark(result);setLatest(await api('/api/experiments/7'));})}>Run Spark MapReduce sample</button><button className={button} disabled={busy} onClick={() => void run(async () => {const result=await api('/api/experiments/7');setSpark(result);setLatest(result);})}>Load persisted latest run</button></div>{spark && <Result value={spark}/ >}{latest && <div className="mt-2 text-[10px] text-[#8299b8]">Latest persisted execution status: {latest.status ?? 'none'}</div>}</Panel>
    </div>
  </div>;
}
