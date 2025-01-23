import Link from "next/link";
import Image from "next/image";
import UniDeFAILogo from "./assets/unidefai-logo.png";

export const Logo = () => {
  const logoSize = 75
  return (
    <div className="flex flex-row items-center ">
      <div className="relative w-12 h-12 rounded-full flex mt-3  items-center justify-center hover:bg-gray-500 hover:bg-opacity-10 lg:hidden">
        <Link href={`/home`} aria-label="Twitter" className="">
        <Image src={UniDeFAILogo} alt="UniDeFAI Logo" width={logoSize} height={logoSize} />
        </Link>
      </div>
      <div
        className={`relative hidden lg:flex gap-4 py-3 px-4 rounded-full hover:bg-gray-500 hover:bg-opacity-10 cursor-pointer items-center`}
      >
        <Link href={`/home`} aria-label="Twitter" className="">
        <Image src={UniDeFAILogo} alt="UniDeFAI Logo" width={logoSize} height={logoSize} />
        </Link>
      </div>
    </div>
  );
};
