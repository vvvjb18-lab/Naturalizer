export interface LegalSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalDocument {
  title: string;
  eyebrow: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
  contactTitle: string;
  contactText: string;
  contactCta: string;
  back: string;
}

const zhTerms: LegalDocument = {
  title: "服務條款",
  eyebrow: "法律文件",
  updated: "最後更新：2026 年 10 月 22 日",
  intro:
    "本條款適用於 Naturalizer 提供的學術文字修訂及相關服務。提交訂單或使用本網站，即表示你已閱讀並同意本條款及私隱政策。",
  sections: [
    {
      title: "1. 服務範圍",
      paragraphs: [
        "Naturalizer 提供人手文字修訂、校對、語氣調整及相關學術寫作建議。服務只處理你已完成的稿件，不包括代寫、代做、數據捏造或轉讓學術成果。",
        "我們可按情況拒絕不合理、違法、涉及抄襲或違反學術誠信的委託。",
      ],
    },
    {
      title: "2. 報價與確認",
      paragraphs: [
        "網站上的價格是按字數及所選時效計算的估算。首 600 字為 HK$85，其後按分層費率累進計算；急單附加費另計。最終價格、交期及修改範圍，以雙方在接單時確認的內容為準。",
        "如稿件長度、語言、格式或需求與原先申報不同，我們可重新報價。",
      ],
    },
    {
      title: "3. 交付與修改",
      paragraphs: [
        "標準服務包括一輪文字修訂。交付格式、方式和時間會於接單時確認；90／60／30 分鐘時效適用第 4 條的規則。",
        "如你要求在確認範圍以外額外修改，可能另行收費。因你延遲提供資料、稿件或回覆而造成的延誤，不視為我們違約。",
      ],
    },
    {
      title: "4. 時效、急單與補償",
      paragraphs: [
        "時效承諾只適用於已確認的急單。時鐘由以下三項全部齊備起計：付款確認、檔案可開啟、需求確認完成。任何一項未完成，時效不會起算。",
        "30 分鐘時效只限 600 字或以下。超過 600 字的 30 分鐘要求，只會按手動接單處理，不構成自動接受或承諾。",
        "急單（60／30 分鐘）超過目標時間 10 分鐘以上，我們會退還該訂單的全額急單附加費（HK$30／HK$60），並繼續交付服務。標準 90 分鐘超過目標時間，下一次訂單的急單附加費全免。",
        "上述補償是有關延誤的唯一補償安排，不影響你按香港法律享有的不可排除權利。",
      ],
    },
    {
      title: "5. 付款",
      paragraphs: [
        "現時付款方式為 Alipay HK。除另有書面安排外，我們會在確認稿件、價格及交期後開始工作。",
        "如未完成付款，我們可暫停或取消訂單。",
      ],
    },
    {
      title: "6. 取消與退款",
      paragraphs: [
        "退款安排會考慮實際工作量、已支付成本及雙方溝通紀錄。具體安排如下：",
      ],
      bullets: [
        "工作開始前取消：退還已付款項，扣除已產生的實際費用。",
        "工作開始後取消：按已完成的工作比例退款；如已接近完成，可能不設退款。",
        "交付後：已完成的人手服務不設退款。",
        "如我們因自身原因無法交付，會退還未提供服務部分的費用。",
      ],
    },
    {
      title: "7. 學術誠信",
      paragraphs: [
        "本服務是文字修訂，不是學術判斷或成績保證。你須確保提交的稿件由你本人完成，或已取得合法授權，並遵守所屬院校的學術誠信規則。",
        "我們不保證任何成績、錄取、發表結果或 AI 檢測工具的分數。",
      ],
    },
    {
      title: "8. Turnitin 與第三方報告",
      paragraphs: [
        "如訂單包含 Turnitin 報告，報告由第三方系統產生。Naturalizer 為獨立編輯服務，與 Turnitin LLC 並無官方關聯；Turnitin® 為 Turnitin LLC 的註冊商標。",
        "報告結果可能因帳戶設定、版本、文件格式及檢測時間而不同，僅供參考，不構成學術誠信的最終判定。",
      ],
    },
    {
      title: "9. 你的責任",
      bullets: [
        "確保你擁有提交稿件的權利，並對內容、引用及提交行為負責。",
        "保留原稿及備份；我們不會保證任何儲存或備份服務。",
        "不得提交違法、惡意或含病毒檔案，亦不得要求我們偽造資料或協助抄襲。",
      ],
    },
    {
      title: "10. 知識產權與保密",
      paragraphs: [
        "你保留原稿及最終修訂稿的權利。你授予我們一項有限許可，只為完成本次訂單而使用、複製及修改稿件。",
        "我們不會把客戶稿件公開或用於其他商業用途。團隊成員只在提供服務所需範圍內接觸文件，並受保密要求約束。",
      ],
    },
    {
      title: "11. 責任限制",
      paragraphs: [
        "在法律允許的最大範圍內，我們不就成績、學術處分、名譽、利潤或間接損失承擔責任。就每張訂單，我們的總責任不超過你為該訂單實際支付的金額。",
        "本條款不排除香港法律下不可排除的消費者權利。",
      ],
    },
    {
      title: "12. 個人資料",
      paragraphs: [
        "我們如何收集、使用、保留及刪除個人資料，請參閱私隱政策。",
      ],
    },
    {
      title: "13. 條款變更與適用法律",
      paragraphs: [
        "我們可能不時更新本條款，最新版本會刊載於本頁並更新日期。",
        "本條款受香港特別行政區法律管轄。爭議會先嘗試友好協商；如未能解決，交由香港具管轄權的法院處理。",
      ],
    },
  ],
  contactTitle: "聯絡我們",
  contactText:
    "如對服務範圍、報價或條款有疑問，請透過 Carousell 聯絡 @naturalizerplatform。",
  contactCta: "在 Carousell 聯絡我們",
  back: "返回首頁",
};

const enTerms: LegalDocument = {
  title: "Terms of Service",
  eyebrow: "Legal",
  updated: "Last updated: 22 October 2026",
  intro:
    "These terms apply to academic editing and related services provided by Naturalizer. By submitting an order or using this website, you confirm that you have read and agree to these terms and the Privacy Policy.",
  sections: [
    {
      title: "1. Scope of service",
      paragraphs: [
        "Naturalizer provides human editing, proofreading, tone adjustment, and related academic writing feedback. We edit drafts you have already written. We do not provide ghostwriting, complete assignments, fabricate data, or transfer academic work.",
        "We may decline a request that is unreasonable, unlawful, plagiarised, or inconsistent with academic integrity.",
      ],
    },
    {
      title: "2. Quotes and confirmation",
      paragraphs: [
        "Prices shown on the website are estimates based on word count and the selected turnaround. The first 600 words are HK$85; additional words are charged progressively by tier, and rush fees are added separately. The final price, turnaround, and revision scope are those confirmed when the order is accepted.",
        "We may re-quote if the length, language, format, or requirements differ from the original brief.",
      ],
    },
    {
      title: "3. Delivery and revisions",
      paragraphs: [
        "Standard service includes one round of editing. The file format, delivery method, and deadline are confirmed when the order is accepted. The rules in section 4 apply to 90-, 60-, and 30-minute turnarounds.",
        "Additional changes outside the agreed scope may be charged separately. Delays caused by late files, information, or responses from you are not treated as a breach by us.",
      ],
    },
    {
      title: "4. Turnaround, rush work, and compensation",
      paragraphs: [
        "A turnaround promise applies only to a confirmed rush order. The clock starts only when all three of the following are complete: payment is confirmed, the file can be opened, and the requirements are confirmed. If any one is missing, the clock does not start.",
        "The 30-minute turnaround is limited to 600 words or fewer. A 30-minute request above 600 words is handled through manual intake only and is not automatically accepted or promised.",
        "If a 60- or 30-minute rush order exceeds its target by more than 10 minutes, we refund the full rush fee for that order (HK$30 or HK$60) and still deliver the work. If a standard 90-minute order exceeds its target, the next order's rush fee is waived.",
        "This compensation is the sole remedy for the delay and does not affect consumer rights that cannot be excluded under Hong Kong law.",
      ],
    },
    {
      title: "5. Payment",
      paragraphs: [
        "The current payment method is Alipay HK. Unless agreed otherwise, work begins after the draft, price, and turnaround are confirmed.",
        "We may pause or cancel an order if payment is not completed.",
      ],
    },
    {
      title: "6. Cancellation and refunds",
      paragraphs: [
        "Refund decisions take into account the work performed, costs incurred, and the written communication between both parties:",
      ],
      bullets: [
        "Cancellation before work begins: paid fees are refunded less any actual costs already incurred.",
        "Cancellation after work begins: a partial refund may be offered based on the work completed; little or no refund may apply near completion.",
        "After delivery: completed human editing is non-refundable.",
        "If we cannot deliver for reasons within our control, unused fees are refunded.",
      ],
    },
    {
      title: "7. Academic integrity",
      paragraphs: [
        "This is an editing service, not an academic judgment or grade guarantee. You must ensure the draft is your own work or that you otherwise have permission to use it, and comply with your institution's academic integrity rules.",
        "We do not guarantee any grade, admission outcome, publication decision, or AI detector score.",
      ],
    },
    {
      title: "8. Turnitin and third-party reports",
      paragraphs: [
        "Where an order includes a Turnitin report, the report is produced by a third-party system. Naturalizer is an independent editing service and is not affiliated with Turnitin LLC; Turnitin® is a registered trademark of Turnitin LLC.",
        "Results may vary by account settings, version, file format, and timing. The report is for reference only and is not a final academic integrity determination.",
      ],
    },
    {
      title: "9. Your responsibilities",
      bullets: [
        "Confirm that you have the right to submit the draft and take responsibility for its content, citations, and submission.",
        "Keep your original file and backups; we do not provide a storage or backup service.",
        "Do not submit unlawful, malicious, or infected files, or ask us to fabricate information or assist with plagiarism.",
      ],
    },
    {
      title: "10. Intellectual property and confidentiality",
      paragraphs: [
        "You retain the rights to your original draft and final edited version. You grant us a limited licence to use, copy, and edit the draft solely to complete the order.",
        "We do not publish or reuse client drafts for other commercial purposes. Team members access files only as required to provide the service and are bound by confidentiality requirements.",
      ],
    },
    {
      title: "11. Limitation of liability",
      paragraphs: [
        "To the maximum extent permitted by law, we are not liable for grades, academic discipline, reputation, lost profits, or indirect losses. For each order, our total liability will not exceed the amount you paid for that order.",
        "Nothing in these terms excludes consumer rights that cannot be excluded under Hong Kong law.",
      ],
    },
    {
      title: "12. Personal data",
      paragraphs: [
        "Our collection, use, retention, and deletion of personal data are described in the Privacy Policy.",
      ],
    },
    {
      title: "13. Changes and governing law",
      paragraphs: [
        "We may update these terms from time to time. The latest version will appear on this page with a revised date.",
        "These terms are governed by the laws of the Hong Kong Special Administrative Region. We will first try to resolve any dispute amicably; otherwise, the courts of Hong Kong will have jurisdiction.",
      ],
    },
  ],
  contactTitle: "Contact",
  contactText:
    "If you have questions about scope, quotes, or these terms, contact @naturalizerplatform on Carousell.",
  contactCta: "Contact us on Carousell",
  back: "Back to home",
};

const zhPrivacy: LegalDocument = {
  title: "私隱政策",
  eyebrow: "法律文件",
  updated: "最後更新：2026 年 10 月 22 日",
  intro:
    "本政策說明 Naturalizer 如何處理你提供的個人資料和學術稿件。我們只收集提供服務所需的資料，不會出售你的個人資料。",
  sections: [
    {
      title: "1. 我們收集的資料",
      bullets: [
        "聯絡資料：姓名或稱呼、Email、WhatsApp、Carousell 用戶名。",
        "訂單資料：語言、字數、文件類型、交期、備註及報價。",
        "你提交的稿件、修改指示及雙方溝通紀錄。",
        "付款狀態或付款參考資料。我們不直接儲存完整的支付卡資料。",
        "基本的技術和裝置紀錄，例如存取時間及錯誤紀錄。",
      ],
    },
    {
      title: "2. 資料用途",
      paragraphs: [
        "我們會用這些資料回覆查詢、準備報價、完成修訂、交付文件、處理付款和售後問題，以及遵守法律要求。",
        "我們不會把你的稿件公開、出售，或用於與本次服務無關的宣傳。",
      ],
    },
    {
      title: "3. 文件處理與保留",
      paragraphs: [
        "你的稿件只供提供服務的團隊成員處理。存取權限會限制在完成訂單所需的範圍內。",
        "一般情況下，我們會在交付後 30 日內刪除工作副本。如訂單未完成、涉及退款爭議、法律要求或你要求保留，則可能保留較長時間。",
        "如訂單包含 Turnitin 報告，報告由第三方系統產生，第三方對資料的處理亦受其自身政策約束。",
      ],
    },
    {
      title: "4. 資料分享",
      paragraphs: [
        "我們不會出售你的個人資料。只在提供服務所需時，與以下類型的第三方分享必要資料：",
      ],
      bullets: [
        "提供 Turnitin AI 或相似度報告的第三方檢測服務。",
        "Alipay HK 或其他支付服務，用於確認付款。",
        "網站託管、檔案傳輸或表單自動化服務；如我們設定自動接單，訂單資料會傳送至該服務。",
        "法律、監管或執法機構，在法律要求範圍內。",
      ],
    },
    {
      title: "5. 安全",
      paragraphs: [
        "我們採取合理的存取控制和保密措施，但互聯網傳輸和儲存無法保證百分之百安全。如發現資料外洩，我們會按適用法律處理。",
      ],
    },
    {
      title: "6. Cookie 與本地儲存",
      paragraphs: [
        "本網站使用瀏覽器本地儲存記住語言和深色模式偏好。目前沒有加入廣告追蹤或第三方分析工具；如日後加入，會更新本政策。",
      ],
    },
    {
      title: "7. 你的權利",
      paragraphs: [
        "你可以要求查閱、更正或刪除我們持有的個人資料，或要求停止將資料用於某些用途。請透過 Carousell 聯絡我們；我們會核實身份後處理。",
      ],
    },
    {
      title: "8. 未成年人",
      paragraphs: [
        "本服務對象為 18 歲或以上人士。未滿 18 歲者應先取得家長或法定監護人同意，並由監護人協助處理訂單和付款。",
      ],
    },
    {
      title: "9. 政策更新",
      paragraphs: [
        "我們可能不時更新本政策，最新版本會刊載於本頁並更新日期。",
      ],
    },
  ],
  contactTitle: "私隱查詢",
  contactText:
    "如需查閱、更正或刪除資料，請透過 Carousell 聯絡 @naturalizerplatform。",
  contactCta: "在 Carousell 聯絡我們",
  back: "返回首頁",
};

const enPrivacy: LegalDocument = {
  title: "Privacy Policy",
  eyebrow: "Legal",
  updated: "Last updated: 22 October 2026",
  intro:
    "This policy explains how Naturalizer handles the personal data and academic drafts you provide. We collect only what is needed to provide the service and do not sell your personal data.",
  sections: [
    {
      title: "1. Data we collect",
      bullets: [
        "Contact details: your name or preferred name, email, WhatsApp, or Carousell username.",
        "Order details: language, word count, document type, deadline, notes, and quote.",
        "The draft you submit, your editing instructions, and our communication.",
        "Payment status or payment reference. We do not directly store full payment card details.",
        "Basic technical and device logs, such as access time and error records.",
      ],
    },
    {
      title: "2. How we use it",
      paragraphs: [
        "We use this data to respond to enquiries, prepare quotes, complete edits, deliver files, handle payment and after-sales issues, and meet legal requirements.",
        "We do not publish or sell your draft, or use it for marketing unrelated to the service.",
      ],
    },
    {
      title: "3. Draft handling and retention",
      paragraphs: [
        "Your draft is handled only by team members who need it to provide the service. Access is limited to what is necessary to complete the order.",
        "As a general rule, working copies are deleted within 30 days after delivery. We may retain data for longer if an order is incomplete, a refund is disputed, the law requires it, or you ask us to retain it.",
        "Where an order includes a Turnitin report, the report is generated by a third-party system and that provider's own policies also apply.",
      ],
    },
    {
      title: "4. Sharing",
      paragraphs: [
        "We do not sell your personal data. We share only what is necessary with:",
      ],
      bullets: [
        "Third-party detection services that provide Turnitin AI or similarity reports.",
        "Alipay HK or another payment provider to confirm payment.",
        "Website hosting, file transfer, or form automation providers; if automated order intake is enabled, order data is sent to that provider.",
        "Legal, regulatory, or law-enforcement authorities where required by law.",
      ],
    },
    {
      title: "5. Security",
      paragraphs: [
        "We use reasonable access controls and confidentiality measures, but no internet transmission or storage can be guaranteed completely secure. If a data breach occurs, we will respond in accordance with applicable law.",
      ],
    },
    {
      title: "6. Cookies and local storage",
      paragraphs: [
        "This website uses browser local storage to remember your language and dark-mode preferences. We currently do not use advertising trackers or third-party analytics. If that changes, this policy will be updated.",
      ],
    },
    {
      title: "7. Your rights",
      paragraphs: [
        "You may ask to access, correct, or delete the personal data we hold, or to stop certain uses. Contact us through Carousell; we will verify your identity before acting.",
      ],
    },
    {
      title: "8. Minors",
      paragraphs: [
        "The service is intended for people aged 18 or over. A person under 18 should obtain consent from a parent or legal guardian, who should assist with the order and payment.",
      ],
    },
    {
      title: "9. Changes",
      paragraphs: [
        "We may update this policy from time to time. The latest version will appear on this page with a revised date.",
      ],
    },
  ],
  contactTitle: "Privacy enquiries",
  contactText:
    "To access, correct, or delete your data, contact @naturalizerplatform on Carousell.",
  contactCta: "Contact us on Carousell",
  back: "Back to home",
};

export const termsContent = { zh: zhTerms, en: enTerms } as const;
export const privacyContent = { zh: zhPrivacy, en: enPrivacy } as const;
