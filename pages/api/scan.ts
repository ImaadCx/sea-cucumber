import type { NextApiRequest, NextApiResponse } from "next";
import { runCoralQuery, parseCoralOutput, ScanResult } from "@/lib/coralRunner";

type SuccessData = {
  success: true;
  results: ScanResult[];
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

  try {
    const rawOutput = await runCoralQuery();
    const results = parseCoralOutput(rawOutput);
    res.status(200).json({ success: true, results });
  } catch (error: any) {
    console.error("API Scan Error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "An unexpected error occurred while executing the Coral query." 
    });
  }
}
