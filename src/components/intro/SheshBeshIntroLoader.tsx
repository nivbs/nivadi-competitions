"use client";

import dynamic from "next/dynamic";

const SheshBeshIntro = dynamic(
  () => import("./SheshBeshIntro").then((m) => m.SheshBeshIntro),
  { ssr: false },
);

export function SheshBeshIntroLoader() {
  return <SheshBeshIntro />;
}
