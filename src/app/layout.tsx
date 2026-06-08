import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { AppProviders } from "@/components/app-providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "SuDo - Issue tracking for small teams",
    template: "%s | SuDo",
  },
  description:
    "A deployed multi-tenant issue tracker with projects, assignees, saved views, comments, activity history, RBAC, and keyboard-driven workflows.",
  openGraph: {
    title: "SuDo - Issue tracking for small teams",
    description:
      "Plan projects, assign issues, save filtered views, and keep team decisions attached to the work.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SuDo - Issue tracking for small teams",
    description:
      "A production-backed issue tracker built with Next.js, Clerk, Prisma, Neon, and Vercel.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} dark h-full`}
    >
      <body className="min-h-full">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

function getMetadataBase() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!appUrl) {
    return undefined;
  }

  try {
    return new URL(appUrl);
  } catch {
    return undefined;
  }
}
