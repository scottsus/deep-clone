import Image from "next/image";
import Link from "next/link";
import github from "public/github.svg";

// @TODO: use Shadcn
export function Navbar() {
  return (
    <div className="flex w-5/6 items-center justify-between p-6">
      <Link
        className="cursor-pointer transition-all hover:opacity-80"
        href="https://github.com/scottsus/deep-clone"
        target="_blank"
      >
        <Image src={github} alt="GitHub" width={50} height={50} />
      </Link>
    </div>
  );
}
