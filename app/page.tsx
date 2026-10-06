import AdminShell from "@/components/layout/AdminShell";
import DashboardContent from "@/components/dashboard/DashboardContent";

export default function Home() {
  return (
    <AdminShell>
      <DashboardContent />
    </AdminShell>
  );
}