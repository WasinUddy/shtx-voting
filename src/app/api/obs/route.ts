import { getObsState } from "@/lib/obs-state";
import { subscribeObsState } from "@/lib/live-events";
import { createSseResponse } from "@/lib/sse";

export const dynamic = "force-dynamic";

export async function GET() {
  const initial = await getObsState();
  return createSseResponse((send) => subscribeObsState(send), initial);
}
