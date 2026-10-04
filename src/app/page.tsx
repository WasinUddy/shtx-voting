import { getLiveAudienceState } from "@/lib/audience-state";
import { VotingBoard } from "./voting-board";

export default async function Home() {
  const initialAudience = await getLiveAudienceState();

  return (
    <main className="min-h-full flex flex-col">
      <VotingBoard initialAudience={initialAudience} />
    </main>
  );
}
