"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HeroUIProvider } from "@heroui/system";

interface ClientRouterProviderProps {
  children: React.ReactNode;
}

export const ClientRouterProvider: React.FC<ClientRouterProviderProps> = ({
  children,
}) => {
  const [mounted, setMounted] = useState(false);
  const [router, setRouter] = useState<any>(null);

  useEffect(() => {
    try {
      const r = useRouter();
      setRouter(r);
      setMounted(true);
    } catch (e) {
      setMounted(true);
    }
  }, []);

  if (!mounted || !router) {
    return <>{children}</>;
  }

  return (
    <HeroUIProvider navigate={router.push} locale="en-GB">
      {children}
    </HeroUIProvider>
  );
};
