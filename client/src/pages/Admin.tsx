import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  LayoutDashboard, CalendarCheck, TreePine, MessageSquare, Users,
  TrendingUp, Clock, CheckCircle2, XCircle, Eye, Plus, Edit, Trash2,
  ChevronRight, BarChart3, AlertCircle, RefreshCw,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "대기 중", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  approved: { label: "승인됨", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  cancelled: { label: "취소됨", color: "text-red-600", bg: "bg-red-50 border-red-200" },
  rejected: { label: "거절됨", color: "text-gray-600", bg: "bg-gray-50 border-gray-200" },
};

const INQUIRY_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  unread: { label: "미읽음", color: "text-red-600" },
  read: { label: "읽음", color: "text-amber-600" },
  replied: { label: "답변 완료", color: "text-emerald-600" },
};

const SITE_TYPE_LABELS: Record<string, string> = {
  tent: "텐트", caravan: "카라반", glamping: "글램핑", cabin: "캐빈",
};

type Tab = "overview" | "reservations" | "sites" | "inquiries";

export default function Admin() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Site form state
  const [siteDialogOpen, setSiteDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<any>(null);
  const [siteForm, setSiteForm] = useState({ name: "", description: "", capacity: "4", pricePerNight: "", imageUrl: "", amenities: "", siteType: "tent" as const });

  // Inquiry reply state
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [replyText, setReplyText] = useState("");

  // Reservation note state
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");

  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: reservations, isLoading: resLoading } = trpc.reservations.adminList.useQuery();
  const { data: sites, isLoading: sitesLoading } = trpc.sites.listAll.useQuery();
  const { data: inquiries, isLoading: inqLoading } = trpc.inquiries.adminList.useQuery();

  const updateStatusMutation = trpc.reservations.updateStatus.useMutation({
    onSuccess: () => { toast.success("예약 상태가 업데이트되었습니다."); utils.reservations.adminList.invalidate(); utils.dashboard.stats.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  const createSiteMutation = trpc.sites.create.useMutation({
    onSuccess: () => { toast.success("사이트가 등록되었습니다."); utils.sites.listAll.invalidate(); utils.dashboard.stats.invalidate(); setSiteDialogOpen(false); resetSiteForm(); },
    onError: (err) => toast.error(err.message),
  });

  const updateSiteMutation = trpc.sites.update.useMutation({
    onSuccess: () => { toast.success("사이트가 수정되었습니다."); utils.sites.listAll.invalidate(); setSiteDialogOpen(false); resetSiteForm(); },
    onError: (err) => toast.error(err.message),
  });

  const deleteSiteMutation = trpc.sites.delete.useMutation({
    onSuccess: () => { toast.success("사이트가 삭제되었습니다."); utils.sites.listAll.invalidate(); utils.dashboard.stats.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  const replyMutation = trpc.inquiries.reply.useMutation({
    onSuccess: () => { toast.success("답변이 전송되었습니다."); utils.inquiries.adminList.invalidate(); utils.dashboard.stats.invalidate(); setReplyDialogOpen(false); setReplyText(""); },
    onError: (err) => toast.error(err.message),
  });

  const resetSiteForm = () => {
    setSiteForm({ name: "", description: "", capacity: "4", pricePerNight: "", imageUrl: "", amenities: "", siteType: "tent" });
    setEditingSite(null);
  };

  const openEditSite = (site: any) => {
    setEditingSite(site);
    setSiteForm({
      name: site.name,
      description: site.description || "",
      capacity: site.capacity.toString(),
      pricePerNight: site.pricePerNight,
      imageUrl: site.imageUrl || "",
      amenities: site.amenities ? JSON.parse(site.amenities).join(", ") : "",
      siteType: site.siteType,
    });
    setSiteDialogOpen(true);
  };

  const handleSiteSubmit = () => {
    const amenitiesArr = siteForm.amenities ? siteForm.amenities.split(",").map(a => a.trim()).filter(Boolean) : [];
    const data = { ...siteForm, capacity: parseInt(siteForm.capacity), amenities: JSON.stringify(amenitiesArr) };
    if (editingSite) {
      updateSiteMutation.mutate({ id: editingSite.id, ...data });
    } else {
      createSiteMutation.mutate(data);
    }
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="font-serif text-xl font-bold mb-2">접근 권한이 없습니다</h2>
          <p className="text-muted-foreground mb-6">관리자만 접근할 수 있는 페이지입니다.</p>
          <Button onClick={() => navigate("/")} variant="outline">홈으로</Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview" as Tab, label: "개요", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "reservations" as Tab, label: "예약 관리", icon: <CalendarCheck className="w-4 h-4" /> },
    { id: "sites" as Tab, label: "사이트 관리", icon: <TreePine className="w-4 h-4" /> },
    { id: "inquiries" as Tab, label: "문의 관리", icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold">관리자 대시보드</h1>
              <p className="text-primary-foreground/70 text-sm mt-1">자연속으로 캠핑장 운영 관리</p>
            </div>
            <Badge className="bg-white/20 text-white border-white/30">
              {user.name} 관리자
            </Badge>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === "reservations" && (stats?.pendingReservations ?? 0) > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">
                    {stats?.pendingReservations}
                  </span>
                )}
                {tab.id === "inquiries" && (stats?.unreadInquiries ?? 0) > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {stats?.unreadInquiries}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {statsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-2xl border border-border p-5 animate-pulse h-28" />
                ))}
              </div>
            ) : stats != null ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "전체 예약", value: stats.totalReservations, icon: <CalendarCheck className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "대기 중", value: stats.pendingReservations, icon: <Clock className="w-5 h-5" />, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "승인됨", value: stats.approvedReservations, icon: <CheckCircle2 className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "총 매출", value: `₩${stats.totalRevenue.toLocaleString()}`, icon: <TrendingUp className="w-5 h-5" />, color: "text-primary", bg: "bg-primary/10" },
                    { label: "전체 사이트", value: stats.totalSites, icon: <TreePine className="w-5 h-5" />, color: "text-green-600", bg: "bg-green-50" },
                    { label: "활성 사이트", value: stats.activeSites, icon: <CheckCircle2 className="w-5 h-5" />, color: "text-green-700", bg: "bg-green-50" },
                    { label: "전체 문의", value: stats.totalInquiries, icon: <MessageSquare className="w-5 h-5" />, color: "text-purple-600", bg: "bg-purple-50" },
                    { label: "미읽은 문의", value: stats.unreadInquiries, icon: <AlertCircle className="w-5 h-5" />, color: "text-red-600", bg: "bg-red-50" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-card rounded-2xl border border-border p-5">
                      <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} mb-3`}>
                        {stat.icon}
                      </div>
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-semibold text-foreground">최근 예약</h3>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("reservations")} className="text-xs">
                        전체 보기 <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {stats.recentReservations.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">예약이 없습니다.</p>
                      ) : stats.recentReservations.map((res: any) => {
                        const cfg = STATUS_CONFIG[res.status] || STATUS_CONFIG.pending;
                        return (
                          <div key={res.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <div>
                              <div className="text-sm font-medium text-foreground">{res.guestName}</div>
                              <div className="text-xs text-muted-foreground">사이트 #{res.siteId} · {format(new Date(res.checkInDate), "M월 d일", { locale: ko })}</div>
                            </div>
                            <Badge className={`${cfg.bg} ${cfg.color} border text-xs`}>{cfg.label}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-semibold text-foreground">최근 문의</h3>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("inquiries")} className="text-xs">
                        전체 보기 <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {stats.recentInquiries.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">문의가 없습니다.</p>
                      ) : stats.recentInquiries.map((inq: any) => {
                        const cfg = INQUIRY_STATUS_CONFIG[inq.status] || INQUIRY_STATUS_CONFIG.unread;
                        return (
                          <div key={inq.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <div>
                              <div className="text-sm font-medium text-foreground">{inq.subject}</div>
                              <div className="text-xs text-muted-foreground">{inq.name} · {format(new Date(inq.createdAt), "M월 d일", { locale: ko })}</div>
                            </div>
                            <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Reservations Tab */}
        {activeTab === "reservations" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-semibold">예약 관리</h2>
              <Button variant="outline" size="sm" onClick={() => utils.reservations.adminList.invalidate()} className="rounded-lg">
                <RefreshCw className="w-4 h-4 mr-1" /> 새로고침
              </Button>
            </div>
            {resLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-xl border border-border p-5 animate-pulse h-20" />
                ))}
              </div>
            ) : reservations && reservations.length > 0 ? (
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">예약 #</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">예약자</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">사이트</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">체크인</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">체크아웃</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">금액</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">상태</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map((res: any) => {
                        const cfg = STATUS_CONFIG[res.status] || STATUS_CONFIG.pending;
                        return (
                          <tr key={res.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4 font-mono text-xs text-muted-foreground">#{res.id}</td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-foreground">{res.guestName}</div>
                              <div className="text-xs text-muted-foreground">{res.guestPhone}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-foreground">{res.site?.name || `사이트 #${res.siteId}`}</div>
                              <div className="text-xs text-muted-foreground">{res.guestCount}명</div>
                            </td>
                            <td className="py-3 px-4 text-foreground">{format(new Date(res.checkInDate), "yyyy.M.d", { locale: ko })}</td>
                            <td className="py-3 px-4 text-foreground">{format(new Date(res.checkOutDate), "yyyy.M.d", { locale: ko })}</td>
                            <td className="py-3 px-4 font-medium text-foreground">₩{parseFloat(res.totalAmount).toLocaleString()}</td>
                            <td className="py-3 px-4">
                              <Badge className={`${cfg.bg} ${cfg.color} border text-xs`}>{cfg.label}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                {res.status === "pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="h-7 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700"
                                      onClick={() => updateStatusMutation.mutate({ id: res.id, status: "approved" })}
                                    >
                                      승인
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs rounded-lg text-red-600 border-red-200 hover:bg-red-50"
                                      onClick={() => updateStatusMutation.mutate({ id: res.id, status: "rejected" })}
                                    >
                                      거절
                                    </Button>
                                  </>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 rounded-lg"
                                  onClick={() => { setSelectedReservation(res); setAdminNote(res.adminNote || ""); setNoteDialogOpen(true); }}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-2xl border border-border">
                <CalendarCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">예약이 없습니다.</p>
              </div>
            )}
          </div>
        )}

        {/* Sites Tab */}
        {activeTab === "sites" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-semibold">사이트 관리</h2>
              <Dialog open={siteDialogOpen} onOpenChange={(open) => { setSiteDialogOpen(open); if (!open) resetSiteForm(); }}>
                <DialogTrigger asChild>
                  <Button className="rounded-xl">
                    <Plus className="w-4 h-4 mr-2" /> 사이트 추가
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{editingSite ? "사이트 수정" : "새 사이트 등록"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>사이트 이름 *</Label>
                        <Input value={siteForm.name} onChange={e => setSiteForm(p => ({ ...p, name: e.target.value }))} placeholder="A-1 텐트 사이트" className="mt-1.5 rounded-xl" />
                      </div>
                      <div>
                        <Label>사이트 유형 *</Label>
                        <Select value={siteForm.siteType} onValueChange={(v: any) => setSiteForm(p => ({ ...p, siteType: v }))}>
                          <SelectTrigger className="mt-1.5 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tent">텐트 사이트</SelectItem>
                            <SelectItem value="caravan">카라반 사이트</SelectItem>
                            <SelectItem value="glamping">글램핑</SelectItem>
                            <SelectItem value="cabin">캐빈</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>최대 인원 *</Label>
                        <Input type="number" min="1" value={siteForm.capacity} onChange={e => setSiteForm(p => ({ ...p, capacity: e.target.value }))} className="mt-1.5 rounded-xl" />
                      </div>
                      <div>
                        <Label>1박 가격 (원) *</Label>
                        <Input type="number" value={siteForm.pricePerNight} onChange={e => setSiteForm(p => ({ ...p, pricePerNight: e.target.value }))} placeholder="50000" className="mt-1.5 rounded-xl" />
                      </div>
                    </div>
                    <div>
                      <Label>설명</Label>
                      <Textarea value={siteForm.description} onChange={e => setSiteForm(p => ({ ...p, description: e.target.value }))} placeholder="사이트 설명을 입력하세요" className="mt-1.5 rounded-xl resize-none" rows={2} />
                    </div>
                    <div>
                      <Label>이미지 URL</Label>
                      <Input value={siteForm.imageUrl} onChange={e => setSiteForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." className="mt-1.5 rounded-xl" />
                    </div>
                    <div>
                      <Label>편의 시설 (쉼표로 구분)</Label>
                      <Input value={siteForm.amenities} onChange={e => setSiteForm(p => ({ ...p, amenities: e.target.value }))} placeholder="화로대, 전기, 수도" className="mt-1.5 rounded-xl" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setSiteDialogOpen(false); resetSiteForm(); }}>취소</Button>
                    <Button
                      onClick={handleSiteSubmit}
                      disabled={!siteForm.name || !siteForm.pricePerNight || createSiteMutation.isPending || updateSiteMutation.isPending}
                    >
                      {editingSite ? "수정하기" : "등록하기"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {sitesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-2xl border border-border h-48 animate-pulse" />
                ))}
              </div>
            ) : sites && sites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sites.map((site) => (
                  <div key={site.id} className={`bg-card rounded-2xl border overflow-hidden ${site.isActive ? "border-border" : "border-border opacity-60"}`}>
                    <div className="h-36 overflow-hidden bg-muted relative">
                      {site.imageUrl ? (
                        <img src={site.imageUrl} alt={site.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <TreePine className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                      {!site.isActive && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Badge className="bg-red-500 text-white">비활성</Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{site.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-xs">{SITE_TYPE_LABELS[site.siteType]}</Badge>
                            <span className="text-xs text-muted-foreground">최대 {site.capacity}인</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-bold text-primary text-sm">₩{parseInt(site.pricePerNight).toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">/박</div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1 h-8 text-xs rounded-lg" onClick={() => openEditSite(site)}>
                          <Edit className="w-3 h-3 mr-1" /> 수정
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg text-destructive border-destructive/30">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>사이트를 삭제하시겠습니까?</AlertDialogTitle>
                              <AlertDialogDescription>사이트가 비활성화됩니다. 기존 예약에는 영향을 주지 않습니다.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteSiteMutation.mutate({ id: site.id })} className="bg-destructive hover:bg-destructive/90">삭제</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-2xl border border-border">
                <TreePine className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">등록된 사이트가 없습니다.</p>
                <Button onClick={() => setSiteDialogOpen(true)} className="rounded-xl">
                  <Plus className="w-4 h-4 mr-2" /> 첫 사이트 등록
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Inquiries Tab */}
        {activeTab === "inquiries" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-semibold">문의 관리</h2>
              <Button variant="outline" size="sm" onClick={() => utils.inquiries.adminList.invalidate()} className="rounded-lg">
                <RefreshCw className="w-4 h-4 mr-1" /> 새로고침
              </Button>
            </div>
            {inqLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-xl border border-border p-5 animate-pulse h-20" />
                ))}
              </div>
            ) : inquiries && inquiries.length > 0 ? (
              <div className="space-y-3">
                {inquiries.map((inq) => {
                  const cfg = INQUIRY_STATUS_CONFIG[inq.status] || INQUIRY_STATUS_CONFIG.unread;
                  return (
                    <div key={inq.id} className={`bg-card rounded-xl border p-5 ${inq.status === "unread" ? "border-primary/30 bg-primary/5" : "border-border"}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground truncate">{inq.subject}</h3>
                            <span className={`text-xs font-medium shrink-0 ${cfg.color}`}>{cfg.label}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{inq.message}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{inq.name}</span>
                            <span>{inq.email}</span>
                            {inq.phone && <span>{inq.phone}</span>}
                            <span>{format(new Date(inq.createdAt), "yyyy.M.d", { locale: ko })}</span>
                          </div>
                          {inq.adminReply && (
                            <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                              <div className="text-xs font-medium text-primary mb-1">관리자 답변</div>
                              <p className="text-sm text-foreground">{inq.adminReply}</p>
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="shrink-0 rounded-lg"
                          onClick={() => { setSelectedInquiry(inq); setReplyText(inq.adminReply || ""); setReplyDialogOpen(true); }}
                        >
                          <MessageSquare className="w-3.5 h-3.5 mr-1" />
                          {inq.adminReply ? "수정" : "답변"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-2xl border border-border">
                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">문의가 없습니다.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reservation Detail Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>예약 상세 정보</DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-3 text-sm">
              {[
                { label: "예약 번호", value: `#${selectedReservation.id}` },
                { label: "예약자", value: selectedReservation.guestName },
                { label: "연락처", value: selectedReservation.guestPhone },
                { label: "이메일", value: selectedReservation.guestEmail },
                { label: "사이트", value: selectedReservation.site?.name || `#${selectedReservation.siteId}` },
                { label: "체크인", value: format(new Date(selectedReservation.checkInDate), "yyyy년 M월 d일", { locale: ko }) },
                { label: "체크아웃", value: format(new Date(selectedReservation.checkOutDate), "yyyy년 M월 d일", { locale: ko }) },
                { label: "인원", value: `${selectedReservation.guestCount}명` },
                { label: "총 금액", value: `₩${parseFloat(selectedReservation.totalAmount).toLocaleString()}` },
                { label: "결제 상태", value: selectedReservation.paymentStatus },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-foreground">{item.value}</span>
                </div>
              ))}
              {selectedReservation.specialRequests && (
                <div className="pt-2">
                  <div className="text-muted-foreground mb-1">특별 요청</div>
                  <p className="text-foreground text-sm bg-muted/50 p-3 rounded-lg">{selectedReservation.specialRequests}</p>
                </div>
              )}
              <div>
                <Label>관리자 메모</Label>
                <Textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="내부 메모 입력..." className="mt-1.5 rounded-xl resize-none" rows={2} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>닫기</Button>
            <Button onClick={() => {
              if (selectedReservation) {
                updateStatusMutation.mutate({ id: selectedReservation.id, status: selectedReservation.status });
                setNoteDialogOpen(false);
              }
            }}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inquiry Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>문의 답변</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="font-medium text-sm mb-1">{selectedInquiry.subject}</div>
                <p className="text-sm text-muted-foreground">{selectedInquiry.message}</p>
                <div className="text-xs text-muted-foreground mt-2">{selectedInquiry.name} · {selectedInquiry.email}</div>
              </div>
              <div>
                <Label>답변 내용 *</Label>
                <Textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="답변을 입력하세요..."
                  className="mt-1.5 rounded-xl resize-none"
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>취소</Button>
            <Button
              onClick={() => { if (selectedInquiry && replyText) replyMutation.mutate({ id: selectedInquiry.id, adminReply: replyText }); }}
              disabled={!replyText || replyMutation.isPending}
            >
              답변 전송
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
