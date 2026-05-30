import { runCoralQuery, parseCoralOutput } from './coralRunner';

export interface AgentRefactoringProposal {
  endpoint: string;
  evidence: string;
  refactoring_plan: string;
  risk_level: 'High' | 'Medium' | 'Low';
}

export interface PiAgentReport {
  success: boolean;
  isSimulated: boolean;
  agentName: string;
  llmBackend: string;
  findingsSummary: string;
  refactoringProposals: AgentRefactoringProposal[];
}

/**
 * Runs the Pi Coding Agent using NVIDIA NIM API as the LLM backend.
 * Synthesizes Coral SQL data and generates refactoring delete proposals.
 */
export async function runPiAgentScan(repoUrl?: string): Promise<PiAgentReport> {
  const apiKey = process.env.NVIDIA_API_KEY;
  const modelName = 'qwen/qwen3-coder-480b-a35b-instruct';
  const isSimulated = !apiKey;

  // 1. Fetch raw Coral SQL metrics
  const rawCoralOutput = await runCoralQuery();
  const parsedResults = parseCoralOutput(rawCoralOutput);

  if (isSimulated) {
    // Return high-fidelity simulated response matching NVIDIA NIM Qwen3-Coder reasoning
    return {
      success: true,
      isSimulated: true,
      agentName: 'Pi Coding Agent',
      llmBackend: `NVIDIA NIM (${modelName})`,
      findingsSummary: 'Pi Coding Agent successfully connected to the local Coral SQL engine. Cross-referenced codebase activity with production deployment logs, active Sentry issues, and Jira tickets. Surfaced 2 critical dead endpoints ("barnacles") and 1 low-activity path. Proposing immediate deletion plans.',
      refactoringProposals: [
        {
          endpoint: '/api/v1/legacy-search',
          evidence: 'Last commit date is 2022-11-30. Request logs show exactly 0 requests over the last 6 months. Sentry logs indicate 0 errors. There are no associated Jira backlogs. This is a classic barnacle path.',
          refactoring_plan: '1. Delete route controller at `pages/api/v1/legacy-search.ts`.\n2. Scrape off legacy search helpers in `lib/search/legacy.ts`.\n3. Delete associated integration test suite in `__tests__/legacy-search.test.ts`.',
          risk_level: 'Low'
        },
        {
          endpoint: '/api/v1/old-payment',
          evidence: 'Last commit is 2023-06-01. request volume is extremely low (15 hits in 6 months). Surfaced 2 active Sentry errors. Linked to task PROJ-101 (Status: Backlog). Code has been fully replaced by `/api/v2/checkout`.',
          refactoring_plan: '1. Add a HTTP 410 Gone status or redirect to `/api/v2/checkout` in `next.config.js`.\n2. Delete legacy stripes controller at `pages/api/v1/old-payment.ts`.\n3. Clean up the deprecated Stripe legacy integration module in `lib/payments/stripe-legacy.ts`.',
          risk_level: 'Medium'
        },
        {
          endpoint: '/api/v1/report-export',
          evidence: 'Last commit is 2024-02-15. Request volume is low (45 hits in 6 months) with 3 Sentry errors. No active Jira tickets. Deemed a low-activity endpoint in transition.',
          refactoring_plan: '1. Flag as deprecated by returning a `Warning: 299 - Deprecated API` HTTP header.\n2. Set up telemetry logging to track remaining client integrations.\n3. Plan full code deletion in next sprint cycle.',
          risk_level: 'Low'
        }
      ]
    };
  }

  // 2. Real NVIDIA NIM API call
  try {
    const prompt = `You are the Pi Coding Agent, an autonomous developer AI assistant. Your task is to analyze API endpoint records surfaced by the Coral SQL query engine and propose a refactoring plan to delete dead endpoints ("barnacles").
    
Below is the SQL-joined data from Coral showing endpoint metrics:
${JSON.stringify(parsedResults, null, 2)}

Please write an analysis of these endpoints. For each endpoint flagged as "BARNACLE" or "LOW ACTIVITY", provide:
1. Evidence gathered (citing Sentry errors, last commit date, request volumes, and Jira status).
2. A step-by-step refactoring plan to delete or deprecate the endpoint from a Next.js codebase.
3. A risk assessment (High/Medium/Low).

Return your response in standard JSON format:
{
  "findingsSummary": "A general summary of the codebase dredge findings...",
  "refactoringProposals": [
    {
      "endpoint": "/api/path",
      "evidence": "Detailed explanation of the metrics...",
      "refactoring_plan": "Step-by-step refactoring instructions...",
      "risk_level": "Low"
    }
  ]
}`;

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`NVIDIA NIM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const agentContent = JSON.parse(data.choices[0].message.content);

    return {
      success: true,
      isSimulated: false,
      agentName: 'Pi Coding Agent',
      llmBackend: `NVIDIA NIM (${modelName})`,
      findingsSummary: agentContent.findingsSummary || 'Analysis complete.',
      refactoringProposals: agentContent.refactoringProposals || []
    };

  } catch (error: any) {
    console.error('Pi Agent NVIDIA NIM error:', error);
    throw error;
  }
}
