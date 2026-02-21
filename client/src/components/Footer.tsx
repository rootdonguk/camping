import { Link } from "wouter";
import { TreePine, MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[oklch(0.18_0.025_140)] text-white">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <TreePine className="w-7 h-7 text-[oklch(0.72_0.12_85)]" />
              <div>
                <span className="font-serif text-xl font-semibold block">자연속으로</span>
                <span className="text-xs opacity-60 tracking-widest uppercase">Camping Resort</span>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              자연과 함께하는 특별한 캠핑 경험. 아름다운 숲 속에서 잊지 못할 추억을 만들어 드립니다.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/80 mb-4">빠른 메뉴</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/about", label: "캠핑장 소개" },
                { href: "/sites", label: "사이트 안내" },
                { href: "/availability", label: "예약 현황" },
                { href: "/reserve", label: "예약하기" },
                { href: "/inquiry", label: "문의하기" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-white/60 hover:text-white transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/80 mb-4">이용 안내</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li>체크인: 오후 2시</li>
              <li>체크아웃: 오전 11시</li>
              <li>반려동물 동반 가능</li>
              <li>화로대 사용 가능</li>
              <li>취사 가능</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/80 mb-4">연락처</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-white/60">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[oklch(0.72_0.12_85)]" />
                <span>강원도 평창군 대관령면 자연속으로길 123</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-white/60">
                <Phone className="w-4 h-4 shrink-0 text-[oklch(0.72_0.12_85)]" />
                <span>033-123-4567</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-white/60">
                <Mail className="w-4 h-4 shrink-0 text-[oklch(0.72_0.12_85)]" />
                <span>info@camping-resort.kr</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © 2024 자연속으로 캠핑장. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <span className="cursor-pointer hover:text-white/60">개인정보처리방침</span>
            <span className="cursor-pointer hover:text-white/60">이용약관</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
