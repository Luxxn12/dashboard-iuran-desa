
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { Bell } from "lucide-react";

export default async function NotificationMobile() {
  const session = await getServerSession(authOptions);
  const notifications = await prisma.notification.findMany({
    where: {
      userId: session?.user.id,
      isRead: false,
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div>
      <Link href="/dashboard/notifications">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-medium text-white">
              {notifications.length}
            </span>
          )}
          <span className="sr-only">Notifikasi</span>
        </Button>
      </Link>
    </div>
  );
}
