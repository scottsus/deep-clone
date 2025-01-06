import { redirect } from "next/navigation";

import { getClone } from "./api";
import Gate from "./gate";

export default async function UserAliasPage({
  params,
}: {
  params: { userAlias: string };
}) {
  const { userAlias } = params;
  const clone = await getClone({ userAlias });

  return (
    <main className="flex size-full flex-1 flex-col items-center justify-center gap-y-6">
      {clone ? (
        <Gate clone={clone} />
      ) : (
        <h3>
          Unable to find clone
          <span className="text-red-400"> {userAlias} </span>☹ are you sure you
          have the correct link?
        </h3>
      )}
    </main>
  );
}
