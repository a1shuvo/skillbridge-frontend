import { get } from "@/lib/api"
import type { Category } from "@/types"

interface CategoriesResponse {
  success: boolean
  data: Category[]
}

export const categoryService = {
  async getAllCategories() {
    return get<CategoriesResponse>("/api/v1/categories", { skipErrorToast: true })
  },
}