import { useEffect, useRef, useState } from "react";
import * as Icons from "lucide-react";
import { Skeleton } from "@mantine/core";

export type Gif = {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  preview?: string;
  width?: number;
  height?: number;
};

interface GifPickerProps {
  onGifSelect?: (gif: Gif) => void;
}

interface GifCategory {
  category: string;
  query: string;
  preview_url?: string;
}

const appKey = "dUjSRYnwgf934YfAdCJDBq1v1CE0bJwKeozbTIdhXgeQWSfUKTuKE4MD8JlCH6SJ";
const perPage = 24;
const endpoint = `https://api.klipy.com/api/v1/${appKey}/gifs`;
const categoriesEndpoint = `https://api.klipy.com/api/v1/${appKey}/gifs/categories`;
const trendingEndpoint = `${endpoint}/trending`;
const searchEndpoint = `${endpoint}/search`;
const skeletonRows = 4;
const skeletonMinItemWidth = 90;
const skeletonGap = 8;

// Klipy has a customer id thing, it will be user id in prod.
function getCustomerId(): string {
  const storageKey = "klipy_customer_id";
  try {
    const existing = window.localStorage.getItem(storageKey);
    if (existing) return existing;
    const generated =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `cid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(storageKey, generated);
    return generated;
  } catch {
    
    // For if local storage is unavailable, likely won't happen cuz electron but idk
    return `cid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function normalizeGif(item: any, index: number): Gif | null {
  const file = item?.file ?? item?.media ?? item?.images ?? {};
  const fileVariants = file?.md ?? file?.hd ?? file?.sd ?? file ?? {};
  const gifAsset = fileVariants?.gif ?? file?.gif ?? item?.media_formats?.gif ?? item?.media_formats?.tinygif ?? {};
  const previewAsset =
    fileVariants?.webp ??
    file?.webp ??
    item?.preview?.webp ??
    item?.preview ??
    item?.media_formats?.webp ??
    {};

  const url =
    item?.url ??
    item?.imageUrl ??
    item?.image_url ??
    item?.preview?.imageUrl ??
    item?.preview?.url ??
    item?.images?.downsized?.url ??
    gifAsset?.url ??
    gifAsset?.gif?.url ??
    item?.media_formats?.gif?.url ??
    item?.media_formats?.tinygif?.url ??
    "";

  const preview =
    item?.preview?.imageUrl ??
    item?.preview?.url ??
    previewAsset?.url ??
    previewAsset?.imageUrl ??
    url;

  if (!url) return null;

  return {
    id: String(item?.id ?? `${index}-${Math.random().toString(36).slice(2)}`),
    title: item?.title ?? item?.description ?? `GIF ${index + 1}`,
    url,
    imageUrl: url,
    preview,
    width:
      item?.width ??
      item?.preview?.width ??
      item?.images?.downsized?.width ??
      gifAsset?.width ??
      gifAsset?.gif?.width ??
      previewAsset?.width ??
      220,
    height:
      item?.height ??
      item?.preview?.height ??
      item?.images?.downsized?.height ??
      gifAsset?.height ??
      gifAsset?.gif?.height ??
      previewAsset?.height ??
      220,
  };
}

// Klipy docs: trending uses /gifs/trending?page={page}&per_page={per_page}&customer_id={customer_id}
// and search uses /gifs/search?page={page}&per_page={per_page}&q={q}&customer_id={customer_id}
async function fetchGifsPage(
  query: string,
  page: number
): Promise<{ gifs: Gif[]; hasMore: boolean }> {
  const trimmedQuery = query.trim(); // Possibly the worlds most descriptive name.
  const customerId = getCustomerId(); // Maybe the second most descriptive name.

  const url = trimmedQuery
    ? `${searchEndpoint}?page=${page}&per_page=${perPage}&q=${encodeURIComponent(trimmedQuery)}&customer_id=${encodeURIComponent(customerId)}`
    : `${trendingEndpoint}?page=${page}&per_page=${perPage}&customer_id=${encodeURIComponent(customerId)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: new Headers(),
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`GIF request failed (${response.status})`);
  }

  const data = await response.json();
  const list = Array.isArray(data?.data?.data)
    ? data.data.data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.gifs)
          ? data.gifs
          : Array.isArray(data)
            ? data
            : [];

  const gifs = list
    .map((item: any, index: number) => normalizeGif(item, index))
    .filter((gif): gif is Gif => Boolean(gif));


  // Klipy doesnt expose a page that reliably indicates whether there are more pages, so we use the length of the returned list to determine if there are more.
  const hasMore = list.length >= perPage;

  return { gifs, hasMore };
}

async function fetchCategories(): Promise<GifCategory[]> {
  const customerId = getCustomerId();
  const response = await fetch(
    `${categoriesEndpoint}?customer_id=${encodeURIComponent(customerId)}`,
    {
      method: "GET",
      headers: new Headers(),
      redirect: "follow",
    }
  );

  if (!response.ok) {
    throw new Error(`Categories request failed (${response.status})`);
  }

  const data = await response.json();
  const categories = Array.isArray(data?.data?.categories)
    ? data.data.categories
    : Array.isArray(data?.categories)
      ? data.categories
      : [];

  return categories.filter((item: any) => item?.query || item?.category);
}

type ActiveCategory = { label: string; query: string };

export default function GifPicker({ onGifSelect }: GifPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ActiveCategory | null>(null);

  const [categories, setCategories] = useState<GifCategory[]>([]);
  const [trendingPreview, setTrendingPreview] = useState<Gif | null>(null);

  const [gifs, setGifs] = useState<Gif[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [skeletonColumns, setSkeletonColumns] = useState(3);

  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    const updateSkeletonColumns = () => {
      const styles = window.getComputedStyle(body);
      const horizontalPadding =
        parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
      const availableWidth = body.clientWidth - horizontalPadding;
      const columns = Math.max(
        1,
        Math.floor((availableWidth + skeletonGap) / (skeletonMinItemWidth + skeletonGap))
      );
      setSkeletonColumns(columns);
    };

    updateSkeletonColumns();
    const observer = new ResizeObserver(updateSkeletonColumns);
    observer.observe(body);

    return () => observer.disconnect();
  }, []);

  // For typing(not ts typing, like keyboard)
  const mode: "browse" | "category" | "search" = activeQuery
    ? "search"
    : activeCategory
      ? "category"
      : "browse";
  const effectiveQuery = mode === "search" ? activeQuery : mode === "category" ? activeCategory!.query : "";

  // Load catefories
  useEffect(() => {
    let isActive = true;

    (async () => {
      try {
        const items = await fetchCategories();
        if (isActive) setCategories(items);
      } catch {
        if (isActive) setCategories([]);
      }
    })();

    (async () => {
      try {
        const { gifs: firstPage } = await fetchGifsPage("", 1);
        if (isActive && firstPage.length > 0) setTrendingPreview(firstPage[0]);
      } catch {
        // No preview thumbnail is fine - the tile still works without one.
      }
    })();

    return () => {
      isActive = false;
    };
  }, []);

 // This is debounced! Are you proud of me dad? no!?
  useEffect(() => {
    if (mode === "browse") {
      setGifs([]);
      setPage(1);
      setHasMore(true);
      return;
    }

    let isActive = true;
    setLoading(true);

    const timeout = window.setTimeout(async () => {
      try {
        const { gifs: firstPage, hasMore: more } = await fetchGifsPage(effectiveQuery, 1);
        if (isActive) {
          setGifs(firstPage);
          setHasMore(more);
          setPage(1);
        }
      } catch {
        if (isActive) {
          setGifs([]);
          setHasMore(false);
        }
      } finally {
        if (isActive) setLoading(false);
      }
    }, 200);

    return () => {
      isActive = false;
      window.clearTimeout(timeout);
    };
  }, [mode, effectiveQuery]);

  // Scroll position resetter
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [mode, effectiveQuery]);

  const loadMore = async () => {
    if (mode === "browse" || loading || loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const { gifs: nextGifs, hasMore: more } = await fetchGifsPage(effectiveQuery, nextPage);
      setGifs((prev) => [...prev, ...nextGifs]);
      setHasMore(more);
      setPage(nextPage);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleScroll = () => {
    const el = bodyRef.current;
    if (!el) return;
    const threshold = 150;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < threshold) {
      loadMore();
    }
  };

  const handleCategoryClick = (label: string, query: string) => {
    setActiveCategory({ label, query });
  };

  const handleBack = () => {
    setActiveCategory(null);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    const trimmed = value.trim();
    // Only search if its not empty in information
    if (trimmed !== activeQuery) {
      setActiveQuery(trimmed);
    }
  };

  // Clear Search
  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveQuery("");
  };

  // This is a gif, its a button secretly
  const renderGifButton = (gif: Gif) => (
    <button
      key={gif.id}
      type="button"
      className="gif-item"
      onClick={() => onGifSelect?.(gif)}
      aria-label={`Select ${gif.title}`}
      title={gif.title}
    >
      <img src={gif.preview ?? gif.url} alt={gif.title} loading="lazy" />
    </button>
  );

  const renderGifSkeletons = (count: number) => (
    <div className="gif-grid gif-skeleton-grid" aria-label="Loading GIFs">
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={`gif-skeleton-${index}`} className="gif-skeleton" />
      ))}
    </div>
  );

  return (
    <div className="gifpicker">
      <div className="gif-search">
        <input
          value={searchQuery}
          onChange={(event) => handleSearchChange(event.target.value)}
          type="text"
          placeholder="Search KLIPY"
          aria-label="Search GIFs"
        />
        {searchQuery.length > 0 && (
          <button
            type="button"
            className="gif-search-clear"
            onClick={handleClearSearch}
            aria-label="Clear search"
          >
            <Icons.X size={16} />
          </button>
        )}
      </div>

      {mode === "category" && (
        <div className="gif-panel-header">
          <button
            type="button"
            className="gif-back-button"
            onClick={handleBack}
            aria-label="Back to categories"
          >
            <Icons.ArrowLeft size={16} /> Back
          </button>
          <h3 className="gif-panel-title">{activeCategory!.label}</h3>
        </div>
      )}

      <div className="gif-body" ref={bodyRef} onScroll={handleScroll}>
        {mode === "browse" ? (
          categories.length > 0 || trendingPreview ? (
            <div className="gif-grid gif-categories">
              <button
                type="button"
                className="gif-item gif-category"
                onClick={() => handleCategoryClick("Trending", "")}
                aria-label="Browse Trending GIFs"
                title="Trending"
              >
                {trendingPreview && (
                  <img
                    src={trendingPreview.preview ?? trendingPreview.url}
                    alt="Trending"
                    loading="lazy"
                  />
                )}
                <span className="gif-category-label"><Icons.TrendingUp size={16} /> Trending</span>
              </button>

              {categories.map((category) => {
                const label = category.category || category.query || "GIF";
                const query = category.query || category.category || "";

                return (
                  <button
                    key={`${label}-${query}`}
                    type="button"
                    className="gif-item gif-category"
                    onClick={() => handleCategoryClick(label, query)}
                    aria-label={`Browse ${label} GIFs`}
                    title={label}
                  >
                    {category.preview_url && (
                      <img src={category.preview_url} alt={label} loading="lazy" />
                    )}
                    <span className="gif-category-label">{label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="gif-empty">No content yet</div>
          )
        ) : loading ? (
          renderGifSkeletons(skeletonColumns * skeletonRows)
        ) : gifs.length ? (
          <>
            <div className="gif-grid">{gifs.map(renderGifButton)}</div>
            {loadingMore && (
              <>
                {renderGifSkeletons(skeletonColumns)}
                <div className="gif-loading-more">Loading more...</div>
              </>
            )}
          </>
        ) : (
          <div className="gif-empty"><Icons.FileX size={16} /> No GIFs found</div>
        )}
      </div>
    </div>
  );
}