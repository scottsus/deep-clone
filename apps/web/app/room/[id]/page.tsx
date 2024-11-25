import { DailyRoom as Room } from "./daily-co";

export default async function RoomPage() {
  return (
    <main className="flex w-full flex-1 flex-col items-center justify-center gap-y-6 overflow-auto">
      <Room />
    </main>
  );
}
