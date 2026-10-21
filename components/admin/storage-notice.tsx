import { Database } from "lucide-react";

export function StorageNotice() {
  return (
    <div className="rounded-2xl border border-amber-300/60 bg-amber-50 p-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
      <div className="flex items-start gap-3">
        <Database className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <h2 className="text-sm font-medium">後台資料庫尚未設定</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-amber-800 dark:text-amber-200">
            本機版會使用 `.data/admin.json`。部署到 Vercel 前，請在環境變數加入
            `SUPABASE_URL` 與 `SUPABASE_SERVICE_ROLE_KEY`，並執行
            `supabase/schema.sql`。未設定時，公開表單仍可運作，但訂單不會在後台保存。
          </p>
        </div>
      </div>
    </div>
  );
}
