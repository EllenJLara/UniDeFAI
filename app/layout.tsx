import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./styles/layout.scss";
import CursorShadow from "@/components/ui/CursorShadow";
import { AppProviders } from "@/providers";
import { CSPostHogProvider } from "./providers";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import NextTopLoader from "nextjs-toploader";
import { EarlyAccessPopup } from "@/components/EarlyAccess/EarlyAccessPopup";
import { headers } from "next/headers";
import { TransactionApproval } from "@/components/trading-page/TransactionApproval";
import { useApprovalStatus } from "@/hooks/useApprovalStatus";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UniDeFAI - A Crypto Super App",
  description:
    "Next-generation social trading platform for humans and AI agents",
  applicationName: "UniDeFAI",
  keywords: [
    "crypto",
    "trading",
    "social trading",
    "AI",
    "blockchain",
    "cryptocurrency",
  ],
  authors: [{ name: "UniDeFAI" }],
  metadataBase: new URL("https://www.unidefai.network/"), // Replace with your actual domain
  openGraph: {
    title: "UniDeFAI - A Crypto Super App",
    description:
      "Next-generation social trading platform for humans and AI agents",
    url: "https://www.unidefai.network/", 
    siteName: "UniDeFAI",
    images: [
      {
        url: "images/twitter-card.png", 
        width: 1200,
        height: 630,
        alt: "UniDeFAI - A Crypto Super App",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UniDeFAI - A Crypto Super App",
    description:
      "Next-generation social trading platform for humans and AI agents",
    creator: "@tryunidefai",
    site: "@tryunidefai",
    images: ["images/twitter-card.png"], 
  },
  manifest: "/manifest.json",
  themeColor: "#1DA1F2",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: "UniDeFAI",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = (await headersList.get("x-pathname")) || "/";
  const session = await getServerSession(authOptions);
  let isApproved = false;
  if (session?.user?.id) {
    const { GET } = await import("@/app/api/approved/route");
    const response = await GET();
    const data = await response.json();
    isApproved = data.approved;
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1DA1F2" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="UniDeFAI" />
      </head>
      <CSPostHogProvider>
        <body className={inter.className}>
          <NextTopLoader
            color="#A855F7"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px rgb(168, 26, 175),0 0 5px rgb(169, 30, 167)"
          />
          <ServiceWorkerRegistration />
          <CursorShadow />
          <AppProviders
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {pathname !== "/" && !isApproved && <EarlyAccessPopup />}
            <div
              className={
                pathname !== "/" && !isApproved ? "pointer-events-none" : ""
              }
            >
              {children}
            </div>
          </AppProviders>
          <TransactionApproval />
        </body>
      </CSPostHogProvider>
    </html>
  );
}
