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
  ChevronRight,
  KeyRound
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
  { title: "Members", href: "/members", icon: Users },
  { title: "API Key", href: "/api-keys", icon: KeyRound }
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
        className="**:data-[sidebar=sidebar]:bg-[#3B82F6] **:data-[sidebar=sidebar]:text-white **:data-[sidebar=sidebar]:border-none **:data-[sidebar=sidebar]:shadow-lg
        **:data-[sidebar=menu-button]:text-white **:data-[sidebar=menu-button]:hover:bg-white/20 **:data-[sidebar=menu-button]:hover:text-white
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
        <SidebarFooter className="p-2">
          <DropdownMenu>
            {/*
              Use Base UI's `render` prop to swap the <button> for a <div>.
              Buttons default to inline / centered layout; a div is a plain
              block element so our flex card naturally left-aligns content.
            */}
            <DropdownMenuTrigger
              render={<div />}
              nativeButton={false}
              className="w-full cursor-pointer select-none rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              {/* Expanded — full profile card */}
              <div className="flex items-center gap-3 rounded-xl bg-white/12 px-3 py-2.5 transition-colors hover:bg-white/20 group-data-[collapsible=icon]:hidden">
                <Avatar className="size-8 shrink-0 ring-2 ring-white/25 shadow-sm">
                  <AvatarImage
                    src={user?.avatarUrl ?? ""}
                    alt={user?.fullName ?? ""}
                  />
                  <AvatarFallback className="bg-white/20 text-white text-[11px] font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-[13px] font-semibold leading-none text-white">
                    {user?.fullName ?? "User"}
                  </span>
                  <span className="text-[11px] font-medium uppercase tracking-wide leading-none text-white/55">
                    {userRole}
                  </span>
                </div>
                <ChevronsUpDown className="size-3.5 shrink-0 text-white/40" />
              </div>
              {/* Collapsed (icon-only) — avatar only, centered */}
              <div className="hidden items-center justify-center rounded-xl py-1 transition-colors hover:bg-white/10 group-data-[collapsible=icon]:flex">
                <Avatar className="size-8 ring-2 ring-white/25 shadow-sm">
                  <AvatarImage
                    src={user?.avatarUrl ?? ""}
                    alt={user?.fullName ?? ""}
                  />
                  <AvatarFallback className="bg-white/20 text-white text-[11px] font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
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
