# ARGame

เว็บแอปให้ครูออกแบบเกม AR หลากหลายรูปแบบ (Marker, Location/GPS, Image Target, Face Filter) แล้วให้นักเรียนเปิดกล้องมือถือ/เว็บเข้าเล่นได้ทันที

Stack: Next.js (App Router) + TypeScript + Prisma + Supabase (PostgreSQL + Storage) + NextAuth · deploy บน Vercel

## 1. ตั้งค่า Supabase

1. สร้างโปรเจกต์ใหม่ที่ [supabase.com](https://supabase.com)
2. ไปที่ **Project Settings → Database** คัดลอก connection string สองแบบมาใส่ใน `.env`:
   - `DATABASE_URL` — ใช้ connection pooling (พอร์ต 6543, `?pgbouncer=true`) สำหรับแอปตอนรันจริง
   - `DIRECT_URL` — connection ตรง (พอร์ต 5432) ใช้ตอนรัน `prisma migrate` เท่านั้น
3. ไปที่ **Project Settings → API** คัดลอก:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (เก็บเป็นความลับ ห้าม expose ฝั่ง client)
4. ไปที่ **Storage** สร้าง bucket ชื่อ `ar-assets` แล้วตั้งเป็น **Public bucket** (ให้ browser โหลดไฟล์ marker/โมเดล 3D/รูปภาพได้โดยตรง)

คัดลอก `.env.example` เป็น `.env` แล้วกรอกค่าทั้งหมดข้างต้น พร้อมสร้าง `AUTH_SECRET` ด้วยคำสั่ง:

```bash
npx auth secret
```

## 2. ติดตั้งและรันฐานข้อมูล

```bash
npm install
npm run db:migrate   # สร้างตารางใน Supabase Postgres ตาม prisma/schema.prisma
npm run db:seed      # สร้างบัญชีครูตัวอย่าง teacher@example.com / password123
```

## 3. รันเว็บแอปตอนพัฒนา

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) — ฟีเจอร์กล้อง/GPS ในเบราว์เซอร์อนุญาตให้ใช้งานได้บน `localhost` โดยไม่ต้องมี HTTPS

## 4. Deploy ขึ้น Vercel

1. Push โค้ดขึ้น GitHub แล้ว import โปรเจกต์เข้า [Vercel](https://vercel.com/new)
2. ตั้งค่า Environment Variables ใน Vercel project settings ให้ตรงกับ `.env` ทุกตัว (`DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`, `AUTH_SECRET`)
3. Deploy — Vercel ให้ HTTPS อัตโนมัติต่อโดเมน ทำให้เบราว์เซอร์ขอสิทธิ์กล้อง/ตำแหน่งได้ทันที (การเล่น AR **ต้องใช้ HTTPS หรือ localhost เท่านั้น** ตามข้อกำหนดของเบราว์เซอร์)
4. รัน migration กับฐานข้อมูล production ครั้งแรกด้วย `npx prisma migrate deploy` (รันจากเครื่อง dev โดยชี้ `.env` ไปที่ Supabase project เดียวกับที่ Vercel ใช้)

## รูปแบบ AR ที่รองรับ

| ประเภท | เทคโนโลยี | วิธีใช้งานของครู |
| --- | --- | --- |
| Marker | AR.js (A-Frame) | เลือกมาร์กเกอร์สำเร็จรูป (Hiro/Kanji), บาร์โค้ดเลข 0-99, หรืออัปโหลดแพทเทิร์น `.patt` ที่กำหนดเอง |
| Location (GPS) | Geolocation API | ปักพิกัด lat/lng และรัศมีที่ถือว่าถึงจุด |
| Image Target | MindAR | อัปโหลดไฟล์ `.mind` ที่คอมไพล์จากภาพ ผ่าน [MindAR Image Target Compiler](https://hiukim.github.io/mind-ar-js-doc/tools/compile) |
| Face Filter | MindAR (face tracking) | เลือกตำแหน่งบนใบหน้า (หน้าผาก/จมูก/คาง/แก้ม) |

แต่ละด่าน (Station) แนบเนื้อหาได้ 4 แบบ: ข้อความ, รูปภาพ, โมเดล 3D (`.glb`), หรือคำถามแบบเลือกตอบ

## โครงสร้างโปรเจกต์ที่สำคัญ

- `prisma/schema.prisma` — โครงสร้างฐานข้อมูล (User, ClassRoom, Game, Station, Attempt)
- `app/teacher/**` — แดชบอร์ดครู, จัดการห้องเรียน, ตัวแก้ไขเกม, ผลคะแนน
- `app/student/**` — เข้าร่วมห้องเรียน, เลือกเกมเล่น
- `app/play/[gameId]` — หน้าเล่นเกม AR จริงผ่านกล้อง
- `components/ar/**` — ตัวเรนเดอร์ AR แต่ละโหมด (Marker/Location/ImageTarget/FaceFilter)
- `app/api/**` — REST API routes (auth, classes, games, stations, uploads, attempts)
