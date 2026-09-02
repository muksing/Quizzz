"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
    >
      ออกจากระบบ
    </button>
  );
}
