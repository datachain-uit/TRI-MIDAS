"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleNavigate = (route: string) => {
    router.push(route);
  };

  return (
    <div className="flex min-h-screen bg-black text-white font-sans h-screen overflow-hidden bg-[image:var(--background-gradient)] dark">
      <Sidebar />

      <main className=" relative flex-1 flex flex-col">
        <Image
          src="https://res.cloudinary.com/dpqv7ag5w/image/upload/v1765893126/Mask_group_bzkusm.png"
          alt="Hero background"
          fill
          priority
          className="object-contain object-left-bottom absolute z-0 pointer-events-none"
        />
        <header className="relative z-10 flex justify-end items-center p-6 gap-6  pb-4">
          <div className="flex bg-zinc-900 rounded-full p-1">
            <Button
              variant="ghost"
              onClick={() => {
                handleNavigate("/about-us");
              }}
              className="rounded-full px-6 hover:text-primary "
            >
              About Us
            </Button>
          </div>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>User</AvatarFallback>
          </Avatar>
        </header>

        <div className="relative z-10 p-16 pb-4 pt-0 overflow-y-auto flex-1 
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-zinc-800
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700"
        >
          {children}
        </div>
      </main>
    </div>
  );
}
