"use client";

import CategoryLandingClient from "../../components/CategoryLandingClient";
import type { SubCategoryCard } from "../../components/CategoryLandingClient";
import type { Product } from "../../components/products/types";

const subCategories: SubCategoryCard[] = [
  { slug: "airpods-pro", label: "سماعات أبل", emoji: "🎧", href: "/audio/airpods-pro" },
];

const filterFn = (p: Product) =>
  p.category === "سماعات" || false;

export default function AudioClient({ initialProducts = [] }: { initialProducts?: Product[] }) {
  return (
    <CategoryLandingClient
      title="أجهزة صوت و سماعات"
      emoji="🎧"
      subCategories={subCategories}
      filterFn={filterFn}
      initialProducts={initialProducts}
    />
  );
}
