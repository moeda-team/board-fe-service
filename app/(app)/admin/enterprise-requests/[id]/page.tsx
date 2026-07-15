import AdminEnterpriseRequestDetail from "./AdminEnterpriseRequestDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEnterpriseRequestDetailPage({
  params
}: PageProps) {
  const { id } = await params;
  return <AdminEnterpriseRequestDetail id={id} />;
}
