import React, { useState, useMemo } from "react";
import { Customer, formatCurrency } from "@/lib/wallet-types";
import { UNIFIED_COLUMNS } from "@/lib/unified-columns";
import { freezeFromJwo } from "@/lib/freeze-date";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ArrowUpDown,
  Download,
  Eye,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

interface WalletTableViewProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
  onCall: (phone: string, e: React.MouseEvent) => void;
  onWhatsApp: (phone: string, name: string, e: React.MouseEvent) => void;
}

export const WalletTableView: React.FC<WalletTableViewProps> = ({
  customers,
  onSelectCustomer,
  onCall,
  onWhatsApp,
}) => {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string>("مبلغ المديونية");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const filteredData = useMemo(() => {
    let list = customers;

    if (productFilter !== "all") {
      list = list.filter((c) => {
        const p = String(c["نوع المنتج"] || c["المنتج"] || "").toUpperCase();
        return p === productFilter;
      });
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) => {
        const name = String(c["اسم العميل"] || "").toLowerCase();
        const acc = String(c["رقم الحساب"] || "").toLowerCase();
        const id = String(c["رقم الهوية"] || "").toLowerCase();
        const phone = String(c["رقم الجوال"] || "").toLowerCase();
        const reqNum = String(c["رقم الطلب في نظام سيبل"] || c["رقم الطلب"] || "").toLowerCase();
        return (
          name.includes(q) ||
          acc.includes(q) ||
          id.includes(q) ||
          phone.includes(q) ||
          reqNum.includes(q)
        );
      });
    }

    // Sort
    return [...list].sort((a, b) => {
      let valA: any = a[sortKey as keyof Customer];
      let valB: any = b[sortKey as keyof Customer];

      if (sortKey === "مبلغ المديونية") {
        valA = Number(a["مبلغ المديونية"] ?? a["المبلغ"]) || 0;
        valB = Number(b["مبلغ المديونية"] ?? b["المبلغ"]) || 0;
      }

      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortOrder === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [customers, search, sortKey, sortOrder, productFilter]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;

  const handleExportExcel = () => {
    try {
      const rows = filteredData.map((c) => ({
        "رقم الحساب": c["رقم الحساب"] || "",
        "مبلغ المديونية": Number(c["مبلغ المديونية"] ?? c["المبلغ"]) || 0,
        "اسم العميل": c["اسم العميل"] || "",
        "نوع المنتج": c["نوع المنتج"] || c["المنتج"] || "",
        "رقم الهوية": c["رقم الهوية"] || "",
        "تاريخ التجميد": freezeFromJwo(c.jWO_DT) || c["تاريخ التجميد"] || "",
        "رقم الجوال": c["رقم الجوال"] || "",
        "نوع الطلب": c["طلب الطلب"] || c["نوع الطلب"] || "",
        "رقم الطلب في سيبل": c["رقم الطلب في نظام سيبل"] || c["رقم الطلب"] || "",
        "الأكشن": c["الاكشن"] || "",
        "عميل رواتب": c["عميل رواتب"] || "",
        "عميل متوفي": c["عميل متوفي"] || "",
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "المحفظة كاملة");
      XLSX.writeFile(wb, `محفظة_الاعفاء_والجدولة_${new Date().toISOString().split("T")[0]}.xlsx`);
      toast.success("تم تصدير ملف الإكسل بنجاح");
    } catch (e) {
      toast.error("حدث خطأ أثناء تصدير الملف");
    }
  };

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-3 font-sans text-right" dir="rtl">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white p-3 rounded-2xl border border-[#e5e2dc] shadow-sm">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="size-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="البحث في المحفظة (الاسم، الحساب، الهوية...)"
              className="pr-9 h-9 text-xs border-[#e5e2dc] bg-[#fbf9f6]"
            />
          </div>

          <Select
            value={productFilter}
            onValueChange={(v) => {
              setProductFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-36 h-9 text-xs border-[#e5e2dc]">
              <SelectValue placeholder="المنتج" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all">كل المنتجات</SelectItem>
              <SelectItem value="PF">تمويل شخصي (PF)</SelectItem>
              <SelectItem value="CC">بطاقة ائتمان (CC)</SelectItem>
              <SelectItem value="AL">تمويل تأجيري (AL)</SelectItem>
              <SelectItem value="FR">تمويل عقاري (FR)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 justify-between sm:justify-end">
          <div className="text-xs font-bold text-[#133E35] px-2.5 py-1 rounded-xl bg-[#eeece7]/60">
            {filteredData.length} حساب
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            className="h-9 text-xs border-[#e5e2dc] hover:bg-[#eeece7] text-[#133E35]"
          >
            <Download className="size-3.5 ml-1.5" />
            تصدير إكسل
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-[#e5e2dc] bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <Table className="text-xs">
            <TableHeader className="bg-[#f8f7f5] sticky top-0 z-10">
              <TableRow className="border-b border-[#e5e2dc] hover:bg-transparent">
                <TableHead className="text-right font-bold text-[#133E35] w-12 text-center">إجراءات</TableHead>
                <TableHead
                  className="text-right font-bold text-[#133E35] cursor-pointer"
                  onClick={() => toggleSort("اسم العميل")}
                >
                  <div className="flex items-center gap-1">
                    <span>اسم العميل</span>
                    <ArrowUpDown className="size-3 text-muted-foreground" />
                  </div>
                </TableHead>
                <TableHead
                  className="text-right font-bold text-[#133E35] cursor-pointer"
                  onClick={() => toggleSort("رقم الحساب")}
                >
                  <div className="flex items-center gap-1">
                    <span>رقم الحساب</span>
                    <ArrowUpDown className="size-3 text-muted-foreground" />
                  </div>
                </TableHead>
                <TableHead
                  className="text-right font-bold text-[#133E35] cursor-pointer"
                  onClick={() => toggleSort("مبلغ المديونية")}
                >
                  <div className="flex items-center gap-1">
                    <span>مبلغ المديونية</span>
                    <ArrowUpDown className="size-3 text-muted-foreground" />
                  </div>
                </TableHead>
                <TableHead className="text-right font-bold text-[#133E35]">المنتج</TableHead>
                <TableHead className="text-right font-bold text-[#133E35]">رقم الهوية</TableHead>
                <TableHead className="text-right font-bold text-[#133E35]">رقم الجوال</TableHead>
                <TableHead className="text-right font-bold text-[#133E35]">تاريخ التجميد</TableHead>
                <TableHead className="text-right font-bold text-[#133E35]">رقم طلب سيبل</TableHead>
                <TableHead className="text-right font-bold text-[#133E35]">الأكشن</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                    لا توجد بيانات مطابقة لمعايير البحث
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((customer, idx) => {
                  const bal = Number(customer["مبلغ المديونية"] ?? customer["المبلغ"]) || 0;
                  const phone = String(customer["رقم الجوال"] || "");
                  const name = String(customer["اسم العميل"] || "عميل");
                  const freezeDate = freezeFromJwo(customer.jWO_DT) || customer["تاريخ التجميد"] || "—";
                  const action = customer["الاكشن"] || "—";
                  const sibelReq = customer["رقم الطلب في نظام سيبل"] || customer["رقم الطلب"] || "—";
                  const product = String(customer["نوع المنتج"] || customer["المنتج"] || "—");

                  return (
                    <TableRow
                      key={idx}
                      onClick={() => onSelectCustomer(customer)}
                      className="cursor-pointer hover:bg-[#eeece7]/40 transition-colors border-b border-[#e5e2dc]/60"
                    >
                      <TableCell className="text-center py-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => onCall(phone, e)}
                            title="اتصال"
                            className="size-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 grid place-items-center transition-colors"
                          >
                            <Phone className="size-3.5" />
                          </button>
                          <button
                            onClick={(e) => onWhatsApp(phone, name, e)}
                            title="واتساب"
                            className="size-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 grid place-items-center transition-colors"
                          >
                            <MessageCircle className="size-3.5" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-[#133E35] py-2 max-w-[180px] truncate">
                        {customer["اسم العميل"] || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground py-2">
                        {customer["رقم الحساب"] || "—"}
                      </TableCell>
                      <TableCell className="font-extrabold text-[#0E8F4F] tabular-nums py-2">
                        {formatCurrency(bal)} SAR
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-[#eeece7] text-[#133E35]">
                          {product}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground py-2">
                        {customer["رقم الهوية"] || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground py-2" dir="ltr">
                        {phone || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground py-2">
                        {freezeDate}
                      </TableCell>
                      <TableCell className="font-mono font-medium py-2">
                        {sibelReq}
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-100 text-stone-700">
                          {action}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t border-[#e5e2dc] bg-[#fbf9f6] text-xs">
            <span className="text-muted-foreground">
              الصفحة {page} من {totalPages} ({filteredData.length} سجل إجمالي)
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-7 px-2 border-[#e5e2dc]"
              >
                <ChevronRight className="size-3.5 ml-1" /> السابق
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-7 px-2 border-[#e5e2dc]"
              >
                التالي <ChevronLeft className="size-3.5 mr-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
