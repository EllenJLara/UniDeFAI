"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Send, CircleCheckBig } from "lucide-react";
import { BsTwitterX } from "react-icons/bs";

const BenefitsList = () => {
  const benefits = [
    { text: "Early Access to new features", icon: CircleCheckBig },
    { text: "Higher Rewards & Commissions", icon: CircleCheckBig },
    { text: "Shape Decisions via governance", icon: CircleCheckBig },
    { text: "Priority Support", icon: CircleCheckBig },
  ];

  return (
    <ul className="space-y-3">
      {benefits.map((benefit, index) => (
        <motion.li
          key={index}
          className="flex items-center text-gray-300/80 text-sm"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <benefit.icon className="w-4 h-4 text-purple-400 mr-3 flex-shrink-0" />
          {benefit.text}
        </motion.li>
      ))}
    </ul>
  );
};

export function EarlyAccessPopup() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[900] flex items-center justify-center p-4 bg-[#14181f]/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
        }}
      >
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-[#14181f]/40 backdrop-blur-md" />

        {/* Highlight effect */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Content container */}
        <div className="relative px-6 py-8 sm:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 text-center">
            Early Access Program
          </h2>
          <p className="mb-6 text-gray-300/90 leading-relaxed text-sm sm:text-base text-center">
            Be among the first to shape our revolutionary platform. Join our
            community and stay updated.
          </p>

          <div
            className="mb-8 rounded-xl p-4 sm:p-6"
            style={{
              background:
                "linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
            }}
          >
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-white/90">
              Exclusive Benefits
            </h3>

            <BenefitsList />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="w-full bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 backdrop-blur-sm rounded-lg"
              onClick={() => window.open("https://x.com/messages/compose?recipient_id=1820262583854845952", "_blank")}
            >
              <BsTwitterX size={16} className="mr-2" />
              Message us on X
            </Button>
            <Button
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-blue-500/20 rounded-lg"
              onClick={() => window.open("https://t.me/unidefaiDeFAI", "_blank")}
            >
              <Send size={16} className="mr-2" />
              Join Telegram
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
