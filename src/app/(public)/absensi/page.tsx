import { AbsensiContent } from '@/components/absensi/absensi-content'

export default async function AbsensiPage({ searchParams }: {
  searchParams: Promise<{ classId?: string; semester?: string }>
}) {
  return <AbsensiContent params={await searchParams} />
}
