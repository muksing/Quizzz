import Link from "next/link";
import { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/SignOutButton";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/student/dashboard" className="text-lg font-bold text-slate-900">
              ARGame <span className="text-indigo-600">นักเรียน</span>
            </Link>
            <nav className="flex gap-4 text-sm font-medium text-slate-600">
              <Link href="/student/dashboard" className="hover:text-indigo-600">
                ห้องเรียนของฉัน
              </Link>
              <Link href="/student/join" className="hover:text-indigo-600">
                เข้าร่วมห้องเรียน
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{session?.user?.name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
