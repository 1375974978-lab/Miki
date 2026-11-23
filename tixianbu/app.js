"use strict";

const STORAGE_KEY = "tixianbu:data:v1";

// 部位与动作数据保持为普通前端常量，方便后续直接补充动作库。
const PARTS = {
  glute: {
    name: "臀腿",
    icon: "dumbbell",
    bg: "#e8ded7",
    accent: "#8e7665",
    description: "稳定发力，感受臀部与腿部协同。",
    insight: "臀腿训练的重点不是把动作做得更大，而是让髋关节稳定地伸展。",
    points: ["起身时先让脚掌贴稳地面，再把髋部向前送。", "膝盖跟随脚尖方向，避免向内扣。", "训练后关注臀部与腿后侧，而不是腰部酸痛。"],
    trainingFocus: "选择 2–4 个覆盖髋伸与单腿稳定的动作。",
    cameraY: 0.9,
  },
  back: {
    name: "背部",
    icon: "arrow-up-right",
    bg: "#d8e9e5",
    accent: "#52776d",
    description: "先沉肩，再把肘部向后带。",
    insight: "背部训练先建立肩胛控制，再谈拉起的重量。",
    points: ["动作开始前先让肩膀远离耳朵。", "拉回时想象肘部向身体后侧移动。", "保持颈部自然延伸，不用头部前伸借力。"],
    trainingFocus: "先选一个垂直拉，再选一个水平拉。",
    cameraY: 1.24,
  },
  shoulder: {
    name: "肩部",
    icon: "heart-pulse",
    bg: "#e1e1ee",
    accent: "#6c668d",
    description: "轻重量也有效，优先保持肩颈放松。",
    insight: "肩部更适合稳定、可控的轻重量训练，而不是追求甩起重量。",
    points: ["抬手前先让肋骨回收，避免腰部代偿。", "顶端不必耸高，关键是控制回程。", "肩前侧与肩后侧需要同等关注。"],
    trainingFocus: "推举、侧平举和后侧稳定各选一个即可。",
    cameraY: 1.4,
  },
  chest: {
    name: "胸部",
    icon: "shield-check",
    bg: "#ede7d4",
    accent: "#85714b",
    description: "收紧核心，让胸部承担主要发力。",
    insight: "胸部动作要把肩膀稳定在安全位置，再用胸口完成推或夹。",
    points: ["肩胛贴稳支撑面，手腕保持中立。", "下落过程保持控制，不追求弹起。", "动作幅度以肩关节舒适为准。"],
    trainingFocus: "水平推为主，再补一个轻度夹胸动作。",
    cameraY: 1.24,
  },
  core: {
    name: "核心",
    icon: "clock-3",
    bg: "#d7e9e3",
    accent: "#477970",
    description: "保持自然呼吸，不借腰部代偿。",
    insight: "核心不是一个动作，而是让躯干保持稳定的能力。",
    points: ["呼气时让肋骨向下收。", "腰背保持自然位置，不刻意塌腰或过度反弓。", "平板类动作先保证姿势，再逐步延长时间。"],
    trainingFocus: "选择一个抗伸展动作，再补一个旋转控制动作。",
    cameraY: 1.08,
  },
  cardio: {
    name: "有氧",
    icon: "flame",
    bg: "#eadce0",
    accent: "#8c6877",
    description: "按自己的节奏完成，持续比冲刺更重要。",
    insight: "有氧训练是为长期状态服务，不只是一次消耗数字。",
    points: ["先选能持续完成的强度，再逐渐增加时间。", "保持能说短句的呼吸节奏。", "膝踝不适时改用低冲击动作。"],
    trainingFocus: "挑一个能稳定完成 15–30 分钟的项目。",
    cameraY: 0.52,
  },
};

const EQUIPMENT = {
  bodyweight: "徒手",
  dumbbell: "哑铃",
  band: "弹力带",
  barbell: "杠铃",
  machine: "固定器械",
  cardioEquipment: "有氧器械",
  jumpRope: "跳绳",
};

// 动作库按部位维护。equipment 可包含多个值，hold 动作用秒数代替每组次数。
const action = (part, id, name, type, met, cue, equipment, hold = false) => ({
  part,
  id,
  name,
  type,
  met,
  cue,
  equipment,
  hold,
});

const ACTIONS = [
  // 臀腿
  action("glute", "bodyweight-squat", "徒手深蹲", "strength", 5.0, "脚尖与膝盖同向，起身时把地面推远。", ["bodyweight"]),
  action("glute", "lunge", "前向箭步蹲", "strength", 5.0, "前脚掌踩稳，下沉时让前侧臀部参与发力。", ["bodyweight"]),
  action("glute", "reverse-lunge", "后撤箭步蹲", "strength", 5.0, "后脚轻点地，重心留在前脚中段。", ["bodyweight"]),
  action("glute", "glute-bridge", "臀桥", "strength", 4.0, "肋骨收住，顶端用臀部发力，不要把腰顶出去。", ["bodyweight", "dumbbell"]),
  action("glute", "single-leg-glute-bridge", "单腿臀桥", "strength", 4.4, "两侧髋保持水平，用支撑腿臀部抬起。", ["bodyweight"]),
  action("glute", "side-lying-leg-raise", "侧卧抬腿", "strength", 3.5, "骨盆保持稳定，脚尖微微朝下。", ["bodyweight"]),
  action("glute", "bulgarian-split-squat", "保加利亚分腿蹲", "strength", 5.2, "前脚踩稳，躯干微前倾，感受前侧臀部发力。", ["bodyweight", "dumbbell"]),
  action("glute", "dumbbell-romanian-deadlift", "哑铃罗马尼亚硬拉", "strength", 5.7, "哑铃贴腿下放，臀部向后推而不是弯腰。", ["dumbbell"]),
  action("glute", "dumbbell-sumo-squat", "哑铃相扑深蹲", "strength", 5.2, "膝盖顺着脚尖方向打开，起身时夹臀。", ["dumbbell"]),
  action("glute", "band-lateral-walk", "弹力带侧向走", "strength", 4.2, "保持半蹲，脚尖向前，膝盖不要内扣。", ["band"]),
  action("glute", "band-clamshell", "弹力带蚌式", "strength", 3.8, "骨盆不动，只让上侧膝盖向外打开。", ["band"]),
  action("glute", "barbell-hip-thrust", "杠铃臀推", "strength", 5.8, "下巴微收，顶端夹臀，不要用腰过度反弓。", ["barbell"]),
  action("glute", "barbell-romanian-deadlift", "杠铃罗马尼亚硬拉", "strength", 5.7, "杠铃贴腿移动，脊柱保持中立。", ["barbell"]),
  action("glute", "leg-press", "腿举机", "strength", 5.0, "膝盖与脚尖同向，不要把膝关节锁死。", ["machine"]),
  action("glute", "hip-abduction-machine", "髋外展机", "strength", 3.8, "身体坐稳，用臀部外侧带动双腿打开。", ["machine"]),
  action("glute", "hip-thrust-machine", "臀推机", "strength", 5.2, "脚掌踩稳，顶端短暂停顿再下放。", ["machine"]),

  // 背部
  action("back", "lat-pulldown", "高位下拉", "strength", 4.3, "先沉肩，再把肘部拉向身体两侧。", ["machine"]),
  action("back", "seated-cable-row", "坐姿绳索划船", "strength", 4.5, "胸口打开，把肘部拉向身体后侧。", ["machine"]),
  action("back", "assisted-pullup", "辅助引体向上", "strength", 5.0, "先让肩膀下沉，再把胸口拉向横杆。", ["machine"]),
  action("back", "straight-arm-pulldown", "直臂下压", "strength", 4.2, "手臂保持微屈，用背阔肌把横杆压向大腿。", ["machine"]),
  action("back", "dumbbell-bent-row", "哑铃俯身划船", "strength", 4.7, "躯干稳定，手肘贴着身体向后拉。", ["dumbbell"]),
  action("back", "single-arm-row", "单臂哑铃划船", "strength", 4.5, "肩膀远离耳朵，手肘沿着身体侧面向后拉。", ["dumbbell"]),
  action("back", "chest-supported-row", "俯卧哑铃划船", "strength", 4.4, "胸口贴住凳面，避免用腰部借力。", ["dumbbell"]),
  action("back", "barbell-bent-row", "杠铃俯身划船", "strength", 5.0, "髋向后折，背保持长，杠铃拉向腹部。", ["barbell"]),
  action("back", "band-lat-pulldown", "弹力带下拉", "strength", 4.0, "固定好弹力带，先沉肩再屈肘下拉。", ["band"]),
  action("back", "band-row", "弹力带坐姿划船", "strength", 4.0, "肩胛骨向后下方收，手肘不要外翻。", ["band"]),
  action("back", "superman", "俯卧两头起", "strength", 3.3, "延长身体线条，抬起时不要猛仰脖子。", ["bodyweight"]),
  action("back", "machine-back-extension", "罗马椅挺身", "strength", 3.6, "髋部折叠，用臀背发力回到中立位。", ["machine"]),

  // 肩部
  action("shoulder", "dumbbell-shoulder-press", "哑铃推举", "strength", 4.5, "核心收紧，推起时不要耸肩或过度顶腰。", ["dumbbell"]),
  action("shoulder", "dumbbell-lateral-raise", "哑铃侧平举", "strength", 3.8, "想象手肘先向外打开，不追求抬得过高。", ["dumbbell"]),
  action("shoulder", "dumbbell-reverse-fly", "哑铃俯身飞鸟", "strength", 3.8, "背部保持平直，用肩后侧带动手臂展开。", ["dumbbell"]),
  action("shoulder", "dumbbell-front-raise", "哑铃前平举", "strength", 3.7, "手腕保持中立，手臂抬到肩高即可。", ["dumbbell"]),
  action("shoulder", "arnold-press", "阿诺德推举", "strength", 4.6, "从掌心朝向自己开始，推起时缓慢旋转。", ["dumbbell"]),
  action("shoulder", "band-shoulder-press", "弹力带推举", "strength", 4.0, "肋骨收住，向斜上方推起，不要顶腰。", ["band"]),
  action("shoulder", "band-lateral-raise", "弹力带侧平举", "strength", 3.6, "保持肩膀下沉，控制回程速度。", ["band"]),
  action("shoulder", "band-face-pull", "弹力带面拉", "strength", 3.8, "手肘向外打开，把弹力带拉向眉眼高度。", ["band"]),
  action("shoulder", "barbell-overhead-press", "杠铃推举", "strength", 4.7, "收紧臀腹，杠铃沿面部前方垂直上行。", ["barbell"]),
  action("shoulder", "machine-shoulder-press", "器械推肩", "strength", 4.3, "背部贴稳靠垫，推到手臂接近伸直。", ["machine"]),
  action("shoulder", "cable-lateral-raise", "绳索侧平举", "strength", 3.7, "身体保持稳定，用肩侧把把手向远处带。", ["machine"]),
  action("shoulder", "pike-pushup", "折刀俯卧撑", "strength", 4.2, "臀部抬高，头部朝双手前方下落。", ["bodyweight"]),

  // 胸部
  action("chest", "push-up", "标准俯卧撑", "strength", 4.2, "身体像一块板，胸口主动靠近地面。", ["bodyweight"]),
  action("chest", "knee-push-up", "跪姿俯卧撑", "strength", 3.8, "膝盖支撑也要保持躯干成一条线。", ["bodyweight"]),
  action("chest", "incline-push-up", "上斜俯卧撑", "strength", 3.9, "双手撑高，身体整体下移，不要塌腰。", ["bodyweight"]),
  action("chest", "dumbbell-bench", "哑铃卧推", "strength", 4.5, "肩胛贴稳凳面，推起时保持手腕中立。", ["dumbbell"]),
  action("chest", "dumbbell-fly", "哑铃飞鸟", "strength", 3.8, "手肘微屈，打开时保持胸口舒展。", ["dumbbell"]),
  action("chest", "dumbbell-floor-press", "哑铃地板卧推", "strength", 4.3, "上臂轻触地面后推起，肩膀保持稳定。", ["dumbbell"]),
  action("chest", "band-chest-press", "弹力带胸推", "strength", 4.0, "肩膀下沉，双手向前合拢时收紧胸部。", ["band"]),
  action("chest", "barbell-bench", "杠铃卧推", "strength", 4.7, "脚掌踩稳，杠铃落点保持在胸部中下段。", ["barbell"]),
  action("chest", "machine-chest-press", "器械推胸", "strength", 4.3, "背部贴稳靠垫，推到胸口收紧即可。", ["machine"]),
  action("chest", "pec-deck", "蝴蝶机夹胸", "strength", 3.7, "手肘微屈，向内合拢时不要耸肩。", ["machine"]),
  action("chest", "cable-crossover", "绳索夹胸", "strength", 4.0, "身体微微前倾，双手在胸前画弧合拢。", ["machine"]),

  // 核心
  action("core", "plank", "平板支撑", "strength", 3.6, "收紧腹部和臀部，保持均匀呼吸。", ["bodyweight"], true),
  action("core", "crunch", "卷腹", "strength", 3.8, "呼气时肋骨向下收，不用手拽脖子。", ["bodyweight"]),
  action("core", "russian-twist", "俄罗斯转体", "strength", 4.0, "胸口跟着转动，动作慢一点更可控。", ["bodyweight", "dumbbell"]),
  action("core", "dead-bug", "死虫式", "strength", 3.5, "腰背贴地，对侧手脚缓慢延伸。", ["bodyweight"]),
  action("core", "bird-dog", "鸟狗式", "strength", 3.5, "骨盆保持水平，对侧手脚同时伸出。", ["bodyweight"]),
  action("core", "side-plank", "侧平板支撑", "strength", 3.6, "肩膀在肘部正上方，髋部主动抬高。", ["bodyweight"], true),
  action("core", "lying-leg-raise", "仰卧举腿", "strength", 3.8, "下背贴地，双腿缓慢下放到可控位置。", ["bodyweight"]),
  action("core", "reverse-crunch", "反向卷腹", "strength", 3.7, "用腹部把骨盆卷向胸口，避免甩腿。", ["bodyweight"]),
  action("core", "hollow-hold", "空心支撑", "strength", 3.7, "下背贴地，手脚离开地面并保持呼吸。", ["bodyweight"], true),
  action("core", "band-pallof-press", "弹力带抗旋转推", "strength", 4.0, "身体正对前方，双手推出时抵抗旋转。", ["band"]),
  action("core", "suitcase-carry", "哑铃单侧提行", "strength", 4.2, "身体保持直立，不要向哑铃一侧倾斜。", ["dumbbell"]),
  action("core", "mountain-climber", "登山跑", "strength", 6.0, "肩膀稳定，膝盖交替向胸口靠近。", ["bodyweight"]),

  // 有氧
  action("cardio", "running", "跑步", "cardio", 7.5, "保持能说短句的节奏，落脚轻、步幅自然。", ["bodyweight"]),
  action("cardio", "incline-walk", "跑步机爬坡", "cardio", 5.8, "身体微微前倾，用臀腿发力而不是抓扶手。", ["cardioEquipment"]),
  action("cardio", "pamela-cardio", "帕梅拉燃脂操", "cardio", 6.5, "先保证动作完整，跟不上时再降低速度。", ["bodyweight"]),
  action("cardio", "jump-rope", "跳绳", "cardio", 10.0, "用手腕摇绳，落地保持轻和短。", ["jumpRope"]),
  action("cardio", "home-cardio", "居家有氧训练", "cardio", 5.8, "把呼吸维持在可控区间，膝盖不适时改低冲击。", ["bodyweight"]),
  action("cardio", "brisk-walk", "快走", "cardio", 4.3, "步幅自然、摆臂放松，保持连续节奏。", ["bodyweight"]),
  action("cardio", "elliptical", "椭圆机", "cardio", 5.0, "脚掌贴稳踏板，用完整步伐带动全身。", ["cardioEquipment"]),
  action("cardio", "stationary-bike", "动感单车", "cardio", 5.5, "座椅高度合适，踩踏时膝盖保持自然弯曲。", ["cardioEquipment"]),
  action("cardio", "rowing-machine", "划船机", "cardio", 6.0, "先蹬腿，再带动身体和手臂完成划船。", ["cardioEquipment"]),
  action("cardio", "stair-climber", "爬楼机", "cardio", 7.0, "踩实踏板，身体保持直立，避免趴在扶手上。", ["cardioEquipment"]),
  action("cardio", "dance-workout", "舞蹈燃脂训练", "cardio", 5.5, "保持动作幅度，跟不上时可以降低节奏。", ["bodyweight"]),
  action("cardio", "low-impact-cardio", "低冲击有氧", "cardio", 4.8, "全程有一只脚着地，减少膝踝冲击。", ["bodyweight"]),
];

const METRICS = {
  weight: { key: "weight", label: "体重", unit: "kg", color: "#2b6555", decimals: 1 },
  bodyFat: { key: "bodyFat", label: "体脂率", unit: "%", color: "#79658b", decimals: 1 },
  waist: { key: "waist", label: "腰围", unit: "cm", color: "#a66f61", decimals: 1 },
  hip: { key: "hip", label: "臀围", unit: "cm", color: "#607988", decimals: 1 },
};

// LocalStorage 的单一数据结构；新增字段时必须兼容旧版本缺失字段。
const DEFAULT_STATE = {
  version: 1,
  favorites: [],
  sessions: [],
  measurements: [],
  milestones: [],
};

// 页面级状态；持久化状态统一写入 LocalStorage，临时选择不写入。
let state = loadState();
let activePart = "glute";
let currentView = "training";
let currentScreen = "home";
let activeMetric = "weight";
let selectedActions = new Map();
const selectedEquipmentByPart = new Map();
let calendarCursor = new Date();
let selectedCalendarDate = toISODate(new Date());
let lastSummary = null;
let toastTimer = null;
let sheetStep = "knowledge";
let bodyViewer = null;
let activeWorkoutPlan = null;
const completedSetKeys = new Set();
const celebratedActions = new Set();

const elements = {
  shell: document.getElementById("app-shell"),
  appMain: document.querySelector(".app-main"),
  bottomNav: document.querySelector(".bottom-nav"),
  backButton: document.getElementById("back-button"),
  appScreenTitle: document.getElementById("app-screen-title"),
  brand: document.querySelector(".brand"),
  views: {
    training: document.getElementById("training-view"),
    body: document.getElementById("body-view"),
  },
  screens: {
    trainingHome: document.getElementById("training-home-screen"),
    trainingPart: document.getElementById("part-screen"),
    trainingCalendar: document.getElementById("calendar-screen"),
    bodyHome: document.getElementById("body-home-screen"),
    bodyRecord: document.getElementById("body-record-screen"),
    bodyHistory: document.getElementById("body-history-screen"),
    bodyMilestones: document.getElementById("body-milestones-screen"),
  },
  navTabs: [...document.querySelectorAll(".nav-tab")],
  viewLinks: [...document.querySelectorAll("[data-view-link]")],
  partList: document.getElementById("part-list"),
  bodyStage: document.getElementById("body-stage"),
  bodyCanvas: document.getElementById("body-canvas"),
  modelStatus: document.getElementById("model-status"),
  hoverTarget: document.getElementById("hover-target"),
  trainingHome: document.getElementById("training-home-screen"),
  partSheet: document.getElementById("part-screen"),
  sheetUtility: document.querySelector(".sheet-utility"),
  sheetTrack: document.querySelector(".sheet-track"),
  sheetStepLabel: document.getElementById("sheet-step-label"),
  sheetGrip: document.querySelector("[data-sheet-handle]"),
  enterTraining: document.getElementById("enter-training"),
  backToKnowledge: document.getElementById("back-to-knowledge"),
  exerciseList: document.getElementById("exercise-list"),
  activePartName: document.getElementById("active-part-name"),
  partCover: document.getElementById("part-cover"),
  partCoverIcon: document.getElementById("part-cover-icon"),
  partDescription: document.getElementById("part-description"),
  partInsight: document.getElementById("part-insight"),
  knowledgePoints: document.getElementById("knowledge-points"),
  partTrainingFocus: document.getElementById("part-training-focus"),
  equipmentPicker: document.getElementById("equipment-picker"),
  equipmentMatchCount: document.getElementById("equipment-match-count"),
  actionCount: document.getElementById("action-count"),
  trainingDate: document.getElementById("training-date"),
  sessionCalories: document.getElementById("session-calories"),
  calorieBasis: document.getElementById("calorie-basis"),
  selectionHint: document.getElementById("selection-hint"),
  saveTraining: document.getElementById("save-training"),
  saveDock: document.querySelector(".save-dock"),
  draftTicket: document.getElementById("resume-receipt"),
  draftTicketLabel: document.getElementById("draft-ticket-label"),
  receiptOverlay: document.getElementById("receipt-overlay"),
  workoutReceipt: document.getElementById("workout-receipt"),
  receiptItems: document.getElementById("receipt-items"),
  receiptDate: document.getElementById("receipt-date"),
  receiptTitle: document.getElementById("receipt-title"),
  receiptCalories: document.getElementById("receipt-calories"),
  receiptCompletion: document.getElementById("receipt-completion"),
  receiptFooterNote: document.getElementById("receipt-footer-note"),
  receiptHandle: document.querySelector("[data-receipt-handle]"),
  receiptNumber: document.getElementById("receipt-number"),
  addMoreActions: document.getElementById("add-more-actions"),
  completeTraining: document.getElementById("complete-training"),
  finishReceipt: document.getElementById("finish-receipt"),
  monthSessionCount: document.getElementById("month-session-count"),
  monthCalories: document.getElementById("month-calories"),
  calendarGrid: document.getElementById("calendar-grid"),
  calendarMonthLabel: document.getElementById("calendar-month-label"),
  dayDetail: document.getElementById("day-detail"),
  measurementForm: document.getElementById("measurement-form"),
  measurementDate: document.getElementById("measurement-date"),
  measurementError: document.getElementById("measurement-error"),
  trendChart: document.getElementById("trend-chart"),
  chartWrap: document.getElementById("chart-wrap"),
  chartTooltip: document.getElementById("chart-tooltip"),
  trendLatestLabel: document.getElementById("trend-latest-label"),
  trendLatestValue: document.getElementById("trend-latest-value"),
  latestWeight: document.getElementById("latest-weight"),
  latestBodyFat: document.getElementById("latest-body-fat"),
  metricTabs: [...document.querySelectorAll(".metric-tab")],
  milestoneForm: document.getElementById("milestone-form"),
  milestoneDate: document.getElementById("milestone-date"),
  milestoneLabel: document.getElementById("milestone-label"),
  milestoneError: document.getElementById("milestone-error"),
  milestoneList: document.getElementById("milestone-list"),
  milestoneCount: document.getElementById("milestone-count"),
  historyBody: document.getElementById("history-body"),
  historyCount: document.getElementById("history-count"),
  historyDetailCount: document.getElementById("history-detail-count"),
  toast: document.getElementById("toast"),
};

init();

function init() {
  elements.trainingDate.value = toISODate(new Date());
  elements.measurementDate.value = toISODate(new Date());
  elements.milestoneDate.value = toISODate(new Date());
  history.replaceState({ appDepth: 0 }, "", location.hash || "#training");
  elements.todayLabel = document.getElementById("today-label");
  elements.todayLabel.textContent = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());

  bindEvents();
  syncRouteFromHash();
  renderAll();
  initBodyViewer();
}

function bindEvents() {
  // 主导航使用 hash 路由，刷新后仍能停留在当前主页面。
  elements.viewLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      navigateTo(link.dataset.viewLink);
    });
  });

  document.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      navigateTo(button.dataset.route);
    });
  });

  elements.backButton.addEventListener("click", navigateBack);

  elements.partList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-part]");
    if (!button) return;
    activePart = button.dataset.part;
    renderExercises();
    navigateTo(`training/part/${activePart}`);
  });

  bindSwipeDismiss(elements.sheetGrip, elements.partSheet, () => navigateTo("training"));
  bindSwipeDismiss(elements.sheetUtility, elements.partSheet, () => navigateTo("training"));
  bindSwipeDismiss(elements.receiptHandle, elements.receiptOverlay, () => closeReceipt());

  elements.enterTraining.addEventListener("click", () => {
    showSheetStep("actions");
  });

  elements.backToKnowledge.addEventListener("click", () => {
    showSheetStep("knowledge");
  });

  elements.exerciseList.addEventListener("change", (event) => {
    const favorite = event.target.closest("[data-favorite-action]");
    if (favorite) {
      toggleFavorite(favorite.dataset.favoriteAction);
      return;
    }

    const toggle = event.target.closest("[data-toggle-action]");
    if (toggle) {
      const actionId = toggle.dataset.toggleAction;
      if (toggle.checked) {
        const action = getAction(actionId);
        selectedActions.set(actionId, createDefaultEntry(action));
      } else {
        selectedActions.delete(actionId);
      }
      renderExercises();
      updateLiveTotals();
    }
  });

  elements.exerciseList.addEventListener("input", (event) => {
    const input = event.target.closest("[data-entry-field]");
    if (!input) return;
    const actionId = input.dataset.actionId;
    const entry = selectedActions.get(actionId);
    if (!entry) return;
    entry[input.dataset.entryField] = input.value;
    updateLiveTotals();
  });

  elements.exerciseList.addEventListener("click", (event) => {
    const favorite = event.target.closest("[data-favorite-action]");
    if (favorite) {
      toggleFavorite(favorite.dataset.favoriteAction);
    }
  });

  elements.equipmentPicker.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-equipment]");
    if (!chip) return;
    const equipment = chip.dataset.equipment;
    const selected = new Set(selectedEquipmentByPart.get(activePart) || []);
    if (equipment === "all") {
      selected.clear();
    } else if (selected.has(equipment)) {
      selected.delete(equipment);
    } else {
      selected.add(equipment);
    }
    selectedEquipmentByPart.set(activePart, selected);
    let removedCount = 0;
    if (selected.size > 0) {
      for (const actionId of selectedActions.keys()) {
        const selectedAction = getAction(actionId);
        if (!selectedAction?.equipment.some((item) => selected.has(item))) {
          selectedActions.delete(actionId);
          removedCount += 1;
        }
      }
    }
    renderExercises();
    updateLiveTotals();
    if (removedCount > 0) {
      showToast(`已移除 ${removedCount} 个不在当前器械范围内的动作`);
    }
  });

  elements.saveTraining.addEventListener("click", openWorkoutReceipt);
  elements.draftTicket.addEventListener("click", openWorkoutReceipt);
  elements.addMoreActions.addEventListener("click", addMoreExercises);
  elements.completeTraining.addEventListener("click", completeWorkout);
  elements.finishReceipt.addEventListener("click", closeReceipt);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (elements.receiptOverlay.classList.contains("is-open")) {
      closeReceipt();
    } else if (currentScreen === "part") {
      navigateTo("training");
    }
  });

  elements.receiptItems.addEventListener("change", (event) => {
    const checkbox = event.target.closest("[data-set-check]");
    if (!checkbox || !activeWorkoutPlan) return;
    const actionId = checkbox.dataset.actionId;
    const setKey = `${actionId}:${checkbox.dataset.setIndex}`;
    if (checkbox.checked) completedSetKeys.add(setKey);
    else completedSetKeys.delete(setKey);

    const actionBlock = checkbox.closest(".receipt-action-block");
    const item = activeWorkoutPlan.items.find((entry) => entry.actionId === actionId);
    if (!item || !actionBlock) return;
    const completed = item ? countCompletedSets(item) : 0;
    const total = item ? getSetCount(item) : 0;
    actionBlock.classList.toggle("is-complete", completed === total);

    if (completed === total && !celebratedActions.has(actionId)) {
      celebratedActions.add(actionId);
      celebrate(event.currentTarget, 34);
      showToast(`${item.name} 完成，下一项继续`);
    }
    updateReceiptProgress();
  });

  document.getElementById("prev-month").addEventListener("click", () => {
    calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() - 1, 1);
    renderCalendar();
  });
  document.getElementById("next-month").addEventListener("click", () => {
    calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 1);
    renderCalendar();
  });
  document.getElementById("calendar-today").addEventListener("click", () => {
    const today = new Date();
    calendarCursor = new Date(today.getFullYear(), today.getMonth(), 1);
    selectedCalendarDate = toISODate(today);
    renderCalendar();
    renderDayDetail();
  });

  elements.calendarGrid.addEventListener("click", (event) => {
    const day = event.target.closest("[data-calendar-date]");
    if (!day) return;
    selectedCalendarDate = day.dataset.calendarDate;
    renderCalendar();
    renderDayDetail();
  });

  elements.measurementForm.addEventListener("submit", saveMeasurement);
  elements.metricTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeMetric = tab.dataset.metric;
      renderChart();
    });
  });
  document.querySelector(".metric-tabs").addEventListener("keydown", (event) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const keys = Object.keys(METRICS);
    const currentIndex = keys.indexOf(activeMetric);
    let nextIndex = currentIndex;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = keys.length - 1;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % keys.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + keys.length) % keys.length;
    activeMetric = keys[nextIndex];
    renderChart();
    elements.metricTabs.find((tab) => tab.dataset.metric === activeMetric)?.focus();
  });

  elements.milestoneForm.addEventListener("submit", saveMilestone);

  elements.milestoneList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-milestone]");
    if (!button) return;
    const id = button.dataset.deleteMilestone;
    const milestone = state.milestones.find((item) => item.id === id);
    if (!milestone) return;
    if (!window.confirm(`删除里程碑“${milestone.label}”？`)) return;
    state.milestones = state.milestones.filter((item) => item.id !== id);
    persistState();
    renderMilestones();
    renderChart();
    showToast("里程碑已删除");
  });

  elements.historyBody.addEventListener("click", (event) => {
    const copyButton = event.target.closest("[data-copy-summary]");
    if (copyButton) {
      copyText(copyButton.dataset.copySummary, copyButton);
      return;
    }

    const deleteButton = event.target.closest("[data-delete-measurement]");
    if (!deleteButton) return;
    const id = deleteButton.dataset.deleteMeasurement;
    const measurement = state.measurements.find((item) => item.id === id);
    if (!measurement) return;
    if (!window.confirm(`删除 ${formatDate(measurement.date)} 的身材记录？`)) return;
    state.measurements = state.measurements.filter((item) => item.id !== id);
    persistState();
    renderMeasurements();
    renderChart();
    renderHistory();
    updateLiveTotals();
    showToast("记录已删除");
  });

  elements.dayDetail.addEventListener("click", (event) => {
    const copyButton = event.target.closest("[data-copy-summary]");
    if (copyButton) copyText(copyButton.dataset.copySummary, copyButton);
  });

  window.addEventListener("hashchange", syncRouteFromHash);
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    state = loadState();
    renderAll();
    showToast("已同步另一个标签页中的本地记录");
  });

  let chartResizeTimer;
  window.addEventListener("resize", () => {
    window.clearTimeout(chartResizeTimer);
    chartResizeTimer = window.setTimeout(renderChart, 120);
  });
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!parsed || typeof parsed !== "object") return structuredClone(DEFAULT_STATE);
    return {
      ...structuredClone(DEFAULT_STATE),
      ...parsed,
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      measurements: Array.isArray(parsed.measurements) ? parsed.measurements : [],
      milestones: Array.isArray(parsed.milestones) ? parsed.milestones : [],
    };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function persistState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    showToast("浏览器未能保存数据，请检查本地存储权限或剩余空间");
    return false;
  }
}

// 首屏统一渲染入口；每个模块都可独立重绘，避免整页刷新。
function renderAll() {
  renderParts();
  renderExercises();
  updateLiveTotals();
  renderMonthStats();
  renderCalendar();
  renderDayDetail();
  renderMeasurements();
  renderBodySnapshot();
  renderChart();
  renderMilestones();
  renderHistory();
}

// 使用轻量 hash 路由维护页面栈，所有细节页都可以被浏览器返回键恢复。
function parseRoute() {
  const parts = location.hash.replace(/^#/, "").split("/").filter(Boolean);
  const view = parts[0] === "body" ? "body" : "training";
  if (view === "training") {
    if (parts[1] === "part" && PARTS[parts[2]]) {
      return { view, screen: "part", part: parts[2] };
    }
    if (parts[1] === "calendar") return { view, screen: "calendar", part: activePart };
    return { view, screen: "home", part: activePart };
  }
  if (["record", "history", "milestones"].includes(parts[1])) {
    return { view, screen: parts[1], part: activePart };
  }
  return { view, screen: "home", part: activePart };
}

function navigateTo(path) {
  const normalized = path === "body/record"
    ? "body/record"
    : path === "body/history"
      ? "body/history"
      : path === "body/milestones"
        ? "body/milestones"
        : path === "training/calendar"
          ? "training/calendar"
          : path === "calendar"
            ? "training/calendar"
          : path.startsWith("training/part/")
            ? path
            : path === "body"
              ? "body"
              : "training";
  const nextHash = `#${normalized}`;
  if (location.hash === nextHash) {
    showRoute(parseRoute(), false);
    return;
  }
  const depth = Number(history.state?.appDepth || 0) + 1;
  history.pushState({ appDepth: depth }, "", nextHash);
  showRoute(parseRoute(), true);
}

function navigateBack() {
  const route = parseRoute();
  if (route.screen === "part" && sheetStep === "actions") {
    showSheetStep("knowledge");
    return;
  }
  if (route.screen !== "home") {
    if (Number(history.state?.appDepth || 0) > 0) {
      history.back();
    } else {
      const rootHash = route.view === "body" ? "#body" : "#training";
      history.replaceState({ appDepth: 0 }, "", rootHash);
      showRoute(parseRoute(), true);
    }
  }
}

function syncRouteFromHash() {
  showRoute(parseRoute(), false);
}

function showRoute(route, focusTitle = false) {
  currentView = route.view;
  currentScreen = route.screen;
  if (route.view === "training" && route.part) activePart = route.part;
  elements.receiptOverlay.classList.remove("is-open", "is-printing");
  elements.receiptOverlay.setAttribute("aria-hidden", "true");
  elements.receiptOverlay.inert = true;

  const screenByKey = {
    "training:home": "trainingHome",
    "training:part": "trainingPart",
    "training:calendar": "trainingCalendar",
    "body:home": "bodyHome",
    "body:record": "bodyRecord",
    "body:history": "bodyHistory",
    "body:milestones": "bodyMilestones",
  };
  const activeScreenKey = screenByKey[`${route.view}:${route.screen}`] || `${route.view}Home`;

  const isTraining = route.view === "training";
  elements.views.training.hidden = false;
  elements.views.body.hidden = false;
  elements.views.training.classList.toggle("is-active", isTraining);
  elements.views.training.classList.toggle("is-behind", !isTraining);
  elements.views.body.classList.toggle("is-active", !isTraining);
  elements.views.body.classList.toggle("is-behind", isTraining);
  elements.views.training.inert = !isTraining;
  elements.views.body.inert = isTraining;
  if (isTraining) {
    elements.screens.trainingHome.hidden = false;
    elements.screens.trainingPart.hidden = false;
    elements.screens.trainingCalendar.hidden = false;
    elements.screens.trainingPart.classList.toggle("is-open", route.screen === "part");
    elements.screens.trainingPart.setAttribute("aria-hidden", String(route.screen !== "part"));
  elements.screens.trainingPart.inert = route.screen !== "part";
    elements.screens.trainingCalendar.classList.toggle("is-open", route.screen === "calendar");
  elements.screens.trainingCalendar.setAttribute("aria-hidden", String(route.screen !== "calendar"));
  elements.screens.trainingCalendar.inert = route.screen !== "calendar";
    elements.trainingHome.classList.toggle("has-sheet", route.screen === "part");
    elements.screens.bodyHome.hidden = true;
    elements.screens.bodyRecord.hidden = true;
    elements.screens.bodyHistory.hidden = true;
    elements.screens.bodyMilestones.hidden = true;
  } else {
    elements.screens.trainingHome.hidden = true;
    elements.screens.trainingPart.hidden = true;
    elements.screens.trainingCalendar.hidden = true;
    Object.entries(elements.screens).forEach(([name, screen]) => {
      if (!name.startsWith("training")) screen.hidden = name !== activeScreenKey;
    });
  }

  const detailTitles = {
    "training:part": `${PARTS[activePart].name}训练`,
    "training:calendar": "训练日历",
    "body:record": "记录身材数据",
    "body:history": "历史记录",
    "body:milestones": "训练里程碑",
  };
  const title = detailTitles[`${route.view}:${route.screen}`];
  const isMainTab = isTraining
    ? ["home", "calendar"].includes(route.screen)
    : route.screen === "home";
  elements.brand.hidden = !isMainTab;
  elements.backButton.hidden = isMainTab;
  elements.appScreenTitle.hidden = isMainTab;
  elements.appScreenTitle.textContent = title || "";
  elements.bottomNav.hidden = !isMainTab;
  elements.shell.classList.toggle("is-detail", !isMainTab);

  const activeTab = route.screen === "calendar" ? "calendar" : route.view;
  elements.navTabs.forEach((tab) => {
    const isActive = tab.dataset.viewLink === activeTab;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-current", isActive ? "page" : "false");
  });
  const pageTitle = route.screen === "calendar"
    ? "训练日历"
    : title || (route.view === "body" ? "身材数据" : "训练打卡");
  document.title = `${pageTitle}｜体线簿`;
  elements.appMain.scrollTop = 0;
  elements.views[route.view].scrollTop = 0;

  if (route.view === "body") {
    renderChart();
    renderBodySnapshot();
  }
  if (route.view === "training" && route.screen === "part") {
    renderKnowledge();
    showSheetStep("knowledge", false);
    renderParts();
    renderExercises();
    setBodyFocus(activePart);
  }
  if (route.view === "training" && route.screen === "home") {
    showSheetStep("knowledge", false);
    setBodyFocus(null);
  }
  if (focusTitle) {
    window.requestAnimationFrame(() => {
      elements.appScreenTitle.focus({ preventScroll: true });
    });
  }
}

function renderParts() {
  const fallbackPositions = {
    glute: [52, 58],
    back: [38, 39],
    shoulder: [69, 30],
    chest: [59, 37],
    core: [53, 46],
    cardio: [58, 74],
  };
  elements.partList.innerHTML = Object.entries(PARTS)
    .map(([key, part]) => {
      const count = ACTIONS.filter((action) => action.part === key).length;
      const [x, y] = fallbackPositions[key];
      return `
        <button
          class="body-hotspot${key === activePart ? " is-active" : ""}"
          type="button"
          data-part="${key}"
          style="--part-bg:${part.bg};--part-accent:${part.accent};--hotspot-x:${x}%;--hotspot-y:${y}%"
          aria-label="选择${part.name}，查看身体知识与 ${count} 个训练动作"
        >
          <span class="hotspot-dot"></span>
          <span class="hotspot-label">${part.name}</span>
        </button>
      `;
    })
    .join("");
  requestAnimationFrame(() => layoutBodyHotspots());
}

function renderExercises() {
  const part = PARTS[activePart];
  const favoriteSet = new Set(state.favorites);
  const allActions = ACTIONS.filter((action) => action.part === activePart);
  const selectedEquipment = new Set(selectedEquipmentByPart.get(activePart) || []);
  const recommendedActions =
    selectedEquipment.size === 0
      ? allActions
      : allActions.filter((action) => action.equipment.some((item) => selectedEquipment.has(item)));
  const actions = [...recommendedActions].sort((a, b) => {
    const favoriteScore = Number(favoriteSet.has(b.id)) - Number(favoriteSet.has(a.id));
    if (favoriteScore !== 0) return favoriteScore;
    const aMatches = a.equipment.filter((item) => selectedEquipment.has(item)).length;
    const bMatches = b.equipment.filter((item) => selectedEquipment.has(item)).length;
    return bMatches - aMatches;
  });

  elements.activePartName.textContent = part.name;
  elements.partDescription.textContent = part.description;
  elements.actionCount.textContent =
    selectedEquipment.size === 0
      ? `${allActions.length} 个动作`
      : `${actions.length} 个匹配动作`;
  renderEquipmentPicker(part, allActions, selectedEquipment, actions.length);
  elements.partCover.style.setProperty("--part-bg", part.bg);
  elements.partCover.style.setProperty("--part-accent", part.accent);
  elements.partCoverIcon.className = `icon icon-${part.icon}`;
  document.documentElement.style.setProperty("--part-accent", part.accent);
  document.documentElement.style.setProperty("--part-bg", part.bg);

  elements.exerciseList.innerHTML = actions
    .map((action) => {
      const entry = selectedActions.get(action.id);
      const selected = Boolean(entry);
      const favorite = favoriteSet.has(action.id);
      const typeLabel = action.type === "cardio" ? "有氧" : "力量";
      const equipmentTags = action.equipment
        .map((equipment) => `<span class="equipment-tag">${EQUIPMENT[equipment]}</span>`)
        .join("");
      const fields = selected
        ? action.type === "cardio"
          ? renderCardioFields(action, entry, part)
          : renderStrengthFields(action, entry, part)
        : "";

      return `
        <article class="exercise-row${selected ? " is-selected" : ""}" style="--part-bg:${part.bg};--part-accent:${part.accent}">
          <div class="exercise-head">
            <label class="action-select">
              <input
                type="checkbox"
                data-toggle-action="${action.id}"
                ${selected ? "checked" : ""}
                aria-label="选择 ${action.name}"
              />
              <span class="custom-check"><span class="icon icon-check" aria-hidden="true"></span></span>
              <span class="action-copy">
                <span class="action-title-row">
                  <span class="action-name">${action.name}</span>
                  <span class="type-badge">${typeLabel}</span>
                  ${equipmentTags}
                </span>
                <span class="action-cue">${action.cue}</span>
              </span>
            </label>
            <div class="action-tools">
              <a
                class="video-link"
                href="${videoSearchUrl(action.name)}"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="在哔哩哔哩搜索 ${action.name} 教学视频"
              >
                <span class="icon icon-play" aria-hidden="true"></span>
                视频
              </a>
              <button
                class="favorite-button${favorite ? " is-favorite" : ""}"
                type="button"
                data-favorite-action="${action.id}"
                aria-label="${favorite ? "取消收藏" : "收藏"} ${action.name}"
                aria-pressed="${favorite}"
              >
                <span class="icon icon-heart" aria-hidden="true"></span>
              </button>
            </div>
          </div>
          ${fields}
        </article>
      `;
    })
    .join("");
}

function renderKnowledge() {
  const part = PARTS[activePart];
  elements.activePartName.textContent = part.name;
  elements.partDescription.textContent = part.description;
  elements.partInsight.textContent = part.insight;
  elements.partTrainingFocus.textContent = part.trainingFocus;
  elements.knowledgePoints.innerHTML = part.points
    .map(
      (point, index) => `
        <li>
          <span>${String(index + 1).padStart(2, "0")}</span>
          <p>${point}</p>
        </li>
      `,
    )
    .join("");
  elements.partCover.style.setProperty("--part-bg", part.bg);
  elements.partCover.style.setProperty("--part-accent", part.accent);
  elements.partCoverIcon.className = `icon icon-${part.icon}`;
  [...elements.partList.querySelectorAll("[data-part]")].forEach((button) => {
    button.classList.toggle("is-active", button.dataset.part === activePart);
  });
}

function showSheetStep(step, animate = true) {
  sheetStep = step;
  if (!animate) elements.sheetTrack.style.transition = "none";
  elements.sheetTrack.style.transform = step === "actions" ? "translateX(-50%)" : "translateX(0)";
  if (!animate) {
    window.requestAnimationFrame(() => {
      elements.sheetTrack.style.transition = "";
    });
  }
  elements.sheetStepLabel.textContent = step === "actions" ? PARTS[activePart].name + "训练" : "身体知识";
  elements.trainingHome.classList.toggle("is-action-step", step === "actions");
  const knowledgePanel = document.getElementById("knowledge-panel");
  const actionPanel = document.getElementById("action-panel");
  knowledgePanel.inert = step !== "knowledge";
  actionPanel.inert = step !== "actions";
  knowledgePanel.setAttribute("aria-hidden", String(step !== "knowledge"));
  actionPanel.setAttribute("aria-hidden", String(step !== "actions"));
  if (step === "actions") actionPanel.scrollTop = 0;
  else knowledgePanel.scrollTop = 0;
}

function initBodyViewer() {
  const host = elements.bodyCanvas;
  if (!host || !window.THREE) {
    if (elements.modelStatus) elements.modelStatus.textContent = "3D 视图不可用，请使用部位标签选择";
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 1.22, 5.65);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  host.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xf3fff8, 0x315647, 1.8));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
  keyLight.position.set(3, 4.5, 4);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0x9ccfba, 1.5);
  rimLight.position.set(-3, 2.5, -2);
  scene.add(rimLight);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(1.12, 64),
    new THREE.MeshBasicMaterial({
      color: 0x6c9f89,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const halo = new THREE.Mesh(
    new THREE.RingGeometry(0.78, 0.79, 80),
    new THREE.MeshBasicMaterial({
      color: 0x5f927d,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
    }),
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 0.004;
  scene.add(halo);

  const focusMarker = new THREE.Mesh(
    new THREE.RingGeometry(0.045, 0.058, 40),
    new THREE.MeshBasicMaterial({
      color: 0xd3bd65,
      transparent: true,
      opacity: 0.84,
      side: THREE.DoubleSide,
    }),
  );
  focusMarker.visible = false;
  scene.add(focusMarker);

  bodyViewer = {
    scene,
    camera,
    renderer,
    focusMarker,
    focusedPart: null,
    model: null,
    anchors: {},
    dragging: false,
    dragDistance: 0,
    lastX: 0,
    lastY: 0,
    targetRotation: 0.08,
    currentRotation: 0,
    targetTilt: 0,
    currentTilt: 0,
    cameraGoal: { y: 1.22, z: 5.65, lookY: 1.14 },
    cameraLookY: 1.14,
    lastInteraction: performance.now(),
    pointerDownAt: 0,
    loaded: false,
    reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  };

  const modelSource =
    location.protocol === "file:" && window.BODY_MODEL_DATA_URI
      ? window.BODY_MODEL_DATA_URI
      : "assets/models/woman-base-light.glb";

  new THREE.GLTFLoader().load(
    modelSource,
    (gltf) => {
      const model = gltf.scene;
      const originalBox = new THREE.Box3().setFromObject(model);
      const size = originalBox.getSize(new THREE.Vector3());
      const scale = 2.42 / size.y;
      model.scale.setScalar(scale);
      model.updateMatrixWorld(true);
      const scaledBox = new THREE.Box3().setFromObject(model);
      const center = scaledBox.getCenter(new THREE.Vector3());
      model.position.x -= center.x;
      model.position.z -= center.z;
      model.position.y -= scaledBox.min.y;

      model.traverse((child) => {
        if (!child.isMesh) return;
        child.frustumCulled = false;
        child.material.envMapIntensity = 0.65;
        child.material.roughness = Math.max(0.58, child.material.roughness ?? 0.7);
      });
      scene.add(model);
      bodyViewer.model = model;
      bodyViewer.loaded = true;

      const anchorPositions = {
        shoulder: new THREE.Vector3(-0.19, 1.42, 0.04),
        chest: new THREE.Vector3(0, 1.27, 0.15),
        core: new THREE.Vector3(0, 1.06, 0.15),
        glute: new THREE.Vector3(0, 0.88, 0.11),
        back: new THREE.Vector3(0, 1.22, -0.16),
        cardio: new THREE.Vector3(-0.1, 0.44, 0.05),
      };
      Object.entries(anchorPositions).forEach(([key, position]) => {
        const anchor = new THREE.Object3D();
        anchor.position.copy(position);
        model.add(anchor);
        bodyViewer.anchors[key] = anchor;
      });

      elements.modelStatus.hidden = true;
      if (currentScreen === "part") setBodyFocus(activePart);
      layoutBodyHotspots();
    },
    undefined,
    () => {
      elements.modelStatus.textContent = "模型未载入，可通过部位标签继续";
    },
  );

  bindBodyViewerControls(renderer.domElement);
  resizeBodyViewer();
  new ResizeObserver(resizeBodyViewer).observe(elements.bodyStage);
  animateBodyViewer();
}

function bindBodyViewerControls(canvas) {
  canvas.addEventListener("pointerdown", (event) => {
    if (!bodyViewer?.loaded) return;
    bodyViewer.dragging = true;
    bodyViewer.dragDistance = 0;
    bodyViewer.lastX = event.clientX;
    bodyViewer.lastY = event.clientY;
    bodyViewer.pointerDownAt = performance.now();
    canvas.setPointerCapture?.(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!bodyViewer?.loaded) return;
    if (bodyViewer.dragging) {
      const dx = event.clientX - bodyViewer.lastX;
      const dy = event.clientY - bodyViewer.lastY;
      bodyViewer.dragDistance += Math.abs(dx) + Math.abs(dy);
      bodyViewer.targetRotation += dx * 0.012;
      bodyViewer.targetTilt = THREE.MathUtils.clamp(bodyViewer.targetTilt + dy * 0.003, -0.12, 0.12);
      bodyViewer.lastX = event.clientX;
      bodyViewer.lastY = event.clientY;
      bodyViewer.lastInteraction = performance.now();
      elements.hoverTarget.hidden = true;
      return;
    }
    updateHoverTarget(event);
  });

  canvas.addEventListener("pointerup", (event) => {
    if (!bodyViewer?.loaded) return;
    const wasClick = bodyViewer.dragging && bodyViewer.dragDistance < 7;
    bodyViewer.dragging = false;
    bodyViewer.lastInteraction = performance.now();
    if (wasClick) selectBodyFromPointer(event);
  });

  canvas.addEventListener("pointercancel", () => {
    if (bodyViewer) bodyViewer.dragging = false;
  });

  canvas.addEventListener("pointerleave", () => {
    if (bodyViewer) bodyViewer.dragging = false;
    elements.hoverTarget.hidden = true;
  });
}

function setBodyFocus(partKey) {
  if (!bodyViewer) return;
  bodyViewer.focusedPart = partKey;
  bodyViewer.focusMarker.visible = Boolean(partKey);
  if (!partKey) {
    bodyViewer.cameraGoal = { y: 1.22, z: 5.65, lookY: 1.14 };
    return;
  }
  const part = PARTS[partKey];
  if (partKey === "back" && Math.cos(bodyViewer.currentRotation) > 0.35) {
    bodyViewer.targetRotation = Math.PI;
  }
  bodyViewer.cameraGoal = {
    y: Math.min(1.65, Math.max(0.75, part.cameraY + 0.12)),
    z: partKey === "cardio" ? 4.55 : 4.12,
    lookY: part.cameraY,
  };
}

function getPartFromIntersection(hit) {
  const localPoint = hit.object.worldToLocal(hit.point.clone());
  const y = localPoint.y;
  const z = localPoint.z;
  const x = localPoint.x;

  if (y > 1.48) return "shoulder";
  if (y > 1.27 && Math.abs(x) > 0.19) return "shoulder";
  if (y > 1.13) return z >= 0 ? "chest" : "back";
  if (y > 0.91) return z < -0.045 ? "back" : "core";
  if (y > 0.62) return "glute";
  return "cardio";
}

function raycastBody(event) {
  if (!bodyViewer?.model) return null;
  const rect = bodyViewer.renderer.domElement.getBoundingClientRect();
  const pointer = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, bodyViewer.camera);
  const hit = raycaster.intersectObject(bodyViewer.model, true)[0];
  if (!hit) return null;
  return { hit, part: getPartFromIntersection(hit) };
}

function updateHoverTarget(event) {
  const result = raycastBody(event);
  if (!result) {
    elements.hoverTarget.hidden = true;
    bodyViewer.renderer.domElement.style.cursor = "grab";
    return;
  }
  const rect = elements.bodyStage.getBoundingClientRect();
  elements.hoverTarget.textContent = `点选${PARTS[result.part].name}`;
  elements.hoverTarget.style.left = `${event.clientX - rect.left}px`;
  elements.hoverTarget.style.top = `${event.clientY - rect.top}px`;
  elements.hoverTarget.hidden = false;
  bodyViewer.renderer.domElement.style.cursor = "pointer";
}

function selectBodyFromPointer(event) {
  const result = raycastBody(event);
  if (!result) return;
  activateBodyPart(result.part);
}

function activateBodyPart(partKey) {
  activePart = partKey;
  renderKnowledge();
  renderExercises();
  renderParts();
  navigateTo(`training/part/${partKey}`);
}

function resizeBodyViewer() {
  if (!bodyViewer) return;
  const rect = elements.bodyStage.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  bodyViewer.camera.aspect = width / height;
  bodyViewer.camera.updateProjectionMatrix();
  bodyViewer.renderer.setSize(width, height, false);
}

function layoutBodyHotspots() {
  if (!bodyViewer?.loaded) return;
  const rect = elements.bodyStage.getBoundingClientRect();
  const rotation = bodyViewer.currentRotation;
  const frontVisible = Math.cos(rotation) > -0.08;
  const backVisible = Math.cos(rotation) < 0.08;
  const point = new THREE.Vector3();
  [...elements.partList.querySelectorAll("[data-part]")].forEach((button) => {
    const key = button.dataset.part;
    const anchor = bodyViewer.anchors[key];
    if (!anchor) return;
    const hidden =
      (key === "back" && !backVisible) ||
      (["chest", "core"].includes(key) && !frontVisible);
    button.classList.toggle("is-hidden", hidden);
    button.tabIndex = hidden ? -1 : 0;
    button.setAttribute("aria-hidden", String(hidden));
    if (hidden) return;
    anchor.getWorldPosition(point);
    point.project(bodyViewer.camera);
    const x = (point.x * 0.5 + 0.5) * 100;
    const y = (-point.y * 0.5 + 0.5) * 100;
    button.style.setProperty("--hotspot-x", `${x.toFixed(2)}%`);
    button.style.setProperty("--hotspot-y", `${y.toFixed(2)}%`);
  });
}

function animateBodyViewer() {
  if (!bodyViewer) return;
  const viewer = bodyViewer;
  if (viewer.loaded && viewer.model) {
    if (!viewer.reduceMotion && !viewer.dragging && currentScreen === "home" && performance.now() - viewer.lastInteraction > 3500) {
      viewer.targetRotation += 0.0012;
    }
    viewer.currentRotation += (viewer.targetRotation - viewer.currentRotation) * 0.11;
    viewer.currentTilt += (viewer.targetTilt - viewer.currentTilt) * 0.1;
    viewer.model.rotation.y = viewer.currentRotation;
    viewer.model.rotation.x = viewer.currentTilt;
  }
  viewer.camera.position.y += (viewer.cameraGoal.y - viewer.camera.position.y) * 0.075;
  viewer.camera.position.z += (viewer.cameraGoal.z - viewer.camera.position.z) * 0.075;
  viewer.cameraLookY += (viewer.cameraGoal.lookY - viewer.cameraLookY) * 0.075;
  viewer.camera.lookAt(0, viewer.cameraLookY, 0);
  if (viewer.focusedPart && viewer.anchors[viewer.focusedPart]) {
    viewer.anchors[viewer.focusedPart].getWorldPosition(viewer.focusMarker.position);
    viewer.focusMarker.lookAt(viewer.camera.position);
    const pulse = viewer.reduceMotion ? 1 : 1 + Math.sin(performance.now() * 0.004) * 0.13;
    viewer.focusMarker.scale.setScalar(pulse);
  }
  layoutBodyHotspots();
  viewer.renderer.render(viewer.scene, viewer.camera);
  requestAnimationFrame(animateBodyViewer);
}

function renderEquipmentPicker(part, allActions, selectedEquipment, matchCount) {
  const availableEquipment = Object.keys(EQUIPMENT).filter((key) =>
    allActions.some((action) => action.equipment.includes(key)),
  );
  elements.equipmentMatchCount.textContent =
    selectedEquipment.size === 0 ? `${matchCount} 个全部动作` : `${matchCount} 个匹配动作`;
  elements.equipmentPicker.innerHTML = [
    `<button class="equipment-chip equipment-chip-all${selectedEquipment.size === 0 ? " is-active" : ""}" type="button" data-equipment="all" aria-pressed="${selectedEquipment.size === 0}">全部</button>`,
    ...availableEquipment.map((key) => {
      const active = selectedEquipment.has(key);
      return `<button class="equipment-chip${active ? " is-active" : ""}" type="button" data-equipment="${key}" aria-pressed="${active}">${EQUIPMENT[key]}</button>`;
    }),
  ].join("");
}

// 力量与有氧使用不同字段，力量热量会按训练时长与外部负重修正。
function renderStrengthFields(action, entry, part) {
  const repeatLabel = action.hold ? "单次时长" : "每组次数";
  const repeatHint = action.hold ? "秒" : "可调整";
  const repeatValue = entry.reps || (action.hold ? "30" : "12");
  return `
    <div class="entry-fields">
      <label class="entry-field">
        <span>重量 <em>选填</em></span>
        <span class="entry-input-unit">
          <input type="number" min="0" max="500" step="0.5" inputmode="decimal" value="${escapeAttribute(entry.weight)}" placeholder="自重"
            data-action-id="${action.id}" data-entry-field="weight" aria-label="${action.name}重量，千克" />
          <i>kg</i>
        </span>
      </label>
      <label class="entry-field">
        <span>组数 <em>可调整</em></span>
        <input type="number" min="1" max="30" step="1" inputmode="numeric" value="${escapeAttribute(entry.sets)}"
          data-action-id="${action.id}" data-entry-field="sets" aria-label="${action.name}组数" />
      </label>
      <label class="entry-field">
        <span>${repeatLabel} <em>${repeatHint}</em></span>
        <input type="number" min="1" max="600" step="1" inputmode="numeric" value="${escapeAttribute(repeatValue)}"
          data-action-id="${action.id}" data-entry-field="reps" aria-label="${action.name}${repeatLabel}" />
      </label>
    </div>
  `;
}

function renderCardioFields(action, entry, part) {
  const partName = part.name.replace(/[<>"&]/g, "");
  return `
    <div class="entry-fields entry-fields-cardio">
      <label class="entry-field">
        <span>训练时长</span>
        <input type="number" min="1" max="300" step="1" inputmode="numeric" value="${escapeAttribute(entry.duration)}"
          data-action-id="${action.id}" data-entry-field="duration" aria-label="${action.name}训练时长，分钟" />
      </label>
      <div class="entry-note">${partName}动作按时长估算消耗，结束后记得拉伸和补水。</div>
    </div>
  `;
}

function toggleFavorite(actionId) {
  const favorites = new Set(state.favorites);
  if (favorites.has(actionId)) {
    favorites.delete(actionId);
  } else {
    favorites.add(actionId);
  }
  state.favorites = [...favorites];
  persistState();
  renderExercises();
}

function createDefaultEntry(action) {
  return action.type === "cardio"
    ? { duration: "20" }
    : { weight: "", sets: "3", reps: action.hold ? "30" : "12" };
}

function updateLiveTotals() {
  const weightInfo = getEstimateWeight();
  const summary = calculateSelectedSummary(weightInfo.weight);
  elements.sessionCalories.textContent = summary.calories;
  elements.selectionHint.textContent =
    selectedActions.size > 0
      ? `已选 ${summary.actionCount} 个动作 · ${summary.partCount} 个部位 · 约 ${summary.minutes} 分钟`
      : "已选 0 个动作，约 0 分钟";
  elements.calorieBasis.textContent = `体重基准 ${formatNumber(weightInfo.weight, 1)} kg（${weightInfo.source}）`;
  elements.saveTraining.disabled = selectedActions.size === 0;
  elements.saveDock.classList.toggle("is-visible", selectedActions.size > 0);
  const draftActive = selectedActions.size > 0 && !activeWorkoutPlan?.finished;
  elements.draftTicket.hidden = !draftActive;
  if (draftActive) {
    elements.draftTicketLabel.textContent = `待打印清单 · ${selectedActions.size} 个动作`;
  }
}

function calculateSelectedSummary(bodyWeight) {
  const items = [];
  for (const [id, entry] of selectedActions) {
    const action = getAction(id);
    if (!action) continue;
    const estimate = estimateCalories(action, entry, bodyWeight);
    items.push({
      actionId: action.id,
      part: action.part,
      partName: PARTS[action.part].name,
      name: action.name,
      type: action.type,
      cue: action.cue,
      weight: action.type === "strength" ? clampNumber(entry.weight, 0, 500, 0) : null,
      sets: action.type === "strength" ? clampNumber(entry.sets, 1, 30, 3) : null,
      reps:
        action.type === "strength"
          ? clampNumber(entry.reps, 1, action.hold ? 600 : 200, action.hold ? 30 : 12)
          : null,
      measure: action.hold ? "seconds" : "reps",
      duration: action.type === "cardio" ? clampNumber(entry.duration, 1, 300, 20) : null,
      minutes: estimate.minutes,
      calories: estimate.calories,
    });
  }

  return {
    items,
    actionCount: items.length,
    partCount: new Set(items.map((item) => item.part)).size,
    calories: items.reduce((sum, item) => sum + item.calories, 0),
    minutes: Math.round(items.reduce((sum, item) => sum + item.minutes, 0)),
  };
}

function estimateCalories(action, entry, bodyWeight) {
  if (action.type === "cardio") {
    const minutes = clampNumber(entry.duration, 1, 300, 20);
    const calories = Math.round((action.met * 3.5 * bodyWeight * minutes) / 200);
    return { minutes, calories };
  }

  const sets = clampNumber(entry.sets, 1, 30, 3);
  const reps = clampNumber(entry.reps, 1, action.hold ? 600 : 200, action.hold ? 30 : 12);
  const externalWeight = clampNumber(entry.weight, 0, 500, 0);
  const workSecondsPerRep = action.hold ? 1 : 3;
  const minutes = (sets * (reps * workSecondsPerRep + 45)) / 60;
  const loadFactor = 1 + Math.min(externalWeight / 100, 0.7);
  const calories = Math.round((action.met * 3.5 * bodyWeight * minutes * loadFactor) / 200);
  return { minutes, calories };
}

function getSetCount(item) {
  return item.type === "cardio" ? 1 : item.sets;
}

function countCompletedSets(item) {
  let count = 0;
  for (let index = 0; index < getSetCount(item); index += 1) {
    if (completedSetKeys.has(`${item.actionId}:${index}`)) count += 1;
  }
  return count;
}

function formatReceiptAmount(item) {
  if (item.type === "cardio") return `${item.duration} 分钟`;
  const unit = item.measure === "seconds" ? "秒" : "次";
  const weight = item.weight ? `${item.weight} kg · ` : "";
  return `${weight}${item.sets} 组 × ${item.reps} ${unit}`;
}

// “打印”是训练流程中的关键反馈；最终完成后才写入正式历史记录。
function openWorkoutReceipt() {
  if (selectedActions.size === 0) {
    showToast("先选择至少一个动作");
    return;
  }

  const date = elements.trainingDate.value || toISODate(new Date());
  const weightInfo = getEstimateWeight();
  const summary = calculateSelectedSummary(weightInfo.weight);
  if (summary.items.length === 0) {
    showToast("没有可打印的动作");
    return;
  }

  activeWorkoutPlan = {
    date,
    items: summary.items,
    calories: summary.calories,
    minutes: summary.minutes,
    actionCount: summary.actionCount,
    partCount: summary.partCount,
    bodyWeight: weightInfo.weight,
    finished: false,
  };
  completedSetKeys.forEach((key) => {
    const [actionId] = key.split(":");
    const item = summary.items.find((entry) => entry.actionId === actionId);
    const index = Number(key.split(":")[1]);
    if (!item || index >= getSetCount(item)) completedSetKeys.delete(key);
  });
  celebratedActions.clear();
  activeWorkoutPlan.items.forEach((item) => {
    if (countCompletedSets(item) === getSetCount(item)) celebratedActions.add(item.actionId);
  });

  renderWorkoutReceipt();
  elements.receiptOverlay.hidden = false;
  elements.receiptOverlay.inert = false;
  elements.receiptOverlay.setAttribute("aria-hidden", "false");
  elements.receiptOverlay.classList.remove("is-printing");
  elements.receiptOverlay.classList.add("is-open");
  void elements.receiptOverlay.offsetWidth;
  elements.receiptOverlay.classList.add("is-printing");
  elements.trainingHome.inert = true;
  elements.partSheet.inert = true;
  elements.trainingHome.setAttribute("aria-hidden", "true");
  elements.partSheet.setAttribute("aria-hidden", "true");
  document.querySelector(".receipt-scroll").scrollTop = 0;
  window.setTimeout(() => elements.receiptItems.querySelector("input")?.focus({ preventScroll: true }), 40);
  window.setTimeout(() => elements.receiptOverlay.classList.remove("is-printing"), 2850);
}

function renderWorkoutReceipt() {
  if (!activeWorkoutPlan) return;
  elements.receiptDate.textContent = formatDate(activeWorkoutPlan.date);
  const parts = [...new Set(activeWorkoutPlan.items.map((item) => item.partName))].join(" / ");
  elements.receiptTitle.textContent = parts || "今日训练";
  elements.receiptCalories.textContent = activeWorkoutPlan.calories;
  elements.receiptCompletion.hidden = !activeWorkoutPlan.finished;
  elements.completeTraining.hidden = activeWorkoutPlan.finished;
  elements.addMoreActions.hidden = activeWorkoutPlan.finished;
  elements.finishReceipt.hidden = !activeWorkoutPlan.finished;

  elements.receiptItems.innerHTML = activeWorkoutPlan.items
    .map((item, actionIndex) => {
      const totalSets = getSetCount(item);
      const completedSets = countCompletedSets(item);
      const controls = Array.from({ length: totalSets }, (_, setIndex) => {
        const checked = completedSetKeys.has(`${item.actionId}:${setIndex}`);
        return `
          <label class="set-check">
            <input type="checkbox" data-set-check data-action-id="${item.actionId}" data-set-index="${setIndex}" ${checked ? "checked" : ""} ${activeWorkoutPlan.finished ? "disabled" : ""} />
            <span class="set-check-box"><span class="icon icon-check" aria-hidden="true"></span></span>
            <span class="set-check-label">${item.type === "cardio" ? "完成" : `第 ${setIndex + 1} 组`}</span>
          </label>
        `;
      }).join("");
      return `
        <section class="receipt-action-block print-line${completedSets === totalSets ? " is-complete" : ""}" data-receipt-action="${item.actionId}" style="--line-index:${actionIndex + 3}">
          <div class="receipt-action-head">
            <span class="receipt-action-index">${String(actionIndex + 1).padStart(2, "0")}</span>
            <strong>${item.name}</strong>
            <span>${item.partName}</span>
          </div>
          <p class="receipt-action-meta">${formatReceiptAmount(item)} · 约 ${item.calories} kcal</p>
          <div class="set-checklist">${controls}</div>
        </section>
      `;
    })
    .join("");

  if (activeWorkoutPlan.finished && lastSummary) {
    elements.receiptCompletion.className = "receipt-completion";
    elements.receiptCompletion.innerHTML = `
      <h3>训练完成</h3>
      <p>${escapeHTML(lastSummary)}</p>
      <div class="receipt-summary-metrics">
        <span>${activeWorkoutPlan.actionCount} 个动作</span>
        <span>${activeWorkoutPlan.minutes} 分钟</span>
        <span>约 ${activeWorkoutPlan.calories} 千卡</span>
      </div>
      <button class="copy-button receipt-copy" type="button" data-copy-summary="${escapeAttribute(lastSummary)}">
        <span class="icon icon-copy" aria-hidden="true"></span>
        复制打卡文案
      </button>
    `;
    elements.receiptCompletion.querySelector("[data-copy-summary]")?.addEventListener("click", (event) => {
      copyText(lastSummary, event.currentTarget);
    });
  }
  updateReceiptProgress();
}

function updateReceiptProgress() {
  if (!activeWorkoutPlan) return;
  const total = activeWorkoutPlan.items.reduce((sum, item) => sum + getSetCount(item), 0);
  const completed = activeWorkoutPlan.items.reduce((sum, item) => sum + countCompletedSets(item), 0);
  elements.completeTraining.disabled = completed !== total;
  elements.receiptFooterNote.textContent =
    completed === total ? "全部完成，可以结束训练。" : `已完成 ${completed} / ${total} 组`;
}

function celebrate(target, particleCount = 55) {
  if (typeof window.confetti !== "function" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const rect = target?.getBoundingClientRect?.();
  const origin = rect
    ? {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      }
    : { x: 0.5, y: 0.45 };
  window.confetti({
    particleCount,
    spread: 52,
    startVelocity: 24,
    gravity: 0.85,
    scalar: 0.75,
    ticks: 120,
    origin,
    colors: ["#3f7480", "#a7d5d1", "#d3bd65", "#eadce0", "#ffffff"],
  });
}

function completeWorkout() {
  if (!activeWorkoutPlan || elements.completeTraining.disabled) return;
  const text = makeSessionSummary(activeWorkoutPlan.date, activeWorkoutPlan);
  const session = {
    id: createId(),
    date: activeWorkoutPlan.date,
    createdAt: new Date().toISOString(),
    items: activeWorkoutPlan.items.map((item) => ({
      ...item,
      completedSets: getSetCount(item),
    })),
    calories: activeWorkoutPlan.calories,
    minutes: activeWorkoutPlan.minutes,
    actionCount: activeWorkoutPlan.actionCount,
    partCount: activeWorkoutPlan.partCount,
    parts: [...new Set(activeWorkoutPlan.items.map((item) => item.partName))],
    bodyWeight: activeWorkoutPlan.bodyWeight,
    summary: text,
  };

  state.sessions.push(session);
  if (!persistState()) return;

  lastSummary = text;
  activeWorkoutPlan.finished = true;
  selectedCalendarDate = activeWorkoutPlan.date;
  const [year, month] = activeWorkoutPlan.date.split("-").map(Number);
  calendarCursor = new Date(year, month - 1, 1);
  selectedActions.clear();
  renderExercises();
  updateLiveTotals();
  renderMonthStats();
  renderCalendar();
  renderDayDetail();
  renderWorkoutReceipt();
  elements.receiptCompletion.classList.add("is-printing");
  document.querySelector(".receipt-scroll").scrollTo({
    top: 0,
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
  });
  window.setTimeout(() => celebrate(elements.completeTraining, 120), 600);
  showToast("训练清单已完成并保存在本机");
}

function makeSessionSummary(date, summary) {
  const parts = [...new Set(summary.items.map((item) => item.partName))].join(" + ");
  const encouragement =
    summary.calories >= 220
      ? "今天的训练量很扎实，记得好好恢复。"
      : summary.actionCount >= 3
        ? "动作不在多，稳稳完成就很棒。"
        : "今天也为自己留出了训练时间。";
  return `体线簿打卡｜${formatDate(date)}完成${parts}训练，${summary.actionCount} 个动作，约 ${summary.calories} 千卡。${encouragement} #女生塑形 #训练打卡`;
}

function closeReceipt() {
  elements.receiptOverlay.classList.remove("is-open", "is-printing");
  elements.receiptOverlay.setAttribute("aria-hidden", "true");
  elements.receiptOverlay.inert = true;
  elements.trainingHome.inert = false;
  elements.partSheet.inert = currentScreen !== "part";
  elements.trainingHome.setAttribute("aria-hidden", "false");
  if (activeWorkoutPlan?.finished) {
    completedSetKeys.clear();
    celebratedActions.clear();
    activeWorkoutPlan = null;
    lastSummary = null;
    navigateTo("training");
  } else {
    elements.partSheet.setAttribute("aria-hidden", String(currentScreen !== "part"));
    updateLiveTotals();
  }
}

function addMoreExercises() {
  closeReceipt();
  navigateTo("training");
  showToast("清单已保留，继续选择其他部位");
}

function bindSwipeDismiss(handle, container, dismiss) {
  if (!handle || !container) return;
  let startY = 0;
  let distance = 0;
  let dragging = false;

  const finish = () => {
    if (!dragging) return;
    dragging = false;
    container.classList.remove("is-dragging");
    if (distance > 76) {
      container.style.transform = "";
      dismiss();
      return;
    }
    container.style.transform = "";
  };

  handle.addEventListener("pointerdown", (event) => {
    startY = event.clientY;
    distance = 0;
    dragging = true;
    container.classList.add("is-dragging");
    handle.setPointerCapture?.(event.pointerId);
  });

  handle.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    distance = Math.max(0, event.clientY - startY);
    container.style.transform = `translateY(${distance}px)`;
  });

  handle.addEventListener("pointerup", finish);
  handle.addEventListener("pointercancel", finish);
  handle.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      dismiss();
    }
  });
}

function renderMonthStats() {
  const now = new Date();
  const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const sessions = state.sessions.filter((session) => session.date.startsWith(prefix));
  elements.monthSessionCount.textContent = String(sessions.length);
  elements.monthCalories.textContent = String(
    sessions.reduce((total, session) => total + Number(session.calories || 0), 0),
  );
}

function renderCalendar() {
  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  elements.calendarMonthLabel.textContent = `${year} 年 ${month + 1} 月`;

  const firstDay = new Date(year, month, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = toISODate(new Date());
  const sessionsByDate = groupSessionsByDate();
  const cells = [];

  for (let i = 0; i < mondayOffset; i += 1) {
    cells.push('<span class="calendar-day is-empty" aria-hidden="true"></span>');
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = toISODate(new Date(year, month, day));
    const sessions = sessionsByDate.get(date) || [];
    const classes = [
      "calendar-day",
      date === today ? "is-today" : "",
      date === selectedCalendarDate ? "is-selected" : "",
      sessions.length ? "has-session" : "",
    ]
      .filter(Boolean)
      .join(" ");
    const markers = sessions
      .slice(0, 3)
      .map(() => "<i></i>")
      .join("");
    const allPartNames = [...new Set(sessions.flatMap((session) =>
      session.parts?.length ? session.parts : (session.items || []).map((item) => item.partName),
    ))];
    const partNames = allPartNames.slice(0, 3);
    const partLabels = partNames
      .map((name) => {
        const part = Object.values(PARTS).find((entry) => entry.name === name);
        const shortName = { 臀腿: "臀", 背部: "背", 肩部: "肩", 胸部: "胸", 核心: "核", 有氧: "有" }[name] || name.slice(0, 1);
        return `<span class="day-part-name" title="${name}" style="--part-accent:${part?.accent || "#6b7b75"}">${shortName}</span>`;
      })
      .join("") + (allPartNames.length > 3
        ? `<span class="day-part-more">+${allPartNames.length - 3}</span>`
        : "");
    const aria = sessions.length
      ? `${formatDate(date)}，${sessions.length} 次训练，${allPartNames.join("、")}`
      : `${formatDate(date)}，无训练记录`;
    cells.push(`
      <button class="${classes}" type="button" role="gridcell" data-calendar-date="${date}" aria-label="${aria}" aria-selected="${date === selectedCalendarDate}">
        <span class="day-number">${day}</span>
        <span class="day-markers" aria-hidden="true">${markers}</span>
        <span class="day-parts" aria-hidden="true">${partLabels}</span>
      </button>
    `);
  }

  const tail = (7 - ((mondayOffset + daysInMonth) % 7)) % 7;
  for (let i = 0; i < tail; i += 1) {
    cells.push('<span class="calendar-day is-empty" aria-hidden="true"></span>');
  }

  elements.calendarGrid.innerHTML = cells.join("");
}

// 日历格子只展示记录存在与否；点击后在右侧呈现当天全部 session。
function renderDayDetail() {
  const sessions = (groupSessionsByDate().get(selectedCalendarDate) || []).slice().sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  const totalCalories = sessions.reduce((sum, session) => sum + Number(session.calories || 0), 0);

  const heading = `
    <div class="day-detail-header">
      <h3>${formatDate(selectedCalendarDate, true)}</h3>
      <span>${sessions.length ? `${sessions.length} 次 · ${totalCalories} 千卡` : "还没有记录"}</span>
    </div>
  `;

  if (!sessions.length) {
    elements.dayDetail.innerHTML = `
      ${heading}
      <div class="day-empty">
        <div>
          <span class="icon icon-calendar-days" aria-hidden="true"></span>
          <p>这一天还没有训练记录。选择动作并保存，日历上就会留下一个小小的脚印。</p>
        </div>
      </div>
    `;
    return;
  }

  const sessionMarkup = sessions
    .map((session) => {
      const items = (session.items || [])
        .map((item) => {
          const amount =
            item.type === "cardio"
              ? `${item.duration} 分钟`
              : item.measure === "seconds"
                ? `${item.sets} 组 × ${item.reps} 秒`
                : `${item.sets} 组 × ${item.reps} 次`;
          const checks = Array.from({ length: item.type === "cardio" ? 1 : item.sets || 1 }, () =>
            '<span class="archive-check">✓</span>',
          ).join("");
          return `
            <div class="archive-action">
              <div class="session-item"><span>${item.name}</span><span>${amount}</span></div>
              <div class="archive-checks">${checks}</div>
            </div>
          `;
        })
        .join("");
      return `
        <article class="archive-receipt">
          <div class="archive-receipt-head">
            <div>
              <span>训练清单</span>
              <strong>${(session.parts || []).join(" + ")}</strong>
            </div>
            <span>${session.calories} kcal</span>
          </div>
          <div class="archive-actions">${items}</div>
          <p class="archive-summary">${escapeHTML(session.summary || "")}</p>
          <div class="archive-footer">
            <span>${session.minutes || "—"} min · ${session.actionCount || (session.items || []).length} actions</span>
            <button class="copy-button" type="button" data-copy-summary="${escapeAttribute(session.summary)}">
              <span class="icon icon-copy" aria-hidden="true"></span>
              复制文案
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  elements.dayDetail.innerHTML = `${heading}${sessionMarkup}`;
}

function saveMeasurement(event) {
  event.preventDefault();
  elements.measurementError.textContent = "";

  const formData = new FormData(elements.measurementForm);
  const date = String(formData.get("date") || "");
  const weight = Number(formData.get("weight"));
  const bodyFat = Number(formData.get("bodyFat"));
  const waist = optionalNumber(formData.get("waist"));
  const hip = optionalNumber(formData.get("hip"));

  if (!isValidISODate(date)) {
    elements.measurementError.textContent = "请选择有效的记录日期。";
    elements.measurementDate.focus();
    return;
  }
  if (!Number.isFinite(weight) || weight < 20 || weight > 300) {
    elements.measurementError.textContent = "体重请填写 20–300 kg 之间的数值。";
    document.getElementById("weight").focus();
    return;
  }
  if (!Number.isFinite(bodyFat) || bodyFat < 3 || bodyFat > 70) {
    elements.measurementError.textContent = "体脂率请填写 3%–70% 之间的数值。";
    document.getElementById("body-fat").focus();
    return;
  }
  if (waist !== null && (waist < 35 || waist > 250)) {
    elements.measurementError.textContent = "腰围请填写 35–250 cm 之间的数值，或留空。";
    document.getElementById("waist").focus();
    return;
  }
  if (hip !== null && (hip < 45 || hip > 250)) {
    elements.measurementError.textContent = "臀围请填写 45–250 cm 之间的数值，或留空。";
    document.getElementById("hip").focus();
    return;
  }

  const existing = state.measurements.find((item) => item.date === date);
  const measurement = {
    id: existing?.id || createId(),
    date,
    weight: round(weight, 1),
    bodyFat: round(bodyFat, 1),
    waist: waist === null ? (existing?.waist ?? null) : round(waist, 1),
    hip: hip === null ? (existing?.hip ?? null) : round(hip, 1),
    updatedAt: new Date().toISOString(),
  };

  if (existing) {
    Object.assign(existing, measurement);
  } else {
    state.measurements.push(measurement);
  }

  if (!persistState()) return;
  elements.measurementForm.reset();
  elements.measurementDate.value = date;
  renderMeasurements();
  renderChart();
  renderHistory();
  updateLiveTotals();
  showToast(existing ? "该日身材记录已更新" : "身材记录已保存到本机");
  navigateTo("body");
}

function renderMeasurements() {
  const latest = getLatestMeasurement();
  if (latest && !elements.measurementForm.contains(document.activeElement)) {
    document.getElementById("weight").placeholder = String(latest.weight);
    document.getElementById("body-fat").placeholder = String(latest.bodyFat);
  }
}

function renderBodySnapshot() {
  const latest = getLatestMeasurement();
  elements.latestWeight.textContent = latest
    ? `${formatNumber(latest.weight, 1)} kg`
    : "暂无";
  elements.latestBodyFat.textContent = latest
    ? `${formatNumber(latest.bodyFat, 1)}%`
    : "暂无";
}

function saveMilestone(event) {
  event.preventDefault();
  elements.milestoneError.textContent = "";
  const date = elements.milestoneDate.value;
  const label = elements.milestoneLabel.value.trim();

  if (!isValidISODate(date)) {
    elements.milestoneError.textContent = "请选择有效的里程碑日期。";
    return;
  }
  if (!label) {
    elements.milestoneError.textContent = "写一句简短说明，再标记到曲线。";
    return;
  }

  state.milestones.push({
    id: createId(),
    date,
    label: label.slice(0, 30),
    createdAt: new Date().toISOString(),
  });

  if (!persistState()) return;
  elements.milestoneLabel.value = "";
  renderMilestones();
  renderChart();
  showToast("里程碑已标记到趋势图");
}

function renderMilestones() {
  const milestones = [...state.milestones].sort((a, b) => a.date.localeCompare(b.date));
  elements.milestoneCount.textContent = `${milestones.length} 个`;
  if (!milestones.length) {
    elements.milestoneList.innerHTML = '<p class="empty-milestones">还没有里程碑。第一次稳定训练、完成阶段目标，都值得记下来。</p>';
    return;
  }
  elements.milestoneList.innerHTML = milestones
    .map(
      (milestone) => `
        <span class="milestone-chip">
          <span class="milestone-chip-copy">
            <strong>${escapeHTML(milestone.label)}</strong>
            <span>${formatDate(milestone.date)}</span>
          </span>
          <button type="button" data-delete-milestone="${milestone.id}" aria-label="删除里程碑 ${escapeAttribute(milestone.label)}">
            <span class="icon icon-x" aria-hidden="true"></span>
          </button>
        </span>
      `,
    )
    .join("");
}

// 图表使用原生 SVG，以避免外部图表依赖并保证离线双击运行。
function renderChart() {
  const metric = METRICS[activeMetric];
  const isCompact = (elements.chartWrap.clientWidth || 380) < 560;
  elements.chartTooltip.hidden = true;
  elements.metricTabs.forEach((tab) => {
    const active = tab.dataset.metric === activeMetric;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });

  const points = state.measurements
    .filter((measurement) => Number.isFinite(Number(measurement[activeMetric])))
    .map((measurement) => ({
      date: measurement.date,
      value: Number(measurement[activeMetric]),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  elements.trendLatestLabel.textContent = `最新${metric.label}`;
  elements.trendLatestValue.textContent = points.length
    ? `${formatNumber(points.at(-1).value, metric.decimals)} ${metric.unit}`
    : "暂无";
  elements.chartWrap.style.setProperty("--chart-color", metric.color);

  if (!points.length) {
    elements.trendChart.innerHTML = `
      <div class="chart-empty">
        <img src="assets/illustrations/undraw-fitness-stats.svg" alt="" />
        <div>
          <h3>从第一条记录开始</h3>
          <p>录入体重和体脂率后，这里会生成你的${metric.label}曲线。每周固定时间记录，更容易看见真正的方向。</p>
        </div>
      </div>
    `;
    elements.chartTooltip.hidden = true;
    return;
  }

  const svgWidth = isCompact ? 380 : 820;
  const svgHeight = isCompact ? 290 : 320;
  const padding = isCompact
    ? { left: 38, right: 22, top: 34, bottom: 42 }
    : { left: 52, right: 24, top: 34, bottom: 42 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;
  const dateValues = points.map((point) => dateToLocalTimestamp(point.date));
  let minX = Math.min(...dateValues);
  let maxX = Math.max(...dateValues);
  if (minX === maxX) {
    minX -= 3 * 86400000;
    maxX += 3 * 86400000;
  }

  const rawValues = points.map((point) => point.value);
  let minY = Math.min(...rawValues);
  let maxY = Math.max(...rawValues);
  const yRange = maxY - minY || Math.max(Math.abs(maxY) * 0.08, 2);
  minY -= yRange * 0.35;
  maxY += yRange * 0.35;
  if (metric.key === "bodyFat") {
    minY = Math.max(0, minY);
  }

  const xScale = (value) => padding.left + ((value - minX) / (maxX - minX)) * plotWidth;
  const yScale = (value) => padding.top + (1 - (value - minY) / (maxY - minY)) * plotHeight;
  const plotted = points.map((point) => ({
    ...point,
    x: xScale(dateToLocalTimestamp(point.date)),
    y: yScale(point.value),
  }));

  const gridTicks = 4;
  const yTicks = Array.from({ length: gridTicks + 1 }, (_, index) => {
    const value = minY + ((maxY - minY) * index) / gridTicks;
    return {
      value,
      y: yScale(value),
    };
  });

  const xLabelIndexes = new Set([0, points.length - 1]);
  if (points.length > 2) xLabelIndexes.add(Math.floor((points.length - 1) / 2));

  const linePath = makeSmoothPath(plotted);
  const areaPath =
    plotted.length === 1
      ? ""
      : `${linePath} L ${plotted.at(-1).x} ${padding.top + plotHeight} L ${plotted[0].x} ${padding.top + plotHeight} Z`;

  const visibleMilestones = state.milestones
    .filter((milestone) => {
      const time = dateToLocalTimestamp(milestone.date);
      return time >= minX && time <= maxX;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const gridMarkup = yTicks
    .map(
      (tick) => `
        <line class="chart-grid-line" x1="${padding.left}" y1="${tick.y}" x2="${svgWidth - padding.right}" y2="${tick.y}" />
        <text class="chart-axis-label" x="${padding.left - 10}" y="${tick.y + 3}" text-anchor="end">${formatNumber(tick.value, metric.decimals)}</text>
      `,
    )
    .join("");

  const xLabels = plotted
    .map((point, index) => {
      if (!xLabelIndexes.has(index)) return "";
      const anchor = index === 0 ? "start" : index === plotted.length - 1 ? "end" : "middle";
      return `<text class="chart-axis-label" x="${point.x}" y="${svgHeight - 12}" text-anchor="${anchor}">${formatShortDate(point.date)}</text>`;
    })
    .join("");

  const milestoneMarkup = visibleMilestones
    .map((milestone, index) => {
      const x = xScale(dateToLocalTimestamp(milestone.date));
      const labelY = index % 2 === 0 ? 18 : 29;
      const shortLabel = truncateText(milestone.label, 12);
      return `
        <line class="milestone-line" x1="${x}" y1="${padding.top - 6}" x2="${x}" y2="${padding.top + plotHeight}" />
        <rect class="milestone-diamond" x="${x - 4}" y="${padding.top - 9}" width="8" height="8" transform="rotate(45 ${x} ${padding.top - 5})" />
        <text class="milestone-label" x="${x}" y="${labelY}" text-anchor="middle">${escapeHTML(shortLabel)}</text>
      `;
    })
    .join("");

  const pointMarkup = plotted
    .map(
      (point, index) => `
        <g class="chart-point-group" tabindex="0" role="button"
          aria-label="${formatDate(point.date)} ${metric.label} ${point.value} ${metric.unit}"
          data-point-index="${index}" data-tooltip-date="${formatDate(point.date)}"
          data-tooltip-value="${formatNumber(point.value, metric.decimals)} ${metric.unit}">
          <circle class="chart-crosshair" cx="${point.x}" cy="${padding.top}" r="0" />
          <circle class="chart-point-ring" cx="${point.x}" cy="${point.y}" r="5.5" />
          <circle class="chart-point-dot" cx="${point.x}" cy="${point.y}" r="2.3" />
        </g>
      `,
    )
    .join("");

  elements.trendChart.innerHTML = `
    <svg viewBox="0 0 ${svgWidth} ${svgHeight}" role="img" aria-labelledby="chart-title chart-description">
      <title id="chart-title">${metric.label}变化曲线</title>
      <desc id="chart-description">共 ${points.length} 条记录，从 ${formatDate(points[0].date)} 的 ${points[0].value}${metric.unit} 到 ${formatDate(points.at(-1).date)} 的 ${points.at(-1).value}${metric.unit}。图表内有 ${visibleMilestones.length} 个里程碑标记。</desc>
      <defs>
        <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${metric.color}" stop-opacity="0.23" />
          <stop offset="100%" stop-color="${metric.color}" stop-opacity="0.01" />
        </linearGradient>
      </defs>
      ${gridMarkup}
      ${milestoneMarkup}
      ${areaPath ? `<path class="chart-area" d="${areaPath}" />` : ""}
      <path class="chart-line" d="${linePath}" />
      ${pointMarkup}
      ${xLabels}
    </svg>
  `;

  elements.chartWrap.dataset.chartWidth = String(svgWidth);
  elements.chartWrap.dataset.chartHeight = String(svgHeight);
  bindChartTooltip();
}

function bindChartTooltip() {
  const points = [...elements.trendChart.querySelectorAll(".chart-point-group")];
  const chartWidth = Number(elements.chartWrap.dataset.chartWidth) || 820;
  const chartHeight = Number(elements.chartWrap.dataset.chartHeight) || 320;
  const show = (point) => {
    const pointCircle = point.querySelector(".chart-point-ring");
    const x = Number(pointCircle.getAttribute("cx"));
    const y = Number(pointCircle.getAttribute("cy"));
    const ratioX = x / chartWidth;
    const ratioY = y / chartHeight;
    elements.chartTooltip.innerHTML = `<strong>${point.dataset.tooltipValue}</strong>${point.dataset.tooltipDate}`;
    elements.chartTooltip.style.left = `${ratioX * 100}%`;
    elements.chartTooltip.style.top = `${ratioY * 100}%`;
    elements.chartTooltip.hidden = false;
    point.querySelector(".chart-crosshair").setAttribute("r", "3");
  };
  const hide = (point) => {
    elements.chartTooltip.hidden = true;
    point?.querySelector(".chart-crosshair")?.setAttribute("r", "0");
  };

  points.forEach((point) => {
    point.addEventListener("pointerenter", () => show(point));
    point.addEventListener("pointerleave", () => hide(point));
    point.addEventListener("focus", () => show(point));
    point.addEventListener("blur", () => hide(point));
  });
}

function renderHistory() {
  const measurements = [...state.measurements].sort((a, b) => b.date.localeCompare(a.date));
  elements.historyCount.textContent = measurements.length ? `共 ${measurements.length} 条记录` : "尚无记录";
  elements.historyDetailCount.textContent = `${measurements.length} 条`;
  if (!measurements.length) {
    elements.historyBody.innerHTML = `
      <p class="empty-history">保存身材数据后，历史记录会按日期排列在这里。</p>
    `;
    return;
  }

  elements.historyBody.innerHTML = measurements
    .map(
      (measurement) => `
        <article class="history-row">
          <div class="history-row-top">
            <span class="history-date">${formatDate(measurement.date, true)}</span>
            <button class="history-delete" type="button" data-delete-measurement="${measurement.id}" aria-label="删除 ${formatDate(measurement.date)} 的身材记录">
              <span class="icon icon-trash-2" aria-hidden="true"></span>
            </button>
          </div>
          <div class="history-metrics">
            <span class="history-metric"><span>体重</span><strong>${formatNumber(measurement.weight, 1)}<b class="history-unit">kg</b></strong></span>
            <span class="history-metric"><span>体脂</span><strong>${formatNumber(measurement.bodyFat, 1)}<b class="history-unit">%</b></strong></span>
            <span class="history-metric"><span>腰围</span><strong>${measurement.waist == null ? "—" : `${formatNumber(measurement.waist, 1)}<b class="history-unit">cm</b>`}</strong></span>
            <span class="history-metric"><span>臀围</span><strong>${measurement.hip == null ? "—" : `${formatNumber(measurement.hip, 1)}<b class="history-unit">cm</b>`}</strong></span>
          </div>
        </article>
      `,
    )
    .join("");
}

function getLatestMeasurement() {
  return [...state.measurements].sort((a, b) => b.date.localeCompare(a.date))[0] || null;
}

function getEstimateWeight() {
  const latest = getLatestMeasurement();
  if (latest && Number.isFinite(Number(latest.weight))) {
    return { weight: Number(latest.weight), source: "最近记录" };
  }
  return { weight: 55, source: "体验值" };
}

function groupSessionsByDate() {
  return state.sessions.reduce((map, session) => {
    if (!map.has(session.date)) map.set(session.date, []);
    map.get(session.date).push(session);
    return map;
  }, new Map());
}

function getAction(id) {
  return ACTIONS.find((action) => action.id === id);
}

function videoSearchUrl(name) {
  return `https://search.bilibili.com/all?keyword=${encodeURIComponent(`${name} 动作教学`)}`;
}

function makeSmoothPath(points) {
  if (!points.length) return "";
  if (points.length === 1) return `M ${points[0].x - 18} ${points[0].y} H ${points[0].x + 18}`;
  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const controlDistance = (point.x - previous.x) / 3;
    return `${path} C ${previous.x + controlDistance} ${previous.y}, ${point.x - controlDistance} ${point.y}, ${point.x} ${point.y}`;
  }, "");
}

function createId() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(dateString, withWeekday = false) {
  if (!isValidISODate(dateString)) return dateString;
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(withWeekday ? { weekday: "short" } : {}),
  }).format(date);
}

function formatShortDate(dateString) {
  const [, month, day] = dateString.split("-").map(Number);
  return `${month}.${day}`;
}

function dateToLocalTimestamp(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day).getTime();
}

function isValidISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  return toISODate(new Date(`${value}T00:00:00`)) === value;
}

function formatNumber(value, decimals = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return number.toLocaleString("zh-CN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

function optionalNumber(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.min(max, Math.max(min, number));
}

function round(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function truncateText(text, length) {
  return text.length > length ? `${text.slice(0, length)}…` : text;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  if (value === null || value === undefined) return "";
  return escapeHTML(value).replaceAll("`", "&#096;");
}

async function copyText(text, button) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      fallbackCopy(text);
    }
    const original = button?.innerHTML;
    if (button) {
      button.innerHTML = '<span class="icon icon-check" aria-hidden="true"></span> 已复制';
      window.setTimeout(() => {
        button.innerHTML = original;
      }, 1600);
    }
    showToast("打卡文案已复制");
  } catch {
    try {
      fallbackCopy(text);
      showToast("打卡文案已复制");
    } catch {
      showToast("复制失败，请手动选择文字");
    }
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Copy command failed");
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2600);
}
