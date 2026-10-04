import { getLiveAudienceState } from "@/lib/audience-state";
import { VotingBoard } from "@/features/voting/components/voting-board";

export default async function Home() {
  const initialAudience = await getLiveAudienceState();

  return (
    <main className="h-full min-h-full flex flex-1 flex-col">
      <VotingBoard initialAudience={initialAudience} />
    </main>
  );
}
