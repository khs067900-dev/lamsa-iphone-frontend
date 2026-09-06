export interface NavChild {
  label: string;
  href: string;
}

export interface NavGroup {
  groupLabel: string;
  items: NavChild[];
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
  groups?: NavGroup[];
}

export const navItems: NavItem[] = [
  {
    label: "الهواتف الذكية",
    href: "/smartphones/iphone-17-pro-max",
    groups: [
      {
        groupLabel: "آيفون",
        items: [
          { label: "آيفون 17 برو ماكس", href: "/smartphones/iphone-17-pro-max" },
          { label: "آيفون 17 برو", href: "/smartphones/iphone-17-pro" },
          { label: "آيفون 17 Air", href: "/smartphones/iphone-17-air" },
          { label: "آيفون 17 عادي", href: "/smartphones/iphone-17" },
          { label: "آيفون 16 برو ماكس", href: "/smartphones/iphone-16-pro-max" },
          { label: "آيفون 16 برو", href: "/smartphones/iphone-16-pro" },
          { label: "آيفون 16 بلس", href: "/smartphones/iphone-16-plus" },
          { label: "آيفون 16 عادي", href: "/smartphones/iphone-16" },
          { label: "آيفون 15 برو ماكس", href: "/smartphones/iphone-15-pro-max" },
          { label: "آيفون 15 بلس", href: "/smartphones/iphone-15-plus" },
          { label: "آيفون 14 برو ماكس", href: "/smartphones/iphone-14-pro-max" },
          { label: "آيفون 14 برو", href: "/smartphones/iphone-14-pro" },
          { label: "فقط آبل", href: "/smartphones/apple-only" },
        ],
      },
      {
        groupLabel: "سامسونج",
        items: [
          { label: "سامسونج S26 الترا", href: "/smartphones/samsung-s26-ultra" },
          { label: "سامسونج S25 الترا", href: "/smartphones/samsung-s25-ultra" },
          { label: "سامسونج S24 الترا", href: "/smartphones/samsung-s24-ultra" },
          { label: "سامسونج S23 الترا", href: "/smartphones/samsung-s23-ultra" },
          { label: "سامسونج S22 الترا", href: "/smartphones/samsung-s22-ultra" },
        ],
      },
    ],
  },
  {
    label: "ساعات ابل",
    href: "/apple-watches/se",
  },
  {
    label: "أجهزة بلاي ستيشن وملحقاتها",
    href: "/playstation",
  },

  {
    label: "الاجهزة اللوحية ايبادات",
    href: "/tablets/ipad",
    children: [
      { label: "ايباد", href: "/tablets/ipad" },
    ],
  },
  {
    label: "بطاريات متنقلة وكيابل",
    href: "/accessories",
    children: [
      { label: "بطاريات متنقلة", href: "/accessories/anker-batteries" },
    ],
  },
  {
    label: "سماعات AirPods",
    href: "/accessories/airpods",
  },

];
