# 📘 NoteSYS - Advanced Note Management Web App

> Fullstack Production-Ready Application  
> **React + TypeScript + Node.js + Express + MongoDB Atlas**  
> Mobile-first • Scalable • Clean Architecture

---

## 🚀 Tổng Quan

**NoteSYS** là ứng dụng web quản lý ghi chú hiện đại với kiến trúc fullstack, được thiết kế để hỗ trợ người dùng tổ chức và quản lý ghi chú một cách hiệu quả.

### Tính Năng Chính

| Tính Năng                 | Mô Tả                                                      |
| ------------------------- | ---------------------------------------------------------- |
| 📝 **CRUD Notes**         | Tạo, đọc, cập nhật, xóa ghi chú                            |
| 📂 **Folder Management**  | Tổ chức ghi chú theo thư mục với màu sắc và icon tùy chỉnh |
| 🏷️ **Tags System**        | Gắn thẻ, gợi ý thẻ, đổi tên và xóa thẻ toàn cục            |
| ⭐ **Pin & Archive**      | Ghim ghi chú quan trọng, lưu trữ ghi chú cũ                |
| 🔍 **Full-text Search**   | Tìm kiếm với highlight từ khóa                             |
| 🌙 **Dark Mode**          | Chế độ tối với nhận diện theme hệ thống                    |
| 📱 **Responsive**         | Tối ưu cho Mobile, Tablet và Desktop                       |
| ⚡ **Performance**        | Lazy loading, code splitting, auto-save                    |
| 📊 **Statistics**         | Trang thống kê trực quan                                   |
| 🎨 **Dynamic Colors**     | Preview màu động khi tạo note/folder                       |
| ⌨️ **Keyboard Shortcuts** | Ctrl+K tìm kiếm, Ctrl+N tạo note mới                       |
| 📤 **Export**             | Xuất ghi chú sang JSON hoặc TXT                            |

---

## 🛠️ Tech Stack

### Backend

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB Atlas + Mongoose
- **Security:** Helmet, CORS, Rate Limiting, express-validator

### Frontend

- **Library:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS + Radix UI
- **State:** Zustand (UI) + TanStack Query (Server)
- **Animation:** Framer Motion

---

## 📦 Cài Đặt Local

### Yêu Cầu

- Node.js 18+
- MongoDB Atlas account (hoặc MongoDB local)

### 1. Clone Repository

```bash
git clone <repo-url>
cd NoteSYS
```

### 2. Setup Backend

```bash
cd server
npm install
```

Tạo file `.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/noteapp?retryWrites=true&w=majority
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### 3. Setup Frontend

```bash
cd ../client
npm install
```

Tạo file `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Chạy Ứng Dụng

**Terminal 1 - Backend:**

```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd client
npm run dev
```

Mở browser: http://localhost:5173

---

## 🌐 Deploy Production

### Backend → Render

1. Tạo tài khoản [Render](https://render.com)
2. New → Web Service
3. Connect repository, chọn thư mục `server`
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: `<your-mongodb-uri>`
   - `JWT_SECRET`: `<your-secret>`
   - `PORT`: `10000`

### Frontend → Vercel

1. Tạo tài khoản [Vercel](https://vercel.com)
2. Import repository, chọn thư mục `client`
3. Framework Preset: Vite
4. Environment Variables:
   - `VITE_API_URL`: `https://your-render-api.onrender.com/api`
5. Deploy

---

## 📁 Cấu Trúc Dự Án

```
NoteSYS/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── api/              # API client functions
│   │   ├── components/       # React components
│   │   │   ├── layout/       # Layout components
│   │   │   ├── notes/        # Note-related components
│   │   │   ├── folders/      # Folder components
│   │   │   └── ui/           # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   ├── store/            # Zustand stores
│   │   ├── types/            # TypeScript types
│   │   └── lib/              # Utilities
│   ├── vercel.json           # Vercel config
│   └── package.json
│
├── server/                    # Backend Node.js
│   ├── src/
│   │   ├── config/           # Database config
│   │   ├── controllers/      # Route controllers
│   │   ├── middlewares/      # Express middlewares
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── validators/       # Request validators
│   │   └── utils/            # Utilities
│   ├── render.yaml           # Render config
│   └── package.json
│
└── readme.md
```

---

## 🔧 NPM Scripts

### Server

| Command            | Mô Tả                                         |
| ------------------ | --------------------------------------------- |
| `npm start`        | Chạy production                               |
| `npm run dev`      | Chạy development với nodemon                  |
| `npm run seed`     | Tạo dữ liệu mẫu cơ bản                        |
| `npm run demoseed` | Tạo dữ liệu demo đầy đủ (20 notes, 5 folders) |
| `npm run clear`    | Xóa tất cả dữ liệu                            |

### Client

| Command           | Mô Tả                    |
| ----------------- | ------------------------ |
| `npm run dev`     | Chạy development server  |
| `npm run build`   | Build production         |
| `npm run preview` | Preview production build |
| `npm run lint`    | Kiểm tra lỗi ESLint      |

---

## 📱 API Endpoints

### Notes

- `GET /api/notes` - Lấy danh sách notes (hỗ trợ pagination, filter)
- `GET /api/notes/:id` - Lấy note theo ID
- `POST /api/notes` - Tạo note mới
- `PUT /api/notes/:id` - Cập nhật note
- `DELETE /api/notes/:id` - Xóa note
- `GET /api/notes/tags/all` - Lấy tất cả tags
- `PUT /api/notes/:id/duplicate` - Nhân bản note
- `PUT /api/notes/tags/rename` - Đổi tên tag toàn cục
- `DELETE /api/notes/tags/:tag` - Xóa tag khỏi tất cả notes

### Folders

- `GET /api/folders` - Lấy danh sách folders
- `GET /api/folders/:id` - Lấy folder theo ID
- `POST /api/folders` - Tạo folder mới
- `PUT /api/folders/:id` - Cập nhật folder
- `DELETE /api/folders/:id` - Xóa folder
- `PUT /api/folders/reorder` - Sắp xếp lại thứ tự folders

---

## ⌨️ Keyboard Shortcuts

| Phím Tắt   | Hành Động          |
| ---------- | ------------------ |
| `Ctrl + K` | Mở tìm kiếm        |
| `Ctrl + N` | Tạo ghi chú mới    |
| `Escape`   | Đóng modal/sidebar |

---

## 🎨 Tính Năng UI/UX

- **Auto-save:** Tự động lưu sau 2 giây ngừng gõ
- **Toast Notifications:** Thông báo thành công/lỗi
- **Confirm Dialogs:** Xác nhận trước khi xóa
- **Copy Protection:** Chặn copy ngoài vùng nội dung note
- **Compact/Grid View:** Chuyển đổi chế độ hiển thị
- **Highlight Search:** Tô sáng từ khóa tìm kiếm
- **Tag Suggestions:** Gợi ý tag khi nhập
- **Icon Picker:** Chọn icon cho folder
- **Dynamic Color Preview:** Xem trước màu khi chọn

---

## 📄 License

MIT License - Sử dụng tự do cho mục đích học tập và phát triển.

---

## 👨‍💻 Author

Developed with ❤️ for modern note-taking experience.
