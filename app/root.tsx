import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { Navigation } from "./components/navbar";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="বাংলাদেশের সংবাদ ও তথ্য যাচাই করুন AI চালিত ফ্যাক্ট চেকার দিয়ে। ছবি সহ বা ছবি ছাড়াই যেকোনো সংবাদ যাচাই করুন।"
        />
        <meta
          name="keywords"
          content="বাংলা সংবাদ, ফ্যাক্ট চেক, AI, যাচাইকারী, বাংলাদেশ, সংবাদ যাচাই"
        />
        <meta name="author" content="Bengali Fact Checker Team" />
        <meta
          property="og:title"
          content="বাংলা সংবাদ যাচাইকারী - AI চালিত ফ্যাক্ট চেকার"
        />
        <meta
          property="og:description"
          content="বাংলাদেশের সংবাদ ও তথ্য যাচাই করুন AI চালিত ফ্যাক্ট চেকার দিয়ে।"
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="বাংলা সংবাদ যাচাইকারী - AI চালিত ফ্যাক্ট চেকার"
        />
        <meta
          name="twitter:description"
          content="বাংলাদেশের সংবাদ ও তথ্য যাচাই করুন AI চালিত ফ্যাক্ট চেকার দিয়ে।"
        />
        <title>বাংলা সংবাদ যাচাইকারী - AI চালিত ফ্যাক্ট চেকার</title>
        <Meta />
        <Links />
      </head>
      <body className="bg-background text-foreground antialiased">
        <Navigation></Navigation>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
