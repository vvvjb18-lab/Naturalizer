# naturalizer

以「真人學術寫作的量化剖面」為生成目標，使 AI 撰寫的 EAP / IAE 課程論文在 Turnitin AI 偵測中落到低分帶，同時不犧牲學術語域。

## 結果總覽（8 個真實 Turnitin 校準點）

| 文本 | is/are/千詞 | 語法錯誤/100詞 | Turnitin AI |
|---|---|---|---|
| 使用者 A+ 真人文（28.5/30） | 0.83 | ~2.4 | **0%** |
| v4.8（新題目，一次性按剖面寫成） | 4.37 | 1.6 | **0%** |
| v0.95（13 輪迭代） | 4.29 | 1.9 | 15% |
| v0.9 | 4.32 | 0.9 | 26% |
| v0.8 | 4.32 | 0 | 37% |
| R4.9（原版） | 5.93 | 0 | 41% |
| v1.2（乾淨散文＋大量錯誤） | 11.95 | 3.5 | 42% |
| v2.1（最平實清楚的一版） | 12.67 | 3.2 | 91% |

## v5.0 雙因子模型

1. **閘門 A（必要）**：`is/are/was/were` ≤ 6/千詞。超過 ~11 時，語法錯誤再多也無效。
2. **閘門 B（保護）**：正式語域語法錯誤 ≥ 1.5/100 詞（主謂、冠詞、介系詞、雙重標記，分散）。
3. 兩者皆過 → 0–15%；缺任一 → 26–91%。

## 研究結論（`analysis/FINDINGS.md`）

- 以 6,470 篇 pre-2021 人類文本（1,800 學習者作文＋4,670 期刊全文）校準 **169 個跨層特徵**。
- 我方稿件在文體空間中高度可辨（分類器 AUC 0.992–0.998），但**無法用回歸預測 Turnitin 分數**（留一誤差 33pp）。
- 特徵能做**門檻設計**（跨越邊界），不能做**排序預測**（飽和區內皆是噪聲）。
- 機制推論：此類偵測器學的是「像不像生成模型的輸出」，而非「像不像人」；乾淨、平實、組織良好的散文恰是現代 LLM 的稠密區。

## 專案結構

```
analysis/
  deep_features.py      169 特徵引擎（詞彙/依存句法/句尾段尾/篇章/資訊論）
  lm_features.py        GPT-2 驚訝度特徵
  factor_analysis.py    → factor_report.md, factor_rows.json
  ladder_check.py       逐篇對照 Turnitin 分數階梯
  classify.py           human-vs-AI 分類器 + Turnitin 預測檢驗
  features.py / compare.py   表面特徵與閘門（雙層：錨點區間＋大樣本軟參考）
  bulk_prep.py / plos_bulk.py / europepmc_bulk.py   語料建置
  FINDINGS.md           完整研究報告（含負面結果）
corpus/
  ai/                   我方稿件全部版本＋可提交 docx
  human/txt/            使用者 5 篇真人作業（錨點）
  passing/              已驗證 <20% 的通過樣本
docs/
  adversary_lessons.md  對競品流水線（20 次真實校準）的解構與拒絕理由
style_contract.md       風格契約（含全部校準點與 v5.0 規格）
turnitin_reports/       真實 Turnitin 報告 PDF（校準證據）
```

## 重建語料

```bash
python analysis/bulk_prep.py asap 3000      # ASAP 學生作文（僅參考）
python analysis/bulk_prep.py nucle         # NUCLE 學習者語料
python analysis/bulk_prep.py pelic 3000    # PELIC 學習者語料
python analysis/europepmc_bulk.py 4000     # Europe PMC pre-2021 全文
python analysis/plos_bulk.py 2000          # PLOS pre-2021 全文
```

## 使用流程（新文章）

1. 依 `style_contract.md` §13 的 v5.0 規格寫作（1,000–1,100 詞、6 段、引用真實）。
2. `python analysis/deep_features.py out.json <essay>.txt` 核對指標（尤其 is 密度 ≤5）。
3. `python analysis/compare.py <essay>.txt` 過表面閘門。
4. 最終稿以付費 Turnitin 檢測確認。

## 聲明

本專案為文體計量學與 AI 偵測器穩健性的研究。學術提交請遵守所屬機構的學術誠信規定。
