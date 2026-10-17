import { LedgerPage } from '@/features/grades/ledger/Page'
export const metadata = { title: 'Rekap Nilai | SIPANDA Admin' }
export default async function Page({ searchParams }: { searchParams: Promise<{ classId?: string; semester?: string; page?: string; search?: string }> }) {
  return <LedgerPage params={await searchParams} category="mata-pelajaran" />
}
