import { db } from "@repo/db";

export default async function GreetPage() {
  const user = await db.user.findFirst();

  return (
    <div>
      <h1>Hello {user?.name}</h1>
    </div>
  );
}
