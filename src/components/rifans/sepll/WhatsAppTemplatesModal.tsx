import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Copy, Check, Sparkles, CheckCircle2 } from "lucide-react";
import {
  loadTemplates,
  saveTemplates,
  getDefaultTemplateId,
  setDefaultTemplateId,
  applyTemplateVars,
  WaTemplate,
} from "@/lib/wa-templates";
import { toast } from "sonner";

interface WhatsAppTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sampleClientName?: string;
}

export const WhatsAppTemplatesModal: React.FC<WhatsAppTemplatesModalProps> = ({
  open,
  onOpenChange,
  sampleClientName = "محمد عبدالله",
}) => {
  const [templates, setTemplates] = useState<WaTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string>("t1");
  const [collectorNameInput, setCollectorNameInput] = useState("");
  const [bodyInput, setBodyInput] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      const list = loadTemplates();
      setTemplates(list);
      const activeId = getDefaultTemplateId();
      setSelectedId(activeId);
      const active = list.find((t) => t.id === activeId) || list[0];
      if (active) {
        setCollectorNameInput(active.collectorName || "");
        setBodyInput(active.body || "");
      }
    }
  }, [open]);

  const currentTemplate = templates.find((t) => t.id === selectedId);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const t = templates.find((item) => item.id === id);
    if (t) {
      setCollectorNameInput(t.collectorName || "");
      setBodyInput(t.body || "");
    }
  };

  const handleSave = () => {
    const updated = templates.map((t) =>
      t.id === selectedId
        ? { ...t, collectorName: collectorNameInput, body: bodyInput }
        : t
    );
    setTemplates(updated);
    saveTemplates(updated);
    setDefaultTemplateId(selectedId);
    toast.success("تم حفظ وتعيين قالب الواتساب كقالب افتراضي");
  };

  const previewText = applyTemplateVars(bodyInput, {
    clientName: sampleClientName,
    collectorName: collectorNameInput || "المحصل المعتمد",
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(previewText);
    setCopied(true);
    toast.success("تم نسخ نص الرسالة إلى الحافظة");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-2xl font-sans text-right max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right text-[#133E35] font-bold flex items-center gap-2">
            <div className="size-8 rounded-xl bg-emerald-100 text-emerald-600 grid place-items-center">
              <MessageCircle className="size-4.5" />
            </div>
            <span>قوالب رسائل واتساب المخصصة</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template selector tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {templates.map((t) => {
              const isSelected = t.id === selectedId;
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelect(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border ${
                    isSelected
                      ? "bg-[#133E35] text-white border-[#133E35] shadow-sm"
                      : "bg-[#eeece7]/60 text-muted-foreground border-[#e5e2dc] hover:bg-[#eeece7]"
                  }`}
                >
                  {t.name}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#133E35] block mb-1">
                اسم المحصل / الموظف المسؤول
              </label>
              <Input
                value={collectorNameInput}
                onChange={(e) => setCollectorNameInput(e.target.value)}
                placeholder="أدخل اسم المحصل الذي سيظهر في الرسالة"
                className="h-8 text-xs bg-white border-[#e5e2dc]"
              />
            </div>
            <div className="flex items-end">
              <div className="text-[11px] text-muted-foreground p-2 rounded-xl bg-[#eeece7]/40 border border-[#e5e2dc] w-full">
                💡 يمكنك استخدام المتغيرات التلقائية: <br />
                <code className="text-[#0E8F4F] font-bold">[اسم العميل الأول]</code> أو{" "}
                <code className="text-[#0E8F4F] font-bold">[اسم المحصل]</code>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#133E35] block mb-1">
              نص القالب
            </label>
            <Textarea
              rows={8}
              value={bodyInput}
              onChange={(e) => setBodyInput(e.target.value)}
              className="text-xs font-mono leading-relaxed bg-white border-[#e5e2dc] p-3 rounded-xl custom-scrollbar"
              dir="rtl"
            />
          </div>

          {/* Live Preview */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-emerald-600" />
                معاينة الرسالة كما ستصل للعميل ({sampleClientName}):
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-7 text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-100"
              >
                {copied ? <Check className="size-3 ml-1 text-emerald-600" /> : <Copy className="size-3 ml-1" />}
                {copied ? "تم النسخ" : "نسخ النص"}
              </Button>
            </div>
            <div className="p-3 bg-white rounded-xl border border-emerald-100 text-xs leading-relaxed whitespace-pre-wrap text-foreground font-sans max-h-48 overflow-y-auto">
              {previewText}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 pt-3">
          <Button onClick={handleSave} className="bg-[#133E35] hover:bg-[#234E45] text-white flex-1">
            <CheckCircle2 className="size-4 ml-1.5" /> حفظ واعتماد كافتراضي
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
