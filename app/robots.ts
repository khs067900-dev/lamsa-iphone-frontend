import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/verify/"],
      },
    ],
    sitemap: "https://lamsasmart.com/sitemap.xml",
    host: "https://lamsasmart.com",
  };
}
