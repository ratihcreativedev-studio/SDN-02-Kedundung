import Link from 'next/link'
import { Plus } from 'lucide-react'
import { type LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description: string
  icon: LucideIcon
  iconGradient: string
  actionLabel?: string
  actionHref?: string
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  iconGradient,
  actionLabel,
  actionHref,
}: PageHeaderProps) {
  return (
    <div className="page-hero animate-fade-in-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-linear-to-br ${iconGradient} shadow-lg shadow-primary/15`}>
            <Icon size={20} className="text-white sm:hidden" />
            <Icon size={24} className="text-white hidden sm:block" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary sm:text-3xl lg:text-4xl">
              {title}
            </h1>
            <p className="text-xs text-text-secondary sm:text-sm mt-0.5 sm:mt-1">
              {description}
            </p>
          </div>
        </div>
        {actionLabel && actionHref && (
          <Link href={actionHref} className="btn-primary self-start sm:self-auto">
            <Plus className="h-4 w-4" />
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  )
}
