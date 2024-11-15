import Link from "next/link";

export function Footer() {
  return (
    <div className="mb-0 mt-auto flex h-28 items-center">
      <p className="text-gray-500">
        Built by{" "}
        <Link
          href="https://github.com/scottsus"
          className="text-black underline-offset-2 transition-all hover:underline"
          target="_blank"
        >
          @scottsus
        </Link>{" "}
        in San Francisco.
      </p>
    </div>
  );
}
