import { DailyRoom as Room } from "./daily-co";

export default async function RoomPage() {
  return (
    <main className="flex size-full flex-1 flex-col items-center justify-center gap-y-6">
      <Room />
    </main>
  );
}
