"use client";

import { ConditionalAdminLayout } from "@/components/global-components/conditional_admin_layout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConditionalAdminLayout>{children}</ConditionalAdminLayout>;
}
