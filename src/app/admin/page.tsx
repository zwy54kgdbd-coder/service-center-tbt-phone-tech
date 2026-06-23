import { redirect } from "next/navigation";
import { AdminProducts } from "@/components/admin-products";
import { isAdminSessionValid } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  if (!isAdminSessionValid()) {
    redirect("/");
  }

  return <AdminProducts />;
}
