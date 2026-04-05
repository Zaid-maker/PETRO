import { getPetroDashboardData } from "@/lib/petro-data";

export async function GET() {
  const data = await getPetroDashboardData();
  return Response.json(data);
}
