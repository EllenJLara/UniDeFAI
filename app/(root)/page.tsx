import React from "react";
import { Metadata } from "next";
import LandingPage from '@/components/landing-page/LandingPage';

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

const page = () => {
  return <LandingPage /> ;
};

export default page;


