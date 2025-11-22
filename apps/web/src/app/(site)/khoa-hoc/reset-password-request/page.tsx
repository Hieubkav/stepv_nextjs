import { redirect } from "next/navigation";

export default function ResetPasswordRequestRedirect() {
  redirect("/khoa-hoc/forgot-password");
}
