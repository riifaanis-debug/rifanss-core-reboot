// Unified in-site notifications. Database is the single source of truth.
// Customer notifications: public.notifications (one row per customer).
// Admin notifications: public.admin_notifications (shared) + admin_notification_states (per admin).
import { supabase } from '@/integrations/supabase/client';

export type TargetType =
  | 'request' | 'contract' | 'promissory_note' | 'invoice'
  | 'open_request' | 'payment_request' | 'customer';

export type AdminEvent =
  | 'request_submitted' | 'documents_submitted' | 'contract_signed'
  | 'note_signed' | 'customer_registered';

const currentAppUserId = (): string | null => {
  try { return JSON.parse(localStorage.getItem('user') || 'null')?.id ?? null; } catch { return null; }
};

// Legacy browser copy removed: it produced phantom/duplicate notifications.
try { localStorage.removeItem('rifans_offline_notifications'); } catch { /* SSR / private mode */ }

// ---------- Customer ----------
export const notifyCustomer = async (p: {
  userId: string; event: string; title: string; message: string;
  targetType?: TargetType; targetId?: string | null; submissionId?: string | null; type?: string;
}) => {
  const { error } = await supabase.from('notifications').insert({
    user_id: p.userId,
    event: p.event,
    title: p.title,
    message: p.message,
    type: p.type || p.targetType || 'system',
    target_type: p.targetType || null,
    target_id: p.targetId ?? null,
    submission_id: p.submissionId ?? null,
  } as any);
  if (error) console.error('notifyCustomer', error);
};

export const getMyNotifications = async () => {
  const userId = currentAppUserId();
  if (!userId) return [];
  const { data } = await supabase.from('notifications').select('*')
    .eq('user_id', userId).is('archived_at', null)
    .order('created_at', { ascending: false }).limit(200);
  return data || [];
};

export const markNotificationRead = async (id: string) => {
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
};

export const markAllNotificationsRead = async () => {
  const userId = currentAppUserId();
  if (!userId) return;
  await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
};

export const archiveNotification = async (id: string) => {
  await supabase.from('notifications').update({ archived_at: new Date().toISOString(), is_read: true } as any).eq('id', id);
};

/** Customer destination, derived only from target_type/target_id. */
export const customerTargetHash = (n: any): string => {
  const id = n.target_id || n.submission_id || '';
  switch (n.target_type) {
    case 'contract': return `#/contract/${n.submission_id || id}`;
    case 'invoice': return `#/invoice/${n.submission_id || id}`;
    case 'promissory_note': return `#/promissory/${id}`;
    case 'open_request': return `#/dashboard?tab=open_requests&openReq=${encodeURIComponent(id)}`;
    case 'payment_request': return '#/dashboard?tab=payments';
    case 'request': return `#/dashboard?tab=requests&reqId=${encodeURIComponent(id)}`;
    default: return '#/dashboard?tab=requests';
  }
};

/** Subscribe to the current customer's notifications. Returns cleanup. */
export const subscribeMyNotifications = (userId: string, onChange: () => void) => {
  const channel = supabase.channel(`my-notifs-${userId}-${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, onChange)
    .subscribe();
  return () => { supabase.removeChannel(channel); };
};

// ---------- Admin ----------
/** Creates one shared admin notification; texts and customer are resolved in the database. */
export const notifyAdmins = async (event: AdminEvent, submissionId?: string | null) => {
  const { error } = await supabase.rpc('notify_admins' as any, {
    p_event: event, p_submission_id: submissionId ?? null, p_target_id: null,
  });
  if (error) console.error('notifyAdmins', error);
};

const authUid = async () => (await supabase.auth.getUser()).data.user?.id ?? null;

export const getAdminInbox = async () => {
  const uid = await authUid();
  if (!uid) return [];
  const [{ data: list }, { data: states }] = await Promise.all([
    supabase.from('admin_notifications').select('*').order('created_at', { ascending: false }).limit(300),
    supabase.from('admin_notification_states').select('*').eq('admin_user_id', uid),
  ]);
  const map = new Map((states || []).map((s: any) => [s.notification_id, s]));
  const ids = [...new Set((list || []).map((n: any) => n.customer_id).filter(Boolean))];
  const { data: users } = ids.length
    ? await supabase.from('app_users').select('id, full_name').in('id', ids as string[])
    : { data: [] as any[] };
  const names = new Map((users || []).map((u: any) => [u.id, u.full_name]));
  return (list || [])
    .filter((n: any) => !map.get(n.id)?.archived_at)
    .map((n: any) => ({
      ...n,
      user_name: names.get(n.customer_id) || '',
      is_read: !!map.get(n.id)?.read_at,
    }));
};

const upsertState = async (ids: string[], patch: Record<string, string>) => {
  const uid = await authUid();
  if (!uid || ids.length === 0) return;
  await supabase.from('admin_notification_states').upsert(
    ids.map(id => ({ notification_id: id, admin_user_id: uid, ...patch })) as any,
    { onConflict: 'notification_id,admin_user_id' },
  );
};

export const adminMarkRead = (id: string) => upsertState([id], { read_at: new Date().toISOString() });
export const adminMarkAllRead = (ids: string[]) => upsertState(ids, { read_at: new Date().toISOString() });
export const adminArchive = (id: string) => {
  const now = new Date().toISOString();
  return upsertState([id], { archived_at: now, read_at: now });
};

export const subscribeAdminNotifications = (onChange: () => void) => {
  const channel = supabase.channel(`admin-notifs-${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_notifications' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_notification_states' }, onChange)
    .subscribe();
  return () => { supabase.removeChannel(channel); };
};

export const formatBadge = (n: number) => (n > 99 ? '99+' : String(n));
