const zh = {
  common: {
    switchToEnglish: "Switch to English",
    switchToChinese: "切換至中文",
    switchToDark: "切換至深色模式",
    switchToLight: "切換至淺色模式",
    carousell: "Carousell",
    viewCarousell: "查看 Carousell",
    viewListing: "查看商品頁",
    whatsapp: "WhatsApp",
    whatsappCta: "在 WhatsApp 上向 Naturalizer 傳送訊息",
    whatsappShort: "WhatsApp 查詢",
    from: "起",
    payment: "付款：Alipay HK",
    included: "已包括",
    optional: "可選",
    required: "必填",
  },
  nav: {
    services: "服務",
    process: "流程",
    about: "關於",
    pricing: "定價",
    faq: "FAQ",
    cta: "立即報價",
    ctaShort: "報價",
    skip: "跳至主要內容 / Skip to content",
  },
  hero: {
    badge: "中英雙語 · 人手校對",
    titleA: "少一點 AI 味，",
    titleB: "多一點你自己。",
    description:
      "中英雙語學術論文自然化與人手修訂。我們逐句整理語氣與節奏，保留你的論點與引用，並附上修改後的 Turnitin AI 檢測報告。",
    primary: "取得即時報價",
    secondary: "查看定價",
    note: "≤600 字 HK$85 起 · 標準 90 分鐘 · 附 Turnitin AI 報告",
    previewLabel: "修訂示例",
    previewMeta: "600 字 · HK$85",
    beforeLabel: "修訂前",
    afterLabel: "修訂後",
    before:
      "本研究旨在透過對相關數據進行分析，以進一步探討影響使用者行為之各種因素。",
    after:
      "本研究分析相關數據，探討哪些因素影響使用者行為。",
    checks: ["人手逐句校對", "保留論點與引用", "附 Turnitin AI 報告", "Turnitin 不入庫"],
  },
  features: {
    eyebrow: "服務內容",
    title: "不是一鍵改寫，而是逐句整理。",
    description:
      "每一份稿件都由人手處理。我們改善語句的節奏與表達，同時保留你原本的論點、數據與引用。",
    items: [
      {
        title: "人手逐句修訂",
        description:
          "刪去冗餘與機械句式，調整語序和節奏，讓文字更自然、更清楚。",
      },
      {
        title: "保留學術內容",
        description:
          "不改動你的論點、數據與引用；只處理表達方式，讓原意更準確。",
      },
      {
        title: "中英雙語支援",
        description:
          "支援中文、英文及中英混合稿件，按不同語言的學術寫作習慣調整。",
      },
      {
        title: "Turnitin AI 報告",
        description:
          "交付修訂稿時附上修改後的 Turnitin AI 檢測報告。檢測使用 No Repository 設定，稿件不會被收錄至 Turnitin 資料庫。",
      },
    ],
  },
  process: {
    eyebrow: "下單流程",
    title: "三個步驟，少一點來回。",
    description:
      "報價與需求整理集中在同一頁；你也可以選擇到 Carousell 對話下單。",
    steps: [
      {
        title: "輸入字數，取得報價",
        description:
          "按字數即時估算，不需要先私訊問價。",
      },
      {
        title: "整理訂單與稿件",
        description:
          "填寫語言、文件類型、交期與聯絡方式，再提交訂單摘要。",
      },
      {
        title: "人手修訂與交付",
        description:
          "確認稿件及付款後開始修訂，交回修訂稿與 Turnitin AI 報告。",
      },
    ],
    note: "付款方式：Alipay HK。時效由付款確認、檔案可開啟及需求確認完成後起算。",
  },
  pricing: {
    eyebrow: "定價",
    title: "清楚、按字數分層的定價。",
    description:
      "首 600 字 HK$85；其後按超出字數分層計費，字數愈長，每字費率愈低。所有價格以港幣為單位。",
    estimateLabel: "即時字數估算",
    carousellLink: "在 Carousell 查看商品",
    turnitinNote:
      "Turnitin 檢測使用 No Repository 設定，提交的稿件不會被收錄至 Turnitin 資料庫；報告只作第三方參考。",
    rangeHeader: "字數區間",
    rateHeader: "費率",
    tiers: [
      { range: "≤600 字", rate: "HK$85", note: "起價 / 錨點" },
      { range: "601–1,200 字", rate: "超出部分 $0.08/字", note: "" },
      { range: "1,201–1,800 字", rate: "超出部分 $0.07/字", note: "" },
      { range: "1,801 字以上", rate: "超出部分 $0.06/字", note: "" },
    ],
    examplesLabel: "估價例子",
    examples: [
      { words: "600 字", amount: "HK$85" },
      { words: "1,200 字", amount: "HK$133" },
      { words: "3,000 字", amount: "HK$247" },
    ],
    cta: "立即報價",
    note: "分層費率按超出 600 字的部分累進計算，總額以港幣計算。急單附加費另計；最終安排以確認稿件及需求為準。",
    rushTitle: "三檔時效",
    rushDescription:
      "附加費用於預留時段，不是結果保證。時效由起算點三者齊備後開始計算。",
    rushColumns: {
      tier: "時效",
      time: "交付目標",
      fee: "附加費",
      note: "適用範圍",
    },
    rushRows: [
      {
        tier: "標準",
        time: "90 分鐘",
        fee: "+HK$0",
        note: "大部分訂單",
      },
      {
        tier: "中急",
        time: "60 分鐘",
        fee: "+HK$30",
        note: "需視乎檔期",
      },
      {
        tier: "特急",
        time: "30 分鐘",
        fee: "+HK$60",
        note: "只限 ≤600 字或手動接單",
      },
    ],
    manualNote:
      "30 分鐘檔如超過 600 字，請透過 WhatsApp 查詢手動接單安排；我們不會自動接受或承諾時效。",
  },
  trust: {
    eyebrow: "關於我們",
    title: "把服務說清楚，才值得把文字交給你。",
    description:
      "Naturalizer 專注中英雙語學術文字修訂。每份訂單會按確認的字數、語言及交期處理，交付前由團隊成員進行人手審閱。",
    items: [
      {
        title: "人手審閱",
        description:
          "每份修訂在交付前由團隊成員檢查，確保內容與格式符合確認範圍。",
      },
      {
        title: "先確認報價與範圍",
        description:
          "按字數計算，開工前確認價格、交期及修改輪次。",
      },
      {
        title: "文件保密",
        description:
          "只由完成訂單所需的團隊成員接觸，交付後按私隱政策處理及刪除工作副本。",
      },
      {
        title: "不誤導的承諾",
        description:
          "不代寫，不保證成績、錄取或任何 AI 檢測分數；Turnitin 報告只作第三方參考。",
      },
    ],
    note: "服務範圍、退款及資料處理，請參閱",
    terms: "服務條款",
    privacy: "私隱政策",
    and: "及",
  },
  whyDirect: {
    eyebrow: "為何在官網下單",
    title: "問價、整理需求、下單，一次完成。",
    description:
      "Carousell 適合對話；官網適合快速整理需求。你可以選擇自己習慣的方式下單。",
    items: [
      {
        title: "即時知道預算",
        description:
          "輸入字數立即看到估算，不需要先等回覆。",
      },
      {
        title: "一次交代清楚",
        description:
          "語言、文件類型、字數、交期與聯絡方式，全部整理在同一份訂單。",
      },
      {
        title: "保留 Carousell 選項",
        description:
          "想用平台對話或查看商品，也可以一鍵跳轉。",
      },
    ],
    comparisonTitle: "兩個下單入口，選你習慣的方式。",
    comparisonBadge: "選你習慣的方式",
    directLabel: "Naturalizer 官網",
    directDescription: "即時報價 · 結構化訂單",
    carousellLabel: "Carousell",
    carousellDescription: "商品頁 · 對話下單",
  },
  order: {
    eyebrow: "即時報價",
    title: "先看清楚價錢，再交稿。",
    description:
      "輸入字數，立即看到估算；可選 90／60／30 分鐘時效。提交後會建立訂單摘要，下一步再把原稿交給我們。",
    bullets: [
      "不需要先註冊",
      "即時按字數報價",
      "三檔急單時效",
      "付款：Alipay HK",
    ],
    carousellTitle: "比較想在 Carousell 處理？",
    carousellDescription:
      "想看商品頁或使用平台對話，也可以直接前往。",
    carousellCta: "前往 Carousell 商品頁",
    formTitle: "建立訂單",
    formDescription: "填寫基本資料後，你會取得一份可保存的訂單摘要。",
    fields: {
      name: "稱呼",
      namePlaceholder: "你的名字或暱稱",
      contact: "聯絡方式",
      contactPlaceholder: "Email、WhatsApp 或 Carousell 用戶名",
      contactHint: "只用於確認訂單，不會公開。",
      language: "稿件語言",
      languageOptions: ["中文", "English", "中英雙語"],
      documentType: "文件類型",
      documentOptions: ["Essay", "畢業論文／章節", "Abstract", "其他"],
      rush: "時效",
      rushOptions: ["標準 90 分鐘", "中急 60 分鐘", "特急 30 分鐘"],
      rushHint: "30 分鐘只限 ≤600 字；超過者需手動接單。",
      words: "字數",
      wordsPlaceholder: "例如 600",
      wordsHint: "以文書軟件的字數統計為準。",
      deadline: "希望交稿日期",
      notes: "補充說明",
      notesPlaceholder:
        "例如：只修訂第 2 章、保留特定術語、需要中英雙語對照……",
      consent:
        "我確認稿件由本人撰寫，並理解此服務只提供文字修訂，不保證任何 AI 檢測結果。",
      legalPrefix: "提交即表示你同意",
      termsLink: "服務條款",
      privacyLink: "私隱政策",
      and: "及",
    },
    quote: {
      title: "你的估算",
      words: "字數",
      wordSuffix: "字",
      baseAmount: "字數費用",
      rushFee: "急單附加費",
      total: "估算總額",
      empty: "輸入字數後顯示報價",
      rushLabel: "時效",
      urgentBlocked:
        "30 分鐘時效只限 600 字或以下。請改選 60／90 分鐘，或透過 WhatsApp 手動接單。",
      includedNote: "已包括首 600 字",
      id: "報價編號",
      saving: "建立報價編號…",
      saveError: "未能建立報價編號；仍可複製即時估算。",
      saveNote: "報價編號保存在此瀏覽器。",
      copy: "複製報價摘要",
      copied: "已複製",
      note: "價格按分層累進計算；急單附加費另計。時效由付款確認、檔案可開啟及需求確認完成三者齊備後起算。",
    },
    submit: "建立訂單",
    submitting: "正在整理訂單…",
    errors: {
      name: "請填寫稱呼。",
      contact: "請填寫聯絡方式。",
      words: "請輸入有效字數。",
      rush: "30 分鐘時效只限 600 字或以下，請改選 60／90 分鐘或手動接單。",
      consent: "請先確認服務條款。",
      network: "未能提交訂單，請稍後再試或直接前往 WhatsApp／Carousell。",
    },
    success: {
      handoffTitle: "訂單摘要已建立",
      receivedTitle: "訂單已送出",
      handoffText:
        "請將訂單編號及原稿透過 WhatsApp 或 Carousell 傳送給我們。我們確認稿件與交期後，才會安排付款與修訂。",
      receivedText:
        "我們已收到你的需求，會透過你提供的聯絡方式確認稿件、交期與付款安排。",
      orderId: "訂單編號",
      quote: "估算總額",
      words: "字數",
      rush: "時效",
      rushFee: "急單附加費",
      copy: "複製訂單摘要",
      copied: "已複製",
      carousell: "前往 Carousell 對話",
      whatsapp: "在 WhatsApp 傳送訂單",
      reset: "建立另一張訂單",
      next: "下一步",
      nextText:
        "先複製訂單摘要，再透過 WhatsApp 或 Carousell 傳送，並附上原稿檔案。",
    },
  },
  faq: {
    eyebrow: "FAQ",
    title: "下單前，你可能想知道。",
    description: "價格、AI 檢測、交稿與付款的常見問題。",
    contactPrompt: "還有其他問題？",
    contactLink: "在 Carousell 對話",
    items: [
      {
        question: "報價如何計算？",
        answer:
          "首 600 字為 HK$85。601–1,200 字，超出 600 字的部分每字 HK$0.08；1,201–1,800 字，該段每字 HK$0.07；1,801 字以上，該段每字 HK$0.06。分層按超出部分累進計算，急單附加費另計。",
      },
      {
        question: "有哪幾檔急單？",
        answer:
          "標準 90 分鐘不另收費；中急 60 分鐘加 HK$30；特急 30 分鐘加 HK$60。30 分鐘檔只限 600 字或以下，超過 600 字需改為手動接單。",
      },
      {
        question: "時效承諾何時開始計算？",
        answer:
          "付款確認、檔案可開啟、需求確認完成，三者齊備才開始計時。任何一項未完成，時鐘不會起算；因客戶延遲提供檔案或回覆而失去的時間，不計入時效。",
      },
      {
        question: "30 分鐘可以處理超過 600 字嗎？",
        answer:
          "不可以自動承接。30 分鐘檔只限 600 字或以下；超過 600 字一律改為手動接單，由我們確認檔期後另行回覆，不會自動承諾 30 分鐘交付。",
      },
      {
        question: "超時會怎樣補償？",
        answer:
          "急單（60／30 分鐘）超時超過 10 分鐘，會退還該單全額急單附加費（HK$30／HK$60），服務仍會交付。標準 90 分鐘超時，下次急單附加費全免。補償只限附加費，不包括成績、AI 檢測結果或其他間接損失。",
      },
      {
        question: "可以只修訂部分段落嗎？",
        answer:
          "可以。你可以指定章節或段落，我們只處理你交來的範圍；報價按實際字數計算。",
      },
      {
        question: "會保證降低 AI 檢測率嗎？",
        answer:
          "不會保證任何檢測器分數。我們透過人手修訂減少機械句式、改善節奏與表達，並附上修改後的 Turnitin AI 報告供你參考。不同工具、版本與取樣方式都可能得出不同結果。",
      },
      {
        question: "Turnitin 報告會把稿件收錄入庫嗎？",
        answer:
          "不會。我們使用 No Repository 設定，提交的稿件不會被收錄至 Turnitin 資料庫；報告只作第三方參考，實際設定及報告內容以 Turnitin 為準。",
      },
      {
        question: "你們會代寫嗎？",
        answer:
          "不會。這是文字修訂服務，你需要提供自己完成的草稿，並對內容與引用負責。",
      },
      {
        question: "支援甚麼文件與語言？",
        answer:
          "支援中文、英文及中英雙語的 Essay、論文章節、Abstract、報告等。我們不會任意改動你的學術引用與格式。",
      },
      {
        question: "如何付款及交稿？",
        answer:
          "確認稿件、字數與交期後，以 Alipay HK 付款。交稿方式與時間會於接單時一併確認。",
      },
      {
        question: "我的稿件會保密嗎？",
        answer:
          "稿件只用於本次修訂，不會公開或用於其他用途。如需在交稿後刪除副本，可以向我們提出。",
      },
    ],
  },
  cta: {
    eyebrow: "準備好交稿？",
    title: "把草稿交給我們，保留你自己的聲音。",
    description:
      "先取得即時報價，或直接到 Carousell 與我們對話。",
    primary: "立即取得報價",
    secondary: "在 WhatsApp 查詢",
    note: "≤600 字 HK$85 起 · 標準 90 分鐘 · 附 Turnitin AI 報告",
  },
  footer: {
    tagline: "中英雙語學術論文自然化與人手修訂。",
    services: "服務",
    about: "關於我們",
    pricing: "定價",
    order: "下單",
    faq: "FAQ",
    contact: "聯絡",
    terms: "服務條款",
    privacy: "私隱政策",
    carousell: "Carousell 商品頁",
    seller: "Carousell 賣家",
    payment: "付款",
    paymentValue: "Alipay HK",
    disclaimer:
      "Naturalizer 為獨立人手編輯服務，與 Turnitin LLC 無官方關聯。本服務只提供文字修訂，不提供代寫，亦不保證任何成績、學術結果或 AI 檢測器結果。Turnitin 為 Turnitin LLC 的註冊商標。",
    serviceRulesTitle: "服務時效與補償",
    serviceRules: [
      {
        title: "起算點",
        body:
          "付款確認、檔案可開啟、需求確認完成，三者齊備才開始計時。任何一項未完成，時鐘不會起算。",
      },
      {
        title: "30 分鐘檔限制",
        body:
          "30 分鐘時效只限 ≤600 字；超過 600 字一律改為手動接單，不自動承諾 30 分鐘交付。",
      },
      {
        title: "超時補償",
        body:
          "急單（60／30 分鐘）超時超過 10 分鐘，退還該單全額急單附加費（HK$30／HK$60），服務仍會交付。標準 90 分鐘超時，下次急單附加費全免。",
      },
      {
        title: "不承諾結果",
        body:
          "不承諾任何分數、AI 檢測率或學術結果；Turnitin 報告只作第三方參考。",
      },
    ],
    copyright: "Naturalizer. All rights reserved.",
  },
};

export type Dictionary = typeof zh;

const en: Dictionary = {
  common: {
    switchToEnglish: "Switch to English",
    switchToChinese: "Switch to Chinese",
    switchToDark: "Switch to dark mode",
    switchToLight: "Switch to light mode",
    carousell: "Carousell",
    viewCarousell: "View on Carousell",
    viewListing: "View listing",
    whatsapp: "WhatsApp",
    whatsappCta: "Message Naturalizer on WhatsApp",
    whatsappShort: "Chat on WhatsApp",
    from: "from",
    payment: "Payment: Alipay HK",
    included: "Included",
    optional: "Optional",
    required: "Required",
  },
  nav: {
    services: "Service",
    process: "Process",
    about: "About",
    pricing: "Pricing",
    faq: "FAQ",
    cta: "Get a quote",
    ctaShort: "Quote",
    skip: "Skip to content / 跳至主要內容",
  },
  hero: {
    badge: "Chinese & English · Human-reviewed",
    titleA: "Less AI. More you.",
    titleB: "Writing that still sounds like yours.",
    description:
      "Human-reviewed academic editing for Chinese, English, and bilingual drafts. We refine rhythm and tone, keep your argument and citations intact, and include a post-revision Turnitin AI report.",
    primary: "Get an instant quote",
    secondary: "See pricing",
    note: "From HK$85 for 600 words · Standard 90-minute turnaround · Turnitin AI report included",
    previewLabel: "Revision sample",
    previewMeta: "600 words · HK$85",
    beforeLabel: "Before",
    afterLabel: "After",
    before:
      "The present study was conducted for the purpose of analysing the relevant data in order to further investigate the various factors that influence user behaviour.",
    after:
      "This study analyses the data to examine which factors shape user behaviour.",
    checks: [
      "Human-reviewed line by line",
      "Argument and citations preserved",
      "Turnitin AI report included",
      "Not stored in Turnitin",
    ],
  },
  features: {
    eyebrow: "What we do",
    title: "A careful edit, not a one-click rewrite.",
    description:
      "Every draft is reviewed by a person. We improve rhythm and clarity while preserving your argument, data, and citations.",
    items: [
      {
        title: "Edited line by line",
        description:
          "We remove filler and mechanical phrasing, then adjust word order and rhythm so the writing sounds natural and clear.",
      },
      {
        title: "Your research stays intact",
        description:
          "Your claims, data, and citations stay in place. We work on expression, not the substance of your argument.",
      },
      {
        title: "Chinese and English",
        description:
          "We support Chinese, English, and mixed-language drafts, adapting to the conventions of each academic culture.",
      },
      {
        title: "Turnitin AI report",
        description:
          "Every revised draft includes a post-revision Turnitin AI report. Checks use a No Repository setting, so submissions are not added to the Turnitin database.",
      },
    ],
  },
  process: {
    eyebrow: "How it works",
    title: "Three steps. Fewer back-and-forths.",
    description:
      "Quote and brief in one place, or choose to order through Carousell chat.",
    steps: [
      {
        title: "Enter your word count",
        description:
          "See an instant estimate from your word count. No need to message for a price first.",
      },
      {
        title: "Build your brief",
        description:
          "Add language, document type, deadline, and contact details to create one complete order summary.",
      },
      {
        title: "Human edit and delivery",
        description:
          "Once the draft and payment are confirmed, we edit it and return the revised file with a Turnitin AI report.",
      },
    ],
    note: "Payment by Alipay HK. The turnaround clock starts once payment, an openable file, and the requirements are all confirmed.",
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Clear pricing, tiered by word count.",
    description:
      "The first 600 words are HK$85. Additional words are charged in declining tiers, so the per-word rate falls as the draft gets longer. All prices are in Hong Kong dollars.",
    estimateLabel: "Instant word-count estimate",
    carousellLink: "View on Carousell",
    turnitinNote:
      "Turnitin checks use a No Repository setting, so submitted drafts are not added to the Turnitin database. Reports are third-party references.",
    rangeHeader: "Word range",
    rateHeader: "Rate",
    tiers: [
      { range: "Up to 600 words", rate: "HK$85", note: "Base price / anchor" },
      { range: "601–1,200 words", rate: "$0.08 per extra word", note: "" },
      { range: "1,201–1,800 words", rate: "$0.07 per extra word", note: "" },
      { range: "1,801+ words", rate: "$0.06 per extra word", note: "" },
    ],
    examplesLabel: "Quote examples",
    examples: [
      { words: "600 words", amount: "HK$85" },
      { words: "1,200 words", amount: "HK$133" },
      { words: "3,000 words", amount: "HK$247" },
    ],
    cta: "Get a quote",
    note: "Tiered rates apply progressively to words above 600. Rush fees are added separately. Final arrangements are confirmed once the draft and requirements are agreed.",
    rushTitle: "Three turnaround options",
    rushDescription:
      "The fee reserves a time slot; it is not a guarantee of any result. Time starts when all three start conditions are met.",
    rushColumns: {
      tier: "Option",
      time: "Target",
      fee: "Rush fee",
      note: "Availability",
    },
    rushRows: [
      {
        tier: "Standard",
        time: "90 minutes",
        fee: "+HK$0",
        note: "Most orders",
      },
      {
        tier: "Priority",
        time: "60 minutes",
        fee: "+HK$30",
        note: "Subject to capacity",
      },
      {
        tier: "Urgent",
        time: "30 minutes",
        fee: "+HK$60",
        note: "600 words or fewer, or manual intake",
      },
    ],
    manualNote:
      "For a 30-minute request above 600 words, contact us on WhatsApp for manual intake. We will not automatically accept the order or promise the turnaround.",
  },
  trust: {
    eyebrow: "About us",
    title: "A clear service, before we touch your draft.",
    description:
      "Naturalizer focuses on academic editing in Chinese and English. Every order is handled within the agreed word count, language, and deadline, with human review before delivery.",
    items: [
      {
        title: "Human review",
        description:
          "A team member checks every revision before delivery to confirm it matches the agreed scope.",
      },
      {
        title: "Confirm the quote and scope",
        description:
          "Pricing is based on word count; price, turnaround, and revision rounds are confirmed before work begins.",
      },
      {
        title: "Confidential handling",
        description:
          "Only team members needed for the order access your file. Working copies are handled and deleted under the privacy policy.",
      },
      {
        title: "No misleading promises",
        description:
          "We do not ghostwrite, guarantee grades, admission outcomes, or AI detector scores. Turnitin reports are third-party references.",
      },
    ],
    note: "For scope, refunds, and data handling, see the",
    terms: "Terms",
    privacy: "Privacy Policy",
    and: "and",
  },
  whyDirect: {
    eyebrow: "Why order here",
    title: "Quote, brief, and order in one pass.",
    description:
      "Carousell is built for conversation. This site is built for putting a complete brief together quickly. Choose whichever way you prefer to order.",
    items: [
      {
        title: "Know the budget now",
        description:
          "Enter a word count and see an instant estimate, without waiting for a reply.",
      },
      {
        title: "One complete brief",
        description:
          "Language, document type, word count, deadline, and contact details all live in one order summary.",
      },
      {
        title: "Carousell is still there",
        description:
          "If you prefer platform chat or the listing page, jump across in one click.",
      },
    ],
    comparisonTitle: "Two ways to order. Choose your channel.",
    comparisonBadge: "Choose your channel",
    directLabel: "Naturalizer website",
    directDescription: "Instant quote · Structured brief",
    carousellLabel: "Carousell",
    carousellDescription: "Listing page · Chat to order",
  },
  order: {
    eyebrow: "Instant quote",
    title: "See the price before you send a draft.",
    description:
      "Enter your word count for an estimate and choose a 90-, 60-, or 30-minute turnaround. Submitting creates an order summary; you send the draft in the next step.",
    bullets: [
      "No account needed",
      "Instant word-count estimate",
      "Three rush turnaround options",
      "Payment by Alipay HK",
    ],
    carousellTitle: "Prefer to handle it on Carousell?",
    carousellDescription:
      "View the listing or use platform chat if that is easier for you.",
    carousellCta: "Open the Carousell listing",
    formTitle: "Build your order",
    formDescription:
      "Add a few details and you will get an order summary you can keep.",
    fields: {
      name: "Name",
      namePlaceholder: "Your name or preferred name",
      contact: "Contact",
      contactPlaceholder: "Email, WhatsApp, or Carousell username",
      contactHint: "Used only to confirm your order. Never published.",
      language: "Draft language",
      languageOptions: ["Chinese", "English", "Bilingual"],
      documentType: "Document type",
      documentOptions: ["Essay", "Thesis / chapter", "Abstract", "Other"],
      rush: "Turnaround",
      rushOptions: ["Standard 90 minutes", "Priority 60 minutes", "Urgent 30 minutes"],
      rushHint:
        "The 30-minute option is limited to 600 words or fewer; longer drafts require manual intake.",
      words: "Word count",
      wordsPlaceholder: "e.g. 600",
      wordsHint: "Use the word count from your writing app.",
      deadline: "Preferred delivery date",
      notes: "Notes",
      notesPlaceholder:
        "For example: only revise chapter 2, keep specific terminology, or provide a bilingual version…",
      consent:
        "I confirm this draft is my own work and understand this is an editing service that cannot guarantee any AI detector result.",
      legalPrefix: "By submitting, you agree to the",
      termsLink: "Terms",
      privacyLink: "Privacy Policy",
      and: "and",
    },
    quote: {
      title: "Your estimate",
      words: "Words",
      wordSuffix: "words",
      baseAmount: "Word-count fee",
      rushFee: "Rush fee",
      total: "Estimated total",
      empty: "Enter a word count to see your quote",
      rushLabel: "Turnaround",
      urgentBlocked:
        "The 30-minute option is limited to 600 words or fewer. Choose 60 or 90 minutes, or contact us on WhatsApp for manual intake.",
      includedNote: "Includes the first 600 words",
      id: "Quote ID",
      saving: "Creating quote ID…",
      saveError: "Could not create a quote ID; you can still copy the estimate.",
      saveNote: "The quote ID is saved in this browser.",
      copy: "Copy quote summary",
      copied: "Copied",
      note: "Tiered rates apply progressively; rush fees are added separately. The turnaround clock starts once payment, an openable file, and the requirements are all confirmed.",
    },
    submit: "Create order summary",
    submitting: "Preparing your order…",
    errors: {
      name: "Please add your name.",
      contact: "Please add a contact method.",
      words: "Please enter a valid word count.",
      rush:
        "The 30-minute option is limited to 600 words or fewer. Choose 60 or 90 minutes, or contact us for manual intake.",
      consent: "Please confirm the service terms first.",
      network:
        "We could not submit the order. Please try again or continue on WhatsApp or Carousell.",
    },
    success: {
      handoffTitle: "Your order summary is ready",
      receivedTitle: "Order received",
      handoffText:
        "Send your order number and draft to us through WhatsApp or Carousell. We will confirm the draft, turnaround, and payment before any work begins.",
      receivedText:
        "We have received your request and will use your contact details to confirm the draft, turnaround, and payment.",
      orderId: "Order number",
      quote: "Estimated total",
      words: "Word count",
      rush: "Turnaround",
      rushFee: "Rush fee",
      copy: "Copy order summary",
      copied: "Copied",
      carousell: "Continue on Carousell",
      whatsapp: "Send order on WhatsApp",
      reset: "Create another order",
      next: "Next step",
      nextText:
        "Copy the summary, send it through WhatsApp or Carousell, and attach your draft.",
    },
  },
  faq: {
    eyebrow: "FAQ",
    title: "What to know before ordering.",
    description: "Pricing, AI detection, delivery, and payment.",
    contactPrompt: "Still have a question?",
    contactLink: "Chat on Carousell",
    items: [
      {
        question: "How is the quote calculated?",
        answer:
          "The first 600 words are HK$85. Words 601–1,200 cost HK$0.08 each; words 1,201–1,800 cost HK$0.07 each; words 1,801 and above cost HK$0.06 each. The tiers apply progressively to the words above 600, and rush fees are added separately.",
      },
      {
        question: "What rush options are available?",
        answer:
          "Standard 90-minute turnaround has no extra fee. Priority 60 minutes adds HK$30. Urgent 30 minutes adds HK$60. The 30-minute option is limited to 600 words or fewer; longer drafts require manual intake.",
      },
      {
        question: "When does the turnaround clock start?",
        answer:
          "Only when payment is confirmed, the file opens, and the requirements are confirmed. If any one of the three is missing, the clock does not start. Time lost to late files or replies from the customer does not count toward the turnaround.",
      },
      {
        question: "Can you handle more than 600 words in 30 minutes?",
        answer:
          "We do not automatically accept that. The 30-minute option is limited to 600 words or fewer. Longer drafts move to manual intake, and we confirm capacity separately; a 30-minute delivery is not automatically promised.",
      },
      {
        question: "What happens if a rush order is late?",
        answer:
          "If a 60- or 30-minute rush order is more than 10 minutes late, the full rush fee (HK$30 or HK$60) is refunded and the work is still delivered. If a standard 90-minute order is late, the next rush fee is waived. Compensation is limited to the rush fee and does not cover grades, AI detection results, or other indirect losses.",
      },
      {
        question: "Can you edit only part of a document?",
        answer:
          "Yes. You can specify the chapters or passages you want revised; the quote is based on the word count of the material you send.",
      },
      {
        question: "Can you guarantee a lower AI detection score?",
        answer:
          "No. We cannot guarantee any detector score. Human editing removes mechanical phrasing and improves rhythm and expression, and we include a post-revision Turnitin AI report for reference. Different tools, versions, and sampling methods can produce different results.",
      },
      {
        question: "Will a Turnitin check add my draft to its database?",
        answer:
          "No. We use a No Repository setting, so submitted drafts are not added to the Turnitin database. Reports are third-party references; the actual settings and report contents are subject to Turnitin.",
      },
      {
        question: "Do you write assignments for students?",
        answer:
          "No. This is an editing service. You provide a draft you have written yourself, and you remain responsible for its content and citations.",
      },
      {
        question: "Which documents and languages do you support?",
        answer:
          "We support Chinese, English, and bilingual essays, thesis chapters, abstracts, reports, and similar academic work. We do not arbitrarily change your citations or formatting.",
      },
      {
        question: "How do payment and delivery work?",
        answer:
          "Once the draft, word count, and turnaround are confirmed, payment is made by Alipay HK. We confirm the delivery method and timing when accepting the order.",
      },
      {
        question: "Will my draft stay private?",
        answer:
          "Your draft is used only for this revision and is not published or reused. You can ask us to delete our copy after delivery.",
      },
    ],
  },
  cta: {
    eyebrow: "Ready to send your draft?",
    title: "Hand over the draft. Keep your voice.",
    description:
      "Get an instant quote, or continue the conversation on Carousell.",
    primary: "Get an instant quote",
    secondary: "Chat on WhatsApp",
    note: "From HK$85 for 600 words · Standard 90-minute turnaround · Turnitin AI report included",
  },
  footer: {
    tagline:
      "Human-reviewed academic editing in Chinese and English.",
    services: "Service",
    about: "About",
    pricing: "Pricing",
    order: "Order",
    faq: "FAQ",
    contact: "Contact",
    terms: "Terms",
    privacy: "Privacy",
    carousell: "Carousell listing",
    seller: "Carousell seller",
    payment: "Payment",
    paymentValue: "Alipay HK",
    disclaimer:
      "Naturalizer is an independent human editing service and is not affiliated with Turnitin LLC. This is an editing service, not ghostwriting, and we do not guarantee any grade, academic outcome, or AI detector result. Turnitin is a registered trademark of Turnitin LLC.",
    serviceRulesTitle: "Turnaround and compensation",
    serviceRules: [
      {
        title: "When the clock starts",
        body:
          "The clock starts only when payment is confirmed, the file opens, and the requirements are confirmed. If any one of the three is missing, it does not start.",
      },
      {
        title: "The 30-minute limit",
        body:
          "The 30-minute option is limited to 600 words or fewer. Longer drafts always move to manual intake and are not automatically promised a 30-minute turnaround.",
      },
      {
        title: "Late-delivery compensation",
        body:
          "If a 60- or 30-minute rush order is more than 10 minutes late, the full rush fee (HK$30 or HK$60) is refunded and the work is still delivered. If a standard 90-minute order is late, the next rush fee is waived.",
      },
      {
        title: "No outcome guarantee",
        body:
          "We do not guarantee any grade, AI detection rate, or academic outcome. Turnitin reports are third-party references only.",
      },
    ],
    copyright: "Naturalizer. All rights reserved.",
  },
};

export const content = { zh, en } as const;

export type Locale = keyof typeof content;
