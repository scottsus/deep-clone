import { db } from "@repo/db";

export default async function HomePage() {
  const user = await db.user.findFirst();

  return (
    <main className="flex size-full flex-1 flex-col items-center justify-center gap-y-6">
      <h1>Hello there {user?.name || "Mr. Noname"} 👋</h1>
    </main>
  );
}
