// app/routes/__root.tsx
import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { ThemeProvider } from "@/components/theme-provider";
import appCss from "@/styles/app.css?url";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Si deseas personalizar la caché de datos
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "description", content: "Victor Tejada — Full Stack Engineer specializing in Go, React, TypeScript, and distributed systems. Explore projects, technical skills, and engineering insights." },
      { name: "keywords", content: "Full Stack Developer, Software Engineer, Go, React, TypeScript, Portfolio, Web Development, Backend, Frontend" },
      { name: "author", content: "Victor Tejada" },
      { property: "og:title", content: "Victor Tejada | Full Stack Engineer" },
      { property: "og:description", content: "Engineering robust backends and immersive frontends. Merging deep technical logic with premium aesthetics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Victor Tejada | Full Stack Engineer" },
      { name: "twitter:description", content: "Engineering robust backends and immersive frontends." },
    ],
    title: "Victor Tejada | Full Stack Engineer",
    links: [
      { rel: "stylesheet", href: appCss },
    ],
  }),
  component: RootComponent,
});

import { TranslationProvider } from "@/lib/translations";

function RootComponent() {
  return (
    <RootDocument>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <TranslationProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Outlet />
            </TooltipProvider>
          </TranslationProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
