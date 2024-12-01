import { Button } from "@repo/ui/components/ui/button";
import Link from "next/link";

export default async function HomePage() {
  return (
    <main className="flex size-full flex-1 flex-col items-center justify-center gap-y-6">
      <h1 className="text-xl font-semibold">Greetings from Deep Clone 🎙</h1>
      <Button className="w-4/5">
        <Link href="/scottsus">Speak with Scott&apos;s clone</Link>
      </Button>
    </main>
  );
}
