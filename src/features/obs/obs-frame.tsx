"use client";

import { TitleBar } from "@/features/xp/window";
import "@/features/obs/obs.css";

type ObsFrameProps = {
  title: string;
};

export function ObsFrame({ title }: ObsFrameProps) {
  return (
    <div className="obs-root obs-root--frame" data-obs="frame">
      <div className="xp-window xp-window--maximized obs-frame-window">
        <TitleBar title={title} />
        <div className="xp-client obs-frame-client" data-obs="frame-client" />
      </div>
    </div>
  );
}
