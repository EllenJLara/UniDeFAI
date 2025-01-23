import { signIn, useSession } from "next-auth/react";
import React from "react";
import { Logo } from "./logo";
import Navbar from "../navbar/navbar";
import TweetButton from "../create-tweet/tweet-button";
import SessionUserButton from "../auth_user/session-user-button";
import SignInOptions from "../elements/login-popup";
import { useApprovalStatus } from "@/hooks/useApprovalStatus";

function Sidebar() {
  const { data: session } = useSession();
  const { data: isApproved } = useApprovalStatus(session?.user?.id);

  return (
    <header className="sidebar_container hidden sticky top-0 h-dvh overflow-y-auto sm:grid sm:p-[4px] md:py-[4px] md:px-[0.5em] xxl:justify-start z-[950] pointer-events-auto">
      <div className="xxl:justify-start flex justify-center">
        <Logo />
      </div>
      <div className="">
        <Navbar isDemo={!isApproved} />
      </div>
      {/* <div className="xxl:justify-start  flex justify-center">
        <GithubButton />
      </div> */}

        <div className="xxl:justify-start  flex justify-center">
          <TweetButton isDemo={!isApproved}/>
        </div>

        <div className="xxl:justify-start mt-auto flex">
          <SessionUserButton isDemo={!isApproved} />
        </div>
      
    {/* {(!session || !) && <SignInOptions/>} */}
    </header>
  );
}

export default Sidebar;




// backup code
// import { signIn, useSession } from "next-auth/react";
// import React from "react";
// import { Logo } from "./logo";
// import Navbar from "../navbar/navbar";
// import TweetButton from "../create-tweet/tweet-button";
// import SessionUserButton from "../auth_user/session-user-button";
// import SignInOptions from "../elements/login-popup";
// import { useApprovalStatus } from "@/hooks/useApprovalStatus";

// function Sidebar() {
//   const { data: session } = useSession();
//   const { data: isApproved } = useApprovalStatus(session?.user?.id);

//   return (
//     <header className="sidebar_container hidden sticky top-0 h-dvh overflow-y-auto sm:grid sm:p-[4px] md:py-[4px] md:px-[0.5em] xxl:justify-start z-[950] pointer-events-auto">
//       <div className="xxl:justify-start flex justify-center">
//         <Logo />
//       </div>
//       <div className="">
//         <Navbar isDemo={!isApproved} />
//       </div>
//       {/* <div className="xxl:justify-start  flex justify-center">
//         <GithubButton />
//       </div> */}

// <<<<<<< HEAD
// =======

//       {session?.user && (
// >>>>>>> privy-wallet
//         <div className="xxl:justify-start  flex justify-center">
//           <TweetButton isDemo={!isApproved}/>
//         </div>
// <<<<<<< HEAD

//         <div className="xxl:justify-start mt-auto flex">
//           <SessionUserButton isDemo={!isApproved} />
// =======
//       )}
     
//       {session?.user && (
//         <div className="xxl:justify-start  mt-auto flex">
//           <SessionUserButton />
// >>>>>>> privy-wallet
//         </div>
      
// <<<<<<< HEAD
//     {/* {(!session || !) && <SignInOptions/>} */}
// =======
//     {!session?.user && <SignInOptions/>}
// >>>>>>> privy-wallet
//     </header>
//   );
// }

// export default Sidebar;