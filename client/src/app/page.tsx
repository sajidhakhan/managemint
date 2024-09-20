import Image from "next/image";
import HomePage from "./home/page";

export default function Home() {
  return (
    <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
      <HomePage />
    </main>
  );
}
