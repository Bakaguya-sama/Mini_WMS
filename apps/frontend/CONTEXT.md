# 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)

- **Tên dự án:** Mini Warehouse Management System (Mini WMS).
- **Bối cảnh:** Phát triển giải pháp CRM tối ưu hóa việc theo dõi kiện hàng và dòng tiền tại chuỗi kho vận hiện đại[cite: 1].
- **Mục tiêu Frontend:** Xây dựng trang quản trị UI đa dạng trực quan, đầy đủ tính năng và response[cite: 1]. Đặc biệt đối với Dashboard, cần ưu tiên tính chính xác của số liệu hơn là đồ thị phức tạp[cite: 1].
- **Tech Stack:** React, TypeScript, Vite, TailwindCSS, authStore, Axios.
- **Tài liệu tham khảo:** Dựa hoàn toàn vào file Swagger API Docs đính kèm.

# 2. BUSINESS LOGIC & PHÂN QUYỀN (RBAC)

Hệ thống sử dụng JWT & Phân quyền RBAC nghiêm ngặt[cite: 1]. Giao diện phải được ẩn/hiện dựa trên Role của user:

- **ADMIN (Cấp bậc cao nhất):**
  - Toàn quyền quản lý tất cả kho hàng (tối thiểu 3 kho) mà không bị giới hạn khu vực[cite: 1].
  - Quản trị nhân sự: Thêm, sửa, xóa, điều chuyển Manager/Staff giữa các kho[cite: 1]. Có quyền cấp và thu hồi quyền[cite: 1].
  - Báo cáo tài chính: Xem tổng thu chi toàn hệ thống hoặc lọc chi tiết theo từng kho[cite: 1].

- **MANAGER (Quản lý kho):**
  - Chỉ thao tác trên kho được chỉ định, bị chặn truy cập các kho khác[cite: 1].
  - Quản lý nhân viên: Trực tiếp thêm, sửa, khóa Staff thuộc kho của mình[cite: 1]. Tương tự Admin, Manager có thể CRUD nhân viên cấp dưới[cite: 1].
  - Thống kê: Xem số kiện hàng và tổng tiền thu được của riêng kho quản lý[cite: 1].

- **STAFF (Nhân viên kho):**
  - Chỉ xem danh sách và tổng số kiện hàng trong kho đang trực thuộc[cite: 1].
  - Thực hiện các thao tác cập nhật trạng thái kiện hàng cơ bản[cite: 1].
  - Bị giới hạn: Tuyệt đối không xem được doanh thu, dữ liệu nhân sự hay dữ liệu kho khác[cite: 1].

# 3. CẤU TRÚC THƯ MỤC (ARCHITECTURE)

Tuân thủ nghiêm ngặt cấu trúc sau. KHÔNG tự ý tạo cấu trúc mới khi chưa được yêu cầu:

```bash
frontend/Mini WMS/src/
├── api/
│ ├── axiosClient.ts # instance chung, interceptor gắn JWT + refresh token
│ └── endpoints.ts # tập trung định nghĩa URL, tránh string rải rác
│
├── features/
│ ├── auth/
│ │ ├── api/loginApi.ts
│ │ ├── hooks/useLogin.ts
│ │ ├── components/LoginForm.tsx
│ │ └── types.ts
│ ├── dashboard/
│ │ ├── api/dashboardApi.ts
│ │ ├── hooks/useDashboardStats.ts
│ │ ├── components/
│ │ │ ├── RevenueCard.tsx
│ │ │ └── PackageCountCard.tsx
│ │ └── types.ts
│ ├── warehouses/
│ ├── employees/ # quản lý Manager/Staff
│ └── packages/
│ ├── api/packageApi.ts
│ ├── hooks/
│ │ ├── usePackages.ts
│ │ └── useUpdatePackageStatus.ts
│ ├── components/
│ │ ├── PackageTable.tsx
│ │ ├── PackageStatusBadge.tsx
│ │ └── PackageFilterBar.tsx
│ └── types.ts
│
├── components/ # UI thuần dùng chung nhiều feature, KHÔNG chứa business logic
│ ├── ui/ # Button, Modal, Table, Badge...
│ └── layout/ # Sidebar, Header, ProtectedLayout
│
├── routes/
│ ├── AppRouter.tsx
│ └── ProtectedRoute.tsx # route guard theo role
│
├── store/
│ └── authStore.ts # Context — chỉ giữ auth state
│
├── lib/
│ └── queryClient.ts
│
└── types/
└── common.ts # ApiResponse<T>, Role enum dùng chung FE/BE

```

# 4. LỘ TRÌNH THỰC THI (ROADMAP)

Agent phải hỏi ý kiến người dùng trước khi chuyển sang Phase mới.

- **Phase 1: Base Setup & Authentication**
  - Cấu hình `axiosClient` (kèm JWT interceptor) & định nghĩa các interface chung trong `types/common.ts`.
  - Phát triển feature `auth`: Gọi api login, lưu token vào `authStore`.
  - Tạo `ProtectedRoute` để kiểm tra quyền truy cập dựa trên role.
- **Phase 2: Layout & Navigation**
  - Xây dựng `ProtectedLayout` gồm Header và Sidebar.
  - Sidebar phải render linh hoạt dựa trên Role (VD: Staff không thấy menu Doanh thu/Nhân sự).
- **Phase 3: Dashboard Feature**
  - Tích hợp API thống kê.
  - Hiển thị số tiền tổng doanh thu lớn, rõ ràng[cite: 1].
  - Hiển thị tổng số kiện trong kho[cite: 1].
  - Đảm bảo logic hiển thị khác nhau giữa Admin và Manager.
- **Phase 4: Warehouse & Employee Management**
  - Xây dựng giao diện CRUD nhân viên, quản lý role[cite: 1].
  - Admin quản lý toàn bộ, Manager quản lý Staff nội bộ.
- **Phase 5: Package Management**
  - Danh sách kiện hàng, tính năng lọc theo trạng thái.
  - Chức năng cập nhật trạng thái cho Staff.

# 5. QUY TẮC BẮT BUỘC (AGENT INSTRUCTIONS)

1. **Làm việc theo Phase:** Đọc Swagger Doc, báo cáo kế hoạch thực hiện của Phase hiện tại. Chờ tôi (người dùng) "Approve" mới được sinh code.
2. **Clean Code:** Component UI phải tách biệt hoàn toàn với logic (Custom hooks xử lý API).
3. **No Mocks:** Luôn ưu tiên thiết kế interface và gọi API theo chuẩn của Swagger Docs, không tự bịa data cứng (hardcode) nếu không cần thiết.
4. **Báo cáo:** Sau khi xong mỗi tính năng, hãy tóm tắt những file đã sửa để tôi dễ dàng đối chiếu trên GitHub.
