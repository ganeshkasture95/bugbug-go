// app/api/reports/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const report = await prisma.report.create({
      data: {
        title: data.title,
        description: data.description,
        severity: data.severity,
        researcherId: data.researcherId,
        programId: data.programId,
      }
    });
    return new Response(JSON.stringify(report), { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return new Response(JSON.stringify({ error: "Failed to create report" }), { status: 500 });
  }
}
