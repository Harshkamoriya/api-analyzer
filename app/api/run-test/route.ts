import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOptimizationTips } from '@/lib/gemini';
import axios from 'axios';
import { NextRequest } from 'next/server';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  console.log("[DEBUG] Received POST request");

  try {
    const body = await req.json();
    console.log("[DEBUG] Parsed request body:", body);

    const { url, method } = body;

    const { userId } = await auth();
    console.log("[DEBUG] Auth userId:", userId);

    if (!userId) {
      console.log("[DEBUG] Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const latencies: number[] = [];
    const statusCounts: Record<string, number> = {};

    for (let i = 0; i < 5; i++) {
      console.log(`[DEBUG] Sending request #${i+1} to URL: ${url} with method: ${method}`);
      try {
        const start = Date.now();
        const res = await axios({ url, method: method || 'GET' });
        const latency = Date.now() - start;

        console.log(`[DEBUG] Request #${i+1} latency: ${latency} ms, status: ${res.status}`);

        latencies.push(latency);
        const status = res.status.toString();
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      } catch (axiosError) {
        console.error(`[ERROR] Axios request failed on try #${i+1}:`, axiosError);
        // Optionally push a large latency to keep array length same
        latencies.push(0);
        statusCounts['error'] = (statusCounts['error'] || 0) + 1;
      }
    }

    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const min = Math.min(...latencies);
    const max = Math.max(...latencies);

    console.log("[DEBUG] Latency stats => Avg:", avg, "Min:", min, "Max:", max);
    console.log("[DEBUG] Status counts:", statusCounts);

    // Generate AI tips
  const prompt = `
I tested ${method} ${url} 5 times.
Avg latency: ${avg} ms, min: ${min} ms, max: ${max} ms, status codes: ${JSON.stringify(statusCounts)}.

Suggest *brief* API optimization tips in **short bullet points** (one line each). 
Highlight the most important points, use ✅, ⚡, 🧠 etc. Avoid long paragraphs.
Only return the tips, no introduction or conclusion.
`;
console.log("[DEBUG] AI Prompt:", prompt);


    let tips = "";
    try {
      tips = await getOptimizationTips(prompt);
      console.log("[DEBUG] AI Tips generated:", tips);
    } catch (aiError) {
      console.error("[ERROR] Failed to get AI tips:", aiError);
      tips = "Could not generate optimization tips due to an error.";
    }

    // Save to DB
const existingUser = await prisma.user.findUnique({ where: { id: userId } });
if (!existingUser) {
  console.log("[DEBUG] User does not exist in DB; creating...");
  // Get email from Clerk if you want:
  const clerkUser = await clerkClient.users.getUser(userId);
  await prisma.user.create({
    data: {
      id: userId,
      email: clerkUser.emailAddresses[0].emailAddress // or ''
    }
  });
}

    console.log("[DEBUG] Saving test run to DB...");
    const testRun = await prisma.testRun.create({
      data: {
        url,
        method,
        avgLatency: avg,
        minLatency: min,
        maxLatency: max,
        statusCodes: statusCounts,
        aiTips: tips,
        userId
      }
    });

    console.log("[DEBUG] Test run saved successfully:", testRun);

    return NextResponse.json(testRun);
  } catch (err) {
    console.error("[ERROR] Failed to test API:", err);
    return NextResponse.json({ error: 'Failed to test API' }, { status: 500 });
  }
}
