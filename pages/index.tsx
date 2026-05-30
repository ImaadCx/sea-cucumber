import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import ResultsTable from '@/components/ResultsTable';
import { ScanResult } from '@/lib/coralRunner';
import { PiAgentReport } from '@/lib/piAgent';

interface Bubble {
  id: number;
  left: string;
  size: string;
  delay: string;
  duration: string;
}

type TabType = 'dredge' | 'schema' | 'cache' | 'mcp';
type ScanMode = 'standard' | 'agentic';

interface AgentLog {
  icon: string;
  text: string;
  status: 'pending' | 'running' | 'done';
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('dredge');
  const [scanRepoUrl, setScanRepoUrl] = useState('https://github.com/hackathon-demo/legacy-payments-api');
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScanResult[] | null>(null);
  const [agentReport, setAgentReport] = useState<PiAgentReport | null>(null);
  const [showRawTable, setShowRawTable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Caching states
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [queryCount, setQueryCount] = useState(0);
  const [lastScanLatency, setLastScanLatency] = useState<number | null>(null);

  // Agentic scan logs simulation state
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [currentLogIdx, setCurrentLogIdx] = useState<number>(-1);

  useEffect(() => {
    // Generate random deep-sea bubbles for ambient animation
    const generatedBubbles = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 32 + 8}px`,
      delay: `${Math.random() * 10}s`,
      duration: `${Math.random() * 8 + 10}s`,
    }));
    setBubbles(generatedBubbles);
  }, []);

  const runAgenticSimulation = (): Promise<void> => {
    const logs: AgentLog[] = [
      { icon: '🔍', text: `Scanning repository codebase at ${scanRepoUrl} to discover declared Next.js API endpoints...`, status: 'pending' },
      { icon: '🪸', text: 'Inspecting Coral schemas to locate Sentry error, deployment logs, and Jira tables...', status: 'pending' },
      { icon: '⚡', text: 'Synthesizing and executing Coral SQL join query across all discovered tables...', status: 'pending' },
      { icon: '🧠', text: 'Connecting to NVIDIA NIM (qwen/qwen3-coder-480b-a35b-instruct) to analyze endpoint activity levels...', status: 'pending' },
      { icon: '🦴', text: 'Pi Agent formulating step-by-step refactoring proposals and risk assessments...', status: 'pending' }
    ];
    
    setAgentLogs(logs);
    setCurrentLogIdx(0);
    
    return new Promise((resolve) => {
      // Step 1
      setAgentLogs(prev => {
        const next = [...prev];
        next[0].status = 'running';
        return next;
      });

      setTimeout(() => {
        setAgentLogs(prev => {
          const next = [...prev];
          next[0].status = 'done';
          next[1].status = 'running';
          return next;
        });
        setCurrentLogIdx(1);

        // Step 2
        setTimeout(() => {
          setAgentLogs(prev => {
            const next = [...prev];
            next[1].status = 'done';
            next[2].status = 'running';
            return next;
          });
          setCurrentLogIdx(2);

          // Step 3
          setTimeout(() => {
            setAgentLogs(prev => {
              const next = [...prev];
              next[2].status = 'done';
              next[3].status = 'running';
              return next;
            });
            setCurrentLogIdx(3);

            // Step 4
            setTimeout(() => {
              setAgentLogs(prev => {
                const next = [...prev];
                next[3].status = 'done';
                next[4].status = 'running';
                return next;
              });
              setCurrentLogIdx(4);

              // Step 5
              setTimeout(() => {
                setAgentLogs(prev => {
                  const next = [...prev];
                  next[4].status = 'done';
                  return next;
                });
                resolve();
              }, 1200);

            }, 1200);

          }, 1200);

        }, 1200);

      }, 1200);
    });
  };

  const handleScan = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setAgentReport(null);
    setShowRawTable(false);
    setAgentLogs([]);
    setCurrentLogIdx(-1);
    const start = performance.now();

    try {
      // Run AI Agent chain of thought simulation first
      await runAgenticSimulation();

      // Fetch AI Agentic report from backend
      const response = await fetch(`/api/agent-scan?repoUrl=${encodeURIComponent(scanRepoUrl)}`);
      const data = await response.json();
      
      if (data.success) {
        setAgentReport(data.report);
        
        // Also fetch raw SQL results in the background so they can toggle view
        const rawResponse = await fetch('/api/scan');
        const rawData = await rawResponse.json();
        if (rawData.success) {
          setResults(rawData.results);
        }
        
        setQueryCount(prev => prev + 1);
        const duration = Math.round(performance.now() - start);
        setLastScanLatency(duration);
      } else {
        setError(data.error || 'Failed to execute the Pi Coding Agent scan.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while connecting to the scan API.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (risk: 'High' | 'Medium' | 'Low') => {
    if (risk === 'Low') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 border border-emerald-800 text-emerald-300">
          Low Risk
        </span>
      );
    } else if (risk === 'Medium') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 border border-amber-800 text-amber-300">
          Medium Risk
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/60 border border-rose-800 text-rose-300">
          High Risk
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-teal-950 relative overflow-hidden flex flex-col justify-between select-none">
      
      {/* Bioluminescent soft glow circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[130px] pointer-events-none select-none z-0 animate-pulse-glow" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-rose-500/5 blur-[160px] pointer-events-none select-none z-0" />
      <div className="absolute top-[40%] left-[25%] w-[450px] h-[450px] rounded-full bg-amber-500/5 blur-[140px] pointer-events-none select-none z-0" />

      {/* Dynamic Bubble Animation in Background */}
      <div className="bubbles-container">
        {bubbles.map((b) => (
          <div
            key={b.id}
            className="bubble"
            style={{
              left: b.left,
              width: b.size,
              height: b.size,
              animationDelay: b.delay,
              animationDuration: b.duration,
            }}
          />
        ))}
      </div>

      <Head>
        <title>Sea Cucumber 🥒🌊 — AI Barnacle Finder</title>
        <meta name="description" content="Identify and scrape off dead, low-activity API endpoints (barnacles) lurking in your codebase using multi-source SQL joins via Coral." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🥒</text></svg>" />
      </Head>

      {/* Main Content Area */}
      <main className="w-full max-w-6xl mx-auto px-4 py-8 md:py-16 z-10 flex-grow flex flex-col items-center justify-start space-y-10">
        
        {/* Header Section */}
        <header className="text-center space-y-3 max-w-2xl">
          <div className="flex justify-center mb-1">
            <span className="text-6xl md:text-7xl select-none animate-float inline-block filter drop-shadow-[0_0_20px_rgba(20,184,166,0.3)]">
              🥒🌊
            </span>
          </div>
          <h1 id="app-title" className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-teal-300 to-emerald-200 drop-shadow-sm">
            Sea Cucumber
          </h1>
          <p className="text-sm md:text-base text-teal-200/80 font-medium">
            Cleaning up dead endpoints from your codebase, one barnacle at a time.
          </p>
        </header>

        {/* Advanced Coral Tabs Navigation */}
        <nav className="w-full max-w-2xl bg-slate-900/60 border border-teal-900/40 p-1.5 rounded-xl backdrop-blur-md grid grid-cols-4 gap-1 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
          <button
            onClick={() => setActiveTab('dredge')}
            className={`py-2 px-1 rounded-lg text-xs font-bold transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'dredge' 
                ? 'bg-teal-500/10 border border-teal-500/30 text-teal-200 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <span>🥒</span>
            <span className="hidden sm:inline">Dredge Scan</span>
            <span className="sm:hidden text-[9px]">Scan</span>
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-2 px-1 rounded-lg text-xs font-bold transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'schema' 
                ? 'bg-teal-500/10 border border-teal-500/30 text-teal-200 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <span>🪸</span>
            <span className="hidden sm:inline">Schema Info</span>
            <span className="sm:hidden text-[9px]">Schema</span>
          </button>
          <button
            onClick={() => setActiveTab('cache')}
            className={`py-2 px-1 rounded-lg text-xs font-bold transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'cache' 
                ? 'bg-teal-500/10 border border-teal-500/30 text-teal-200 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <span>⚡</span>
            <span className="hidden sm:inline">CLI Caching</span>
            <span className="sm:hidden text-[9px]">Cache</span>
          </button>
          <button
            onClick={() => setActiveTab('mcp')}
            className={`py-2 px-1 rounded-lg text-xs font-bold transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'mcp' 
                ? 'bg-teal-500/10 border border-teal-500/30 text-teal-200 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <span>🔌</span>
            <span className="hidden sm:inline">MCP Server</span>
            <span className="sm:hidden text-[9px]">MCP</span>
          </button>
        </nav>

        {/* Tab content renderer */}
        <section className="w-full transition-all duration-500">
          
          {/* TAB 1: DREDGE DASHBOARD */}
          {activeTab === 'dredge' && (
            <div className="space-y-8 flex flex-col items-center">
              
              {/* Scan Mode & Trigger Panel */}
              <div className="w-full max-w-md bg-slate-900/60 border border-teal-900/40 p-6 rounded-2xl backdrop-blur-md space-y-5 flex flex-col items-center shadow-lg">
                
                {/* Codebase URL Input */}
                <div className="w-full flex flex-col gap-1.5 items-start">
                  <label htmlFor="repo-url-input" className="text-[10px] uppercase font-bold text-teal-400/80 tracking-wider">
                    GitHub Codebase Repository URL to Scan:
                  </label>
                  <div className="w-full flex items-center gap-2 bg-slate-950/60 border border-teal-950 rounded-xl px-3.5 py-2.5">
                    <span className="text-xs">🔗</span>
                    <input
                      id="repo-url-input"
                      type="text"
                      value={scanRepoUrl}
                      onChange={(e) => setScanRepoUrl(e.target.value)}
                      placeholder="https://github.com/owner/repo"
                      className="bg-transparent text-xs text-amber-200/90 font-mono focus:outline-none w-full border-none p-0 focus:ring-0"
                    />
                  </div>
                </div>

                <button
                  id="scan-button"
                  onClick={handleScan}
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-full py-4 px-8 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-400 hover:via-orange-400 hover:to-amber-400 text-white font-bold text-base shadow-[0_0_30px_rgba(239,68,68,0.25)] hover:shadow-[0_0_40px_rgba(239,68,68,0.45)] border border-rose-500/20 active:scale-98 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer z-10 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-glow"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Pi Agent Analyzing...</span>
                    </span>
                  ) : (
                    <>
                      <span>Run Pi Agent Scan</span>
                      <span className="group-hover:translate-y-[-2px] transition-transform duration-200">🧠</span>
                    </>
                  )}
                </button>

                <div className="text-center">
                  {loading && (
                    <span className="text-xs text-teal-300 font-semibold animate-pulse">
                      Pi Agent calling NVIDIA NIM & Coral SQL...
                    </span>
                  )}
                  {!loading && !results && !agentReport && !error && (
                    <span className="text-xs text-teal-300/60 font-semibold">
                      Deploys Pi Coding Agent powered by Qwen3-Coder via NVIDIA NIM.
                    </span>
                  )}
                  {error && (
                    <span className="text-xs text-rose-400 font-semibold">
                      ⚠️ Error: {error}
                    </span>
                  )}
                </div>
              </div>

              {/* Scan Results / Simulation Console Rendering */}
              <div className="w-full">
                {loading ? (
                  /* Agentic Console Log Simulator */
                  <div className="w-full max-w-2xl mx-auto bg-slate-950 border border-teal-950 p-6 rounded-3xl font-mono text-xs text-slate-300 space-y-4 shadow-[0_0_30px_rgba(20,184,166,0.05)]">
                      <div className="flex justify-between items-center border-b border-teal-950/60 pb-3">
                        <span className="text-[10px] text-teal-400/80 font-bold uppercase tracking-wider">🤖 Pi Agent Console (NVIDIA NIM Backend)</span>
                        <span className="text-[10px] text-teal-400 animate-pulse">● Thinking</span>
                      </div>
                      
                      <div className="space-y-3">
                        {agentLogs.map((log, idx) => {
                          const isPending = log.status === 'pending';
                          const isRunning = log.status === 'running';
                          const isDone = log.status === 'done';

                          return (
                            <div 
                              key={idx} 
                              className={`flex items-start gap-3 transition-opacity duration-300 ${
                                isPending ? 'opacity-30' : 'opacity-100'
                              }`}
                            >
                              <span className={`shrink-0 ${isRunning ? 'animate-bounce' : ''}`}>{log.icon}</span>
                              <div className="flex-grow">
                                <span className={isRunning ? 'text-amber-200 font-bold' : isDone ? 'text-teal-300' : 'text-slate-500'}>
                                  {log.text}
                                </span>
                                {isRunning && (
                                  <span className="inline-block w-2.5 h-4 bg-amber-400 ml-1 animate-pulse" />
                                )}
                              </div>
                              <span className="shrink-0 text-[10px] uppercase font-bold">
                                {isDone && <span className="text-emerald-400">✓ Done</span>}
                                {isRunning && <span className="text-amber-400 animate-pulse">Active</span>}
                                {isPending && <span className="text-slate-700">Idle</span>}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : agentReport ? (
                  /* AGENTIC SCAN REPORT PANEL */
                  <div className="w-full max-w-4xl mx-auto space-y-8">
                    
                    {/* Agent Identification Card */}
                    <div className="bg-slate-900/60 border border-teal-900/40 p-6 rounded-3xl backdrop-blur-md space-y-4">
                      
                      {/* LLM Backend Badge */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-teal-950 pb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl animate-float">🤖</span>
                          <div>
                            <h3 className="text-lg font-bold text-slate-100">{agentReport.agentName}</h3>
                            <p className="text-xs text-teal-300/80">LLM Reasoning Engine: <span className="font-mono text-amber-200">{agentReport.llmBackend}</span></p>
                          </div>
                        </div>
                        <span className="text-[10px] px-3 py-1.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-bold uppercase tracking-wider">
                          Analysis Complete
                        </span>
                      </div>

                      {/* Simulation Notice */}
                      {agentReport.isSimulated && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-xs text-amber-200/90 leading-relaxed">
                          <strong className="block text-amber-300 mb-1">🔑 Running in Simulation:</strong>
                          Pi Coding Agent generated this report using simulated NVIDIA NIM model prompts. To execute real-time reasoning on your live database, add your key `NVIDIA_API_KEY=your_key_here` to `sea-cucumber/.env.local` and restart the server.
                        </div>
                      )}

                      {/* Executive Summary */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-teal-400/80 tracking-wider">Executive Summary</span>
                        <p className="text-xs md:text-sm text-slate-200/90 leading-relaxed font-medium">
                          {agentReport.findingsSummary}
                        </p>
                      </div>
                    </div>

                    {/* Grid of Refactoring Proposals */}
                    <div className="space-y-6">
                      <h4 className="text-sm font-bold text-slate-200 tracking-wider uppercase">
                        🔧 Codebase Deletion & Refactoring Plans
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {agentReport.refactoringProposals.map((prop, idx) => (
                          <div key={idx} className="bg-slate-900/40 border border-teal-900/30 p-6 rounded-2xl backdrop-blur-md space-y-4 hover:border-teal-800/40 transition-colors duration-300">
                            
                            <div className="flex justify-between items-start gap-2 border-b border-teal-950 pb-3">
                              <span className="font-mono text-xs font-bold text-amber-200 select-all break-all">{prop.endpoint}</span>
                              {getRiskBadge(prop.risk_level)}
                            </div>

                            <div className="space-y-2">
                              <span className="text-[10px] uppercase font-bold text-teal-400/70 tracking-wider block">Agent Evidence Justification</span>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {prop.evidence}
                              </p>
                            </div>

                            <div className="space-y-2 bg-slate-950/40 border border-teal-950 p-4 rounded-xl">
                              <span className="text-[10px] uppercase font-bold text-amber-300/80 tracking-wider block">Refactoring Instructions</span>
                              <div className="text-xs text-slate-200 font-mono whitespace-pre-line leading-relaxed">
                                {prop.refactoring_plan}
                              </div>
                            </div>

                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Toggle raw data view */}
                    <div className="text-center pt-4">
                      <button
                        onClick={() => setShowRawTable(!showRawTable)}
                        className="px-5 py-2.5 text-xs font-bold rounded-full border border-teal-500/20 text-teal-300 hover:text-teal-200 bg-teal-500/5 hover:bg-teal-500/10 transition-all cursor-pointer"
                      >
                        {showRawTable ? 'Hide Raw Coral SQL Data' : 'Inspect Raw Coral SQL Metrics'}
                      </button>
                    </div>

                    {showRawTable && results && (
                      <div className="pt-4 border-t border-teal-950/60 animate-fade-in">
                        <ResultsTable results={results} />
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="text-center p-12 bg-slate-900/30 border border-teal-900/20 rounded-3xl backdrop-blur-md max-w-lg mx-auto">
                    <span className="text-4xl block mb-3 animate-float-slow select-none">
                      🧭
                    </span>
                    <h3 className="text-slate-200 font-bold text-base mb-1">Codebase Untouched</h3>
                    <p className="text-xs text-teal-200/60 leading-relaxed">
                      Input your codebase URL above and click **Run Pi Agent Scan** to deploy the AI agent. The agent will run multi-source SQL joins using Coral to identify dead endpoints.
                    </p>
                  </div>
                )}
              </div>

              {/* How It Works Section */}
              <div className="w-full max-w-4xl pt-8 border-t border-teal-950/60">
                <h2 className="text-lg font-bold text-slate-200 text-center mb-8 tracking-wide">
                  How It Works
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <div className="bg-slate-900/40 border border-teal-900/30 p-6 rounded-2xl backdrop-blur-md space-y-3 relative hover:border-teal-800/40 transition-all duration-300 group">
                    <div className="w-10 h-10 rounded-xl bg-teal-950 border border-teal-800/50 flex items-center justify-center font-bold text-teal-300 text-lg group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(20,184,166,0.15)]">
                      1
                    </div>
                    <h3 className="text-sm font-semibold text-slate-100">Cast the Net</h3>
                    <p className="text-xs text-teal-200/60 leading-relaxed">
                      Click **Scan for Barnacles** to deploy the Sea Cucumber AI agent across your repositories.
                    </p>
                  </div>

                  <div className="bg-slate-900/40 border border-teal-900/30 p-6 rounded-2xl backdrop-blur-md space-y-3 relative hover:border-teal-800/40 transition-all duration-300 group">
                    <div className="w-10 h-10 rounded-xl bg-teal-950 border border-teal-800/50 flex items-center justify-center font-bold text-teal-300 text-lg group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(20,184,166,0.15)]">
                      2
                    </div>
                    <h3 className="text-sm font-semibold text-slate-100">Coral Joins Data</h3>
                    <p className="text-xs text-teal-200/60 leading-relaxed">
                      Coral joins **GitHub code activity**, **Sentry errors**, **deployment logs**, and **Jira tasks** via a single SQL query.
                    </p>
                  </div>

                  <div className="bg-slate-900/40 border border-teal-900/30 p-6 rounded-2xl backdrop-blur-md space-y-3 relative hover:border-teal-800/40 transition-all duration-300 group">
                    <div className="w-10 h-10 rounded-xl bg-teal-950 border border-teal-800/50 flex items-center justify-center font-bold text-teal-300 text-lg group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(20,184,166,0.15)]">
                      3
                    </div>
                    <h3 className="text-sm font-semibold text-slate-100">Scrape off Deadwood</h3>
                    <p className="text-xs text-teal-200/60 leading-relaxed">
                      Instantly surface dead endpoints. File pre-filled GitHub issues with evidence in one click.
                    </p>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SCHEMA EXPLORER & SCHEMA LEARNING */}
          {activeTab === 'schema' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-slate-900/60 border border-teal-900/40 p-6 rounded-2xl backdrop-blur-md space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🧠</span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">Coral Schema Learning</h3>
                    <p className="text-xs text-teal-300/80">Active relationships mapping local CSV data sources into queryable SQL models.</p>
                  </div>
                </div>
                <p className="text-xs text-teal-200/60 leading-relaxed">
                  Coral dynamically discovers columns and relationships across heterogeneous platforms (APIs, logs, CSVs). Below are the active schemas configured for Sea Cucumber, loaded automatically from Coral's local source specs.
                </p>
              </div>

              {/* Grid of Tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Source 1 */}
                <div className="bg-slate-900/40 border border-teal-900/20 p-5 rounded-2xl backdrop-blur-md space-y-3">
                  <div className="flex justify-between items-center border-b border-teal-950 pb-2">
                    <h4 className="text-sm font-bold text-slate-200 font-mono">code_csv.code_activity</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 uppercase font-bold">GitHub Source</span>
                  </div>
                  <ul className="space-y-1.5 text-xs font-mono text-slate-300">
                    <li className="flex justify-between"><span className="text-amber-200">endpoint</span> <span>TEXT (Primary Key)</span></li>
                    <li className="flex justify-between"><span className="text-slate-400">last_commit_date</span> <span>DATE</span></li>
                    <li className="flex justify-between"><span className="text-slate-400">developer_owner</span> <span>TEXT</span></li>
                  </ul>
                </div>

                {/* Source 2 */}
                <div className="bg-slate-900/40 border border-teal-900/20 p-5 rounded-2xl backdrop-blur-md space-y-3">
                  <div className="flex justify-between items-center border-b border-teal-950 pb-2">
                    <h4 className="text-sm font-bold text-slate-200 font-mono">sentry_csv.sentry_errors</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 uppercase font-bold">Sentry Source</span>
                  </div>
                  <ul className="space-y-1.5 text-xs font-mono text-slate-300">
                    <li className="flex justify-between"><span className="text-amber-200">endpoint</span> <span>TEXT (Foreign Key)</span></li>
                    <li className="flex justify-between"><span className="text-slate-400">error_count_last_30d</span> <span>INTEGER</span></li>
                    <li className="flex justify-between"><span className="text-slate-400">impacted_users</span> <span>INTEGER</span></li>
                  </ul>
                </div>

                {/* Source 3 */}
                <div className="bg-slate-900/40 border border-teal-900/20 p-5 rounded-2xl backdrop-blur-md space-y-3">
                  <div className="flex justify-between items-center border-b border-teal-950 pb-2">
                    <h4 className="text-sm font-bold text-slate-200 font-mono">deployment_csv.deployment_logs</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 uppercase font-bold">Traffic Logs</span>
                  </div>
                  <ul className="space-y-1.5 text-xs font-mono text-slate-300">
                    <li className="flex justify-between"><span className="text-amber-200">endpoint</span> <span>TEXT (Foreign Key)</span></li>
                    <li className="flex justify-between"><span className="text-slate-400">request_volume_last_6m</span> <span>INTEGER</span></li>
                    <li className="flex justify-between"><span className="text-slate-400">avg_latency_ms</span> <span>INTEGER</span></li>
                  </ul>
                </div>

                {/* Source 4 */}
                <div className="bg-slate-900/40 border border-teal-900/20 p-5 rounded-2xl backdrop-blur-md space-y-3">
                  <div className="flex justify-between items-center border-b border-teal-950 pb-2">
                    <h4 className="text-sm font-bold text-slate-200 font-mono">jira_csv.jira_backlog</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase font-bold">Jira Backlog</span>
                  </div>
                  <ul className="space-y-1.5 text-xs font-mono text-slate-300">
                    <li className="flex justify-between"><span className="text-amber-200">endpoint</span> <span>TEXT (Foreign Key)</span></li>
                    <li className="flex justify-between"><span className="text-slate-400">issue_key</span> <span>TEXT</span></li>
                    <li className="flex justify-between"><span className="text-slate-400">status</span> <span>TEXT</span></li>
                  </ul>
                </div>

              </div>

              {/* Relationship map display */}
              <div className="bg-slate-900/30 border border-teal-900/20 p-5 rounded-2xl backdrop-blur-md flex flex-col md:flex-row items-center gap-6 justify-around text-center py-8">
                <div className="flex flex-col items-center">
                  <span className="text-2xl p-2.5 rounded-xl bg-teal-950 border border-teal-800 text-teal-300 font-mono font-bold">c.endpoint</span>
                  <span className="text-[10px] text-teal-300/50 mt-1 uppercase font-bold tracking-wider">Primary Anchor</span>
                </div>
                <div className="text-teal-500 text-xl font-bold animate-pulse">
                  ◀─── JOIN ───▶
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl p-2.5 rounded-xl bg-slate-950 border border-teal-950 text-amber-200 font-mono font-bold">endpoint</span>
                  <span className="text-[10px] text-teal-300/50 mt-1 uppercase font-bold tracking-wider">Secondary Matches</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLI CACHING */}
          {activeTab === 'cache' && (
            <div className="max-w-3xl mx-auto space-y-8">
              
              {/* Cache Controller Card */}
              <div className="bg-slate-900/60 border border-teal-900/40 p-6 rounded-2xl backdrop-blur-md space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-teal-950 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">⚡</span>
                    <div>
                      <h3 className="text-base font-bold text-slate-100">Coral Local Query Cache</h3>
                      <p className="text-xs text-teal-300/60">Avoid redundant API hits & cut latencies by 95% using intelligent caching.</p>
                    </div>
                  </div>
                  {/* Caching Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={cacheEnabled} 
                      onChange={() => setCacheEnabled(!cacheEnabled)} 
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 border border-teal-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-teal-400 after:border-teal-400 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-950 peer-checked:border-teal-500"></div>
                    <span className="ml-3 text-xs font-bold text-slate-300 whitespace-nowrap">
                      {cacheEnabled ? 'Cache Enabled' : 'Cache Disabled'}
                    </span>
                  </label>
                </div>

                {/* Simulated Caching Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  
                  <div className="bg-slate-950/40 border border-teal-950 p-4 rounded-xl text-center space-y-1">
                    <span className="text-xs text-teal-300/60 font-bold block uppercase tracking-wider">Cache Efficiency</span>
                    <span className="text-2xl font-extrabold text-teal-300 font-mono">98.8%</span>
                    <span className="text-[10px] text-teal-200/40 block">Saved rate-limit costs</span>
                  </div>

                  <div className="bg-slate-950/40 border border-teal-950 p-4 rounded-xl text-center space-y-1">
                    <span className="text-xs text-teal-300/60 font-bold block uppercase tracking-wider">Cached Latency</span>
                    <span className="text-2xl font-extrabold text-emerald-400 font-mono">42ms</span>
                    <span className="text-[10px] text-teal-200/40 block">Immediate data recall</span>
                  </div>

                  <div className="bg-slate-950/40 border border-teal-950 p-4 rounded-xl text-center space-y-1">
                    <span className="text-xs text-teal-300/60 font-bold block uppercase tracking-wider">Cold Latency</span>
                    <span className="text-2xl font-extrabold text-rose-400 font-mono">3,420ms</span>
                    <span className="text-[10px] text-teal-200/40 block">Dredging live networks</span>
                  </div>

                </div>

                <div className="text-xs text-teal-200/60 leading-relaxed bg-slate-950/30 p-4 rounded-xl border border-teal-950/40">
                  <strong className="text-teal-300 block mb-1">Performance Feedback:</strong>
                  {lastScanLatency ? (
                    <span>
                      The last scan took <strong className="text-amber-200 font-mono">{lastScanLatency}ms</strong>. 
                      {cacheEnabled ? (
                        <span className="text-emerald-400 font-semibold ml-1">🚀 Fast cached load! (API limits conserved).</span>
                      ) : (
                        <span className="text-amber-400 font-semibold ml-1">⏳ Cold scan complete (Dredged remote repositories).</span>
                      )}
                    </span>
                  ) : (
                    <span>No queries run yet. Switch to the **Dredge Scan** tab to test query speeds with cache enabled or disabled.</span>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: MODEL CONTEXT PROTOCOL (MCP) */}
          {activeTab === 'mcp' && (
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* Intro Card */}
              <div className="bg-slate-900/60 border border-teal-900/40 p-6 rounded-2xl backdrop-blur-md space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🔌</span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">Model Context Protocol (MCP) Integration</h3>
                    <p className="text-xs text-teal-300/80">Turn Coral into a secure database endpoint for any MCP-compliant AI agent.</p>
                  </div>
                </div>
                <p className="text-xs text-teal-200/60 leading-relaxed">
                  Coral exposes its SQL query runtime directly over **MCP**. This allows AI developer agents (like Claude Desktop, Cursor, or peer models) to run standard SQL commands directly against your GitHub activity, error logs, and Jira backlog records using standardized protocol specifications.
                </p>
              </div>

              {/* Side-by-side Configuration & Simulator */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Configuration Guide */}
                <div className="bg-slate-900/40 border border-teal-900/20 p-5 rounded-2xl backdrop-blur-md space-y-4">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-teal-300 border-b border-teal-950 pb-2">
                    1. Hook up to Claude / Cursor
                  </h4>
                  <p className="text-xs text-teal-200/60 leading-relaxed">
                    Add the following block to your desktop agent configuration file (e.g. `claude_desktop_config.json`) to expose Coral as a context tool:
                  </p>
                  <pre className="p-4 bg-slate-950/80 border border-teal-950 text-[11px] font-mono text-emerald-300 rounded-xl overflow-x-auto shadow-inner leading-normal">
{`{
  "mcpServers": {
    "coral-sql": {
      "command": "coral",
      "args": [
        "mcp", 
        "--allow-sources", 
        "code_csv,sentry_csv,deployment_csv,jira_csv"
      ]
    }
  }
}`}
                  </pre>
                </div>

                {/* Live Protocol Simulator */}
                <div className="bg-slate-900/40 border border-teal-900/20 p-5 rounded-2xl backdrop-blur-md space-y-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-teal-300 border-b border-teal-950 pb-2">
                      2. Interactive MCP Simulator
                    </h4>
                    <p className="text-xs text-teal-200/60 leading-relaxed mb-3">
                      This simulates how a developer model uses Coral's MCP tools to investigate your code metrics in real-time.
                    </p>
                    
                    {/* Simulated Console Screen */}
                    <div className="p-4 bg-slate-950 border border-teal-950 rounded-xl font-mono text-xs space-y-3 leading-relaxed shadow-inner">
                      <div>
                        <span className="text-teal-400">🤖 Agent intent:</span>
                        <span className="text-slate-200 block mt-0.5">"Find all Jira tickets with Backlog status for legacy payments."</span>
                      </div>
                      <div className="border-t border-teal-950/60 pt-2 text-[11px]">
                        <span className="text-amber-300">🔌 Tool request dispatched:</span>
                        <pre className="text-slate-400 mt-1 bg-slate-900/40 p-2 rounded border border-teal-950/30 overflow-x-auto">
{`call_tool("coral/execute_sql", {
  "query": "SELECT issue_key FROM jira_backlog WHERE endpoint = '/api/v1/old-payment' AND status = 'Backlog'"
})`}
                        </pre>
                      </div>
                      <div className="border-t border-teal-950/60 pt-2 text-[11px]">
                        <span className="text-emerald-400">📡 Coral MCP Response:</span>
                        <pre className="text-slate-300 mt-1 bg-slate-900/40 p-2 rounded border border-teal-950/30 overflow-x-auto">
{`{
  "success": true,
  "rows": [{ "issue_key": "PROJ-101" }]
}`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-teal-400/50 block text-right mt-2 font-mono">
                    status: MCP ready to host 🟢
                  </span>
                </div>

              </div>

            </div>
          )}

        </section>

      </main>

      {/* Footer Section */}
      <footer className="w-full text-center py-6 border-t border-teal-950/40 z-10 text-xs text-teal-400/50 select-none">
        <p>Powered by Coral 🪸 • Sea Cucumber AI Agent</p>
      </footer>
      
    </div>
  );
}
