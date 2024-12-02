"use client";

import { Button } from "@repo/ui/components/ui/button";
import dynamic from "next/dynamic";
import Link from "next/link";

import Demo from "./vad";

export default function HomePage() {
  return (
    <main className="flex size-full flex-1 flex-col items-center justify-center gap-y-6">
      <h1 className="text-xl font-semibold">Greetings from Deep Clone 🎙</h1>
      <Link href="/scottsus">
        <Button>Speak with Scott&apos;s clone</Button>
      </Link>
      <Demo />
    </main>
  );
}
