import { DaftarNilaiContent } from '@/components/daftar-nilai/daftar-nilai-content'

export default async function DaftarNilaiPage({ searchParams }: {
  searchParams: Promise<{ classId?: string; semester?: string }>
}) {
  return <DaftarNilaiContent params={await searchParams} />
}
