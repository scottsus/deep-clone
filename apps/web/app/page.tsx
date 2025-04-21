import { Button } from "@repo/ui/components/ui/button";
import { MicIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  return (
    <main className="flex size-full flex-1 flex-col items-center justify-center gap-y-6">
      <div className="flex items-center gap-x-1">
        <MicIcon size={40} />
        <h1 className="text-4xl font-semibold">Deep Clone</h1>
      </div>
      <p className="mx-auto w-5/6 text-center md:w-1/2">
        What you&apos;re about to hear may sound like Scott, have knowledge
        about Scott, and was in fact created by Scott, but is NOT Scott -
        it&apos;s just a clone. Anything I promise cannot be used against me,
        except the promise of{" "}
        <Link
          className="text-blue-400 underline hover:brightness-125"
          target="_blank"
          href="https://calendly.com/scottsus"
        >
          scheduling a call
        </Link>{" "}
        with the real Scott.
      </p>
      <Link className="mt-4" href="/scottsus">
        <Button className="flex items-center gap-x-2">
          <SparklesIcon />
          <p>Speak with Scott</p>
        </Button>
      </Link>
    </main>
  );
}
