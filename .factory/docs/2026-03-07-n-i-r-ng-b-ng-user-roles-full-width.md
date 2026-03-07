## Problem Graph
1. Nới rộng bảng ở `/dashboard/user` và `/dashboard/user/roles` <- depends on 1.1, 1.2
   1.1 Xác định điểm đang giới hạn width
      1.1.1 ROOT CAUSE: `Main` layout đang `max-w-7xl` khi page không bật `fluid`
   1.2 Giữ đúng phạm vi user chọn
      1.2.1 Chỉ nới phần bảng danh sách, giữ `p-4`, không đụng toàn bộ form/card khác

## Execution (with reflection)
1. Solving 1.1.1
   - Thought: Route bạn đưa nằm trong `(dashboard)` và dùng `Main` component.
   - Action: Đã đọc `apps/web/src/components/layout/main.tsx` + 2 page đích.
   - Observation: `Main` mặc định bị chặn `@7xl/content:max-w-7xl`.
   - Reflection: ✓ Đây là lý do tạo khoảng trắng lớn trên màn hình rộng.

2. Apply theo phạm vi đã chốt
   - File: `apps/web/src/app/(dashboard)/dashboard/user/page.tsx`
   - Change: Thêm `-mx-4` vào wrapper của bảng danh sách (phần `div.divide-y...`) để bảng/card vượt giới hạn container ngang, trong khi header/filter vẫn giữ layout hiện tại.
   - Logic: Chỉ vùng bảng full ngang viewport (trừ `p-4` ngoài cùng), không ảnh hưởng phần controls.

3. Apply tương tự cho roles list
   - File: `apps/web/src/app/(dashboard)/dashboard/user/roles/page.tsx`
   - Change: Thêm `-mx-4` cho wrapper bảng trong card “Danh sách vai trò”.
   - Logic: Chỉ nới bảng list; form “Tạo/Cập nhật vai trò” giữ nguyên (`max-w-3xl`) đúng lựa chọn của bạn.

4. Verify nhanh
   - Chạy: `bunx tsc --project apps/web/tsconfig.json --noEmit` (theo rule repo).
   - Mở 2 route để check: bảng rộng hơn rõ rệt, giữ `p-4`, không vỡ bố cục mobile.

5. Commit (theo AGENTS.md)
   - Commit toàn bộ thay đổi code + kèm `.factory/docs` nếu có file thay đổi trong đó.
   - Không push.

## Checklist sau khi làm
- [ ] `/dashboard/user`: bảng danh sách rộng full theo yêu cầu
- [ ] `/dashboard/user/roles`: bảng danh sách rộng full theo yêu cầu
- [ ] Giữ nguyên `p-4`
- [ ] Chỉ tác động bảng, không đổi form/card khác
- [ ] TypeScript check pass
- [ ] Đã commit, chưa push