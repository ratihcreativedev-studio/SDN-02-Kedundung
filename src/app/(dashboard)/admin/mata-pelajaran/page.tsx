import { CatalogPage } from '@/features/academic-catalog/Page'
export const metadata = { title: 'Data Mata Pelajaran | SIPANDA Admin' }
export default async function Page({ searchParams }: { searchParams: Promise<{ search?: string; page?: string }> }) {
  return <CatalogPage category="mata-pelajaran" params={await searchParams} />
}
