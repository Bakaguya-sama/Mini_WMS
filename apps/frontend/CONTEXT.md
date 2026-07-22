# 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)

- **Tên dự án:** Mini Warehouse Management System (Mini WMS).
- **Bối cảnh:** Phát triển giải pháp CRM tối ưu hóa việc theo dõi kiện hàng và dòng tiền tại chuỗi kho vận hiện đại.
- **Mục tiêu Frontend:** Xây dựng trang quản trị UI đa dạng trực quan, đầy đủ tính năng. Đặc biệt đối với Dashboard, cần ưu tiên tính chính xác của số liệu, KHÔNG cần đồ thị phức tạp.
- **Tech Stack:** React, TypeScript, Vite, TailwindCSS, Zustand (auth state), Axios, React Query, shadcn/ui.
- **Nguồn API duy nhất:** File `api-docs.json` đính kèm (lấy trực tiếp từ endpoint `/api-docs.json` của backend đang chạy). Agent PHẢI đọc file này trước khi code bất kỳ tính năng nào — không tự suy đoán field hay endpoint không có trong spec.

---

# 2. BUSINESS LOGIC & PHÂN QUYỀN (RBAC)

Hệ thống dùng JWT & RBAC nghiêm ngặt. Giao diện phải ẩn/hiện dựa trên `role` của user đăng nhập.

- **ADMIN:**
  - Toàn quyền quản lý tất cả kho hàng, không giới hạn khu vực.
  - Quản trị nhân sự: thêm, sửa, khóa/mở khóa, xóa, điều chuyển Manager/Staff giữa các kho.
  - Báo cáo tài chính: xem tổng thu chi toàn hệ thống hoặc lọc theo từng kho cụ thể.

- **MANAGER:**
  - Chỉ thao tác trên kho được chỉ định (`warehouseId` gắn với tài khoản), bị chặn truy cập kho khác.
  - Quản lý Staff thuộc kho của mình: thêm, sửa, khóa/mở khóa.
  - Được phép sửa thông tin (tên) kho của chính mình (`PATCH /warehouses/:id`).
  - Thống kê: chỉ xem số kiện hàng và tổng tiền thu được của kho mình quản lý.

- **STAFF:**
  - Chỉ xem danh sách và tổng số kiện hàng trong kho đang trực thuộc.
  - Chỉ được cập nhật **trạng thái** (`status`) của kiện hàng — KHÔNG được sửa `code`, `price`, `warehouseId`.
  - Không xem được doanh thu, dữ liệu nhân sự, hay dữ liệu kho khác.

**Quan trọng — BE tự động scope dữ liệu:** Với mọi API danh sách (`GET /packages`, `GET /users`, `GET /dashboard/*`), backend TỰ ĐỘNG giới hạn kết quả theo `warehouseId`/`role` của user đăng nhập (Manager/Staff gọi API không cần tự truyền `warehouseId`, backend tự ép). FE KHÔNG cần tự lọc lại dữ liệu ở client — chỉ cần gọi đúng API, ẩn/hiện input filter theo role cho đúng UX.

---

# 3. RESPONSE ENVELOPE & ERROR HANDLING (BẮT BUỘC ĐỌC KỸ)

Mọi response từ API đều theo 2 dạng cố định sau — `axiosClient.ts` và mọi hook phải xử lý đúng theo đây:

**Thành công:**

```json
{ "success": true, "data": { ... } }
```

**Lỗi (dạng PHẲNG, không lồng object `error`):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid input data",
  "stack": null
}
```

Quy tắc xử lý lỗi trong `axiosClient.ts`:

- Interceptor lấy `error.response.data.message` để hiển thị toast — KHÔNG dùng `error.response.data.error.message` (cấu trúc lồng này không tồn tại trong API thật).
- `statusCode` dùng để phân loại xử lý đặc biệt: `401` → clear auth state + redirect `/login`; `403` → toast "Không đủ quyền"; `409` → tùy ngữ cảnh (xem mục Optimistic Locking).
- Field `stack` chỉ có giá trị khi backend chạy `development`, luôn `null` ở production — KHÔNG hiển thị cho người dùng cuối.

---

# 4. OPTIMISTIC LOCKING — PACKAGE UPDATE (QUAN TRỌNG, DỄ BỊ BỎ SÓT)

- Mọi `PackageResponse` trả về đều có field `version` (integer).
- `PATCH /packages/{id}` yêu cầu **bắt buộc** gửi kèm `version` trong body — lấy từ lần fetch/query gần nhất của chính package đó, KHÔNG hardcode hay tự đoán.
- Nếu response trả về lỗi `409` (`statusCode: 409`, message dạng "Version conflict..."):
  - Hiển thị toast: "Dữ liệu đã được cập nhật bởi người khác, đang tải lại..."
  - Gọi `queryClient.invalidateQueries` cho package đó để lấy `version` mới nhất.
  - KHÔNG tự động retry request cũ với `version` cũ.
- Áp dụng React Query pattern: giữ `version` trong cache qua `useQuery`, khi mutate luôn lấy `version` mới nhất từ cache tại thời điểm submit (không giữ state cục bộ riêng dễ bị stale).

---

# 5. AUTH & TOKEN HANDLING (httpOnly Cookie cho refresh token)

- `POST /auth/login` — trả về `accessToken` (hết hạn sau 15 phút) + `user` trong response body. `refreshToken` (hết hạn sau 7 ngày, single-use rotation) được server set qua header `Set-Cookie` (`HttpOnly`, `Secure`, `SameSite=None`) — **KHÔNG xuất hiện trong response body**, JS không đọc được, FE không cần và không thể tự lưu nó.
- `POST /auth/refresh` — KHÔNG cần body, KHÔNG cần header `Authorization`. Browser tự động đính kèm cookie `refreshToken` (điều kiện: request phải gửi kèm `withCredentials: true`). Trả về `accessToken` MỚI trong body; server tự set cookie `refreshToken` mới qua `Set-Cookie` (rotation — cookie cũ bị vô hiệu hóa ngay sau khi dùng).
- `POST /auth/logout` — CẦN Bearer `accessToken`. Server vô hiệu hóa refresh token phía DB và trả `Set-Cookie` với `Max-Age=0` để xóa cookie khỏi trình duyệt.
- **Cấu hình bắt buộc ở `axiosClient.ts`:**

```ts
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // BẮT BUỘC — nếu thiếu, browser sẽ KHÔNG gửi/nhận cookie refreshToken
});
```

- **axiosClient interceptor (bắt buộc implement đúng luồng này):**
  1. Request interceptor: gắn `Authorization: Bearer <accessToken>` từ `authStore` vào mọi request (trừ `/auth/login`, `/auth/refresh`).
  2. Response interceptor: khi nhận `401` từ 1 request bất kỳ (không phải chính request `/auth/refresh`) VÀ request đó chưa từng retry (đánh dấu qua `config._retry`):
     - Gọi `POST /auth/refresh` — KHÔNG cần truyền gì, cookie tự động gửi kèm.
     - Nếu thành công: cập nhật `accessToken` mới vào store, gắn `_retry = true`, retry lại request gốc đúng 1 lần.
     - Nếu `/auth/refresh` cũng trả `401` (cookie hết hạn/không còn hợp lệ): clear `accessToken`/`user` khỏi store, redirect `/login`.
  3. Dùng cờ tránh nhiều request 401 cùng lúc gọi `/auth/refresh` song song (gộp thành 1 lần refresh, các request khác chờ kết quả rồi retry theo).
- **F5 trang không mất session:** khi app khởi động (mount lần đầu / F5), luôn gọi thử `POST /auth/refresh` trước khi render route — nếu thành công (cookie còn hợp lệ), khôi phục `accessToken` (và gọi thêm API lấy `user` nếu cần) mà không cần bắt đăng nhập lại. Nếu thất bại, coi như chưa đăng nhập, render trang login bình thường.
- **Lưu token ở đâu:** `accessToken` lưu trong Zustand store (in-memory), KHÔNG dùng `localStorage`/`sessionStorage`. `refreshToken` KHÔNG được FE lưu trữ dưới bất kỳ hình thức nào — nó chỉ tồn tại trong cookie do browser tự quản lý, FE không đọc, không ghi, không truyền tay nó ở bất kỳ đâu trong code.

---

# 6. CẤU TRÚC THƯ MỤC (ARCHITECTURE)

Tuân thủ nghiêm ngặt cấu trúc sau. KHÔNG tự ý tạo cấu trúc mới khi chưa được yêu cầu:

```
frontend/src/
├── api/
│   ├── axiosClient.ts       # instance chung, request interceptor gắn accessToken
│   └── endpoints.ts         # tập trung định nghĩa URL, tránh string rải rác
│
├── features/
│   ├── auth/
│   │   ├── api/loginApi.ts
│   │   ├── hooks/useLogin.ts
│   │   ├── components/LoginForm.tsx
│   │   └── types.ts
│   ├── profile/                     # PATCH /users/profile — tự sửa hồ sơ cá nhân
│   │   ├── api/profileApi.ts
│   │   ├── hooks/useUpdateProfile.ts
│   │   └── components/ProfileMenu.tsx  # gắn ở Header
│   ├── dashboard/
│   │   ├── api/dashboardApi.ts
│   │   ├── hooks/
│   │   │   ├── useFinancialReport.ts       # GET /dashboard/financial-report
│   │   │   └── usePackageStatusReport.ts   # GET /dashboard/package-status-report
│   │   ├── components/
│   │   │   ├── RevenueCard.tsx
│   │   │   ├── PackageCountCard.tsx
│   │   │   └── PackageStatusBreakdown.tsx  # hiển thị dạng bảng/badge, KHÔNG dùng chart
│   │   └── types.ts
│   ├── warehouses/
│   │   ├── api/warehouseApi.ts
│   │   ├── hooks/
│   │   └── components/
│   ├── employees/                   # quản lý User (Admin/Manager)
│   │   ├── api/userApi.ts
│   │   ├── hooks/
│   │   │   ├── useUsers.ts
│   │   │   ├── useCreateUser.ts
│   │   │   ├── useUpdateUser.ts
│   │   │   ├── useBanUser.ts
│   │   │   ├── useUnbanUser.ts
│   │   │   └── useDeleteUser.ts     # tồn tại trong API nhưng là hành động phụ, xem mục 9
│   │   └── components/
│   └── packages/
│       ├── api/packageApi.ts
│       ├── hooks/
│       │   ├── usePackages.ts
│       │   └── useUpdatePackageStatus.ts
│       ├── components/
│       │   ├── PackageTable.tsx
│       │   ├── PackageStatusBadge.tsx
│       │   └── PackageFilterBar.tsx
│       └── types.ts
│
├── components/
│   ├── ui/                  # shadcn components
│   └── layout/               # Sidebar, Header, ProtectedLayout
│
├── routes/
│   ├── AppRouter.tsx
│   └── ProtectedRoute.tsx    # route guard theo role
│
├── store/
│   └── authStore.ts          # Zustand — accessToken, refreshToken, user, role
│
├── lib/
│   └── queryClient.ts        # React Query config: refetchInterval, refetchOnWindowFocus
│
└── types/
    └── common.ts             # ApiResponse<T>, ErrorResponse, Role enum
```

---

# 7. DATA FRESHNESS (POLLING, KHÔNG DÙNG WEBSOCKET/SSE)

- Dashboard (`useFinancialReport`, `usePackageStatusReport`) và danh sách (`usePackages`, `useUsers`) dùng React Query với:
  ```ts
  refetchInterval: 10000,
  refetchOnWindowFocus: true,
  ```
- Sau MỌI mutation (create/update/ban/unban/delete), gọi `queryClient.invalidateQueries` cho đúng query key liên quan.
- KHÔNG dùng WebSocket, SSE, hay bất kỳ cơ chế push realtime nào — đây là quyết định có chủ đích, không phải thiếu sót.

---

# 8. LỘ TRÌNH THỰC THI (ROADMAP)

Agent PHẢI báo cáo kế hoạch và chờ "Approve" trước khi chuyển Phase.

**Phase 1: Base Setup & Authentication**

- Setup Vite + TS + Tailwind + shadcn + React Query + Zustand + Axios.
- `axiosClient.ts` (request interceptor gắn `accessToken`, response interceptor xử lý `401` → gọi `/auth/refresh` theo đúng luồng ở mục 5, fallback logout + redirect nếu refresh thất bại).
- `types/common.ts`: `ApiResponse<T>`, `ErrorResponse` (đúng shape phẳng ở mục 3), `Role` enum.
- Feature `auth`: login form, gọi API, lưu `accessToken`/`refreshToken`/`user` vào `authStore`. Nút Logout gọi `POST /auth/logout` trước khi clear store.
- `ProtectedRoute` theo role.

**Phase 2: Layout & Navigation**

- `ProtectedLayout`: Header (avatar + dropdown "Cập nhật hồ sơ", "Đăng xuất") + Sidebar.
- Sidebar render động theo role — Staff không thấy menu "Doanh thu", "Nhân sự", "Kho khác".
- Feature `profile`: modal/dialog sửa `email`/`username`/`password` qua `PATCH /users/profile`.

**Phase 3: Dashboard Feature**

- `GET /dashboard/financial-report`: Card "Tổng doanh thu" + "Tổng kiện hàng", chữ lớn (`text-3xl`/`text-4xl`).
  - Admin: có `Select` filter theo kho hoặc "Toàn hệ thống" (khi không filter, response có thêm `byWarehouse` — hiển thị bảng breakdown).
  - Manager: không có filter, chỉ xem đúng kho mình (BE tự scope).
  - Staff: chỉ hiện Card "Tổng kiện hàng", KHÔNG hiện Card doanh thu.
- `GET /dashboard/package-status-report`: hiển thị breakdown số lượng theo từng `status` (PENDING/IN_TRANSIT/DELIVERED/CANCELLED) dạng bảng hoặc badge-list, KHÔNG dùng chart.

**Phase 4: Warehouse & Employee Management**

- Warehouse: CRUD đầy đủ (Admin toàn quyền; Manager chỉ sửa được tên kho của chính mình, không tạo/xóa được).
- Employee: `Tabs` (Manager / Staff), `Table` liệt kê, `Dialog`/`Sheet` cho tạo/sửa, `DropdownMenu` cho Khóa/Mở khóa tại mỗi dòng.
- Admin quản lý toàn bộ; Manager chỉ thấy và thao tác Staff thuộc kho mình (BE tự scope).

**Phase 5: Package Management**

- Danh sách kiện hàng: `Table` + filter (`warehouseId` — Admin only, `status`, `search`) + sort (`sortBy`: `code`/`price`/`status`/`createdAt`/`updatedAt`).
- Admin/Manager: nút "Sửa" mở Dialog sửa `code`/`price`/`status`/`warehouseId`.
- Staff: CHỈ có `Select`/`Dropdown` đổi `status` ngay trên dòng bảng, KHÔNG có nút "Sửa" đầy đủ.
- Toàn bộ update PHẢI tuân thủ Optimistic Locking (mục 4).

---

# 9. XÓA (DELETE) VS KHÓA (BAN) — LƯU Ý RIÊNG

API hiện có cả 2 cơ chế cho `User`: `DELETE /users/{id}` (soft-delete) và `PATCH /users/{id}/ban` + `/unban`. Theo đúng ngôn ngữ nghiệp vụ của hệ thống ("Thêm/Sửa/**Khóa**" nhân viên), UI nên ưu tiên:

- **Hành động chính, hiển thị nổi bật:** nút "Khóa"/"Mở khóa" (ban/unban) trong `DropdownMenu` của mỗi dòng nhân viên — đây là luồng chính người dùng sẽ dùng hàng ngày.
- **Hành động phụ, cẩn trọng hơn:** nút "Xóa vĩnh viễn" chỉ hiện cho Admin, đặt tách biệt (ví dụ trong `Dialog` xác nhận riêng, có cảnh báo rõ ràng "hành động không thể hoàn tác"), không đặt cạnh nút Khóa để tránh nhầm lẫn thao tác.

Tương tự cho `Package` và `Warehouse`: `DELETE` tồn tại trong API nhưng nên đặt là hành động phụ, có `Dialog` xác nhận, không phải nút thao tác nhanh trên bảng.

---

# 10. QUY TẮC BẮT BUỘC (AGENT INSTRUCTIONS)

1. **Nguồn duy nhất là `api-docs.json`** — mọi field, mọi endpoint, mọi enum PHẢI khớp chính xác với file này. Không tự thêm field không có trong spec (ví dụ: không tự thêm `role` vào `sortBy` của Users — spec chỉ có `username`/`email`/`createdAt`/`updatedAt`).
2. **Làm việc theo Phase**, báo cáo kế hoạch, chờ Approve mới sinh code.
3. **Clean Code:** Component UI tách biệt hoàn toàn với logic gọi API (custom hooks đảm nhiệm toàn bộ).
4. **No Mocks:** không hardcode dữ liệu giả, luôn gọi API thật theo spec.
5. **Optimistic Locking, Data Freshness, Error Handling:** tuân thủ đúng mục 3, 4, 7 — đây là các rule dễ bị bỏ sót nhất, agent phải tự kiểm tra lại trước khi báo cáo hoàn thành mỗi Phase.
6. **Báo cáo:** sau mỗi tính năng, tóm tắt danh sách file đã tạo/sửa.

---

# 11. STYLE GUIDE (UI/UX)

**Nền tảng:** 100% dùng component `shadcn/ui`. Khi cần component mới (Table, Dialog, Form, Badge, DropdownMenu, Tabs, Select...), thông báo lệnh `npx shadcn-ui@latest add <component>` để chạy trước, KHÔNG tự code lại từ đầu.

**CSS:** Chỉ dùng TailwindCSS class kết hợp shadcn. KHÔNG viết CSS thuần, không tạo file `.css` rời (trừ file global mặc định của shadcn/Tailwind).

**Màu sắc:** Dùng semantic tokens của shadcn (`bg-background`, `text-primary`, `text-muted-foreground`). Màu trạng thái: xanh lá = DELIVERED/doanh thu, đỏ = CANCELLED/lỗi, vàng/cam = PENDING/IN_TRANSIT.

**Số liệu Dashboard:** Font lớn (`text-3xl`/`text-4xl`), in đậm, căn giữa trong Card. TUYỆT ĐỐI không dùng chart — chỉ số/bảng.

**Bảng (Table):** Sticky header, pagination, action buttons trên từng dòng — dùng cho Package list, Employee list.

**Form:** `Form` của shadcn + React Hook Form + Zod validate (đối chiếu field/ràng buộc trong spec: `minLength`, `maxLength`, `required`...).

**Layout theo role:**

- Login: `Card` giữa màn hình chứa `Form`.
- Sidebar: ẩn mục Doanh thu/Nhân sự/Kho khác với Staff.
- Header: avatar + tên + role badge + dropdown (Cập nhật hồ sơ / Đăng xuất).
- Admin — Dashboard: Card doanh thu + kiện hàng, `Select` lọc theo kho/toàn hệ thống, bảng breakdown status.
- Admin — Quản lý: `Tabs` (Kho / Manager / Staff), mỗi tab 1 `Table` + nút "Thêm mới" mở `Dialog`/`Sheet`.
- Manager — Dashboard: giống Admin nhưng không có filter kho.
- Manager — Nhân viên: `Table` Staff thuộc kho mình, `DropdownMenu` action (Sửa/Khóa/Mở khóa).
- Staff — Dashboard: chỉ 1 Card "Tổng kiện hàng".
- Staff — Kiện hàng: `Table` + `Select` đổi status ngay trên dòng, không có form sửa đầy đủ.
