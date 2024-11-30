"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function MicrophoneFrequency({ audioTrack }: { audioTrack: any }) {
  const streamRef = useRef<MediaStream>();

  const ranges = useMemo(
    () => [
      { min: 85, max: 200 }, // Low range
      { min: 200, max: 400 }, // Low range
      { min: 400, max: 700 }, // Mid range
      { min: 700, max: 900 }, // High range
      { min: 900, max: 1100 }, // High range
    ],
    [],
  );
  const [progressRange, setProgressRange] = useState([0, 0, 0, 0, 0]);

  const setProgressAtRange = useCallback((index: number, volume: number) => {
    setProgressRange((prevProgressRange) => {
      let newProgressRange = [...prevProgressRange];
      newProgressRange[index] = volume;

      return newProgressRange;
    });
  }, []);

  const audioAnalyser = useCallback(
    (stream: MediaStream) => {
      let animationFrameId: number;
      const audioContext = new AudioContext();

      const trackFilters: any = {};
      const trackAnalysers: any = {};

      const setupTrack = (track: MediaStreamTrack) => {
        const microphone = audioContext.createMediaStreamSource(stream);
        const filters = ranges.map((range) => {
          const bandpassFilter = audioContext.createBiquadFilter();
          bandpassFilter.type = "bandpass";
          bandpassFilter.frequency.value = (range.min + range.max) / 2;
          bandpassFilter.Q.value = 1;
          return bandpassFilter;
        });
        if (filters.length === 0 || !filters[0]) {
          return;
        }

        microphone.connect(filters[0]);
        filters.forEach((filter, i) => {
          const nextFilter = filters[i + 1];
          if (nextFilter) {
            filter.connect(nextFilter);
          }
        });

        const analysers: any = filters.map((filter) => {
          const analyser = audioContext.createAnalyser();
          filter.connect(analyser);
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.3;
          return analyser;
        });

        trackFilters[track.id] = filters;
        trackAnalysers[track.id] = analysers;
      };

      stream.onaddtrack = (event) => {
        console.log("Track added:", event.track);
        setupTrack(event.track);
      };

      stream.onremovetrack = (event) => {
        console.log("Track removed:", event.track);
        const { filters, analysers } = trackFilters[event.track.id];
        filters.forEach((filter: any) => filter.disconnect());
        analysers.forEach((analyser: any) => {
          analyser.disconnect();
        });
        delete trackFilters[event.track.id];
        delete trackAnalysers[event.track.id];
      };

      stream.getTracks().forEach(setupTrack);

      const updateProgress = () => {
        Object.values(trackAnalysers).forEach((analysers: any) => {
          analysers.forEach((analyser: any, index: any) => {
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);

            let sum = dataArray.reduce((acc, val) => acc + val, 0);
            let volume = sum / bufferLength;
            setProgressAtRange(index, volume);
          });
        });

        animationFrameId = requestAnimationFrame(updateProgress);
      };

      updateProgress();

      return () => {
        cancelAnimationFrame(animationFrameId);
        stream.getTracks().forEach((track) => {
          const { filters, analysers } = trackFilters[track.id];
          if (!filters) return;
          filters.forEach((filter: any) => filter.disconnect());
          analysers.forEach((analyser: any) => analyser.disconnect());
        });
        audioContext.close();
      };
    },
    [ranges, setProgressAtRange],
  );

  useEffect(() => {}, [audioTrack]);

  useEffect(() => {
    let cleanupFn: ReturnType<typeof audioAnalyser>;
    const raw = audioTrack.track;
    if (!raw) return;
    streamRef.current = new MediaStream();
    streamRef.current.getTracks().forEach((track) => {
      streamRef.current!.removeTrack(track);
    });
    streamRef.current.addTrack(raw);

    if (streamRef.current) {
      cleanupFn = audioAnalyser(streamRef.current);
    }

    return () => {
      if (cleanupFn) cleanupFn();
    };
  }, [audioAnalyser, streamRef, audioTrack]);

  return (
    <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full p-4">
      <div className="flex h-full w-full items-center justify-center space-x-[6px]">
        {progressRange.reverse().map((progress, index) => (
          <div
            key={index}
            className="w-3 rounded-md bg-green-300 shadow-2xl"
            style={{
              height: `${Math.min(Math.max(progress * 2.8, 8), 100)}%`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
