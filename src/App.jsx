import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  AlertCircle,
  BadgeCheck,
  BarChart3,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Gauge,
  ImagePlus,
  Infinity as InfinityIcon,
  LayoutDashboard,
  LineChart,
  LogOut,
  Megaphone,
  MessagesSquare,
  PenLine,
  Plus,
  Save,
  Send,
  Sparkles,
  Target,
  Trash2,
  Users,
  Wallet,
  Wand2,
  Zap,
} from "lucide-react";

const STORE_KEYS = {
  session: "infiniti-mkt-session",
  brand: "infiniti-mkt-brand",
  brief: "infiniti-mkt-brief",
  calendar: "infiniti-mkt-calendar",
  plans: "infiniti-mkt-plans",
  analytics: "infiniti-mkt-analytics",
  messages: "infiniti-mkt-messages",
};

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "studio", label: "Creative Studio", icon: Wand2 },
  { id: "planner", label: "Planificador", icon: Target },
  { id: "calendar", label: "Calendario", icon: CalendarDays },
  { id: "brand", label: "Brand Kit", icon: Briefcase },
  { id: "analytics", label: "Analitica", icon: LineChart },
  { id: "chat", label: "Estratega GPT", icon: MessagesSquare },
];

const defaultBrand = {
  name: "INFINITI IA",
  offer: "Automatizacion, estrategia y crecimiento con IA aplicada a negocio.",
  audience: "Fundadores, equipos comerciales y marcas que necesitan convertir mejor.",
  tone: "Ejecutivo, claro, directo y premium.",
  promise: "Convertir ideas dispersas en campanas medibles.",
  proof: "Procesos, IA y ejecucion semanal con foco en pipeline.",
  cta: "Agenda un diagnostico estrategico",
};

const defaultBrief = {
  goal: "Generar leads calificados para diagnosticos de marketing y automatizacion.",
  offer: "Diagnostico privado de 45 minutos para detectar fugas del embudo.",
  audience: "Dueños de negocio, directores comerciales y marketers senior.",
  channels: "LinkedIn, Instagram, email y WhatsApp.",
  budget: "1500",
  deadline: "14 dias",
  constraints: "Mantener tono premium, promesas realistas y CTA directo.",
};

const defaultCalendar = [
  {
    id: "seed-1",
    day: "Lunes",
    channel: "LinkedIn",
    title: "Post de autoridad sobre costo de oportunidad",
    objective: "Awareness",
    status: "Listo",
  },
  {
    id: "seed-2",
    day: "Miercoles",
    channel: "Email",
    title: "Secuencia de diagnostico con caso de uso",
    objective: "Consideracion",
    status: "Borrador",
  },
  {
    id: "seed-3",
    day: "Viernes",
    channel: "WhatsApp",
    title: "Mensaje de cierre para agenda",
    objective: "Conversion",
    status: "Programar",
  },
];

const seedCampaigns = [
  {
    name: "Diagnostico IA",
    channel: "LinkedIn + Email",
    stage: "Consideracion",
    budget: 1500,
    leads: 86,
    cpl: 17.44,
    status: "Activo",
  },
  {
    name: "Contenido Founder",
    channel: "Instagram",
    stage: "Awareness",
    budget: 800,
    leads: 41,
    cpl: 19.51,
    status: "Test",
  },
  {
    name: "Remarketing Demo",
    channel: "Meta Ads",
    stage: "Conversion",
    budget: 1200,
    leads: 54,
    cpl: 22.22,
    status: "Optimizar",
  },
];

const days = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"];
const channels = ["LinkedIn", "Instagram", "Email", "WhatsApp", "Meta Ads", "Google Ads"];
const objectives = ["Awareness", "Consideracion", "Conversion", "Retencion"];

function readStoredValue(key, fallback) {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function useStoredState(key, fallback) {
  const [value, setValue] = useState(() => readStoredValue(key, fallback));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Local storage can be unavailable in private modes.
    }
  }, [key, value]);

  return [value, setValue];
}

async function apiPost(path, payload) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "No se pudo completar la solicitud.");
  }

  return data;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function copyText(text) {
  if (!text) return;
  navigator.clipboard?.writeText(text).catch(() => {});
}

function downloadText(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function StatusPill({ tone = "neutral", children }) {
  return <span className={`status-pill ${tone}`}>{children}</span>;
}

function IconButton({ icon: Icon, label, onClick, type = "button", disabled = false, variant = "ghost" }) {
  return (
    <button type={type} className={`icon-button ${variant}`} onClick={onClick} disabled={disabled} title={label}>
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    onLogin({
      email: email || "admin@infiniti.com",
      createdAt: new Date().toISOString(),
    });
  }

  return (
    <main className="login-screen">
      <section className="login-shell" aria-label="Login privado">
        <div className="login-mark">
          <InfinityIcon size={54} />
          <h1>
            INFINITI <span>MKT</span>
          </h1>
          <p>Marketing OS</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email Agente"
            autoComplete="email"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Clave Maestra"
            autoComplete="current-password"
          />
          <button type="submit">
            <Zap size={18} />
            INICIAR SISTEMA
          </button>
        </form>
      </section>
    </main>
  );
}

function Sidebar({ activeTab, onTabChange, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand-lockup">
        <InfinityIcon size={30} />
        <span>INFINITI</span>
      </div>

      <nav className="sidebar-nav" aria-label="Navegacion principal">
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={activeTab === item.id ? "active" : ""}
              onClick={() => onTabChange(item.id)}
              title={item.label}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button className="logout-button" onClick={onLogout}>
        <LogOut size={18} />
        <span>Desconectar</span>
      </button>
    </aside>
  );
}

function Topbar({ tab, health, user }) {
  const current = tabs.find((item) => item.id === tab) || tabs[0];
  const tone = health?.ai ? "good" : health ? "warn" : "neutral";
  const label = health?.ai ? "IA activa" : health ? "Modo demo" : "API local";

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">INFINITI MKT</p>
        <h2>{current.label}</h2>
      </div>
      <div className="topbar-actions">
        <StatusPill tone={tone}>{label}</StatusPill>
        <span className="user-chip">{user?.email || "admin@infiniti.com"}</span>
      </div>
    </header>
  );
}

function MetricCard({ icon: Icon, label, value, delta, tone = "teal" }) {
  return (
    <article className={`metric-card ${tone}`}>
      <Icon size={20} />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{delta}</small>
      </div>
    </article>
  );
}

function Dashboard({ brand, calendarItems, health }) {
  const totalBudget = seedCampaigns.reduce((sum, item) => sum + item.budget, 0);
  const totalLeads = seedCampaigns.reduce((sum, item) => sum + item.leads, 0);
  const weightedCpl = totalLeads ? totalBudget / totalLeads : 0;
  const readyItems = calendarItems.filter((item) => item.status === "Listo").length;

  const funnel = [
    { label: "Alcance", value: 68400, percent: 100, tone: "teal" },
    { label: "Clicks", value: 4260, percent: 62, tone: "amber" },
    { label: "Leads", value: totalLeads, percent: 38, tone: "rose" },
    { label: "Citas", value: 32, percent: 18, tone: "violet" },
  ];

  return (
    <div className="page-grid">
      <section className="metrics-grid">
        <MetricCard icon={Wallet} label="Inversion activa" value={formatCurrency(totalBudget)} delta="3 campanas" />
        <MetricCard icon={Users} label="Leads estimados" value={totalLeads} delta={`${formatCurrency(weightedCpl)} CPL`} tone="amber" />
        <MetricCard icon={BadgeCheck} label="Piezas listas" value={readyItems} delta="calendario semanal" tone="rose" />
        <MetricCard icon={Gauge} label="Backend" value={health?.ai ? "Live" : "Demo"} delta="Vercel Functions" tone="violet" />
      </section>

      <section className="panel campaign-panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Pipeline</p>
            <h3>Campanas activas</h3>
          </div>
          <StatusPill tone="good">{brand.name}</StatusPill>
        </div>

        <div className="campaign-list">
          {seedCampaigns.map((campaign) => (
            <article className="campaign-row" key={campaign.name}>
              <div>
                <strong>{campaign.name}</strong>
                <span>{campaign.channel}</span>
              </div>
              <div>
                <small>{campaign.stage}</small>
                <strong>{campaign.leads} leads</strong>
              </div>
              <div>
                <small>CPL</small>
                <strong>{formatCurrency(campaign.cpl)}</strong>
              </div>
              <StatusPill tone={campaign.status === "Activo" ? "good" : campaign.status === "Optimizar" ? "warn" : "neutral"}>
                {campaign.status}
              </StatusPill>
            </article>
          ))}
        </div>
      </section>

      <section className="panel funnel-panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Embudo</p>
            <h3>Lectura semanal</h3>
          </div>
        </div>

        <div className="funnel-bars">
          {funnel.map((item) => (
            <div className="funnel-item" key={item.label}>
              <div>
                <span>{item.label}</span>
                <strong>{item.value.toLocaleString("es-CR")}</strong>
              </div>
              <div className="bar-track">
                <span className={item.tone} style={{ width: `${item.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel action-panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Prioridad</p>
            <h3>Acciones de crecimiento</h3>
          </div>
        </div>
        <div className="action-list">
          <ActionItem icon={Target} title="Validar promesa principal" text={brand.promise} />
          <ActionItem icon={Megaphone} title="Duplicar angulo ganador" text="Reusar hook ejecutivo en LinkedIn, email y remarketing." />
          <ActionItem icon={BarChart3} title="Medir conversion a cita" text="Separar CPL de leads frios y costo por diagnostico agendado." />
        </div>
      </section>
    </div>
  );
}

function ActionItem({ icon: Icon, title, text }) {
  return (
    <article className="action-item">
      <Icon size={18} />
      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </article>
  );
}

function CreativeStudio({ brand }) {
  const [mode, setMode] = useState("copy");
  const [platform, setPlatform] = useState("LinkedIn");
  const [tone, setTone] = useState(brand.tone);
  const [prompt, setPrompt] = useState("Lanzamiento de diagnostico de marketing con IA para empresas que quieren vender mejor.");
  const [referenceImage, setReferenceImage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      if (mode === "copy") {
        const data = await apiPost("/api/chat", {
          mode: "creative",
          message: prompt,
          context: { brand, platform, tone },
        });
        setResult({ type: "copy", content: data.response, meta: data.mode });
      } else {
        const data = await apiPost("/api/image", {
          prompt,
          reference_image: referenceImage,
          brand: { name: brand.name, tone },
        });
        setResult({ type: "image", url: data.url, enhanced: data.enhanced, meta: data.mode });
      }
    } catch (error) {
      setResult({ type: "error", content: error.message });
    } finally {
      setLoading(false);
    }
  }

  function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setReferenceImage(reader.result);
    reader.readAsDataURL(file);
  }

  return (
    <div className="workspace two-column">
      <section className="panel control-panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Studio</p>
            <h3>Produccion creativa</h3>
          </div>
        </div>

        <div className="segmented">
          <button className={mode === "copy" ? "selected" : ""} onClick={() => setMode("copy")}>
            <FileText size={17} />
            Copy
          </button>
          <button className={mode === "image" ? "selected" : ""} onClick={() => setMode("image")}>
            <ImagePlus size={17} />
            Imagen
          </button>
        </div>

        <label>
          Canal
          <select value={platform} onChange={(event) => setPlatform(event.target.value)}>
            {channels.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        <label>
          Tono
          <input value={tone} onChange={(event) => setTone(event.target.value)} />
        </label>

        <label className="textarea-label">
          Brief creativo
          <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} />
        </label>

        {mode === "image" && (
          <label className="upload-zone">
            <input type="file" accept="image/*" onChange={handleUpload} />
            {referenceImage ? (
              <img src={referenceImage} alt="Referencia visual cargada" />
            ) : (
              <span>
                <ImagePlus size={20} />
                Referencia visual
              </span>
            )}
          </label>
        )}

        <IconButton
          icon={Sparkles}
          label={loading ? "Generando" : mode === "copy" ? "Generar Copy" : "Generar Arte"}
          onClick={handleCreate}
          disabled={loading}
          variant="primary"
        />
      </section>

      <section className="panel output-panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Resultado</p>
            <h3>{mode === "copy" ? "Copy generado" : "Arte generado"}</h3>
          </div>
          {result?.meta && <StatusPill tone={result.meta === "live" ? "good" : "warn"}>{result.meta}</StatusPill>}
        </div>

        <div className="result-surface">
          {loading && (
            <div className="empty-state">
              <Sparkles size={34} />
              <strong>Generando activo...</strong>
            </div>
          )}

          {!loading && !result && (
            <div className="empty-state">
              <PenLine size={34} />
              <strong>Listo para crear</strong>
            </div>
          )}

          {result?.type === "copy" && (
            <>
              <div className="markdown-result">
                <ReactMarkdown>{result.content}</ReactMarkdown>
              </div>
              <div className="result-actions">
                <IconButton icon={Copy} label="Copiar" onClick={() => copyText(result.content)} />
                <IconButton icon={Download} label="Exportar" onClick={() => downloadText("infiniti-copy.md", result.content)} />
              </div>
            </>
          )}

          {result?.type === "image" && (
            <div className="image-result">
              <img src={result.url} alt="Arte generado para marketing" />
              <div className="result-actions">
                <a className="icon-button ghost" href={result.url} target="_blank" rel="noreferrer">
                  <Download size={18} />
                  <span>Abrir</span>
                </a>
                <IconButton icon={Copy} label="Copiar Prompt" onClick={() => copyText(result.enhanced)} />
              </div>
            </div>
          )}

          {result?.type === "error" && (
            <div className="error-box">
              <AlertCircle size={22} />
              <span>{result.content}</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Planner({ brand, brief, setBrief, plans, setPlans, setCalendarItems }) {
  const [plan, setPlan] = useState(plans[0]?.body || "");
  const [loading, setLoading] = useState(false);

  function updateBrief(field, value) {
    setBrief((current) => ({ ...current, [field]: value }));
  }

  async function generatePlan() {
    setLoading(true);
    setPlan("");
    try {
      const data = await apiPost("/api/chat", {
        mode: "planner",
        message: "Crea un plan de campana completo con calendario, piezas, KPIs y checklist.",
        context: { brand, brief },
      });
      setPlan(data.response);
    } catch (error) {
      setPlan(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  function savePlan() {
    if (!plan.trim()) return;
    const newPlan = {
      id: crypto.randomUUID(),
      title: brief.goal.slice(0, 70),
      body: plan,
      createdAt: new Date().toISOString(),
    };
    setPlans((current) => [newPlan, ...current].slice(0, 8));
  }

  function publishPlan() {
    const created = days.map((day, index) => ({
      id: crypto.randomUUID(),
      day,
      channel: channels[index % channels.length],
      title: `${objectives[index % objectives.length]}: ${brief.offer.slice(0, 58)}`,
      objective: objectives[index % objectives.length],
      status: index < 2 ? "Listo" : "Borrador",
    }));
    setCalendarItems((current) => [...created, ...current].slice(0, 30));
  }

  return (
    <div className="workspace two-column">
      <section className="panel control-panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Brief</p>
            <h3>Campana maestra</h3>
          </div>
        </div>

        <Field label="Objetivo" value={brief.goal} onChange={(value) => updateBrief("goal", value)} />
        <Field label="Oferta" value={brief.offer} onChange={(value) => updateBrief("offer", value)} />
        <Field label="Publico" value={brief.audience} onChange={(value) => updateBrief("audience", value)} />
        <Field label="Canales" value={brief.channels} onChange={(value) => updateBrief("channels", value)} />
        <div className="field-row">
          <Field label="Presupuesto" value={brief.budget} onChange={(value) => updateBrief("budget", value)} />
          <Field label="Plazo" value={brief.deadline} onChange={(value) => updateBrief("deadline", value)} />
        </div>
        <Field label="Restricciones" value={brief.constraints} onChange={(value) => updateBrief("constraints", value)} textarea />

        <IconButton icon={Sparkles} label={loading ? "Generando" : "Generar Plan"} onClick={generatePlan} disabled={loading} variant="primary" />
      </section>

      <section className="panel output-panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Plan</p>
            <h3>Ruta de ejecucion</h3>
          </div>
          <div className="button-row">
            <IconButton icon={Save} label="Guardar" onClick={savePlan} disabled={!plan} />
            <IconButton icon={CalendarDays} label="Calendario" onClick={publishPlan} disabled={!plan} />
          </div>
        </div>

        <div className="markdown-result planner-result">
          {loading ? (
            <div className="empty-state">
              <Sparkles size={34} />
              <strong>Armando plan...</strong>
            </div>
          ) : plan ? (
            <ReactMarkdown>{plan}</ReactMarkdown>
          ) : (
            <div className="empty-state">
              <Target size={34} />
              <strong>Brief listo</strong>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({ label, value, onChange, textarea = false }) {
  return (
    <label>
      {label}
      {textarea ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function ContentCalendar({ items, setItems }) {
  const [draft, setDraft] = useState({
    day: "Lunes",
    channel: "LinkedIn",
    title: "",
    objective: "Awareness",
    status: "Borrador",
  });

  function addItem(event) {
    event.preventDefault();
    if (!draft.title.trim()) return;
    setItems((current) => [{ ...draft, id: crypto.randomUUID() }, ...current]);
    setDraft((current) => ({ ...current, title: "" }));
  }

  function removeItem(id) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="workspace calendar-workspace">
      <section className="panel calendar-composer">
        <div className="section-title">
          <div>
            <p className="eyebrow">Calendario</p>
            <h3>Nueva pieza</h3>
          </div>
        </div>
        <form className="calendar-form" onSubmit={addItem}>
          <select value={draft.day} onChange={(event) => setDraft((current) => ({ ...current, day: event.target.value }))}>
            {days.map((day) => (
              <option key={day}>{day}</option>
            ))}
          </select>
          <select value={draft.channel} onChange={(event) => setDraft((current) => ({ ...current, channel: event.target.value }))}>
            {channels.map((channel) => (
              <option key={channel}>{channel}</option>
            ))}
          </select>
          <select value={draft.objective} onChange={(event) => setDraft((current) => ({ ...current, objective: event.target.value }))}>
            {objectives.map((objective) => (
              <option key={objective}>{objective}</option>
            ))}
          </select>
          <input
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            placeholder="Titulo de pieza"
          />
          <IconButton icon={Plus} label="Agregar" type="submit" variant="primary" />
        </form>
      </section>

      <section className="calendar-grid">
        {days.map((day) => (
          <article className="day-column" key={day}>
            <div className="day-header">
              <strong>{day}</strong>
              <span>{items.filter((item) => item.day === day).length}</span>
            </div>
            <div className="day-stack">
              {items
                .filter((item) => item.day === day)
                .map((item) => (
                  <article className="calendar-card" key={item.id}>
                    <div>
                      <StatusPill tone={item.status === "Listo" ? "good" : item.status === "Programar" ? "warn" : "neutral"}>
                        {item.status}
                      </StatusPill>
                      <button onClick={() => removeItem(item.id)} title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <strong>{item.title}</strong>
                    <span>{item.channel}</span>
                    <small>{item.objective}</small>
                  </article>
                ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function BrandKit({ brand, setBrand }) {
  function update(field, value) {
    setBrand((current) => ({ ...current, [field]: value }));
  }

  const fields = [
    ["name", "Marca"],
    ["offer", "Oferta"],
    ["audience", "Publico"],
    ["tone", "Tono"],
    ["promise", "Promesa"],
    ["proof", "Prueba"],
    ["cta", "CTA"],
  ];

  return (
    <div className="workspace brand-workspace">
      <section className="panel brand-form">
        <div className="section-title">
          <div>
            <p className="eyebrow">Brand Kit</p>
            <h3>Activos base</h3>
          </div>
          <StatusPill tone="good">Local</StatusPill>
        </div>
        <div className="brand-fields">
          {fields.map(([key, label]) => (
            <Field key={key} label={label} value={brand[key]} onChange={(value) => update(key, value)} textarea={key !== "name" && key !== "cta"} />
          ))}
        </div>
      </section>

      <section className="brand-preview">
        <article className="brand-card accent-teal">
          <Megaphone size={22} />
          <span>Oferta</span>
          <strong>{brand.offer}</strong>
        </article>
        <article className="brand-card accent-amber">
          <Users size={22} />
          <span>Publico</span>
          <strong>{brand.audience}</strong>
        </article>
        <article className="brand-card accent-rose">
          <CheckCircle2 size={22} />
          <span>Promesa</span>
          <strong>{brand.promise}</strong>
        </article>
        <article className="brand-card accent-violet">
          <Sparkles size={22} />
          <span>CTA</span>
          <strong>{brand.cta}</strong>
        </article>
      </section>
    </div>
  );
}

function Analytics({ analytics, setAnalytics, brand }) {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const numbers = useMemo(() => {
    const spend = Number(analytics.spend) || 0;
    const cpc = Number(analytics.cpc) || 1;
    const conversionRate = (Number(analytics.conversionRate) || 0) / 100;
    const closeRate = (Number(analytics.closeRate) || 0) / 100;
    const orderValue = Number(analytics.orderValue) || 0;
    const clicks = spend / cpc;
    const leads = clicks * conversionRate;
    const customers = leads * closeRate;
    const revenue = customers * orderValue;
    return {
      spend,
      clicks,
      leads,
      customers,
      revenue,
      roas: spend ? revenue / spend : 0,
      cpa: customers ? spend / customers : 0,
    };
  }, [analytics]);

  function update(field, value) {
    setAnalytics((current) => ({ ...current, [field]: value }));
  }

  async function analyze() {
    setLoading(true);
    setAnalysis("");
    try {
      const data = await apiPost("/api/chat", {
        mode: "analyst",
        message: "Analiza este escenario de performance y recomienda optimizaciones.",
        context: { brand, analytics, numbers },
      });
      setAnalysis(data.response);
    } catch (error) {
      setAnalysis(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="workspace two-column">
      <section className="panel control-panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">ROI</p>
            <h3>Calculadora</h3>
          </div>
        </div>
        <div className="field-row">
          <Field label="Inversion USD" value={analytics.spend} onChange={(value) => update("spend", value)} />
          <Field label="CPC USD" value={analytics.cpc} onChange={(value) => update("cpc", value)} />
        </div>
        <div className="field-row">
          <Field label="Conversion %" value={analytics.conversionRate} onChange={(value) => update("conversionRate", value)} />
          <Field label="Cierre %" value={analytics.closeRate} onChange={(value) => update("closeRate", value)} />
        </div>
        <Field label="Valor por venta USD" value={analytics.orderValue} onChange={(value) => update("orderValue", value)} />
        <IconButton icon={LineChart} label={loading ? "Analizando" : "Analizar"} onClick={analyze} disabled={loading} variant="primary" />
      </section>

      <section className="panel output-panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Performance</p>
            <h3>Escenario estimado</h3>
          </div>
        </div>
        <div className="metrics-grid compact">
          <MetricCard icon={Users} label="Leads" value={Math.round(numbers.leads)} delta={`${Math.round(numbers.clicks)} clicks`} />
          <MetricCard icon={BadgeCheck} label="Clientes" value={numbers.customers.toFixed(1)} delta="estimado" tone="amber" />
          <MetricCard icon={Wallet} label="Revenue" value={formatCurrency(numbers.revenue)} delta={`${numbers.roas.toFixed(2)} ROAS`} tone="rose" />
          <MetricCard icon={Gauge} label="CPA" value={formatCurrency(numbers.cpa)} delta="por venta" tone="violet" />
        </div>

        <div className="markdown-result analytics-result">
          {loading ? (
            <div className="empty-state">
              <Sparkles size={34} />
              <strong>Leyendo numeros...</strong>
            </div>
          ) : analysis ? (
            <ReactMarkdown>{analysis}</ReactMarkdown>
          ) : (
            <div className="empty-state">
              <BarChart3 size={34} />
              <strong>Modelo listo</strong>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ChatView({ brand, messages, setMessages }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(event) {
    event.preventDefault();
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const data = await apiPost("/api/chat", {
        mode: "chat",
        message: input,
        history: messages,
        context: { brand },
      });
      setMessages((current) => [...current, { role: "ai", content: data.response }]);
    } catch (error) {
      setMessages((current) => [...current, { role: "ai", content: `Error de conexion: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-workspace">
      <section className="message-stream">
        {messages.map((message, index) => (
          <article className={`message ${message.role === "user" ? "user" : "ai"}`} key={`${message.role}-${index}`}>
            <div className="message-badge">{message.role === "user" ? "TU" : "IA"}</div>
            <div className="markdown-result">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </article>
        ))}
        {loading && (
          <article className="message ai">
            <div className="message-badge">IA</div>
            <div className="typing">
              <Sparkles size={18} />
              Pensando estrategia...
            </div>
          </article>
        )}
        <div ref={bottomRef} />
      </section>

      <form className="chat-input" onSubmit={sendMessage}>
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Escribe tu consulta..." />
        <IconButton icon={Send} label="Enviar" type="submit" variant="primary" disabled={loading} />
      </form>
    </div>
  );
}

function AppShell({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [brand, setBrand] = useStoredState(STORE_KEYS.brand, defaultBrand);
  const [brief, setBrief] = useStoredState(STORE_KEYS.brief, defaultBrief);
  const [calendarItems, setCalendarItems] = useStoredState(STORE_KEYS.calendar, defaultCalendar);
  const [plans, setPlans] = useStoredState(STORE_KEYS.plans, []);
  const [analytics, setAnalytics] = useStoredState(STORE_KEYS.analytics, {
    spend: "2500",
    cpc: "1.80",
    conversionRate: "7.5",
    closeRate: "18",
    orderValue: "2200",
  });
  const [messages, setMessages] = useStoredState(STORE_KEYS.messages, [
    {
      role: "ai",
      content: "Hola. Soy tu Estratega de Marketing Senior. Que campana planeamos hoy?",
    },
  ]);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/health")
      .then((response) => response.json())
      .then((data) => mounted && setHealth(data))
      .catch(() => mounted && setHealth(null));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="app-shell">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout} />
      <main className="main-surface">
        <Topbar tab={activeTab} health={health} user={user} />
        <section className="content-surface">
          {activeTab === "dashboard" && <Dashboard brand={brand} calendarItems={calendarItems} health={health} />}
          {activeTab === "studio" && <CreativeStudio brand={brand} />}
          {activeTab === "planner" && (
            <Planner
              brand={brand}
              brief={brief}
              setBrief={setBrief}
              plans={plans}
              setPlans={setPlans}
              setCalendarItems={setCalendarItems}
            />
          )}
          {activeTab === "calendar" && <ContentCalendar items={calendarItems} setItems={setCalendarItems} />}
          {activeTab === "brand" && <BrandKit brand={brand} setBrand={setBrand} />}
          {activeTab === "analytics" && <Analytics analytics={analytics} setAnalytics={setAnalytics} brand={brand} />}
          {activeTab === "chat" && <ChatView brand={brand} messages={messages} setMessages={setMessages} />}
        </section>
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useStoredState(STORE_KEYS.session, null);

  function handleLogout() {
    setUser(null);
  }

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  return <AppShell user={user} onLogout={handleLogout} />;
}
