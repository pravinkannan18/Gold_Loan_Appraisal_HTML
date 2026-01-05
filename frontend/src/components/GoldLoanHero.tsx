
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Gem, Shield, TrendingUp, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function GoldLoanHero() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden py-20">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.03)_0%,_transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] pointer-events-none mix-blend-overlay" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center max-w-5xl mx-auto px-6 text-center"
      >
        {/* Top Label */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-8"
        >
          <span className="inline-block py-1 px-3 border border-[#D4AF37]/30 rounded-full text-[#D4AF37] text-xs uppercase tracking-[0.2em] font-medium bg-[#D4AF37]/5 backdrop-blur-sm">
            Gold Guardian Pro
          </span>
        </motion.div>

        {/* Main Heading */}
        <h1 className="font-heading text-6xl md:text-8xl lg:text-9xl font-medium tracking-tight text-[#DEE7EA] mb-8 leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
          Precision <br />
          <span className="italic font-light text-[#D4AF37]">Valuation</span>
        </h1>

        {/* Description */}
        <p className="font-sans text-lg md:text-xl text-[#8F9BA9] max-w-2xl mb-12 font-light leading-relaxed tracking-wide">
          Experience the pinnacle of gold appraisal technology.
          AI-powered precision meets banking-grade security for the modern era.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 mb-24">
          <Button
            size="lg"
            variant="premium"
            onClick={() => navigate("/new-appraisal")}
            className="group"
          >
            Start New Appraisal
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="text-[#DEE7EA] border-[#8F9BA9]/30 hover:bg-[#8F9BA9]/10 hover:border-[#8F9BA9]/50"
          >
            View Dashboard
          </Button>
        </div>

        {/* Features - Minimalist */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl border-t border-white/5 pt-12">
          <div className="flex flex-col items-center gap-3 p-4">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
              <Shield className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h3 className="text-[#DEE7EA] font-heading text-lg">Secure & Private</h3>
            <p className="text-[#8F9BA9] text-sm text-center font-light">Bank-grade encryption for all your appraisal data.</p>
          </div>
          <div className="flex flex-col items-center gap-3 p-4">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
              <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h3 className="text-[#DEE7EA] font-heading text-lg">Real-time Rates</h3>
            <p className="text-[#8F9BA9] text-sm text-center font-light">Live market integration for accurate valuations.</p>
          </div>
          <div className="flex flex-col items-center gap-3 p-4">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
              <Gem className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h3 className="text-[#DEE7EA] font-heading text-lg">AI Analysis</h3>
            <p className="text-[#8F9BA9] text-sm text-center font-light">Computer vision for purity verification.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
