
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PremiumLayoutProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    showBackButton?: boolean;
    showUserInfo?: boolean;
    className?: string;
}

export function PremiumLayout({
    children,
    title,
    subtitle,
    showBackButton = true,
    showUserInfo = true,
    className = ""
}: PremiumLayoutProps) {
    const navigate = useNavigate();
    // Mock user for now, in real app likely from context
    const userName = "Appraiser";

    const handleSignOut = () => {
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-background relative overflow-x-hidden selection:bg-[#D4AF37]/30 selection:text-[#D4AF37]">
            {/* Global Background Effects */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.05)_0%,_transparent_45%),_radial-gradient(circle_at_bottom,_rgba(14,165,233,0.05)_0%,_transparent_55%)] pointer-events-none" />
            <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.02] pointer-events-none mix-blend-overlay" />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/10 backdrop-blur-md transition-all duration-300">
                <div className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        {showBackButton && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(-1)}
                                className="text-[#8F9BA9] hover:text-[#DEE7EA] hover:bg-white/5 rounded-full"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        )}

                        <div className="flex items-center gap-2">
                            {/* Logo small if needed, or just text */}
                            {!title && (
                                <img
                                    src="/Embsys%20Intelligence%20logo.png"
                                    alt="Embsys Intelligence"
                                    className="h-8 w-auto opacity-80"
                                />
                            )}
                            {title && (
                                <div className="flex flex-col">
                                    <h1 className="text-xl font-heading font-medium text-[#DEE7EA] tracking-wide">{title}</h1>
                                    {subtitle && <p className="text-xs text-[#8F9BA9] font-light">{subtitle}</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    {showUserInfo && (
                        <div className="flex items-center gap-6">
                            <span className="hidden md:inline text-sm font-medium tracking-wide text-[#8F9BA9]">
                                Welcome, <span className="text-[#DEE7EA]">{userName}</span>
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSignOut}
                                className="text-[#8F9BA9] hover:text-[#D4AF37] hover:bg-white/5"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </Button>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className={`relative pt-24 pb-12 px-4 container mx-auto ${className}`}>
                {children}
            </main>
        </div>
    );
}
