import { Bell, Check } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ScrollArea } from "./ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useNotifications, useMarkNotificationRead, useMarkAllRead } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const navigate = useNavigate();
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleClick = (n: { id: string; link: string | null; is_read: boolean }) => {
    if (!n.is_read) markRead.mutate(n.id);
    if (n.link) navigate(n.link);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 md:h-10 md:w-10"
          aria-label="নোটিফিকেশন"
        >
          <Bell className="w-4 h-4 md:w-5 md:h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 md:w-96 p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold text-sm">নোটিফিকেশন</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => markAll.mutate()}
            >
              <Check className="w-3 h-3 mr-1" />
              সব পঠিত
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              কোনো নোটিফিকেশন নেই
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={cn(
                    "w-full text-left p-3 hover:bg-accent transition-colors",
                    !n.is_read && "bg-primary/5"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && (
                      <span className="mt-1.5 w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{n.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(n.created_at), {
                          addSuffix: true,
                          locale: bn,
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
