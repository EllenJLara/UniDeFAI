import React from "react";
import { Metadata } from "next";
import Home from "@/components/home/home";
import LandingPage from "@/components/landing-page/LandingPage";
import { headers } from 'next/headers';

export const metadata: Metadata = {
  generator:'Next.js',
  applicationName:'UniDeFAI',
  creator: 'UniDeFAI Corp',
  title: {
    template: '%s / UniDeFAI',
    default: 'UniDeFAI',  
  },
}


interface Props {
  children: React.ReactNode;
}

const Layout = async ({ children }: Props) => {
  const headersList = await headers();
  const header_pathname = headersList.get('x-pathname') || "";
  if (header_pathname === "/") {
    return <LandingPage />;
}
  return  <Home>{children}</Home> ;
};

export default Layout;


