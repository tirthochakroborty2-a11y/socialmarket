"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Play,
  ThumbsUp,
  Music2,
  X,
  ChevronDown,
  Inbox,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Listing {
  id: string;
  title: string;
  platform: "youtube" | "facebook" | "tiktok";
  price: number;
  followers: number;
  description: string;
  is_monetized: boolean;
  images: string[];
  created_at: string;
}

const platformColors = {
  youtube: "#FF0000",
  facebook: "#1877F2",
  tiktok: "#000000",
};

const platformIcons = {
  youtube: Play,
  facebook: ThumbsUp,
  tiktok: Music2,
};

const platformLabels = {
  youtube: "YouTube",
  facebook: "Facebook",
  tiktok: "TikTok",
};

type PriceRange = "all" | "0-5000" | "5000-20000" | "20000-plus";

export default function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get("q") || "";
  const initialPlatform = searchParams.get("platform") || "";

  const [search, setSearch] = useState(initialQuery);
  const [platformFilter, setPlatformFilter] = useState<string[]>(
    initialPlatform ? [initialPlatform] : []
  );
  const [priceRange, setPriceRange] = useState<PriceRange>("all");
  const [onlyMonetized, setOnlyMonetized] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high">("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  // Fetch all active listings once
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("listings")
        .select("id, title, platform, price, followers, description, is_monetized, images, created_at")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      setListings(data || []);
      setLoading(false);
    };
    fetchListings();
  }, []);

  // Filter + sort client-side
  useEffect(() => {
    let result = [...listings];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) => l.title.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q)
      );
    }

    // Platform
    if (platformFilter.length > 0) {
      result = result.filter((l) => platformFilter.includes(l.platform));
    }

    // Price
    if (priceRange === "0-5000") result = result.filter((l) => l.price <= 5000);
    else if (priceRange === "5000-20000")
      result = result.filter((l) => l.price > 5000 && l.price <= 20000);
    else if (priceRange === "20000-plus") result = result.filter((l) => l.price > 20000);

    // Monetized
    if (onlyMonetized) result = result.filter((l) => l.is_monetized);

    // Sort
    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    else result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setFilteredListings(result);
  }, [listings, search, platformFilter, priceRange, onlyMonetized, sortBy]);

  const togglePlatform = (p: string) => {
    setPlatformFilter((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const clearFilters = () => {
    setPlatformFilter([]);
    setPriceRange("all");
    setOnlyMonetized(false);
    setSearch("");
    router.push("/browse");
  };

  const activeFilterCount =
    platformFilter.length +
    (priceRange !== "all" ? 1 : 0) +
    (onlyMonetized ? 1 : 0);

  return (
    <main
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "32px 20px 60px",
      }}
    >
      {/* ===== HEADER ROW ===== */}
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontSize: "clamp(24px, 4vw, 32px)",
            fontWeight: 800,
            color: "var(--text)",
            marginBottom: "8px",
          }}
        >
          সব লিস্টিং
        </h1>
        <p style={{ fontSize: "14px", color: "var(--muted)" }}>
          {loading
            ? "লোড হচ্ছে..."
            : `${filteredListings.length} টি listing পাওয়া গেছে`}
        </p>
      </div>

      {/* ===== SEARCH + CONTROLS BAR ===== */}
      <div
        style={{
          background: "var(--card)",
          border: "1.5px solid var(--border)",
          borderRadius: "16px",
          padding: "12px",
          marginBottom: "24px",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          alignItems: "center",
        }}
      >
        {/* Search input */}
        <div
          style={{
            flex: "1 1 300px",
            minWidth: "200px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 14px",
            background: "var(--bg)",
            border: "1.5px solid var(--border)",
            borderRadius: "10px",
          }}
        >
          <Search size={18} color="var(--muted)" />
          <input
            type="text"
            placeholder="লিস্টিং খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              color: "var(--text)",
              fontSize: "14px",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
                padding: 0,
                display: "flex",
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            border: "1.5px solid var(--border)",
            background: activeFilterCount > 0 ? "rgba(108,99,255,0.1)" : "var(--bg)",
            color: activeFilterCount > 0 ? "var(--primary)" : "var(--text)",
            borderRadius: "10px",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer",
            position: "relative",
          }}
        >
          <SlidersHorizontal size={16} />
          Filter
          {activeFilterCount > 0 && (
            <span
              style={{
                background: "var(--primary)",
                color: "#fff",
                fontSize: "11px",
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: "99px",
                marginLeft: "2px",
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort dropdown */}
        <div style={{ position: "relative" }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: "10px 34px 10px 14px",
              border: "1.5px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text)",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
              appearance: "none",
              outline: "none",
            }}
          >
            <option value="newest">নতুন আগে</option>
            <option value="price-low">কম দাম আগে</option>
            <option value="price-high">বেশি দাম আগে</option>
          </select>
          <ChevronDown
            size={16}
            color="var(--muted)"
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* View toggle */}
        <div
          style={{
            display: "flex",
            border: "1.5px solid var(--border)",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => setViewMode("grid")}
            style={{
              padding: "10px 12px",
              background: viewMode === "grid" ? "var(--primary)" : "var(--bg)",
              color: viewMode === "grid" ? "#fff" : "var(--text)",
              border: "none",
              cursor: "pointer",
              display: "flex",
            }}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            style={{
              padding: "10px 12px",
              background: viewMode === "list" ? "var(--primary)" : "var(--bg)",
              color: viewMode === "list" ? "#fff" : "var(--text)",
              border: "none",
              cursor: "pointer",
              display: "flex",
            }}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* ===== FILTER PANEL ===== */}
      {showFilters && (
        <div
          style={{
            background: "var(--card)",
            border: "1.5px solid var(--border)",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "24px",
          }}
        >
          {/* Platform */}
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", marginBottom: "12px" }}>
              প্ল্যাটফর্ম
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(["youtube", "facebook", "tiktok"] as const).map((p) => {
                const Icon = platformIcons[p];
                return (
                  <label
                    key={p}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "var(--text)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={platformFilter.includes(p)}
                      onChange={() => togglePlatform(p)}
                      style={{ accentColor: "var(--primary)", cursor: "pointer" }}
                    />
                    <Icon size={16} color={platformColors[p]} />
                    {platformLabels[p]}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Price */}
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", marginBottom: "12px" }}>
              দাম
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(
                [
                  { v: "all", label: "সব দাম" },
                  { v: "0-5000", label: "৳ 0 - 5,000" },
                  { v: "5000-20000", label: "৳ 5,000 - 20,000" },
                  { v: "20000-plus", label: "৳ 20,000+" },
                ] as const
              ).map((r) => (
                <label
                  key={r.v}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "var(--text)",
                  }}
                >
                  <input
                    type="radio"
                    name="price"
                    checked={priceRange === r.v}
                    onChange={() => setPriceRange(r.v)}
                    style={{ accentColor: "var(--primary)", cursor: "pointer" }}
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </div>

          {/* Others */}
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", marginBottom: "12px" }}>
              অন্যান্য
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                fontSize: "14px",
                color: "var(--text)",
                marginBottom: "12px",
              }}
            >
              <input
                type="checkbox"
                checked={onlyMonetized}
                onChange={(e) => setOnlyMonetized(e.target.checked)}
                style={{ accentColor: "var(--primary)", cursor: "pointer" }}
              />
              শুধু Monetized
            </label>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                style={{
                  marginTop: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--primary)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                সব ফিল্টার মুছুন
              </button>
            )}
          </div>
        </div>
      )}

      {/* ===== LISTINGS ===== */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "80px", color: "var(--muted)" }}>
          লোড হচ্ছে...
        </div>
      ) : filteredListings.length === 0 ? (
        <EmptyState onClear={clearFilters} hasFilters={activeFilterCount > 0 || !!search} />
      ) : viewMode === "grid" ? (
        <div
          className="browse-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
          }}
        >
          {filteredListings.map((listing) => (
            <GridCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filteredListings.map((listing) => (
            <ListRow key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .browse-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .browse-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 520px) {
          .browse-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}

/* ========== GRID CARD ========== */
function GridCard({ listing }: { listing: Listing }) {
  const Icon = platformIcons[listing.platform];
  const color = platformColors[listing.platform];

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="listing-card"
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--card)",
        border: "1.5px solid var(--border)",
        borderRadius: "14px",
        overflow: "hidden",
        textDecoration: "none",
        transition: "all 0.25s ease",
      }}
    >
      <div
        style={{
          height: 140,
          background: `linear-gradient(135deg, ${color}18, ${color}35)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          position: "relative",
        }}
      >
        <Icon size={48} />
        {listing.is_monetized && (
          <span
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "#10b981",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: "6px",
            }}
          >
            ✓ Monetized
          </span>
        )}
      </div>

      <div style={{ padding: "14px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: "6px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "38px",
          }}
        >
          {listing.title}
        </div>
        <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "12px" }}>
          {listing.followers.toLocaleString()} followers
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "10px",
            borderTop: "1px solid var(--border)",
            marginTop: "auto",
          }}
        >
          <span style={{ fontSize: "17px", fontWeight: 800, color: "var(--primary)" }}>
            ৳ {listing.price.toLocaleString()}
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--primary)",
              background: "rgba(108,99,255,0.1)",
              padding: "4px 10px",
              borderRadius: "6px",
            }}
          >
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ========== LIST ROW ========== */
function ListRow({ listing }: { listing: Listing }) {
  const Icon = platformIcons[listing.platform];
  const color = platformColors[listing.platform];

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="listing-card"
      style={{
        display: "flex",
        gap: "16px",
        background: "var(--card)",
        border: "1.5px solid var(--border)",
        borderRadius: "14px",
        padding: "16px",
        textDecoration: "none",
        transition: "all 0.25s ease",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          minWidth: 80,
          borderRadius: "12px",
          background: `linear-gradient(135deg, ${color}18, ${color}35)`,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={32} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: "4px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {listing.title}
        </div>
        <div style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "4px" }}>
          {listing.followers.toLocaleString()} followers · {platformLabels[listing.platform]}
          {listing.is_monetized && " · ✓ Monetized"}
        </div>
      </div>
      <div style={{ textAlign: "right", minWidth: "100px" }}>
        <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--primary)" }}>
          ৳ {listing.price.toLocaleString()}
        </div>
        <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>
          View →
        </div>
      </div>
    </Link>
  );
}

/* ========== EMPTY STATE ========== */
function EmptyState({ onClear, hasFilters }: { onClear: () => void; hasFilters: boolean }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "80px 20px",
        background: "var(--card)",
        border: "1.5px dashed var(--border)",
        borderRadius: "16px",
        color: "var(--muted)",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "rgba(108,99,255,0.1)",
          color: "var(--primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
        }}
      >
        <Inbox size={32} />
      </div>
      <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>
        কোনো listing পাওয়া যায়নি
      </div>
      <div style={{ fontSize: "14px", marginBottom: "20px" }}>
        {hasFilters
          ? "আপনার ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন"
          : "এখনো কোনো listing যোগ করা হয়নি"}
      </div>
      {hasFilters && (
        <button
          onClick={onClear}
          style={{
            background: "var(--primary)",
            color: "#fff",
            border: "none",
            padding: "10px 22px",
            borderRadius: "10px",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          ফিল্টার ক্লিয়ার করুন
        </button>
      )}
    </div>
  );
}
