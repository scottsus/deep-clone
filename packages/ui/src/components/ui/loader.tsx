"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { PuffLoader } from "react-spinners";

export function Loader({ isLoading }: { isLoading: boolean }) {
  const [isComplete, setIsComplete] = useState(false);

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!isLoading) {
      const audio = new Audio("/sounds/success.mp3");
      audio.play();
      timeout = setTimeout(() => {
        setIsComplete(true);
      }, 2000);
    }

    return () => clearTimeout(timeout);
  }, [isLoading]);

  if (isComplete) {
    return <></>;
  }
  return (
    <div className="absolute z-50 my-auto flex h-[80vh] w-full items-center justify-center bg-inherit bg-white">
      {isLoading ? (
        <PuffLoader color="grey" />
      ) : (
        <motion.div
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
        >
          <DotLottieReact
            src="https://lottie.host/91050fe5-c8a2-41bf-9367-1a9d794685cb/M62E0ulXj8.lottie"
            autoplay
            className="m-auto size-3/4 md:size-full"
            speed={1.5}
          />
        </motion.div>
      )}
    </div>
  );
}
