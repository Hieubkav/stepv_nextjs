# courses-edit-parsing

## Issue
- Next build bao loi "Parsing ecmascript source code failed" vi con du try/catch copy va dau ngoac dong thua quanh khu vuc quan ly enrollment.

## Fix
- Xoa block try/catch trung lap nam ben ngoai ham `toggleEnrollmentActive`.
- Xoa dau ngoac dong thua giua `toggleEnrollmentActive` va `editEnrollment`, va truoc `removeEnrollmentEntry`.

## Note
- Khi refactor khu vuc enrollment, so sanh ky de khong giu lai block tam hoac double paste.
