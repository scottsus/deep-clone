"use client";

import {
  Button,
  DrawerContent,
  DrawerTrigger,
} from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Drawer } from "@repo/ui/components/ui/drawer";
import { Loader } from "@repo/ui/components/ui/loader";

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

      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">Open Drawer</Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="h-[50vh] w-full"></div>
        </DrawerContent>
      </Drawer>

      <Loader isLoading={false} />
    </main>
  );
}
