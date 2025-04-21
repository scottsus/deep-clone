import { GithubIcon, HouseIcon } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  return (
    <div className="flex w-5/6 items-center justify-between p-6">
      <Link href="/" className="cursor-pointer transition-all hover:opacity-80">
        <HouseIcon size={36} />
      </Link>
      <Link
        className="cursor-pointer transition-all hover:opacity-80"
        href="https://github.com/scottsus/deep-clone"
        target="_blank"
      >
        <GithubIcon size={36} />
      </Link>
    </div>
  );
}
