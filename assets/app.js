const roles = [
  { id: "ir_supreme", name: "伊朗新任最高领袖", group: "伊朗最高层" },
  { id: "ir_president", name: "伊朗总统", group: "伊朗最高层" },
  { id: "us_president", name: "美国总统", group: "美以阵营" },
  { id: "il_president", name: "以色列总统", group: "美以阵营" },
  { id: "ir_hard", name: "伊朗强硬派高层", group: "伊朗派系" },
  { id: "ir_prous", name: "伊朗亲美派高层", group: "伊朗派系" },
  { id: "ir_neutral", name: "伊朗中立派高层", group: "伊朗派系" },
  { id: "saudi", name: "沙特阿拉伯领导人", group: "海湾国家" },
  { id: "uae", name: "阿联酋领导人", group: "海湾国家" },
  { id: "bahrain", name: "巴林领导人", group: "海湾国家" },
  { id: "iraq", name: "伊拉克领导人", group: "地区国家" },
  { id: "syria", name: "叙利亚领导人", group: "地区国家" },
  { id: "qatar", name: "卡塔尔领导人", group: "海湾国家" },
  { id: "oman", name: "阿曼领导人", group: "海湾国家" },
  { id: "kuwait", name: "科威特领导人", group: "海湾国家" },
  { id: "lebanon", name: "黎巴嫩（伊朗盟友）领导人", group: "地区国家" },
  { id: "yemen", name: "也门领导人", group: "地区国家" },
  { id: "china", name: "中国领导人", group: "全球主要国家" },
  { id: "russia", name: "俄罗斯领导人", group: "全球主要国家" },
  { id: "ir_public", name: "伊朗民众", group: "社会公众" },
  { id: "us_public", name: "美国民众", group: "社会公众" },
  { id: "il_public", name: "以色列民众", group: "社会公众" }
]

const groups = [...new Set(roles.map(r => r.group))]
const state = { newsText: "", url: "", ctx: null, activeGroups: new Set(groups) }

const newsUrlEl = document.getElementById("newsUrl")
const analyzeBtn = document.getElementById("analyzeBtn")
const roleGrid = document.getElementById("roleGrid")
const summaryEl = document.getElementById("summary")
const summaryTextEl = document.getElementById("summaryText")
const filterGrid = document.getElementById("filterGrid")
const copyAllBtn = document.getElementById("copyAll")
const exportJsonBtn = document.getElementById("exportJson")
const resetLink = document.getElementById("reset")

function toProxyUrl(u) {
  const cleaned = u.trim().replace(/^https?:\/\//, "")
  return `https://r.jina.ai/http://${cleaned}`
}

function has(text, arr) {
  return arr.some(k => text.includes(k))
}

function buildCtx(text) {
  const t = text.slice(0, 20000)
  const hormuz = has(t, ["霍尔木兹", "海峡"])
  const tanker = has(t, ["油轮", "船只被击中", "海上袭击", "被击中"])
  const leaderKilled = has(t, ["被杀死", "遇害", "斩首", "高层被消灭"])
  const israel = has(t, ["以色列", "特拉维夫", "以军"])
  const usa = has(t, ["美国", "美军", "华盛顿"])
  const iran = has(t, ["伊朗"])
  const oilDep = has(t, ["石油", "出口", "收入", "65%"])
  const pipeline = has(t, ["戈雷", "贾斯克", "管道", "30万"])
  const escalation = leaderKilled || (israel && usa && iran) || has(t, ["大规模", "全面", "升级"])
  const market = has(t, ["油价", "通货膨胀", "市场"])
  const sect = has(t, ["什叶", "逊尼", "宗教", "信仰"])
  const media = has(t, ["舆论", "媒体", "社交", "视频"])
  return { hormuz, tanker, leaderKilled, israel, usa, iran, oilDep, pipeline, escalation, market, sect, media }
}

function summarize(ctx) {
  const items = []
  if (ctx.tanker && ctx.hormuz) items.push("霍尔木兹海峡附近船只受袭，海上通道风险显著上升。")
  if (ctx.leaderKilled) items.push("伊朗高层遇害，指挥链承压，内部权力重组迫切。")
  if (ctx.israel || ctx.usa) items.push("美以与伊朗对抗加剧，区域冲突外溢风险提升。")
  if (ctx.oilDep) items.push("伊朗财政对石油高度依赖，出口受阻将加剧国内压力。")
  if (ctx.pipeline) items.push("替代管道能力有限，难以完全绕开海峡通道。")
  if (items.length === 0) items.push("事件涉及区域安全、能源与政治博弈，需动态评估。")
  return items.join("\n")
}

function gen(role, ctx) {
  const base = { thought: "", actions: [], tags: [] }
  const severe = ctx.escalation ? "高" : ctx.tanker || ctx.hormuz ? "中" : "低"
  const energyStress = ctx.oilDep ? "高" : ctx.hormuz ? "中" : "低"
  if (role.id === "ir_supreme") {
    base.thought = "核心目标为稳住指挥与社会信心，在外部高压下维持国家生存与威慑。海上通道与国内次生风险需同步管控。"
    base.actions = [
      "宣布过渡指挥安排与全国安全态势级别提升",
      "授权快速反制与远程威慑，但避免失控升级",
      "建立海上护航走廊与能源应急分配机制",
      "对外释放谈判窗口，以交换停火与通道安全"
    ]
    base.tags = ["稳控", "威慑", `升级:${severe}`, `能源:${energyStress}`]
  } else if (role.id === "ir_president") {
    base.thought = "优先维持社会运行与经济韧性，外部应对以可控成本为原则，争取金融与物资缓冲。"
    base.actions = [
      "实施燃油与生活必需品配给与价格稳定措施",
      "推动与海湾国家就通道安全进行技术性磋商",
      "加速内陆与管道替代方案的短期扩容",
      "对内开启信息发布与谣言治理，抚慰民心"
    ]
    base.tags = ["民生", "经济", `能源:${energyStress}`]
  } else if (role.id === "us_president") {
    base.thought = "维护航行自由与盟友安全，防止冲突外溢至全球市场，保持可控升级与联盟协调。"
    base.actions = [
      "加强海湾巡航与情报共享，设定红线",
      "推动与海湾国家的多边通道安全框架",
      "对伊朗实施定向制裁与外交压力，保留谈判通道",
      "稳定能源市场，与产油国沟通增产与库存释放"
    ]
    base.tags = ["联盟", "威慑", "市场稳定"]
  } else if (role.id === "il_president") {
    base.thought = "压制伊朗威胁与代理网络以提升自身安全边际，兼顾国际舆论与作战节奏。"
    base.actions = [
      "巩固导弹防御与远程打击能力配置",
      "在国际场合强调伊朗威胁以争取政治空间",
      "与美国协调行动门槛与终止条件",
      "避免误伤第三方航运以降低反噬"
    ]
    base.tags = ["威慑", "协调", "舆论"]
  } else if (role.id === "ir_hard") {
    base.thought = "认为唯有强硬反制才能重建威慑，主张海上与区域纵深的复合打击能力。"
    base.actions = [
      "提升弹道与无人系统的饱和攻击准备",
      "在霍尔木兹周边进行示强式封控与护航",
      "推动代理力量对敌方资产进行非对称骚扰",
      "限制对外让步，争取更高议价位置"
    ]
    base.tags = ["强硬", `升级:${severe}`]
  } else if (role.id === "ir_prous") {
    base.thought = "倾向缓和对抗以获取制裁缓解与经济通道，优先恢复基本贸易与金融往来。"
    base.actions = [
      "主动通过第三方传递止战意愿",
      "提出通道安全的联合巡航与技术合作",
      "寻求分阶段核与导弹约束以换取经济缓冲",
      "减少高调军事动作，争取外资与技术支持"
    ]
    base.tags = ["缓和", "经济"]
  } else if (role.id === "ir_neutral") {
    base.thought = "主张成本可控的战略自主，既保持威慑又维持开放的经济接口。"
    base.actions = [
      "建立通道安全的区域对话机制",
      "推进替代出口路径与结算多元化",
      "在国内进行产业与财政结构的风险对冲",
      "避免战略孤立，保持多边沟通"
    ]
    base.tags = ["平衡", "多边"]
  } else if (role.id === "saudi") {
    base.thought = "关注能源与通道稳定，避免区域全面战争，保持对冲与调解空间。"
    base.actions = [
      "协调欧佩克+节奏以平抑油价波动",
      "提出海湾通道联合安保与预警共享",
      "劝和促谈，避免触发极端封锁",
      "强化本国关键基础设施的防护"
    ]
    base.tags = ["能源", "调解"]
  } else if (role.id === "uae") {
    base.thought = "重视贸易枢纽地位与金融稳定，倾向技术性降温与航运保护。"
    base.actions = [
      "推动港口与航运公司的风险分级与护航安排",
      "开展多边保险与赔付机制以维持运力",
      "与各方开展低调斡旋，降低军事误判",
      "加强跨境资金监管与市场沟通"
    ]
    base.tags = ["航运", "金融"]
  } else if (role.id === "bahrain") {
    base.thought = "与区域盟友协同维稳，防止冲突引发国内金融与社会波动。"
    base.actions = [
      "参与联合巡航与情报共享",
      "提升港湾与近岸防护等级",
      "对内发布风险提示与企业连续性计划",
      "保持与美以的安全协调"
    ]
    base.tags = ["协同", "防护"]
  } else if (role.id === "iraq") {
    base.thought = "避免本国成为代理战场，平衡对美与对伊朗关系并约束民兵活动。"
    base.actions = [
      "限制境内武装对外动作，防范报复链条",
      "推进经济与能源互利合作而非军事卷入",
      "与邻国建立边境安全沟通",
      "寻求国际组织支持的缓和倡议"
    ]
    base.tags = ["去军事化", "边境安全"]
  } else if (role.id === "syria") {
    base.thought = "在自身脆弱环境下，利用外部矛盾争取政治与安全收益。"
    base.actions = [
      "提高防空与关键节点警戒",
      "协调友军行动以避免本国受打击",
      "争取援助与重建资源",
      "通过外交渠道强调主权与稳定诉求"
    ]
    base.tags = ["防空", "稳态"]
  } else if (role.id === "qatar") {
    base.thought = "以调停者定位维护国际影响力，注重媒体与外交资源整合。"
    base.actions = [
      "提出停火与囚交换的框架性建议",
      "利用媒体平台进行降温倡议",
      "保障天然气供应链稳定",
      "协调人道援助通道"
    ]
    base.tags = ["调停", "能源"]
  } else if (role.id === "oman") {
    base.thought = "发挥中立通道角色，推动技术性安全安排与对话。"
    base.actions = [
      "组织海上安全联络机制",
      "为各方提供低调沟通场域",
      "推动护航窗口与时段化通行",
      "加强本国岸线监视"
    ]
    base.tags = ["中立", "通道"]
  } else if (role.id === "kuwait") {
    base.thought = "谨慎维持与各方关系，聚焦能源稳定与社会安全。"
    base.actions = [
      "提升港口与油气设施警戒",
      "与盟友共享通道风险情报",
      "出台价格与供应的稳定措施",
      "避免卷入前线军事行动"
    ]
    base.tags = ["能源", "谨慎"]
  } else if (role.id === "lebanon") {
    base.thought = "在复杂国内局势下，协调与伊朗相关力量的行动门槛，防止全面升级。"
    base.actions = [
      "约束跨境军事行为的频率与强度",
      "加强边境与民防准备",
      "推进政治协调与社会稳定措施",
      "保留与外部调解的沟通渠道"
    ]
    base.tags = ["边境", "协调"]
  } else if (role.id === "yemen") {
    base.thought = "利用海上通道议题施压，但需避免过度反击导致本国承压。"
    base.actions = [
      "调整海上活动以增加谈判筹码",
      "避免触发对港口与民生的报复",
      "与区域调停方保持沟通",
      "强化物资与粮食保障"
    ]
    base.tags = ["海上", "筹码"]
  } else if (role.id === "china") {
    base.thought = "维护国际市场稳定与人员物资安全，倡导政治解决与不扩散原则。"
    base.actions = [
      "呼吁克制与对话，反对破坏航行自由",
      "与产油国沟通保障供应与价格稳定",
      "保护在该区域的企业与人员安全",
      "支持联合国框架下的调解努力"
    ]
    base.tags = ["稳定", "多边"]
  } else if (role.id === "russia") {
    base.thought = "利用地缘机会扩大影响力，同时控制与西方的对抗幅度。"
    base.actions = [
      "在能源与军技上与相关方开展选择性合作",
      "推动替代路线与本币结算",
      "在外交上支持停火窗口以争取筹码",
      "加强信息战与舆论塑形"
    ]
    base.tags = ["影响力", "能源"]
  } else if (role.id === "ir_public") {
    base.thought = "优先保障家庭安全与基本生活，关注通道受阻导致的物资与价格压力，并期待冲突降温。"
    base.actions = [
      "准备居家应急物资与避险清单，关注官方预警",
      "理性获取信息，避免谣言与恐慌性囤积",
      "参与社区互助与志愿服务，保障弱势群体",
      "呼吁各方克制与谈判，减少军事升级"
    ]
    base.tags = ["安全", "民生", (ctx.oilDep || ctx.hormuz) ? "物资压力" : "关注经济"]
  } else if (role.id === "us_public") {
    base.thought = "关注国际冲突对能源价格与国内经济的影响，希望在支持盟友与避免深度介入之间取得平衡。"
    base.actions = [
      "关注官方信息与媒体多源报道，避免极化与误判",
      "倡议理性对外政策，减少人员伤亡与财政负担",
      "支持人道援助与外交降温努力",
      "做好家庭财务与出行的风险规划"
    ]
    base.tags = ["理性", (ctx.market || ctx.hormuz) ? "油价压力" : "经济关注", "人道"]
  } else if (role.id === "il_public") {
    base.thought = "聚焦导弹威胁与民防准备，期待政府确保安全同时避免长期消耗性战争。"
    base.actions = [
      "按照民防部门指引准备避难所与应急物资",
      "保持社区互助与心理支持，降低恐慌",
      "关注人质与边境安全议题，推动审慎行动",
      "配合公共秩序与预警演练，减少伤亡"
    ]
    base.tags = ["民防", "防空", ctx.escalation ? "高警戒" : "常备"]
  }
  if (ctx.hormuz) base.tags.push("霍尔木兹")
  if (ctx.tanker) base.tags.push("航运风险")
  if (ctx.leaderKilled) base.tags.push("高层遇害")
  return base
}

function renderFilters() {
  filterGrid.innerHTML = ""
  groups.forEach(g => {
    const el = document.createElement("label")
    el.className = "filter-item"
    const box = document.createElement("input")
    box.type = "checkbox"
    box.checked = state.activeGroups.has(g)
    box.addEventListener("change", () => {
      if (box.checked) state.activeGroups.add(g)
      else state.activeGroups.delete(g)
      renderRoles()
    })
    const span = document.createElement("span")
    span.textContent = g
    el.appendChild(box)
    el.appendChild(span)
    filterGrid.appendChild(el)
  })
}

function renderRoles() {
  roleGrid.innerHTML = ""
  roles.filter(r => state.activeGroups.has(r.group)).forEach(r => {
    const data = gen(r, state.ctx || buildCtx(state.newsText || ""))
    const card = document.createElement("div")
    card.className = "role-card"
    const head = document.createElement("div")
    head.className = "role-head"
    const name = document.createElement("div")
    name.className = "role-name"
    name.textContent = r.name
    const group = document.createElement("div")
    group.className = "role-group"
    group.textContent = r.group
    head.appendChild(name)
    head.appendChild(group)
    const body = document.createElement("div")
    body.className = "role-body"
    const sec1 = document.createElement("div")
    sec1.className = "role-section-title"
    sec1.textContent = "观点"
    const t1 = document.createElement("div")
    t1.className = "role-text"
    t1.textContent = data.thought
    const sec2 = document.createElement("div")
    sec2.className = "role-section-title"
    sec2.textContent = "下一步措施"
    const t2 = document.createElement("div")
    t2.className = "role-text"
    t2.textContent = data.actions.map(a => "• " + a).join("\n")
    body.appendChild(sec1)
    body.appendChild(t1)
    body.appendChild(sec2)
    body.appendChild(t2)
    const footer = document.createElement("div")
    footer.className = "role-footer"
    data.tags.forEach(tag => {
      const e = document.createElement("div")
      e.className = "tag"
      e.textContent = tag
      footer.appendChild(e)
    })
    card.appendChild(head)
    card.appendChild(body)
    card.appendChild(footer)
    roleGrid.appendChild(card)
  })
}

async function analyze(url) {
  summaryEl.classList.remove("hidden")
  summaryTextEl.innerHTML = ""
  const loading = document.createElement("div")
  loading.className = "loading"
  const sp = document.createElement("div")
  sp.className = "spinner"
  const tx = document.createElement("div")
  tx.textContent = "正在抓取与分析…"
  loading.appendChild(sp)
  loading.appendChild(tx)
  summaryTextEl.appendChild(loading)
  roleGrid.innerHTML = ""
  try {
    const resp = await fetch(toProxyUrl(url))
    const text = await resp.text()
    state.newsText = text
    state.url = url
    state.ctx = buildCtx(text)
    summaryTextEl.textContent = summarize(state.ctx)
    renderRoles()
  } catch (e) {
    summaryTextEl.textContent = "抓取失败，请检查链接或稍后重试。"
  }
}

function copyAll() {
  const ctx = state.ctx || buildCtx(state.newsText || "")
  const out = roles.map(r => {
    const d = gen(r, ctx)
    return `${r.name}\n观点：${d.thought}\n下一步措施：\n${d.actions.map(a => "• " + a).join("\n")}`
  }).join("\n\n")
  navigator.clipboard.writeText(out)
}

function exportJson() {
  const ctx = state.ctx || buildCtx(state.newsText || "")
  const data = roles.map(r => {
    const d = gen(r, ctx)
    return { id: r.id, name: r.name, group: r.group, thought: d.thought, actions: d.actions, tags: d.tags }
  })
  const blob = new Blob([JSON.stringify({ url: state.url, summary: summarize(ctx), roles: data }, null, 2)], { type: "application/json" })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = "伊朗战争看板.json"
  a.click()
}

function resetAll() {
  newsUrlEl.value = ""
  state.newsText = ""
  state.url = ""
  state.ctx = null
  summaryTextEl.textContent = ""
  summaryEl.classList.add("hidden")
  state.activeGroups = new Set(groups)
  renderFilters()
  renderRoles()
}

analyzeBtn.addEventListener("click", () => {
  const url = newsUrlEl.value.trim()
  if (!url) return
  analyze(url)
})
copyAllBtn.addEventListener("click", copyAll)
exportJsonBtn.addEventListener("click", exportJson)
resetLink.addEventListener("click", resetAll)
renderFilters()
renderRoles()
