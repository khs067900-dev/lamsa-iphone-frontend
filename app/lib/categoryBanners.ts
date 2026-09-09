/** تحويل Cloudinary URL لإضافة f_auto,q_auto,w_1200 تلقائياً */
function cl(url: string): string {
  if (!url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto,w_1200/");
}

export const categoryBanners: Record<string, string> = {
  "iphone-17-pro-max": "/iphone-17-pro-max-banner.avif",
  "iphone-17-pro": "/iphone-17-pro-max-banner.avif",
  "iphone-17-air": "/iPhone_Air_Cloud_White_PDP_Image_Position_7__en-ME-scaled(1).avif",
  "iphone-17": cl("https://res.cloudinary.com/dv6fig2ci/image/upload/v1779497909/iPhone_16_Black_PDP_Image_Position_5__en-ME-scaled_o6hv98_wlr9iv.avif"),
  "iphone-16-pro-max": cl("https://res.cloudinary.com/dv6fig2ci/image/upload/v1779497795/iPhone_16_Pro_Desert_Titanium_PDP_Image_Position_5__en-ME-scaled_h1zf9u_mvmggs.avif"),
  "iphone-16-pro": cl("https://res.cloudinary.com/dv6fig2ci/image/upload/v1779497795/iPhone_16_Pro_Desert_Titanium_PDP_Image_Position_5__en-ME-scaled_h1zf9u_mvmggs.avif"),
  "iphone-16-plus": cl("https://res.cloudinary.com/dv6fig2ci/image/upload/v1779497909/iPhone_16_Black_PDP_Image_Position_5__en-ME-scaled_o6hv98_wlr9iv.avif"),
  "iphone-16": cl("https://res.cloudinary.com/dv6fig2ci/image/upload/v1779497909/iPhone_16_Black_PDP_Image_Position_5__en-ME-scaled_o6hv98_wlr9iv.avif"),
  "iphone-15-pro-max": cl("https://res.cloudinary.com/dv6fig2ci/image/upload/v1779497806/iphone-15-pro-max_ecyzxn.png"),
  "iphone-15-plus": cl("https://res.cloudinary.com/dv6fig2ci/image/upload/v1779497908/iphone_15_plus_hero_cf2xnf_d8zqmt.avif"),
};
