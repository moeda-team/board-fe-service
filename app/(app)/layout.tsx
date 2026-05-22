import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ApiAuthProvider } from "@/providers/api-auth-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ApiAuthProvider>
      <SidebarProvider className="p-2">
        <AppSidebar />
        <SidebarInset className="overflow-x-hidden rounded-xl border shadow-xs">
          {children}
        </SidebarInset>
      </SidebarProvider>
    </ApiAuthProvider>
  );
}
