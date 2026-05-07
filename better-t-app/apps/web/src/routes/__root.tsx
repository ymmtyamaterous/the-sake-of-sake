import type { AppRouterClient } from "@better-t-app/api/routers/index";
import { Toaster } from "@better-t-app/ui/components/sonner";
import { createORPCClient } from "@orpc/client";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useState } from "react";

import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { link, orpc } from "@/utils/orpc";

import "../index.css";

export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      { title: "The sake of Sake" },
      { name: "description", content: "飲んだお酒を記録・学べるお酒手帳アプリ" },
    ],
    links: [{ rel: "icon", href: "/favicon.ico" }],
  }),
});

function RootComponent() {
  const [client] = useState<AppRouterClient>(() => createORPCClient(link));
  const [orpcUtils] = useState(() => createTanstackQueryUtils(client));

  return (
    <>
      <HeadContent />
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <div className="flex min-h-svh flex-col">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <footer className="border-t bg-card py-8 text-center text-xs text-muted-foreground space-y-2">
            <p className="text-muted-foreground/70">
              ※ サイト内のお酒に関する知識・銘柄情報は生成 AI によって作成されたものです。内容の正確性を保証するものではありません。
            </p>
            <p>© 2026 The sake of Sake. All rights reserved.</p>
          </footer>
        </div>
        <Toaster richColors />
      </ThemeProvider>
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
    </>
  );
}
