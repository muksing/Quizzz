import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserTable } from "@/components/admin/UserTable";

export default async function AdminUsersPage() {
  const session = await auth();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { classesTaught: true, classMemberships: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">ผู้ใช้งาน</h1>
        <p className="mt-1 text-sm text-slate-500">ทั้งหมด {users.length} บัญชี</p>
      </div>

      <UserTable
        currentUserId={session!.user.id}
        users={users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt.toISOString(),
          classesTaughtCount: u._count.classesTaught,
          classMembershipsCount: u._count.classMemberships,
        }))}
      />
    </div>
  );
}
