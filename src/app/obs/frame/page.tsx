import { ObsFrame } from "@/features/obs/obs-frame";

type PageProps = {
  searchParams: Promise<{ title?: string; trans?: string }>;
};

function parseTransparentFlag(value?: string): boolean {
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

export default async function ObsFramePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const title = params.title?.trim() || "SHTX Live";
  const transparentHeaderOnly = parseTransparentFlag(params.trans);
  return (
    <ObsFrame title={title} transparentHeaderOnly={transparentHeaderOnly} />
  );
}
