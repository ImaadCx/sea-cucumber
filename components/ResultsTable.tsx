import React, { useState } from 'react';
import { ScanResult } from '@/lib/coralRunner';

interface ResultsTableProps {
  results: ScanResult[];
}

export default function ResultsTable({ results }: ResultsTableProps) {
  const [copied, setCopied] = useState(false);
  const [repoPath, setRepoPath] = useState('your-org/your-repo');

  const getRecommendationBadge = (rec: string) => {
    const uppercaseRec = rec.toUpperCase();
    if (uppercaseRec.includes('BARNACLE')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/80 shadow-[0_0_10px_rgba(244,63,94,0.15)] animate-pulse">
          🦴 BARNACLE - Safe to Remove
        </span>
      );
    } else if (uppercaseRec.includes('LOW ACTIVITY')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/80 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
          ⚠️ LOW ACTIVITY - Consider Deprecation
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
          ✅ ACTIVE
        </span>
      );
    }
  };

  const generateMarkdownReport = () => {
    let md = `# Sea Cucumber - Barnacle Scan Report 🥒🌊\n\n`;
    md += `*Generated on: ${new Date().toLocaleDateString()}*\n\n`;
    md += `| Endpoint | Last Commit | Sentry Errors (30d) | Request Volume (6m) | Jira Ticket | Status | Recommendation |\n`;
    md += `| :--- | :--- | :---: | :---: | :--- | :--- | :--- |\n`;
    
    results.forEach(row => {
      md += `| \`${row.endpoint}\` | ${row.last_commit_date} | ${row.sentry_errors} | ${row.request_volume} | ${row.jira_ticket} | ${row.jira_status || 'N/A'} | ${row.recommendation} |\n`;
    });
    
    return md;
  };

  const handleCopyReport = async () => {
    const markdown = generateMarkdownReport();
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getGithubIssueUrl = (row: ScanResult) => {
    const title = `Deprecate Endpoint: ${row.endpoint}`;
    const body = `## Deprecation Proposal: Dead API Endpoint ("Barnacle") 🦴

This endpoint has been identified by the **Sea Cucumber AI Agent** using a multi-source Coral SQL analysis. It has been flagged as a dead or low-activity endpoint that is safe to remove.

### Evidence Gathered:
- **Endpoint:** \`${row.endpoint}\`
- **Last Commit Date:** \`${row.last_commit_date}\` (No activity since)
- **Sentry Errors (Last 30 days):** \`${row.sentry_errors}\`
- **Request Volume (Last 6 months):** \`${row.request_volume}\`
- **Jira Backlog Task:** \`${row.jira_ticket}\` (Status: \`${row.jira_status || 'N/A'}\`)
- **Current Status:** ${row.recommendation}

### Proposed Action:
1. Deprecate and remove routes/controllers for \`${row.endpoint}\`.
2. Scrape off associated tests and dead configurations.
3. Clean up the codebase to improve maintainability.

*Report compiled by Sea Cucumber 🥒🌊*`;

    return `https://github.com/${repoPath}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  };

  if (results.length === 0) {
    return (
      <div className="text-center p-8 bg-slate-900/60 border border-teal-900/40 rounded-2xl backdrop-blur-md">
        <p className="text-teal-200">No endpoints found in the codebase records.</p>
      </div>
    );
  }

  // Count barnacles vs active
  const barnacleCount = results.filter(r => r.recommendation.toUpperCase().includes('BARNACLE')).length;
  const warningCount = results.filter(r => r.recommendation.toUpperCase().includes('LOW ACTIVITY')).length;

  return (
    <div className="w-full space-y-6">
      {/* Table Action Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900/60 border border-teal-900/40 p-5 rounded-2xl backdrop-blur-md">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span>Scan Results</span>
            <span className="text-sm font-normal text-teal-300">
              ({results.length} scanned • {barnacleCount} barnacles 🦴 • {warningCount} low-activity ⚠️)
            </span>
          </h3>
          <p className="text-xs text-teal-200/60 mt-1">Surfaced dead endpoints by joining GitHub, Sentry, Logs, and Jira.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Target Repo Input */}
          <div className="flex items-center gap-2 bg-slate-950/60 border border-teal-950 rounded-lg px-3 py-2 shrink-0">
            <span className="text-[10px] uppercase font-bold text-teal-400/80 whitespace-nowrap">Target Repo:</span>
            <input
              type="text"
              value={repoPath}
              onChange={(e) => setRepoPath(e.target.value)}
              placeholder="owner/repo"
              className="bg-transparent text-xs text-amber-200/90 font-mono focus:outline-none w-36 border-none p-0 focus:ring-0"
              title="GitHub repository path for filing deprecation issues"
            />
          </div>
          <button
            onClick={handleCopyReport}
          className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-lg border border-amber-500/30 text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/30 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.05)] cursor-pointer"
        >
          {copied ? (
            <>
              <span>Copied!</span>
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </>
          ) : (
            <>
              <span>Copy Report (Markdown)</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-teal-900/40 bg-slate-900/40 backdrop-blur-md">
        <table className="w-full min-w-[950px] text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/80 border-b border-teal-950 text-xs font-semibold text-teal-300 tracking-wider uppercase">
              <th className="p-4">Endpoint</th>
              <th className="p-4">Last Commit</th>
              <th className="p-4 text-center">Sentry Errors (30d)</th>
              <th className="p-4 text-center">Request Volume (6m)</th>
              <th className="p-4">Jira Ticket</th>
              <th className="p-4">Recommendation</th>
              <th className="p-4 text-right w-[140px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-teal-950/40 text-sm text-slate-200">
            {results.map((row, idx) => {
              const isBarnacle = row.recommendation.toUpperCase().includes('BARNACLE');
              return (
                <tr key={idx} className="hover:bg-slate-800/25 transition-colors duration-200">
                  <td className="p-4 font-mono text-xs text-amber-200/90 max-w-[200px] truncate" title={row.endpoint}>
                    {row.endpoint}
                  </td>
                  <td className="p-4 text-slate-300 whitespace-nowrap">{row.last_commit_date}</td>
                  <td className="p-4 text-center font-mono text-slate-300">{row.sentry_errors}</td>
                  <td className="p-4 text-center font-mono text-slate-300">{row.request_volume.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-200">{row.jira_ticket}</span>
                      {row.jira_status && (
                        <span className="text-xs text-teal-300/70">{row.jira_status}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">{getRecommendationBadge(row.recommendation)}</td>
                  <td className="p-4 text-right whitespace-nowrap">
                    {isBarnacle && (
                      <a
                        href={getGithubIssueUrl(row)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 hover:text-rose-100 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-400/50 shadow-sm transition-all duration-300"
                      >
                        <span>Scrape Off</span>
                        <span>🏴‍☠️</span>
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked View */}
      <div className="md:hidden space-y-4">
        {results.map((row, idx) => {
          const isBarnacle = row.recommendation.toUpperCase().includes('BARNACLE');
          return (
            <div key={idx} className="bg-slate-900/40 border border-teal-900/30 p-5 rounded-2xl backdrop-blur-md space-y-4">
              <div className="flex justify-between items-start gap-2">
                <span className="font-mono text-xs font-bold text-amber-200/90 break-all">{row.endpoint}</span>
                <span className="shrink-0">{getRecommendationBadge(row.recommendation)}</span>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs border-t border-b border-teal-950/40 py-3">
                <div>
                  <span className="text-teal-300/60 block">Last Commit:</span>
                  <span className="text-slate-300 font-semibold">{row.last_commit_date}</span>
                </div>
                <div>
                  <span className="text-teal-300/60 block">Jira Ticket:</span>
                  <span className="text-slate-300 font-semibold">
                    {row.jira_ticket} {row.jira_status ? `(${row.jira_status})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-teal-300/60 block">Sentry Errors:</span>
                  <span className="text-slate-300 font-mono font-semibold">{row.sentry_errors}</span>
                </div>
                <div>
                  <span className="text-teal-300/60 block">Request Volume (6m):</span>
                  <span className="text-slate-300 font-mono font-semibold">{row.request_volume.toLocaleString()}</span>
                </div>
              </div>

              {isBarnacle && (
                <div className="pt-1">
                  <a
                    href={getGithubIssueUrl(row)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-rose-300 hover:text-rose-100 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-400/50 shadow-sm transition-all duration-300"
                  >
                    <span>Scrape Off Endpoint</span>
                    <span>🏴‍☠️</span>
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
