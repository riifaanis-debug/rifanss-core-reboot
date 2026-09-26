import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency, Customer } from "@/lib/wallet-types";
import { toast } from "sonner";
import { CreditCard, Printer, CheckCircle, Percent, Download, Sparkles } from "lucide-react";

interface SettlementCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}

export const SettlementCardModal: React.FC<SettlementCardModalProps> = ({
  open,
  onOpenChange,
  customer,
}) => {
  const [cardRateInput, setCardRateInput] = useState("50");
  const [cardExtra5Applied, setCardExtra5Applied] = useState(false);
  const [showPreviewCard, setShowPreviewCard] = useState(false);

  if (!customer) return null;

  const totalBal = Number(customer["مبلغ المديونية"] ?? customer["المبلغ"]) || 0;
  const rateNum = Number(cardRateInput) || 0;
  const discountAmount = totalBal * (rateNum / 100);
  const settlementAmount = Math.max(0, totalBal - discountAmount);

  const productCode = String(customer["نوع المنتج"] ?? customer["المنتج"] ?? "PF").toUpperCase();
  const productLabel =
    productCode === "PF"
      ? "التمويل الشخصي"
      : productCode === "CC"
      ? "البطاقات الائتمانية"
      : productCode === "AL"
      ? "التمويل التأجيري"
      : "التمويل العقاري";

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md font-sans text-right max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right text-[#133E35] font-bold flex items-center gap-2">
            <CreditCard className="size-5 text-[#8b5cf6]" />
            <span>إصدار بطاقة التسوية الرسمية</span>
          </DialogTitle>
        </DialogHeader>

        {!showPreviewCard ? (
          <div className="space-y-3.5">
            <div className="p-3 bg-[#fcfbfa] border border-[#e5e2dc] rounded-2xl space-y-1 text-xs">
              <div className="text-muted-foreground text-[11px]">اسم العميل</div>
              <div className="text-sm font-bold text-[#133E35]">{customer["اسم العميل"] || "—"}</div>
              <div className="flex justify-between items-center pt-1 border-t border-[#e5e2dc]/60">
                <span className="text-muted-foreground">رقم الحساب: {customer["رقم الحساب"] || "—"}</span>
                <span className="font-bold text-[#133E35]">{productLabel}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-[#133E35] block">
                  الرجاء إدخال نسبة الخصم المقترحة (%)
                </label>
                <span className="text-[10px] text-red-500 font-medium">دون إضافة 5٪ الإضافية</span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={100}
                  step="1"
                  placeholder="مثال: 50"
                  value={cardRateInput}
                  onChange={(e) => setCardRateInput(e.target.value)}
                  className="text-right pr-9 font-bold text-sm"
                  dir="rtl"
                />
                <Percent className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <div className="flex justify-between items-center pt-1">
                <div className="text-[11px] text-muted-foreground">
                  مبلغ المديونية: <span className="font-bold text-foreground">{formatCurrency(totalBal)} SAR</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={cardExtra5Applied}
                  onClick={() => {
                    if (cardExtra5Applied) {
                      toast.error("تم إضافة 5% خصم إضافي مسبقاً في هذه العملية");
                      return;
                    }
                    const current = Number(cardRateInput) || 0;
                    const next = Math.min(current + 5, 100);
                    setCardRateInput(String(next));
                    setCardExtra5Applied(true);
                    toast.success("تم تطبيق 5% خصم إضافي استثنائي");
                  }}
                  className="text-[11px] h-7 border-[#e5e2dc] hover:bg-[#eeece7] text-[#133E35] disabled:opacity-40"
                >
                  <Sparkles className="size-3 ml-1 text-amber-500" />
                  إضافة 5٪ خصم إضافي
                </Button>
              </div>
            </div>

            {/* Calculations Card */}
            <div className="rounded-2xl border border-[#e5e2dc] bg-[#eeece7]/50 p-3 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">قيمة الخصم المعتمد ({rateNum}%):</span>
                <span className="font-bold text-red-600 tabular-nums">{formatCurrency(discountAmount)} SAR</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold pt-1 border-t border-[#e5e2dc]">
                <span className="text-[#133E35]">مبلغ التسوية المطلوب سداده:</span>
                <span className="font-extrabold text-[#0E8F4F] tabular-nums text-base">{formatCurrency(settlementAmount)} SAR</span>
              </div>
            </div>

            <DialogFooter className="flex-row-reverse sm:flex-row-reverse gap-2 pt-2">
              <Button
                onClick={() => {
                  const r = Number(cardRateInput);
                  if (!Number.isFinite(r) || r <= 0 || r > 100) {
                    toast.error("الرجاء إدخال نسبة خصم صحيحة بين 0 و 100");
                    return;
                  }
                  setShowPreviewCard(true);
                }}
                className="bg-[#133E35] hover:bg-[#234E45] text-white flex-1"
              >
                معاينة وإصدار البطاقة
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
            </DialogFooter>
          </div>
        ) : (
          /* Preview Card for printing or sharing */
          <div className="space-y-4">
            <div id="printable-settlement-card" className="border-2 border-[#133E35] rounded-3xl p-5 bg-gradient-to-b from-white to-[#fbf9f6] shadow-md space-y-4 text-right">
              <div className="flex items-center justify-between border-b pb-3 border-[#133E35]/20">
                <div className="flex items-center gap-2">
                  <div className="size-9 rounded-xl bg-[#133E35] text-white grid place-items-center">
                    <CreditCard className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#133E35]">بطاقة تسوية المديونية الرسمية</div>
                    <div className="text-[10px] text-muted-foreground font-mono">SETTLEMENT GUARANTEE CARD</div>
                  </div>
                </div>
                <div className="text-left text-[10px] text-muted-foreground font-mono">
                  {new Date().toLocaleDateString('en-GB')}
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-[#eeece7]/40 p-2.5 rounded-xl">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">اسم العميل</span>
                    <span className="font-bold text-[#133E35]">{customer["اسم العميل"] || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">رقم الهوية</span>
                    <span className="font-bold text-[#133E35] font-mono">{customer["رقم الهوية"] || "—"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-[#eeece7]/40 p-2.5 rounded-xl">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">رقم الحساب</span>
                    <span className="font-bold text-[#133E35] font-mono">{customer["رقم الحساب"] || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">نوع التمويل</span>
                    <span className="font-bold text-[#133E35]">{productLabel}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#133E35] text-white p-3.5 rounded-2xl space-y-1">
                <div className="flex justify-between items-center text-xs opacity-80">
                  <span>إجمالي المديونية الأصلية:</span>
                  <span className="font-bold">{formatCurrency(totalBal)} SAR</span>
                </div>
                <div className="flex justify-between items-center text-xs text-amber-300">
                  <span>نسبة الخصم الاستثنائي ({rateNum}%):</span>
                  <span className="font-bold">- {formatCurrency(discountAmount)} SAR</span>
                </div>
                <div className="border-t border-white/20 pt-1.5 flex justify-between items-center">
                  <span className="text-xs font-bold">المبلغ المعتمد للتسوية الإجمالية:</span>
                  <span className="text-lg font-black text-emerald-300">{formatCurrency(settlementAmount)} SAR</span>
                </div>
              </div>

              <div className="border border-dashed border-[#133E35]/30 rounded-xl p-2 text-[10px] text-muted-foreground leading-relaxed">
                تعتبر هذه البطاقة إشعاراً ملزماً بالتسوية الودية بعد التزام العميل بسداد المبلغ المعتمد أعلاه في الحساب المصرفي المخصص قبل نهاية مدة العرض.
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button onClick={handlePrint} className="bg-[#133E35] hover:bg-[#234E45] text-white flex-1">
                <Printer className="size-4 ml-1.5" /> طباعة البطاقة
              </Button>
              <Button variant="outline" onClick={() => setShowPreviewCard(false)}>
                تعديل النسبة
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
