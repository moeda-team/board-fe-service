"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  Layers,
  ShieldCheck,
  Users,
  LogOut,
  ChevronsUpDown,
  Building2,
  ChevronRight
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuthMe } from "@/hooks/api/useAuth";
import { authService } from "@/lib/auth";

const mainNavItems = [
  // { title: "Home", href: "/dashboard", icon: Home },
  // { title: "Dev KPI", href: "/developers-kpi", icon: BarChart3 },
  { title: "Spaces", href: "/spaces", icon: Layers }
];

const securityNavItems = [
  { title: "Access", href: "/role-access", icon: ShieldCheck },
  { title: "Members", href: "/members", icon: Users }
  // { title: "Settings", href: "/settings", icon: Settings }
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: authMe } = useAuthMe();
  const { open, setOpen } = useSidebar();
  const lastPathnameRef = useRef(pathname);
  const hasInitializedRef = useRef(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isWorkspaceDetail =
    pathname.startsWith("/spaces/") && pathname !== "/spaces";

  // Handle route changes and initial state
  useEffect(() => {
    const prevPathname = lastPathnameRef.current;
    const wasWorkspaceDetail =
      prevPathname?.startsWith("/spaces/") && prevPathname !== "/spaces";

    // Reset initialization on any pathname change to/from workspace detail
    if (pathname !== prevPathname && isWorkspaceDetail !== wasWorkspaceDetail) {
      hasInitializedRef.current = false;
    }

    // Set initial state only when entering a new page category
    if (!hasInitializedRef.current) {
      if (isWorkspaceDetail) {
        // Space Detail: force collapsed on entry
        setOpen(false);
      } else {
        // Regular pages: restore to expanded (or use persisted cookie)
        setOpen(true);
      }
      hasInitializedRef.current = true;
    }

    lastPathnameRef.current = pathname;
  }, [pathname, isWorkspaceDetail, setOpen]);

  // Hover to expand handlers
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (!open) {
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    // Auto-collapse after delay when mouse leaves
    hoverTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 300);
  };

  const user = authMe?.user;
  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "";

  const activeTenantEntry =
    authMe?.tenants?.find((t) => t.tenant?.id) ?? authMe?.tenants?.[0];
  const activeTenant = activeTenantEntry?.tenant;
  const tenantName = activeTenant?.name ?? "Tenant 1";
  const userRole = activeTenantEntry?.role?.name ?? "Member";

  return (
    <div
      className="group/sidebar-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Sidebar
        collapsible="icon"
        variant="floating"
        className="[&_[data-sidebar=sidebar]]:bg-[#3B82F6] [&_[data-sidebar=sidebar]]:text-white [&_[data-sidebar=sidebar]]:border-none [&_[data-sidebar=sidebar]]:shadow-lg
        [&_[data-sidebar=menu-button]]:text-white [&_[data-sidebar=menu-button]]:hover:bg-white/20 [&_[data-sidebar=menu-button]]:hover:text-white
        [&_[data-sidebar=menu-button][data-active]]:bg-white [&_[data-sidebar=menu-button][data-active]]:text-[#3B82F6]!
        [&_[data-sidebar=menu-button][data-active]]:hover:bg-white [&_[data-sidebar=menu-button][data-active]]:hover:text-[#3B82F6]!
     "
      >
        {/* Tenant Header */}
        <SidebarHeader className="px-4 py-5 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3">
          <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
            <div className="flex size-8 items-center justify-center rounded-lg bg-white/20 text-white">
              <Building2 className="size-4" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-medium leading-tight text-white">
                {tenantName}
              </span>
              <div className="mt-0.5 flex items-center gap-1">
                <span className="text-[10px] text-white/70">Subscription</span>
                <span className="rounded bg-white px-1 py-0.5 text-[9px] font-medium text-[#3B82F6]">
                  Free
                </span>
              </div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={!isWorkspaceDetail && pathname === item.href}
                      tooltip={item.title}
                      render={<Link href={item.href} />}
                    >
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Access & Security */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {securityNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={!isWorkspaceDetail && pathname === item.href}
                      tooltip={item.title}
                      render={<Link href={item.href} />}
                    >
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer — User */}
        <SidebarFooter className="px-3 py-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-white/50 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3 p-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
                <Avatar className="size-9 border-2 border-white/30">
                  <AvatarImage
                    src={user?.avatarUrl ?? ""}
                    alt={user?.fullName ?? ""}
                  />
                  <AvatarFallback className="bg-white/20 text-white text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col items-start min-w-0 group-data-[collapsible=icon]:hidden">
                  <span className="text-sm font-semibold leading-tight text-white truncate w-full">
                    {user?.fullName ?? "User"}
                  </span>
                  <span className="text-[11px] text-white/60 font-medium uppercase tracking-wide">
                    {userRole}
                  </span>
                </div>
                <ChevronsUpDown className="ml-1 size-4 text-white/50 shrink-0 group-data-[collapsible=icon]:hidden" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              sideOffset={8}
              className="w-56"
            >
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => authService.logout()}
              >
                <LogOut className="size-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>

        <SidebarRail className="hover:after:bg-white/30" />
      </Sidebar>
    </div>
  );
}
