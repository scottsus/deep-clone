import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/card";
import { FlameIcon, MicIcon, MousePointerClickIcon } from "lucide-react";
import Link from "next/link";

export default function CallCompletePage() {
  const email = "susantoscott@gmail.com";
  const githubUrl = "github.com/scottsus/deep-clone";

  return (
    <TooltipProvider>
      <main className="my-auto flex flex-col items-center justify-center p-6">
        <Card className="flex h-full w-1/2 flex-col gap-y-3">
          <CardHeader>
            <CardTitle className="mb-3 w-full">That&apos;s it 🏎️</CardTitle>
            <CardDescription className="flex flex-col items-start gap-y-3">
              <p className="mt-2 text-base">
                Hope it was fun talking to a voice clone
              </p>
              <p>
                Please reach out to{" "}
                <Link
                  className="underline"
                  target="_blank"
                  href={`mailto: ${email}`}
                >
                  {email}{" "}
                </Link>
                for feedback and suggestions. Alternatively, please visit{" "}
                <Link
                  className="underline"
                  target="_blank"
                  href={`https://${githubUrl}`}
                >
                  {githubUrl}
                </Link>{" "}
                to raise an issue or, better yet, contribute to the repo 🚀
              </p>

              <p className="mt-2 text-center text-base">
                Check out some of the projects mentioned in the chat
              </p>
              <div className="mx-auto my-3 flex gap-x-4 transition-all">
                <Tooltip>
                  <TooltipTrigger>
                    <Link
                      target="_blank"
                      href="https://github.com/scottsus/surf"
                    >
                      <MousePointerClickIcon
                        size={42}
                        className="hover:text-blue-400"
                      />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent className="bg-primary p-3 text-white">
                    🏄‍♂️ Surf
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    <Link
                      target="_blank"
                      href="https://github.com/scottsus/deep-clone"
                    >
                      <MicIcon size={42} className="hover:text-yellow-400" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent className="bg-primary p-3 text-white">
                    🎙️ Deep Clone
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    <Link
                      target="_blank"
                      href="https://github.com/scottsus/flamethrower"
                    >
                      <FlameIcon size={42} className="hover:text-orange-500" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent className="bg-primary p-3 text-white">
                    🔥 flamethrower
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="mt-2 text-base">If you got all the way here...</p>
              <p>
                Wanna work together?{" "}
                <Link
                  className="text-blue-400 underline hover:brightness-125"
                  href="https://calendly.com/scottsus"
                >
                  Let&apos;s chat
                </Link>
              </p>
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    </TooltipProvider>
  );
}
