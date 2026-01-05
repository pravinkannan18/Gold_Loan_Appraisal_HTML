import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    PlusCircle,
    Camera,
    ClipboardCheck,
    FlaskConical,
    FileText,
    Settings,
    LogOut,
    ChevronLeft,
    Menu,
    Bell,
    Search,
    User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ModernLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

export function ModernLayout({ children, title, subtitle }: ModernLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: PlusCircle, label: 'New Appraisal', path: '/new-appraisal' },
        { icon: FileText, label: 'Records', path: '/records' },
    ];

    const workflowItems = [
        { icon: Camera, label: 'Customer Image', path: '/customer-image' },
        { icon: ClipboardCheck, label: 'RBI Compliance', path: '/rbi-compliance' },
        { icon: FlaskConical, label: 'Purity Testing', path: '/purity-testing' },
        { icon: FileText, label: 'Summary', path: '/appraisal-summary' },
    ];

    const handleLogout = () => {
        navigate('/appraiser-details');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-slate-900 text-white fixed h-full z-30 transition-all duration-300 ease-in-out flex flex-col shadow-xl",
                    isSidebarCollapsed ? "w-16" : "w-64"
                )}
            >
                {/* Sidebar Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                    {!isSidebarCollapsed && (
                        <div className="flex items-center gap-2 font-bold text-lg text-blue-400">
                            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white">
                                G
                            </div>
                            <span>GoldLoan</span>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="text-slate-400 hover:text-white hover:bg-slate-800 ml-auto"
                    >
                        {isSidebarCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </Button>
                </div>

                {/* Navigation */}
                <div className="flex-1 py-6 px-3 space-y-6 overflow-y-auto">
                    {/* Main Menu */}
                    <div>
                        {!isSidebarCollapsed && <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>}
                        <div className="space-y-1">
                            {navItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                        location.pathname === item.path
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                                    )}
                                >
                                    <item.icon className="w-5 h-5 min-w-[1.25rem]" />
                                    {!isSidebarCollapsed && <span>{item.label}</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Workflow (Only visible if inside a workflow) */}
                    {(location.pathname !== '/dashboard' && location.pathname !== '/records') && (
                        <div>
                            {!isSidebarCollapsed && <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Active Workflow</p>}
                            <div className="space-y-1">
                                {workflowItems.map((item) => (
                                    <button
                                        key={item.path}
                                        onClick={() => navigate(item.path)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                            location.pathname === item.path
                                                ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                                                : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                                        )}
                                    >
                                        <item.icon className="w-5 h-5 min-w-[1.25rem]" />
                                        {!isSidebarCollapsed && <span>{item.label}</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-slate-800 transition-colors",
                            isSidebarCollapsed && "justify-center"
                        )}
                    >
                        <LogOut className="w-5 h-5" />
                        {!isSidebarCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main
                className={cn(
                    "flex-1 flex flex-col min-h-screen transition-all duration-300",
                    isSidebarCollapsed ? "ml-16" : "ml-64"
                )}
            >
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-20 px-6 flex items-center justify-between shadow-sm">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold text-slate-800">{title || 'Gold Loan Appraisal'}</h1>
                        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search Bar */}
                        <div className="relative hidden md:block">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search appraisals..."
                                className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 w-64 text-slate-700 outline-none"
                            />
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2 rounded-full hover:bg-gray-100 text-slate-500 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        {/* Profile */}
                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-slate-700">Pravin Kannan</p>
                                <p className="text-xs text-slate-500">Senior Appraiser</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 ring-2 ring-white shadow-sm">
                                <User className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
