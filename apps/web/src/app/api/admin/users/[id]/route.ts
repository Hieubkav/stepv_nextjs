import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";

function getConvexClient() {
  const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("Thiếu cấu hình Convex");
  }
  return new ConvexHttpClient(convexUrl);
}

async function getToken() {
  const store = await cookies();
  return store.get("admin_session_token")?.value ?? "";
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }
    const { id } = await context.params;
    const payload = await request.json();
    const client = getConvexClient();
    await client.mutation(api.adminUsers.update, { id: id as Id<"admin_users">, token, ...payload });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Lỗi hệ thống" }, { status: 400 });
  }
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }
    const { id } = await context.params;
    const client = getConvexClient();
    const user = await client.query(api.adminUsers.getById, { id: id as Id<"admin_users">, token });
    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }
    const { id } = await context.params;
    const client = getConvexClient();
    await client.mutation(api.adminUsers.remove, { id: id as Id<"admin_users">, token });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Lỗi hệ thống" }, { status: 400 });
  }
}
