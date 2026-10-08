import AdminShell from "@/components/layout/AdminShell";
import DashboardContent from "@/components/dashboard/DashboardContent";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function Home() {
  return (
    <AdminShell>
      <RoleGuard>
        <DashboardContent />
      </RoleGuard>
    </AdminShell>
  );
}