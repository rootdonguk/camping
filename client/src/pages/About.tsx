import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, Clock, TreePine, Mountain, Wind, Droplets, Calendar } from "lucide-react";
import { MapView } from "@/components/Map";

const usageGuide = [
  { step: "01", title: "예약 신청", desc: "원하는 날짜와 사이트를 선택하고 예약 정보를 입력합니다." },
  { step: "02", title: "예약 확인", desc: "관리자 승인 후 예약 확정 알림을 받습니다. (1-2 영업일 소요)" },
  { step: "03", title: "결제 완료", desc: "보증금 또는 전액을 결제하여 예약을 확정합니다." },
  { step: "04", title: "체크인", desc: "체크인 당일 오후 2시 이후 방문하여 즐거운 캠핑을 시작하세요!" },
];

const rules = [
  "체크인 오후 2시 / 체크아웃 오전 11시",
  "취침 시간(오후 10시) 이후 정숙 유지",
  "지정된 장소 외 화기 사용 금지",
  "쓰레기 분리수거 및 개인 쓰레기 반출",
  "반려동물 동반 시 목줄 착용 필수",
  "타 사이트 무단 출입 금지",
  "음주 후 차량 운전 절대 금지",
  "자연 훼손 행위 금지",
];

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-72 md:h-96 flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1537905569824-f89f14cceb68?w=1920&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="relative z-10 container pb-10">
          <Badge className="mb-3 bg-white/20 text-white border-white/30">캠핑장 소개</Badge>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white">자연속으로 캠핑장</h1>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5">소개</Badge>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
                자연과 함께하는<br />특별한 캠핑 경험
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  자연속으로 캠핑장은 강원도 평창군 대관령면의 울창한 숲 속에 자리한 프리미엄 캠핑 리조트입니다. 해발 800m의 청정 고원 지대에 위치하여 사계절 내내 맑은 공기와 아름다운 자연 경관을 즐길 수 있습니다.
                </p>
                <p>
                  2014년 개장 이래 10년간 수천 명의 가족과 커플, 친구들이 이곳에서 잊지 못할 추억을 만들었습니다. 텐트 사이트부터 고급 글램핑, 아늑한 캐빈까지 다양한 숙박 형태를 제공하여 모든 캠퍼의 취향을 만족시킵니다.
                </p>
                <p>
                  자연 속에서의 진정한 휴식을 원하신다면, 자연속으로 캠핑장이 최고의 선택이 될 것입니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-8">
                {[
                  { icon: <Mountain className="w-4 h-4" />, text: "해발 800m 고원" },
                  { icon: <TreePine className="w-4 h-4" />, text: "울창한 원시림" },
                  { icon: <Wind className="w-4 h-4" />, text: "청정 공기" },
                  { icon: <Droplets className="w-4 h-4" />, text: "맑은 계곡" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 text-primary rounded-full text-sm">
                    {item.icon}
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400&q=80"
                alt="캠핑장 전경"
                className="rounded-2xl object-cover w-full h-48 md:h-64"
              />
              <img
                src="https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=400&q=80"
                alt="캠핑 사이트"
                className="rounded-2xl object-cover w-full h-48 md:h-64 mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Usage Guide */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5">이용 방법</Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">간단한 4단계로 예약하세요</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {usageGuide.map((step, i) => (
              <div key={i} className="relative bg-card rounded-2xl p-6 border border-border">
                {i < usageGuide.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-3 w-6 h-px bg-border z-10" />
                )}
                <div className="text-4xl font-serif font-bold text-primary/20 mb-3">{step.step}</div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rules */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5">이용 규칙</Badge>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                즐거운 캠핑을 위한 규칙
              </h2>
              <p className="text-muted-foreground">모든 이용객이 편안하게 캠핑을 즐길 수 있도록 규칙을 지켜주세요.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rules.map((rule, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                  </div>
                  <span className="text-sm text-foreground">{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Operating Hours & Contact */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-card rounded-2xl p-8 border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold">운영 시간</h3>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { label: "체크인", value: "오후 2:00 ~ 오후 6:00" },
                  { label: "체크아웃", value: "오전 8:00 ~ 오전 11:00" },
                  { label: "프런트 운영", value: "오전 8:00 ~ 오후 8:00" },
                  { label: "매점 운영", value: "오전 9:00 ~ 오후 9:00" },
                  { label: "샤워실 운영", value: "24시간" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold">연락처 & 위치</h3>
              </div>
              <div className="space-y-4">
                {[
                  { icon: <MapPin className="w-4 h-4" />, label: "주소", value: "강원도 평창군 대관령면 자연속으로길 123" },
                  { icon: <Phone className="w-4 h-4" />, label: "전화", value: "033-123-4567" },
                  { icon: <Mail className="w-4 h-4" />, label: "이메일", value: "info@camping-resort.kr" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">{item.label}</div>
                      <div className="text-sm font-medium text-foreground">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <Link href="/inquiry">
                  <Button className="w-full rounded-xl">
                    문의하기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5">오시는 길</Badge>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">찾아오시는 방법</h2>
            <p className="text-muted-foreground">강원도 평창군 대관령면 자연속으로길 123</p>
          </div>
          <div className="rounded-2xl overflow-hidden border border-border h-96 shadow-lg">
            <MapView
              onMapReady={(map) => {
                const geocoder = new google.maps.Geocoder();
                geocoder.geocode({ address: "강원도 평창군 대관령면" }, (results, status) => {
                  if (status === "OK" && results && results[0]) {
                    const location = results[0].geometry.location;
                    map.setCenter(location);
                    map.setZoom(14);
                    new google.maps.Marker({
                      position: location,
                      map,
                      title: "자연속으로 캠핑장",
                      icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: "oklch(0.35 0.09 145)",
                        fillOpacity: 1,
                        strokeColor: "white",
                        strokeWeight: 2,
                      },
                    });
                    const infoWindow = new google.maps.InfoWindow({
                      content: `<div style="padding:8px;font-family:sans-serif"><strong>자연속으로 캠핑장</strong><br><small>강원도 평창군 대관령면</small></div>`,
                    });
                    infoWindow.open(map);
                  }
                });
              }}
            />
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "🚗", title: "자가용", desc: "서울 → 영동고속도로 → 대관령IC → 15분" },
              { icon: "🚌", title: "버스", desc: "동서울터미널 → 평창 → 셔틀버스 운행" },
              { icon: "🚂", title: "기차", desc: "KTX 진부역 → 캠핑장 셔틀 (예약 필요)" },
            ].map((item, i) => (
              <div key={i} className="bg-muted/50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-semibold text-sm mb-1">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
