import React, { useState, useRef, useEffect } from 'react';
import {
  X, CheckCircle, AlertCircle, Send, ShieldCheck, FileText, Upload,
  Trash2, Plus, PenLine, RefreshCw, Copy, Check, Lock, ChevronDown,
  User, Phone, Mail, MapPin, Building, Info, FileUp, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { SubServiceItem, BusinessFieldItem } from '../../data/businessFieldsData';
import { submitRequest, uploadDocument, getProfile } from '../../lib/api';

interface DynamicServiceFormProps {
  subService: SubServiceItem;
  field: BusinessFieldItem;
  onClose: () => void;
  prefill?: any;
}

const REGION_CITIES: Record<string, string[]> = {
  "الرياض": ["الرياض", "الدرعية", "الخرج", "الدوادمي", "المجمعة", "القويعية", "وادي الدواسر", "الزلفي", "شقراء", "المزاحمية"],
  "مكة المكرمة": ["مكة المكرمة", "جدة", "الطائف", "رابغ", "خليص", "الليث", "القنفذة"],
  "المدينة": ["المدينة المنورة", "ينبع", "العلا", "بدر", "الحناكية"],
  "القصيم": ["بريدة", "عنيزة", "الرس", "البكيرية", "البدائع", "المذنب"],
  "الشرقية": ["الدمام", "الخبر", "الظهران", "القطيف", "الأحساء", "الجبيل", "حفر الباطن", "الخفجي"],
  "عسير": ["أبها", "خميس مشيط", "بيشة", "محايل عسير", "النماص"],
  "تبوك": ["تبوك", "الوجه", "ضباء", "تيماء", "أملج"],
  "حائل": ["حائل", "بقعاء", "الشنان"],
  "الحدود الشمالية": ["عرعر", "رفحاء", "طريف"],
  "جازان": ["جيزان", "صبيا", "أبو عريش", "صامطة"],
  "نجران": ["نجران", "شرورة", "حبونا"],
  "الباحة": ["الباحة", "بلجرشي", "المندق"],
  "الجوف": ["سكاكا", "القريات", "دومة الجندل"]
};

const SAUDI_BANKS = [
  "البنك الأهلي السعودي (SNB)",
  "مصرف الراجحي",
  "بنك الرياض",
  "البنك السعودي البريطاني (SAB)",
  "البنك السعودي الفرنسي",
  "بنك البلاد",
  "بنك الجزيرة",
  "مصرف الإنماء",
  "بنك الخليج الدولي - السعودية",
  "جهة تمويلية أخرى"
];

const JOB_STATUSES = [
  "موظف قطاع حكومي (مدني)",
  "موظف قطاع عسكري",
  "موظف قطاع خاص",
  "شبه حكومي / هيئات",
  "متقاعد",
  "صاحب عمل حر / منشأة",
  "غير موظف / باحث عن عمل"
];

export const DynamicServiceForm: React.FC<DynamicServiceFormProps> = ({
  subService,
  field,
  onClose,
  prefill
}) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedRequestId, setSubmittedRequestId] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // Basic applicant info
  const [fullName, setFullName] = useState(prefill?.fullName || '');
  const [nationalId, setNationalId] = useState(prefill?.nationalId || user?.national_id || '');
  const [mobile, setMobile] = useState(prefill?.mobile || user?.phone || '');
  const [email, setEmail] = useState(prefill?.email || user?.email || '');
  const [region, setRegion] = useState(prefill?.region || 'الرياض');
  const [city, setCity] = useState(prefill?.city || 'الرياض');
  const [jobStatus, setJobStatus] = useState(prefill?.jobStatus || 'موظف قطاع خاص');
  const [bankName, setBankName] = useState(prefill?.bankName || SAUDI_BANKS[0]);
  const [age, setAge] = useState(prefill?.age || '35');

  // Dynamic custom fields specific to this service
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    if (subService.customFields) {
      subService.customFields.forEach(f => {
        if (f.type === 'select' && f.options && f.options.length > 0) {
          initial[f.name] = f.options[0];
        } else {
          initial[f.name] = '';
        }
      });
    }
    return initial;
  });

  // Additional notes
  const [additionalNotes, setAdditionalNotes] = useState(prefill?.notes || '');

  // Attachments
  const [attachments, setAttachments] = useState<Array<{ id: number; name: string; file: File | null; type: string }>>([
    { id: 1, name: '', file: null, type: subService.requirements[0] || 'مستند إثبات' }
  ]);

  // Authorization & terms
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [authorizedRifans, setAuthorizedRifans] = useState(false);

  // Digital Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Load user profile if exists
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const p: any = await getProfile();
        if (p) {
          if (p.full_name && !fullName) setFullName(p.full_name);
          if (p.phone && !mobile) setMobile(p.phone);
          if (p.email && !email) setEmail(p.email);
          if (p.national_id && !nationalId) setNationalId(p.national_id);
          if (p.region) {
            setRegion(p.region);
            if (p.city) setCity(p.city);
          }
        }
      } catch (e) {
        console.warn('Profile fetch note:', e);
      }
    })();
  }, [user]);

  // Setup signature canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth || 380;
      canvas.height = 140;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#180020';
      }
    }
  }, []);

  const handleCustomFieldChange = (name: string, value: any) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion);
    const availableCities = REGION_CITIES[newRegion] || [];
    setCity(availableCities[0] || '');
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    setHasSignature(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleAddAttachment = () => {
    setAttachments(prev => [
      ...prev,
      { id: Date.now(), name: '', file: null, type: 'مستند إضافي' }
    ]);
  };

  const handleRemoveAttachment = (id: number) => {
    if (attachments.length === 1) return;
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleFileSelect = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    setAttachments(prev => prev.map(a => a.id === id ? { ...a, file, name: file.name } : a));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!fullName.trim()) {
      setErrorMessage('يرجى إدخال الاسم الكامل لمقدم الطلب');
      return;
    }
    if (!/^[0-9]{10}$/.test(nationalId.trim())) {
      setErrorMessage('رقم الهوية الوطنية / الإقامة يجب أن يتكون من 10 أرقام');
      return;
    }
    if (!/^05[0-9]{8}$/.test(mobile.trim())) {
      setErrorMessage('رقم الجوال غير صحيح، يجب أن يتكون من 10 أرقام ويبدأ بـ 05');
      return;
    }

    // Validate required custom fields
    for (const f of subService.customFields || []) {
      if (f.required) {
        const val = customFieldValues[f.name];
        if (val === undefined || val === null || String(val).trim() === '') {
          setErrorMessage(`يرجى استكمال الحقل المطلوب: ${f.label}`);
          return;
        }
      }
    }

    if (!agreedTerms) {
      setErrorMessage('يرجى الموافقة على الشروط والأحكام وسياسة الخصوصية');
      return;
    }
    if (!authorizedRifans) {
      setErrorMessage('يرجى الإقرار بصحة البيانات وتفويض ريفانس المالية لمعالجة الطلب');
      return;
    }
    if (!hasSignature) {
      setErrorMessage('يرجى توقيع النموذج إلكترونياً في المساحة المخصصة');
      return;
    }

    setSubmitting(true);

    try {
      // Get signature data URL
      const signatureDataUrl = canvasRef.current ? canvasRef.current.toDataURL('image/png') : '';

      // Prepare payload
      const generatedCode = `REQ-${Date.now().toString().slice(-6)}`;
      const requestPayload: any = {
        type: subService.requestType || 'service_request',
        service_id: subService.id,
        service_name: subService.name,
        service_category: field.id,
        service_category_title: field.title,
        request_number: generatedCode,
        fullName: fullName.trim(),
        nationalId: nationalId.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        region,
        city,
        jobStatus,
        bankName,
        age,
        customFields: customFieldValues,
        additionalNotes: additionalNotes.trim(),
        signature: signatureDataUrl,
        submittedAt: new Date().toISOString(),
      };

      // Upload any attachments if available
      const uploadedDocNames: string[] = [];
      for (const att of attachments) {
        if (att.file) {
          try {
            await uploadDocument(att.file, att.type || 'مرفق خدمة');
            uploadedDocNames.push(att.file.name);
          } catch (uploadErr) {
            console.warn('Doc upload note:', uploadErr);
          }
        }
      }
      requestPayload.uploadedDocuments = uploadedDocNames;

      // Submit request to API
      const result: any = await submitRequest(requestPayload);
      const reqId = result?.id || generatedCode;

      setSubmittedRequestId(reqId);
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Submission failed:', err);
      setErrorMessage(err.message || 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى');
    } finally {
      setSubmitting(false);
    }
  };

  const copyRequestId = () => {
    if (!submittedRequestId) return;
    navigator.clipboard.writeText(submittedRequestId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-2.5 sm:p-5 bg-black/80 backdrop-blur-md overflow-hidden animate-fade-in" 
      dir="rtl"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-[#120117] text-gray-900 dark:text-gray-100 rounded-3xl border border-gold/40 shadow-2xl overflow-hidden max-h-[94vh] sm:max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 bg-gradient-to-r from-[#180020] to-[#2E023D] text-white border-b border-gold/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold shadow-inner shrink-0">
              <FileText size={18} className="sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30">
                  {field.title}
                </span>
                <span className="text-[10px] sm:text-[11px] text-gray-300">خدمة موجهة للأفراد</span>
              </div>
              <h2 className="text-xs sm:text-sm md:text-base font-black text-white mt-0.5 leading-tight">
                نموذج طلب: {subService.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-gold hover:text-[#180020] text-gray-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="إغلاق النافذة"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto overscroll-contain space-y-4 sm:space-y-5 flex-1 min-h-0">
          {/* Success State */}
          {isSuccess ? (
            <div className="py-10 px-4 text-center space-y-6 animate-in zoom-in-95">
              <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle size={44} />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-2xl font-black text-brand dark:text-white">
                  تم استلام طلبك بنجاح!
                </h3>
                <p className="text-[14px] text-muted leading-relaxed">
                  تم قيد طلبك لخدمة <strong className="text-brand dark:text-gold font-bold">({subService.name})</strong> وجارٍ مراجعته من قِبل الفريق المختص لدى ريفانس المالية.
                </p>
              </div>

              <div className="max-w-xs mx-auto p-4 rounded-2xl bg-gold/10 border border-gold/30 space-y-2">
                <div className="text-[12px] text-muted font-medium">رقم مرجع الطلب</div>
                <div className="flex items-center justify-center gap-3">
                  <span className="font-mono text-xl font-black text-brand dark:text-gold tracking-wider">
                    {submittedRequestId}
                  </span>
                  <button
                    onClick={copyRequestId}
                    className="p-1.5 rounded-lg bg-gold/20 hover:bg-gold text-brand dark:text-gold hover:text-black transition-colors"
                    title="نسخ الرقم"
                  >
                    {copiedId ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 text-[13px] text-gray-600 dark:text-gray-300 max-w-lg mx-auto leading-relaxed text-right">
                <div className="font-bold text-brand dark:text-gold mb-1 flex items-center gap-2">
                  <Info size={16} /> الإجراءات التالية:
                </div>
                <ul className="list-disc list-inside space-y-1 text-muted text-[12.5px]">
                  <li>سيصلك إشعار وتحديث مستمر لحالة الطلب عبر لوحة التحكم ورسائل SMS.</li>
                  <li>سيقوم المستشار المختص بدراسة البيانات والتواصل معك لاستكمال المتطلبات.</li>
                  <li>يمكنك متابعة حالة الطلب في أي وقت من خلال «لوحة تحكم العميل».</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    window.location.hash = '#/dashboard';
                  }}
                  className="w-full sm:w-auto px-6 h-12 rounded-xl bg-gold hover:bg-[#E8CE96] text-[#180020] font-black text-[14px] flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <FileText size={18} />
                  الانتقال لمتابعة الطلب في لوحة التحكم
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 h-12 rounded-xl border border-gray-300 dark:border-white/20 hover:border-gold font-bold text-[14px] text-gray-700 dark:text-gray-200 transition-colors"
                >
                  إغلاق النافذة
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 text-right">
              {/* Service Context Card */}
              <div className="p-4 rounded-2xl bg-gold/10 border border-gold/30">
                <div className="flex items-start gap-3">
                  <Info size={20} className="text-gold shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="text-[13px] font-bold text-brand dark:text-gold">
                      نبذة تعريفية بالخدمة وإجراءاتها:
                    </div>
                    <p className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed">
                      {subService.description}
                    </p>
                  </div>
                </div>

                {/* Highlights badges */}
                <div className="mt-3 pt-3 border-t border-gold/20 flex flex-wrap gap-2">
                  {subService.highlights.map((h, i) => (
                    <span key={i} className="text-[11.5px] px-2.5 py-1 rounded-lg bg-white/80 dark:bg-white/10 text-brand dark:text-gray-200 font-medium border border-gold/20 flex items-center gap-1.5">
                      <Check size={12} className="text-gold" /> {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-600 dark:text-red-400 text-[13px] flex items-center gap-2 font-medium animate-shake">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Section 1: Applicant Information */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-white/10 text-brand dark:text-gold font-black text-[15px]">
                  <User size={18} />
                  <span>1. بيانات مقدم الطلب الأساسية</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-[13px]">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-[12px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      الاسم الكامل (ثلاثي أو رباعي) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="أدخل اسمك الكامل كما هو مدون بالهوية"
                      className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#180020] border border-gray-300 dark:border-white/15 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition"
                      required
                    />
                  </div>

                  {/* National ID */}
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      رقم الهوية الوطنية / الإقامة <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={nationalId}
                      onChange={e => setNationalId(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="10 أرقام"
                      className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#180020] border border-gray-300 dark:border-white/15 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition font-mono"
                      required
                    />
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      رقم الجوال <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={mobile}
                      onChange={e => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="05xxxxxxxx"
                      className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#180020] border border-gray-300 dark:border-white/15 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition font-mono"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#180020] border border-gray-300 dark:border-white/15 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition"
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      العمر (بالسنوات)
                    </label>
                    <input
                      type="number"
                      min={18}
                      max={99}
                      value={age}
                      onChange={e => setAge(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#180020] border border-gray-300 dark:border-white/15 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition"
                    />
                  </div>

                  {/* Region */}
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      المنطقة <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={region}
                      onChange={e => handleRegionChange(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#180020] border border-gray-300 dark:border-white/15 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition cursor-pointer"
                    >
                      {Object.keys(REGION_CITIES).map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      المدينة <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#180020] border border-gray-300 dark:border-white/15 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition cursor-pointer"
                    >
                      {(REGION_CITIES[region] || []).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Job status */}
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      الحالة الوظيفية <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={jobStatus}
                      onChange={e => setJobStatus(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#180020] border border-gray-300 dark:border-white/15 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition cursor-pointer"
                    >
                      {JOB_STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Bank Name */}
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      البنك الرئيسي المحول عليه الدخل
                    </label>
                    <select
                      value={bankName}
                      onChange={e => setBankName(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#180020] border border-gray-300 dark:border-white/15 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition cursor-pointer"
                    >
                      {SAUDI_BANKS.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Service-Specific Tailored Fields */}
              {subService.customFields && subService.customFields.length > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gold/5 dark:bg-white/[0.02] border border-gold/30 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gold/20 text-brand dark:text-gold font-black text-[15px]">
                    <Building size={18} />
                    <span>2. بيانات ومعلومات الخدمة التخصصية ({subService.name})</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                    {subService.customFields.map((fieldItem) => {
                      const value = customFieldValues[fieldItem.name] ?? '';
                      return (
                        <div
                          key={fieldItem.name}
                          className={fieldItem.type === 'textarea' ? 'sm:col-span-2' : ''}
                        >
                          <label className="block text-[12px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                            {fieldItem.label} {fieldItem.required && <span className="text-red-500">*</span>}
                          </label>

                          {fieldItem.type === 'select' ? (
                            <select
                              value={value}
                              onChange={e => handleCustomFieldChange(fieldItem.name, e.target.value)}
                              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#180020] border border-gray-300 dark:border-white/15 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition cursor-pointer"
                              required={fieldItem.required}
                            >
                              {fieldItem.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : fieldItem.type === 'textarea' ? (
                            <textarea
                              rows={3}
                              value={value}
                              onChange={e => handleCustomFieldChange(fieldItem.name, e.target.value)}
                              placeholder={fieldItem.placeholder || ''}
                              className="w-full p-3 rounded-xl bg-white dark:bg-[#180020] border border-gray-300 dark:border-white/15 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition resize-none"
                              required={fieldItem.required}
                            />
                          ) : fieldItem.type === 'number' ? (
                            <input
                              type="number"
                              value={value}
                              onChange={e => handleCustomFieldChange(fieldItem.name, e.target.value)}
                              placeholder={fieldItem.placeholder || ''}
                              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#180020] border border-gray-300 dark:border-white/15 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition"
                              required={fieldItem.required}
                            />
                          ) : (
                            <input
                              type="text"
                              value={value}
                              onChange={e => handleCustomFieldChange(fieldItem.name, e.target.value)}
                              placeholder={fieldItem.placeholder || ''}
                              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#180020] border border-gray-300 dark:border-white/15 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition"
                              required={fieldItem.required}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 3: Additional Notes & Details */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-white/10 text-brand dark:text-gold font-black text-[15px]">
                  <FileText size={18} />
                  <span>3. تفاصيل وملاحظات إضافية يود مقدم الطلب توضيحها</span>
                </div>
                <textarea
                  rows={3}
                  value={additionalNotes}
                  onChange={e => setAdditionalNotes(e.target.value)}
                  placeholder="اشرح أي تفاصيل أخرى ترغب في إحاطة المستشار المالي أو القانوني بها بشأن وضعك أو طلبك..."
                  className="w-full p-3.5 rounded-xl bg-white dark:bg-[#180020] border border-gray-300 dark:border-white/15 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition text-[13px] resize-none"
                />
              </div>

              {/* Section 4: Attachments */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-white/10">
                  <div className="flex items-center gap-2 text-brand dark:text-gold font-black text-[15px]">
                    <FileUp size={18} />
                    <span>4. المرفقات والمستندات الثبوتية الداعمة</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAttachment}
                    className="text-[12px] font-bold text-gold hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} /> إضافة مستند آخر
                  </button>
                </div>

                <div className="text-[12px] text-muted">
                  المستندات المقترحة لهذه الخدمة: {subService.requirements.join(' • ')}
                </div>

                <div className="space-y-2.5">
                  {attachments.map((att, idx) => (
                    <div key={att.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#180020] border border-gray-200 dark:border-white/10">
                      <input
                        type="text"
                        value={att.type}
                        onChange={e => {
                          const val = e.target.value;
                          setAttachments(prev => prev.map(a => a.id === att.id ? { ...a, type: val } : a));
                        }}
                        placeholder="نوع المستند"
                        className="w-1/3 h-9 px-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[12px] outline-none"
                      />

                      <label className="flex-1 h-9 px-3 rounded-lg bg-gold/10 hover:bg-gold/20 text-brand dark:text-gold border border-gold/30 flex items-center justify-between text-[12px] font-bold cursor-pointer transition">
                        <span className="truncate">{att.name || 'اختر ملفاً (PDF, صور)...'}</span>
                        <Upload size={14} className="shrink-0" />
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={e => handleFileSelect(att.id, e)}
                          className="hidden"
                        />
                      </label>

                      {attachments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="w-9 h-9 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center transition"
                          title="حذف"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 5: Legal Acknowledgment & Digital Signature */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gold/10 border border-gold/40 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gold/20 text-brand dark:text-gold font-black text-[15px]">
                  <ShieldCheck size={18} />
                  <span>5. الإقرار والتفويض والتوقيع الرقمي</span>
                </div>

                <div className="space-y-2.5 text-[12.5px] leading-relaxed">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={authorizedRifans}
                      onChange={e => setAuthorizedRifans(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-gold focus:ring-gold accent-[#c5a869] cursor-pointer"
                      required
                    />
                    <span className="text-gray-800 dark:text-gray-200">
                      أقر بأن كافة البيانات والمستندات المقدمة أعلاه صحيحة وكاملة وعلى مسؤوليتي، وأفوّض شركة <strong>ريفانس المالية</strong> لدراسة متطلبات حالتي ومتابعة الإجراءات ذات العلاقة لدى الجهات المختصة وفق الأنظمة واللوائح المعمول بها في المملكة العربية السعودية.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={e => setAgreedTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-gold focus:ring-gold accent-[#c5a869] cursor-pointer"
                      required
                    />
                    <span className="text-gray-800 dark:text-gray-200">
                      أوافق على <a href="#/terms" target="_blank" className="text-gold font-bold underline">الشروط والأحكام</a> و<a href="#/privacy" target="_blank" className="text-gold font-bold underline">سياسة الخصوصية</a> المعتمدة لدى ريفانس المالية.
                    </span>
                  </label>
                </div>

                {/* Signature Pad */}
                <div className="pt-1.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10.5px] sm:text-[12px] font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <PenLine size={13} className="text-gold" />
                      التوقيع الإلكتروني لمقدم الطلب باليد أو اللمس:
                      <span className="text-red-500">*</span>
                    </span>
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="text-[10px] text-muted hover:text-red-500 flex items-center gap-1 transition"
                    >
                      <RefreshCw size={11} /> مسح وإعادة التوقيع
                    </button>
                  </div>

                  <div className="relative rounded-xl bg-white border border-gray-300 dark:border-gold/30 shadow-inner overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-24 sm:h-28 touch-none cursor-crosshair bg-white"
                    />
                    {!hasSignature && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-[11px] sm:text-[12px] text-gray-400">
                        وقع هنا باليد أو الإصبع...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-gray-200/80 dark:border-white/10 font-cairo">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 h-[52px] sm:h-[54px] rounded-xl border border-gray-300 dark:border-white/20 hover:border-gold text-gray-700 dark:text-gray-200 font-bold text-[14px] sm:text-[15px] transition cursor-pointer order-2 sm:order-1"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 h-[52px] sm:h-[54px] rounded-xl bg-gold hover:bg-[#D8B979] text-[#180020] font-black text-[15px] sm:text-[16px] flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50 order-1 sm:order-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>جارٍ تدقيق وإرسال الطلب...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>إرسال وتوثيق الطلب إلكترونياً</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicServiceForm;
