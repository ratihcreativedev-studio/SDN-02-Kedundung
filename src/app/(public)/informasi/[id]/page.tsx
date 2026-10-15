import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { announcementService } from "@/features/announcements/services";

export const revalidate = 3600;

interface PageParams {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageParams) {
  const { id } = await params;
  try {
    const announcement = await announcementService.getById(id);
    return {
      title: `${announcement.title} | SIPANDA - SDN Kedundung 2`,
      description: announcement.content.slice(0, 160).replace(/\s+/g, " "),
    };
  } catch {
    return {
      title: "Detail Informasi | SIPANDA - SDN Kedundung 2",
    };
  }
}

// Helper to consistently format Indonesian dates
function formatDate(dateStr: Date | string) {
  const date = new Date(dateStr);
  const day = date.getDate();
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} pukul ${hours}.${minutes}`;
}

// Helper to convert plain text URLs into clickable links
function renderContentWithLinks(text: string) {
  const urlPattern = /((?:https?:\/\/|ftp:\/\/|mailto:|www\.|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/)[^\s]+)/gi;
  const parts = text.split(urlPattern);

  return (
    <>
      {parts.map((part, i) => {
        const isUrl = /^(https?:\/\/|ftp:\/\/|mailto:|www\.|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/)/i.test(part);
        if (isUrl) {
          const href = part.startsWith("www.") 
            ? `https://${part}` 
            : !/^https?:\/\//i.test(part) && !part.startsWith("mailto:")
              ? `https://${part}`
              : part;
          return (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="announcement-link"
            >
              {part}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default async function InformasiDetailPage({ params }: PageParams) {
  const { id } = await params;
  
  const announcement = await announcementService.getById(id).catch(() => null);
  if (!announcement || announcement.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <div className="page-shell bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            href="/informasi"
            className="group inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors duration-200"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Kembali ke Informasi
          </Link>
        </div>

        {/* Article Container */}
        <article className="rounded-3xl border border-border bg-white p-6 sm:p-10 shadow-sm">
          
          {/* Header Metadata */}
          <header className="mb-8 border-b border-border pb-6">
            <div className="mb-4 flex items-center text-xs font-semibold uppercase tracking-wider text-secondary">
              <Calendar className="mr-2 h-4.5 w-4.5 text-secondary" />
              {formatDate(announcement.createdAt)}
            </div>
            <h1 className="text-3xl font-black text-primary sm:text-4xl tracking-tight leading-snug">
              {announcement.title}
            </h1>
          </header>

          {/* Full uncropped Thumbnail */}
          {announcement.thumbnail && (
            <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-surface-alt flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={announcement.thumbnail}
                alt={announcement.title}
                className="w-full max-h-150 object-contain"
              />
            </div>
          )}

          {/* Body Content */}
          <div className="text-text-secondary leading-relaxed whitespace-pre-wrap text-base sm:text-lg">
            {renderContentWithLinks(announcement.content)}
          </div>

        </article>
      </div>
    </div>
  );
}
