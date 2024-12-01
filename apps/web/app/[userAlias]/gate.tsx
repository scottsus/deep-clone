"use client";

import { Prisma, type Clone } from "@prisma/client";
import { Button, Checkbox } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { SparklesIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { createRoomInDb } from "./api";

export default function Gate({ clone }: { clone: Clone }) {
  const router = useRouter();
  const [acknowledged, setAcknowledged] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!acknowledged) {
      toast.error("Please acknowledge the terms first.");
      return;
    }

    const firstName = e.currentTarget.firstName.value as string;
    const lastName = e.currentTarget.lastName.value as string;

    const guest: Prisma.GuestCreateInput = {
      firstName,
      lastName,
    };

    const roomId = await createRoomInDb({
      userAlias: clone.userAlias,
      guest,
    });

    router.push(`/room/${roomId}`);
  };

  return (
    <form className="flex w-4/5 flex-col gap-y-2 md:w-1/3" onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Hello there 👋</CardTitle>
          <CardDescription className="flex flex-col gap-y-4 pb-3 pt-6">
            <p>
              {clone.firstName} greets you virtually through his AI voice-clone.
            </p>
            <p>
              The agent you are about to converse with has the voice of{" "}
              {clone.firstName}, which has been fine tuned with audio samples
              provided by {clone.firstName}, with consent.
            </p>
            <p>
              Moreover, this clone was fed with information by {clone.firstName}{" "}
              and was programmed to talk about specific areas of interest,
              mainly including 💼 professional experiences, 🪂 personal hobbies,
              and information on 🍻 specific friends.
            </p>
            <p>
              Obviously, nothing that the clone says is legally binding, and if
              there are any errors, please take it with a grain of salt.
            </p>

            <div className="flex flex-row items-center gap-x-2">
              <Checkbox
                id="acknowledge"
                checked={acknowledged}
                onCheckedChange={(ack) =>
                  setAcknowledged(ack === "indeterminate" ? false : ack)
                }
              />
              <label htmlFor="acknowledge">C&apos;mon man I understand</label>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-y-4">
          <div className="flex flex-row items-center gap-x-4">
            <div className="flex w-1/2 flex-col gap-y-2">
              <input
                type="text"
                id="firstName"
                className="w-full rounded-md border border-gray-300 px-3 py-1 shadow-sm"
                placeholder="First"
                required
              />
            </div>
            <div className="flex w-1/2 flex-col gap-y-2">
              <input
                type="text"
                id="lastName"
                className="w-full rounded-md border border-gray-300 px-3 py-1 shadow-sm"
                placeholder="Last"
                required
              />
            </div>
          </div>
          <Button className="flex items-center gap-x-1">
            Let&apos;s chat <SparklesIcon size={16} />
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
