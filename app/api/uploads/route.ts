import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin, AR_ASSETS_BUCKET } from "@/lib/supabase-admin";

const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25MB, enough for a compressed .glb
const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "model/gltf-binary",
  "application/octet-stream", // .glb / .mind often reported as this
];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 25MB)" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const allowedExt = ["png", "jpg", "jpeg", "webp", "glb", "gltf", "mind"];
  if (!allowedExt.includes(ext) && !ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "ชนิดไฟล์ไม่รองรับ" }, { status: 400 });
  }

  const path = `${session.user.id}/${Date.now()}-${crypto.randomUUID()}.${ext || "bin"}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  let supabaseAdmin;
  try {
    supabaseAdmin = getSupabaseAdmin();
  } catch {
    return NextResponse.json(
      { error: "เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า Supabase Storage" },
      { status: 500 }
    );
  }
  const { error } = await supabaseAdmin.storage
    .from(AR_ASSETS_BUCKET)
    .upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: "อัปโหลดไฟล์ไม่สำเร็จ: " + error.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabaseAdmin.storage.from(AR_ASSETS_BUCKET).getPublicUrl(path);

  return NextResponse.json({ url: publicUrlData.publicUrl, path }, { status: 201 });
}
