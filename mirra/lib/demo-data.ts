import type { ComparisonData } from "./types";

/**
 * This data is intentionally finite and illustrative. It powers a polished
 * preview when OPENAI_API_KEY is not configured. Live comparisons still come
 * only from public web-search results returned by the API route.
 */
export function createDemoComparison(
  links: { a: string; b: string },
): ComparisonData {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    createdAt: now,
    mode: "demo",
    links,
    products: {
      a: {
        name: "兰蔻 小黑瓶精华肌底液 50ml",
        brand: "LANCÔME",
        category: "修护精华",
        tone: "pink",
        currentPrice: "¥760",
        regularPrice: "¥780",
        promotion: "演示价：满赠同系列小样，实际活动以公开页面为准",
        positioning: "轻透型肌底精华，强调稳定与妆前兼容",
        audience: "希望日常维稳、叠加护肤步骤的人",
        ingredients: ["二裂酵母发酵产物", "透明质酸", "维生素Cg"],
        formula:
          "以发酵产物与保湿体系为主，质地偏轻，强调日常维稳而非强刺激型焕肤。",
        benefits: ["修护", "保湿", "提亮", "妆前友好"],
        pros: ["吸收快，不易搓泥", "适合多步骤护肤叠加", "短期肤感清爽"],
        cons: ["极度干燥肌可能觉得滋润度不足", "含香精，敏感期需先测试"],
        scenarios: ["早间妆前", "换季维稳", "精华叠加"],
        skinTypes: ["中性肌", "混合肌", "偏油肌"],
        praise: [
          "上脸轻薄，后续防晒和底妆不容易打架",
          "换季时用来维持稳定，使用门槛比较低",
          "连续使用后皮肤摸起来更平滑",
        ],
        complaints: [
          "冬天单用滋润感不够",
          "对明显泛红或屏障受损的改善速度有限",
        ],
        tags: ["修护", "保湿", "提亮", "轻感"],
      },
      b: {
        name: "雅诗兰黛 小棕瓶精华 50ml",
        brand: "ESTÉE LAUDER",
        category: "夜间修护精华",
        tone: "sand",
        currentPrice: "¥935",
        regularPrice: "¥990",
        promotion: "演示价：节日套组折算，实际活动以公开页面为准",
        positioning: "滋润型经典修护精华，强调熬夜后的稳定与保湿",
        audience: "偏干、熬夜或希望晚间集中修护的人",
        ingredients: ["二裂酵母发酵产物", "三肽-32", "透明质酸"],
        formula:
          "发酵产物配合多肽与保湿成分，整体更滋润，适合偏干肌和夜间修护场景。",
        benefits: ["修护", "保湿", "抗氧", "舒缓"],
        pros: ["滋润度更高", "夜间修护感明确", "秋冬使用舒适"],
        cons: ["油皮夏季可能偏厚", "单价较高，含香精"],
        scenarios: ["夜间修护", "熬夜后维稳", "秋冬保湿"],
        skinTypes: ["干性肌", "中性肌", "混合偏干肌"],
        praise: [
          "熬夜后皮肤看起来没那么疲态",
          "滋润但不至于黏腻，秋冬肤感舒服",
          "长期使用对干燥和粗糙感有帮助",
        ],
        complaints: [
          "夏季或油皮使用会觉得厚重",
          "价格偏高，敏感肌仍需注意香精",
        ],
        tags: ["熬夜修护", "保湿", "抗氧", "屏障"],
      },
    },
    verdict:
      "如果你更在意白天妆前不搓泥、护肤步骤轻一点，小黑瓶更顺；如果是干皮、经常熬夜，想要更有存在感的夜间修护，小棕瓶会更像“安全感”。预算优先选 A，追求滋润与夜间仪式感选 B。",
    whoBuys: {
      a: "混合肌、偏油肌，或把精华放在早间妆前的人。",
      b: "干皮、混合偏干肌，或夜间愿意认真做修护的人。",
    },
    priceTrend: {
      status: "正常价",
      summary:
        "演示数据对应常规促销区间，未处于明显低谷。购买前应复核公开页面活动与赠品折算。",
      checkedAt: now,
    },
    rows: [
      {
        id: "current-price",
        group: "价格与定位",
        dimension: "price",
        label: "当前公开价",
        a: "¥760 / 50ml",
        b: "¥935 / 50ml",
        different: true,
      },
      {
        id: "regular-price",
        group: "价格与定位",
        dimension: "price",
        label: "日常价",
        a: "约 ¥780",
        b: "约 ¥990",
        different: true,
      },
      {
        id: "promotion",
        group: "价格与定位",
        dimension: "price",
        label: "优惠机制",
        a: "满赠小样，适合低门槛试用",
        b: "套组与节日赠品更常见",
        different: true,
      },
      {
        id: "positioning",
        group: "价格与定位",
        dimension: "price",
        label: "产品定位",
        a: "轻透肌底精华",
        b: "滋润型夜间修护精华",
        different: true,
      },
      {
        id: "audience",
        group: "价格与定位",
        dimension: "price",
        label: "适用人群",
        a: "混合皮、油皮与叠加型护肤",
        b: "干皮、熬夜肌与集中修护",
        different: true,
      },
      {
        id: "ingredients",
        group: "成分与功效",
        dimension: "ingredients",
        label: "核心成分",
        a: "二裂酵母发酵产物、透明质酸、维生素Cg",
        b: "二裂酵母发酵产物、三肽-32、透明质酸",
        different: true,
      },
      {
        id: "formula",
        group: "成分与功效",
        dimension: "ingredients",
        label: "配方与质地",
        a: "轻薄、快速吸收，强调叠加兼容",
        b: "更滋润，强调夜间持续保湿",
        different: true,
      },
      {
        id: "benefits",
        group: "成分与功效",
        dimension: "benefits",
        label: "主要功效",
        a: "维稳、保湿、提亮、平滑肤感",
        b: "修护、保湿、抗氧、舒缓",
        different: true,
      },
      {
        id: "scenario",
        group: "成分与功效",
        dimension: "benefits",
        label: "高频使用场景",
        a: "早间妆前、换季维稳、精华叠加",
        b: "夜间修护、熬夜后维稳、秋冬保湿",
        different: true,
      },
      {
        id: "skin",
        group: "体验与口碑",
        dimension: "benefits",
        label: "适配肤质",
        a: "中性、混合与偏油肌更舒适",
        b: "干性、中性、混合偏干肌更舒适",
        different: true,
      },
      {
        id: "praise",
        group: "体验与口碑",
        dimension: "reputation",
        label: "高频好评",
        a: "轻薄、不搓泥、便于叠加",
        b: "滋润、熬夜后状态更稳定",
        different: true,
      },
      {
        id: "complaints",
        group: "体验与口碑",
        dimension: "reputation",
        label: "高频吐槽",
        a: "干燥季节滋润度不够",
        b: "夏季偏厚、价格偏高",
        different: true,
      },
      {
        id: "sensitive",
        group: "体验与口碑",
        dimension: "reputation",
        label: "敏感肌注意",
        a: "含香精，敏感期先试用",
        b: "含香精，屏障受损期先试用",
        different: false,
      },
    ],
    sources: [
      {
        title: "LANCÔME 中国官网（演示来源）",
        url: "https://www.lancome.com.cn/",
      },
      {
        title: "ESTÉE LAUDER 中国官网（演示来源）",
        url: "https://www.esteelauder.com.cn/",
      },
    ],
    disclaimer:
      "当前为作品集演示数据，价格、活动与产品信息均应在购买时以品牌官方及公开页面为准。",
  };
}
