"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { Category } from "@/types";
import { Filter, Loader2, X } from "lucide-react"; // Add Loader2
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

interface TutorFiltersProps {
  categories: Category[];
  maxPriceFromDb?: number;
}

export function TutorFilters({
  categories,
  maxPriceFromDb = 2000,
}: TutorFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition(); // Now we'll use isPending

  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentMinRating = Number(searchParams.get("minRating")) || 0;
  const currentMaxPrice =
    Number(searchParams.get("maxPrice")) || maxPriceFromDb;
  const currentSortBy = searchParams.get("sortBy") || "rating";

  const [priceValue, setPriceValue] = useState(currentMaxPrice);

  function updateFilter(key: string, value: string | number | null) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === null || value === "" || value === "all" || value === 0) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }

      params.delete("page");
      router.push(`/tutors?${params.toString()}`);
    });
  }

  function clearFilters() {
    startTransition(() => {
      router.push("/tutors");
    });
  }

  const hasFilters = currentSearch || currentCategory || currentMinRating > 0;

  return (
    <Card
      className={`sticky top-24 transition-opacity ${isPending ? "opacity-70" : "opacity-100"}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
          </CardTitle>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              disabled={isPending}
              className="h-8 px-2"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Name, subject..."
            value={currentSearch}
            disabled={isPending}
            onChange={(e) => updateFilter("search", e.target.value || null)}
          />
        </div>

        {/* Category Dropdown */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={currentCategory || "all"}
            onValueChange={(value) =>
              updateFilter("category", value === "all" ? null : value)
            }
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                // FIXED: Use cat.name instead of cat.slug
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rating */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Label>Min Rating</Label>
            <span className="text-muted-foreground">
              {currentMinRating > 0 ? `${currentMinRating}+ ⭐` : "Any"}
            </span>
          </div>
          <Slider
            value={[currentMinRating]}
            onValueChange={([v]) => updateFilter("minRating", v)}
            max={5}
            step={0.5}
            disabled={isPending}
          />
        </div>

        {/* Price */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Label>Max Price</Label>
            <span className="text-muted-foreground">${priceValue}</span>
          </div>
          <Slider
            value={[priceValue]}
            onValueChange={([v]) => setPriceValue(v)}
            onValueCommit={([v]) => updateFilter("maxPrice", v)}
            min={10}
            max={maxPriceFromDb}
            step={10}
            disabled={isPending}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$10</span>
            <span>${maxPriceFromDb}</span>
          </div>
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <Label>Sort By</Label>
          <Select
            value={currentSortBy}
            onValueChange={(value) => updateFilter("sortBy", value)}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="reviews">Most Reviews</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
