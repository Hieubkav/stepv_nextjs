import { redirect } from "next/navigation";

export default function ResetPasswordOtpRedirect() {
  redirect("/khoa-hoc/forgot-password");
}
