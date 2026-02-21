import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Menu, TreePine, User, LogOut, LayoutDashboard, CalendarCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navLinks = [
  { href: "/", label: "홈" },
  { href: "/about", label: "캠핑장 소개" },
  { href: "/sites", label: "사이트 안내" },
  { href: "/availability", label: "예약 현황" },
  { href: "/reserve", label: "예약하기" },
  { href: "/inquiry", label: "문의하기" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { logout(); window.location.href = "/"; },
  });

  const isHome = location === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navClass = isHome
    ? `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
      }`
    : "sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-border";

  const textClass = isHome && !scrolled ? "text-white" : "text-foreground";
  const logoClass = isHome && !scrolled ? "text-white" : "text-primary";

  return (
    <nav className={navClass}>
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/">
            <div className={`flex items-center gap-2 cursor-pointer ${logoClass}`}>
              <TreePine className="w-7 h-7" />
              <div>
                <span className="font-serif text-lg font-semibold leading-tight block">자연속으로</span>
                <span className="text-xs opacity-75 leading-tight block tracking-widest uppercase">Camping Resort</span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                    location === link.href
                      ? "text-primary bg-primary/10"
                      : `${textClass} hover:text-primary hover:bg-primary/5`
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Auth section */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={`flex items-center gap-2 ${textClass}`}>
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.name || "사용자"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/reservations">
                      <CalendarCheck className="w-4 h-4 mr-2" />
                      내 예약 관리
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          관리자 대시보드
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logoutMutation.mutate()} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => window.location.href = getLoginUrl()}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                size="sm"
              >
                <User className="w-4 h-4 mr-2" />
                로그인
              </Button>
            )}
          </div>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={`lg:hidden ${textClass}`}>
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-1 mt-8">
                <div className="flex items-center gap-2 mb-6 px-3">
                  <TreePine className="w-6 h-6 text-primary" />
                  <span className="font-serif text-lg font-semibold text-primary">자연속으로</span>
                </div>
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <span
                      onClick={() => setMobileOpen(false)}
                      className={`block px-3 py-2.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                        location === link.href
                          ? "text-primary bg-primary/10"
                          : "text-foreground hover:text-primary hover:bg-primary/5"
                      }`}
                    >
                      {link.label}
                    </span>
                  </Link>
                ))}
                <div className="border-t border-border mt-4 pt-4">
                  {isAuthenticated && user ? (
                    <>
                      <Link href="/reservations">
                        <span onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-md hover:bg-muted cursor-pointer">
                          <CalendarCheck className="w-4 h-4" /> 내 예약 관리
                        </span>
                      </Link>
                      {user.role === "admin" && (
                        <Link href="/admin">
                          <span onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-md hover:bg-muted cursor-pointer">
                            <LayoutDashboard className="w-4 h-4" /> 관리자 대시보드
                          </span>
                        </Link>
                      )}
                      <button
                        onClick={() => { logoutMutation.mutate(); setMobileOpen(false); }}
                        className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-md hover:bg-muted text-destructive w-full"
                      >
                        <LogOut className="w-4 h-4" /> 로그아웃
                      </button>
                    </>
                  ) : (
                    <Button
                      onClick={() => { window.location.href = getLoginUrl(); setMobileOpen(false); }}
                      className="w-full"
                    >
                      <User className="w-4 h-4 mr-2" />
                      로그인
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
