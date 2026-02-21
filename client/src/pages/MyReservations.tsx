import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarCheck, TreePine, Users, Clock, XCircle, CreditCard, LogIn, User } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "승인 대기", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  approved: { label: "예약 확정", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  cancelled: { label: "예약 취소", color: "text-red-600", bg: "bg-red-50 border-red-200" },
  rejected: { label: "예약 거절", color: "text-gray-600", bg: "bg-gray-50 border-gray-200" },
};

const SITE_TYPE_LABELS: Record<string, string> = {
  tent: "텐트 사이트",
  caravan: "카라반 사이트",
  glamping: "글램핑",
  cabin: "캐빈",
};

export default function MyReservations() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: reservations, isLoading } = trpc.reservations.myList.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const cancelMutation = trpc.reservations.cancel.useMutation({
    onSuccess: () => {
      toast.success("예약이 취소되었습니다.");
      utils.reservations.myList.invalidate();
    },
    onError: (err) => toast.error(err.message || "취소에 실패했습니다."),
  });

  const payMutation = trpc.paymentMethods.createCheckoutWithMethod.useMutation({
    onSuccess: (data: any) => {
      toast.info(`${data.method === 'stripe' ? '카드' : data.method === 'naver_pay' ? '네이버페이' : data.method === 'kakao_pay' ? '카카오페이' : '토스'} 결제 페이지로 이동합니다.`);
      window.open(data.url, "_blank");
    },
    onError: (err: any) => toast.error(err.message || "결제 처리에 실패했습니다."),
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-3">로그인이 필요합니다</h2>
          <p className="text-muted-foreground mb-8">예약 내역을 확인하려면 먼저 로그인해주세요.</p>
          <Button onClick={() => window.location.href = getLoginUrl()} size="lg" className="rounded-xl w-full">
            <User className="w-4 h-4 mr-2" />
            로그인하기
          </Button>
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
          <Badge className="mb-3 bg-white/20 text-white border-white/30">내 예약</Badge>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white">내 예약 관리</h1>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-xl font-semibold text-foreground">예약 내역</h2>
              <p className="text-sm text-muted-foreground mt-1">{user?.name}님의 캠핑 예약 내역입니다.</p>
            </div>
            <Button onClick={() => navigate("/reserve")} className="rounded-xl">
              새 예약하기
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl border border-border p-6 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-muted rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted rounded w-1/3" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : reservations && reservations.length > 0 ? (
            <div className="space-y-4">
              {reservations.map((res) => {
                const statusCfg = STATUS_CONFIG[res.status] || STATUS_CONFIG.pending;
                const checkIn = new Date(res.checkInDate);
                const checkOut = new Date(res.checkOutDate);
                const canCancel = res.status === "pending" || res.status === "approved";
                const canPay = res.status === "approved" && res.paymentStatus !== "fully_paid";

                return (
                  <div key={res.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-muted shrink-0">
                          {res.site?.imageUrl ? (
                            <img src={res.site.imageUrl} alt={res.site.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <TreePine className="w-8 h-8 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                            <div>
                              <h3 className="font-semibold text-foreground">{res.site?.name || "사이트 정보 없음"}</h3>
                              <p className="text-sm text-muted-foreground">
                                {res.site ? SITE_TYPE_LABELS[res.site.siteType] : ""}
                              </p>
                            </div>
                            <Badge className={`${statusCfg.bg} ${statusCfg.color} border text-xs font-medium`}>
                              {statusCfg.label}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <CalendarCheck className="w-3.5 h-3.5" />
                              <div>
                                <div className="text-xs">체크인</div>
                                <div className="font-medium text-foreground">{format(checkIn, "M월 d일", { locale: ko })}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <CalendarCheck className="w-3.5 h-3.5" />
                              <div>
                                <div className="text-xs">체크아웃</div>
                                <div className="font-medium text-foreground">{format(checkOut, "M월 d일", { locale: ko })}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Users className="w-3.5 h-3.5" />
                              <div>
                                <div className="text-xs">인원</div>
                                <div className="font-medium text-foreground">{res.guestCount}명</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <CreditCard className="w-3.5 h-3.5" />
                              <div>
                                <div className="text-xs">총 금액</div>
                                <div className="font-medium text-foreground">₩{parseFloat(res.totalAmount).toLocaleString()}</div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              예약 번호: #{res.id}
                            </div>
                            <div className="ml-auto flex gap-2">
                              {canPay && (
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            onClick={() => payMutation.mutate({ reservationId: res.id, paymentType: "full", paymentMethod: "stripe" })}
                            disabled={payMutation.isPending}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <CreditCard className="w-4 h-4 mr-1" />
                            카드
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => payMutation.mutate({ reservationId: res.id, paymentType: "full", paymentMethod: "naver_pay" })}
                            disabled={payMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            네이버페이
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => payMutation.mutate({ reservationId: res.id, paymentType: "full", paymentMethod: "kakao_pay" })}
                            disabled={payMutation.isPending}
                            className="bg-yellow-500 hover:bg-yellow-600"
                          >
                            카카오페이
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => payMutation.mutate({ reservationId: res.id, paymentType: "full", paymentMethod: "toss" })}
                            disabled={payMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            토스
                          </Button>
                        </div>
                              )}
                              {canCancel && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="rounded-lg text-xs h-8 text-destructive border-destructive/30 hover:bg-destructive/5">
                                      <XCircle className="w-3.5 h-3.5 mr-1" />
                                      예약 취소
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>예약을 취소하시겠습니까?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        예약 취소 후에는 되돌릴 수 없습니다. 취소 수수료가 발생할 수 있습니다.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>돌아가기</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => cancelMutation.mutate({ id: res.id })}
                                        className="bg-destructive hover:bg-destructive/90"
                                      >
                                        예약 취소
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-2xl border border-border">
              <CalendarCheck className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">예약 내역이 없습니다</h3>
              <p className="text-muted-foreground mb-6">아직 예약하신 내역이 없습니다.</p>
              <Button onClick={() => navigate("/reserve")} className="rounded-xl">
                지금 예약하기
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
