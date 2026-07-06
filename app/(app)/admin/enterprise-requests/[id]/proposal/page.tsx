import AdminEnterpriseRequestProposal from "./AdminEnterpriseRequestProposal";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEnterpriseRequestProposalPage({
  params
}: PageProps) {
  const { id } = await params;
  return <AdminEnterpriseRequestProposal id={id} />;
}
