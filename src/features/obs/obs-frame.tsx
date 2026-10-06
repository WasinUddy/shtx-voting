"use client";

import { TitleBar } from "@/features/xp/window";
import "@/features/obs/obs.css";

type ObsFrameProps = {
  title: string;
  transparentHeaderOnly?: boolean;
};

export function ObsFrame({
  title,
  transparentHeaderOnly = false,
}: ObsFrameProps) {
  if (transparentHeaderOnly) {
    return (
      <div
        className="obs-root obs-root--fill obs-frame-trans"
        data-obs="frame"
        data-trans="true"
      >
        <div className="obs-frame-trans__shell">
          <TitleBar title={title} />
        </div>
      </div>
    );
  }

  return (
    <div className="obs-root obs-root--fill" data-obs="frame" data-trans="false">
      <div className="xp-window xp-window--maximized obs-window--fill obs-frame-window">
        <TitleBar title={title} />
        <div className="xp-client obs-frame-client" data-obs="frame-client" />
      </div>
    </div>
  );
}
