"use client";

import FingerprintJS from "@fingerprintjs/fingerprintjs";

let visitorIdPromise: Promise<string> | undefined;

export function getVisitorId(): Promise<string> {
  if (!visitorIdPromise) {
    visitorIdPromise = FingerprintJS.load()
      .then((agent) => agent.get())
      .then((result) => result.visitorId);
  }
  return visitorIdPromise;
}
