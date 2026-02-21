import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare } from "lucide-react";

export default function Inquiry() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const createMutation = trpc.inquiries.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("문의가 접수되었습니다. 빠른 시일 내에 답변 드리겠습니다.");
    },
    onError: (err) => toast.error(err.message || "문의 전송에 실패했습니다."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error("필수 항목을 모두 입력해주세요.");
      return;
    }
    createMutation.mutate(form);
  };

  const contactInfo = [
    { icon: <Phone className="w-5 h-5" />, label: "전화 문의", value: "010-1234-5678", sub: "평일 09:00 - 18:00" },
    { icon: <Mail className="w-5 h-5" />, label: "이메일 문의", value: "hello@naturecamping.kr", sub: "24시간 접수 가능" },
    { icon: <MapPin className="w-5 h-5" />, label: "주소", value: "강원도 춘천시 남산면 자연로 123", sub: "서울에서 1시간 30분" },
    { icon: <Clock className="w-5 h-5" />, label: "운영 시간", value: "연중무휴 운영", sub: "체크인 14:00 / 체크아웃 11:00" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative h-48 md:h-64 flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1920&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="relative z-10 container pb-8">
          <Badge className="mb-3 bg-white/20 text-white border-white/30">문의하기</Badge>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white">궁금한 점이 있으신가요?</h1>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-3">연락처 정보</h2>
                <p className="text-muted-foreground leading-relaxed">
                  예약, 시설, 이용 방법 등 궁금한 점이 있으시면 언제든지 연락해 주세요.
                  친절하게 안내해 드리겠습니다.
                </p>
              </div>

              <div className="space-y-4">
                {contactInfo.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-card rounded-2xl border border-border">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">{item.label}</div>
                      <div className="font-medium text-foreground text-sm">{item.value}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  빠른 답변 안내
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  문의 접수 후 영업일 기준 1-2일 이내에 이메일로 답변을 드립니다.
                  긴급한 사항은 전화로 문의해 주세요.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-foreground mb-3">문의가 접수되었습니다!</h3>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    소중한 문의 감사합니다.<br />
                    영업일 기준 1-2일 이내에 답변 드리겠습니다.
                  </p>
                  <Button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }} variant="outline" className="rounded-xl">
                    새 문의 작성
                  </Button>
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border p-8">
                  <h2 className="font-serif text-xl font-bold text-foreground mb-6">문의 양식</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <Label htmlFor="name">이름 <span className="text-destructive">*</span></Label>
                        <Input
                          id="name"
                          value={form.name}
                          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                          placeholder="홍길동"
                          className="mt-1.5 rounded-xl"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">연락처</Label>
                        <Input
                          id="phone"
                          value={form.phone}
                          onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                          placeholder="010-0000-0000"
                          className="mt-1.5 rounded-xl"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">이메일 <span className="text-destructive">*</span></Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        placeholder="example@email.com"
                        className="mt-1.5 rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">문의 제목 <span className="text-destructive">*</span></Label>
                      <Input
                        id="subject"
                        value={form.subject}
                        onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                        placeholder="예약 관련 문의"
                        className="mt-1.5 rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="message">문의 내용 <span className="text-destructive">*</span></Label>
                      <Textarea
                        id="message"
                        value={form.message}
                        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        placeholder="문의하실 내용을 자세히 입력해주세요..."
                        className="mt-1.5 rounded-xl resize-none"
                        rows={6}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full rounded-xl"
                      disabled={createMutation.isPending}
                    >
                      {createMutation.isPending ? (
                        "전송 중..."
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          문의 전송하기
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
