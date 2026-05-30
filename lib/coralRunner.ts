import { execFile } from 'child_process';
import path from 'path';

export interface ScanResult {
  endpoint: string;
  last_commit_date: string;
  sentry_errors: number;
  request_volume: number;
  jira_ticket: string;
  jira_status: string | null;
  recommendation: string;
}

export const MOCK_CORAL_OUTPUT = `endpoint | last_commit_date | sentry_errors | request_volume | jira_ticket | jira_status | recommendation
---------+------------------+---------------+----------------+-------------+-------------+---------------
/api/v1/legacy-search | 2022-11-30 | 0 | 0 | No Jira tasks | | 🦴 BARNACLE - Safe to Remove
/api/v1/old-payment | 2023-06-01 | 2 | 15 | PROJ-101 | Backlog | 🦴 BARNACLE - Safe to Remove
/api/v1/report-export | 2024-02-15 | 3 | 45 | No Jira tasks | | ⚠️ LOW ACTIVITY - Consider Deprecation
/api/v1/user-auth | 2025-05-20 | 1547 | 985432 | PROJ-202 | In Progress | ✅ ACTIVE
/api/v2/checkout | 2025-05-19 | 892 | 345672 | PROJ-303 | To Do | ✅ ACTIVE`;

/**
 * Executes the SQL query stored in lib/query.sql using the Coral CLI.
 * If Coral is unavailable, it automatically falls back to mock data.
 */
export function runCoralQuery(): Promise<string> {
  return new Promise((resolve, reject) => {
    const queryPath = path.join(process.cwd(), 'lib', 'query.sql');

    execFile('coral', ['sql', '-f', queryPath], (error, stdout, stderr) => {
      if (error) {
        const isCliNotFoundError = (error as any).code === 'ENOENT';
        const isDev = process.env.NODE_ENV === 'development';
        const isVercel = !!process.env.VERCEL;

        // Fallback to mock data if in dev mode, deployed on Vercel, or CLI is not installed
        if (isDev || isVercel || isCliNotFoundError) {
          console.warn(`Coral CLI not available (${error.message}). Falling back to mock data.`);
          return resolve(MOCK_CORAL_OUTPUT);
        }

        return reject(new Error(stderr || error.message));
      }
      resolve(stdout);
    });
  });
}

/**
 * Parses Coral's pipe-delimited text output into a list of ScanResult objects.
 */
export function parseCoralOutput(output: string): ScanResult[] {
  if (!output || !output.trim()) {
    return [];
  }

  // Split by line and filter out carriage returns
  const lines = output.split('\n').map(line => line.replace('\r', ''));
  
  // Skip the first two lines (header & separator dashed line)
  const dataLines = lines.slice(2);

  const results: ScanResult[] = [];

  for (const line of dataLines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      continue;
    }

    // Split by pipe character |
    const cells = trimmedLine.split('|').map(cell => cell.trim());
    
    // Ensure we have enough columns to form a result
    if (cells.length < 7) {
      continue;
    }

    const [
      endpoint,
      last_commit_date,
      sentry_errors_str,
      request_volume_str,
      jira_ticket,
      jira_status_str,
      recommendation
    ] = cells;

    results.push({
      endpoint,
      last_commit_date,
      sentry_errors: parseInt(sentry_errors_str, 10) || 0,
      request_volume: parseInt(request_volume_str, 10) || 0,
      jira_ticket: jira_ticket || 'No Jira tasks',
      jira_status: jira_status_str === '' ? null : jira_status_str,
      recommendation
    });
  }

  return results;
}
