import { DailyRoomWithProviders as Room } from "./daily-co";

export default async function RoomPage() {
  return (
    <main className="flex h-1/2 w-full flex-1 flex-col items-center justify-center overflow-auto">
      <Room />
    </main>
  );
}
