export type NotificationKind = 'success' | 'error'
export type ActionResult = { success?: boolean; error?: string } | void

export async function executeNotifiedAction(
  action: () => Promise<ActionResult>,
  successMessage: string,
  notify: (message: string, kind: NotificationKind) => void,
): Promise<{ success: boolean; error: string }> {
  try {
    const result = await action()
    if (result?.error || (result !== undefined && !result.success)) {
      const error = result?.error || 'Tindakan gagal diproses. Silakan coba lagi.'
      notify(error, 'error')
      return { success: false, error }
    }
    notify(successMessage, 'success')
    return { success: true, error: '' }
  } catch {
    const error = 'Terjadi gangguan saat memproses tindakan. Silakan coba lagi.'
    notify(error, 'error')
    return { success: false, error }
  }
}
