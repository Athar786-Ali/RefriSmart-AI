// frontend/src/app/gallery/layout.tsx
// This server component exists solely to export page-level SEO metadata.
// It does NOT modify any UI — the actual page is rendered by page.tsx unchanged.
export { metadata } from "./metadata";

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
