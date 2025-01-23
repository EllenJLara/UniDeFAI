"use client";
import { useSession } from "next-auth/react";
import React from "react";
import Sidebar from "../sidebar/sidebar";
import { Toaster } from "../ui/toaster";
import NextTopLoader from "nextjs-toploader";
import Aside from "../aside/aside";
import LoadingScreen from "../elements/loading-screen/loading-screen";
import Auth from "../auth_user"; 
import MobileNavbar from "../navbar/mobile-navbar";
import { TransactionApproval } from '../trading-page/TransactionApproval';

interface Props {
  children: React.ReactNode;
}

const Home = ({ children }: Props) => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <LoadingScreen />;
  }

  return (
    <> 
        <div className="layout max-w-[1265px]">
          <MobileNavbar/>
          <Sidebar />
          <main
            aria-label="Home timeline"
            id="home-timeline"
            className={window.innerWidth <= 768? "w-[100vw] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full" : ""}
          >
            <NextTopLoader
              color="#A855F7"
              initialPosition={0.08}
              crawlSpeed={200}
              height={3}
              crawl={true}
              showSpinner={false}
              easing="ease"
              speed={200}
              shadow="0 0 10pxrgb(168, 26, 175),0 0 5pxrgb(169, 30, 167)"
            />

            {children}
            <Toaster />
          </main>
          <Aside />
        </div>
    </>
  );
};

export default Home;
