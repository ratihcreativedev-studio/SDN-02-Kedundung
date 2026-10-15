"use client";

import { Calendar } from "lucide-react";
import Link from "next/link";

function formatDate(dateStr: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(dateStr));
}

// Helper to convert plain text URLs into clickable links with broader patterns
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
            : !/^(?:https?:\/\/|ftp:\/\/|mailto:)/i.test(part)
              ? `https://${part}`
              : part;
          return (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="announcement-link relative z-10"
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

interface Profile {
  id: string;
  name: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Date | string;
  status: string;
  thumbnail?: string | null;
  author?: Profile;
}

export function AnnouncementList({ announcements }: { announcements: Announcement[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {announcements.map((item) => {
        const isLong = item.content.length > 150;
        const displayContent = isLong
          ? item.content.replace(/\s+/g, " ").slice(0, 150).trim() + "..."
          : item.content;

        return (
          <article
            key={item.id}
            className="group relative flex flex-col justify-between rounded-2xl border border-border bg-white overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/10 hover:shadow-lg"
          >
            <div>
              {item.thumbnail && (
                <div className="aspect-video w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="mb-4 flex items-center text-sm text-text-secondary">
                  <Calendar className="mr-2 h-4 w-4 text-primary" />
                  {formatDate(item.createdAt)}
                </div>
                <h3 className="mb-3 text-xl font-bold text-primary group-hover:text-primary-light transition-colors line-clamp-2">
                  <Link
                    href={`/informasi/${item.id}`}
                    className="after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:outline-primary focus-visible:after:-outline-offset-2"
                  >
                    {item.title}
                  </Link>
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {renderContentWithLinks(displayContent)}
                </p>
              </div>
            </div>

            {isLong && (
              <div className="px-6 pb-6 flex items-center text-sm font-bold text-secondary transition-colors group-hover:text-secondary-light">
                Baca Selengkapnya
                <span className="ml-1 transition-transform duration-200 group-hover:translate-x-0.5">
                  &rarr;
                </span>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
