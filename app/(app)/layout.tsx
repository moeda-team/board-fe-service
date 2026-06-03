import type { Metadata } from "next";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ApiAuthProvider } from "@/providers/api-auth-provider";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ApiAuthProvider>
      <SidebarProvider className="p-2">
        <AppSidebar />
        <SidebarInset className="overflow-x-hidden rounded-xl border shadow-xs">
          {/* Mobile sidebar trigger - visible only on small screens */}
          <div className="flex items-center border-b px-4 py-3 md:hidden">
            <SidebarTrigger className="-ml-1 mr-2" />
            <span className="font-semibold">Menu</span>
          </div>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </ApiAuthProvider>
  );
}
