"use client";

import dynamic from "next/dynamic";

const Demo = dynamic(() => import("./vad"), { ssr: false });

export default async function HomePage() {
  return (
    <main className="flex size-full flex-1 flex-col items-center justify-center gap-y-6">
      <h1 className="text-xl font-semibold">Greetings from Deep Clone 🎙</h1>
      <Demo />
    </main>
  );
}
