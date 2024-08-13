import Image from "next/image";
import Link from "next/link";

function HeaderLogo() {
  return (
    <Link href="/">
      <div className="items-center hidden lg:flex">
        <Image src="/logo.svg" alt="Logo" width={28} height={282} />
        <p className="font-semibold text-white text-2xl ml-2.5">Trackity</p>
      </div>
    </Link>
  );
}

export default HeaderLogo;
