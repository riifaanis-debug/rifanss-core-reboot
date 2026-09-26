import React, { useMemo, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/wallet-types";
import { KSA_REGIONS, REGION_NAMES } from "@/lib/ksa-regions";

const EMPLOYERS = ["قطاع حكومي", "قطاع خاص", "متقاعد"];

type AhliProduct = { account: string; settle: string; type: string };
type OtherBank = { bank: string; account: string; settle: string; type: string };

export function ThirdPartyDialog({
  open,
  onOpenChange,
  customerName,
  customerId,
  settlementAmount,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  customerName: string;
  customerId: string;
  settlementAmount: number;
}) {
  const [salary, setSalary] = useState("");
  const [employer, setEmployer] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");

  const [hasAhli, setHasAhli] = useState(false);
  const [ahliList, setAhliList] = useState<AhliProduct[]>([{ account: "", settle: "", type: "" }]);

  const [hasOther, setHasOther] = useState(false);
  const [otherList, setOtherList] = useState<OtherBank[]>([
    { bank: "", account: "", settle: "", type: "" },
  ]);

  const [hasOblig, setHasOblig] = useState(false);
  const [obligAmount, setObligAmount] = useState("");

  const [salaryFile, setSalaryFile] = useState<File | null>(null);
  const [simahFile, setSimahFile] = useState<File | null>(null);
  const [najezFile, setNajezFile] = useState<File | null>(null);

  const [submitted, setSubmitted] = useState<{ id: string } | null>(null);

  const totalDebt = useMemo(() => {
    let t = settlementAmount || 0;
    if (hasAhli) t += ahliList.reduce((s, a) => s + (Number(a.settle) || 0), 0);
    if (hasOther) t += otherList.reduce((s, o) => s + (Number(o.settle) || 0), 0);
    if (hasOblig) t += Number(obligAmount) || 0;
    return t;
  }, [settlementAmount, hasAhli, ahliList, hasOther, otherList, hasOblig, obligAmount]);

  const reset = () => {
    setSalary("");
    setEmployer("");
    setRegion("");
    setCity("");
    setHasAhli(false);
    setAhliList([{ account: "", settle: "", type: "" }]);
    setHasOther(false);
    setOtherList([{ bank: "", account: "", settle: "", type: "" }]);
    setHasOblig(false);
    setObligAmount("");
    setSalaryFile(null);
    setSimahFile(null);
    setNajezFile(null);
    setSubmitted(null);
  };

  const handleSubmit = async () => {
    if (!salary || !employer || !region || !city) {
      toast.error("الرجاء استكمال البيانات الأساسية للعميل");
      return;
    }

    const refId = `TP-${Date.now().toString(36).toUpperCase()}`;
    setSubmitted({ id: refId });
    toast.success("تم إسناد العميل إلى طرف ثالث بنجاح برقم إسناد: " + refId);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent dir="rtl" className="max-w-lg max-h-[90vh] overflow-y-auto font-sans">
        <DialogHeader>
          <DialogTitle className="text-right text-[#133E35] font-bold">إسناد طرف ثالث للعميل</DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="size-12 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center mx-auto">
              <CheckCircle2 className="size-7" />
            </div>
            <div className="text-base font-bold text-foreground">تم إرسال طلب الإسناد بنجاح</div>
            <div className="text-xs text-muted-foreground">رقم الإسناد المرجعي: {submitted.id}</div>
            <Button onClick={() => onOpenChange(false)} className="mt-4 bg-[#133E35] hover:bg-[#234E45]">
              إغلاق
            </Button>
          </div>
        ) : (
          <div className="space-y-3 text-right">
            {/* بيانات العميل الأساسية */}
            <div className="grid grid-cols-2 gap-2">
              <ReadField label="اسم العميل" value={customerName} />
              <ReadField label="رقم الهوية" value={customerId} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">الراتب الشهري (SAR)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="0.00"
                  className="h-8 text-xs tabular-nums"
                />
              </div>
              <div>
                <Label className="text-xs">جهة العمل</Label>
                <Select value={employer} onValueChange={setEmployer}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="اختر جهة العمل" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    {EMPLOYERS.map((e) => (
                      <SelectItem key={e} value={e} className="text-xs">
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">المنطقة</Label>
                <Select
                  value={region}
                  onValueChange={(r) => {
                    setRegion(r);
                    setCity("");
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="اختر المنطقة" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    {REGION_NAMES.map((r) => (
                      <SelectItem key={r} value={r} className="text-xs">
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">المدينة</Label>
                <Select value={city} onValueChange={setCity} disabled={!region}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="اختر المدينة" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    {(KSA_REGIONS[region] || []).map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* مديونيات البنك الأهلي */}
            <Card className="p-2.5 space-y-2 border-[#e5e2dc]">
              <label className="flex items-center justify-between gap-2 cursor-pointer">
                <span className="text-xs font-medium text-[#133E35]">مديونيات أخرى لدى البنك الأهلي؟</span>
                <Switch checked={hasAhli} onCheckedChange={setHasAhli} />
              </label>
              {hasAhli && (
                <div className="space-y-2 pt-1">
                  {ahliList.map((a, i) => (
                    <div key={i} className="grid grid-cols-3 gap-1.5 items-center">
                      <Input
                        placeholder="رقم الحساب"
                        value={a.account}
                        onChange={(e) =>
                          setAhliList((p) =>
                            p.map((x, j) => (j === i ? { ...x, account: e.target.value } : x)),
                          )
                        }
                        className="h-8 text-xs"
                      />
                      <Input
                        placeholder="مبلغ التسوية"
                        type="number"
                        inputMode="decimal"
                        value={a.settle}
                        onChange={(e) =>
                          setAhliList((p) =>
                            p.map((x, j) => (j === i ? { ...x, settle: e.target.value } : x)),
                          )
                        }
                        className="h-8 text-xs tabular-nums"
                      />
                      <div className="flex gap-1">
                        <Input
                          placeholder="نوع المنتج"
                          value={a.type}
                          onChange={(e) =>
                            setAhliList((p) =>
                              p.map((x, j) => (j === i ? { ...x, type: e.target.value } : x)),
                            )
                          }
                          className="h-8 text-xs"
                        />
                        {ahliList.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => setAhliList((p) => p.filter((_, j) => j !== i))}
                          >
                            <Trash2 className="size-3 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px]"
                    onClick={() =>
                      setAhliList((p) => [...p, { account: "", settle: "", type: "" }])
                    }
                  >
                    <Plus className="size-3 ml-1" /> إضافة منتج
                  </Button>
                </div>
              )}
            </Card>

            {/* بنوك أخرى */}
            <Card className="p-2.5 space-y-2 border-[#e5e2dc]">
              <label className="flex items-center justify-between gap-2 cursor-pointer">
                <span className="text-xs font-medium text-[#133E35]">مديونيات لدى جهات تمويلية أخرى؟</span>
                <Switch checked={hasOther} onCheckedChange={setHasOther} />
              </label>
              {hasOther && (
                <div className="space-y-2 pt-1">
                  {otherList.map((o, i) => (
                    <div key={i} className="grid grid-cols-2 gap-1.5">
                      <Input
                        placeholder="اسم الجهة"
                        value={o.bank}
                        onChange={(e) =>
                          setOtherList((p) =>
                            p.map((x, j) => (j === i ? { ...x, bank: e.target.value } : x)),
                          )
                        }
                        className="h-8 text-xs"
                      />
                      <Input
                        placeholder="رقم الحساب"
                        value={o.account}
                        onChange={(e) =>
                          setOtherList((p) =>
                            p.map((x, j) => (j === i ? { ...x, account: e.target.value } : x)),
                          )
                        }
                        className="h-8 text-xs"
                      />
                      <Input
                        placeholder="مبلغ التسوية"
                        type="number"
                        inputMode="decimal"
                        value={o.settle}
                        onChange={(e) =>
                          setOtherList((p) =>
                            p.map((x, j) => (j === i ? { ...x, settle: e.target.value } : x)),
                          )
                        }
                        className="h-8 text-xs tabular-nums"
                      />
                      <div className="flex gap-1">
                        <Input
                          placeholder="نوع المنتج"
                          value={o.type}
                          onChange={(e) =>
                            setOtherList((p) =>
                              p.map((x, j) => (j === i ? { ...x, type: e.target.value } : x)),
                            )
                          }
                          className="h-8 text-xs"
                        />
                        {otherList.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => setOtherList((p) => p.filter((_, j) => j !== i))}
                          >
                            <Trash2 className="size-3 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px]"
                    onClick={() =>
                      setOtherList((p) => [...p, { bank: "", account: "", settle: "", type: "" }])
                    }
                  >
                    <Plus className="size-3 ml-1" /> إضافة جهة
                  </Button>
                </div>
              )}
            </Card>

            {/* التزامات */}
            <Card className="p-2.5 space-y-2 border-[#e5e2dc]">
              <label className="flex items-center justify-between gap-2 cursor-pointer">
                <span className="text-xs font-medium text-[#133E35]">التزامات وأقساط أخرى؟</span>
                <Switch checked={hasOblig} onCheckedChange={setHasOblig} />
              </label>
              {hasOblig && (
                <Input
                  placeholder="مبلغ الالتزام"
                  type="number"
                  inputMode="decimal"
                  value={obligAmount}
                  onChange={(e) => setObligAmount(e.target.value)}
                  className="h-8 text-xs tabular-nums"
                />
              )}
            </Card>

            <Card className="p-3 bg-[#133E35] text-white rounded-xl">
              <div className="text-[10px] text-white/80">إجمالي المديونيات المحتسبة على العميل</div>
              <div className="text-xl font-bold tabular-nums">{formatCurrency(totalDebt)} SAR</div>
            </Card>

            {/* المستندات */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#133E35]">المستندات المؤيدة</div>
              <FileField label="تعريف بالراتب حديث" file={salaryFile} onChange={setSalaryFile} />
              <FileField label="تقرير سمة الائتماني" file={simahFile} onChange={setSimahFile} />
              <FileField label="تقرير منصة ناجز" file={najezFile} onChange={setNajezFile} />
            </div>
          </div>
        )}

        {!submitted && (
          <DialogFooter className="mt-3">
            <Button onClick={handleSubmit} className="w-full bg-[#133E35] hover:bg-[#234E45] text-white">
              <Send className="size-4 ml-1.5" /> إرسال إسناد الطرف الثالث
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReadField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-[#e5e2dc] bg-[#fcfbfa] p-2 ${className || ""}`}>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-xs font-bold text-[#133E35] truncate">{value || "—"}</div>
    </div>
  );
}

function FileField({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2 rounded-xl border border-[#e5e2dc] p-2 cursor-pointer hover:bg-muted/40 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-medium text-[#133E35]">{label}</div>
        <div className="text-[10px] text-muted-foreground truncate">
          {file?.name || "لم يتم الإرفاق"}
        </div>
      </div>
      <input
        type="file"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
      <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-[#eeece7] text-[#133E35]">
        إرفاق ملف
      </span>
    </label>
  );
}
