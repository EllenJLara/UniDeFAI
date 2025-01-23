import { signIn } from "next-auth/react";
import { Button } from "../ui/button";
import { FcGoogle } from "react-icons/fc";
import PhantomWalletButton from "../wallet/WalletConnect";
import posthog from "posthog-js";
import { PrivyLoginButton } from "../wallet/PrivyLoginButton";

const SignInOptions = ({ onlyWallet = false }) => {
  return (
    <div className="flex flex-col items-center">
      <br />
      <PrivyLoginButton />
      {/* <PhantomWalletButton /> */}

      {!onlyWallet && (
        <>
          <div className="flex items-center w-[75%] mt-4">
            <div className="h-px bg-gray-700 flex-grow" />
            <p className="mx-4 text-sm font-mono text-gray-400">or</p>
            <div className="h-px bg-gray-700 flex-grow" />
          </div>

          <Button
            onClick={() => {
              posthog.capture("sign_in_attempt", { method: "google" });
              signIn("google");
            }}
            size="lg"
            className="rounded-[3px] web3-button google-button flex items-center justify-center gap-2 w-[75%] mt-4"
          >
            <FcGoogle size={24} />
            <span>Sign in with Google</span>
          </Button>
        </>
      )}
    </div>
  );
};

export default SignInOptions;
