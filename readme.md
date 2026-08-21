# 📘 NoteSYS v2 - Advanced Note Management Web App with AI

> Fullstack Production-Ready Application  
> **React + TypeScript + Node.js + Express + MongoDB Atlas + Supabase (pgvector)**  
> Mobile-first • Scalable • Clean Architecture • AI-Powered

---

## 🚀 Tổng Quan (Có gì mới trong v2?)

**NoteSYS v2** là bản nâng cấp lớn của ứng dụng quản lý ghi chú, bổ sung thêm hệ thống tài khoản người dùng, cơ chế bảo mật toàn diện và trợ lý AI thông minh giúp bạn tìm kiếm, tương tác với ghi chú thông qua hội thoại (Chatbot).

### Các Tính Năng Mới Nổi Bật (v2)

| Tính Năng Mới             | Mô Tả                                                      |
| ------------------------- | ---------------------------------------------------------- |
| 🤖 **AI Assistant**       | Chatbot AI thông minh (tích hợp Grok/OpenRouter) có khả năng hiểu ngữ cảnh và trả lời câu hỏi dựa trên nội dung ghi chú. |
| 🔐 **Authentication**     | Đăng ký, đăng nhập an toàn bằng JWT. Hỗ trợ phân quyền người dùng (User/Admin). |
| 🛡️ **Protected Routes**   | Bảo mật các trang nội bộ, tự động điều hướng người dùng chưa đăng nhập. |
| 📥 **Import/Export**      | Dễ dàng nhập (Import) và xuất (Export) ghi chú ra định dạng JSON/TXT. |
| 🌐 **Đa Ngôn Ngữ (i18n)** | Hỗ trợ chuyển đổi ngôn ngữ linh hoạt.                      |
| 🧠 **Vector Search**      | Tìm kiếm ngữ nghĩa (Semantic Search) sử dụng công nghệ nhúng (Embeddings) lưu trữ trên Supabase (pgvector). |

### Tính Năng Cơ Bản (Kế thừa v1)

| Tính Năng                 | Mô Tả                                                      |
| ------------------------- | ---------------------------------------------------------- |
| 📝 **CRUD Notes**         | Tạo, đọc, cập nhật, xóa ghi chú                            |
| 📂 **Folder Management**  | Tổ chức ghi chú theo thư mục với màu sắc và icon tùy chỉnh |
| 🏷️ **Tags System**        | Gắn thẻ, gợi ý thẻ, đổi tên và xóa thẻ toàn cục            |
| ⭐ **Pin & Archive**      | Ghim ghi chú quan trọng, lưu trữ ghi chú cũ                |
| 🔍 **Full-text Search**   | Tìm kiếm với highlight từ khóa                             |
| 🌙 **Dark Mode**          | Chế độ tối với nhận diện theme hệ thống                    |

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Primary Database:** MongoDB Atlas + Mongoose (Lưu trữ dữ liệu chính)
- **Vector Database:** Supabase + PostgreSQL (pgvector) (Lưu trữ vector cho AI)
- **AI Integration:** Grok API / OpenRouter (LLM & Embeddings)
- **Security:** JWT Authentication, Helmet, CORS, Rate Limiting, express-validator

### Frontend
- **Library:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS + Radix UI
- **State:** Zustand (UI & Auth) + TanStack Query (Server)
- **Animation:** Framer Motion

---

## 📦 Cài Đặt Local

### Yêu Cầu
- Node.js 18+
- MongoDB Atlas account (hoặc MongoDB local)
- Supabase account (Database PostgreSQL hỗ trợ pgvector)

### 1. Clone Repository
```bash
git clone https://github.com/TranDucAnh3103/note.git
cd note
```

### 2. Setup Backend
```bash
cd server
npm install
```

Tạo file `.env` (dựa trên `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/noteapp?retryWrites=true&w=majority
JWT_SECRET=your-secret-key
NODE_ENV=development

# --- AI & Vector DB Config ---
SUPABASE_HOST=your-supabase-host
SUPABASE_PORT=5432
SUPABASE_DB=postgres
SUPABASE_USER=postgres
SUPABASE_PASSWORD=your-supabase-password

OPENROUTER_EMBED_KEY=your-openrouter-key
GROK_API_KEY=your-grok-key
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

### 4. Chạy Ứng Dụng bằng Script Tự Động
Ở thư mục gốc của project, bạn có thể chạy file bat để khởi động cả 2 server cùng lúc (trên Windows):
```bash
start.bat
```
Hoặc mở 2 terminal chạy lệnh `npm run dev` ở từng thư mục `client` và `server`.
Mở browser: http://localhost:5173

---

## 🌐 Deploy Production tự động (CI/CD)

Dự án đã được cấu hình sẵn để triển khai tự động (Continuous Deployment) thông qua GitHub.

### Backend → Render (Tự động)
Dự án có sẵn file `render.yaml` cấu hình Infrastructure-as-Code:
1. Truy cập [Render](https://render.com), chọn **New → Blueprint**.
2. Kết nối tới Repository này.
3. Render sẽ tự nhận diện toàn bộ cấu hình.
4. Bạn chỉ cần nhập các biến môi trường nhạy cảm: `MONGO_URI`, các cấu hình `SUPABASE_*` và `API KEY` của AI.

### Frontend → Vercel (Tự động)
Dự án có sẵn file `vercel.json` phục vụ định tuyến React:
1. Truy cập [Vercel](https://vercel.com), thêm Project mới.
2. Import repository này.
3. Chỉnh sửa **Root Directory** thành thư mục `client`.
4. Thêm biến môi trường: `VITE_API_URL` bằng URL của backend trên Render (thêm hậu tố `/api`).
5. Deploy.

Sau khi thiết lập, mọi commit đẩy lên nhánh `main` / `master` sẽ tự động trigger build và deploy bản mới nhất!

---

## 📁 Cấu Trúc Dự Án Mới

```
NoteSYS/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── api/              # Chứa file gọi API (auth.ts, ai.ts...)
│   │   ├── components/       # Các thành phần UI (có thêm FloatingChat, ProtectRoute...)
│   │   ├── hooks/            # Custom hooks (có thêm useI18n.ts)
│   │   ├── pages/            # Trang hiển thị (Login, Register, Admin...)
│   │   ├── store/            # State management (authStore...)
│   │   └── utils/            # Tiện ích (importNote, exportNote...)
│   ├── vercel.json           # Cấu hình deploy Vercel
│   └── package.json
│
├── server/                    # Backend Node.js
│   ├── src/
│   │   ├── ai/               # AI Agents, Tools, và Providers (Grok, OpenRouter)
│   │   ├── config/           # Cấu hình DB, Supabase, Môi trường
│   │   ├── controllers/      # Xử lý logic API (auth, ai, notes...)
│   │   ├── middlewares/      # Interceptors (xác thực token jwt)
│   │   ├── models/           # Mongoose schemas (User, Note...)
│   │   ├── routes/           # Định tuyến API
│   │   └── services/         # Logic phức tạp (Embedding Service)
│   ├── migrate-v2.js         # Script đồng bộ dữ liệu v1 sang v2
│   ├── render.yaml           # Cấu hình tự động deploy Render
│   └── package.json
│
├── start.bat                  # Script chạy nhanh project
└── readme.md
```

---

## 📱 API Endpoints (Mới trong v2)

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập (trả về JWT)
- `GET /api/auth/me` - Lấy thông tin người dùng hiện tại

### AI Assistant
- `POST /api/ai/chat` - Gửi tin nhắn cho AI Agent để phân tích, tìm kiếm ghi chú (Sử dụng Grok + Vector Search)

*(Các API về Notes, Folders vẫn được giữ nguyên như v1 nhưng được bổ sung Middleware kiểm tra xác thực User)*

---

## 📄 License
MIT License - Sử dụng tự do cho mục đích học tập và phát triển.

## 👨‍💻 Author
Developed with ❤️ by **TranDucAnh3103** - Cập nhật cho trải nghiệm ghi chú hiện đại & thông minh.
