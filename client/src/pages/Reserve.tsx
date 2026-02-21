import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { format, differenceInDays, startOfDay } from "date-fns";
import { ko } from "date-fns/locale";
import { TreePine, Calendar as CalendarIcon, Users, CreditCard, CheckCircle2, AlertCircle, User, LogIn } from "lucide-react";

const SITE_TYPE_LABELS: Record<string, string> = {
  tent: "텐트 사이트",
  caravan: "카라반 사이트",
  glamping: "글램핑",
  cabin: "캐빈",
};

export default function Reserve() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  // Parse URL params
  const params = new URLSearchParams(window.location.search);
  const defaultSiteId = params.get("siteId") ? parseInt(params.get("siteId")!) : undefined;
  const defaultCheckIn = params.get("checkIn") ? new Date(params.get("checkIn")!) : undefined;
  const defaultCheckOut = params.get("checkOut") ? new Date(params.get("checkOut")!) : undefined;

  const [step, setStep] = useState(1);
  const [selectedSiteId, setSelectedSiteId] = useState<number | undefined>(defaultSiteId);
  const [checkIn, setCheckIn] = useState<Date | undefined>(defaultCheckIn);
  const [checkOut, setCheckOut] = useState<Date | undefined>(defaultCheckOut);
  const [guestCount, setGuestCount] = useState("2");
  const [form, setForm] = useState({
    guestName: user?.name || "",
    guestPhone: "",
    guestEmail: user?.email || "",
    specialRequests: "",
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        guestName: prev.guestName || user.name || "",
        guestEmail: prev.guestEmail || user.email || "",
      }));
    }
  }, [user]);

  const { data: sites } = trpc.sites.list.useQuery();
  const selectedSite = sites?.find(s => s.id === selectedSiteId);

  const checkInTs = useMemo(() => checkIn ? startOfDay(checkIn).getTime() : 0, [checkIn]);
  const checkOutTs = useMemo(() => checkOut ? startOfDay(checkOut).getTime() : 0, [checkOut]);
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const totalAmount = selectedSite ? (parseFloat(selectedSite.pricePerNight) * nights).toFixed(2) : "0.00";

  const { data: isAvailable } = trpc.reservations.checkAvailability.useQuery(
    { siteId: selectedSiteId!, checkIn: checkInTs, checkOut: checkOutTs },
    { enabled: !!selectedSiteId && checkInTs > 0 && checkOutTs > 0 }
  );

  const createReservation = trpc.reservations.create.useMutation({
    onSuccess: () => {
      setSuccess(true);
      utils.reservations.myList.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "예약에 실패했습니다.");
    },
  });

  const handleSubmit = () => {
    if (!selectedSiteId || !checkIn || !checkOut || !form.guestName || !form.guestPhone || !form.guestEmail) {
      toast.error("모든 필수 항목을 입력해주세요.");
      return;
    }
    createReservation.mutate({
      siteId: selectedSiteId,
      checkInDate: checkInTs,
      checkOutDate: checkOutTs,
      guestCount: parseInt(guestCount),
      guestName: form.guestName,
      guestPhone: form.guestPhone,
      guestEmail: form.guestEmail,
      specialRequests: form.specialRequests || undefined,
      totalAmount,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-3">로그인이 필요합니다</h2>
          <p className="text-muted-foreground mb-8">예약하려면 먼저 로그인해주세요.</p>
          <Button onClick={() => window.location.href = getLoginUrl()} size="lg" className="rounded-xl w-full">
            <User className="w-4 h-4 mr-2" />
            로그인하기
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-foreground mb-3">예약 신청 완료!</h2>
          <p className="text-muted-foreground mb-2">예약 신청이 접수되었습니다.</p>
          <p className="text-sm text-muted-foreground mb-8">관리자 승인 후 예약이 확정됩니다. (1-2 영업일 소요)</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/")} className="flex-1 rounded-xl">홈으로</Button>
            <Button onClick={() => navigate("/reservations")} className="flex-1 rounded-xl">내 예약 확인</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative h-48 md:h-64 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=1920&q=80')` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="relative z-10 container pb-8">
          <Badge className="mb-3 bg-white/20 text-white border-white/30">예약하기</Badge>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white">캠핑 예약</h1>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container max-w-5xl">
          {/* Steps */}
          <div className="flex items-center justify-center mb-10">
            {[
              { num: 1, label: "날짜 & 사이트 선택" },
              { num: 2, label: "예약자 정보" },
              { num: 3, label: "확인 & 제출" },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className={`flex items-center gap-2 ${step >= s.num ? "text-primary" : "text-muted-foreground"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step > s.num ? "bg-primary text-primary-foreground" :
                    step === s.num ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {step > s.num ? "✓" : s.num}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{s.label}</span>
                </div>
                {i < 2 && <div className={`w-12 md:w-20 h-px mx-3 ${step > s.num ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              {step === 1 && (
                <div className="space-y-6">
                  {/* Date Selection */}
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="font-serif text-lg font-semibold mb-5 flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                      날짜 선택
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">체크인</label>
                        <Calendar
                          mode="single"
                          selected={checkIn}
                          onSelect={(date) => { setCheckIn(date); if (checkOut && date && date >= checkOut) setCheckOut(undefined); }}
                          disabled={(date) => date < new Date()}
                          locale={ko}
                          className="rounded-xl border border-border"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">체크아웃</label>
                        <Calendar
                          mode="single"
                          selected={checkOut}
                          onSelect={setCheckOut}
                          disabled={(date) => date <= (checkIn || new Date())}
                          locale={ko}
                          className="rounded-xl border border-border"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Site Selection */}
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="font-serif text-lg font-semibold mb-5 flex items-center gap-2">
                      <TreePine className="w-5 h-5 text-primary" />
                      사이트 선택
                    </h3>
                    {sites && sites.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {sites.map((site) => (
                          <button
                            key={site.id}
                            onClick={() => setSelectedSiteId(site.id)}
                            className={`text-left p-4 rounded-xl border-2 transition-all ${
                              selectedSiteId === site.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/40"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                                {site.imageUrl ? (
                                  <img src={site.imageUrl} alt={site.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <TreePine className="w-6 h-6 text-muted-foreground/40" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-foreground truncate">{site.name}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{SITE_TYPE_LABELS[site.siteType]} · 최대 {site.capacity}인</div>
                                <div className="text-sm font-bold text-primary mt-1">₩{parseInt(site.pricePerNight).toLocaleString()}/박</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">등록된 사이트가 없습니다.</p>
                    )}
                  </div>

                  {/* Guest Count */}
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      인원 수
                    </h3>
                    <Select value={guestCount} onValueChange={setGuestCount}>
                      <SelectTrigger className="w-40 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                          <SelectItem key={n} value={n.toString()}>{n}명</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={() => setStep(2)}
                    disabled={!checkIn || !checkOut || !selectedSiteId || nights <= 0}
                    className="w-full rounded-xl py-6"
                    size="lg"
                  >
                    다음 단계
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
                  <h3 className="font-serif text-lg font-semibold mb-2">예약자 정보 입력</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="guestName">이름 *</Label>
                      <Input
                        id="guestName"
                        value={form.guestName}
                        onChange={e => setForm(p => ({ ...p, guestName: e.target.value }))}
                        placeholder="홍길동"
                        className="mt-1.5 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="guestPhone">연락처 *</Label>
                      <Input
                        id="guestPhone"
                        value={form.guestPhone}
                        onChange={e => setForm(p => ({ ...p, guestPhone: e.target.value }))}
                        placeholder="010-1234-5678"
                        className="mt-1.5 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="guestEmail">이메일 *</Label>
                    <Input
                      id="guestEmail"
                      type="email"
                      value={form.guestEmail}
                      onChange={e => setForm(p => ({ ...p, guestEmail: e.target.value }))}
                      placeholder="example@email.com"
                      className="mt-1.5 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialRequests">특별 요청 사항 (선택)</Label>
                    <Textarea
                      id="specialRequests"
                      value={form.specialRequests}
                      onChange={e => setForm(p => ({ ...p, specialRequests: e.target.value }))}
                      placeholder="알레르기, 특별 요청 등을 입력해주세요."
                      className="mt-1.5 rounded-xl resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-xl">이전</Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!form.guestName || !form.guestPhone || !form.guestEmail}
                      className="flex-1 rounded-xl"
                    >
                      다음 단계
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="font-serif text-lg font-semibold mb-5">예약 정보 확인</h3>
                    <div className="space-y-3 text-sm">
                      {[
                        { label: "캠핑 사이트", value: selectedSite?.name },
                        { label: "사이트 유형", value: selectedSite ? SITE_TYPE_LABELS[selectedSite.siteType] : "" },
                        { label: "체크인", value: checkIn ? format(checkIn, "yyyy년 M월 d일 (EEE)", { locale: ko }) : "" },
                        { label: "체크아웃", value: checkOut ? format(checkOut, "yyyy년 M월 d일 (EEE)", { locale: ko }) : "" },
                        { label: "숙박 일수", value: `${nights}박` },
                        { label: "인원", value: `${guestCount}명` },
                        { label: "예약자", value: form.guestName },
                        { label: "연락처", value: form.guestPhone },
                        { label: "이메일", value: form.guestEmail },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-border last:border-0">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-medium text-foreground">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {isAvailable === false && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span className="text-sm">선택하신 날짜에 해당 사이트는 예약이 불가합니다.</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1 rounded-xl">이전</Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={createReservation.isPending || isAvailable === false}
                      className="flex-1 rounded-xl"
                    >
                      {createReservation.isPending ? "처리 중..." : "예약 신청하기"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                <h3 className="font-serif text-lg font-semibold mb-5">예약 요약</h3>
                {selectedSite ? (
                  <div>
                    <div className="w-full h-36 rounded-xl overflow-hidden bg-muted mb-4">
                      {selectedSite.imageUrl ? (
                        <img src={selectedSite.imageUrl} alt={selectedSite.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <TreePine className="w-10 h-10 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <h4 className="font-semibold text-foreground">{selectedSite.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-4">{SITE_TYPE_LABELS[selectedSite.siteType]}</p>
                  </div>
                ) : (
                  <div className="w-full h-24 rounded-xl bg-muted flex items-center justify-center mb-4">
                    <TreePine className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                )}

                <div className="space-y-2 text-sm border-t border-border pt-4">
                  {checkIn && checkOut && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">기간</span>
                      <span className="font-medium">{nights}박 {nights + 1}일</span>
                    </div>
                  )}
                  {selectedSite && nights > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">₩{parseInt(selectedSite.pricePerNight).toLocaleString()} × {nights}박</span>
                        <span className="font-medium">₩{(parseFloat(selectedSite.pricePerNight) * nights).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-border">
                        <span className="font-semibold text-foreground">총 금액</span>
                        <span className="font-bold text-lg text-primary">₩{parseFloat(totalAmount).toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-700">
                    <strong>안내:</strong> 예약 신청 후 관리자 승인 시 결제가 진행됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
