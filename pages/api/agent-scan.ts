import type { NextApiRequest, NextApiResponse } from "next";
import { runPiAgentScan, PiAgentReport } from "@/lib/piAgent";

type SuccessData = {
  success: true;
  report: PiAgentReport;
};

type ErrorData = {
  success: false;
  error: string;
};

type Data = SuccessData | ErrorData;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use GET.' });
  }

  const { repoUrl } = req.query;

  try {
    const report = await runPiAgentScan(repoUrl as string);
    res.status(200).json({ success: true, report });
  } catch (error: any) {
    console.error("API Agent Scan Error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "An unexpected error occurred in the Pi Coding Agent backend." 
    });
  }
}
