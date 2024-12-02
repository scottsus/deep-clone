import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import Link from "next/link";

export default function CallCompletePage() {
  const email = "susantoscott@gmail.com";
  const githubUrl = "github.com/scottsus/deep-clone";

  return (
    <main className="my-auto flex flex-col items-center justify-center p-6">
      <Card className="flex size-full flex-col gap-y-3">
        <CardHeader>
          <CardTitle className="mb-3 w-full text-center">
            That&apos;s it 🏎️
          </CardTitle>
          <CardDescription className="flex flex-col items-start gap-y-3">
            <p className="pb-4 text-base">
              Hope you had fun talking to a voice clone.
            </p>
            <p className="w-full pb-1 text-center text-base">
              ⚠️ This project is still in beta.
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
              for feedback and suggestions.
            </p>
            <p>
              Alternatively, please visit{" "}
              <Link
                className="underline"
                target="_blank"
                href={`https://${githubUrl}`}
              >
                {githubUrl}
              </Link>{" "}
              to raise an issue or, better yet, contribute to the repo 🚀
            </p>
            <p>See you next time!</p>
            <p>Scott</p>

            <Link href="/" className="flex w-full justify-center">
              <Button className="w-full md:w-1/2">Back to home</Button>
            </Link>
          </CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}
