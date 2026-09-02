"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = "ADMIN" | "TEACHER" | "STUDENT";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  classesTaughtCount: number;
  classMembershipsCount: number;
};

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "ผู้ดูแลระบบ",
  TEACHER: "ครู",
  STUDENT: "นักเรียน",
};

export function UserTable({ users, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function changeRole(id: string, role: Role) {
    setBusyId(id);
    setError(null);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setBusyId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "เปลี่ยนสิทธิ์ไม่สำเร็จ");
      return;
    }
    router.refresh();
  }

  async function deleteUser(id: string, name: string) {
    if (!confirm(`ลบบัญชี "${name}" ถาวร? ห้องเรียน/เกม/ผลคะแนนที่เกี่ยวข้องจะถูกลบด้วย`)) return;
    setBusyId(id);
    setError(null);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "ลบไม่สำเร็จ");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/80">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-slate-900 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">ชื่อ</th>
              <th className="px-4 py-2">อีเมล</th>
              <th className="px-4 py-2">บทบาท</th>
              <th className="px-4 py-2">กิจกรรม</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-2 font-medium text-slate-100">
                  {u.name} {u.id === currentUserId && <span className="text-xs text-slate-500">(คุณ)</span>}
                </td>
                <td className="px-4 py-2 text-slate-400">{u.email}</td>
                <td className="px-4 py-2">
                  <select
                    value={u.role}
                    disabled={busyId === u.id}
                    onChange={(e) => changeRole(u.id, e.target.value as Role)}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-100"
                  >
                    {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABEL[r]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2 text-slate-400">
                  {u.role === "TEACHER" && `${u.classesTaughtCount} ห้องเรียน`}
                  {u.role === "STUDENT" && `${u.classMembershipsCount} ห้องเรียนที่เข้าร่วม`}
                  {u.role === "ADMIN" && "—"}
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    disabled={busyId === u.id || u.id === currentUserId}
                    onClick={() => deleteUser(u.id, u.name)}
                    className="btn-danger px-3 py-1 text-xs"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  ไม่มีผู้ใช้งาน
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
