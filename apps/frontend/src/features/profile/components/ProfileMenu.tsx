import { useState } from "react";
import { LogOut, Settings, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { ProfileDialog } from "./ProfileDialog";

/** Get initials for avatar fallback (e.g. "John Doe" → "JD") */
function getInitials(username: string): string {
  return username
    .split(/[\s_-]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Header profile dropdown menu.
 * Contains: avatar trigger → user info → "Cập nhật hồ sơ" → separator → "Đăng xuất"
 * Opens ProfileDialog when user selects "Cập nhật hồ sơ".
 */
export function ProfileMenu() {
  const { user } = useAuthStore();
  const { mutate: logoutMutate, isPending: isLoggingOut } = useLogout();
  const [profileOpen, setProfileOpen] = useState(false);

  if (!user) return null;

  const initials = getInitials(user.username);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            id="profile-menu-trigger"
            className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Mở menu tài khoản"
          >
            <Avatar className="h-8 w-8 border border-border/50 hover:border-primary/50 transition-colors">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Username — hidden on very small screens */}
            <span className="hidden md:block text-sm font-medium text-foreground">
              {user.username}
            </span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          {/* User info header */}
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground truncate">
                  {user.username}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate pl-5">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* Cập nhật hồ sơ */}
          <DropdownMenuItem
            id="profile-edit-item"
            onSelect={() => setProfileOpen(true)}
            className="cursor-pointer"
          >
            <Settings className="w-4 h-4 mr-2" />
            Cập nhật hồ sơ
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Đăng xuất */}
          <DropdownMenuItem
            id="logout-menu-item"
            onSelect={() => logoutMutate()}
            disabled={isLoggingOut}
            className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile edit dialog — controlled by this menu */}
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}
