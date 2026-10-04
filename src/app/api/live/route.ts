import { getLiveAudienceState } from "@/lib/audience-state";
import { subscribeAudience } from "@/lib/live-events";
import { createSseResponse } from "@/lib/sse";

export const dynamic = "force-dynamic";

export async function GET() {
  const initial = await getLiveAudienceState();
  return createSseResponse((send) => subscribeAudience(send), initial);
}
