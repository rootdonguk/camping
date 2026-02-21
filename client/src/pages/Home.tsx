import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  TreePine, Calendar, MapPin, Star, ChevronRight, Tent, Car, Sparkles, Home as HomeIcon,
  Users, Wifi, Flame, Droplets, ShieldCheck, ArrowRight
} from "lucide-react";

const SITE_TYPE_LABELS: Record<string, string> = {
  tent: "텐트 사이트",
  caravan: "카라반 사이트",
  glamping: "글램핑",
  cabin: "캐빈",
};

const facilities = [
  { icon: <Wifi className="w-6 h-6" />, name: "무료 와이파이", desc: "전 구역 고속 인터넷" },
  { icon: <Flame className="w-6 h-6" />, name: "화로대 & 바베큐", desc: "각 사이트별 개별 제공" },
  { icon: <Droplets className="w-6 h-6" />, name: "온수 샤워실", desc: "24시간 온수 이용 가능" },
  { icon: <ShieldCheck className="w-6 h-6" />, name: "24시간 안전 관리", desc: "전담 스태프 상주" },
  { icon: <Users className="w-6 h-6" />, name: "편의 시설", desc: "매점, 세탁실, 놀이터" },
  { icon: <MapPin className="w-6 h-6" />, name: "자연 트레킹", desc: "다양한 산책로 완비" },
];

const reviews = [
  { name: "김민준", rating: 5, text: "정말 아름다운 캠핑장입니다. 숲 속에서 맑은 공기를 마시며 가족과 함께 최고의 시간을 보냈어요.", date: "2024.11" },
  { name: "이서연", rating: 5, text: "글램핑 시설이 너무 좋았어요. 깨끗하고 아늑한 공간에서 편안하게 쉴 수 있었습니다.", date: "2024.10" },
  { name: "박지호", rating: 5, text: "직원분들이 너무 친절하고 시설도 깔끔합니다. 다음에도 꼭 다시 오고 싶어요!", date: "2024.09" },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data: sites } = trpc.sites.list.useQuery();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1920&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/75" />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-1.5 text-sm">
            🌿 강원도 평창 프리미엄 캠핑 리조트
          </Badge>
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 leading-tight text-balance">
            자연 속에서<br />
            <span className="italic" style={{ color: 'oklch(0.88 0.12 85)' }}>특별한 쉼</span>을 찾다
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            울창한 숲과 맑은 공기 속에서 일상의 피로를 내려놓고, 자연이 선사하는 진정한 휴식을 경험하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/reserve">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-base font-semibold rounded-xl shadow-lg">
                <Calendar className="w-5 h-5 mr-2" />
                지금 예약하기
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 px-8 py-6 text-base font-semibold rounded-xl bg-transparent">
                캠핑장 둘러보기
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent animate-pulse" />
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-primary text-primary-foreground py-8">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "500+", label: "누적 방문객" },
              { value: "4.9★", label: "평균 만족도" },
              { value: "15+", label: "캠핑 사이트" },
              { value: "10년+", label: "운영 경험" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl md:text-3xl font-bold font-serif">{stat.value}</div>
                <div className="text-sm opacity-75 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Camping Sites Preview */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5">캠핑 사이트</Badge>
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">다양한 사이트를 선택하세요</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">텐트부터 글램핑까지, 취향에 맞는 완벽한 캠핑 공간을 제공합니다.</p>
          </div>
          {sites && sites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sites.slice(0, 6).map((site) => (
                <div key={site.id} className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-52 overflow-hidden bg-muted">
                    {site.imageUrl ? (
                      <img src={site.imageUrl} alt={site.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
                        <TreePine className="w-16 h-16 text-primary/40" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-white/90 text-foreground text-xs font-medium">{SITE_TYPE_LABELS[site.siteType]}</Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-1">{site.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{site.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-sm text-muted-foreground"><Users className="w-3.5 h-3.5" />최대 {site.capacity}인</span>
                      <div className="text-right">
                        <span className="text-lg font-bold text-primary">₩{parseInt(site.pricePerNight).toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">/박</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {["텐트 사이트", "글램핑", "캐빈"].map((type, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="h-52 bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                    <TreePine className="w-16 h-16 text-primary/40" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-lg font-semibold mb-2">{type}</h3>
                    <p className="text-sm text-muted-foreground">자연 속에서 즐기는 특별한 캠핑 경험</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link href="/sites">
              <Button variant="outline" size="lg" className="rounded-xl">모든 사이트 보기<ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5">시설 안내</Badge>
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">편안한 캠핑을 위한 모든 것</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">최고의 캠핑 경험을 위해 다양한 편의 시설을 갖추고 있습니다.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {facilities.map((facility, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">{facility.icon}</div>
                <h3 className="font-semibold text-foreground mb-1">{facility.name}</h3>
                <p className="text-sm text-muted-foreground">{facility.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5">방문객 후기</Badge>
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">함께한 소중한 순간들</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{review.text}"</p>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-foreground">{review.name}</span>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">지금 바로 예약하세요</h2>
          <p className="text-lg opacity-80 mb-10 max-w-xl mx-auto">특별한 자연 속 캠핑 경험이 여러분을 기다리고 있습니다.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/reserve">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-base font-semibold rounded-xl">
                <Calendar className="w-5 h-5 mr-2" />예약하기
              </Button>
            </Link>
            <Link href="/availability">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 px-8 py-6 text-base font-semibold rounded-xl bg-transparent">
                예약 현황 확인
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
