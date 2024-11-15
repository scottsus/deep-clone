import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";

export default function HomePage() {
  return (
    <main className="flex size-full flex-1 flex-col items-center justify-center gap-y-6">
      <h1>Hello there Shadcn 👋</h1>

      <Card className="w-1/4">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>

      <Button>Button</Button>
    </main>
  );
}
