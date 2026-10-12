# DVN Chat Admin

Trang quản trị dành cho hệ thống nhắn tin **DVN Chat**. Ứng dụng cho phép
System Admin theo dõi số liệu tổng quan, quản lý tài khoản người dùng, quản lý
nhóm chat và kiểm duyệt dữ liệu trong nhóm theo thời gian thực.

Đây là frontend SPA viết bằng React. Backend API và Socket.IO là các dịch vụ
độc lập; frontend cần kết nối đến backend đang chạy trước khi đăng nhập.

## Mục lục

- [Tính năng](#tính-năng)
- [Công nghệ](#công-nghệ)
- [Yêu cầu môi trường](#yêu-cầu-môi-trường)
- [Cài đặt](#cài-đặt)
- [Cấu hình biến môi trường](#cấu-hình-biến-môi-trường)
- [Chạy môi trường phát triển](#chạy-môi-trường-phát-triển)
- [Build và triển khai](#build-và-triển-khai)
- [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
- [Các route của ứng dụng](#các-route-của-ứng-dụng)
- [API backend được sử dụng](#api-backend-được-sử-dụng)
- [Realtime với Socket.IO](#realtime-với-socketio)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Xử lý lỗi và xác thực](#xử-lý-lỗi-và-xác-thực)
- [Kiểm thử](#kiểm-thử)
- [Một số lưu ý](#một-số-lưu-ý)

## Tính năng

### Xác thực và phân quyền

- Đăng nhập bằng username và password.
- Chỉ tài khoản có `isSystemAdmin = true` mới được truy cập trang quản trị.
- Kiểm tra lại phiên đăng nhập bằng endpoint `/auth/me` khi tải ứng dụng.
- Token được lưu trong `localStorage` với key `dvn_admin_token` và tự động
  gửi qua header `Authorization`.
- Tự động xóa token và chuyển về `/login` khi backend trả về HTTP `401` hoặc
  `403`.
- Đăng xuất khỏi trang quản trị.

### Dashboard

Dashboard hiển thị:

- Tổng số nhóm chat.
- Tổng số user.
- Tổng số tin nhắn.
- Danh sách nhóm chat, mã đơn vị, số thành viên và trạng thái hoạt động.

### Quản lý nhóm chat

- Xem danh sách tất cả nhóm.
- Tìm kiếm nhóm theo tên hoặc mã đơn vị.
- Xem số lượng thành viên, số tin nhắn và tin nhắn gần nhất.
- Xem chi tiết một nhóm.
- Kích hoạt hoặc vô hiệu hóa nhóm.
- Xóa vĩnh viễn nhóm và dữ liệu liên quan sau khi xác nhận.

### Chi tiết nhóm

Mỗi nhóm có ba khu vực:

#### Thành viên

- Tìm user theo tên hoặc username.
- Chỉ hiển thị các user chưa thuộc nhóm trong danh sách gợi ý.
- Thêm user vào nhóm.
- Gán hoặc thay đổi quyền thành viên:
  - `MEMBER`: thành viên thông thường.
  - `DEPUTY`: phó quản trị viên.
  - `ADMIN`: quản trị viên nhóm.
- Xóa thành viên khỏi nhóm.

#### Lịch sử chat

- Xem lịch sử tin nhắn theo trang, mỗi request tối đa 50 tin nhắn.
- Tin nhắn mới được cập nhật qua Socket.IO.
- Xóa từng tin nhắn.
- Kích thành viên khỏi nhóm ngay từ ngữ cảnh tin nhắn.
- Xóa trắng toàn bộ tin nhắn và dữ liệu chat của nhóm sau khi xác nhận.
- Chuyển trang bằng nút phân trang.

#### Cài đặt quyền

- Chế độ chỉ đọc: chỉ quản trị viên được gửi tin nhắn.
- Cho phép thành viên đổi tên và ảnh nhóm.
- Cho phép thành viên ghim tin nhắn.
- Yêu cầu quản trị viên phê duyệt thành viên mới.
- Kích hoạt hoặc khóa nhóm.
- Xóa vĩnh viễn nhóm và toàn bộ dữ liệu liên quan.

### Quản lý user

- Tìm kiếm theo tên hoặc username.
- Xem avatar, username, ID, mã đơn vị, trạng thái, role và thời điểm tham gia.
- Theo dõi trạng thái online/offline và lần kết nối gần nhất.
- Tạo user mới với các thông tin:
  - Họ tên.
  - Username.
  - Mật khẩu.
  - Số điện thoại (không bắt buộc).
  - Mã đơn vị.
- Cập nhật mã đơn vị.
- Khóa hoặc mở khóa tài khoản.
- Xóa tài khoản.
- Nhận cập nhật online/offline qua Socket.IO.

### Giao diện

- Responsive cho desktop và mobile.
- Sidebar điều hướng trên desktop, menu trượt trên mobile.
- Ba chế độ giao diện: sáng, tối và theo thiết lập hệ thống.
- Lựa chọn theme được lưu trong `localStorage` với key
  `dvn_admin_theme`.

## Công nghệ

- React 19.
- Create React App (`react-scripts` 5).
- React Router DOM.
- TanStack React Query cho truy vấn, cache và invalidate dữ liệu.
- Zustand cho trạng thái xác thực.
- Axios cho HTTP API.
- Socket.IO Client cho dữ liệu realtime.
- React Hook Form cho các form.
- Tailwind CSS cho giao diện.
- Lucide React cho icon.
- `date-fns` cho định dạng ngày giờ.

## Yêu cầu môi trường

- Node.js 18 trở lên được khuyến nghị.
- npm hoặc pnpm.
- Backend DVN Chat đang chạy và cho phép frontend truy cập qua CORS.
- Backend cung cấp cả HTTP API và Socket.IO tại địa chỉ đã cấu hình.

Kiểm tra phiên bản:

```bash
node --version
npm --version
```

## Cài đặt

Clone repository và cài dependencies:

```bash
git clone <URL_REPOSITORY>
cd signalr_chat_admin
npm install
```

Nếu dự án sử dụng pnpm:

```bash
pnpm install
```

Repository có `pnpm-lock.yaml`; khi làm việc theo lockfile này, nên dùng
`pnpm install --frozen-lockfile` để bảo đảm phiên bản dependencies nhất quán.

## Cấu hình biến môi trường

Tạo hoặc cập nhật file `.env` ở thư mục gốc:

```dotenv
REACT_APP_API_URL=http://localhost:1411/api
REACT_APP_SOCKET_URL=http://localhost:1411
PORT=3001
```

| Biến | Bắt buộc | Mặc định | Mô tả |
| --- | --- | --- | --- |
| `REACT_APP_API_URL` | Không | `http://localhost:1411/api` | Base URL của REST API. Phải bao gồm tiền tố `/api` nếu backend dùng tiền tố này. |
| `REACT_APP_SOCKET_URL` | Không | `http://localhost:1411` | URL gốc của Socket.IO, không thêm `/api`. |
| `PORT` | Không | `3000` | Port dev server của Create React App. Repository hiện đặt là `3001`. |
| `ENABLE_OBFUSCATION` | Không | `false` | Đặt `true` khi muốn obfuscate JavaScript sau build. |

Lưu ý:

- Create React App chỉ expose các biến môi trường bắt đầu bằng
  `REACT_APP_` tới frontend.
- Không đặt secret, private key hoặc credential backend trong `.env` frontend.
  Các giá trị này có thể xuất hiện trong bundle trình duyệt.
- Sau khi sửa `.env`, cần khởi động lại dev server.

## Chạy môi trường phát triển

```bash
npm start
```

Ứng dụng chạy tại `http://localhost:3001` theo cấu hình hiện tại. Nếu bỏ
`PORT=3001`, Create React App sẽ dùng port mặc định `3000`.

Với pnpm:

```bash
pnpm start
```

Khi backend chạy ở máy khác, thay `REACT_APP_API_URL` và
`REACT_APP_SOCKET_URL` bằng hostname hoặc IP tương ứng. Backend cần cấu hình
CORS cho origin của dev server, ví dụ `http://localhost:3001`.

## Build và triển khai

Tạo bản build production:

```bash
npm run build
```

Lệnh này:

1. Chạy build production của Create React App.
2. Tắt sourcemap bằng `GENERATE_SOURCEMAP=false`.
3. Ghi output vào thư mục `build/`.
4. Chạy script `postbuild-obfuscate.js`.
5. Mặc định bỏ qua obfuscation và in thông báo hướng dẫn.

Bật obfuscation:

```bash
cross-env ENABLE_OBFUSCATION=true npm run build
```

Script post-build sẽ dùng `javascript-obfuscator` thông qua `npx` để xử lý
JavaScript trong `build/static/js`. Chỉ bật tùy chọn này khi môi trường build
có thể tải hoặc đã có sẵn package tương ứng; cần kiểm thử kỹ bundle sau khi
obfuscate.

### Triển khai static files

Sau khi build, triển khai toàn bộ thư mục `build/` lên static hosting hoặc
web server. Vì ứng dụng dùng client-side routing, web server phải fallback các
route không phải file tĩnh về `index.html`. Ví dụ với Nginx:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Đảm bảo build production được tạo với đúng `REACT_APP_API_URL` và
`REACT_APP_SOCKET_URL` của môi trường triển khai. Các biến này được nhúng vào
bundle tại thời điểm build, không được đọc động sau khi deploy.

## Hướng dẫn sử dụng

### Đăng nhập

1. Mở ứng dụng tại địa chỉ dev hoặc domain production.
2. Nhập username và password của tài khoản System Admin.
3. Chọn **Đăng nhập**.
4. Nếu tài khoản không có quyền System Admin, ứng dụng sẽ từ chối truy cập.

### Theo dõi tổng quan

Sau khi đăng nhập, trang `/dashboard` hiển thị thống kê hệ thống và danh sách
nhóm chat. Chọn nhóm trong menu **Quản lý Nhóm** để thực hiện thao tác chi
tiết.

### Quản lý nhóm

1. Mở **Quản lý Nhóm**.
2. Nhập tên nhóm hoặc mã đơn vị để lọc.
3. Chọn biểu tượng xem chi tiết để mở nhóm.
4. Dùng nút trạng thái để vô hiệu hóa hoặc kích hoạt nhóm.
5. Khi xóa, nhấn nút xóa và xác nhận lại thao tác.

Các thao tác xóa nhóm, xóa trắng tin nhắn và xóa vĩnh viễn dữ liệu không thể
hoàn tác. Chỉ thực hiện sau khi đã kiểm tra đúng nhóm.

### Quản lý thành viên và quyền

1. Trong chi tiết nhóm, mở tab **Thành viên**.
2. Tìm theo tên hoặc username.
3. Chọn user, chọn quyền và bấm thêm thành viên.
4. Thay đổi role trực tiếp tại danh sách thành viên.
5. Chọn xóa thành viên và xác nhận.

### Kiểm duyệt lịch sử chat

1. Mở tab **Lịch sử chat**.
2. Duyệt tin nhắn bằng phân trang.
3. Xóa từng tin nhắn nếu cần.
4. Có thể kích người gửi khỏi nhóm từ tin nhắn.
5. Dùng **Xóa trắng tin nhắn** để xóa toàn bộ dữ liệu chat sau khi xác nhận.

### Quản lý user

1. Mở **Quản lý User**.
2. Dùng ô tìm kiếm để lọc theo tên hoặc username.
3. Chọn **Tạo user mới** để mở form tạo tài khoản.
4. Chọn biểu tượng chỉnh sửa cạnh mã đơn vị để cập nhật mã.
5. Dùng nút khóa/mở khóa để thay đổi trạng thái.
6. Khi xóa user, xác nhận thao tác tại dòng tương ứng.

## Các route của ứng dụng

| Route | Quyền | Mục đích |
| --- | --- | --- |
| `/login` | Công khai | Đăng nhập |
| `/dashboard` | System Admin | Tổng quan hệ thống |
| `/groups` | System Admin | Danh sách và quản lý nhóm |
| `/groups/:groupId` | System Admin | Chi tiết nhóm, thành viên, chat và quyền |
| `/users` | System Admin | Quản lý tài khoản user |

Route không tồn tại được chuyển về `/dashboard`. Các route quản trị được bọc
bởi `ProtectedRoute`; trong thời gian kiểm tra phiên sẽ hiển thị trạng thái
`Đang xác thực...`.

## API backend được sử dụng

Frontend gọi API qua Axios với base URL là `REACT_APP_API_URL`, timeout 15
giây và header `Authorization` lấy từ token đã lưu.

### Auth

| Method | Endpoint | Mục đích |
| --- | --- | --- |
| `POST` | `/auth/login` | Đăng nhập; response cần có `data.user` và `data.accessToken` |
| `GET` | `/auth/me` | Kiểm tra token và lấy thông tin user hiện tại |

### Dashboard

| Method | Endpoint | Mục đích |
| --- | --- | --- |
| `GET` | `/admin/dashboard` | Lấy `totalGroups`, `totalUsers`, `totalMessages` |

### Groups

| Method | Endpoint | Mục đích |
| --- | --- | --- |
| `GET` | `/admin/groups` | Lấy danh sách nhóm |
| `GET` | `/admin/groups/:id` | Lấy chi tiết nhóm |
| `GET` | `/admin/groups/:id/messages?page=1&limit=50` | Lấy lịch sử tin nhắn |
| `PUT` | `/admin/groups/:id` | Cập nhật trạng thái hoặc cài đặt nhóm |
| `DELETE` | `/admin/groups/:id` | Xóa vĩnh viễn nhóm |
| `DELETE` | `/admin/groups/:id/messages` | Xóa trắng tin nhắn/dữ liệu chat |
| `POST` | `/admin/groups/:groupId/members` | Thêm thành viên |
| `PUT` | `/admin/groups/:groupId/members/:userId` | Cập nhật role thành viên |
| `DELETE` | `/admin/groups/:groupId/members/:userId` | Xóa thành viên |

### Messages

| Method | Endpoint | Mục đích |
| --- | --- | --- |
| `DELETE` | `/admin/messages/:id` | Xóa một tin nhắn |

### Users

| Method | Endpoint | Mục đích |
| --- | --- | --- |
| `GET` | `/admin/users?search=...` | Tìm user |
| `GET` | `/admin/users` | Lấy danh sách user, có thể truyền query params |
| `POST` | `/admin/users` | Tạo user |
| `PUT` | `/admin/users/:id` | Cập nhật user hoặc mã đơn vị |
| `DELETE` | `/admin/users/:id` | Xóa user |

Các response thành công hiện được frontend đọc theo cấu trúc
`response.data.data`. Backend cần giữ cấu trúc này nhất quán hoặc frontend
phải được cập nhật tương ứng.

## Realtime với Socket.IO

Ứng dụng tạo kết nối Socket.IO sau khi xác thực thành công và truyền token
qua:

```js
{ auth: { token } }
```

Các event hệ thống được sử dụng để invalidate cache:

- `user_created`
- `user_updated`
- `user_deleted`
- `group_deleted`

Khi đang mở chi tiết nhóm, frontend tham gia room bằng event
`joinNewGroupRoom` với `groupId` và lắng nghe các event:

- `receiveGroupMessage`
- `newMessage`
- `message_reacted`
- `poll_created`
- `poll_updated`
- `note_created`
- `note_deleted`
- `reminder_created`
- `reminder_updated`
- `reminder_deleted`
- `group_readonly_changed`
- `group_settings_updated`
- `group_info_updated`
- `group_messages_reset`
- `userOnline`
- `userOffline`

Khi rời trang chi tiết nhóm, frontend gửi `leaveGroupRoom` và đóng kết nối
socket tương ứng. Backend cần bật CORS và hỗ trợ transport websocket/polling
theo cấu hình client.

## Cấu trúc thư mục

```text
.
├── public/
│   ├── index.html             # HTML entrypoint và Socket.IO CDN
│   ├── manifest.json          # Metadata PWA
│   └── sw.js                  # Service worker nếu được sử dụng
├── scripts/
│   └── postbuild-obfuscate.js # Obfuscate bundle tùy chọn sau build
├── src/
│   ├── components/
│   │   └── AdminLayout.jsx    # Layout, sidebar, theme, logout
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── GroupsPage.jsx
│   │   ├── GroupDetailPage.jsx
│   │   └── UsersPage.jsx
│   ├── services/
│   │   ├── axiosClient.js      # Axios instance, token và xử lý 401/403
│   │   └── adminApi.js         # Các hàm gọi API quản trị
│   ├── stores/
│   │   └── useAuthStore.js      # Zustand auth store
│   ├── utils/                  # Hàm validate/format dùng chung
│   ├── App.js                  # Router, auth guard, QueryClient, socket
│   ├── index.css               # Tailwind entrypoint
│   └── index.js                # React entrypoint
├── .env
├── package.json
├── pnpm-lock.yaml
└── tailwind.config.js
```

## Xử lý lỗi và xác thực

- Lỗi đăng nhập được hiển thị ngay trên form.
- Request API có timeout 15 giây.
- TanStack Query retry tối đa một lần và dùng `staleTime` 30 giây.
- Lỗi `401` hoặc `403` sẽ xóa token và điều hướng về trang đăng nhập.
- Các thao tác thay đổi dữ liệu sẽ invalidate các query liên quan để tải lại
  dữ liệu mới.
- Socket được ngắt khi user đăng xuất hoặc không còn xác thực.

Nếu màn hình không tải dữ liệu, kiểm tra lần lượt:

1. Backend có đang chạy không.
2. `REACT_APP_API_URL` có đúng và có `/api` không.
3. `REACT_APP_SOCKET_URL` có trỏ đến URL gốc của Socket.IO không.
4. CORS của backend có cho phép origin frontend không.
5. Browser DevTools có lỗi Network, Console hoặc WebSocket không.

## Kiểm thử

Chạy test của Create React App:

```bash
npm test
```

Chạy một lần không ở watch mode:

```bash
npm test -- --watchAll=false
```

Kiểm tra build production:

```bash
npm run build
```

Trước khi merge hoặc triển khai, nên kiểm tra tối thiểu:

- Đăng nhập bằng tài khoản System Admin.
- Tài khoản không có quyền bị chặn.
- Tải dashboard, danh sách nhóm và danh sách user.
- Tạo, khóa/mở khóa và xóa user.
- Thêm thành viên, đổi role và xóa thành viên.
- Xóa tin nhắn, cập nhật cài đặt nhóm và kiểm tra realtime.
- Refresh trực tiếp tại các route `/dashboard`, `/groups` và `/users` trên
  web server production.

## Một số lưu ý

- Đây là ứng dụng quản trị, không phải giao diện chat dành cho người dùng
  cuối.
- Quyền thực tế phải được kiểm tra ở backend; ẩn hoặc hiện nút trên frontend
  không thay thế cho authorization phía server.
- Không commit `.env` chứa thông tin nhạy cảm hoặc URL nội bộ không nên công
  khai.
- Các thao tác xóa nhóm, xóa trắng chat, xóa tin nhắn và xóa user có thể ảnh
  hưởng dữ liệu production. Nên có backup và quy trình phê duyệt trước khi
  thực hiện.
- Khi deploy dưới subpath thay vì domain root, cần cấu hình `homepage`/base
  path và web server fallback phù hợp với Create React App.
- `public/index.html` nạp Socket.IO client từ CDN. Môi trường production cần
  bảo đảm máy người dùng có thể truy cập CDN này hoặc thay thế bằng cơ chế
  đóng gói nội bộ phù hợp.

