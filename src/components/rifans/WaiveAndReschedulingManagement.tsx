import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Wallet,
  Phone,
  MessageCircle,
  Search,
  Upload,
  RotateCcw,
  Users,
  BadgeCheck,
  X,
  Filter,
  Copy,
  Check,
  FileSpreadsheet,
  Calculator,
  Menu,
  Scale,
  Eye,
  ArrowLeft,
  Send,
  User,
  CreditCard,
  Tag,
  Target,
  IdCard,
  Smartphone,
  BarChart3,
  UserX,
  UsersRound,
  Percent,
  CalendarCheck2,
  FileText,
  Clock,
  Calendar,
  Snowflake,
  Gavel,
  Landmark,
  Bookmark,
  Lock,
  Coins,
  ChevronDown,
  FileMinus,
  CalendarClock,
  ArrowRight,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import { Customer, formatCurrency, formatMoney } from "@/lib/wallet-types";
import { freezeFromJwo } from "@/lib/freeze-date";
import { getActiveMessage } from "@/lib/wa-templates";
import walletInitialData from "@/data/wallet.json";

import { ThirdPartyDialog } from "./sepll/ThirdPartyDialog";
import { SettlementCardModal } from "./sepll/SettlementCardModal";
import { WhatsAppTemplatesModal } from "./sepll/WhatsAppTemplatesModal";
import { DiscountCalculatorModal } from "./sepll/DiscountCalculatorModal";
import { WalletTableView } from "./sepll/WalletTableView";

export interface WaiveAndRescheduleRequest {
  id: string;
  userId: string;
  type: string;
  status: string;
  details: string | null;
  data: any;
  files: any;
  timestamp: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  user_national_id: string;
}

interface Props {
  submissions: WaiveAndRescheduleRequest[];
  onRefresh: () => Promise<void> | void;
  onSendContract?: (userId: string, submissionId: string) => void;
  onSendInvoice?: (userId: string, submissionId: string) => void;
  onSendPromissory?: (userId: string, submissionId: string) => void;
  onOpenUserProfile?: (userId: string, nationalId?: string, customerName?: string, phone?: string) => void;
}

const ACTION_OPTIONS = [
  "وعد سداد",
  "تم السداد",
  "بدون إجابة",
  "Call Back",
  "الرقم خطأ",
  "خروج نهائي",
  "متوفي",
  "مشكلة غير محلولة",
  "مرفوض",
  "موافقة مبدئية",
];

export const WaiveAndReschedulingManagement: React.FC<Props> = ({
  submissions,
  onRefresh,
  onSendContract,
  onSendInvoice,
  onSendPromissory,
  onOpenUserProfile,
}) => {
  // Navigation & View state
  const [activeView, setActiveView] = useState<"cards" | "table">("cards");
  const [quickFilter, setQuickFilter] = useState<"all" | "exemption" | "reschedule">("all");
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  // Modals state
  const [calcModalOpen, setCalcModalOpen] = useState(false);
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [thirdPartyOpen, setThirdPartyOpen] = useState(false);
  const [settlementModalOpen, setSettlementModalOpen] = useState(false);

  // Active customer for Sheet & Dialogs
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Search & Filter state
  const [searchField, setSearchField] = useState<string>("رقم الهوية");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("نوع المنتج");
  const [filterValue, setFilterValue] = useState<string>("all");

  // Pagination for cards view - optimized to 20 for fast mobile rendering
  const [visibleCount, setVisibleCount] = useState<number>(20);

  // Local state persistence for customer modifications
  const [customerEdits, setCustomerEdits] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem("sepll_customer_edits");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Contacted customers tracker
  const [contactedCustomers, setContactedCustomers] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("sepll_contacted_customers");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Uploaded additional customers
  const [uploadedCustomers, setUploadedCustomers] = useState<Customer[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save edits to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("sepll_customer_edits", JSON.stringify(customerEdits));
    } catch {}
  }, [customerEdits]);

  useEffect(() => {
    try {
      localStorage.setItem("sepll_contacted_customers", JSON.stringify(contactedCustomers));
    } catch {}
  }, [contactedCustomers]);

  // Merge JSON seeds + submissions from live app + uploaded files + local edits
  const allCustomers = useMemo(() => {
    // 1. Base from wallet.json
    const baseList: Customer[] = [...(walletInitialData as Customer[])];

    // 2. Map submissions from portal
    submissions.forEach((s) => {
      const isExemption = s.type?.toLowerCase().includes("waive") || s.data?.request_type === "waive";
      const isReschedule =
        s.type?.toLowerCase().includes("reschedul") ||
        s.type?.toLowerCase().includes("schedul") ||
        s.data?.request_type === "reschedule";

      const subCust: Customer = {
        "رقم الحساب": s.data?.account_number || s.data?.contract_number || `SUB-${s.id.slice(0, 8)}`,
        "المبلغ": Number(s.data?.debt_amount || s.data?.total_amount || s.data?.amount) || 48500,
        "مبلغ المديونية": Number(s.data?.debt_amount || s.data?.total_amount || s.data?.amount) || 48500,
        "الاكشن": s.status === "completed" ? "تم السداد" : s.status === "approved" ? "موافقة مبدئية" : "وعد سداد",
        "التثبيت": "منصة ريفانز",
        "المنتج": s.data?.product_type || (isReschedule ? "PF" : "AL"),
        "نوع المنتج": s.data?.product_type || (isReschedule ? "PF" : "AL"),
        "عمر الدين": s.data?.debt_age || "2-3 Years",
        "رقم الهوية": s.user_national_id || s.data?.national_id || "1098765432",
        "اسم العميل": s.user_name || s.data?.client_name || "عميل ريفانز",
        "رقم الجوال": s.user_phone || s.data?.phone || "0500000000",
        "عميل رواتب": s.data?.is_salary_client ? "Yes" : null,
        "عميل متوفي": s.data?.is_deceased_client ? "Yes" : null,
        "رقم القضية": s.data?.case_number || null,
        "رقم الطلب في نظام سيبل": s.data?.sibel_request_id || s.id.slice(0, 8),
        "طلب الطلب": isExemption ? "إعفاء متوفين" : isReschedule ? "إعادة جدولة" : "طلب عام",
        "الوصف": s.details || s.data?.notes || "طلب مقدم عبر لوحة التحكم",
        _rawSubmission: s,
      } as any;

      // Prepend so live submissions appear at the top
      baseList.unshift(subCust);
    });

    // 3. Add any uploaded customers
    const combined = [...uploadedCustomers, ...baseList];

    // 4. Apply local edits
    return combined.map((c) => {
      const key = String(c["رقم الحساب"] || c["رقم الهوية"] || "");
      if (key && customerEdits[key]) {
        return { ...c, ...customerEdits[key] };
      }
      return c;
    });
  }, [submissions, uploadedCustomers, customerEdits]);

  // Compute portfolio KPIs
  const portfolioStats = useMemo(() => {
    const totalAccounts = allCustomers.length;
    const totalBalance = allCustomers.reduce((acc, c) => {
      const b = Number(c["مبلغ المديونية"] ?? c["المبلغ"]) || 0;
      return acc + b;
    }, 0);

    let frCount = 0;
    let alCount = 0;
    let pfCount = 0;
    let ccCount = 0;

    let exemptionCount = 0;
    let rescheduleCount = 0;

    allCustomers.forEach((c) => {
      const p = String(c["نوع المنتج"] || c["المنتج"] || "").toUpperCase();
      if (p === "FR") frCount++;
      else if (p === "AL") alCount++;
      else if (p === "PF") pfCount++;
      else if (p === "CC") ccCount++;

      const reqType = String(c["طلب الطلب"] || c["نوع الطلب"] || "");
      const isDeceased = String(c["عميل متوفي"] || "").toLowerCase() === "yes";
      if (reqType.includes("إعفاء") || isDeceased) {
        exemptionCount++;
      }
      if (reqType.includes("جدولة") || reqType.includes("إعادة")) {
        rescheduleCount++;
      }
    });

    return {
      totalAccounts,
      totalBalance,
      frCount,
      alCount,
      pfCount,
      ccCount,
      exemptionCount,
      rescheduleCount,
    };
  }, [allCustomers]);

  // Filter logic
  const filteredCustomers = useMemo(() => {
    let list = allCustomers;

    // Quick filter from Dashboard Hub
    if (quickFilter === "exemption") {
      list = list.filter((c) => {
        const reqType = String(c["طلب الطلب"] || c["نوع الطلب"] || "");
        const isDeceased = String(c["عميل متوفي"] || "").toLowerCase() === "yes";
        return reqType.includes("إعفاء") || isDeceased;
      });
    } else if (quickFilter === "reschedule") {
      list = list.filter((c) => {
        const reqType = String(c["طلب الطلب"] || c["نوع الطلب"] || "");
        return reqType.includes("جدولة") || reqType.includes("إعادة");
      });
    }

    // Search Box
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((c) => {
        if (searchField === "رقم الهوية") {
          return String(c["رقم الهوية"] || "").toLowerCase().includes(q);
        } else if (searchField === "رقم الحساب") {
          return String(c["رقم الحساب"] || "").toLowerCase().includes(q);
        } else if (searchField === "رقم الجوال") {
          return String(c["رقم الجوال"] || "").toLowerCase().includes(q);
        } else if (searchField === "الاسم") {
          return String(c["اسم العميل"] || "").toLowerCase().includes(q);
        }
        return (
          String(c["اسم العميل"] || "").toLowerCase().includes(q) ||
          String(c["رقم الحساب"] || "").toLowerCase().includes(q) ||
          String(c["رقم الهوية"] || "").toLowerCase().includes(q) ||
          String(c["رقم الجوال"] || "").toLowerCase().includes(q)
        );
      });
    }

    // Filters Dropdown
    if (filterValue !== "all") {
      if (filterType === "نوع المنتج") {
        list = list.filter((c) => {
          const p = String(c["نوع المنتج"] || c["المنتج"] || "").toUpperCase();
          return p === filterValue;
        });
      } else if (filterType === "عميل رواتب") {
        list = list.filter((c) => {
          const val = String(c["عميل رواتب"] || "").toLowerCase();
          return filterValue === "Yes" ? val === "yes" || val === "نعم" : val !== "yes" && val !== "نعم";
        });
      } else if (filterType === "عميل متوفي") {
        list = list.filter((c) => {
          const val = String(c["عميل متوفي"] || "").toLowerCase();
          return filterValue === "Yes" ? val === "yes" || val === "نعم" : val !== "yes" && val !== "نعم";
        });
      } else if (filterType === "عميل لديه طلب في سيبل") {
        list = list.filter((c) => {
          const val = String(c["رقم الطلب في نظام سيبل"] || c["رقم الطلب"] || "").trim();
          return filterValue === "Yes" ? val.length > 0 && val !== "-" : val.length === 0 || val === "-";
        });
      } else if (filterType === "الأكشن") {
        list = list.filter((c) => {
          return String(c["الاكشن"] || "") === filterValue;
        });
      }
    }

    return list;
  }, [allCustomers, quickFilter, searchQuery, searchField, filterType, filterValue]);

  // Sliced customers for cards view
  const visibleCardCustomers = useMemo(() => {
    return filteredCustomers.slice(0, visibleCount);
  }, [filteredCustomers, visibleCount]);

  // Handlers
  const handleOpenCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSheetOpen(true);
    // If unified admin profile handler exists, user can also open full profile or we sync data
  };

  const handleCall = (phone: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!phone) {
      toast.error("لا يوجد رقم جوال مسجل لهذا العميل");
      return;
    }
    window.open(`tel:${phone}`, "_self");
    if (selectedCustomer) {
      const key = String(selectedCustomer["رقم الحساب"] || selectedCustomer["رقم الهوية"] || "");
      if (key) {
        setContactedCustomers((prev) => ({ ...prev, [key]: true }));
      }
    }
  };

  const handleWhatsApp = (phone: string, name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!phone) {
      toast.error("لا يوجد رقم جوال مسجل لهذا العميل");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    const waPhone = cleanPhone.startsWith("966") ? cleanPhone : cleanPhone.startsWith("05") ? `966${cleanPhone.slice(1)}` : cleanPhone;
    const msg = getActiveMessage(name || "العميل");
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${waPhone}?text=${encoded}`, "_blank");

    if (selectedCustomer) {
      const key = String(selectedCustomer["رقم الحساب"] || selectedCustomer["رقم الهوية"] || "");
      if (key) {
        setContactedCustomers((prev) => ({ ...prev, [key]: true }));
      }
    }
  };

  const handleCopyPhone = (phone: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    toast.success("تم نسخ رقم الجوال");
  };

  const handleUpdateCustomerField = (keyName: string, value: any) => {
    if (!selectedCustomer) return;
    const custKey = String(selectedCustomer["رقم الحساب"] || selectedCustomer["رقم الهوية"] || "");
    if (!custKey) return;

    setCustomerEdits((prev) => ({
      ...prev,
      [custKey]: {
        ...(prev[custKey] || {}),
        [keyName]: value,
      },
    }));

    setSelectedCustomer((prev) => (prev ? { ...prev, [keyName]: value } : null));
    toast.success(`تم تحديث ${keyName} بنجاح`);
  };

  // Upload Excel handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws);

        if (rawJson && rawJson.length > 0) {
          setUploadedCustomers(rawJson as Customer[]);
          toast.success(`تم استيراد ${rawJson.length} حساب من ملف الإكسل بنجاح`);
        } else {
          toast.error("الملف لا يحتوي على بيانات صالحة");
        }
      } catch (err) {
        toast.error("فشل في قراءة ملف الإكسل، تأكد من التنسيق");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-[#f7f6f3] text-[#133E35] font-sans pb-16" dir="rtl">
      {/* Hidden file input for Excel upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx,.xls"
        className="hidden"
      />

      <div className="max-w-7xl mx-auto p-2 sm:p-4 space-y-4">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border border-[#e5e2dc] p-2 sm:p-2.5 rounded-xl shadow-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Menu Trigger */}
            <button
              onClick={() => setSideMenuOpen(true)}
              className="size-7.5 sm:size-8 rounded-lg border border-[#e5e2dc] bg-white hover:bg-[#eeece7] text-[#133E35] grid place-items-center transition-colors shrink-0"
              title="القائمة"
            >
              <Menu className="size-3.5 sm:size-4" />
            </button>

            {/* Title & Icon */}
            <div className="size-7.5 sm:size-8 rounded-lg bg-[#133E35] text-white grid place-items-center shrink-0 shadow-xs">
              <Wallet className="size-3.5 sm:size-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm md:text-base font-bold text-[#133E35] leading-tight truncate">
                إدارة ومعالجة طلبات الإعفاء والجدولة
              </h1>
              <HeaderDateTime />
            </div>
          </div>

          {/* Action buttons on header */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <div className="hidden md:flex bg-[#eeece7] p-0.5 rounded-lg border border-[#e5e2dc]">
              <button
                onClick={() => setActiveView("cards")}
                className={`px-2.5 py-0.5 text-[11px] font-bold rounded transition-all ${
                  activeView === "cards"
                    ? "bg-[#133E35] text-white shadow-xs"
                    : "text-[#133E35] hover:text-black"
                }`}
              >
                عرض البطاقات
              </button>
              <button
                onClick={() => setActiveView("table")}
                className={`px-2.5 py-0.5 text-[11px] font-bold rounded transition-all ${
                  activeView === "table"
                    ? "bg-[#133E35] text-white shadow-xs"
                    : "text-[#133E35] hover:text-black"
                }`}
              >
                المحفظة كاملة (جدول)
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-7 px-2 text-[11px] border-[#e5e2dc] hover:bg-[#eeece7] text-[#133E35]"
              title="رفع ملف إكسل .xlsx"
            >
              <Upload className="size-3 ml-1" />
              <span className="hidden sm:inline">رفع إكسل</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={async () => {
                await onRefresh();
                toast.success("تم تحديث البيانات");
              }}
              className="size-7 border-[#e5e2dc] hover:bg-[#eeece7] text-[#133E35]"
              title="تحديث البيانات"
            >
              <RotateCcw className="size-3" />
            </Button>
          </div>
        </header>

        {/* Portfolio Summary Card (بطاقة ملخص المحفظة) */}
        <section className="bg-white border border-[#e5e2dc] rounded-xl p-2.5 sm:p-3 shadow-xs space-y-2">
          {/* Top 2 KPI boxes */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            <div className="p-2 sm:p-2.5 rounded-lg bg-[#eeece7]/40 border border-[#e5e2dc]/60 space-y-0.5">
              <div className="text-[10px] font-bold text-muted-foreground">عدد الحسابات</div>
              <div className="text-base sm:text-lg font-black text-[#133E35] tabular-nums">
                {portfolioStats.totalAccounts}
                <span className="text-[10px] font-normal text-muted-foreground mr-1">حساب</span>
              </div>
            </div>

            <div className="p-2 sm:p-2.5 rounded-lg bg-[#eeece7]/40 border border-[#e5e2dc]/60 space-y-0.5">
              <div className="text-[10px] font-bold text-muted-foreground">رصيد المحفظة</div>
              <div className="text-base sm:text-lg font-black text-[#0E8F4F] tabular-nums">
                {formatCurrency(portfolioStats.totalBalance)}
                <span className="text-[10px] font-bold text-muted-foreground mr-1">SAR</span>
              </div>
            </div>
          </div>

          {/* Product breakdown boxes */}
          <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-bold">
            <div className="p-1 sm:p-1.5 rounded-md border border-emerald-200 bg-emerald-50/50 text-emerald-800">
              <div className="text-[9px] text-emerald-600">FR</div>
              <div className="text-xs sm:text-sm font-black tabular-nums">{portfolioStats.frCount}</div>
              <div className="text-[8px] text-muted-foreground">حساب</div>
            </div>

            <div className="p-1 sm:p-1.5 rounded-md border border-blue-200 bg-blue-50/50 text-blue-800">
              <div className="text-[9px] text-blue-600">AL</div>
              <div className="text-xs sm:text-sm font-black tabular-nums">{portfolioStats.alCount}</div>
              <div className="text-[8px] text-muted-foreground">حساب</div>
            </div>

            <div className="p-1 sm:p-1.5 rounded-md border border-amber-200 bg-amber-50/50 text-amber-800">
              <div className="text-[9px] text-amber-600">PF</div>
              <div className="text-xs sm:text-sm font-black tabular-nums">{portfolioStats.pfCount}</div>
              <div className="text-[8px] text-muted-foreground">حساب</div>
            </div>

            <div className="p-1 sm:p-1.5 rounded-md border border-purple-200 bg-purple-50/50 text-purple-800">
              <div className="text-[9px] text-purple-600">CC</div>
              <div className="text-xs sm:text-sm font-black tabular-nums">{portfolioStats.ccCount}</div>
              <div className="text-[8px] text-muted-foreground">حساب</div>
            </div>
          </div>
        </section>

        {/* Collector Unified Dashboard / Quick Actions Hub */}
        <section className="bg-white border border-[#e5e2dc] p-2 sm:p-3 rounded-xl text-[#133E35] flex flex-col gap-2 w-full max-w-sm mx-auto shadow-xs">
          <div className="text-center text-[10px] font-bold text-muted-foreground">
            لوحة الإجراءات السريعة للمحصل
          </div>
          <div className="grid grid-cols-3 gap-2">
            {/* Button 1: طلبات الإعفاء */}
            <button
              onClick={() => {
                const next = quickFilter === "exemption" ? "all" : "exemption";
                setQuickFilter(next);
                setActiveView("cards");
                toast.info(next === "exemption" ? `تم تصفية العرض: طلبات الإعفاء (${portfolioStats.exemptionCount} حساب)` : "تم عرض كافة الحسابات");
              }}
              className={`relative rounded-xl p-1.5 h-14 sm:h-16 flex flex-col items-center justify-center gap-1 transition-all border ${
                quickFilter === "exemption"
                  ? "bg-[#ec4899]/15 border-[#ec4899] ring-2 ring-[#ec4899]/30"
                  : "bg-[#eeece7] border-[#e5e2dc] hover:bg-[#e5e2dc]/80"
              }`}
            >
              {portfolioStats.exemptionCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
                  {portfolioStats.exemptionCount}
                </span>
              )}
              <FileMinus className="size-4 sm:size-4.5 text-[#ec4899]" />
              <span className="text-[10px] font-bold text-[#133E35]">طلبات الإعفاء</span>
            </button>

            {/* Button 2: طلبات الجدولة */}
            <button
              onClick={() => {
                const next = quickFilter === "reschedule" ? "all" : "reschedule";
                setQuickFilter(next);
                setActiveView("cards");
                toast.info(next === "reschedule" ? `تم تصفية العرض: طلبات الجدولة (${portfolioStats.rescheduleCount} حساب)` : "تم عرض كافة الحسابات");
              }}
              className={`relative rounded-xl p-1.5 h-14 sm:h-16 flex flex-col items-center justify-center gap-1 transition-all border ${
                quickFilter === "reschedule"
                  ? "bg-[#3b82f6]/15 border-[#3b82f6] ring-2 ring-[#3b82f6]/30"
                  : "bg-[#eeece7] border-[#e5e2dc] hover:bg-[#e5e2dc]/80"
              }`}
            >
              {portfolioStats.rescheduleCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
                  {portfolioStats.rescheduleCount}
                </span>
              )}
              <CalendarClock className="size-4 sm:size-4.5 text-[#3b82f6]" />
              <span className="text-[10px] font-bold text-[#133E35]">طلبات الجدولة</span>
            </button>

            {/* Button 3: محفظتي */}
            <button
              onClick={() => {
                setQuickFilter("all");
                setFilterValue("all");
                setSearchQuery("");
                setActiveView("cards");
                toast.success(`تم فتح المحفظة بالكامل (${allCustomers.length} حساب)`);
              }}
              className={`relative rounded-xl p-1.5 h-14 sm:h-16 flex flex-col items-center justify-center gap-1 transition-all border ${
                quickFilter === "all"
                  ? "bg-amber-100/70 border-amber-400 ring-2 ring-amber-300"
                  : "bg-[#eeece7] border-[#e5e2dc] hover:bg-[#e5e2dc]/80"
              }`}
            >
              <Wallet className="size-4 sm:size-4.5 text-amber-600" />
              <span className="text-[10px] font-bold text-[#133E35]">محفظتي</span>
            </button>
          </div>
        </section>

        {/* Search Card */}
        <section className="bg-white border border-[#e5e2dc] p-2 sm:p-2.5 rounded-xl shadow-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
            <Select value={searchField} onValueChange={setSearchField}>
              <SelectTrigger className="w-full sm:w-36 h-7.5 sm:h-8 text-[11px] border-[#e5e2dc] bg-[#fbf9f6]">
                <SelectValue placeholder="حقل البحث" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="رقم الهوية">رقم الهوية</SelectItem>
                <SelectItem value="رقم الحساب">رقم الحساب</SelectItem>
                <SelectItem value="رقم الجوال">رقم الجوال</SelectItem>
                <SelectItem value="الاسم">الاسم</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1">
              <Search className="size-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`بحث بواسطة ${searchField}...`}
                className="pr-8 pl-8 h-7.5 sm:h-8 text-[11px] border-[#e5e2dc] bg-[#fbf9f6]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-black"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Filters Card */}
        <section className="bg-white border border-[#e5e2dc] p-2 sm:p-2.5 rounded-xl shadow-xs space-y-1.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-1">
              <div className="size-7 rounded-lg bg-[#eeece7] text-[#133E35] grid place-items-center shrink-0">
                <Filter className="size-3.5" />
              </div>

              <Select
                value={filterType}
                onValueChange={(v) => {
                  setFilterType(v);
                  setFilterValue("all");
                }}
              >
                <SelectTrigger className="w-32 sm:w-36 h-7.5 sm:h-8 text-[11px] border-[#e5e2dc]">
                  <SelectValue placeholder="نوع الفلترة" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="نوع المنتج">نوع المنتج</SelectItem>
                  <SelectItem value="عميل رواتب">عميل رواتب</SelectItem>
                  <SelectItem value="عميل متوفي">عميل متوفي</SelectItem>
                  <SelectItem value="عميل لديه طلب في سيبل">طلب في سيبل</SelectItem>
                  <SelectItem value="الأكشن">الأكشن</SelectItem>
                </SelectContent>
              </Select>

              {/* Dynamic secondary select */}
              <Select value={filterValue} onValueChange={setFilterValue}>
                <SelectTrigger className="w-32 sm:w-36 h-7.5 sm:h-8 text-[11px] border-[#e5e2dc]">
                  <SelectValue placeholder="القيمة" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="all">الكل</SelectItem>
                  {filterType === "نوع المنتج" && (
                    <>
                      <SelectItem value="PF">PF (تمويل شخصي)</SelectItem>
                      <SelectItem value="CC">CC (بطاقات ائتمانية)</SelectItem>
                      <SelectItem value="AL">AL (تمويل تأجيري)</SelectItem>
                      <SelectItem value="FR">FR (تمويل عقاري)</SelectItem>
                    </>
                  )}
                  {(filterType === "عميل رواتب" ||
                    filterType === "عميل متوفي" ||
                    filterType === "عميل لديه طلب في سيبل") && (
                    <>
                      <SelectItem value="Yes">نعم (Yes)</SelectItem>
                      <SelectItem value="No">لا (No)</SelectItem>
                    </>
                  )}
                  {filterType === "الأكشن" &&
                    ACTION_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-[11px] font-bold text-[#133E35] bg-[#eeece7]/60 px-2.5 py-1 rounded-lg border border-[#e5e2dc]/60 self-end sm:self-center">
              {filteredCustomers.length} نتيجة
            </div>
          </div>
        </section>

        {/* Active Filter Indicator Banner */}
        {quickFilter !== "all" && (
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-[#e5e2dc] shadow-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${quickFilter === "exemption" ? "bg-[#ec4899]" : "bg-[#3b82f6]"}`} />
              <span className="text-xs font-bold text-[#133E35]">
                {quickFilter === "exemption" ? "عرض مخصص: طلبات الإعفاء" : "عرض مخصص: طلبات الجدولة"}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#eeece7] text-[#133E35]">
                {filteredCustomers.length} حساب
              </span>
            </div>
            <button
              onClick={() => {
                setQuickFilter("all");
                toast.info("تم العودة إلى عرض المحفظة كاملة");
              }}
              className="text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
            >
              <span>إلغاء التصفية</span>
              <X className="size-3" />
            </button>
          </div>
        )}

        {/* Views Container */}
        {activeView === "table" ? (
          <WalletTableView
            customers={filteredCustomers}
            onSelectCustomer={handleOpenCustomer}
            onCall={handleCall}
            onWhatsApp={handleWhatsApp}
          />
        ) : (
          /* Cards View */
          <div className="space-y-2">
            {visibleCardCustomers.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-[#e5e2dc] space-y-1.5">
                <AlertCircle className="size-6 text-muted-foreground mx-auto" />
                <div className="text-xs font-bold text-muted-foreground">لا توجد حسابات مطابقة لمعايير البحث</div>
              </div>
            ) : (
              visibleCardCustomers.map((customer, idx) => {
                const bal = Number(customer["مبلغ المديونية"] ?? customer["المبلغ"]) || 0;
                const phone = String(customer["رقم الجوال"] || "");
                const name = String(customer["اسم العميل"] || "عميل غير مسمى");
                const product = String(customer["نوع المنتج"] || customer["المنتج"] || "PF").toUpperCase();
                const action = customer["الاكشن"] || "بدون إجابة";
                const isPromiseAction = action === "وعد سداد";
                const isDeceased = String(customer["عميل متوفي"] || "").toLowerCase() === "yes";
                const isSalary = String(customer["عميل رواتب"] || "").toLowerCase() === "yes";
                const custKey = String(customer["رقم الحساب"] || customer["رقم الهوية"] || "");
                const isContacted = contactedCustomers[custKey] || false;

                return (
                  <div
                    key={idx}
                    onClick={() => handleOpenCustomer(customer)}
                    className="relative bg-white border border-[#e5e2dc] hover:border-[#133E35]/40 rounded-xl p-2.5 sm:p-3 shadow-xs hover:shadow-sm transition-all cursor-pointer space-y-2"
                  >
                    {/* Pulsing promise badge */}
                    {isPromiseAction && (
                      <div className="absolute -top-2 left-4 -rotate-12 z-10 animate-pulse bg-black text-amber-300 ring-1 ring-amber-400/60 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full shadow-xs">
                        وعد سداد
                      </div>
                    )}

                    {/* Top Row: Customer Info & Open Button */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-bold text-[#133E35] truncate">
                            {name}
                          </span>
                          {isContacted && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-0.5">
                              <Check className="size-2.5" /> تم التواصل
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-muted-foreground font-mono">
                          الحساب: {customer["رقم الحساب"] || "—"} | الهوية: {customer["رقم الهوية"] || "—"}
                        </div>
                      </div>

                      {/* Pill button: فتح صفحة العميل */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCustomer(customer);
                        }}
                        className="px-2 py-1 rounded-lg border border-[#e5e2dc] bg-[#eeece7] hover:bg-[#e5e2dc] text-[#133E35] text-[10px] font-bold flex items-center gap-1 shrink-0 transition-colors"
                      >
                        <Eye className="size-3" />
                        <span>فتح صفحة العميل</span>
                        <ArrowLeft className="size-3" />
                      </button>
                    </div>

                    {/* Middle Row: Badges & Amount */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-[#e5e2dc]/50">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#133E35] text-white">
                          {product}
                        </span>

                        {isDeceased && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-700">
                            عميل متوفي
                          </span>
                        )}

                        {isSalary && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-100 text-sky-700">
                            عميل رواتب
                          </span>
                        )}

                        {customer["التثبيت"] && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#eeece7] text-stone-600">
                            التثبيت: {customer["التثبيت"]}
                          </span>
                        )}
                      </div>

                      <div className="text-xs sm:text-sm font-black text-[#0E8F4F] tabular-nums">
                        {formatCurrency(bal)} <span className="text-[10px] font-bold text-muted-foreground">SAR</span>
                      </div>
                    </div>

                    {/* Bottom Row: Quick actions */}
                    <div
                      className="flex items-center justify-between gap-1.5 pt-1 border-t border-[#e5e2dc]/40"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleCall(phone, e)}
                          title="اتصال هاتفياً"
                          className="size-6.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 grid place-items-center transition-colors"
                        >
                          <Phone className="size-3" />
                        </button>

                        <button
                          onClick={(e) => handleWhatsApp(phone, name, e)}
                          title="محادثة واتساب"
                          className="size-6.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 grid place-items-center transition-colors"
                        >
                          <MessageCircle className="size-3" />
                        </button>

                        <button
                          onClick={(e) => handleCopyPhone(phone, e)}
                          title="نسخ رقم الجوال"
                          className="size-6.5 rounded-lg bg-[#eeece7] hover:bg-[#e5e2dc] text-stone-600 grid place-items-center transition-colors"
                        >
                          <Copy className="size-3" />
                        </button>
                      </div>

                      {/* Action selector badge - Native select for high speed & zero DOM overhead */}
                      <select
                        value={action}
                        onChange={(e) => {
                          const val = e.target.value;
                          const k = String(customer["رقم الحساب"] || customer["رقم الهوية"] || "");
                          if (k) {
                            setCustomerEdits((prev) => ({
                              ...prev,
                              [k]: { ...(prev[k] || {}), الاكشن: val },
                            }));
                            toast.success(`تم تحديث الأكشن إلى: ${val}`);
                          }
                        }}
                        className="h-7 text-[10px] font-bold border border-[#e5e2dc] rounded-lg px-2 bg-[#fcfbfa] text-[#133E35] focus:outline-none focus:border-gold/60 cursor-pointer"
                        dir="rtl"
                      >
                        {ACTION_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })
            )}

            {/* Load more button */}
            {visibleCardCustomers.length < filteredCustomers.length && (
              <div className="text-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount((prev) => prev + 20)}
                  className="rounded-2xl border-[#e5e2dc] bg-white hover:bg-[#eeece7] text-[#133E35] font-bold text-xs h-10 px-6 shadow-sm"
                >
                  تحميل المزيد (+20 حساب)
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Side Menu Drawer */}
      {sideMenuOpen && (
        <div
          className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
          onClick={() => setSideMenuOpen(false)}
        >
          <div
            className="w-80 bg-white h-full shadow-2xl p-5 space-y-4 font-sans text-right animate-in slide-in-from-right duration-200 flex flex-col"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e5e2dc] pb-3">
              <div className="text-base font-bold text-[#133E35]">القائمة</div>
              <button
                type="button"
                onClick={() => setSideMenuOpen(false)}
                className="size-7 rounded-full bg-[#eeece7] text-stone-600 grid place-items-center hover:bg-[#e5e2dc] transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-2 pt-2 flex-1 overflow-y-auto">
              <Button
                variant="outline"
                onClick={() => {
                  setSideMenuOpen(false);
                  setCalcModalOpen(true);
                }}
                className="w-full justify-start h-12 rounded-xl text-xs font-bold border-[#e5e2dc] hover:bg-[#eeece7] text-[#133E35]"
              >
                <Calculator className="size-4.5 ml-2.5 text-amber-600" />
                <span>حاسبة الخصم الذكية</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setSideMenuOpen(false);
                  setWaModalOpen(true);
                }}
                className="w-full justify-start h-12 rounded-xl text-xs font-bold border-[#e5e2dc] hover:bg-[#eeece7] text-[#133E35]"
              >
                <MessageCircle className="size-4.5 ml-2.5 text-emerald-600" />
                <span>قوالب واتساب مخصصة</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setSideMenuOpen(false);
                  setActiveView("table");
                }}
                className="w-full justify-start h-12 rounded-xl text-xs font-bold border-[#e5e2dc] hover:bg-[#eeece7] text-[#133E35]"
              >
                <Wallet className="size-4.5 ml-2.5 text-[#133E35]" />
                <span>المحفظة كاملة (الجدول الموحد)</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setSideMenuOpen(false);
                  setActiveView("cards");
                }}
                className="w-full justify-start h-12 rounded-xl text-xs font-bold border-[#e5e2dc] hover:bg-[#eeece7] text-[#133E35]"
              >
                <Eye className="size-4.5 ml-2.5 text-blue-600" />
                <span>بطاقات العملاء</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setSideMenuOpen(false);
                  fileInputRef.current?.click();
                }}
                className="w-full justify-start h-12 rounded-xl text-xs font-bold border-[#e5e2dc] hover:bg-[#eeece7] text-[#133E35]"
              >
                <Upload className="size-4.5 ml-2.5 text-purple-600" />
                <span>رفع ملف إكسل .xlsx</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Fast, Zero-Lag Customer Details Drawer / Modal */}
      {sheetOpen && selectedCustomer && (
        <div
          className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className="relative w-full sm:max-w-2xl max-h-[92vh] bg-white rounded-t-[28px] sm:rounded-[24px] shadow-2xl flex flex-col overflow-hidden text-right border border-[#e5e2dc] font-sans animate-in slide-in-from-bottom duration-200"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div className="p-4 sm:p-5 border-b border-[#e5e2dc] flex items-center justify-between bg-white shrink-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold text-[#133E35] truncate">
                    {selectedCustomer["اسم العميل"] || "تفاصيل العميل"}
                  </h2>
                  {onOpenUserProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        const raw = (selectedCustomer as any)._rawSubmission;
                        const userId = raw?.userId || raw?.user_id || "";
                        const natId = String(selectedCustomer["رقم الهوية"] || "");
                        const name = String(selectedCustomer["اسم العميل"] || "");
                        const phone = String(selectedCustomer["رقم الجوال"] || "");
                        setSheetOpen(false);
                        onOpenUserProfile(userId, natId, name, phone);
                      }}
                      className="px-2.5 py-1 rounded-md bg-[#133E35] text-white text-[11px] font-bold hover:bg-[#133E35]/90 transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
                    >
                      <UserCheck className="size-3.5 text-amber-400" />
                      <span>الملف الشامل</span>
                    </button>
                  )}
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-1">
                  حساب رقم: {selectedCustomer["رقم الحساب"] || "—"} | الهوية: {selectedCustomer["رقم الهوية"] || "—"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="size-8 rounded-full bg-[#eeece7] text-stone-600 grid place-items-center hover:bg-[#e5e2dc] transition-colors shrink-0 mr-2"
                title="إغلاق"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar text-right">
              {/* Debt Amount Banner */}
              <div className="bg-[#133E35] text-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div>
                  <div className="text-xs text-white/80">مبلغ المديونية القائم</div>
                  <div className="text-2xl font-black tabular-nums">
                    {formatCurrency(
                      Number(selectedCustomer["مبلغ المديونية"] ?? selectedCustomer["المبلغ"]) || 0
                    )}{" "}
                    SAR
                  </div>
                </div>
                <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-white/15 text-white border border-white/20">
                  {selectedCustomer["نوع المنتج"] || selectedCustomer["المنتج"] || "PF"}
                </span>
              </div>

              {/* 4 Action Buttons Grid */}
              <div className="grid grid-cols-4 gap-2">
                {/* 1. إرسال واتساب */}
                <button
                  type="button"
                  onClick={() =>
                    handleWhatsApp(
                      String(selectedCustomer["رقم الجوال"] || ""),
                      String(selectedCustomer["اسم العميل"] || "")
                    )
                  }
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-[#e5e2dc] bg-white hover:bg-emerald-50 transition-colors gap-1.5 shadow-xs"
                >
                  <div className="size-10 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center">
                    <MessageCircle className="size-5" />
                  </div>
                  <span className="text-[11px] font-bold text-[#133E35]">إرسال واتساب</span>
                </button>

                {/* 2. إجراء إتصال */}
                <button
                  type="button"
                  onClick={() => handleCall(String(selectedCustomer["رقم الجوال"] || ""))}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-[#e5e2dc] bg-white hover:bg-blue-50 transition-colors gap-1.5 shadow-xs"
                >
                  <div className="size-10 rounded-full bg-blue-100 text-blue-600 grid place-items-center">
                    <Phone className="size-5" />
                  </div>
                  <span className="text-[11px] font-bold text-[#133E35]">إجراء إتصال</span>
                </button>

                {/* 3. إسناد طرف ثالث */}
                <button
                  type="button"
                  onClick={() => setThirdPartyOpen(true)}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-[#e5e2dc] bg-white hover:bg-amber-50 transition-colors gap-1.5 shadow-xs"
                >
                  <div className="size-10 rounded-full bg-amber-100 text-amber-700 grid place-items-center">
                    <Users className="size-5" />
                  </div>
                  <span className="text-[11px] font-bold text-[#133E35]">إسناد طرف ثالث</span>
                </button>

                {/* 4. بطاقة التسوية */}
                <button
                  type="button"
                  onClick={() => setSettlementModalOpen(true)}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-[#e5e2dc] bg-white hover:bg-purple-50 transition-colors gap-1.5 shadow-xs"
                >
                  <div className="size-10 rounded-full bg-purple-100 text-purple-700 grid place-items-center">
                    <CreditCard className="size-5" />
                  </div>
                  <span className="text-[11px] font-bold text-[#133E35]">بطاقة التسوية</span>
                </button>
              </div>

              {/* Customer Fields Form */}
              <div className="space-y-3">
                {/* Field Box 1: رقم الحساب | نوع المنتج */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl border border-[#e5e2dc] bg-[#fcfbfa]">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 mb-0.5">
                      <CreditCard className="size-3 text-[#133E35]" /> رقم الحساب
                    </span>
                    <span className="text-xs font-bold text-[#133E35] font-mono">
                      {selectedCustomer["رقم الحساب"] || "—"}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl border border-[#e5e2dc] bg-[#fcfbfa]">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 mb-0.5">
                      <Tag className="size-3 text-[#133E35]" /> نوع المنتج
                    </span>
                    <span className="text-xs font-bold text-[#133E35]">
                      {selectedCustomer["نوع المنتج"] || selectedCustomer["المنتج"] || "PF"}
                    </span>
                  </div>
                </div>

                {/* Field Box 2: رقم الهوية | رقم الجوال */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl border border-[#e5e2dc] bg-[#fcfbfa]">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 mb-0.5">
                      <IdCard className="size-3 text-[#133E35]" /> رقم الهوية الوطنية
                    </span>
                    <span className="text-xs font-bold text-[#133E35] font-mono">
                      {selectedCustomer["رقم الهوية"] || "—"}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl border border-[#e5e2dc] bg-[#fcfbfa]">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 mb-0.5">
                      <Smartphone className="size-3 text-[#133E35]" /> رقم الجوال
                    </span>
                    <span className="text-xs font-bold text-[#133E35] font-mono" dir="ltr">
                      {selectedCustomer["رقم الجوال"] || "—"}
                    </span>
                  </div>
                </div>

                {/* Badges Row: نوع الإعفاء | عميل متوفي | عميل رواتب */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-xl border border-[#e5e2dc] bg-white">
                    <span className="text-[10px] text-muted-foreground block mb-1">نوع الإعفاء</span>
                    <select
                      value={selectedCustomer["نوع الإعفاء"] || "عجز كلي"}
                      onChange={(e) => handleUpdateCustomerField("نوع الإعفاء", e.target.value)}
                      className="w-full h-7 text-xs font-bold bg-transparent text-[#133E35] focus:outline-none cursor-pointer"
                      dir="rtl"
                    >
                      <option value="عجز كلي">عجز كلي</option>
                      <option value="وفاة">وفاة العميل</option>
                      <option value="إعسار مالي">إعسار مالي</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const cur = String(selectedCustomer["عميل متوفي"] || "").toLowerCase();
                      handleUpdateCustomerField("عميل متوفي", cur === "yes" ? "No" : "Yes");
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      String(selectedCustomer["عميل متوفي"] || "").toLowerCase() === "yes"
                        ? "bg-red-50 border-red-300 text-red-700"
                        : "bg-[#fcfbfa] border-[#e5e2dc] text-stone-600"
                    }`}
                  >
                    <span className="text-[10px]">عميل متوفي</span>
                    <span className="text-xs font-bold">
                      {String(selectedCustomer["عميل متوفي"] || "").toLowerCase() === "yes" ? "نعم" : "لا"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const cur = String(selectedCustomer["عميل رواتب"] || "").toLowerCase();
                      handleUpdateCustomerField("عميل رواتب", cur === "yes" ? "No" : "Yes");
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      String(selectedCustomer["عميل رواتب"] || "").toLowerCase() === "yes"
                        ? "bg-sky-50 border-sky-300 text-sky-700"
                        : "bg-[#fcfbfa] border-[#e5e2dc] text-stone-600"
                    }`}
                  >
                    <span className="text-[10px]">عميل رواتب</span>
                    <span className="text-xs font-bold">
                      {String(selectedCustomer["عميل رواتب"] || "").toLowerCase() === "yes" ? "نعم" : "لا"}
                    </span>
                  </button>
                </div>

                {/* Sibel Request Box */}
                <div className="p-3 rounded-2xl border border-[#e5e2dc] bg-white space-y-2">
                  <div className="text-xs font-bold text-[#133E35] flex items-center gap-1.5">
                    <FileText className="size-4 text-emerald-600" />
                    <span>بيانات الطلب في نظام سيبل (SEPLL)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-muted-foreground block mb-0.5">رقم طلب سيبل</label>
                      <Input
                        value={
                          selectedCustomer["رقم الطلب في نظام سيبل"] ||
                          selectedCustomer["رقم الطلب"] ||
                          ""
                        }
                        onChange={(e) =>
                          handleUpdateCustomerField("رقم الطلب في نظام سيبل", e.target.value)
                        }
                        placeholder="أدخل رقم الطلب"
                        className="h-8 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-muted-foreground block mb-0.5">نوع الطلب</label>
                      <select
                        value={selectedCustomer["طلب الطلب"] || selectedCustomer["نوع الطلب"] || "إعادة جدولة"}
                        onChange={(e) => handleUpdateCustomerField("طلب الطلب", e.target.value)}
                        className="w-full h-8 text-xs font-medium bg-[#fcfbfa] border border-[#e5e2dc] rounded-lg px-2 text-[#133E35] focus:outline-none cursor-pointer"
                        dir="rtl"
                      >
                        <option value="إعفاء متوفين">إعفاء متوفين</option>
                        <option value="إعادة جدولة">إعادة جدولة</option>
                        <option value="تسوية ودية">تسوية ودية</option>
                        <option value="أرصدة محجوزة">أرصدة محجوزة</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-muted-foreground block mb-0.5">الوصف والملاحظات</label>
                    <Textarea
                      rows={2}
                      value={selectedCustomer["الوصف"] || selectedCustomer["NOTE"] || ""}
                      onChange={(e) => handleUpdateCustomerField("الوصف", e.target.value)}
                      placeholder="أدخل ملاحظات المعالجة..."
                      className="text-xs"
                    />
                  </div>
                </div>

                {/* Financial & Freeze Box */}
                <div className="p-3 rounded-2xl border border-[#e5e2dc] bg-white space-y-2">
                  <div className="text-xs font-bold text-[#133E35] flex items-center gap-1.5">
                    <Snowflake className="size-4 text-sky-600" />
                    <span>تاريخ التجميد والبيانات المالية</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-muted-foreground block mb-0.5">تاريخ التجميد</label>
                      <Input
                        value={
                          freezeFromJwo(selectedCustomer.jWO_DT) ||
                          selectedCustomer["تاريخ التجميد"] ||
                          ""
                        }
                        onChange={(e) => handleUpdateCustomerField("تاريخ التجميد", e.target.value)}
                        placeholder="YYYY-MM-DD"
                        className="h-8 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-muted-foreground block mb-0.5">مبلغ السداد المدفوع</label>
                      <Input
                        type="number"
                        inputMode="decimal"
                        value={selectedCustomer["السداد"] || ""}
                        onChange={(e) => handleUpdateCustomerField("السداد", e.target.value)}
                        placeholder="0.00"
                        className="h-8 text-xs tabular-nums"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Selector Box */}
                <div className="p-3 rounded-2xl border border-[#e5e2dc] bg-[#fcfbfa] space-y-1.5">
                  <label className="text-xs font-bold text-[#133E35] block">
                    الأكشن التنفيذي الحالي للمحصل
                  </label>
                  <select
                    value={selectedCustomer["الاكشن"] || "وعد سداد"}
                    onChange={(e) => handleUpdateCustomerField("الاكشن", e.target.value)}
                    className="w-full h-9 text-xs font-bold bg-white border border-[#e5e2dc] rounded-lg px-3 text-[#133E35] focus:outline-none cursor-pointer"
                    dir="rtl"
                  >
                    {ACTION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="text-xs font-semibold">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Official Platform Workflows (Contract, Invoice, Promissory) */}
                <div className="p-3 rounded-2xl border border-[#e5e2dc] bg-white space-y-2">
                  <div className="text-xs font-bold text-[#133E35] flex items-center gap-1.5">
                    <Gavel className="size-4 text-purple-600" />
                    <span>إجراءات التعاقد والسندات الرسمية</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const raw = (selectedCustomer as any)._rawSubmission;
                        if (raw && onSendContract) {
                          onSendContract(raw.userId, raw.id);
                        } else {
                          toast.success("تم إرسال مسودة عقد التسوية للعميل");
                        }
                      }}
                      className="h-8 text-[11px] border-[#e5e2dc] text-[#133E35] hover:bg-[#eeece7]"
                    >
                      إصدار عقد
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const raw = (selectedCustomer as any)._rawSubmission;
                        if (raw && onSendInvoice) {
                          onSendInvoice(raw.userId, raw.id);
                        } else {
                          toast.success("تم إصدار فاتورة سداد للعميل");
                        }
                      }}
                      className="h-8 text-[11px] border-[#e5e2dc] text-[#133E35] hover:bg-[#eeece7]"
                    >
                      إصدار فاتورة
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const raw = (selectedCustomer as any)._rawSubmission;
                        if (raw && onSendPromissory) {
                          onSendPromissory(raw.userId, raw.id);
                        } else {
                          toast.success("تم إنشاء سند لأمر تنفيذي في نافذ");
                        }
                      }}
                      className="h-8 text-[11px] border-[#e5e2dc] text-[#133E35] hover:bg-[#eeece7]"
                    >
                      سند لأمر
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Third Party Assignment Dialog */}
      {thirdPartyOpen && selectedCustomer && (
        <ThirdPartyDialog
          open={thirdPartyOpen}
          onOpenChange={setThirdPartyOpen}
          customerName={String(selectedCustomer["اسم العميل"] || "")}
          customerId={String(selectedCustomer["رقم الهوية"] || "")}
          settlementAmount={Number(selectedCustomer["مبلغ المديونية"] ?? selectedCustomer["المبلغ"]) || 0}
        />
      )}

      {/* Settlement Card Modal */}
      {settlementModalOpen && selectedCustomer && (
        <SettlementCardModal
          open={settlementModalOpen}
          onOpenChange={setSettlementModalOpen}
          customer={selectedCustomer}
        />
      )}

      {/* WhatsApp Templates Modal */}
      {waModalOpen && (
        <WhatsAppTemplatesModal
          open={waModalOpen}
          onOpenChange={setWaModalOpen}
          sampleClientName={String(selectedCustomer?.["اسم العميل"] || "العميل")}
        />
      )}

      {/* Discount Calculator Modal */}
      {calcModalOpen && (
        <DiscountCalculatorModal
          open={calcModalOpen}
          onOpenChange={setCalcModalOpen}
          defaultAmount={Number(selectedCustomer?.["مبلغ المديونية"] ?? selectedCustomer?.["المبلغ"]) || 50000}
          defaultProduct={String(selectedCustomer?.["نوع المنتج"] || selectedCustomer?.["المنتج"] || "PF")}
        />
      )}
    </div>
  );
};

// Sub-component for Live Arabic Date & Clock
function HeaderDateTime() {
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      // Date in Arabic: e.g. "الأربعاء، 17 سبتمبر 2026"
      const d = now.toLocaleDateString("ar-SA", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      // Time in Arabic: e.g. "12:45:10 ص"
      const t = now.toLocaleTimeString("ar-SA", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setDateStr(d);
      setTimeStr(t);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-[11px] text-muted-foreground font-medium truncate flex items-center gap-1">
      <span>{dateStr}</span>
      <span>•</span>
      <span className="font-mono text-[#133E35] font-bold">{timeStr}</span>
    </div>
  );
}

export default WaiveAndReschedulingManagement;
