import Gate from "./gate";

export default function UserAliasPage({
  params,
}: {
  params: { userAlias: string };
}) {
  return (
    <main className="flex size-full flex-1 flex-col items-center justify-center gap-y-6">
      <Gate userAlias={params.userAlias} />
    </main>
  );
}
