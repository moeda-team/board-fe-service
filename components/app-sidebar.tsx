"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Layers,
  ShieldCheck,
  Users,
  LogOut,
  ChevronsUpDown,
  Building2,
  ChevronRight,
  KeyRound,
  Check,
  Loader2,
  Pencil
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { useAuthMe } from "@/hooks/api/useAuth";
import { useMyTenants } from "@/hooks/api/useMyTenants";
import { authService } from "@/lib/auth";
import { getActiveTenantEntry, setActiveTenantId } from "@/lib/tenant";
import { RenameTenantModal } from "@/components/RenameTenantModal";

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

  const router = useRouter();
  const [switchingTenantId, setSwitchingTenantId] = useState<string | null>(null);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const { data: myTenants = [] } = useMyTenants();

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

  // Hover to expand handlers - only allow hover collapse on workspace detail pages
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    // Only auto-expand via hover when on workspace detail (where sidebar can be collapsed)
    if (!open && isWorkspaceDetail) {
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    // Only auto-collapse when on workspace detail pages
    // On other pages, sidebar stays wide open
    if (!isWorkspaceDetail) return;

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

  const activeTenantEntry = getActiveTenantEntry(authMe);
  const activeTenant = activeTenantEntry?.tenant;
  const tenantName = activeTenant?.name ?? "Tenant 1";
  const userRole = activeTenantEntry?.role?.name ?? "Member";

  const handleSwitchTenant = (tenantId: string) => {
    if (tenantId === activeTenant?.id) return;
    setSwitchingTenantId(tenantId);
    setActiveTenantId(tenantId);
    window.location.href = "/spaces";
  };

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
        <SidebarHeader className="px-3 py-4 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3">
          <button
            type="button"
            onClick={() => setIsRenameOpen(true)}
            className="relative flex w-full items-center gap-3 rounded-lg p-3 transition-colors hover:bg-white/10 cursor-pointer group group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:p-2"
          >
            {/* Icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/20 text-white">
              <Building2 className="size-5" />
            </div>

            {/* Text & Badge */}
            <div className="flex flex-1 flex-col min-w-0 text-left group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold text-white truncate">
                {tenantName}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-white/70">Subscription</span>
                <span className="px-1.5 py-0.5 rounded-sm bg-white/20 text-[10px] font-medium text-white tracking-wide">
                  Free
                </span>
              </div>
            </div>

            {/* Action Icon */}
            <Pencil className="h-4 w-4 shrink-0 text-white/80 opacity-0 transition-opacity group-hover:opacity-100 group-data-[collapsible=icon]:hidden" />
          </button>
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
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Switch Organization
                </DropdownMenuLabel>
                {myTenants.map((entry) => {
                  const t = entry.tenant;
                  const isActive = t.id === activeTenant?.id;
                  const isSwitching = switchingTenantId === t.id;
                  return (
                    <DropdownMenuItem
                      key={t.id}
                      className="cursor-pointer"
                      onClick={() => handleSwitchTenant(t.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded bg-[#3B82F6]/10 text-[#3B82F6]">
                          <Building2 className="size-3" />
                        </div>
                        <span className={isActive ? "font-semibold" : ""}>
                          {t.name}
                        </span>
                      </div>
                      {isActive && !isSwitching && (
                        <Check className="ml-auto size-4 text-[#3B82F6]" />
                      )}
                      {isSwitching && (
                        <Loader2 className="ml-auto size-4 animate-spin text-[#3B82F6]" />
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
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

      <RenameTenantModal
        open={isRenameOpen}
        onOpenChange={setIsRenameOpen}
        tenantId={activeTenant?.id ?? ""}
        initialName={tenantName}
      />
    </div>
  );
}
