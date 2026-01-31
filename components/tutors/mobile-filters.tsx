"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Category } from "@/types";
import { Filter } from "lucide-react";
import { TutorFilters } from "./filters";

interface MobileFiltersProps {
  categories: Category[];
  maxPriceFromDb?: number; // Add this
}

export function MobileFilters({
  categories,
  maxPriceFromDb = 2000,
}: MobileFiltersProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden w-full">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-75 sm:w-100">
        <SheetHeader>
          <SheetTitle>Filter Tutors</SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <TutorFilters
            categories={categories}
            maxPriceFromDb={maxPriceFromDb}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
