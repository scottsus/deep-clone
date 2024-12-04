import { redirect } from "next/navigation";

import { getClone } from "./api";
import Gate from "./gate";

export default async function UserAliasPage({
  params,
}: {
  params: { userAlias: string };
}) {
  const clone = await getClone({ userAlias: params.userAlias });
  if (!clone) {
    redirect("/error");
  }

  return (
    <main className="flex size-full flex-1 flex-col items-center justify-center gap-y-6">
      <Gate clone={clone} />
    </main>
  );
}
