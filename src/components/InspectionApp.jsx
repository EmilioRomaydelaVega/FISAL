import { useState, useRef, useCallback, useEffect } from "react";
import jsPDF from "jspdf";
import fisalrentLogo from "@/assets/fisalrent-logo.jpg.asset.json";
import { supabase } from "@/integrations/supabase/client";

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function toCSV(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v) => {
    if (v == null) return "";
    const s = String(v).replace(/\r?\n/g, " ");
    return /[",;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(";"), ...rows.map(r => headers.map(h => esc(r[h])).join(";"))].join("\n");
}

function exportCSV(rows, filename) {
  downloadBlob("\uFEFF" + toCSV(rows), filename, "text/csv;charset=utf-8;");
}

function exportListPDF(title, rows, filename) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210, pageH = 297, margin = 12;
  doc.setFillColor(8, 12, 18); doc.rect(0, 0, pageW, 22, "F");
  doc.setFillColor(245, 184, 0); doc.rect(0, 22, pageW, 1.2, "F");
  doc.setTextColor(245, 184, 0); doc.setFont("helvetica", "bold"); doc.setFontSize(16);
  doc.text("FISALRENT", margin, 12);
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  doc.text(title, margin, 18);
  doc.setFontSize(9); doc.text(new Date().toLocaleString("es-ES"), pageW - margin, 12, { align: "right" });
  doc.text(`Total: ${rows.length}`, pageW - margin, 18, { align: "right" });

  let y = 30;
  doc.setTextColor(30, 30, 30); doc.setFontSize(9);
  if (!rows.length) {
    doc.text("Sin datos.", margin, y);
  } else {
    const headers = Object.keys(rows[0]);
    const colW = (pageW - margin * 2) / headers.length;
    doc.setFont("helvetica", "bold"); doc.setFillColor(230, 230, 230);
    doc.rect(margin, y - 4, pageW - margin * 2, 6, "F");
    headers.forEach((h, i) => doc.text(String(h), margin + i * colW + 1, y));
    y += 5;
    doc.setFont("helvetica", "normal");
    rows.forEach((r, idx) => {
      if (y > pageH - 15) { doc.addPage(); y = 20; }
      if (idx % 2 === 0) { doc.setFillColor(248, 248, 248); doc.rect(margin, y - 4, pageW - margin * 2, 6, "F"); }
      headers.forEach((h, i) => {
        const raw = r[h] == null ? "" : String(r[h]).replace(/\r?\n/g, " ");
        const txt = doc.splitTextToSize(raw, colW - 2)[0] || "";
        doc.text(txt, margin + i * colW + 1, y);
      });
      y += 5;
    });
  }
  doc.save(filename);
}

const exportBtnStyle = { background: "none", border: "1px solid #2a3a52", borderRadius: 6, padding: "6px 12px", color: "#94a3b8", fontFamily: "inherit", fontSize: 11, fontWeight: 600, cursor: "pointer" };


function generateInspectionPDF(insp) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 14;
  let y = 14;

  // Header band
  doc.setFillColor(8, 12, 18);
  doc.rect(0, 0, pageW, 26, "F");
  doc.setFillColor(245, 184, 0);
  doc.rect(0, 26, pageW, 1.5, "F");
  doc.setTextColor(245, 184, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("FISALRENT", margin, 13);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Informe de inspeccion de maquinaria Komatsu", margin, 20);
  doc.setFontSize(9);
  doc.text(insp.date, pageW - margin, 13, { align: "right" });
  doc.text(`ID: ${insp.id}`, pageW - margin, 20, { align: "right" });
  y = 36;

  // Type badge
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(insp.type === "salida" ? 59 : 245, insp.type === "salida" ? 130 : 158, insp.type === "salida" ? 246 : 11);
  doc.text(insp.type === "salida" ? "INSPECCION DE SALIDA" : "INSPECCION DE ENTRADA", margin, y);
  y += 8;

  // Machine block
  doc.setDrawColor(220);
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(margin, y, pageW - margin * 2, 22, 2, 2, "F");
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(insp.machine.name, margin + 4, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`${insp.machine.serial}  -  ${insp.machine.category}`, margin + 4, y + 14);
  doc.text(`Combustible: ${insp.fuelLevel}    Horas/Km: ${insp.km || "-"}`, margin + 4, y + 19);
  y += 28;

  // Data section
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Datos de la inspeccion", margin, y);
  y += 5;
  doc.setDrawColor(245, 184, 0);
  doc.line(margin, y, pageW - margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const rows = [
    ["Cliente", insp.client],
    ["Operario", insp.operator],
    ["Firma", insp.signName],
  ];
  rows.forEach(([k, v]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${k}:`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(v || "-"), margin + 28, y);
    y += 5.5;
  });
  y += 3;

  // Checklist
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text("Checklist tecnico", margin, y);
  y += 5;
  doc.setDrawColor(245, 184, 0);
  doc.line(margin, y, pageW - margin, y);
  y += 5;
  doc.setFontSize(9);
  Object.entries(insp.checklist).forEach(([id, status]) => {
    if (y > 270) { doc.addPage(); y = 20; }
    const colors = { ok: [16, 185, 129], defecto: [239, 68, 68], "n/a": [120, 120, 120] };
    const labels = { ok: "OK", defecto: "DEFECTO", "n/a": "N/A" };
    const [r, g, b] = colors[status];
    doc.setFillColor(r, g, b);
    doc.roundedRect(margin, y - 3.5, 22, 5, 1, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(labels[status], margin + 11, y, { align: "center" });
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "normal");
    doc.text(id, margin + 26, y);
    const note = insp.checkNotes?.[id];
    if (note) {
      doc.setTextColor(120, 120, 120);
      doc.text(`- ${note}`, margin + 70, y);
    }
    y += 6;
  });
  y += 3;

  // Damages
  if (insp.damages.length > 0) {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text(`Desperfectos registrados (${insp.damages.length})`, margin, y);
    y += 5;
    doc.setDrawColor(245, 184, 0);
    doc.line(margin, y, pageW - margin, y);
    y += 5;
    doc.setFontSize(9);
    insp.damages.forEach(d => {
      if (y > 275) { doc.addPage(); y = 20; }
      const sevColor = d.severity === "grave" ? [239, 68, 68] : d.severity === "moderado" ? [245, 158, 11] : [120, 120, 120];
      doc.setFillColor(...sevColor);
      doc.roundedRect(margin, y - 3.5, 22, 5, 1, 1, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text(d.severity.toUpperCase(), margin + 11, y, { align: "center" });
      doc.setTextColor(40, 40, 40);
      doc.setFont("helvetica", "normal");
      doc.text(`${d.zone} - ${d.type}`, margin + 26, y);
      y += 5;
      if (d.desc) {
        doc.setTextColor(110, 110, 110);
        const lines = doc.splitTextToSize(d.desc, pageW - margin * 2 - 26);
        doc.text(lines, margin + 26, y);
        y += lines.length * 4.5;
      }
      y += 2;
    });
  }

  // Notes
  if (insp.notes) {
    if (y > 250) { doc.addPage(); y = 20; }
    y += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text("Notas generales", margin, y);
    y += 5;
    doc.setDrawColor(245, 184, 0);
    doc.line(margin, y, pageW - margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    const lines = doc.splitTextToSize(insp.notes, pageW - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 5;
  }

  // Photos
  if (insp.photos.length > 0) {
    doc.addPage();
    y = 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text(`Fotografias (${insp.photos.length})`, margin, y);
    y += 4;
    doc.setDrawColor(245, 184, 0);
    doc.line(margin, y, pageW - margin, y);
    y += 6;
    const colW = (pageW - margin * 2 - 6) / 2;
    const rowH = 60;
    let col = 0;
    insp.photos.forEach(p => {
      if (y + rowH > 285) { doc.addPage(); y = 20; col = 0; }
      const x = margin + col * (colW + 6);
      try {
        doc.addImage(p.src, "JPEG", x, y, colW, rowH, undefined, "FAST");
      } catch (e) {
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("(imagen no disponible)", x + 2, y + 8);
      }
      col++;
      if (col >= 2) { col = 0; y += rowH + 6; }
    });
  }

  // Footer on each page
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text(`FISALRENT - Informe de inspeccion - ${insp.machine.name}`, margin, 292);
    doc.text(`Pagina ${i} / ${pages}`, pageW - margin, 292, { align: "right" });
  }

  const safeName = `${insp.machine.name}-${insp.type}-${insp.id}`.replace(/[^a-z0-9\-]/gi, "_");
  doc.save(`Inspeccion_${safeName}.pdf`);
}



const CHECKLIST = [
  { id: "motor", label: "Motor / Arranque", icon: "⚙️", group: "Motor" },
  { id: "aceite", label: "Nivel de aceite", icon: "🛢️", group: "Motor" },
  { id: "refrigerante", label: "Nivel refrigerante", icon: "🌡️", group: "Motor" },
  { id: "hidraulico", label: "Sistema hidráulico", icon: "🔩", group: "Hidráulica" },
  { id: "mangueras", label: "Mangueras / Fugas", icon: "💧", group: "Hidráulica" },
  { id: "neumaticos", label: "Neumáticos", icon: "🛞", group: "Ruedas" },
  { id: "orugas", label: "Orugas", icon: "⛓️", group: "Orugas" },
  { id: "frenos", label: "Frenos", icon: "🛑", group: "Rodadura" },
  { id: "luces", label: "Luces y señalización", icon: "💡", group: "Eléctrico" },
  { id: "bateria", label: "Batería", icon: "🔋", group: "Eléctrico" },
  { id: "cabina", label: "Cabina / Asiento", icon: "🪑", group: "Cabina" },
  { id: "cinturon", label: "Cinturón de seguridad", icon: "🔐", group: "Cabina" },
  { id: "extint", label: "Extintor", icon: "🧯", group: "Seguridad" },
  { id: "cazo", label: "Cazo", icon: "🪣", group: "Cazo" },
  { id: "cazo_dientes", label: "Dientes del cazo", icon: "🦷", group: "Cazo" },
  { id: "cazo_bulones", label: "Bulones / Pasadores del cazo", icon: "🔗", group: "Cazo" },
  { id: "botiquin", label: "Botiquín de emergencia", icon: "🩹", group: "Seguridad" },
  { id: "docs", label: "Documentación / Manual", icon: "📋", group: "Documentación" },
];

const DAMAGE_ZONES = [
  { id: "frontal", label: "Frontal", x: 42, y: 10 },
  { id: "trasera", label: "Trasera", x: 42, y: 75 },
  { id: "lateral_izq", label: "Lateral Izq.", x: 5, y: 42 },
  { id: "lateral_der", label: "Lateral Der.", x: 79, y: 42 },
  { id: "superior", label: "Superior", x: 42, y: 42 },
  { id: "cabina", label: "Cabina", x: 25, y: 28 },
  { id: "brazo", label: "Brazo/Pluma", x: 65, y: 28 },
  { id: "tren_rod", label: "Tren rodaje", x: 42, y: 62 },
];

const DAMAGE_TYPES = ["Arañazo", "Abolladura", "Rotura", "Corrosión", "Deformación", "Otro"];

const STATUS_CONFIG = {
  ok: { color: "#10b981", label: "OK", icon: "✓" },
  defecto: { color: "#ef4444", label: "Defecto", icon: "✗" },
  "n/a": { color: "#475569", label: "N/A", icon: "—" },
};

function PhotoCapture({ photos, onAdd, onRemove }) {
  const fileRef = useRef();

  const handleFile = (e) => {
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => onAdd({ id: Date.now() + Math.random(), src: ev.target.result, name: file.name, size: (file.size / 1024).toFixed(0) + "KB", ts: new Date().toLocaleTimeString() });
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" multiple capture="environment" onChange={handleFile} style={{ display: "none" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
        <button onClick={() => fileRef.current.click()} style={{ background: "#0d1420", border: "2px dashed #2a3a52", borderRadius: 10, padding: "24px 10px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "#475569", transition: "all 0.2s", fontFamily: "inherit" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#f5b800"; e.currentTarget.style.color = "#f5b800"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a3a52"; e.currentTarget.style.color = "#475569"; }}>
          <span style={{ fontSize: 28 }}>📷</span>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Añadir foto</span>
        </button>
        {photos.map(p => (
          <div key={p.id} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid #1e2a3d", aspectRatio: "1" }}>
            <img src={p.src} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }} />
            <div style={{ position: "absolute", bottom: 6, left: 6, right: 6 }}>
              <div style={{ fontSize: 10, color: "#94a3b8" }}>{p.ts}</div>
            </div>
            <button onClick={() => onRemove(p.id)} style={{ position: "absolute", top: 6, right: 6, background: "#ef4444", border: "none", color: "#fff", width: 22, height: 22, borderRadius: "50%", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function DamageMapper({ damages, onAdd, onRemove, machine }) {
  const [active, setActive] = useState(null);
  const [form, setForm] = useState({ type: "Arañazo", desc: "", severity: "leve" });

  const handleZoneClick = (zoneId) => {
    setActive(active === zoneId ? null : zoneId);
  };

  const handleAdd = () => {
    if (!active) return;
    onAdd({ id: Date.now(), zone: active, ...form });
    setActive(null);
    setForm({ type: "Arañazo", desc: "", severity: "leve" });
  };

  const zoneHasDamage = (zoneId) => damages.some(d => d.zone === zoneId);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Visual map */}
        <div>
          <p style={{ fontSize: 11, color: "#475569", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>Toca una zona para marcar desperfecto</p>
          <div style={{ position: "relative", background: "#0d1420", border: "1px solid #1e2a3d", borderRadius: 12, padding: "16px", aspectRatio: "1" }}>
            {/* Machine silhouette grid */}
            <div style={{ position: "absolute", inset: "16px", border: "1px solid #1e2a3d", borderRadius: 8, background: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(30,42,61,0.3) 10px, rgba(30,42,61,0.3) 11px)" }} />
            <div style={{ position: "absolute", inset: "28px", border: "2px solid #1e2a3d", borderRadius: 6, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <span style={{ fontSize: 72, opacity: 0.35, lineHeight: 1 }}>{machine?.image || "🚜"}</span>
              {machine && (
                <div style={{ textAlign: "center", opacity: 0.6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.5 }}>{machine.name}</div>
                  <div style={{ fontSize: 9, color: "#64748b", marginTop: 2 }}>{machine.serial}</div>
                </div>
              )}
            </div>
            {DAMAGE_ZONES.map(zone => {
              const hasDmg = zoneHasDamage(zone.id);
              const isActive = active === zone.id;
              return (
                <button key={zone.id} onClick={() => handleZoneClick(zone.id)} style={{
                  position: "absolute", left: `${zone.x}%`, top: `${zone.y}%`, transform: "translate(-50%,-50%)",
                  width: isActive ? 36 : 28, height: isActive ? 36 : 28, borderRadius: "50%",
                  border: `2px solid ${isActive ? "#f5b800" : hasDmg ? "#ef4444" : "#2a3a52"}`,
                  background: isActive ? "#f5b80020" : hasDmg ? "#ef444420" : "#0d1420",
                  cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, color: isActive ? "#f5b800" : hasDmg ? "#ef4444" : "#475569", fontWeight: 800,
                  zIndex: 2, fontFamily: "inherit",
                  boxShadow: isActive ? "0 0 12px #f5b80040" : hasDmg ? "0 0 8px #ef444440" : "none"
                }}>
                  {hasDmg ? "!" : "+"}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 10, fontSize: 11 }}>
            <span style={{ color: "#475569" }}>⬤ Sin daño</span>
            <span style={{ color: "#ef4444" }}>⬤ Con daño</span>
            <span style={{ color: "#f5b800" }}>⬤ Seleccionado</span>
          </div>
        </div>

        {/* Form / legend */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {active ? (
            <div style={{ background: "#0d1420", border: "1px solid #f5b80040", borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f5b800", marginBottom: 12 }}>
                📍 {DAMAGE_ZONES.find(z => z.id === active)?.label}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))} style={{ background: "#151b27", border: "1px solid #2a3a52", borderRadius: 6, padding: "8px 10px", color: "#e2e8f0", fontFamily: "inherit", fontSize: 13 }}>
                  {DAMAGE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <div style={{ display: "flex", gap: 6 }}>
                  {["leve","moderado","grave"].map(s => (
                    <button key={s} onClick={() => setForm(p => ({...p, severity: s}))} style={{
                      flex: 1, padding: "7px 4px", border: `1px solid ${form.severity === s ? (s==="leve"?"#10b981":s==="moderado"?"#f59e0b":"#ef4444") : "#2a3a52"}`,
                      background: form.severity === s ? (s==="leve"?"#10b98115":s==="moderado"?"#f59e0b15":"#ef444415") : "transparent",
                      color: form.severity === s ? (s==="leve"?"#10b981":s==="moderado"?"#f59e0b":"#ef4444") : "#475569",
                      borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "inherit", letterSpacing: 0.5, textTransform: "capitalize"
                    }}>{s}</button>
                  ))}
                </div>
                <textarea value={form.desc} onChange={e => setForm(p => ({...p, desc: e.target.value}))} placeholder="Descripción del desperfecto..." rows={3} style={{ background: "#151b27", border: "1px solid #2a3a52", borderRadius: 6, padding: "8px 10px", color: "#e2e8f0", fontFamily: "inherit", fontSize: 13, resize: "none", outline: "none" }} />
                <button onClick={handleAdd} style={{ background: "#f5b800", border: "none", borderRadius: 6, padding: "10px", color: "#0d1420", fontFamily: "inherit", fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
                  Registrar Desperfecto
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background: "#0d1420", border: "1px solid #1e2a3d", borderRadius: 10, padding: 16, color: "#475569", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>👆</div>
              <p style={{ fontSize: 12 }}>Selecciona una zona en el diagrama para registrar un desperfecto</p>
            </div>
          )}

          {/* Damage list */}
          {damages.length > 0 && (
            <div style={{ flex: 1, overflowY: "auto" }}>
              <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1, textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Desperfectos registrados</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {damages.map(d => (
                  <div key={d.id} style={{ background: "#0d1420", border: `1px solid ${d.severity==="grave"?"#ef444440":d.severity==="moderado"?"#f59e0b40":"#10b98140"}`, borderRadius: 8, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{DAMAGE_ZONES.find(z=>z.id===d.zone)?.label} · {d.type}</div>
                      {d.desc && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{d.desc}</div>}
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: d.severity==="grave"?"#ef4444":d.severity==="moderado"?"#f59e0b":"#10b981", marginTop: 4, display: "inline-block" }}>● {d.severity}</span>
                    </div>
                    <button onClick={() => onRemove(d.id)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 16, padding: "0 4px", fontFamily: "inherit" }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const STEPS = ["Datos", "Checklist", "Fotos", "Desperfectos", "Firma & Envío"];

export default function InspectionApp() {
  const [view, setView] = useState("home"); // home | new | history | fleet
  const [step, setStep] = useState(0);
  const [inspType, setInspType] = useState(null); // "salida" | "entrada"
  const [inspections, setInspections] = useState([]);
  const [fleet, setFleet] = useState({});
  const [fleetFilter, setFleetFilter] = useState("all");
  const [customMachines, setCustomMachines] = useState([]);

  // Initial load from Lovable Cloud + realtime sync (shared across all users/devices)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [insR, flR, cmR] = await Promise.all([
        supabase.from("inspections").select("data").order("created_at", { ascending: false }),
        supabase.from("fleet").select("machine_id, data"),
        supabase.from("custom_machines").select("data").order("created_at", { ascending: true }),
      ]);
      if (cancelled) return;
      if (insR.data) setInspections(insR.data.map(r => r.data));
      if (flR.data) {
        const obj = {};
        flR.data.forEach(r => { obj[r.machine_id] = r.data; });
        setFleet(obj);
      }
      if (cmR.data) setCustomMachines(cmR.data.map(r => r.data));
    })();

    const channel = supabase
      .channel("fisalrent-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "inspections" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setInspections(prev => prev.some(i => String(i.id) === String(payload.new.data.id)) ? prev : [payload.new.data, ...prev]);
        } else if (payload.eventType === "DELETE") {
          setInspections(prev => prev.filter(i => String(i.id) !== String(payload.old.id)));
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "fleet" }, (payload) => {
        if (payload.eventType === "DELETE") {
          setFleet(prev => { const n = { ...prev }; delete n[payload.old.machine_id]; return n; });
        } else {
          setFleet(prev => ({ ...prev, [payload.new.machine_id]: payload.new.data }));
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "custom_machines" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setCustomMachines(prev => prev.some(m => String(m.id) === String(payload.new.data.id)) ? prev : [...prev, payload.new.data]);
        } else if (payload.eventType === "DELETE") {
          setCustomMachines(prev => prev.filter(m => String(m.id) !== String(payload.old.id)));
        }
      })
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, []);

  const updateFleet = (machineId, patch) => {
    setFleet(prev => {
      const next = { ...(prev[machineId] || {}), ...patch };
      supabase.from("fleet").upsert({ machine_id: String(machineId), data: next, updated_at: new Date().toISOString() }).then(({ error }) => { if (error) console.error(error); });
      return { ...prev, [machineId]: next };
    });
  };
  const [expandedMachine, setExpandedMachine] = useState(null);



  const allMachines = customMachines;

  // Form state
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [client, setClient] = useState("");
  const [operator, setOperator] = useState("");
  const [km, setKm] = useState("");
  const [fuelLevel, setFuelLevel] = useState("3/4");
  const [notes, setNotes] = useState("");
  const [checklist, setChecklist] = useState(() => Object.fromEntries(CHECKLIST.map(c => [c.id, "ok"])));
  const [checkNotes, setCheckNotes] = useState({});
  const [photos, setPhotos] = useState([]);
  const [damages, setDamages] = useState([]);
  const [signName, setSignName] = useState("");
  const [notification, setNotification] = useState(null);

  // Machine management form state
  const [machineForm, setMachineForm] = useState({ name: "", serial: "", category: "", image: "🚜" });
  const MACHINE_ICONS = ["🚜", "🏗️", "🚛", "🦺", "⛏️", "🔧", "⚙️", "🏭"];

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const resetForm = () => {
    setStep(0); setInspType(null); setSelectedMachine(null);
    setClient(""); setOperator(""); setKm(""); setFuelLevel("3/4"); setNotes("");
    setChecklist(Object.fromEntries(CHECKLIST.map(c => [c.id, "ok"])));
    setCheckNotes({}); setPhotos([]); setDamages([]); setSignName("");
  };

  const handleSubmit = () => {
    if (!signName.trim()) { notify("Introduce el nombre para la firma", "error"); return; }
    const insp = {
      id: Date.now(),
      type: inspType,
      machine: selectedMachine,
      client, operator, km, fuelLevel, notes,
      checklist: { ...checklist }, checkNotes: { ...checkNotes },
      photos: [...photos], damages: [...damages],
      signName, date: new Date().toLocaleString("es-ES"),
      defectCount: damages.length,
      failCount: Object.values(checklist).filter(v => v === "defecto").length,
    };
    setInspections(prev => [insp, ...prev]);
    supabase.from("inspections").insert({ id: String(insp.id), data: insp }).then(({ error }) => { if (error) console.error(error); });

    try { generateInspectionPDF(insp); } catch (e) { console.error(e); }
    resetForm();
    setView("history");
    notify(inspType === "salida" ? "✅ Inspección de salida registrada · PDF descargado" : "✅ Inspección de entrada registrada · PDF descargado");
  };

  const canProceed = () => {
    if (step === 0) return selectedMachine && client && operator;
    return true;
  };

  const groups = [...new Set(CHECKLIST.map(c => c.group))];
  const defectItems = CHECKLIST.filter(c => checklist[c.id] === "defecto");
  const overallStatus = damages.length === 0 && defectItems.length === 0 ? "ok" : damages.some(d => d.severity === "grave") || defectItems.length > 2 ? "grave" : "aviso";

  const FUEL_LEVELS = ["Vacío", "1/4", "1/2", "3/4", "Lleno"];

  return (
    <div style={{ fontFamily: "'DM Mono', 'Courier New', monospace", background: "#080c12", minHeight: "100vh", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #0d1420; } ::-webkit-scrollbar-thumb { background: #f5b800; border-radius: 3px; }
        button { cursor: pointer; }
        textarea, input, select { outline: none; }
        .check-btn { background: none; border: 1.5px solid #1e2a3d; border-radius: 6px; padding: 6px 12px; color: #475569; font-family: inherit; font-size: 11px; font-weight: 500; letter-spacing: 0.5px; cursor: pointer; transition: all 0.15s; }
        .check-btn.ok { border-color: #10b981; color: #10b981; background: #10b98112; }
        .check-btn.defecto { border-color: #ef4444; color: #ef4444; background: #ef444412; }
        .check-btn.na { border-color: #475569; color: #94a3b8; background: #47556920; }
        .step-dot { width: 8px; height: 8px; border-radius: 50%; transition: all 0.3s; }
        .notif { position: fixed; top: 16px; right: 16px; padding: 12px 18px; border-radius: 8px; font-size: 12px; font-weight: 500; z-index: 200; animation: slideDown 0.3s ease; }
        @keyframes slideDown { from { transform: translateY(-16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .insp-card { background: #0d1420; border: 1px solid #1e2a3d; border-radius: 10px; padding: 16px; transition: border-color 0.2s; }
        .insp-card:hover { border-color: #2a3a52; }
        .field-label { font-size: 10px; color: #475569; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; display: block; margin-bottom: 6px; }
        .field-input { background: #0d1420; border: 1px solid #1e2a3d; border-radius: 6px; padding: 10px 12px; color: #e2e8f0; font-family: inherit; font-size: 13px; width: 100%; transition: border-color 0.2s; }
        .field-input:focus { border-color: #f5b800; }
        .type-card { background: #0d1420; border: 2px solid #1e2a3d; border-radius: 14px; padding: 28px 20px; cursor: pointer; text-align: center; transition: all 0.25s; flex: 1; }
        .type-card:hover { transform: translateY(-3px); }
      `}</style>

      {notification && (
        <div className="notif" style={{ background: notification.type === "error" ? "#ef4444" : "#f5b800", color: "#080c12" }}>
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ background: "#0a0e17", borderBottom: "1px solid #1e2a3d", padding: "14px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={fisalrentLogo.url} alt="FISALRENT" style={{ height: 40, width: "auto", background: "#fff", padding: "4px 8px", borderRadius: 6 }} />
            <div style={{ fontSize: 9, color: "#475569", letterSpacing: 3, textTransform: "uppercase", borderLeft: "1px solid #1e2a3d", paddingLeft: 12 }}>
              Inspección de<br/>maquinaria Komatsu
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[["home","🏠 Inicio"],["new","+ Nueva Inspección"],["machines","⚙️ Máquinas"],["fleet","🚛 Flota"],["history","📁 Historial"]].map(([v, label]) => (
              <button key={v} onClick={() => { if (v !== "new") { setView(v); resetForm(); } else { setView("new"); setStep(0); } }}
                style={{ background: view === v ? "#f5b80015" : "none", border: `1px solid ${view === v ? "#f5b800" : "#1e2a3d"}`, borderRadius: 6, padding: "7px 14px", color: view === v ? "#f5b800" : "#64748b", fontFamily: "inherit", fontSize: 11, fontWeight: 500, letterSpacing: 0.5, transition: "all 0.2s" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>

        {/* HOME */}
        {view === "home" && (
          <div>
            <div style={{ textAlign: "center", padding: "40px 0 48px" }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: -1, marginBottom: 12 }}>
                Inspecciones de <span style={{ color: "#f5b800" }}>Maquinaria</span>
              </div>
              <p style={{ color: "#475569", fontSize: 14, maxWidth: 480, margin: "0 auto 32px" }}>
                Registra el estado de cada máquina antes de la salida y a la vuelta con fotos, checklist técnico y mapa de desperfectos.
              </p>
              <button onClick={() => setView("new")} style={{ background: "#f5b800", border: "none", borderRadius: 10, padding: "14px 36px", color: "#080c12", fontFamily: "inherit", fontSize: 13, fontWeight: 500, letterSpacing: 1, cursor: "pointer" }}>
                + Nueva Inspección
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
              {[
                { icon: "🚜", title: "Inspección de Salida", desc: "Documenta el estado antes de la entrega al cliente", color: "#3b82f6" },
                { icon: "🔄", title: "Inspección de Entrada", desc: "Revisa y compara el estado a la devolución", color: "#f59e0b" },
                { icon: "📊", title: "Historial Completo", desc: "Accede a todos los registros anteriores", color: "#10b981" },
              ].map((item, i) => (
                <div key={i} className="insp-card" style={{ textAlign: "center", padding: 24 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>{item.title}</div>
                  <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              ))}
            </div>

            {inspections.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, textTransform: "uppercase", fontWeight: 500, marginBottom: 14 }}>Últimas inspecciones</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {inspections.slice(0, 3).map(insp => (
                    <div key={insp.id} className="insp-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <span style={{ fontSize: 24 }}>{insp.machine.image}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>{insp.machine.name}</div>
                          <div style={{ fontSize: 11, color: "#475569" }}>{insp.client} · {insp.date}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: insp.type === "alquiler" ? "#10b98120" : insp.type === "salida" ? "#3b82f620" : "#f59e0b20", color: insp.type === "alquiler" ? "#10b981" : insp.type === "salida" ? "#3b82f6" : "#f59e0b", border: `1px solid ${insp.type === "alquiler" ? "#10b98140" : insp.type === "salida" ? "#3b82f640" : "#f59e0b40"}` }}>
                        {insp.type === "alquiler" ? "📦 ALQUILER" : insp.type === "salida" ? "↑ SALIDA" : "↓ ENTRADA"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* NEW INSPECTION */}
        {view === "new" && (
          <div>
            {/* Type selection */}
            {!inspType ? (
              <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", paddingTop: 20 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Nueva Inspección</div>
                <p style={{ color: "#475569", fontSize: 13, marginBottom: 32 }}>¿Es una inspección de salida o de entrada?</p>
                <div style={{ display: "flex", gap: 16 }}>
                  {[
                    { type: "salida", icon: "🚀", title: "Inspección de SALIDA", desc: "La máquina sale a cliente. Documenta su estado actual.", color: "#3b82f6" },
                    { type: "entrada", icon: "🏁", title: "Inspección de ENTRADA", desc: "La máquina regresa. Compara y registra novedades.", color: "#f59e0b" },
                  ].map(opt => (
                    <button key={opt.type} className="type-card" onClick={() => setInspType(opt.type)}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = opt.color; e.currentTarget.style.boxShadow = `0 0 20px ${opt.color}20`; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e2a3d"; e.currentTarget.style.boxShadow = "none"; }}>
                      <div style={{ fontSize: 36, marginBottom: 12 }}>{opt.icon}</div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>{opt.title}</div>
                      <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {/* Step indicator */}
                <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32, background: "#0d1420", border: "1px solid #1e2a3d", borderRadius: 10, padding: "14px 20px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${((step + 1) / STEPS.length) * 100}%`, background: "linear-gradient(90deg, #f5b80010, transparent)", transition: "width 0.4s ease" }} />
                  {STEPS.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", flex: 1, gap: 8, position: "relative" }}>
                      <div style={{ width: 26, height: 26, borderRadius: "50%", border: `2px solid ${i <= step ? "#f5b800" : "#2a3a52"}`, background: i < step ? "#f5b800" : i === step ? "#f5b80020" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: i < step ? "#080c12" : i === step ? "#f5b800" : "#475569", fontWeight: 700, flexShrink: 0, transition: "all 0.3s" }}>
                        {i < step ? "✓" : i + 1}
                      </div>
                      <span style={{ fontSize: 10, color: i === step ? "#f5b800" : i < step ? "#64748b" : "#2a3a52", fontWeight: 500, letterSpacing: 0.5, whiteSpace: "nowrap" }}>{s}</span>
                      {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: i < step ? "#f5b80040" : "#1e2a3d", margin: "0 8px" }} />}
                    </div>
                  ))}
                </div>

                {/* Badge */}
                <div style={{ display: "flex", gap: 10, marginBottom: 24, alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 20, background: inspType === "salida" ? "#3b82f620" : "#f59e0b20", color: inspType === "salida" ? "#3b82f6" : "#f59e0b", border: `1px solid ${inspType === "salida" ? "#3b82f640" : "#f59e0b40"}`, letterSpacing: 1, textTransform: "uppercase" }}>
                    {inspType === "salida" ? "↑ SALIDA" : "↓ ENTRADA"}
                  </span>
                  {selectedMachine && <span style={{ fontSize: 12, color: "#64748b" }}>{selectedMachine.image} {selectedMachine.name}</span>}
                </div>

                {/* STEP 0: DATOS */}
                {step === 0 && (
                  <div>
                    <SectionTitle>Datos de la Inspección</SectionTitle>
                    <div style={{ display: "grid", gap: 20 }}>
                      <div>
                        <label className="field-label">Selecciona la máquina *</label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                          {allMachines.map(m => (
                            <button key={m.id} onClick={() => setSelectedMachine(m)} style={{
                              background: selectedMachine?.id === m.id ? "#f5b80015" : "#0d1420",
                              border: `1.5px solid ${selectedMachine?.id === m.id ? "#f5b800" : "#1e2a3d"}`,
                              borderRadius: 10, padding: "12px 14px", cursor: "pointer", display: "flex", gap: 10, alignItems: "center", transition: "all 0.2s", fontFamily: "inherit"
                            }}>
                              <span style={{ fontSize: 24 }}>{m.image}</span>
                              <div style={{ textAlign: "left" }}>
                                <div style={{ fontSize: 12, fontWeight: 500, color: selectedMachine?.id === m.id ? "#f5b800" : "#e2e8f0" }}>{m.name}</div>
                                <div style={{ fontSize: 10, color: "#475569" }}>{m.serial}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div>
                          <label className="field-label">Cliente / Empresa *</label>
                          <input className="field-input" placeholder="Nombre del cliente..." value={client} onChange={e => setClient(e.target.value)} />
                        </div>
                        <div>
                          <label className="field-label">Operario responsable *</label>
                          <input className="field-input" placeholder="Nombre del operario..." value={operator} onChange={e => setOperator(e.target.value)} />
                        </div>
                        <div>
                          <label className="field-label">Horómetro / Km actuales</label>
                          <input className="field-input" placeholder="ej. 1520 h" value={km} onChange={e => setKm(e.target.value)} />
                        </div>
                        <div>
                          <label className="field-label">Nivel de combustible</label>
                          <div style={{ display: "flex", gap: 6 }}>
                            {FUEL_LEVELS.map(f => (
                              <button key={f} onClick={() => setFuelLevel(f)} style={{ flex: 1, padding: "8px 4px", border: `1px solid ${fuelLevel === f ? "#f5b800" : "#1e2a3d"}`, background: fuelLevel === f ? "#f5b80015" : "#0d1420", color: fuelLevel === f ? "#f5b800" : "#475569", borderRadius: 6, fontSize: 10, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", transition: "all 0.15s" }}>{f}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="field-label">Notas generales</label>
                        <textarea className="field-input" rows={3} placeholder="Observaciones iniciales..." value={notes} onChange={e => setNotes(e.target.value)} style={{ resize: "none" }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 1: CHECKLIST */}
                {step === 1 && (
                  <div>
                    <SectionTitle>Checklist Técnico</SectionTitle>
                    <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                      {[["ok", "#10b981"], ["defecto", "#ef4444"], ["n/a", "#475569"]].map(([s, c]) => (
                        <div key={s} style={{ fontSize: 11, color: c, border: `1px solid ${c}40`, padding: "4px 10px", borderRadius: 12 }}>
                          {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}: {Object.values(checklist).filter(v => v === s).length}
                        </div>
                      ))}
                    </div>
                    {groups.map(group => (
                      <div key={group} style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, textTransform: "uppercase", fontWeight: 500, marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid #1e2a3d" }}>{group}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {CHECKLIST.filter(c => c.group === group).map(item => (
                            <div key={item.id} style={{ background: "#0d1420", border: `1px solid ${checklist[item.id] === "defecto" ? "#ef444430" : "#1e2a3d"}`, borderRadius: 8, padding: "10px 14px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                                <span style={{ fontSize: 13, color: "#94a3b8" }}>{item.icon} {item.label}</span>
                                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                  {["ok", "defecto", "n/a"].map(s => (
                                    <button key={s} className={`check-btn ${checklist[item.id] === s ? s === "n/a" ? "na" : s : ""}`} onClick={() => setChecklist(p => ({ ...p, [item.id]: s }))}>
                                      {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              {checklist[item.id] === "defecto" && (
                                <input className="field-input" style={{ marginTop: 8, fontSize: 12, padding: "7px 10px" }} placeholder="Describe el defecto encontrado..." value={checkNotes[item.id] || ""} onChange={e => setCheckNotes(p => ({ ...p, [item.id]: e.target.value }))} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* STEP 2: FOTOS */}
                {step === 2 && (
                  <div>
                    <SectionTitle>Registro Fotográfico</SectionTitle>
                    <p style={{ fontSize: 12, color: "#475569", marginBottom: 20 }}>Añade fotos del estado actual de la máquina. Puedes usar la cámara del dispositivo.</p>
                    <PhotoCapture photos={photos} onAdd={p => setPhotos(prev => [...prev, p])} onRemove={id => setPhotos(prev => prev.filter(p => p.id !== id))} />
                    {photos.length === 0 && (
                      <div style={{ background: "#0d1420", border: "1px dashed #2a3a52", borderRadius: 10, padding: 24, textAlign: "center", marginTop: 16, color: "#475569", fontSize: 12 }}>
                        ⚠️ Se recomienda añadir al menos 4 fotos (frontal, trasera y laterales)
                      </div>
                    )}
                    {photos.length > 0 && (
                      <div style={{ marginTop: 16, padding: "10px 14px", background: "#f5b80010", border: "1px solid #f5b80030", borderRadius: 8, fontSize: 12, color: "#f5b800" }}>
                        ✓ {photos.length} foto{photos.length > 1 ? "s" : ""} registrada{photos.length > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3: DESPERFECTOS */}
                {step === 3 && (
                  <div>
                    <SectionTitle>Mapa de Desperfectos</SectionTitle>
                    <p style={{ fontSize: 12, color: "#475569", marginBottom: 20 }}>Marca las zonas afectadas en el diagrama y detalla el tipo y gravedad.</p>
                    <DamageMapper machine={selectedMachine} damages={damages} onAdd={d => setDamages(prev => [...prev, d])} onRemove={id => setDamages(prev => prev.filter(d => d.id !== id))} />
                    {damages.length === 0 && (
                      <div style={{ marginTop: 16, padding: "10px 14px", background: "#10b98110", border: "1px solid #10b98130", borderRadius: 8, fontSize: 12, color: "#10b981" }}>
                        ✓ Sin desperfectos registrados
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 4: FIRMA */}
                {step === 4 && (
                  <div>
                    <SectionTitle>Resumen y Firma</SectionTitle>
                    {/* Summary */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
                      {[
                        ["Máquina", `${selectedMachine?.image} ${selectedMachine?.name}`],
                        ["Cliente", client],
                        ["Operario", operator],
                        ["Combustible", fuelLevel],
                        ["Horómetro", km || "—"],
                        ["Fotos", `${photos.length} foto${photos.length !== 1 ? "s" : ""}`],
                      ].map(([k, v]) => (
                        <div key={k} style={{ background: "#0d1420", border: "1px solid #1e2a3d", borderRadius: 8, padding: "10px 14px" }}>
                          <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{k}</div>
                          <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Alert summary */}
                    <div style={{ background: overallStatus === "ok" ? "#10b98112" : overallStatus === "aviso" ? "#f59e0b12" : "#ef444412", border: `1px solid ${overallStatus === "ok" ? "#10b98130" : overallStatus === "aviso" ? "#f59e0b30" : "#ef444430"}`, borderRadius: 10, padding: "16px 18px", marginBottom: 24 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: overallStatus === "ok" ? "#10b981" : overallStatus === "aviso" ? "#f59e0b" : "#ef4444", marginBottom: 8 }}>
                        {overallStatus === "ok" ? "✅ Sin incidencias" : overallStatus === "aviso" ? "⚠️ Incidencias leves" : "🚨 Incidencias graves"}
                      </div>
                      <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#64748b" }}>
                        <span>Checklist: {Object.values(checklist).filter(v => v === "defecto").length} defectos</span>
                        <span>Desperfectos: {damages.length}</span>
                        {damages.some(d => d.severity === "grave") && <span style={{ color: "#ef4444" }}>⚠ {damages.filter(d => d.severity === "grave").length} graves</span>}
                      </div>
                    </div>

                    {/* Signature */}
                    <div style={{ background: "#0d1420", border: "1px solid #1e2a3d", borderRadius: 10, padding: 20 }}>
                      <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 14 }}>Confirmo que los datos de esta inspección son correctos:</div>
                      <label className="field-label">Nombre completo del firmante *</label>
                      <input className="field-input" placeholder="Nombre y apellidos..." value={signName} onChange={e => setSignName(e.target.value)} />
                      <div style={{ marginTop: 12, fontSize: 11, color: "#475569" }}>
                        📅 Fecha y hora: {new Date().toLocaleString("es-ES")}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, paddingTop: 20, borderTop: "1px solid #1e2a3d" }}>
                  <button onClick={() => step === 0 ? setInspType(null) : setStep(p => p - 1)} style={{ background: "#0d1420", border: "1px solid #1e2a3d", borderRadius: 8, padding: "11px 22px", color: "#64748b", fontFamily: "inherit", fontSize: 12, fontWeight: 500, letterSpacing: 0.5, transition: "all 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#2a3a52"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2a3d"}>
                    ← Atrás
                  </button>
                  {step < STEPS.length - 1 ? (
                    <button onClick={() => { if (!canProceed()) { notify("Completa los campos obligatorios", "error"); return; } setStep(p => p + 1); }} style={{ background: "#f5b800", border: "none", borderRadius: 8, padding: "11px 28px", color: "#080c12", fontFamily: "inherit", fontSize: 12, fontWeight: 500, letterSpacing: 1, cursor: "pointer", opacity: canProceed() ? 1 : 0.5 }}>
                      Siguiente →
                    </button>
                  ) : (
                    <button onClick={handleSubmit} style={{ background: "#f5b800", border: "none", borderRadius: 8, padding: "11px 28px", color: "#080c12", fontFamily: "inherit", fontSize: 12, fontWeight: 700, letterSpacing: 1, cursor: "pointer", textTransform: "uppercase" }}>
                      ✓ Finalizar Inspección
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FLEET */}
        {view === "fleet" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: "#fff" }}>Gestión de Flota</div>
              <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>Alquileres activos, ubicación, extintor y próxima revisión</p>
            </div>

            {(() => {
              const today = new Date();
              const stats = allMachines.reduce((acc, m) => {
                const f = fleet[m.id] || {};
                if (f.client && f.client.trim()) acc.rented++;
                else acc.available++;
                if (f.extinguisherDate) {
                  const d = new Date(f.extinguisherDate);
                  const diff = (d - today) / (1000 * 60 * 60 * 24);
                  if (diff < 0) acc.expired++;
                  else if (diff < 30) acc.soon++;
                }
                return acc;
              }, { rented: 0, available: 0, expired: 0, soon: 0 });
              return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "Alquiladas", value: stats.rented, color: "#f5b800", filter: "rented" },
                    { label: "Disponibles", value: stats.available, color: "#10b981", filter: "available" },
                    { label: "Extintor <30 días", value: stats.soon, color: "#f59e0b" },
                    { label: "Extintor caducado", value: stats.expired, color: "#ef4444" },
                  ].map(s => {
                    const isActive = s.filter && fleetFilter === s.filter;
                    const clickable = !!s.filter;
                    return (
                      <div
                        key={s.label}
                        className="insp-card"
                        onClick={() => {
                          if (!clickable) return;
                          setFleetFilter(isActive ? "all" : s.filter);
                        }}
                        style={{
                          textAlign: "center",
                          padding: 14,
                          cursor: clickable ? "pointer" : "default",
                          outline: isActive ? `2px solid ${s.color}` : "none",
                          outlineOffset: isActive ? 2 : 0,
                          opacity: clickable && fleetFilter !== "all" && !isActive ? 0.6 : 1,
                          transition: "all 0.2s",
                        }}
                      >
                        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1.2, textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {allMachines.filter(m => {
                if (fleetFilter === "all") return true;
                const f = fleet[m.id] || {};
                const isRented = f.client && f.client.trim();
                if (fleetFilter === "rented") return isRented;
                if (fleetFilter === "available") return !isRented;
                return true;
              }).map(m => {
                const f = fleet[m.id] || {};
                const isRented = f.client && f.client.trim();
                const isOpen = expandedMachine === m.id;
                let extStatus = null;
                if (f.extinguisherDate) {
                  const d = new Date(f.extinguisherDate);
                  const diff = (d - new Date()) / (1000 * 60 * 60 * 24);
                  if (diff < 0) extStatus = { color: "#ef4444", label: "⚠ Extintor CADUCADO" };
                  else if (diff < 30) extStatus = { color: "#f59e0b", label: `⏰ Extintor en ${Math.ceil(diff)} días` };
                  else extStatus = { color: "#10b981", label: `✓ Extintor OK (${Math.ceil(diff)} días)` };
                }
                return (
                  <div key={m.id} className="insp-card" style={{ padding: 0, overflow: "hidden" }}>
                    <div onClick={() => setExpandedMachine(isOpen ? null : m.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, cursor: "pointer" }}>
                      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                        <div style={{ fontSize: 30 }}>{m.image}</div>
                        <div>
                          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{m.name}</div>
                          <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{m.serial} · {m.category}</div>
                          <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 12, background: isRented ? "#f5b80020" : "#10b98120", color: isRented ? "#f5b800" : "#10b981", border: `1px solid ${isRented ? "#f5b80040" : "#10b98140"}`, letterSpacing: 0.8 }}>
                              {isRented ? "ALQUILADA" : "DISPONIBLE"}
                            </span>
                            {isRented && <span style={{ fontSize: 11, color: "#94a3b8" }}>👤 {f.client}</span>}
                            {isRented && f.location && <span style={{ fontSize: 11, color: "#94a3b8" }}>📍 {f.location}</span>}
                            {f.hasExtinguisher && <span style={{ fontSize: 11, color: "#94a3b8" }}>🧯 Con extintor</span>}
                          </div>
                          {extStatus && (
                            <div style={{ fontSize: 10, color: extStatus.color, marginTop: 6, fontWeight: 600 }}>{extStatus.label}</div>
                          )}
                          {isRented && f.rentEnd && (() => {
                            const today = new Date(); today.setHours(0,0,0,0);
                            const end = new Date(f.rentEnd); end.setHours(0,0,0,0);
                            const days = Math.round((end - today) / 86400000);
                            if (days < 0) return <div style={{ fontSize: 10, color: "#ef4444", marginTop: 6, fontWeight: 700 }}>⚠️ Alquiler vencido hace {Math.abs(days)} día{Math.abs(days)===1?"":"s"}</div>;
                            if (days === 0) return <div style={{ fontSize: 10, color: "#ef4444", marginTop: 6, fontWeight: 700 }}>⚠️ El alquiler finaliza HOY</div>;
                            if (days <= 5) return <div style={{ fontSize: 10, color: "#f5b800", marginTop: 6, fontWeight: 700 }}>⏰ Alquiler finaliza en {days} día{days===1?"":"s"} ({f.rentEnd})</div>;
                            return null;
                          })()}
                        </div>
                      </div>
                      <div style={{ color: "#64748b", fontSize: 18 }}>{isOpen ? "▴" : "▾"}</div>
                    </div>

                    {isOpen && (
                      <div style={{ padding: 16, borderTop: "1px solid #1e2a3d", background: "#0a0f18", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label className="field-label">Cliente que la tiene</label>
                          <input className="field-input" value={f.client || ""} onChange={e => updateFleet(m.id, { client: e.target.value })} placeholder="Nombre del cliente / empresa" />
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label className="field-label">Ubicación / Obra</label>
                          <input className="field-input" value={f.location || ""} onChange={e => updateFleet(m.id, { location: e.target.value })} placeholder="Dirección, obra o zona" />
                        </div>
                        <div>
                          <label className="field-label">Fecha inicio alquiler</label>
                          <input type="date" className="field-input" value={f.rentStart || ""} onChange={e => updateFleet(m.id, { rentStart: e.target.value })} />
                        </div>
                        <div>
                          <label className="field-label">Fecha fin / prevista</label>
                          <input type="date" className="field-input" value={f.rentEnd || ""} onChange={e => updateFleet(m.id, { rentEnd: e.target.value })} />
                        </div>
                        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 16, alignItems: "center", padding: "10px 12px", background: "#0d1420", border: "1px solid #1e2a3d", borderRadius: 6 }}>
                          <label style={{ display: "flex", gap: 8, alignItems: "center", color: "#e2e8f0", fontSize: 12, cursor: "pointer" }}>
                            <input type="checkbox" checked={!!f.hasExtinguisher} onChange={e => updateFleet(m.id, { hasExtinguisher: e.target.checked })} style={{ accentColor: "#f5b800", width: 16, height: 16 }} />
                            🧯 La máquina lleva extintor
                          </label>
                        </div>
                        {f.hasExtinguisher && (
                          <div style={{ gridColumn: "1 / -1" }}>
                            <label className="field-label">Próxima fecha de revisión del extintor</label>
                            <input type="date" className="field-input" value={f.extinguisherDate || ""} onChange={e => updateFleet(m.id, { extinguisherDate: e.target.value })} />
                          </div>
                        )}
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label className="field-label">📎 Documentación de la máquina</label>
                          <div style={{ background: "#0d1420", border: "1px solid #1e2a3d", borderRadius: 6, padding: 12 }}>
                            {(f.documents || []).length === 0 && (
                              <div style={{ fontSize: 11, color: "#475569", marginBottom: 10 }}>Sin documentos. Sube ITV, ficha técnica, seguro, manuales, etc.</div>
                            )}
                            {(f.documents || []).length > 0 && (
                              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                                {(f.documents || []).map((doc, idx) => (
                                  <div key={doc.path} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "#080c12", border: "1px solid #1e2a3d", borderRadius: 4 }}>
                                    <div style={{ fontSize: 12, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, marginRight: 8 }}>
                                      📄 {doc.name}
                                      <span style={{ fontSize: 10, color: "#64748b", marginLeft: 8 }}>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("es-ES") : ""}</span>
                                    </div>
                                    <div style={{ display: "flex", gap: 6 }}>
                                      <button onClick={async () => {
                                        const { data, error } = await supabase.storage.from("machine-docs").createSignedUrl(doc.path, 3600);
                                        if (error) { notify("Error al abrir documento", "error"); return; }
                                        window.open(data.signedUrl, "_blank");
                                      }} style={{ background: "none", border: "1px solid #2a3a52", borderRadius: 4, padding: "4px 10px", color: "#f5b800", fontSize: 10, fontWeight: 700, cursor: "pointer", textTransform: "uppercase", letterSpacing: 0.5 }}>Ver</button>
                                      <button onClick={async () => {
                                        if (!confirm("¿Eliminar este documento?")) return;
                                        await supabase.storage.from("machine-docs").remove([doc.path]);
                                        const next = (f.documents || []).filter((_, i) => i !== idx);
                                        updateFleet(m.id, { documents: next });
                                        notify("Documento eliminado");
                                      }} style={{ background: "none", border: "1px solid #2a3a52", borderRadius: 4, padding: "4px 10px", color: "#ef4444", fontSize: 10, fontWeight: 700, cursor: "pointer", textTransform: "uppercase", letterSpacing: 0.5 }}>Eliminar</button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            <label style={{ display: "inline-block", background: "#f5b80020", border: "1px dashed #f5b80060", borderRadius: 6, padding: "8px 14px", color: "#f5b800", fontSize: 11, fontWeight: 700, cursor: "pointer", textTransform: "uppercase", letterSpacing: 0.8 }}>
                              + Subir documento
                              <input type="file" style={{ display: "none" }} onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (file.size > 20 * 1024 * 1024) { notify("Máximo 20MB por archivo", "error"); return; }
                                const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
                                const path = `${m.id}/${Date.now()}_${safeName}`;
                                notify("Subiendo documento...");
                                const { error } = await supabase.storage.from("machine-docs").upload(path, file, { contentType: file.type || "application/octet-stream" });
                                if (error) { notify("Error al subir: " + error.message, "error"); return; }
                                const newDoc = { name: file.name, path, uploadedAt: new Date().toISOString(), size: file.size };
                                const next = [...(f.documents || []), newDoc];
                                updateFleet(m.id, { documents: next });
                                notify("✅ Documento subido");
                                e.target.value = "";
                              }} />
                            </label>
                          </div>
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label className="field-label">Notas</label>
                          <textarea className="field-input" rows={2} value={f.notes || ""} onChange={e => updateFleet(m.id, { notes: e.target.value })} placeholder="Observaciones sobre el alquiler" style={{ resize: "vertical", fontFamily: "inherit" }} />
                        </div>
                        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <button onClick={async () => {
                            if (!f.client) { notify("Sin cliente asignado · nada que archivar", "error"); return; }
                            if (!confirm("¿Liberar la máquina y archivar el alquiler en el historial?")) return;
                            const today = new Date().toISOString().slice(0, 10);
                            const clientNorm = (f.client || "").toLowerCase().trim();
                            const usedIds = new Set();
                            inspections.forEach(i => { if (i.type === "alquiler" && Array.isArray(i.relatedInspectionIds)) i.relatedInspectionIds.forEach(id => usedIds.add(String(id))); });
                            const related = inspections.filter(i => i.type !== "alquiler" && i.machine?.id === m.id && (i.client || "").toLowerCase().trim() === clientNorm && !usedIds.has(String(i.id)));
                            const rental = {
                              id: "rental-" + Date.now(),
                              type: "alquiler",
                              machine: { id: m.id, name: m.name, image: m.image },
                              client: f.client,
                              location: f.location || "",
                              rentStart: f.rentStart || "",
                              rentEnd: f.rentEnd || today,
                              releasedAt: today,
                              date: today,
                              notes: f.notes || "",
                              documents: f.documents || [],
                              relatedInspectionIds: related.map(i => i.id),
                              // compat fields for legacy renderers
                              operator: "—", fuelLevel: "—", km: "", photos: [], failCount: 0, defectCount: 0, signName: f.client,
                            };
                            const { error } = await supabase.from("inspections").insert({ id: String(rental.id), data: rental });
                            if (error) { notify("Error al archivar: " + error.message, "error"); return; }
                            setInspections(prev => [rental, ...prev]);
                            updateFleet(m.id, { client: "", location: "", rentStart: "", rentEnd: "", notes: "", documents: [] });
                            notify("Alquiler archivado en el historial");
                          }}
                            style={{ background: "none", border: "1px solid #2a3a52", borderRadius: 6, padding: "8px 14px", color: "#94a3b8", fontFamily: "inherit", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, cursor: "pointer" }}>
                            Liberar máquina
                          </button>
                          <button onClick={() => { setExpandedMachine(null); notify("✅ Datos guardados"); }}
                            style={{ background: "#f5b800", border: "none", borderRadius: 6, padding: "8px 16px", color: "#080c12", fontFamily: "inherit", fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: "pointer", textTransform: "uppercase" }}>
                            Guardar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MACHINES */}
        {view === "machines" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: "#fff" }}>Gestión de Máquinas</div>
              <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>Añade máquinas para usar en inspecciones y flota</p>
            </div>

            {/* Add machine form */}
            <div className="insp-card" style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f5b800", marginBottom: 16 }}>+ Añadir nueva máquina</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label className="field-label">Nombre de la máquina *</label>
                  <input className="field-input" placeholder="ej. Komatsu PC210LC-10" value={machineForm.name} onChange={e => setMachineForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="field-label">Número de serie *</label>
                  <input className="field-input" placeholder="ej. S/N K60365" value={machineForm.serial} onChange={e => setMachineForm(p => ({ ...p, serial: e.target.value }))} />
                </div>
                <div>
                  <label className="field-label">Categoría *</label>
                  <input className="field-input" placeholder="ej. Excavadora" value={machineForm.category} onChange={e => setMachineForm(p => ({ ...p, category: e.target.value }))} />
                </div>
                <div>
                  <label className="field-label">Icono</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {MACHINE_ICONS.map(icon => (
                      <button key={icon} onClick={() => setMachineForm(p => ({ ...p, image: icon }))} style={{
                        width: 36, height: 36, borderRadius: 8, border: `2px solid ${machineForm.image === icon ? "#f5b800" : "#1e2a3d"}`,
                        background: machineForm.image === icon ? "#f5b80020" : "#0d1420", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                      }}>{icon}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => {
                  if (!machineForm.name.trim() || !machineForm.serial.trim() || !machineForm.category.trim()) {
                    notify("Completa nombre, serie y categoría", "error"); return;
                  }
                  const newMachine = {
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    name: machineForm.name.trim(),
                    serial: machineForm.serial.trim(),
                    category: machineForm.category.trim(),
                    image: machineForm.image,
                  };
                  setCustomMachines(prev => [...prev, newMachine]);
                  supabase.from("custom_machines").insert({ id: String(newMachine.id), data: newMachine }).then(({ error }) => { if (error) console.error(error); });

                  setMachineForm({ name: "", serial: "", category: "", image: "🚜" });
                  notify("✅ Máquina añadida correctamente");
                }} style={{ background: "#f5b800", border: "none", borderRadius: 8, padding: "10px 24px", color: "#080c12", fontFamily: "inherit", fontSize: 12, fontWeight: 700, letterSpacing: 1, cursor: "pointer", textTransform: "uppercase" }}>
                  Añadir máquina
                </button>
              </div>
            </div>

            {/* List */}
            {(() => {
              const machinesList = customMachines;
              return (
                <>
                  <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, textTransform: "uppercase", fontWeight: 500, marginBottom: 14 }}>Todas las máquinas ({machinesList.length})</div>
                  {machinesList.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#475569", border: "1px dashed #2a3a52", borderRadius: 10 }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>⚙️</div>
                      <p style={{ fontSize: 13 }}>No hay máquinas registradas</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {machinesList.map(m => (
                        <div key={m.id} className="insp-card" style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px" }}>
                          <span style={{ fontSize: 24 }}>{m.image}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>{m.name}</div>
                            <div style={{ fontSize: 11, color: "#475569" }}>{m.serial} · {m.category}</div>
                          </div>
                          <button onClick={() => { setCustomMachines(prev => prev.filter(cm => cm.id !== m.id)); supabase.from("custom_machines").delete().eq("id", String(m.id)).then(({ error }) => { if (error) console.error(error); }); notify("Máquina eliminada"); }}
                            style={{ background: "none", border: "1px solid #2a3a52", borderRadius: 6, padding: "6px 12px", color: "#94a3b8", fontFamily: "inherit", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* HISTORY */}
        {view === "history" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: "#fff" }}>Historial de Inspecciones</div>
                <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>{inspections.length} inspección{inspections.length !== 1 ? "es" : ""} registrada{inspections.length !== 1 ? "s" : ""}</p>
              </div>
              <button onClick={() => setView("new")} style={{ background: "#f5b800", border: "none", borderRadius: 8, padding: "10px 20px", color: "#080c12", fontFamily: "inherit", fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: "pointer", textTransform: "uppercase" }}>
                + Nueva
              </button>
            </div>

            {inspections.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <p style={{ fontSize: 14 }}>No hay inspecciones registradas aún</p>
                <button onClick={() => setView("new")} style={{ marginTop: 16, background: "none", border: "1px solid #2a3a52", borderRadius: 8, padding: "10px 20px", color: "#64748b", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>
                  Crear primera inspección
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {(() => {
                  const attached = new Set();
                  inspections.forEach(i => { if (i.type === "alquiler" && Array.isArray(i.relatedInspectionIds)) i.relatedInspectionIds.forEach(id => attached.add(String(id))); });
                  return inspections.filter(i => !attached.has(String(i.id))).map(insp => {
                  if (insp.type === "alquiler") {
                    const related = inspections.filter(i => (insp.relatedInspectionIds || []).map(String).includes(String(i.id)));
                    return (
                      <div key={insp.id} className="insp-card" style={{ borderLeft: "3px solid #10b981" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                            <div style={{ fontSize: 32, marginTop: 2 }}>{insp.machine.image}</div>
                            <div>
                              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{insp.machine.name}</span>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 12, background: "#10b98120", color: "#10b981", border: "1px solid #10b98140", letterSpacing: 1 }}>📦 ALQUILER</span>
                              </div>
                              <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>👤 {insp.client}</div>
                              {insp.location && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>📍 {insp.location}</div>}
                              <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                                {insp.rentStart || "—"} → {insp.rentEnd || insp.releasedAt}
                              </div>
                              {insp.notes && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6, fontStyle: "italic" }}>{insp.notes}</div>}
                            </div>
                          </div>
                          <button onClick={async () => {
                            if (!confirm("¿Eliminar este alquiler del historial? Las inspecciones asociadas seguirán visibles.")) return;
                            const { error } = await supabase.from("inspections").delete().eq("id", String(insp.id));
                            if (error) { notify("Error al eliminar: " + error.message, "error"); return; }
                            setInspections(prev => prev.filter(i => String(i.id) !== String(insp.id)));
                            notify("Alquiler eliminado");
                          }} style={{ background: "none", border: "1px solid #2a3a52", borderRadius: 6, padding: "6px 12px", color: "#ef4444", fontFamily: "inherit", fontSize: 10, fontWeight: 700, cursor: "pointer", textTransform: "uppercase", letterSpacing: 0.5 }}>
                            🗑️
                          </button>
                        </div>
                        {insp.documents && insp.documents.length > 0 && (
                          <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {insp.documents.map(d => (
                              <a key={d.id} href={d.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: "4px 10px", background: "#0d1420", border: "1px solid #1e2a3d", borderRadius: 6, color: "#94a3b8", textDecoration: "none" }}>📄 {d.name}</a>
                            ))}
                          </div>
                        )}
                        {related.length > 0 && (
                          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed #1e2a3d" }}>
                            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Inspecciones asociadas ({related.length})</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {related.map(r => (
                                <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "#0d1420", border: "1px solid #1e2a3d", borderRadius: 6 }}>
                                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 10, background: r.type === "salida" ? "#3b82f620" : "#f59e0b20", color: r.type === "salida" ? "#3b82f6" : "#f59e0b", border: `1px solid ${r.type === "salida" ? "#3b82f640" : "#f59e0b40"}`, letterSpacing: 0.5 }}>
                                      {r.type === "salida" ? "↑ SALIDA" : "↓ ENTRADA"}
                                    </span>
                                    <span style={{ fontSize: 11, color: "#94a3b8" }}>{r.date} · {r.operator}</span>
                                    <span style={{ fontSize: 10, color: r.defectCount + r.failCount > 0 ? "#f59e0b" : "#10b981" }}>
                                      {r.defectCount + r.failCount > 0 ? `⚠ ${r.defectCount + r.failCount} incidencias` : "✓ OK"}
                                    </span>
                                  </div>
                                  <button onClick={() => generateInspectionPDF(r)} style={{ background: "none", border: "1px solid #2a3a52", borderRadius: 4, padding: "4px 10px", color: "#f5b800", fontFamily: "inherit", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5 }}>⬇ PDF</button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return (
                  <div key={insp.id} className="insp-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                        <div style={{ fontSize: 32, marginTop: 2 }}>{insp.machine.image}</div>
                        <div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{insp.machine.name}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 12, background: insp.type === "salida" ? "#3b82f620" : "#f59e0b20", color: insp.type === "salida" ? "#3b82f6" : "#f59e0b", border: `1px solid ${insp.type === "salida" ? "#3b82f640" : "#f59e0b40"}`, letterSpacing: 1 }}>
                              {insp.type === "salida" ? "↑ SALIDA" : "↓ ENTRADA"}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: "#475569" }}>
                            {insp.client} · {insp.operator} · {insp.date}
                          </div>
                          <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 11, color: "#64748b" }}>⛽ {insp.fuelLevel}</span>
                            {insp.km && <span style={{ fontSize: 11, color: "#64748b" }}>⏱ {insp.km}</span>}
                            <span style={{ fontSize: 11, color: "#64748b" }}>📷 {insp.photos.length} fotos</span>
                            <span style={{ fontSize: 11, color: insp.failCount > 0 ? "#ef4444" : "#64748b" }}>🔧 {insp.failCount} defectos checklist</span>
                            <span style={{ fontSize: 11, color: insp.defectCount > 0 ? "#f59e0b" : "#64748b" }}>⚠️ {insp.defectCount} desperfectos</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, fontSize: 11, color: "#475569" }}>
                        <div>✍️ {insp.signName}</div>
                        <div style={{ padding: "3px 8px", background: insp.defectCount === 0 && insp.failCount === 0 ? "#10b98115" : "#f59e0b15", color: insp.defectCount === 0 && insp.failCount === 0 ? "#10b981" : "#f59e0b", borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>
                          {insp.defectCount === 0 && insp.failCount === 0 ? "✓ SIN INCIDENCIAS" : "⚠ CON INCIDENCIAS"}
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => generateInspectionPDF(insp)} style={{ background: "#f5b800", border: "none", borderRadius: 6, padding: "6px 12px", color: "#080c12", fontFamily: "inherit", fontSize: 10, fontWeight: 700, letterSpacing: 1, cursor: "pointer", textTransform: "uppercase" }}>
                            ⬇ PDF
                          </button>
                          <button onClick={async () => {
                            if (!confirm("¿Eliminar esta inspección del historial?")) return;
                            const { error } = await supabase.from("inspections").delete().eq("id", String(insp.id));
                            if (error) { notify("Error al eliminar: " + error.message, "error"); return; }
                            setInspections(prev => prev.filter(i => String(i.id) !== String(insp.id)));
                            notify("Inspección eliminada");
                          }} style={{ background: "none", border: "1px solid #2a3a52", borderRadius: 6, padding: "6px 12px", color: "#ef4444", fontFamily: "inherit", fontSize: 10, fontWeight: 700, cursor: "pointer", textTransform: "uppercase", letterSpacing: 0.5 }}>
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Photos preview */}
                    {insp.photos.length > 0 && (
                      <div style={{ marginTop: 12, display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
                        {insp.photos.slice(0, 6).map(p => (
                          <img key={p.id} src={p.src} alt="" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6, border: "1px solid #1e2a3d", flexShrink: 0 }} />
                        ))}
                        {insp.photos.length > 6 && <div style={{ width: 60, height: 60, background: "#0d1420", border: "1px solid #1e2a3d", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontSize: 11, flexShrink: 0 }}>+{insp.photos.length - 6}</div>}
                      </div>
                    )}
                  </div>
                  );
                  });
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 20, paddingBottom: 10, borderBottom: "1px solid #1e2a3d" }}>
      {children}
    </div>
  );
}
