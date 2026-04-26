import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/hooks/useAuth";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Hub Nexus — O sistema operacional do seu negócio" },
      {
        name: "description",
        content:
          "Estoque, Financeiro, Vendas, Devoluções e mais. Ative apenas os módulos que precisa hoje. Escale conforme cresce.",
      },
      { name: "author", content: "Hub Nexus" },
      { property: "og:title", content: "Hub Nexus — O sistema operacional do seu negócio" },
      {
        property: "og:description",
        content: "A operação inteira da sua empresa, em um só lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Hub Nexus — O sistema operacional do seu negócio" },
      { name: "description", content: "Core Business Hub is a SaaS platform that acts as a business's operating system, centralizing all software modules." },
      { property: "og:description", content: "Core Business Hub is a SaaS platform that acts as a business's operating system, centralizing all software modules." },
      { name: "twitter:description", content: "Core Business Hub is a SaaS platform that acts as a business's operating system, centralizing all software modules." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9a62e2be-b871-41c6-bbb5-95fd2dba8a0e/id-preview-f022bb22--0a3cf3ba-9045-4946-a7b6-767b7abd2c6d.lovable.app-1777215538406.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9a62e2be-b871-41c6-bbb5-95fd2dba8a0e/id-preview-f022bb22--0a3cf3ba-9045-4946-a7b6-767b7abd2c6d.lovable.app-1777215538406.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
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

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
