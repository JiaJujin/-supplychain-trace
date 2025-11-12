import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
// ✅ 修复：shadcn/ui 默认提供的是 Toaster 组件，而不是 ToastProvider
// 如果你的项目使用 Sonner 版本，请改成：from "@/components/ui/sonner"
import { Toaster } from "@/components/ui/toaster";
import { Factory, Truck, ShieldCheck, Store, Box, TimerReset, Plus, ChevronRight } from "lucide-react";

// -------------------- Types --------------------
const STATES = ["Init", "Produced", "Collected", "Cleared", "Retail"] as const;
type State = typeof STATES[number];
type Role = "Manufacturer" | "Collector" | "Customs" | "Retailer";

type History = { from: State; to: State; by: Role; ts: number; note?: string };

type Batch = {
  id: string;
  status: State;
  items: string[];
  history: History[];
  metrics: { errors: number; startedAt: number | null; finishedAt: number | null };
};

// -------------------- Demo Data --------------------
const initialBatches: Batch[] = [
  {
    id: "BATCH-2025-001",
    status: "Cleared",
    items: ["MILK-0001", "MILK-0002", "MILK-0003"],
    history: [
      { from: "Init", to: "Produced", by: "Manufacturer", ts: 1731399900000 },
      { from: "Produced", to: "Collected", by: "Collector", ts: 1731400500000 },
      { from: "Collected", to: "Cleared", by: "Customs", ts: 1731400800000 },
    ],
    metrics: { errors: 0, startedAt: 1731399900000, finishedAt: null },
  },
];

// -------------------- FSM & Guards --------------------
const ALLOWED: Record<State, { next: State | null; role: Role | null }> = {
  Init: { next: "Produced", role: "Manufacturer" },
  Produced: { next: "Collected", role: "Collector" },
  Collected: { next: "Cleared", role: "Customs" },
  Cleared: { next: "Retail", role: "Retailer" },
  Retail: { next: null, role: null },
};

function progressFromState(s: State) {
  const idx = STATES.indexOf(s);
  return Math.round((idx / (STATES.length - 1)) * 100);
}

// Error codes
const ERR = {
  E001: (current: State, target: State) => ({ code: "E001 顺序错误", msg: `当前为 ${current}，不可直接到 ${target}` }),
  E002: (id: string) => ({ code: "E002 未注册", msg: `找不到产品/批次：${id}` }),
  E003: (need: Role, cur: Role) => ({ code: "E003 角色不匹配", msg: `需要 ${need}，当前为 ${cur}` }),
  E004: (ts: number) => ({ code: "E004 重复执行", msg: `本步骤已完成（${new Date(ts).toLocaleString()}）` }),
};

// -------------------- UI Helpers --------------------
function StateBadge({ s }: { s: State }) {
  const labelIcon: Record<State, React.ReactNode> = {
    Init: <Box className="h-3.5 w-3.5" />,
    Produced: <Factory className="h-3.5 w-3.5" />,
    Collected: <Truck className="h-3.5 w-3.5" />,
    Cleared: <ShieldCheck className="h-3.5 w-3.5" />,
    Retail: <Store className="h-3.5 w-3.5" />,
  };
  return (
    <Badge variant={s === "Retail" ? "default" : "secondary"} className="gap-1">
      {labelIcon[s]}
      {s}
    </Badge>
  );
}

function RoleSegment({ role, setRole }: { role: Role; setRole: (r: Role) => void }) {
  const roles: Role[] = ["Manufacturer", "Collector", "Customs", "Retailer"];
  return (
    <div className="flex items-center gap-2 w-full overflow-auto">
      {roles.map((r) => (
        <Button
          key={r}
          variant={r === role ? "default" : "secondary"}
          size="sm"
          className="rounded-full"
          onClick={() => setRole(r)}
        >
          {r}
        </Button>
      ))}
    </div>
  );
}

// -------------------- Main App --------------------
export default function App() {
  const [role, setRole] = useState<Role>("Manufacturer");
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [active, setActive] = useState<string>(batches[0]?.id ?? "");

  const current = useMemo(() => batches.find((b) => b.id === active), [batches, active]);

  const [error, setError] = useState<{ code: string; msg: string } | null>(null);
  const [openAction, setOpenAction] = useState(false);
  const [newBatchId, setNewBatchId] = useState("");

  function isRegistered(id: string) {
    return Boolean(batches.find((b) => b.id === id));
  }

  function writeHistory(id: string, h: History) {
    setBatches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, history: [...b.history, h] } : b))
    );
  }

  function setStatus(id: string, s: State) {
    setBatches((prev) => prev.map((b) => (b.id === id ? { ...b, status: s } : b)));
  }

  function getLastTs(id: string) {
    const b = batches.find((x) => x.id === id);
    const last = b?.history[b.history.length - 1];
    return last?.ts ?? Date.now();
  }

  function startTimer(id: string) {
    setBatches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, metrics: { ...b.metrics, startedAt: b.metrics.startedAt ?? Date.now() } } : b))
    );
  }

  function stopTimer(id: string) {
    setBatches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, metrics: { ...b.metrics, finishedAt: Date.now() } } : b))
    );
  }

  function transition(target: State) {
    if (!current) return;
    const id = current.id;
    if (!isRegistered(id)) return setError(ERR.E002(id));

    const allow = ALLOWED[current.status];
    if (!allow.next) return setError(ERR.E004(getLastTs(id)));
    if (target !== allow.next) return setError(ERR.E001(current.status, target));
    if (role !== allow.role) return setError(ERR.E003(allow.role as Role, role));

    const now = Date.now();
    writeHistory(id, { from: current.status, to: target, by: role, ts: now });
    setStatus(id, target);
    if (target === "Produced") startTimer(id);
    if (target === "Retail") stopTimer(id);
    setOpenAction(false);
  }

  function createBatch() {
    if (!newBatchId.trim()) return;
    if (isRegistered(newBatchId)) {
      setError({ code: "E002 未注册", msg: `批次已存在：${newBatchId}` });
      return;
    }
    const b: Batch = {
      id: newBatchId,
      status: "Init",
      items: [],
      history: [],
      metrics: { errors: 0, startedAt: null, finishedAt: null },
    };
    setBatches((prev) => [b, ...prev]);
    setActive(newBatchId);
    setNewBatchId("");
  }

  const leaderboard = useMemo(() => {
    const rows = batches
      .filter((b) => b.metrics.startedAt && b.metrics.finishedAt)
      .map((b) => ({ id: b.id, size: b.items.length, duration: (b.metrics.finishedAt! - b.metrics.startedAt!) / 1000 }))
      .sort((a, z) => a.duration - z.duration)
      .slice(0, 10);
    return rows;
  }, [batches]);

  const nextActionLabel = useMemo(() => {
    if (!current) return "";
    const allow = ALLOWED[current.status];
    return allow.next ? `推进到 ${allow.next}` : "已完成";
  }, [current]);

  return (
    // ✅ 移除 ToastProvider 包裹，改用 Toaster 独立组件
    <div className="mx-auto max-w-md p-3 pb-24 text-sm">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
        <div className="flex items-center justify-between gap-2">
          <RoleSegment role={role} setRole={setRole} />
          <Button variant="outline" size="icon" onClick={() => setActive(batches[0]?.id ?? "")}>
            <TimerReset className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Create Batch */}
      <Card className="mt-3">
        <CardHeader className="py-3">
          <CardTitle className="text-base">新建批次（Manufacturer 可见）</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input placeholder="如 BATCH-2025-002" value={newBatchId} onChange={(e) => setNewBatchId(e.target.value)} />
          <Button onClick={createBatch} className="whitespace-nowrap">
            <Plus className="mr-1 h-4 w-4" /> 新建
          </Button>
        </CardContent>
      </Card>

      {/* Batch List */}
      <div className="mt-4 grid gap-3">
        {batches.map((b) => (
          <Card key={b.id} className={`border ${active === b.id ? "ring-2 ring-primary" : ""}`} onClick={() => setActive(b.id)}>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{b.id}</CardTitle>
                <StateBadge s={b.status} />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex items-center gap-2">
                <Progress value={progressFromState(b.status)} className="h-2" />
                <span className="tabular-nums text-xs w-10 text-right">{progressFromState(b.status)}%</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <div>Items: {b.items.length}</div>
                <div>Steps: {b.history.length}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {current && (
        <Card className="mt-4">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">批次详情 · {current.id}</CardTitle>
              <div className="flex items-center gap-2">
                <StateBadge s={current.status} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="timeline">时间线</TabsTrigger>
                <TabsTrigger value="history">历史</TabsTrigger>
                <TabsTrigger value="products">产品</TabsTrigger>
              </TabsList>
              <TabsContent value="timeline" className="mt-3">
                <Timeline history={current.history} />
              </TabsContent>
              <TabsContent value="history" className="mt-3">
                <HistoryTable history={current.history} />
              </TabsContent>
              <TabsContent value="products" className="mt-3">
                <div className="text-muted-foreground">暂无产品数据（可扩展）。</div>
              </TabsContent>
            </Tabs>

            <Separator className="my-3" />
            <div className="flex gap-2">
              <Button className="flex-1" disabled={!ALLOWED[current.status].next} onClick={() => setOpenAction(true)}>
                {nextActionLabel}
                {ALLOWED[current.status].next && <ChevronRight className="ml-1 h-4 w-4" />}
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>排行榜</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard (simple) */}
      <Card className="mt-4">
        <CardHeader className="py-3">
          <CardTitle className="text-base">7 日最快记录（Top 10）</CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-sm text-muted-foreground">暂无记录</div>
          ) : (
            <ul className="space-y-2">
              {leaderboard.map((r, i) => (
                <li key={r.id} className="flex items-center justify-between text-sm">
                  <span className="tabular-nums">#{i + 1} · {r.id}</span>
                  <span className="tabular-nums">{r.duration.toFixed(1)}s · {r.size} items</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={openAction} onOpenChange={setOpenAction}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>执行动作</DialogTitle>
            <DialogDescription>仅允许符合门禁与顺序的下一步。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            {current && ALLOWED[current.status].next ? (
              <Button onClick={() => transition(ALLOWED[current.status].next as State)}>
                继续：{current.status} → {ALLOWED[current.status].next}
              </Button>
            ) : (
              <div className="text-sm text-muted-foreground">当前无可执行动作</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpenAction(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={!!error} onOpenChange={() => setError(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{error?.code}</DialogTitle>
            <DialogDescription>{error?.msg}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setError(null)}>我知道了</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ shadcn Toaster 渲染入口（可选，用于未来的轻量提示） */}
      <Toaster />
    </div>
  );
}

// -------------------- Timeline & History --------------------
function Timeline({ history }: { history: History[] }) {
  if (!history.length) return <div className="text-muted-foreground text-sm">暂无时间线</div>;
  return (
    <ol className="relative border-l pl-4 space-y-4">
      {history.map((h, i) => (
        <li key={i} className="ml-2">
          <div className="flex items-center gap-2">
            <StateBadge s={h.to} />
            <span className="text-xs text-muted-foreground">{new Date(h.ts).toLocaleString()}</span>
          </div>
          <div className="text-sm mt-1">{h.from} → {h.to} · {h.by}</div>
          {h.note && <div className="text-xs text-muted-foreground">{h.note}</div>}
        </li>
      ))}
    </ol>
  );
}

function HistoryTable({ history }: { history: History[] }) {
  if (!history.length) return <div className="text-muted-foreground text-sm">暂无历史</div>;
  return (
    <div className="text-xs w-full">
      <div className="grid grid-cols-4 font-medium mb-2">
        <div>From → To</div>
        <div>Role</div>
        <div>Time</div>
        <div>Note</div>
      </div>
      <div className="space-y-2">
        {history.map((h, i) => (
          <div key={i} className="grid grid-cols-4 items-center">
            <div className="truncate">{h.from} → {h.to}</div>
            <div>{h.by}</div>
            <div className="tabular-nums">{new Date(h.ts).toLocaleString()}</div>
            <div className="truncate">{h.note ?? "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------- 开发期自检（轻量“测试用例”） --------------------
// 说明：原项目没有测试，这里补充最小可运行自检，不影响 UI。
(function devSmokeTests() {
  try {
    const expect = (cond: boolean, name: string) => {
      if (!cond) throw new Error(`[TEST FAIL] ${name}`);
      console.debug(`[TEST OK] ${name}`);
    };

    // 1) 进度计算应当是 0/25/50/75/100
    expect(progressFromState("Init") === 0, "progress Init = 0");
    expect(progressFromState("Produced") === 25, "progress Produced = 25");
    expect(progressFromState("Collected") === 50, "progress Collected = 50");
    expect(progressFromState("Cleared") === 75, "progress Cleared = 75");
    expect(progressFromState("Retail") === 100, "progress Retail = 100");

    // 2) FSM 门禁映射存在
    (Object.keys(ALLOWED) as State[]).forEach((s) => {
      const allow = ALLOWED[s];
      // Retail 允许 next = null；其余应包含 role & next
      if (s !== "Retail") {
        expect(Boolean(allow.next), `${s} has next state`);
        expect(Boolean(allow.role), `${s} has role constraint`);
      }
    });
  } catch (e) {
    // 仅开发期输出，不打断运行
    console.warn(e);
  }
})();
