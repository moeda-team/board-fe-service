import AdminEnterpriseRequestSchedule from "./AdminEnterpriseRequestSchedule";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEnterpriseRequestSchedulePage({
  params
}: PageProps) {
  const { id } = await params;
  return <AdminEnterpriseRequestSchedule id={id} />;
}
