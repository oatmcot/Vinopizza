# 🍜 Siam Kitchen — Cloudflare Pages Deploy Guide

## 📁 โครงสร้างโปรเจกต์
```
restaurant-app/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx
    └── App.jsx
```

---

## 🚀 วิธี Deploy บน Cloudflare Pages (ทำครั้งเดียว)

### ขั้นตอนที่ 1 — ติดตั้ง Node.js
ดาวน์โหลดจาก https://nodejs.org (เลือก LTS)

### ขั้นตอนที่ 2 — Build โปรเจกต์
เปิด Terminal แล้วรันคำสั่งเหล่านี้:

```bash
# เข้าโฟลเดอร์โปรเจกต์
cd restaurant-app

# ติดตั้ง dependencies
npm install

# Build ไฟล์สำหรับ production
npm run build
```

จะได้โฟลเดอร์ `dist/` ที่มีไฟล์พร้อม deploy

### ขั้นตอนที่ 3 — Upload ขึ้น Cloudflare Pages
1. ไปที่ https://cloudflare.com → สมัคร/Login ฟรี
2. เลือก **Workers & Pages** จากเมนูซ้าย
3. กด **Create** → เลือกแท็บ **Pages**
4. เลือก **"Upload assets"** (ไม่ต้องใช้ GitHub)
5. ตั้งชื่อโปรเจกต์ เช่น `siam-kitchen`
6. **ลาก โฟลเดอร์ `dist/` ทั้งโฟลเดอร์** วางในช่อง Upload
7. กด **Deploy site**

✅ เสร็จแล้ว! จะได้ URL เช่น:
`https://siam-kitchen.pages.dev`

---

## 🔄 อัปเดตโค้ดในอนาคต
ทุกครั้งที่แก้ไข App.jsx ให้รัน:
```bash
npm run build
```
แล้ว upload โฟลเดอร์ `dist/` ใหม่บน Cloudflare Pages

---

## 🌐 ผูก Custom Domain (ถ้ามี)
1. ใน Cloudflare Pages → **Custom domains** → **Set up a custom domain**
2. ใส่ชื่อ domain เช่น `order.myrestaurant.com`
3. ถ้า domain อยู่ที่ Cloudflare แล้ว จะตั้งค่าให้อัตโนมัติ
4. SSL ฟรีอัตโนมัติ ✅

---

## 📱 URL แต่ละหน้าจอ (เปิดบนอุปกรณ์ต่างกัน)
| หน้าจอ | ใช้งาน |
|--------|--------|
| `https://siam-kitchen.pages.dev` | ลูกค้าสั่งอาหาร |
| กดปุ่ม "ครัว" | จอในครัว (แท็บเล็ต) |
| กดปุ่ม "แคชเชียร์" | จอแคชเชียร์ |
| กดปุ่ม "แอดมิน" รหัส: 1234 | จัดการเมนู |

---

## 💡 Tips
- เปิดหน้าเว็บบนมือถือแล้วกด "Add to Home Screen" → ใช้เหมือนแอปจริง (PWA)
- แนะนำให้พนักงานครัวใช้แท็บเล็ต เปิดค้างไว้ที่หน้า "ครัว"
- แคชเชียร์เปิดค้างไว้ที่หน้า "แคชเชียร์"
