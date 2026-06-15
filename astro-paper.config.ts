import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://kahrens.com/",
    title: "Ken Ahrens",
    description:
      "Ken Ahrens — co-founder and CEO of Speedscale. Open source, homelabs, and running AI locally.",
    author: "Ken Ahrens",
    profile: "https://kahrens.com/",
    ogImage: "default-og.jpg",
    lang: "en",
    timezone: "America/New_York",
    dir: "ltr",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
  },
  socials: [
    { name: "github",   url: "https://github.com/kenahrens" },
    { name: "linkedin", url: "https://www.linkedin.com/in/kahrens/" },
    { name: "x",        url: "https://x.com/kahrens_atl" },
    { name: "devto",    url: "https://dev.to/kenahrens", linkTitle: "Ken Ahrens on dev.to" },
  ],
  shareLinks: [
    { name: "whatsapp", url: "https://wa.me/?text=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "x",        url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "pinterest", url: "https://pinterest.com/pin/create/button/?url=" },
    { name: "mail",     url: "mailto:?subject=See%20this%20post&body=" },
  ],
});