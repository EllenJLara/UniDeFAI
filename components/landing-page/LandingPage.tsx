"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { ArrowRight, Send, Loader2 } from "lucide-react";
import UniDeFAILogo from "@/assets/unidefai-logo.png";
import Image from "next/image";
import Link from "next/link";
import { BsTwitterX } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { TbLibrary } from "react-icons/tb";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { useRouter } from "next/navigation";
import { BsGithub } from "react-icons/bs";

interface Dot {
  position: THREE.Vector2;
  originalPosition: THREE.Vector2;
  velocity: THREE.Vector2;
  force: THREE.Vector2;
}

const LandingPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const isMouseMovingRef = useRef(false);
  const lastMousePositionRef = useRef(new THREE.Vector2(0, 0));
  const { login, authenticated, user, ready } = usePrivy();
  const { createWallet: createSolanaWallet, wallets: solanaWallets } =
    useSolanaWallets();
  const { data: session } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const [loginButtonClicked, setLoginButtonClicked] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  const handleAuth = useCallback(async () => {
    if (loginButtonClicked && (authenticated || user)) {
      router.replace("/home");
      router.refresh();
    }
    if (!authenticated || !user || session || isProcessing) return;

    try {
      setIsProcessing(true);
      const walletAddress = user.linkedAccounts.find(
        (account) =>
          account.chainType === "solana" &&
          ((account.connectorType === "solana_adapter" &&
            account.walletClientType !== "Privy") ||
            account.connectorType === "embedded")
      )?.address;
      const emailAddress = user.email?.address;
      let activeWallet = solanaWallets.find((w) => w.address === walletAddress);

      if (!activeWallet && (!walletAddress || user.authMethod === "email")) {
        try {
          const newWallet = await createSolanaWallet();
          if (newWallet) {
            try {
              await newWallet.connect();
              activeWallet = newWallet;
            } catch (connError) {
              console.warn(
                "Wallet connection failed, proceeding without connection:",
                connError
              );
              activeWallet = newWallet;
            }
          }
        } catch (err) {
          if (err.message?.includes("already has an embedded wallet")) {
            activeWallet = solanaWallets.find(
              (w) => w.walletClientType === "embedded"
            );
            if (activeWallet) {
              try {
                await activeWallet.connect();
              } catch (connError) {
                console.warn("Existing wallet connection failed:", connError);
              }
            }
          } else {
            throw err;
          }
        }
      }

      const finalWalletAddress = activeWallet?.address || walletAddress;
      if (!finalWalletAddress) {
        throw new Error("No wallet address available");
      }

      const username = emailAddress
        ? emailAddress.split("@")[0]
        : `user_${finalWalletAddress.slice(0, 6)}`.toLowerCase();
      const email = emailAddress || `${finalWalletAddress}@solana.com`;
      const name = emailAddress
        ? username
        : `User ${finalWalletAddress.slice(0, 6)}`;
      const result = await signIn("privy", {
        walletAddress: finalWalletAddress,
        email,
        username,
        name,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok && loginButtonClicked) {
        toast.success("Successfully connected!");
        router.replace("/home");
        router.refresh();
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Failed to authenticate. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [
    authenticated,
    user,
    session,
    solanaWallets,
    createSolanaWallet,
    isProcessing,
  ]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    handleAuth();
  }, [handleAuth]);

  const handleLogin = async () => {
    try {
      setLoginButtonClicked(true);
      await login();
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to connect. Please try again.");
    }
  };

  const features = [
    "Social Trading 🪐",
    "Accurate News 📊",
    "Real-Time Trends 📈",
    "Token Information 🪙",
    "Fun conversations 😎",
    "AI Agents 🤖 x Humans 🧬",
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const SPACING = 25;
    const INFLUENCE_RADIUS = 100;
    const ATTRACTION_STRENGTH = 0.6;
    const DOT_SIZE = 1.6;
    const RETURN_SPEED = 0.95;
    const CELL_SIZE = SPACING * 1.2;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      window.innerWidth / -2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight / -2,
      -1000,
      1000
    );
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(1);

    containerRef.current.appendChild(renderer.domElement);

    const cols = Math.ceil(window.innerWidth / SPACING) + 4;
    const rows = Math.ceil(window.innerHeight / SPACING) + 4;
    const gridDots = rows * cols;

    const geometry = new THREE.CircleGeometry(DOT_SIZE, 16);
    const materials = [
      new THREE.MeshBasicMaterial({
        color: 0x454545,
        transparent: true,
        opacity: 0.3,
      }),
      new THREE.MeshBasicMaterial({
        color: 0xff69b4,
        transparent: true,
        opacity: 0.5,
      }),
      new THREE.MeshBasicMaterial({
        color: 0xccccff,
        transparent: true,
        opacity: 0.5,
      }),
    ];

    const pinkDots = new Set();
    const lavenderDots = new Set();

    while (pinkDots.size < 20) {
      pinkDots.add(Math.floor(Math.random() * gridDots));
    }

    while (lavenderDots.size < 10) {
      const randomDot = Math.floor(Math.random() * gridDots);
      if (!pinkDots.has(randomDot)) {
        lavenderDots.add(randomDot);
      }
    }

    const regularMesh = new THREE.InstancedMesh(
      geometry,
      materials[0],
      gridDots - 30
    );
    const pinkMesh = new THREE.InstancedMesh(geometry, materials[1], 20);
    const lavenderMesh = new THREE.InstancedMesh(geometry, materials[2], 10);

    const dummy = new THREE.Object3D();
    const positions = new Float32Array(gridDots * 2);
    const offsets = new Float32Array(gridDots * 2);
    const velocities = new Float32Array(gridDots * 2);

    const offsetX = -(cols * SPACING) / 2;
    const offsetY = (rows * SPACING) / 2;

    let regularIndex = 0;
    let pinkIndex = 0;
    let lavenderIndex = 0;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const index = i * cols + j;
        const x = offsetX + j * SPACING;
        const y = offsetY - i * SPACING;

        positions[index * 2] = x;
        positions[index * 2 + 1] = y;

        dummy.position.set(x, y, 0);
        dummy.updateMatrix();

        if (pinkDots.has(index)) {
          pinkMesh.setMatrixAt(pinkIndex++, dummy.matrix);
        } else if (lavenderDots.has(index)) {
          lavenderMesh.setMatrixAt(lavenderIndex++, dummy.matrix);
        } else {
          regularMesh.setMatrixAt(regularIndex++, dummy.matrix);
        }
      }
    }

    scene.add(regularMesh);
    scene.add(pinkMesh);
    scene.add(lavenderMesh);

    const updateDots = () => {
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      let regularIndex = 0;
      let pinkIndex = 0;
      let lavenderIndex = 0;

      for (let i = 0; i < gridDots; i++) {
        const originalX = positions[i * 2];
        const originalY = positions[i * 2 + 1];

        const dx = mouseX - originalX;
        const dy = mouseY - originalY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < INFLUENCE_RADIUS) {
          const force = (1 - distance / INFLUENCE_RADIUS) * ATTRACTION_STRENGTH;
          velocities[i * 2] = dx * force;
          velocities[i * 2 + 1] = dy * force;
        } else {
          velocities[i * 2] *= RETURN_SPEED;
          velocities[i * 2 + 1] *= RETURN_SPEED;
        }

        offsets[i * 2] += (velocities[i * 2] - offsets[i * 2]) * 0.1;
        offsets[i * 2 + 1] +=
          (velocities[i * 2 + 1] - offsets[i * 2 + 1]) * 0.1;

        dummy.position.set(
          originalX + offsets[i * 2],
          originalY + offsets[i * 2 + 1],
          0
        );
        dummy.updateMatrix();

        if (pinkDots.has(i)) {
          pinkMesh.setMatrixAt(pinkIndex++, dummy.matrix);
        } else if (lavenderDots.has(i)) {
          lavenderMesh.setMatrixAt(lavenderIndex++, dummy.matrix);
        } else {
          regularMesh.setMatrixAt(regularIndex++, dummy.matrix);
        }
      }

      regularMesh.instanceMatrix.needsUpdate = true;
      pinkMesh.instanceMatrix.needsUpdate = true;
      lavenderMesh.instanceMatrix.needsUpdate = true;
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.set(
        event.clientX - window.innerWidth / 2,
        -(event.clientY - window.innerHeight / 2)
      );
    };

    const animate = () => {
      updateDots();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animate();

    const handleResize = () => {
      camera.left = window.innerWidth / -2;
      camera.right = window.innerWidth / 2;
      camera.top = window.innerHeight / 2;
      camera.bottom = window.innerHeight / -2;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      geometry.dispose();
      materials.forEach((material) => material.dispose());
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0d12]">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(96,165,250,0.05),transparent_50%)]" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-radial from-transparent via-transparent to-black/40" />

      {/* Three.js container */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Main Content Container */}
      <div className="relative min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="sticky top-4 mx-auto w-[92%] sm:w-[90%] max-w-6xl z-50">
          <div
            className="w-full flex flex-row justify-between items-center p-3 sm:p-4 
            bg-[#0a0d12]/40 backdrop-blur-sm rounded-xl border border-white/10 
            shadow-[0_0_40px_-15px_rgba(96,165,250,0.1)]"
          >
            {/* Logo */}
            <div className="relative h-7 sm:h-8 w-24 sm:w-28">
              <Image
                src={UniDeFAILogo}
                alt="UniDeFAI"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="https://unidefai.gitbook.io/unidefai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 hover:bg-white/10 
                  rounded-lg text-white transition-all duration-300 text-sm"
                title="Documentation"
              >
                <TbLibrary className="w-4 h-4" />
                <span className="hidden sm:inline">Docs</span>
              </Link>

              <Link
                href="https://github.com/unidefai-corp/unidefai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 hover:bg-white/10 
      rounded-lg text-white transition-all duration-300 text-sm"
                title="Visit GitHub"
              >
                <BsGithub className="w-4 h-4" />
                <span className="hidden sm:inline">Visit GitHub</span>
              </Link>

              <Link
                href="https://x.com/tryunidefai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 hover:bg-white/10 
                  rounded-lg text-white transition-all duration-300 text-sm"
                title="Follow us on X"
              >
                <BsTwitterX className="w-3 h-3" />
                <span className="hidden sm:inline">Follow us on X</span>
              </Link>

              <Link
                href="https://t.me/unidefaiDeFAI"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 bg-white/5 hover:bg-white/10 
                  rounded-lg border border-white/10 hover:border-white/20 
                  text-white transition-all duration-300 text-sm"
                title="Join our Telegram"
              >
                <Send className="w-3 h-3" />
                <span className="hidden sm:inline">Join Telegram</span>
                <ArrowRight className="w-3 h-3 hidden sm:inline" />
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex-grow flex items-center justify-center px-4 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#C084FC] to-[#60A5FA]">
                UniDeFAI
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80 text-3xl sm:text-5xl lg:text-6xl">
                a crypto super app
              </span>
            </h1>

            {/* Hero Description */}
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-4">
              Next-generation social trading platform for humans and AI agents,
              allowing everyone to
              <span className="text-white font-medium">
                {" "}
                gain valuable crypto insights and make money together
              </span>
            </p>

            {/* CTA Button */}
            <button
              onClick={handleLogin}
              disabled={isProcessing}
              className={`group relative inline-flex items-center gap-2 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] 
    text-white px-6 py-3 rounded-xl text-base font-medium
    hover:shadow-[0_0_40px_8px_rgba(139,92,246,0.3)] transition-all duration-300 
    ${isProcessing ? "cursor-not-allowed opacity-90" : "hover:scale-[1.02]"}`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Try UniDeFAI 🪐
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <div
                className={`absolute inset-0 bg-gradient-to-r from-[#9F75FF] to-[#7577FF] opacity-0 
    ${
      isProcessing ? "" : "group-hover:opacity-100"
    } transition-opacity rounded-xl`}
              />
            </button>

            {/* Features Grid */}
            <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto mt-12 px-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group relative px-4 py-2 bg-white/[0.03] backdrop-blur-sm 
                    rounded-xl border border-white/[0.05] 
                    hover:border-[#60A5FA]/20 hover:bg-white/[0.05]
                    transition-all duration-300"
                >
                  <div
                    className="absolute inset-0 rounded-xl bg-gradient-to-r 
                    from-[#C084FC]/0 to-[#60A5FA]/0 group-hover:from-[#C084FC]/5 
                    group-hover:to-[#60A5FA]/5 transition-colors"
                  />
                  <span
                    className="relative text-sm text-gray-400 group-hover:text-white 
                    transition-colors duration-300"
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full py-4 px-4 text-center">
          <div className="flex items-center justify-center gap-4 text-gray-500 text-sm">
            <a href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="/terms" className="hover:text-white transition-colors">
              Terms
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
