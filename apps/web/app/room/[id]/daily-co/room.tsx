import { DailyCall } from "@daily-co/daily-js";
import { DailyAudio } from "@daily-co/daily-react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@repo/ui/components/ui/drawer";
import { Loader } from "@repo/ui/components/ui/loader";
import { useToast } from "@repo/ui/components/ui/use-toast";
import { cn } from "@repo/ui/lib/utils";
import { addUrlToRoomInDb } from "~/app/[userAlias]/api";
import { motion } from "framer-motion";
import { DoorOpenIcon, ScrollTextIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createRoom, dialClone } from "./api";
import { Avatar } from "./components/avatar";
import { EndResponseButton } from "./components/end-response";
import { SoundWave } from "./components/sound-wave";
import { Transcript } from "./components/transcript";
import {
  SpeakingExchangeState,
  useRoomStatus,
} from "./providers/room-status-provider";

export function DailyRoom({
  roomId,
  callObject,
  setRoomUrl,
}: {
  roomId: string;
  callObject: DailyCall | null;
  setRoomUrl: (url: string) => void;
}) {
  const router = useRouter();
  const [audioIsLoading, setAudioIsLoading] = useState(true);
  const { speakingExchangeState } = useRoomStatus();
  const { toast } = useToast();

  function leaveRoom() {
    router.push("/call-complete");
  }

  useEffect(() => {
    if (!callObject) {
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then(() => createRoom())
      .then(async (roomData) => {
        const url = roomData.url;
        if (!url) {
          throw new Error("unable to construct roomData, url is undefined");
        }

        await callObject.join({ url: url, startVideoOff: true });
        setRoomUrl(url);

        return url;
      })
      .then(async (url) => {
        await addUrlToRoomInDb({ roomId, url });
        console.log("added url to db:", url);
        await dialClone({ roomUrl: url });
      })
      .then(() => {
        callObject.startRecording();
      })
      .then(() => {
        const DELAY = 3000;
        const timeout = setTimeout(() => setAudioIsLoading(false), DELAY);

        return () => clearTimeout(timeout);
      })
      .catch((err) => {
        if (err.name === "NotAllowedError") {
          toast({
            title: "Microphone access denied",
            description:
              "Unless you explicitly denied access, this usually happens on mobile devices where your browser actually does not have the necessary mic permissions. Please check your settings and try again.",
          });
          return;
        }
        toast({
          title: "Error",
          description: err as string,
        });
      });

    return () => {
      if (!callObject) {
        return;
      }
      callObject.stopRecording();
      callObject.leave();
      callObject.destroy();
    };
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
                  <Button
                    variant="outline"
                    className={cn(
                      speakingExchangeState ===
                        SpeakingExchangeState.CONVERSATION_ENDED
                        ? "bg-red-500 text-white hover:bg-red-400 hover:text-white"
                        : "",
                    )}
                  >
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
