import { ObsFrame } from "@/features/obs/obs-frame";

type PageProps = {
  searchParams: Promise<{ title?: string }>;
};

export default async function ObsFramePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const title = params.title?.trim() || "SHTX Live";
  return <ObsFrame title={title} />;
}
