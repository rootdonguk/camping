import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { trpc } from "@/lib/trpc";
import { TreePine, Users, CheckCircle2, XCircle, Calendar as CalendarIcon, Search } from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";
import { ko } from "date-fns/locale";

const SITE_TYPE_LABELS: Record<string, string> = {
  tent: "텐트",
  caravan: "카라반",
  glamping: "글램핑",
  cabin: "캐빈",
};

export default function Availability() {
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined);
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined);
  const [searched, setSearched] = useState(false);

  const checkInTs = useMemo(() => checkIn ? startOfDay(checkIn).getTime() : 0, [checkIn]);
  const checkOutTs = useMemo(() => checkOut ? endOfDay(checkOut).getTime() : 0, [checkOut]);

  const { data: sites } = trpc.sites.list.useQuery();
  const { data: reservedSites, isLoading: isSearching } = trpc.reservations.checkAvailability.useQuery(
    { siteId: 0, checkIn: checkInTs, checkOut: checkOutTs },
    { enabled: false }
  );

  const handleSearch = () => {
    if (checkIn && checkOut) setSearched(true);
  };

  const [reservedByDate, setReservedByDate] = useState<Map<number, boolean>>(new Map());

  useEffect(() => {
    if (searched && sites && checkInTs > 0 && checkOutTs > 0) {
      const checkAvailability = async () => {
        const reserved = new Map<number, boolean>();
        for (const site of sites) {
          const available = await (trpc.reservations.checkAvailability as any).fetch({
            siteId: site.id,
            checkIn: checkInTs,
            checkOut: checkOutTs,
          });
          reserved.set(site.id, !available);
        }
        setReservedByDate(reserved);
      };
      checkAvailability();
    }
  }, [searched, sites, checkInTs, checkOutTs]);

  const isReserved = (siteId: number) => reservedByDate.get(siteId) ?? false;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-64 md:h-72 flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1920&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="relative z-10 container pb-10">
          <Badge className="mb-3 bg-white/20 text-white border-white/30">예약 현황</Badge>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white">실시간 예약 현황</h1>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container max-w-5xl">
          {/* Date Picker */}
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-10 shadow-sm">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-6">날짜를 선택하세요</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-3 block">체크인 날짜</label>
                <Calendar
                  mode="single"
                  selected={checkIn}
                  onSelect={(date) => { setCheckIn(date); setSearched(false); }}
                  disabled={(date) => date < new Date()}
                  locale={ko}
                  className="rounded-xl border border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-3 block">체크아웃 날짜</label>
                <Calendar
                  mode="single"
                  selected={checkOut}
                  onSelect={(date) => { setCheckOut(date); setSearched(false); }}
                  disabled={(date) => date < (checkIn || new Date())}
                  locale={ko}
                  className="rounded-xl border border-border"
                />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-4">
              {checkIn && checkOut && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
                  <CalendarIcon className="w-4 h-4" />
                  <span>
                    {format(checkIn, "yyyy년 M월 d일", { locale: ko })} ~ {format(checkOut, "yyyy년 M월 d일", { locale: ko })}
                  </span>
                </div>
              )}
              <Button
                onClick={handleSearch}
                disabled={!checkIn || !checkOut}
                className="rounded-xl ml-auto"
              >
                <Search className="w-4 h-4 mr-2" />
                예약 현황 확인
              </Button>
            </div>
          </div>

          {/* Results */}
          {searched && (
            <div>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                {checkIn && checkOut && (
                  <span>
                    {format(checkIn, "M월 d일", { locale: ko })} ~ {format(checkOut, "M월 d일", { locale: ko })} 예약 현황
                  </span>
                )}
              </h2>

              {isSearching ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-card rounded-xl border border-border p-5 animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-muted rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-2/3" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : sites && sites.length > 0 ? (
                <>
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-muted-foreground">예약 가능</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-muted-foreground">예약 불가</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sites.map((site) => {
                      const isAvailable = !isReserved(site.id);
                      return (
                        <div
                          key={site.id}
                          className={`bg-card rounded-xl border p-5 transition-all ${
                            isAvailable
                              ? "border-emerald-200 hover:border-emerald-300 hover:shadow-md"
                              : "border-red-100 opacity-60"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 ${!site.imageUrl ? "bg-muted flex items-center justify-center" : ""}`}>
                              {site.imageUrl ? (
                                <img src={site.imageUrl} alt={site.name} className="w-full h-full object-cover" />
                              ) : (
                                <TreePine className="w-8 h-8 text-muted-foreground/40" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-semibold text-foreground">{site.name}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">{SITE_TYPE_LABELS[site.siteType]}</Badge>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Users className="w-3 h-3" />최대 {site.capacity}인
                                    </span>
                                  </div>
                                </div>
                                <div className="shrink-0">
                                  {isAvailable ? (
                                    <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                                      <CheckCircle2 className="w-4 h-4" />
                                      예약 가능
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 text-red-400 text-sm font-medium">
                                      <XCircle className="w-4 h-4" />
                                      예약 불가
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-3">
                                <span className="font-bold text-primary">
                                  ₩{parseInt(site.pricePerNight).toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/박</span>
                                </span>
                                {isAvailable && (
                                  <Link href={`/reserve?siteId=${site.id}&checkIn=${checkIn?.toISOString()}&checkOut=${checkOut?.toISOString()}`}>
                                    <Button size="sm" className="rounded-lg text-xs h-8">
                                      예약하기
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-16 bg-card rounded-2xl border border-border">
                  <TreePine className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">등록된 사이트가 없습니다.</p>
                </div>
              )}
            </div>
          )}

          {!searched && (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
              <CalendarIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="font-serif text-lg font-semibold text-foreground mb-2">날짜를 선택하세요</h3>
              <p className="text-muted-foreground text-sm">체크인/체크아웃 날짜를 선택하고 예약 현황을 확인하세요.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
