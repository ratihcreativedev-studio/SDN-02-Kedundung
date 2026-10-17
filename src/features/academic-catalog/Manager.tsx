'use client'

import { useActionState, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { useNotifiedAction } from '@/components/ui/notification-provider'
import { ConfirmationForm } from '@/components/ui/confirmation-dialog'
import { saveCatalogAction, deleteCatalogAction } from './actions'
import type { LedgerCategory } from '@/features/grades/ledger/format'

type Item = { id: string; code: string; name: string }
function DeleteItem({ item, category }: { item: Item; category: LedgerCategory }) {
  const run = useNotifiedAction()
  const [state, action, pending] = useActionState<{ error?: string }, FormData>(async (_previous, data) => {
    const result = await run(() => deleteCatalogAction(data), 'Data berhasil dihapus.')
    return { error: result?.error }
  }, {})
  return <ConfirmationForm action={action} confirmation={{ title: `Hapus ${item.name}?`, description: 'Data akan dihapus dari daftar pilihan untuk penilaian baru. Riwayat nilai siswa yang sudah tersimpan tetap tersedia.', confirmLabel: 'Ya, hapus', destructive: true }}>
    <input type="hidden" name="id" value={item.id} /><input type="hidden" name="category" value={category} />
    <button disabled={pending} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 disabled:opacity-50">{pending ? 'Menghapus...' : 'Hapus'}</button>
    {state.error && <p role="alert" className="mt-2 text-xs text-red-600">{state.error}</p>}
  </ConfirmationForm>
}
function ItemForm({ item, category, done, label }: { item: Item | null; category: LedgerCategory; done: () => void; label: string }) {
  const run = useNotifiedAction()
  const [state, action, pending] = useActionState<{ error?: string }, FormData>(async (_previous, data) => {
    const result = await run(() => saveCatalogAction(data), 'Data berhasil disimpan.')
    if (result?.error) return { error: result.error }
    done()
    return {}
  }, {})
  return <form action={action} className="space-y-4 p-6">
    {item && <input type="hidden" name="id" value={item.id} />}
    <input type="hidden" name="category" value={category} />
    <label className="block space-y-2"><span className="text-sm font-semibold text-primary">Kode</span><input name="code" required maxLength={30} readOnly={!!item} defaultValue={item?.code} placeholder={category === 'mata-pelajaran' ? 'Contoh: TIK' : 'Contoh: SENI_MUSIK'} className="h-11 w-full rounded-xl border border-border px-3 text-sm uppercase read-only:bg-surface-alt" /></label>
    {item && <p className="text-xs text-text-muted">Kode tetap digunakan untuk mencocokkan nilai pada file Excel.</p>}
    <label className="block space-y-2"><span className="text-sm font-semibold text-primary">Nama {label}</span><input name="name" required maxLength={150} defaultValue={item?.name} className="h-11 w-full rounded-xl border border-border px-3 text-sm" /></label>
    {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
    <div className="flex justify-end gap-2"><button type="button" disabled={pending} onClick={done} className="rounded-xl border border-border px-4 py-2.5 text-sm">Batal</button><button disabled={pending} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{pending ? 'Menyimpan...' : 'Simpan'}</button></div>
  </form>
}
export function CatalogManager({ items, category }: { items: Item[]; category: LedgerCategory }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const [editing, setEditing] = useState<Item | null>(null)
  const [version, setVersion] = useState(0)
  const label = category === 'mata-pelajaran' ? 'Mata Pelajaran' : 'Ekstrakurikuler'
  function open(item: Item | null) { setEditing(item); setVersion(v => v + 1); dialog.current?.showModal() }
  return <div className="space-y-4">
    <div className="flex justify-end"><button onClick={() => open(null)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"><Plus size={18} />Tambah {label}</button></div>
    <div className="section-card overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-surface-alt text-text-secondary"><tr>{['Kode', 'Nama', 'Aksi'].map(name => <th key={name} scope="col" className="px-5 py-3 font-semibold">{name}</th>)}</tr></thead><tbody className="divide-y divide-border">
      {!items.length && <tr><td colSpan={3} className="p-8 text-center text-text-muted">Tidak ada data {label.toLowerCase()}.</td></tr>}
      {items.map(item => <tr key={item.id} className="hover:bg-surface-alt/40"><td className="px-5 py-3 font-medium text-primary">{item.code}</td><td className="px-5 py-3">{item.name}</td><td className="px-5 py-3"><div className="flex gap-2"><button onClick={() => open(item)} className="rounded-lg border border-primary/20 px-3 py-2 font-semibold text-primary">Edit</button><DeleteItem item={item} category={category} /></div></td></tr>)}
    </tbody></table></div>
    <dialog ref={dialog} aria-labelledby={titleId} className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-border bg-white p-0 text-text-primary shadow-2xl backdrop:bg-slate-950/45">
      <div className="flex items-center justify-between border-b border-border px-6 py-4"><h2 id={titleId} className="text-lg font-bold text-primary">{editing ? 'Edit' : 'Tambah'} {label}</h2><button type="button" aria-label="Tutup dialog" onClick={() => dialog.current?.close()} className="rounded-lg p-2 hover:bg-surface-alt"><X size={20} /></button></div>
      <ItemForm key={version} item={editing} category={category} label={label} done={() => dialog.current?.close()} />
    </dialog>
  </div>
}

export function CatalogCreate({ category }: { category: LedgerCategory }) {
  const router = useRouter()
  const label = category === 'mata-pelajaran' ? 'Mata Pelajaran' : 'Ekstrakurikuler'
  return <div className="section-card max-w-2xl"><ItemForm item={null} category={category} label={label} done={() => router.push(`/admin/${category}`)} /></div>
}
