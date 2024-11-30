import { DailyCall } from "@daily-co/daily-js";
import { DailyAudio } from "@daily-co/daily-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
  Loader,
} from "@repo/ui/components/ui/";
import { motion } from "framer-motion";
import { DoorOpenIcon, ScrollTextIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createRoom, dialClone } from "./api";
import { Avatar } from "./components/avatar";
import { EndResponseButton } from "./components/end-response";
import { SoundWave } from "./components/sound-wave";
import { Transcript } from "./transcript";

export function DailyRoom({
  callObject,
  setRoomUrl,
}: {
  callObject: DailyCall | null;
  setRoomUrl: (url: string) => void;
}) {
  const router = useRouter();
  const [audioIsLoading, setAudioIsLoading] = useState(true);

  const leaveRoom = () => {
    router.push("/call-complete");
  };

  useEffect(() => {
    if (!callObject) {
      return;
    }

    createRoom()
      .then(async ({ url }) => {
        await callObject.join({ url: url, startVideoOff: true });
        setRoomUrl(url);

        return url;
      })
      .then(async (url) => {
        await dialClone({ roomUrl: url });
      })
      .then(() => {
        const DELAY = 3000;
        const timeout = setTimeout(() => setAudioIsLoading(false), DELAY);

        return () => clearTimeout(timeout);
      });
  }, [callObject]);

  return (
    <div className="flex h-full w-4/5 flex-col items-center justify-center">
      <Loader isLoading={audioIsLoading} />
      <DailyAudio /> {/** <DailyAudio /> takes awhile to load */}
      {!audioIsLoading && (
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.5 }}
        >
          <div className="flex w-full flex-col items-center gap-y-2">
            <Avatar />
            <SoundWave />
            <div className="flex items-center gap-x-2">
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline">
                    <ScrollTextIcon />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="h-[75vh] p-1">
                  <DrawerTitle className="my-2 w-full text-center font-semibold">
                    Transcript
                  </DrawerTitle>
                  <div className="mx-auto my-2 w-11/12 border border-gray-300" />
                  <Transcript />
                </DrawerContent>
              </Drawer>

              <EndResponseButton />

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <DoorOpenIcon />
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Leave Room</DialogTitle>
                    <DialogDescription>
                      Satisfied with the conversation?
                    </DialogDescription>
                  </DialogHeader>
                  <Button variant="destructive" onClick={leaveRoom}>
                    Leave
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
