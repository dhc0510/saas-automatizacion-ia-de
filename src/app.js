import {
  activity,
  agents,
  automationRules,
  campaigns,
  channelsData,
  chartSeries,
  company,
  conversations,
  customers,
  documents,
  money,
  notifications,
  plans,
  quickReplies,
  settingsGroups
} from "./data.js";

const app = document.querySelector("#app");

const navItems = [
  ["dashboard", "Dashboard", "dashboard"],
  ["inbox", "Inbox", "inbox"],
  ["automations", "Automatizaciones", "flow"],
  ["training", "Entrenamiento del Bot", "bot"],
  ["customers", "Clientes", "users"],
  ["channels", "Canales", "plug"],
  ["analytics", "Analiticas", "chart"],
  ["simulator", "Simulador IA", "spark"]
];

const state = {
  route: location.hash.replace("#/", "") || "dashboard",
  selectedConversation: conversations[0].id,
  selectedCustomer: customers[0].id,
  inboxFilter: "Todos",
  quickFilter: "Todas",
  simulatorMode: "Venta",
  simulatorText: "Hola, quiero comprar una silla ergonomica y necesito saber si llega esta semana.",
  modal: null,
  drawer: null,
  mobileOpen: false
};

function routeMeta(route = state.route) {
  const found = navItems.find(([id]) => id === route) || navItems[0];
  const descriptions = {
    dashboard: "Operacion, IA, canales y carga comercial en una vista.",
    inbox: "Inbox multicanal con contexto del cliente.",
    automations: "Reglas visuales para responder, clasificar y escalar.",
    training: "Conocimiento, tono y personalidad de NovaBot.",
    customers: "CRM para leads, compradores e historial.",
    channels: "Conexiones, sincronizacion y salud por canal.",
    analytics: "Rendimiento operativo y comercial.",
    simulator: "Laboratorio visual para probar NovaBot."
  };
  return { title: found[1], description: descriptions[found[0]] };
}

function setState(patch) {
  Object.assign(state, patch);
  render();
}

function navigate(route) {
  state.route = route;
  state.mobileOpen = false;
  history.replaceState(null, "", `#/${route}`);
  render();
}

window.addEventListener("hashchange", () => {
  state.route = location.hash.replace("#/", "") || "dashboard";
  render();
});

function icon(name) {
  const paths = {
    dashboard: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="4" rx="1.5"/><rect x="14" y="11" width="7" height="10" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
    inbox: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v9A2.5 2.5 0 0 1 17.5 18h-3.8L12 20l-1.7-2H6.5A2.5 2.5 0 0 1 4 15.5z"/><path d="M8 9h8M8 13h5"/>',
    flow: '<path d="M7 6h10v5H7z"/><path d="M12 11v3"/><path d="M5 17h6v3H5zM13 17h6v3h-6z"/>',
    bot: '<rect x="5" y="7" width="14" height="11" rx="3"/><path d="M12 7V4M9 12h.01M15 12h.01M9 16h6"/>',
    users: '<path d="M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4"/><circle cx="12" cy="9" r="3"/><path d="M19 18c0-1.6-1.1-3-2.7-3.7M17 7.5a2.5 2.5 0 0 1 0 5"/>',
    plug: '<path d="M9 7V4M15 7V4M7 7h10v5a5 5 0 0 1-10 0z"/><path d="M12 17v3"/>',
    chart: '<path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 15l3-4 3 2 4-7"/>',
    spark: '<path d="M12 3l1.6 5.1L19 10l-5.4 1.9L12 17l-1.6-5.1L5 10l5.4-1.9z"/><path d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7z"/>'
  };
  return `<span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.dashboard}</svg></span>`;
}

function badge(text, tone = "neutral") {
  return `<span class="badge ${tone}">${text}</span>`;
}

function avatar(initials, className = "") {
  return `<span class="avatar ${className}">${initials}</span>`;
}

function progress(value, tone = "primary") {
  return `<div class="progress" aria-label="${value}%"><span class="${tone}" style="width:${value}%"></span></div>`;
}

function metricCard(label, value, delta, tone = "primary") {
  const initials = label
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return `
    <article class="metric-card ${tone}">
      <div class="metric-top">
        <span class="metric-icon">${initials}</span>
        ${badge(delta, tone)}
      </div>
      <span class="metric-label">${label}</span>
      <strong>${value}</strong>
      ${progress(Math.min(100, Number.parseInt(String(value).replace(/\D/g, ""), 10) || 72), tone)}
    </article>
  `;
}

function sectionHeader(title, text, action = "") {
  return `
    <div class="section-header">
      <div>
        <h2>${title}</h2>
        <p>${text}</p>
      </div>
      ${action}
    </div>
  `;
}

function bars(values, labels = []) {
  const max = Math.max(...values, 1);
  return `
    <div class="bar-chart">
      ${values
        .map(
          (value, index) => `
            <div class="bar-wrap">
              <span class="bar-value">${value}</span>
              <span class="bar" style="height:${Math.max(12, (value / max) * 100)}%"></span>
              <small>${labels[index] || index + 1}</small>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function lineChart(values) {
  const width = 320;
  const height = 130;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / (max - min || 1)) * (height - 18) - 9;
      return `${x},${y}`;
    })
    .join(" ");

  return `
    <svg class="line-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Grafico de tendencia">
      <defs>
        <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#2f6f68" stop-opacity=".22"/>
          <stop offset="100%" stop-color="#2f6f68" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <polyline points="${points}" fill="none" stroke="#2f6f68" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <polygon points="0,${height} ${points} ${width},${height}" fill="url(#areaFill)"/>
      ${values
        .map((value, index) => {
          const [x, y] = points.split(" ")[index].split(",");
          return `<circle cx="${x}" cy="${y}" r="4" fill="#ffffff" stroke="#2f6f68" stroke-width="3"><title>${value}</title></circle>`;
        })
        .join("")}
    </svg>
  `;
}

function donut(items) {
  let offset = 0;
  const circles = items
    .map((item, index) => {
      const length = item.value;
      const circle = `<circle class="donut-segment seg-${index}" r="38" cx="50" cy="50" stroke-dasharray="${length} ${100 - length}" stroke-dashoffset="-${offset}"></circle>`;
      offset += length;
      return circle;
    })
    .join("");

  return `
    <div class="donut-card">
      <svg viewBox="0 0 100 100" class="donut" role="img" aria-label="Distribucion">
        <circle class="donut-base" r="38" cx="50" cy="50"></circle>
        ${circles}
      </svg>
      <div class="legend">
        ${items.map((item, index) => `<span><i class="legend-dot seg-${index}"></i>${item.label} ${item.value}%</span>`).join("")}
      </div>
    </div>
  `;
}

function renderLayout(content) {
  const meta = routeMeta();
  return `
    <div class="shell">
      <aside class="sidebar ${state.mobileOpen ? "open" : ""}" aria-label="Navegacion principal">
        <div class="brand">
          <div class="brand-mark">N</div>
          <div>
            <strong>NovaDesk AI</strong>
            <span>${company.name} / ${company.plan}</span>
          </div>
        </div>
        <div class="workspace-pill">
          <span class="live-dot"></span>
          <span>Operacion en vivo</span>
          <strong>94%</strong>
        </div>
        <nav>
          ${navItems
            .map(
              ([id, label, mark]) => `
                <button class="nav-item ${state.route === id ? "active" : ""}" data-route="${id}" title="${label}">
                  ${icon(mark)}
                  <span>${label}</span>
                </button>
              `
            )
            .join("")}
        </nav>
        <div class="sidebar-card">
          <span class="eyebrow">Bot activo</span>
          <strong>${company.bot}</strong>
          <p>94% precision / 73% resolucion automatica</p>
          ${progress(94, "success")}
          <button class="sidebar-cta" data-route="simulator">Abrir laboratorio IA</button>
        </div>
      </aside>
      <div class="backdrop ${state.mobileOpen ? "show" : ""}" data-close-mobile></div>
      <main class="main">
        <header class="topbar">
          <button class="icon-button mobile-toggle" data-toggle-mobile aria-label="Abrir navegacion"><span></span><span></span><span></span></button>
          <div class="page-title">
            <span class="breadcrumb">${company.name} / ${company.type} / ${meta.title}</span>
            <h1>${meta.title}</h1>
            <p>${meta.description}</p>
          </div>
          <div class="top-actions">
            <div class="top-meta">
              <span>Plan ${company.plan}</span>
              <strong>3 canales activos</strong>
            </div>
            <label class="search">
              <span>Buscar</span>
              <input type="search" placeholder="Cliente, pedido, regla..." />
            </label>
            <button class="ghost-button" data-modal="notifications">Alertas <span class="dot"></span></button>
            <button class="primary-button" data-modal="quickAction">Nueva accion</button>
          </div>
        </header>
        <section class="command-strip" aria-label="Resumen operacional">
          <span><strong>8,924</strong> mensajes automatizados</span>
          <span><strong>2.4 min</strong> tiempo promedio</span>
          <span><strong>95%</strong> satisfaccion</span>
          <span><strong>0</strong> incidentes criticos</span>
        </section>
        <div class="content appear">${content}</div>
      </main>
      ${renderModal()}
      ${renderDrawer()}
    </div>
  `;
}

function dashboardView() {
  const active = conversations.filter((item) => item.status !== "Resuelta").length;
  const resolved = conversations.length - active;
  return `
    <section class="dashboard-hero">
      <div>
        <span class="eyebrow">Centro de automatizacion inteligente</span>
        <h2>${company.bot} esta priorizando conversaciones, ventas y soporte en tiempo real.</h2>
        <p>Vista comercial para mostrar como ${company.name} opera cientos de mensajes con IA, reglas y agentes humanos coordinados.</p>
      </div>
      <div class="hero-score">
        <span>Rendimiento IA</span>
        <strong>94%</strong>
        ${progress(94, "success")}
      </div>
      <div class="hero-actions">
        <button class="primary-button" data-route="inbox">Ver inbox</button>
        <button class="ghost-button" data-route="simulator">Probar NovaBot</button>
      </div>
    </section>
    <section class="metrics-grid wide">
      ${metricCard("Conversaciones activas", active, "+18%", "primary")}
      ${metricCard("Resueltas", resolved, "+12%", "success")}
      ${metricCard("Mensajes automaticos", "8,924", "+31%", "info")}
      ${metricCard("Clientes atendidos", customers.length, "+9%", "success")}
      ${metricCard("Horas ahorradas", "436", "+44%", "warning")}
      ${metricCard("Satisfaccion", "95%", "+4%", "success")}
      ${metricCard("Tiempo promedio", "2.4m", "-28%", "info")}
      ${metricCard("Resolucion IA", "73%", "+7%", "primary")}
    </section>

    <section class="dashboard-grid">
      <article class="panel span-2">
        ${sectionHeader("Conversaciones por dia", "Volumen reciente por canal y automatizaciones activas.")}
        ${lineChart(chartSeries.conversationsByDay)}
      </article>
      <article class="panel">
        ${sectionHeader("Mensajes por canal", "Participacion de canales conectados.")}
        ${donut(chartSeries.messagesByChannel)}
      </article>
      <article class="panel">
        ${sectionHeader("Tendencia semanal", "Rendimiento del equipo y NovaBot.")}
        ${bars(chartSeries.weeklyTrend, ["L", "M", "M", "J", "V", "S", "D"])}
      </article>
      <article class="panel">
        ${sectionHeader("Estado del bot", "Salud operativa del asistente.")}
        <div class="bot-status">
          <div class="pulse-ring"><span></span></div>
          <strong>${company.bot} esta respondiendo</strong>
          <p>Preciso en preguntas de catalogo, garantia y envio. Requiere actualizar promociones.</p>
          <div class="status-list">
            <span>Confianza media ${badge("94%", "success")}</span>
            <span>Escalamientos ${badge("27 hoy", "warning")}</span>
            <span>Errores criticos ${badge("0", "success")}</span>
          </div>
        </div>
      </article>
      <article class="panel">
        ${sectionHeader("Actividad reciente", "Eventos de los ultimos minutos.")}
        <div class="timeline">${activity.slice(0, 6).map((item) => `<div class="timeline-item"><span></span><p>${item}</p></div>`).join("")}</div>
      </article>
      <article class="panel">
        ${sectionHeader("Conversaciones urgentes", "Clientes con prioridad alta.")}
        <div class="compact-list">
          ${conversations
            .filter((item) => item.priority === "Alta")
            .slice(0, 5)
            .map(
              (item) => `
              <button class="list-row" data-route="inbox" data-select-conversation="${item.id}">
                ${avatar(item.avatar)}
                <span><strong>${item.customer}</strong><small>${item.intent} / ${item.channel}</small></span>
                ${badge(item.priority, "danger")}
              </button>
            `
            )
            .join("")}
        </div>
      </article>
      <article class="panel">
        ${sectionHeader("Automatizaciones activas", "Reglas que mas impactan hoy.")}
        <div class="compact-list">
          ${automationRules
            .slice(0, 5)
            .map(
              (rule) => `
              <div class="list-row static">
                <span class="mini-icon">${rule.name.slice(0, 1)}</span>
                <span><strong>${rule.name}</strong><small>${rule.executions} ejecuciones / ${rule.lastRun}</small></span>
                ${badge(`${rule.effectiveness}%`, rule.effectiveness > 85 ? "success" : "warning")}
              </div>
            `
            )
            .join("")}
        </div>
      </article>
      <article class="panel">
        ${sectionHeader("Agentes conectados", "Carga y satisfaccion actual.")}
        <div class="agent-stack">
          ${agents
            .map(
              (agent) => `
              <div class="agent-row">
                ${avatar(
                  agent.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                )}
                <span><strong>${agent.name}</strong><small>${agent.role}</small></span>
                ${badge(agent.status, agent.status.includes("Pausa") ? "warning" : "success")}
              </div>
            `
            )
            .join("")}
        </div>
      </article>
      <article class="panel">
        ${sectionHeader("Accesos rapidos", "Flujos frecuentes para una demo comercial.")}
        <div class="quick-grid">
          ${[
            ["Inbox", "inbox"],
            ["Entrenar bot", "training"],
            ["Crear regla", "automations"],
            ["Probar IA", "simulator"]
          ]
            .map(([label, route]) => `<button class="soft-button" data-route="${route}">${label}</button>`)
            .join("")}
        </div>
        <div class="skeleton-stack" aria-label="Cargando actualizaciones simuladas">
          <span></span><span></span><span></span>
        </div>
      </article>
    </section>
  `;
}

function inboxView() {
  const selected = conversations.find((item) => item.id === state.selectedConversation) || conversations[0];
  const customer = customers.find((item) => item.id === selected.customerId) || customers[0];
  const visible =
    state.inboxFilter === "Todos" ? conversations : conversations.filter((item) => item.channel === state.inboxFilter || item.priority === state.inboxFilter || item.status === state.inboxFilter);

  return `
    <section class="inbox-layout">
      <aside class="inbox-list panel">
        <div class="inbox-tools">
          <input class="field" placeholder="Buscar conversacion" />
          <select class="field" data-inbox-filter>
            ${["Todos", "WhatsApp", "Instagram", "Web Chat", "Email", "Alta", "En progreso", "Resuelta"]
              .map((item) => `<option ${state.inboxFilter === item ? "selected" : ""}>${item}</option>`)
              .join("")}
          </select>
        </div>
        <div class="conversation-list">
          ${visible
            .slice(0, 34)
            .map(
              (item) => `
              <button class="conversation-card ${selected.id === item.id ? "active" : ""}" data-conversation="${item.id}">
                ${avatar(item.avatar)}
                <span class="conv-main">
                  <strong>${item.customer}</strong>
                  <small>${item.lastReply}</small>
                  <span>${badge(item.channel, "neutral")} ${badge(item.priority, item.priority === "Alta" ? "danger" : item.priority === "Media" ? "warning" : "success")}</span>
                </span>
                <time>${item.time}</time>
              </button>
            `
            )
            .join("")}
        </div>
      </aside>
      <section class="chat-panel panel">
        <div class="chat-header">
          <div>${avatar(selected.avatar)}<span><strong>${selected.customer}</strong><small>${selected.channel} / ${selected.intent} / ${selected.status}</small></span></div>
          <div class="chat-actions">
            <button class="ghost-button">Asignar</button>
            <button class="ghost-button">Prioridad</button>
            <button class="primary-button">Resolver</button>
          </div>
        </div>
        <div class="chat-stream">
          ${selected.messages
            .map(
              (message) => `
              <div class="bubble ${message.speaker}">
                <span>${message.speaker === "bot" ? company.bot : message.speaker === "agent" ? selected.agent : selected.customer}</span>
                <p>${message.text}</p>
                ${message.attachment ? `<button class="attachment">${message.attachment}</button>` : ""}
                <time>${message.time}</time>
              </div>
            `
            )
            .join("")}
        </div>
        <div class="composer">
          <button class="icon-button" title="Adjuntar">+</button>
          <textarea placeholder="Escribe una respuesta o usa NovaBot para sugerir una..." rows="2"></textarea>
          <button class="primary-button">Enviar</button>
        </div>
      </section>
      <aside class="customer-panel panel">
        ${sectionHeader("Cliente", "Contexto y acciones del caso.")}
        <div class="profile-card">
          ${avatar(customer.avatar, "large")}
          <h3>${customer.name}</h3>
          <p>${customer.status} / ${customer.since} como cliente</p>
          <div>${customer.tags.map((tag) => badge(tag, tag === "Urgente" ? "danger" : "neutral")).join("")}</div>
        </div>
        <div class="detail-grid">
          <span><small>Intencion</small><strong>${customer.intent}</strong></span>
          <span><small>Compras</small><strong>${customer.purchases}</strong></span>
          <span><small>Valor estimado</small><strong>${customer.valueLabel}</strong></span>
          <span><small>Canal favorito</small><strong>${customer.favoriteChannel}</strong></span>
        </div>
        <div class="note-list">
          ${customer.notes.map((note) => `<p>${note}</p>`).join("")}
        </div>
        <div class="vertical-actions">
          <button class="soft-button">Agregar nota</button>
          <button class="soft-button">Cerrar conversacion</button>
          <button class="soft-button">Ver historial</button>
        </div>
      </aside>
    </section>
  `;
}

function automationsView() {
  return `
    <section class="split-grid">
      <article class="panel span-2">
        ${sectionHeader("Reglas de automatizacion", "Efectividad, estado y ultima ejecucion.", `<button class="primary-button" data-modal="automation">Nueva regla</button>`)}
        <div class="automation-table">
          ${automationRules
            .map(
              (rule) => `
              <div class="automation-row">
                <span class="rule-switch ${rule.status === "Activa" ? "on" : ""}"></span>
                <div>
                  <strong>${rule.name}</strong>
                  <p>${rule.description}</p>
                  <small>${rule.owner} / ${rule.executions} ejecuciones</small>
                </div>
                ${badge(rule.status, rule.status === "Activa" ? "success" : "neutral")}
                <span>${rule.lastRun}</span>
                <strong>${rule.effectiveness}%</strong>
              </div>
            `
            )
            .join("")}
        </div>
      </article>
      <article class="panel">
        ${sectionHeader("Constructor visual", "Flujo simulado de una regla comercial.")}
        <div class="flow-builder">
          ${[
            ["Entrada", "Mensaje recibido por WhatsApp"],
            ["Condicion", "Intencion contiene compra"],
            ["IA", "NovaBot clasifica producto"],
            ["Accion", "Enviar catalogo y solicitar correo"],
            ["Escalar", "Asignar agente si confianza < 70%"]
          ]
            .map(([title, text], index) => `<div class="flow-node"><span>${index + 1}</span><strong>${title}</strong><p>${text}</p></div>`)
            .join("")}
        </div>
      </article>
      <article class="panel">
        ${sectionHeader("Campanas", "Automatizaciones aplicadas a audiencias.")}
        <div class="compact-list">
          ${campaigns
            .map(
              (campaign) => `
              <div class="list-row static">
                <span><strong>${campaign.name}</strong><small>${campaign.reach} contactos alcanzados</small></span>
                ${badge(`${campaign.conversion}%`, "success")}
              </div>
            `
            )
            .join("")}
        </div>
      </article>
    </section>
  `;
}

function trainingView() {
  return `
    <section class="training-grid">
      <article class="panel span-2">
        ${sectionHeader("Personalidad de NovaBot", "Entrenamiento comercial para una tienda online.")}
        <div class="personality-grid">
          ${[
            ["Tono", "Cercano, claro y resolutivo"],
            ["Objetivos", "Resolver dudas, vender mejor y escalar reclamos"],
            ["Limites", "No prometer stock sin confirmar y no aprobar devoluciones fuera de politica"],
            ["Ultimo entrenamiento", "Hoy 9:40 a.m. / 5 documentos procesados"]
          ]
            .map(([label, value]) => `<div><small>${label}</small><strong>${value}</strong></div>`)
            .join("")}
        </div>
        <div class="knowledge-list">
          ${documents
            .map(
              (doc) => `
              <div class="doc-row">
                <span class="doc-icon">${doc.type}</span>
                <span><strong>${doc.name}</strong><small>${doc.updated}</small></span>
                ${progress(doc.coverage, doc.coverage > 90 ? "success" : "warning")}
                ${badge(`${doc.coverage}%`, doc.coverage > 90 ? "success" : "warning")}
              </div>
            `
            )
            .join("")}
        </div>
      </article>
      <article class="panel">
        ${sectionHeader("Precision estimada", "Cobertura actual por area.")}
        ${metricCard("FAQ", "96%", "+3%", "success")}
        ${metricCard("Catalogo", "89%", "+8%", "primary")}
        ${metricCard("Reclamos", "78%", "-2%", "warning")}
      </article>
      <article class="panel">
        ${sectionHeader("Recomendaciones IA", "Mejoras sugeridas por el sistema.")}
        <div class="recommendations">
          ${[
            "Agregar nuevas politicas de promociones semanales.",
            "Crear respuestas para compras mayoristas recurrentes.",
            "Revisar casos de garantia con baja confianza.",
            "Entrenar sinonimos de productos populares."
          ]
            .map((item) => `<button class="recommendation">${item}</button>`)
            .join("")}
        </div>
      </article>
      <article class="panel span-2">
        ${sectionHeader("Vista previa del comportamiento", "Comparacion entre intencion detectada y respuesta del bot.")}
        <div class="preview-chat">
          <div class="bubble customer"><span>Cliente</span><p>Necesito el precio del monitor curvo y saber si lo envian hoy.</p><time>Prueba</time></div>
          <div class="bubble bot"><span>${company.bot}</span><p>Con gusto. El monitor curvo esta disponible, cuesta $349 y puedo verificar entrega para hoy segun tu ubicacion.</p><time>Confianza 95%</time></div>
        </div>
      </article>
    </section>
  `;
}

function quickRepliesView() {
  const categories = ["Todas", ...new Set(quickReplies.map((reply) => reply.category))];
  const visible = state.quickFilter === "Todas" ? quickReplies : quickReplies.filter((reply) => reply.category === state.quickFilter);
  return `
    <section class="split-grid">
      <article class="panel">
        ${sectionHeader("Categorias", "Biblioteca organizada por uso.")}
        <div class="chip-list">
          ${categories.map((category) => `<button class="chip ${state.quickFilter === category ? "active" : ""}" data-quick-filter="${category}">${category}</button>`).join("")}
        </div>
        <div class="variable-box">
          <strong>Variables disponibles</strong>
          ${["{{nombre}}", "{{producto}}", "{{precio}}", "{{fecha}}", "{{pedido}}", "{{estado}}"].map((item) => badge(item, "neutral")).join("")}
        </div>
      </article>
      <article class="panel span-2">
        ${sectionHeader("Plantillas", "Respuestas listas para ventas, soporte y reclamos.", `<input class="field narrow" placeholder="Buscar plantilla" />`)}
        <div class="reply-grid">
          ${visible
            .map(
              (reply) => `
              <article class="reply-card">
                <div><strong>${reply.title}</strong>${reply.favorite ? badge("Favorita", "warning") : ""}</div>
                <p>${reply.body}</p>
                <footer><span>${reply.tags.map((tag) => badge(tag)).join("")}</span><small>${reply.uses} usos</small></footer>
              </article>
            `
            )
            .join("")}
        </div>
      </article>
      <article class="panel span-3">
        ${sectionHeader("Editor visual", "Simulacion de edicion con variables y etiquetas.")}
        <div class="editor-shell">
          <input class="field" value="Seguimiento de pedido" aria-label="Titulo de plantilla" />
          <textarea class="editor" rows="5">Hola {{nombre}}, tu pedido {{pedido}} se encuentra {{estado}}. Si deseas cambiar la direccion antes de {{fecha}}, responde este mensaje.</textarea>
          <div><button class="primary-button">Guardar plantilla</button><button class="ghost-button">Vista previa</button></div>
        </div>
      </article>
    </section>
  `;
}

function customersView() {
  const selected = customers.find((item) => item.id === state.selectedCustomer) || customers[0];
  return `
    <section class="customers-layout">
      <article class="panel table-panel">
        ${sectionHeader("Clientes", "CRM operativo con intencion, valor y responsable.", `<input class="field narrow" placeholder="Buscar cliente" />`)}
        <div class="data-table">
          <div class="table-head"><span>Nombre</span><span>Canal</span><span>Estado</span><span>Interes</span><span>Valor</span><span>Responsable</span></div>
          ${customers
            .slice(0, 36)
            .map(
              (customer) => `
              <button class="table-row ${selected.id === customer.id ? "active" : ""}" data-customer="${customer.id}">
                <span>${avatar(customer.avatar)}<strong>${customer.name}</strong></span>
                <span>${badge(customer.channel)}</span>
                <span>${customer.status}</span>
                <span>${progress(customer.interest, customer.interest > 80 ? "success" : "primary")}</span>
                <span>${customer.valueLabel}</span>
                <span>${customer.owner}</span>
              </button>
            `
            )
            .join("")}
        </div>
      </article>
      <aside class="panel customer-drawer">
        ${sectionHeader(selected.name, `${selected.intent} / ${selected.favoriteChannel}`)}
        <div class="profile-card">
          ${avatar(selected.avatar, "large")}
          <h3>${selected.valueLabel}</h3>
          <p>Valor estimado / ${selected.purchases} compras</p>
        </div>
        <div class="timeline">
          ${[
            "Inicio conversacion por " + selected.channel,
            "NovaBot detecto intencion: " + selected.intent,
            "Se envio plantilla comercial personalizada",
            "Responsable asignado: " + selected.owner
          ]
            .map((item) => `<div class="timeline-item"><span></span><p>${item}</p></div>`)
            .join("")}
        </div>
        <div class="note-list">${selected.notes.map((note) => `<p>${note}</p>`).join("")}</div>
      </aside>
    </section>
  `;
}

function channelsView() {
  return `
    <section class="channel-grid">
      ${channelsData
        .map(
          (channel) => `
          <article class="panel channel-card">
            <div class="channel-top">
              <span class="channel-mark">${channel.name.slice(0, 2)}</span>
              ${badge(channel.status, channel.status === "Conectado" ? "success" : channel.status === "Pausado" ? "warning" : "neutral")}
            </div>
            <h2>${channel.name}</h2>
            <p>Ultima sincronizacion: ${channel.sync}</p>
            <strong>${channel.messages.toLocaleString("en-US")} mensajes procesados</strong>
            ${progress(channel.health, channel.health > 90 ? "success" : channel.health > 0 ? "warning" : "neutral")}
            <div class="channel-actions">
              <button class="primary-button">${channel.status === "Conectado" ? "Configurar" : "Conectar"}</button>
              <button class="ghost-button">Sincronizar</button>
            </div>
          </article>
        `
        )
        .join("")}
    </section>
  `;
}

function analyticsView() {
  return `
    <section class="analytics-grid">
      <article class="panel span-2">
        ${sectionHeader("Mensajes y conversaciones", "Filtro: ultimos 30 dias.", `<select class="field narrow"><option>30 dias</option><option>7 dias</option><option>Este trimestre</option></select>`)}
        ${lineChart(chartSeries.conversationsByDay.concat([302, 318, 297, 335]))}
      </article>
      <article class="panel">${sectionHeader("Bot vs humano", "Resolucion por origen.")}${donut(chartSeries.botVsHuman)}</article>
      <article class="panel">${sectionHeader("Horas pico", "Actividad por franja.")}${bars(chartSeries.peakHours, ["6", "8", "10", "12", "14", "16", "18", "20", "22", "0", "2", "4"])}</article>
      <article class="panel">${sectionHeader("Satisfaccion", "CSAT semanal.")}${lineChart(chartSeries.satisfaction)}</article>
      <article class="panel span-2">
        ${sectionHeader("Preguntas frecuentes", "Temas mas consultados.")}
        <div class="faq-bars">
          ${[
            ["Precio y disponibilidad", 96],
            ["Tiempo de envio", 84],
            ["Garantia", 66],
            ["Cambios de pedido", 58],
            ["Promociones", 49]
          ]
            .map(([label, value]) => `<div><span>${label}</span>${progress(value, value > 75 ? "success" : "primary")}<strong>${value}%</strong></div>`)
            .join("")}
        </div>
      </article>
      <article class="panel">
        ${sectionHeader("Ventas generadas", "Atribuidas a automatizacion.")}
        ${metricCard("Ingresos asistidos", money(42860), "+19%", "success")}
        ${metricCard("Tickets recuperados", "312", "+26%", "primary")}
      </article>
    </section>
  `;
}

function plansView() {
  return `
    <section class="plans-grid">
      ${plans
        .map(
          (plan) => `
          <article class="plan-card panel ${plan.current ? "featured" : ""}">
            <div class="plan-head">
              <span>${badge(plan.current ? "Plan actual" : "Disponible", plan.current ? "success" : "neutral")}</span>
              <h2>${plan.name}</h2>
              <strong>${plan.price}<small>${plan.price.startsWith("$") ? "/mes" : ""}</small></strong>
            </div>
            <div class="plan-limits">
              <span>${plan.users}</span><span>${plan.channels}</span><span>${plan.automations}</span><span>${plan.ai}</span><span>${plan.support}</span><span>${plan.storage}</span>
            </div>
            <ul>${plan.benefits.map((benefit) => `<li>${benefit}</li>`).join("")}</ul>
            <button class="${plan.current ? "ghost-button" : "primary-button"}">${plan.current ? "Cambiar plan" : plan.name === "Enterprise" ? "Solicitar demo" : "Actualizar"}</button>
          </article>
        `
        )
        .join("")}
    </section>
  `;
}

function settingsView() {
  return `
    <section class="settings-grid">
      ${settingsGroups
        .map(
          (group, index) => `
          <article class="panel setting-card">
            <span class="mini-icon">${group.name.slice(0, 1)}</span>
            <h2>${group.name}</h2>
            <p>${group.description}</p>
            <div class="setting-state">
              ${badge(index % 4 === 0 ? "Revisar" : "Activo", index % 4 === 0 ? "warning" : "success")}
              <button class="ghost-button">Configurar</button>
            </div>
          </article>
        `
        )
        .join("")}
    </section>
  `;
}

function simulatorView() {
  const analysis = analyzeText(state.simulatorText, state.simulatorMode);
  return `
    <section class="simulator-layout">
      <article class="panel simulator-chat">
        ${sectionHeader("Laboratorio de IA", "Prueba escenarios sin consumir servicios externos.")}
        <div class="mode-tabs">
          ${["Venta", "Soporte", "Reclamo", "Consulta", "Seguimiento"].map((mode) => `<button class="${state.simulatorMode === mode ? "active" : ""}" data-mode="${mode}">${mode}</button>`).join("")}
        </div>
        <div class="preview-chat">
          <div class="bubble customer"><span>Cliente de prueba</span><p>${state.simulatorText || "Escribe un mensaje para probar NovaBot."}</p><time>Ahora</time></div>
          <div class="bubble bot"><span>${company.bot}</span><p>${analysis.reply}</p><time>Confianza ${analysis.confidence}%</time></div>
        </div>
        <textarea class="editor" rows="4" data-simulator-input>${state.simulatorText}</textarea>
      </article>
      <aside class="panel ai-panel">
        ${sectionHeader("Analisis IA", "Lectura visual en tiempo real.")}
        <div class="analysis-grid">
          <span><small>Intencion</small><strong>${analysis.intent}</strong></span>
          <span><small>Sentimiento</small><strong>${analysis.sentiment}</strong></span>
          <span><small>Confianza</small><strong>${analysis.confidence}%</strong></span>
          <span><small>Entidad</small><strong>${analysis.entity}</strong></span>
          <span><small>Accion sugerida</small><strong>${analysis.action}</strong></span>
          <span><small>Automatizacion</small><strong>${analysis.automation}</strong></span>
        </div>
        ${progress(analysis.confidence, analysis.confidence > 85 ? "success" : "warning")}
      </aside>
    </section>
  `;
}

function analyzeText(text, mode) {
  const lower = text.toLowerCase();
  const hasComplaint = ["reclamo", "malo", "danado", "garantia", "problema"].some((word) => lower.includes(word));
  const hasBuy = ["comprar", "precio", "disponible", "catalogo", "envio"].some((word) => lower.includes(word));
  const hasOrder = ["pedido", "orden", "estado", "llega"].some((word) => lower.includes(word));
  const intent = hasComplaint ? "Reclamo" : hasBuy ? "Compra" : hasOrder ? "Seguimiento" : mode;
  const sentiment = hasComplaint ? "Frustrado" : hasBuy ? "Interesado" : "Neutral";
  const confidence = Math.min(98, 72 + text.length / 4 + (hasBuy ? 10 : 0) + (hasComplaint ? 7 : 0));
  const entity = ["silla", "monitor", "audifonos", "pedido", "garantia"].find((word) => lower.includes(word)) || "Consulta general";
  const action = hasComplaint ? "Derivar a humano" : hasBuy ? "Enviar catalogo" : hasOrder ? "Consultar estado" : "Responder FAQ";
  return {
    intent,
    sentiment,
    confidence: Math.round(confidence),
    entity,
    action,
    automation: action,
    reply:
      intent === "Reclamo"
        ? "Entiendo la situacion y voy a priorizar tu caso. Te pedire los datos necesarios y puedo escalarlo a un agente."
        : intent === "Compra"
          ? "Claro, puedo ayudarte a elegir la mejor opcion, confirmar disponibilidad y enviarte precio con fecha estimada de entrega."
          : "Con gusto. Revisare la informacion relevante y te dare una respuesta clara con el siguiente paso."
  };
}

function renderModal() {
  if (!state.modal) return "";
  const content =
    state.modal === "notifications"
      ? `<div class="modal-list">${notifications.map((item) => `<div class="notice ${item.type}"><strong>${item.title}</strong><p>${item.text}</p></div>`).join("")}</div>`
      : state.modal === "automation"
        ? `<div class="form-grid"><input class="field" value="Nueva regla de seguimiento" /><select class="field"><option>Activa</option><option>Inactiva</option></select><textarea class="editor" rows="4">Cuando un cliente no responda en 24 horas, enviar recordatorio amable y asignar responsable.</textarea></div>`
        : `<div class="quick-grid"><button class="soft-button" data-route="inbox">Responder conversacion</button><button class="soft-button" data-route="training">Entrenar NovaBot</button><button class="soft-button" data-route="automations">Crear automatizacion</button><button class="soft-button" data-route="simulator">Probar IA</button></div>`;
  return `
    <div class="modal-layer" role="dialog" aria-modal="true">
      <div class="modal-card appear">
        <header><h2>${state.modal === "notifications" ? "Alertas" : state.modal === "automation" ? "Nueva automatizacion" : "Nueva accion"}</h2><button class="icon-button" data-close-modal aria-label="Cerrar">x</button></header>
        ${content}
        <footer><button class="ghost-button" data-close-modal>Cancelar</button><button class="primary-button" data-close-modal>Confirmar</button></footer>
      </div>
    </div>
  `;
}

function renderDrawer() {
  if (!state.drawer) return "";
  return "";
}

function currentView() {
  const views = {
    dashboard: dashboardView,
    inbox: inboxView,
    automations: automationsView,
    training: trainingView,
    customers: customersView,
    channels: channelsView,
    analytics: analyticsView,
    simulator: simulatorView
  };
  return (views[state.route] || dashboardView)();
}

function bindEvents() {
  document.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.selectConversation;
      if (id) state.selectedConversation = id;
      navigate(button.dataset.route);
    });
  });
  document.querySelector("[data-toggle-mobile]")?.addEventListener("click", () => setState({ mobileOpen: !state.mobileOpen }));
  document.querySelector("[data-close-mobile]")?.addEventListener("click", () => setState({ mobileOpen: false }));
  document.querySelectorAll("[data-modal]").forEach((button) => button.addEventListener("click", () => setState({ modal: button.dataset.modal })));
  document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", () => setState({ modal: null })));
  document.querySelectorAll("[data-conversation]").forEach((button) => button.addEventListener("click", () => setState({ selectedConversation: button.dataset.conversation })));
  document.querySelector("[data-inbox-filter]")?.addEventListener("change", (event) => setState({ inboxFilter: event.target.value }));
  document.querySelectorAll("[data-quick-filter]").forEach((button) => button.addEventListener("click", () => setState({ quickFilter: button.dataset.quickFilter })));
  document.querySelectorAll("[data-customer]").forEach((button) => button.addEventListener("click", () => setState({ selectedCustomer: button.dataset.customer })));
  document.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => setState({ simulatorMode: button.dataset.mode })));
  document.querySelector("[data-simulator-input]")?.addEventListener("input", (event) => setState({ simulatorText: event.target.value }));
}

function render() {
  app.innerHTML = renderLayout(currentView());
  bindEvents();
}

render();
