import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { TreePine, Users, Calendar, Tent, Car, Sparkles, Home as HomeIcon, Filter } from "lucide-react";

const SITE_TYPE_LABELS: Record<string, string> = {
  tent: "텐트 사이트",
  caravan: "카라반 사이트",
  glamping: "글램핑",
  cabin: "캐빈",
};

const SITE_TYPE_ICONS: Record<string, React.ReactNode> = {
  tent: <Tent className="w-4 h-4" />,
  caravan: <Car className="w-4 h-4" />,
  glamping: <Sparkles className="w-4 h-4" />,
  cabin: <HomeIcon className="w-4 h-4" />,
};

const SITE_TYPES = ["all", "tent", "caravan", "glamping", "cabin"] as const;

export default function Sites() {
  const [filter, setFilter] = useState<string>("all");
  const { data: sites, isLoading } = trpc.sites.list.useQuery();

  const filtered = sites?.filter(s => filter === "all" || s.siteType === filter) ?? [];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-64 md:h-80 flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1920&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="relative z-10 container pb-10">
          <Badge className="mb-3 bg-white/20 text-white border-white/30">사이트 안내</Badge>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white">캠핑 사이트 안내</h1>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container">
          {/* Filter */}
          <div className="flex items-center gap-2 flex-wrap mb-10">
            <Filter className="w-4 h-4 text-muted-foreground mr-1" />
            {SITE_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === type
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {type === "all" ? "전체" : SITE_TYPE_LABELS[type]}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border animate-pulse">
                  <div className="h-52 bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-muted rounded w-2/3" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <TreePine className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">사이트가 없습니다</h3>
              <p className="text-muted-foreground">현재 등록된 사이트가 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((site) => {
                const amenities = site.amenities ? JSON.parse(site.amenities) as string[] : [];
                return (
                  <div
                    key={site.id}
                    className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative h-52 overflow-hidden bg-muted">
                      {site.imageUrl ? (
                        <img
                          src={site.imageUrl}
                          alt={site.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
                          <TreePine className="w-16 h-16 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-white/90 text-foreground text-xs font-medium flex items-center gap-1">
                          {SITE_TYPE_ICONS[site.siteType]}
                          {SITE_TYPE_LABELS[site.siteType]}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-serif text-lg font-semibold text-foreground mb-1">{site.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{site.description}</p>

                      {amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {amenities.slice(0, 3).map((amenity: string, i: number) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-primary/5 text-primary rounded-full">
                              {amenity}
                            </span>
                          ))}
                          {amenities.length > 3 && (
                            <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                              +{amenities.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="w-3.5 h-3.5" />
                          최대 {site.capacity}인
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-primary">
                            ₩{parseInt(site.pricePerNight).toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground">/박</span>
                        </div>
                      </div>
                      <Link href={`/reserve?siteId=${site.id}`}>
                        <Button className="w-full mt-4 rounded-xl" size="sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          예약하기
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
