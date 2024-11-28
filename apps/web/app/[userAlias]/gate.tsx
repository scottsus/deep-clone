"use client";

import { Prisma } from "@prisma/client";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { SparkleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

import { createRoomInDb } from "./api";

export default function Gate({ userAlias }: { userAlias: string }) {
  const router = useRouter();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const firstName: string = e.currentTarget.firstName.value ?? "John";
    const lastName: string = e.currentTarget.lastName.value ?? "Doe";

    const guest: Prisma.GuestCreateInput = {
      firstName,
      lastName,
    };

    const roomId = await createRoomInDb({
      userAlias,
      guest,
    });

    router.push(`/room/${roomId}`);
  };

  return (
    <form className="flex w-4/5 flex-col gap-y-2" onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Greetings from {userAlias} 👋</CardTitle>
          <CardDescription>
            This is an AI speaking with the voice of {userAlias}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-y-3">
          <div className="flex flex-row items-center gap-x-4">
            <div className="flex w-1/2 flex-col gap-y-2">
              <input
                type="text"
                id="firstName"
                className="w-full rounded-md border border-gray-300 px-3 py-1 shadow-sm"
                placeholder="First"
              />
            </div>
            <div className="flex w-1/2 flex-col gap-y-2">
              <input
                type="text"
                id="lastName"
                className="w-full rounded-md border border-gray-300 px-3 py-1 shadow-sm"
                placeholder="Last"
              />
            </div>
          </div>
          <Button className="flex items-center gap-x-1">
            Let&apos;s chat <SparkleIcon size={16} />
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
