const names = [
  "Mariana Solis",
  "Daniel Vargas",
  "Camila Rojas",
  "Jose Araya",
  "Valeria Mora",
  "Esteban Castro",
  "Sofia Mendez",
  "Andres Pacheco",
  "Natalia Jimenez",
  "Luis Herrera",
  "Paola Cordero",
  "Marco Aguilar",
  "Adriana Ruiz",
  "Felipe Brenes",
  "Karina Salas",
  "Roberto Leon",
  "Gabriela Chacon",
  "Diego Navarro",
  "Melissa Quiros",
  "Ricardo Alfaro",
  "Lucia Campos",
  "Hector Molina",
  "Jimena Soto",
  "Alejandro Vega",
  "Fernanda Acuna",
  "Sebastian Murillo",
  "Karla Bonilla",
  "Oscar Quesada",
  "Daniela Fonseca",
  "Mauricio Arias"
];

const products = [
  "audifonos bluetooth",
  "silla ergonomica",
  "monitor curvo",
  "mochila ejecutiva",
  "teclado mecanico",
  "camara web",
  "escritorio ajustable",
  "lampara LED",
  "base para laptop",
  "smartwatch"
];

const channels = ["WhatsApp", "Instagram", "Web Chat", "Email", "Messenger"];
const priorities = ["Alta", "Media", "Baja"];
const statuses = ["Abierta", "En progreso", "Esperando cliente", "Resuelta"];
const intents = ["Compra", "Soporte", "Reclamo", "Consulta", "Seguimiento"];
const tags = ["VIP", "Nuevo", "Carrito", "Garantia", "Mayorista", "Urgente", "Fidelizado", "Cotizacion"];

export const company = {
  name: "NovaMarket",
  type: "Tienda online",
  bot: "NovaBot",
  plan: "Pro",
  activeChannels: ["WhatsApp", "Instagram", "Web Chat"]
};

export const agents = [
  { id: "ag-1", name: "Laura Moya", role: "Lider de soporte", status: "Conectada", load: 18, rating: 96 },
  { id: "ag-2", name: "Kevin Marin", role: "Ventas", status: "Conectado", load: 24, rating: 93 },
  { id: "ag-3", name: "Andrea Soto", role: "Customer success", status: "Conectada", load: 15, rating: 98 },
  { id: "ag-4", name: "Mateo Rivas", role: "Soporte tecnico", status: "Pausa", load: 9, rating: 91 },
  { id: "ag-5", name: "Elena Castro", role: "Operaciones", status: "Conectada", load: 12, rating: 95 }
];

function pick(list, index, shift = 0) {
  return list[(index + shift) % list.length];
}

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function money(value) {
  return `$${value.toLocaleString("en-US")}`;
}

export const customers = Array.from({ length: 88 }, (_, index) => {
  const name = `${pick(names, index)} ${index > 29 ? index + 1 : ""}`.trim();
  const intent = pick(intents, index, 2);
  const channel = pick(channels, index, 1);
  const interest = [92, 81, 73, 64, 56, 44][index % 6];
  const value = 75 + ((index * 47) % 1850);

  return {
    id: `cus-${index + 1}`,
    name,
    avatar: initials(name),
    channel,
    status: pick(["Activo", "Potencial", "En seguimiento", "Dormido"], index),
    lastInteraction: `Hace ${index % 9 === 0 ? 1 : (index % 24) + 1} h`,
    interest,
    value,
    valueLabel: money(value),
    intent,
    tags: [pick(tags, index), pick(tags, index, 3)],
    owner: pick(agents, index).name,
    since: `${3 + (index % 22)} meses`,
    favoriteChannel: channel,
    purchases: 1 + (index % 9),
    notes: [
      `Interes principal: ${pick(products, index)}.`,
      index % 3 === 0 ? "Solicita respuesta rapida y seguimiento por WhatsApp." : "Prefiere informacion breve con enlace al catalogo.",
      index % 4 === 0 ? "Tiene historial de compras recurrentes." : "Aun compara opciones antes de comprar."
    ]
  };
});

const customerPrompts = [
  "Hola, quiero saber si tienen disponible el producto.",
  "Me puedes confirmar el precio y el tiempo de entrega?",
  "Tengo una consulta sobre mi pedido anterior.",
  "Necesito cambiar la direccion de envio.",
  "El producto llego con un detalle y quiero soporte.",
  "Vi una promocion en Instagram, sigue activa?",
  "Quiero comprar para mi oficina, tienen descuento por volumen?",
  "Me ayudan con la garantia del pedido?"
];

const botReplies = [
  "Hola {{nombre}}, soy NovaBot. Ya revise disponibilidad y puedo ayudarte con opciones de entrega.",
  "Claro. Te comparto el precio actualizado, el plazo estimado y las formas de pago disponibles.",
  "Puedo ayudarte con el estado del pedido. Solo necesito confirmar el numero de orden.",
  "Entendido. Puedo actualizar la direccion antes de que el pedido pase a preparacion.",
  "Lamento el inconveniente. Abrire un caso de soporte y te indicare los pasos de garantia.",
  "Si, la promocion esta activa hoy. Puedo enviarte el catalogo filtrado por esa oferta."
];

export const conversations = Array.from({ length: 112 }, (_, index) => {
  const customer = customers[index % customers.length];
  const channel = pick(channels, index);
  const priority = pick(priorities, index, index % 2);
  const status = pick(statuses, index, 1);
  const intent = pick(intents, index);
  const product = pick(products, index);
  const messageCount = 3 + (index % 4);
  const messages = Array.from({ length: messageCount }, (_, messageIndex) => {
    const speaker = messageIndex === 0 ? "customer" : messageIndex % 3 === 1 ? "bot" : "agent";
    const baseText =
      speaker === "customer"
        ? customerPrompts[(index + messageIndex) % customerPrompts.length].replace("producto", product)
        : speaker === "bot"
          ? botReplies[(index + messageIndex) % botReplies.length].replace("{{nombre}}", customer.name.split(" ")[0])
          : `Perfecto, ${customer.name.split(" ")[0]}. Dejo la gestion registrada y continuo el seguimiento.`;

    return {
      id: `msg-${index + 1}-${messageIndex + 1}`,
      speaker,
      text: baseText,
      time: `${8 + ((index + messageIndex) % 10)}:${String((index * 7 + messageIndex * 11) % 60).padStart(2, "0")}`,
      attachment: messageIndex === 2 && index % 7 === 0 ? "Comprobante-pedido.pdf" : null
    };
  });

  return {
    id: `conv-${index + 1}`,
    customerId: customer.id,
    customer: customer.name,
    avatar: customer.avatar,
    channel,
    time: index < 8 ? `Hace ${index + 2} min` : `Hace ${(index % 23) + 1} h`,
    lastReply: messages[messages.length - 1].text,
    priority,
    status,
    intent,
    tags: customer.tags,
    agent: pick(agents, index, 2).name,
    satisfaction: 78 + (index % 21),
    value: customer.value,
    messages
  };
});

export const automationRules = [
  ["Responder FAQ", "Activa", "Hace 4 min", 91, "Reconoce preguntas frecuentes y responde con base de conocimiento."],
  ["Enviar catalogo", "Activa", "Hace 11 min", 87, "Detecta intencion de compra y envia colecciones relevantes."],
  ["Confirmar horarios", "Activa", "Hace 18 min", 96, "Responde horarios, dias feriados y tiempos de atencion."],
  ["Solicitar correo", "Activa", "Hace 28 min", 74, "Pide correo cuando el flujo requiere cotizacion o factura."],
  ["Solicitar telefono", "Inactiva", "Ayer", 62, "Completa datos para seguimiento comercial."],
  ["Detectar intencion de compra", "Activa", "Hace 8 min", 89, "Clasifica leads calientes y prioriza conversaciones."],
  ["Seguimiento postventa", "Activa", "Hace 1 h", 82, "Consulta satisfaccion despues de la entrega."],
  ["Recuperacion de clientes", "Activa", "Hace 3 h", 68, "Reactiva clientes sin respuesta en 7 dias."],
  ["Derivar a humano", "Activa", "Hace 6 min", 94, "Escala reclamos, enojo o baja confianza del bot."]
].map(([name, status, lastRun, effectiveness, description], index) => ({
  id: `auto-${index + 1}`,
  name,
  status,
  lastRun,
  effectiveness,
  description,
  executions: 120 + index * 37,
  owner: pick(agents, index).name
}));

export const quickReplies = [
  ["Ventas", "Hola {{nombre}}, el {{producto}} esta disponible. El precio actual es {{precio}} y puedo reservarlo por 24 horas."],
  ["Soporte", "Gracias por escribirnos, {{nombre}}. Ya revise tu caso {{pedido}} y te confirmo el estado en unos minutos."],
  ["Precios", "El precio de {{producto}} es {{precio}}. Incluye garantia y envio estimado para {{fecha}}."],
  ["Envios", "Tu pedido {{pedido}} se encuentra {{estado}}. Te avisaremos cuando salga a ruta."],
  ["Horarios", "Nuestro horario de atencion es lunes a sabado de 8:00 a.m. a 7:00 p.m."],
  ["Garantias", "La garantia cubre defectos de fabrica. Necesitamos foto, factura y numero de pedido {{pedido}}."],
  ["Reclamos", "Lamentamos lo ocurrido, {{nombre}}. Escalaremos tu caso con prioridad y seguimiento humano."],
  ["Ventas", "Puedo ayudarte a elegir entre opciones segun presupuesto, uso y fecha de entrega."]
].map(([category, body], index) => ({
  id: `reply-${index + 1}`,
  title: `${category} - Plantilla ${index + 1}`,
  category,
  body,
  favorite: index % 3 === 0,
  uses: 40 + index * 26,
  tags: [category, index % 2 === 0 ? "IA" : "Manual"]
}));

export const documents = [
  { name: "Politicas de garantia", type: "PDF", coverage: 96, updated: "Hace 2 dias" },
  { name: "Catalogo NovaMarket Q3", type: "XLSX", coverage: 89, updated: "Hace 5 dias" },
  { name: "Preguntas frecuentes", type: "DOCX", coverage: 94, updated: "Ayer" },
  { name: "Manual de envios", type: "PDF", coverage: 87, updated: "Hace 9 dias" },
  { name: "Promociones vigentes", type: "CSV", coverage: 91, updated: "Hoy" }
];

export const channelsData = [
  { name: "WhatsApp Business", status: "Conectado", sync: "Hace 3 min", messages: 8421, health: 98 },
  { name: "Instagram", status: "Conectado", sync: "Hace 9 min", messages: 3168, health: 94 },
  { name: "Messenger", status: "Listo para conectar", sync: "No sincronizado", messages: 0, health: 0 },
  { name: "Web Chat", status: "Conectado", sync: "Hace 1 min", messages: 1294, health: 99 },
  { name: "Email", status: "Pausado", sync: "Hace 2 dias", messages: 582, health: 71 }
];

export const plans = [
  {
    name: "Starter",
    price: "$49",
    users: "3 usuarios",
    channels: "2 canales",
    automations: "10 reglas",
    ai: "IA basica",
    support: "Soporte por email",
    storage: "5 GB",
    benefits: ["Inbox multicanal", "Respuestas rapidas", "Metricas basicas"]
  },
  {
    name: "Pro",
    price: "$129",
    users: "12 usuarios",
    channels: "5 canales",
    automations: "50 reglas",
    ai: "IA entrenable",
    support: "Soporte prioritario",
    storage: "50 GB",
    current: true,
    benefits: ["Automatizaciones avanzadas", "Analiticas", "Simulador IA", "Base de conocimiento"]
  },
  {
    name: "Enterprise",
    price: "A medida",
    users: "Ilimitados",
    channels: "Ilimitados",
    automations: "Ilimitadas",
    ai: "IA personalizada",
    support: "Gerente dedicado",
    storage: "500 GB",
    benefits: ["Roles avanzados", "SLA", "Auditoria", "Integraciones privadas"]
  }
];

export const chartSeries = {
  conversationsByDay: [128, 142, 156, 133, 178, 204, 196, 221, 238, 212, 249, 267, 241, 286],
  messagesByChannel: [
    { label: "WhatsApp", value: 54 },
    { label: "Instagram", value: 22 },
    { label: "Web Chat", value: 15 },
    { label: "Email", value: 6 },
    { label: "Messenger", value: 3 }
  ],
  weeklyTrend: [62, 68, 73, 71, 79, 84, 88],
  monthlyPerformance: [74, 78, 81, 83, 87, 89, 91, 93, 94, 96, 95, 97],
  peakHours: [12, 22, 34, 49, 72, 88, 94, 81, 66, 58, 39, 24],
  satisfaction: [88, 91, 93, 90, 94, 96, 95],
  botVsHuman: [
    { label: "Bot", value: 73 },
    { label: "Humano", value: 27 }
  ]
};

export const activity = [
  "NovaBot resolvio 42 consultas de catalogo sin intervencion humana.",
  "Se entreno la base de conocimiento con 5 documentos actualizados.",
  "Laura Moya tomo 6 conversaciones de alta prioridad.",
  "La regla Derivar a humano escalo 3 reclamos con baja satisfaccion.",
  "WhatsApp Business sincronizo 218 mensajes nuevos.",
  "La plantilla de envios alcanzo 184 usos esta semana.",
  "Se detectaron 17 leads con alta intencion de compra."
];

export const notifications = [
  { type: "info", title: "Pico de demanda", text: "El volumen subio 23% frente al martes anterior." },
  { type: "success", title: "Bot saludable", text: "La precision estimada se mantiene en 94%." },
  { type: "warning", title: "Documento pendiente", text: "Actualiza promociones para evitar respuestas desfasadas." }
];

export const campaigns = [
  { name: "Recuperacion de carritos", status: "Activa", reach: 1280, conversion: 14.8 },
  { name: "Garantia extendida", status: "Programada", reach: 620, conversion: 9.4 },
  { name: "Clientes VIP", status: "Activa", reach: 312, conversion: 22.1 }
];

export const settingsGroups = [
  ["Perfil", "Nombre, correo, avatar y preferencias personales"],
  ["Empresa", "Datos fiscales, marca, industria y ubicacion"],
  ["Horarios", "Disponibilidad, feriados y reglas fuera de horario"],
  ["Equipo", "Agentes, invitaciones y carga de trabajo"],
  ["Roles", "Permisos por area y niveles de acceso"],
  ["Mensajes", "Firmas, tono, respuestas del sistema"],
  ["Notificaciones", "Alertas por canal, prioridad y SLA"],
  ["Marca", "Logo, colores, widget web y estilo conversacional"],
  ["Idioma", "Español, ingles y reglas de traduccion"],
  ["Zona horaria", "America/Costa_Rica y horarios regionales"],
  ["Bot", "Personalidad, limites, escalamiento y seguridad"],
  ["Seguridad", "Sesiones, auditoria y politicas internas"]
].map(([name, description], index) => ({ id: `set-${index + 1}`, name, description }));

export { money };
