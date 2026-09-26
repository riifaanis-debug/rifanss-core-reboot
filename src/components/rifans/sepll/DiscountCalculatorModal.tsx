import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, Percent, Sparkles, Check, Copy, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/wallet-types";
import { AGE_LABELS, PF_CC_BUCKETS, AgeBucket } from "@/lib/discount-policy";
import { toast } from "sonner";

interface DiscountCalculatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAmount?: number;
  defaultProduct?: string;
}

export const DiscountCalculatorModal: React.FC<DiscountCalculatorModalProps> = ({
  open,
  onOpenChange,
  defaultAmount = 50000,
  defaultProduct = "PF",
}) => {
  const [amountInput, setAmountInput] = useState<string>(String(defaultAmount));
  const [product, setProduct] = useState<string>(defaultProduct);
  const [ageBucket, setAgeBucket] = useState<AgeBucket>("4-5");
  const [customRate, setCustomRate] = useState<string>("");
  const [extra5, setExtra5] = useState(false);

  // Policy discount benchmark
  const policyRate = useMemo(() => {
    switch (ageBucket) {
      case "0-1": return 15;
      case "1-2": return 25;
      case "2-3": return 35;
      case "3-4": return 45;
      case "4-5": return 55;
      case "5-10": return 65;
      case "10-15": return 75;
      case "Over15": return 85;
      case "Over10": return 80;
      case "Senior60": return 80;
      case "FinalExit": return 85;
      default: return 50;
    }
  }, [ageBucket]);

  const activeRate = useMemo(() => {
    const base = customRate !== "" ? Number(customRate) || 0 : policyRate;
    return Math.min(100, Math.max(0, base + (extra5 ? 5 : 0)));
  }, [customRate, policyRate, extra5]);

  const balance = Number(amountInput) || 0;
  const discountVal = (balance * activeRate) / 100;
  const settlementVal = Math.max(0, balance - discountVal);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-lg font-sans text-right max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right text-[#133E35] font-bold flex items-center gap-2">
            <div className="size-8 rounded-xl bg-amber-100 text-amber-700 grid place-items-center">
              <Calculator className="size-4.5" />
            </div>
            <span>حاسبة الخصم والتسويات الذكية</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-[#133E35] font-bold">مبلغ المديونية (SAR)</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="0.00"
                className="h-9 text-xs tabular-nums font-bold"
              />
            </div>
            <div>
              <Label className="text-xs text-[#133E35] font-bold">نوع المنتج</Label>
              <Select value={product} onValueChange={setProduct}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="اختر المنتج" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="PF">تمويل شخصي (PF)</SelectItem>
                  <SelectItem value="CC">بطاقة ائتمانية (CC)</SelectItem>
                  <SelectItem value="AL">تمويل تأجيري (AL)</SelectItem>
                  <SelectItem value="RF">تمويل عقاري (RF)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-[#133E35] font-bold">عمر الدين / الفئة</Label>
              <Select value={ageBucket} onValueChange={(v) => setAgeBucket(v as AgeBucket)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="اختر عمر الدين" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {Object.entries(AGE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-xs">
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-[#133E35] font-bold">
                نسبة الخصم المعتمدة {customRate ? "(يدوية)" : "(السياسة)"}
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  inputMode="decimal"
                  value={customRate !== "" ? customRate : policyRate}
                  onChange={(e) => setCustomRate(e.target.value)}
                  placeholder={String(policyRate)}
                  className="h-9 text-xs font-bold pl-8"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center bg-[#eeece7]/40 p-2.5 rounded-xl border border-[#e5e2dc]">
            <div className="text-xs text-[#133E35] font-semibold">
              إمكانية منح 5% خصم استثنائي إضافي
            </div>
            <Button
              type="button"
              variant={extra5 ? "default" : "outline"}
              size="sm"
              onClick={() => setExtra5(!extra5)}
              className={`h-7 text-xs ${
                extra5 ? "bg-[#133E35] text-white" : "border-[#e5e2dc] text-[#133E35]"
              }`}
            >
              <Sparkles className="size-3 ml-1 text-amber-400" />
              {extra5 ? "تم تفعيل +5%" : "+5% إضافية"}
            </Button>
          </div>

          {/* Results Display */}
          <div className="rounded-2xl bg-gradient-to-br from-[#133E35] to-[#1e584c] text-white p-4 space-y-3 shadow-sm">
            <div className="flex justify-between items-center text-xs opacity-90 border-b border-white/20 pb-2">
              <span>نسبة الخصم الإجمالية:</span>
              <span className="text-lg font-black text-amber-300">{activeRate}%</span>
            </div>
            <div className="flex justify-between items-center text-xs opacity-90">
              <span>مبلغ الخصم الإجمالي:</span>
              <span className="font-bold text-red-300 tabular-nums">
                - {formatCurrency(discountVal)} SAR
              </span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold pt-1 border-t border-white/20">
              <span>المبلغ المطلوب لسداد التسوية:</span>
              <span className="text-xl font-extrabold text-emerald-300 tabular-nums">
                {formatCurrency(settlementVal)} SAR
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 pt-2">
          <Button
            onClick={() => {
              const msg = `مبلغ المديونية: ${formatCurrency(balance)} ريال\nنسبة الخصم: ${activeRate}%\nمبلغ التسوية المطلوب: ${formatCurrency(settlementVal)} ريال`;
              navigator.clipboard.writeText(msg);
              toast.success("تم نسخ ملخص التسوية");
            }}
            className="bg-[#133E35] hover:bg-[#234E45] text-white flex-1"
          >
            <Copy className="size-4 ml-1.5" /> نسخ تفاصيل التسوية
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
