import { supabase } from '@/integrations/supabase/client';

// Helper to get current user ID from localStorage
const getCurrentUserId = (): string | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr).id;
  } catch { return null; }
};

// Local storage resilience helpers for offline / unconfigured database
const LOCAL_REQUESTS_KEY = 'rifans_offline_requests';
const LOCAL_NOTIFICATIONS_KEY = 'rifans_offline_notifications';

const getOfflineRequests = (): any[] => {
  try {
    const raw = localStorage.getItem(LOCAL_REQUESTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveOfflineRequest = (req: any) => {
  try {
    const list = getOfflineRequests();
    const idx = list.findIndex(r => r.id === req.id);
    if (idx >= 0) list[idx] = { ...list[idx], ...req };
    else list.unshift(req);
    localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Failed to save offline request', err);
  }
};

const getOfflineNotifications = (): any[] => {
  try {
    const raw = localStorage.getItem(LOCAL_NOTIFICATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveOfflineNotification = (notif: any) => {
  try {
    const list = getOfflineNotifications();
    list.unshift(notif);
    localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Failed to save offline notification', err);
  }
};

// ---- REQUESTS ----
export const submitRequest = async (requestData: any) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('غير مسجل الدخول');

  const newRequest = {
    id: Date.now().toString(),
    user_id: userId,
    type: requestData.type || 'general',
    details: requestData.details || '',
    data: requestData.data || {},
    files: requestData.files || [],
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  let resultData = newRequest;
  try {
    const { data, error } = await supabase.from('requests').insert(newRequest).select().single();
    if (!error && data) {
      resultData = data;
    } else {
      saveOfflineRequest(newRequest);
    }
  } catch {
    saveOfflineRequest(newRequest);
  }

  // Auto-sync customer profile data (region, city, age, job_status, bank, etc.) to app_users
  if (requestData.data && userId) {
    try {
      const d = requestData.data;
      const userUpdate: any = {};
      if (d.region) userUpdate.region = d.region;
      if (d.city) userUpdate.city = d.city;
      if (d.age) userUpdate.age = String(d.age);
      if (d.jobStatus || d.job_status) userUpdate.job_status = d.jobStatus || d.job_status;
      if (d.bank) userUpdate.bank = d.bank;
      if (d.salary) userUpdate.salary = d.salary;
      if (d.firstName || d.first_name) userUpdate.first_name = d.firstName || d.first_name;
      if (d.middleName || d.middle_name) userUpdate.middle_name = d.middleName || d.middle_name;
      if (d.lastName || d.last_name) userUpdate.last_name = d.lastName || d.last_name;
      if (d.fullName || d.full_name) userUpdate.full_name = d.fullName || d.full_name;

      if (Object.keys(userUpdate).length > 0) {
        await supabase.from('app_users').update(userUpdate).eq('id', userId);
      }
    } catch (profileSyncErr) {
      console.error("Auto-sync profile from request error:", profileSyncErr);
    }
  }

  // Create notification
  const notif = {
    id: `NOT-${Date.now()}`,
    user_id: userId,
    submission_id: newRequest.id,
    title: 'تم استلام طلبك',
    message: `تم استلام طلبك بنجاح وهو قيد المراجعة الآن. نوع الطلب: ${newRequest.type}`,
    type: 'new_request',
    created_at: new Date().toISOString(),
    is_read: false,
  };
  try {
    await supabase.from('notifications').insert(notif);
  } catch {
    saveOfflineNotification(notif);
  }
  saveOfflineNotification(notif);

  return resultData;
};

export const saveDraftRequest = async (requestData: any) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('غير مسجل الدخول');

  // Check if draft already exists for this user and type
  const { data: existing } = await supabase
    .from('requests')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'draft')
    .eq('type', requestData.type || 'general')
    .maybeSingle();

  if (existing) {
    // Update existing draft
    const { data, error } = await supabase
      .from('requests')
      .update({
        details: requestData.details || '',
        data: requestData.data || {},
        files: requestData.files || [],
      })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Create new draft
  const newDraft = {
    id: `DRAFT-${Date.now()}`,
    user_id: userId,
    type: requestData.type || 'general',
    details: requestData.details || '',
    data: requestData.data || {},
    files: requestData.files || [],
    status: 'draft',
  };

  const { data, error } = await supabase.from('requests').insert(newDraft).select().single();
  if (error) throw error;
  return data;
};

export const getMyRequests = async () => {
  const userId = getCurrentUserId();
  if (!userId) return [];
  let dbRequests: any[] = [];
  try {
    const { data } = await supabase.from('requests').select('*').eq('user_id', userId).neq('status', 'cancelled').order('created_at', { ascending: false });
    if (data) dbRequests = data;
  } catch {
    // ignore
  }
  const localRequests = getOfflineRequests().filter(r => r.user_id === userId && r.status !== 'cancelled');
  const all = [...localRequests, ...dbRequests];
  const seen = new Set();
  const deduped = all.filter(r => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
  return deduped.map(r => ({ ...r, userId: r.user_id, timestamp: r.created_at || r.timestamp || new Date().toISOString() }));
};

export const deleteRequest = async (requestId: string) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('غير مسجل الدخول');
  // Update locally
  const list = getOfflineRequests();
  const idx = list.findIndex(r => r.id === requestId);
  if (idx >= 0) {
    list[idx].status = 'cancelled';
    localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(list));
  }
  try {
    await supabase.from('requests').update({ status: 'cancelled' }).eq('id', requestId).eq('user_id', userId);
  } catch {
    // ignore
  }
};

export const getMyNotifications = async () => {
  const userId = getCurrentUserId();
  if (!userId) return [];
  let dbList: any[] = [];
  try {
    const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (data) dbList = data;
  } catch {
    // ignore
  }
  const localList = getOfflineNotifications().filter(n => n.user_id === userId);
  const all = [...localList, ...dbList];
  const seen = new Set();
  return all.filter(n => {
    if (seen.has(n.id)) return false;
    seen.add(n.id);
    return true;
  });
};

export const markAllNotificationsRead = async () => {
  const userId = getCurrentUserId();
  if (!userId) return;
  const list = getOfflineNotifications().map(n => n.user_id === userId ? { ...n, is_read: true } : n);
  localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(list));
  try {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
  } catch {
    // ignore
  }
};

export const markNotificationRead = async (id: string) => {
  const list = getOfflineNotifications().map(n => n.id === id ? { ...n, is_read: true } : n);
  localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(list));
  try {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  } catch {
    // ignore
  }
};

export const getMyContracts = async () => {
  const userId = getCurrentUserId();
  if (!userId) return [];
  try {
    const { data } = await supabase.from('contracts').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return data || [];
  } catch {
    return [];
  }
};

export const getProfile = async () => {
  const userId = getCurrentUserId();
  if (!userId) return null;
  try {
    const { data } = await supabase.from('app_users').select('*').eq('id', userId).single();
    if (data) return data;
  } catch {
    // ignore
  }
  // Try local users
  try {
    const raw = localStorage.getItem('rifans_offline_users');
    if (raw) {
      const users = JSON.parse(raw);
      const u = users.find((x: any) => x.id === userId);
      if (u) return u;
    }
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
  } catch {
    // ignore
  }
  return null;
};

export const updateProfile = async (profileData: any) => {
  const userId = getCurrentUserId();
  if (!userId) return;
  const updatePayload: any = {
    full_name: profileData.fullName,
    first_name: profileData.firstName,
    middle_name: profileData.middleName,
    last_name: profileData.lastName,
    phone: profileData.phone || profileData.mobile,
    national_id: profileData.national_id || profileData.nationalId,
    job_status: profileData.jobStatus,
    salary: profileData.salary,
    age: profileData.age,
    region: profileData.region,
    city: profileData.city,
    bank: profileData.bank,
    products: profileData.products || [],
    documents: profileData.documents || [],
  };
  if (profileData.fileNumber || profileData.file_number) {
    updatePayload.file_number = profileData.fileNumber || profileData.file_number;
  }

  // Update in local offline store
  try {
    const raw = localStorage.getItem('rifans_offline_users');
    const users = raw ? JSON.parse(raw) : [];
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...updatePayload };
    } else {
      users.push({ id: userId, ...updatePayload });
    }
    localStorage.setItem('rifans_offline_users', JSON.stringify(users));

    const currentUserRaw = localStorage.getItem('user');
    if (currentUserRaw) {
      const cu = JSON.parse(currentUserRaw);
      localStorage.setItem('user', JSON.stringify({ ...cu, ...updatePayload }));
    }
  } catch (err) {
    console.warn('Failed saving profile locally', err);
  }

  try {
    await supabase.from('app_users').update(updatePayload).eq('id', userId);
  } catch {
    // ignore
  }
};

export const uploadDocument = async (file: File) => {
  const ext = file.name.split('.').pop() || 'pdf';
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { data, error } = await supabase.storage.from('uploads').upload(fileName, file);
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
  return { fileName: file.name, filePath: urlData.publicUrl };
};

// ---- ADMIN ----
export const getAdminSubmissions = async () => {
  const { data: requests } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
  if (!requests) return [];
  
  const userIds = [...new Set(requests.map(r => r.user_id))];
  const { data: users } = await supabase.from('app_users').select('id, full_name, email, phone, national_id').in('id', userIds);
  const userMap = new Map((users || []).map(u => [u.id, u]));
  
  return requests.map(r => {
    const u = userMap.get(r.user_id);
    return {
      ...r,
      userId: r.user_id,
      user_name: u?.full_name || 'عميل غير معروف',
      user_email: u?.email || '',
      user_phone: u?.phone || '',
      user_national_id: u?.national_id || '',
      timestamp: r.created_at,
    };
  });
};

export const getAdminUsers = async () => {
  const { data } = await supabase.from('app_users').select('*').neq('role', 'admin');
  return (data || []).map(u => ({
    ...u,
    name: u.full_name,
    fileNumber: u.file_number,
    nationalId: u.national_id,
    mobile: u.phone,
    jobStatus: u.job_status,
  }));
};

export const getAdminNotifications = async () => {
  const { data: notifications } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
  if (!notifications) return [];
  
  const userIds = [...new Set(notifications.map(n => n.user_id))];
  const { data: users } = await supabase.from('app_users').select('id, full_name').in('id', userIds);
  const userMap = new Map((users || []).map(u => [u.id, u.full_name]));
  
  return notifications.map(n => ({ ...n, user_name: userMap.get(n.user_id) || 'غير معروف' }));
};

export const getAdminContracts = async () => {
  const { data: contracts } = await supabase.from('contracts').select('*').order('created_at', { ascending: false });
  if (!contracts) return [];
  
  const userIds = [...new Set(contracts.map(c => c.user_id))];
  const { data: users } = await supabase.from('app_users').select('id, full_name').in('id', userIds);
  const userMap = new Map((users || []).map(u => [u.id, u.full_name]));

  return contracts.map(c => ({
    ...c,
    file_number: c.submission_id,
    user_name: userMap.get(c.user_id) || 'غير معروف',
  }));
};

export const updateSubmissionStatus = async (id: string, status: string, comment?: string) => {
  await supabase.from('requests').update({ status }).eq('id', id);
  
  const userId = getCurrentUserId();
  await supabase.from('request_history').insert({
    id: `HIST-${Date.now()}`,
    request_id: id,
    status,
    comment: comment || `Status changed to ${status}`,
    changed_by: userId,
  });

  // Get request to find the owner
  const { data: req } = await supabase.from('requests').select('user_id').eq('id', id).single();
  if (req) {
    let title = 'تحديث في حالة طلبك';
    let message = `تم تغيير حالة طلبك رقم ${id} إلى: ${status}`;
    if (status === 'processing') { title = 'طلبك تحت المراجعة'; message = 'بدأ فريقنا في مراجعة طلبك.'; }
    else if (status === 'completed') { title = 'اكتملت معالجة الطلب'; message = 'تهانينا، تم الانتهاء من معالجة طلبك بنجاح.'; }
    else if (status === 'rejected') { title = 'تم رفض الطلب'; message = comment || 'نعتذر، لم يتم قبول طلبك.'; }

    await supabase.from('notifications').insert({
      id: `NOT-${Date.now()}`,
      user_id: req.user_id,
      submission_id: id,
      title,
      message,
      type: 'status_change',
    });
  }
};

export const getSubmissionHistory = async (id: string) => {
  const { data: history } = await supabase.from('request_history').select('*').eq('request_id', id).order('created_at', { ascending: false });
  if (!history) return [];
  
  const changerIds = [...new Set(history.map(h => h.changed_by).filter(Boolean))];
  let userMap = new Map();
  if (changerIds.length > 0) {
    const { data: users } = await supabase.from('app_users').select('id, full_name').in('id', changerIds);
    userMap = new Map((users || []).map(u => [u.id, u.full_name]));
  }
  
  return history.map(h => ({ ...h, changed_by_name: userMap.get(h.changed_by) || 'مدير' }));
};

export const sendContract = async (userId: string, submissionId: string) => {
  const contractId = `CON-${Date.now()}`;
  const { data: req } = await supabase.from('requests').select('type').eq('id', submissionId).single();
  
  await supabase.from('contracts').insert({
    id: contractId,
    submission_id: submissionId,
    user_id: userId,
    type: req?.type || 'general',
  });

  await supabase.from('requests').update({ status: 'contract_signature' }).eq('id', submissionId);

  await supabase.from('notifications').insert({
    id: `NOT-${Date.now()}`,
    user_id: userId,
    submission_id: submissionId,
    title: 'عقد جديد بانتظار التوقيع',
    message: 'تم إصدار عقد جديد لطلبك، يرجى المراجعة والتوقيع الإلكتروني.',
    type: 'contract',
  });

  return contractId;
};

export const getSubmission = async (id: string) => {
  const { data: req } = await supabase.from('requests').select('*').eq('id', id).single();
  if (!req) return null;
  
  const { data: contracts } = await supabase.from('contracts').select('*').eq('submission_id', id).limit(1);
  const contract = contracts && contracts.length > 0 ? contracts[0] : null;
  
  return {
    ...req,
    userId: req.user_id,
    signature_data: contract?.signature_data || null,
    signed_at: contract?.signed_at || null,
    timestamp: req.created_at,
  };
};

export const submitSignature = async (submissionId: string, signatureData: string) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('غير مسجل الدخول');
  
  const { data: contracts } = await supabase.from('contracts')
    .select('*')
    .eq('submission_id', submissionId)
    .eq('user_id', userId)
    .limit(1);
  
  if (!contracts || contracts.length === 0) throw new Error('العقد غير موجود');
  
  await supabase.from('contracts').update({
    signature_data: signatureData,
    signed_at: new Date().toISOString(),
  }).eq('id', contracts[0].id);

  await supabase.from('requests').update({ status: 'executing' }).eq('id', submissionId);
};

export const notifyAdminContractSigned = async (submissionId: string, contractPdfFile?: { fileName: string; filePath: string }) => {
  const userId = getCurrentUserId();
  if (!userId) return;

  const { data: user } = await supabase.from('app_users').select('full_name, phone, national_id, email').eq('id', userId).single();
  const { data: req } = await supabase.from('requests').select('*').eq('id', submissionId).single();

  const files = contractPdfFile ? [contractPdfFile] : [];

  await supabase.functions.invoke('notify-admin', {
    body: {
      requestData: {
        id: submissionId,
        type: 'contract_signed',
        details: `قام العميل بتوقيع العقد رقم ${submissionId} بنجاح`,
        data: req?.data || {},
        files,
      },
      userData: {
        fullName: user?.full_name || 'غير محدد',
        phone: user?.phone || 'غير محدد',
        national_id: user?.national_id || 'غير محدد',
        email: user?.email || 'غير محدد',
      },
    },
  });
};

// ---- INVOICES ----
export const getMyInvoices = async () => {
  const userId = getCurrentUserId();
  if (!userId) return [];
  const { data } = await supabase.from('invoices').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return data || [];
};

export const getAdminInvoices = async () => {
  const { data: invoices } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
  if (!invoices) return [];
  
  const userIds = [...new Set(invoices.map((inv: any) => inv.user_id))];
  const { data: users } = await supabase.from('app_users').select('id, full_name').in('id', userIds);
  const userMap = new Map((users || []).map(u => [u.id, u.full_name]));

  return invoices.map((inv: any) => ({
    ...inv,
    user_name: userMap.get(inv.user_id) || 'غير معروف',
  }));
};

export const sendInvoice = async (userId: string, submissionId: string) => {
  const invoiceId = `INV-${Date.now()}`;
  const { data: req } = await supabase.from('requests').select('type, data').eq('id', submissionId).single();
  
  const reqData = req?.data as Record<string, any> || {};
  const products = reqData?.products || [];
  const totalDebt = Array.isArray(products) ? products.reduce((acc: number, p: any) => acc + (Number(p.amount) || 0), 0) : 0;
  
  const type = req?.type || 'general';
  let percentage = 4; // default waive
  if (type === 'rescheduling_request' || type === 'scheduling_request') {
    percentage = 0; // fixed amount
  } else if (type === 'seized_amounts_request') {
    percentage = 1;
  }
  
  const amount = type === 'rescheduling_request' || type === 'scheduling_request' 
    ? 2000 
    : Math.round(totalDebt * percentage / 100);

  await supabase.from('invoices').insert({
    id: invoiceId,
    submission_id: submissionId,
    user_id: userId,
    type,
    amount,
    percentage,
    total_debt: totalDebt,
    status: 'pending',
  });

  await supabase.from('notifications').insert({
    id: `NOT-${Date.now()}-inv`,
    user_id: userId,
    submission_id: submissionId,
    title: 'فاتورة جديدة',
    message: 'تم إصدار فاتورة جديدة لطلبك، يرجى المراجعة.',
    type: 'invoice',
  });

  return invoiceId;
};

export const getInvoiceBySubmission = async (submissionId: string) => {
  const { data } = await supabase.from('invoices').select('*').eq('submission_id', submissionId).order('created_at', { ascending: false }).limit(1);
  return data && data.length > 0 ? data[0] : null;
};

// ---- PROMISSORY NOTES (سندات الأمر) ----
import { numberToArabicWords } from './arabicNumberToWords';

export const sendPromissoryNote = async (userId: string, submissionId: string) => {
  const noteId = `PN-${Date.now()}`;

  // Compute amount = 4% of waive products total (or invoice amount if exists)
  const { data: req } = await supabase.from('requests').select('type, data').eq('id', submissionId).single();
  const reqData = (req?.data as Record<string, any>) || {};
  const products = Array.isArray(reqData?.products) ? reqData.products : [];
  const totalDebt = products.reduce((acc: number, p: any) => acc + (Number(p.amount) || 0), 0);

  let amount = Math.round(totalDebt * 4 / 100);
  if (req?.type === 'rescheduling_request' || req?.type === 'scheduling_request') amount = 2000;
  else if (req?.type === 'seized_amounts_request') amount = Math.round(totalDebt * 1 / 100);

  // Try to attach related contract id (if any)
  const { data: contractRow } = await supabase.from('contracts').select('id').eq('submission_id', submissionId).order('created_at', { ascending: false }).limit(1);
  const contractId = contractRow && contractRow.length > 0 ? contractRow[0].id : null;

  // Resolve debtor identity
  const { data: appUser } = await supabase.from('app_users').select('full_name, first_name, last_name, national_id').eq('id', userId).single();
  const debtorName = (reqData?.fullName as string) || appUser?.full_name || `${appUser?.first_name || ''} ${appUser?.last_name || ''}`.trim() || '---';
  const debtorNationalId = (reqData?.nationalId as string) || appUser?.national_id || '---';

  await supabase.from('promissory_notes').insert({
    id: noteId,
    submission_id: submissionId,
    user_id: userId,
    contract_id: contractId,
    amount,
    amount_in_words: numberToArabicWords(amount),
    debtor_name: debtorName,
    debtor_national_id: debtorNationalId,
    status: 'pending',
  });

  await supabase.from('notifications').insert({
    id: `NOT-${Date.now()}-pn`,
    user_id: userId,
    submission_id: submissionId,
    title: 'سند لأمر جديد',
    message: 'تم إصدار سند لأمر إلكتروني خاص بطلبك، يرجى المراجعة والتوقيع.',
    type: 'promissory_note',
  });

  return noteId;
};

export const getAdminPromissoryNotes = async () => {
  const { data: notes } = await supabase.from('promissory_notes').select('*').order('created_at', { ascending: false });
  if (!notes) return [];
  const userIds = [...new Set(notes.map(n => n.user_id))];
  const { data: users } = await supabase.from('app_users').select('id, full_name').in('id', userIds);
  const userMap = new Map((users || []).map(u => [u.id, u.full_name]));
  return notes.map(n => ({ ...n, user_name: userMap.get(n.user_id) || 'غير معروف' }));
};

export const getPromissoryNoteById = async (id: string) => {
  const { data } = await supabase.from('promissory_notes').select('*').eq('id', id).single();
  return data;
};

export const getPromissoryNotesBySubmission = async (submissionId: string) => {
  const { data } = await supabase.from('promissory_notes').select('*').eq('submission_id', submissionId).order('created_at', { ascending: false });
  return data || [];
};

export const getMyPromissoryNotes = async () => {
  const userId = getCurrentUserId();
  if (!userId) return [];
  const { data } = await supabase.from('promissory_notes').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return data || [];
};

export const signPromissoryNote = async (id: string, signatureData: string) => {
  await supabase.from('promissory_notes').update({
    signature_data: signatureData,
    signed_at: new Date().toISOString(),
    status: 'signed',
  }).eq('id', id);
};

// ---- WAIVE & RESCHEDULING MANAGEMENT HELPERS ----

export const getCurrentUserName = (): string => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return 'إدارة النظام';
  try {
    const u = JSON.parse(userStr);
    return u.full_name || u.name || 'إدارة النظام';
  } catch {
    return 'إدارة النظام';
  }
};

export interface ProcessWaiveRescheduleParams {
  id: string;
  status?: string;
  actionComment?: string;
  adminNote?: string;
  scheduleDate?: string;
  scheduleTime?: string;
  scheduleDuration?: number;
  scheduleType?: 'call' | 'in_person' | 'online';
  scheduleLocation?: string;
  scheduleNotes?: string;
  requiredDocuments?: string[];
}

export const processWaiveOrRescheduleRequest = async (params: ProcessWaiveRescheduleParams) => {
  const {
    id,
    status,
    actionComment,
    adminNote,
    scheduleDate,
    scheduleTime,
    scheduleDuration,
    scheduleType,
    scheduleLocation,
    scheduleNotes,
    requiredDocuments,
  } = params;

  // 1. Fetch current request to preserve existing data
  const { data: currentReq, error: fetchErr } = await supabase
    .from('requests')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchErr || !currentReq) {
    throw new Error('تعذر العثور على الطلب المحدد');
  }

  const existingData = (currentReq.data && typeof currentReq.data === 'object' ? currentReq.data : {}) as Record<string, any>;
  const adminName = getCurrentUserName();
  const adminId = getCurrentUserId();
  const nowIso = new Date().toISOString();

  // 2. Prepare updated data
  const updatedData: Record<string, any> = {
    ...existingData,
    last_processed_at: nowIso,
    last_processed_by: adminName,
  };

  if (adminNote && adminNote.trim()) {
    const existingNotes = Array.isArray(existingData.admin_notes) ? existingData.admin_notes : [];
    updatedData.admin_notes = [
      ...existingNotes,
      {
        id: `NOTE-${Date.now()}`,
        note: adminNote.trim(),
        created_at: nowIso,
        created_by: adminName,
      },
    ];
  }

  if (scheduleDate) {
    updatedData.schedule_date = scheduleDate;
    updatedData.schedule_time = scheduleTime || existingData.schedule_time || '10:00';
    updatedData.schedule_duration = scheduleDuration || existingData.schedule_duration || 30;
    updatedData.schedule_type = scheduleType || existingData.schedule_type || 'call';
    updatedData.schedule_location = scheduleLocation || existingData.schedule_location || '';
    updatedData.schedule_notes = scheduleNotes || existingData.schedule_notes || '';
    updatedData.scheduled_at = nowIso;
    updatedData.scheduled_by = adminName;
  }

  if (requiredDocuments && requiredDocuments.length > 0) {
    updatedData.required_documents = requiredDocuments;
  }

  // 3. Prepare request payload
  const updatePayload: Record<string, any> = {
    data: updatedData,
  };
  if (status) {
    updatePayload.status = status;
  }

  const { error: updateErr } = await supabase
    .from('requests')
    .update(updatePayload)
    .eq('id', id);

  if (updateErr) throw updateErr;

  // 4. Record in request_history
  const newStatus = status || currentReq.status;
  const historyComment = actionComment || (
    scheduleDate 
      ? `تمت جدولة موعد يوم ${scheduleDate} الساعة ${scheduleTime || '10:00'} (${scheduleType === 'call' ? 'اتصال هاتفي' : scheduleType === 'in_person' ? 'حضوري بالمقر' : 'اجتماع مرئي'})`
      : adminNote 
        ? `إضافة ملاحظة إدارية: ${adminNote.trim()}`
        : `تحديث حالة الطلب إلى: ${newStatus}`
  );

  await supabase.from('request_history').insert({
    id: `HIST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    request_id: id,
    status: newStatus,
    comment: historyComment,
    changed_by: adminId,
  });

  // 5. Send notification to user
  if (currentReq.user_id) {
    let notifTitle = 'تحديث في حالة طلبك';
    let notifMsg = `تم تحديث حالة طلبك رقم ${id}`;
    let notifType = 'status_change';

    if (scheduleDate) {
      notifTitle = 'تم تحديد موعد لمتابعة طلبك';
      notifMsg = `تم تحديد موعد لمراجعة طلبك بتاريخ ${scheduleDate} الساعة ${scheduleTime || '10:00'} (${scheduleType === 'call' ? 'اتصال هاتفي' : scheduleType === 'in_person' ? 'حضور في المقر' : 'عن بُعد'}).`;
      notifType = 'appointment_scheduled';
    } else if (status === 'approved') {
      notifTitle = 'تمت الموافقة على طلبك';
      notifMsg = `تهانينا! تمت الموافقة على طلبك رقم ${id} من قبل الإدارة.`;
      notifType = 'request_approved';
    } else if (status === 'rejected') {
      notifTitle = 'تحديث بشأن طلبك';
      notifMsg = actionComment || 'نعتذر، لم يتم قبول طلبك. يرجى مراجعة التفاصيل أو التواصل مع الدعم.';
      notifType = 'request_rejected';
    } else if (status === 'awaiting_documents') {
      notifTitle = 'مطلوب مستندات إضافية لاستكمال الطلب';
      notifMsg = actionComment || 'يرجى تزويدنا بالمستندات المطلوبة لاستكمال دراسة ومعالجة طلبك.';
      notifType = 'document_request';
    } else if (status === 'under_review' || status === 'processing') {
      notifTitle = 'طلبك قيد المراجعة والتدقيق';
      notifMsg = 'يجري الآن تدقيق ودراسة تفاصيل طلبك من قِبل الفريق المختص.';
      notifType = 'status_change';
    } else if (status === 'completed') {
      notifTitle = 'اكتملت معالجة الطلب بنجاح';
      notifMsg = 'تم إنجاز واكتمال جميع إجراءات طلبك بنجاح.';
      notifType = 'request_completed';
    }

    await supabase.from('notifications').insert({
      id: `NOT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: currentReq.user_id,
      submission_id: id,
      title: notifTitle,
      message: notifMsg,
      type: notifType,
    });
  }

  return { success: true };
};

export const cancelRequestAppointment = async (id: string, reason?: string) => {
  const { data: currentReq, error: fetchErr } = await supabase
    .from('requests')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchErr || !currentReq) throw new Error('الطلب غير موجود');

  const existingData = (currentReq.data && typeof currentReq.data === 'object' ? currentReq.data : {}) as Record<string, any>;
  const adminName = getCurrentUserName();
  const adminId = getCurrentUserId();
  const nowIso = new Date().toISOString();

  const prevDate = existingData.schedule_date;
  const updatedData = {
    ...existingData,
    cancelled_schedule_date: prevDate,
    schedule_date: null,
    schedule_time: null,
    schedule_cancelled_at: nowIso,
    schedule_cancelled_by: adminName,
    schedule_cancelled_reason: reason || 'تم إلغاء الموعد من الإدارة',
    last_processed_at: nowIso,
    last_processed_by: adminName,
  };

  // Revert status to under_review if it was scheduled
  const newStatus = currentReq.status === 'scheduled' ? 'under_review' : currentReq.status;

  await supabase.from('requests').update({
    data: updatedData,
    status: newStatus,
  }).eq('id', id);

  await supabase.from('request_history').insert({
    id: `HIST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    request_id: id,
    status: newStatus,
    comment: `تم إلغاء الموعد المجدول (${prevDate || ''}): ${reason || 'بواسطة الإدارة'}`,
    changed_by: adminId,
  });

  if (currentReq.user_id) {
    await supabase.from('notifications').insert({
      id: `NOT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: currentReq.user_id,
      submission_id: id,
      title: 'إلغاء الموعد المجدول',
      message: `تم إلغاء الموعد المحدد مسبقاً لطلبك رقم ${id}.${reason ? ` السبب: ${reason}` : ''}`,
      type: 'appointment_cancelled',
    });
  }

  return { success: true };
};

export const checkAppointmentConflicts = async (date: string, time: string, excludeRequestId?: string) => {
  const { data: allReqs } = await supabase.from('requests').select('id, user_id, data, status');
  if (!allReqs) return [];

  const conflicts: Array<{ id: string; userName: string; time: string; status: string }> = [];

  for (const r of allReqs) {
    if (r.id === excludeRequestId) continue;
    const d = (r.data && typeof r.data === 'object' ? r.data : {}) as Record<string, any>;
    if (d.schedule_date === date && d.schedule_time === time && r.status !== 'cancelled' && r.status !== 'completed') {
      conflicts.push({
        id: r.id,
        userName: d.fullName || d.firstName || 'عميل',
        time: d.schedule_time,
        status: r.status,
      });
    }
  }

  return conflicts;
};

