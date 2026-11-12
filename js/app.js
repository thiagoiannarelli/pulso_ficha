(function () {
  "use strict";
  const form = document.getElementById("form");
  const out = document.getElementById("resultado");
  const toast = document.getElementById("toast");
  const STORE = "pulso-ficha-v1";

  // ---------- utilidades ----------
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (v) => { const x = parseFloat(String(v || "").replace(",", ".")); return isNaN(x) ? 0 : x; };

  function dados() {
    const d = {};
    new FormData(form).forEach((v, k) => { d[k] = v; });
    form.querySelectorAll('input[type="checkbox"]').forEach((c) => { d[c.name] = c.checked; });
    return d;
  }

  function showToast(msg) {
    toast.innerHTML = msg;
    toast.classList.add("is-on");
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => toast.classList.remove("is-on"), 4200);
  }

  // ---------- salvar rascunho (localStorage, opcional) ----------
  function salvar() { try { localStorage.setItem(STORE, JSON.stringify(dados())); } catch (e) { /* sem storage */ } }
  function restaurar() {
    let d;
    try { d = JSON.parse(localStorage.getItem(STORE) || "null"); } catch (e) { d = null; }
    if (!d) return;
    Object.entries(d).forEach(([k, v]) => {
      const els = form.elements[k];
      if (!els) return;
      if (els instanceof RadioNodeList) els.forEach((el) => { if (el.type === "radio") el.checked = el.value === v; });
      else if (els.type === "checkbox") els.checked = !!v;
      else els.value = v;
    });
  }

  // ---------- etapas ----------
  function irPara(n) {
    document.querySelectorAll(".step").forEach((s) => s.classList.toggle("is-active", s.dataset.step === String(n)));
    document.querySelectorAll("[data-step-nav]").forEach((s) => {
      const k = +s.dataset.stepNav;
      s.classList.toggle("is-active", k === n);
      s.classList.toggle("is-done", k < n);
    });
    document.getElementById("app").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function obrigatoriosEtapa1() {
    const falta = Pulso.validar(dados());
    if (falta.length) {
      showToast("Preencha: <b>" + falta.join(", ") + "</b>");
      return false;
    }
    return true;
  }

  document.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => {
    const n = +b.dataset.go;
    if (n === 2 && !obrigatoriosEtapa1()) return;
    irPara(n);
  }));
  document.querySelectorAll("[data-step-nav]").forEach((s) => s.addEventListener("click", () => {
    const n = +s.dataset.stepNav;
    if (n === 3 && !out.innerHTML) return;
    if (n >= 2 && !obrigatoriosEtapa1()) return;
    irPara(n);
  }));

  // ---------- IMC ao vivo ----------
  function imcAoVivo() {
    const p = num(form.peso.value); let a = num(form.altura.value); const c = num(form.cintura.value);
    if (a > 0 && a < 3) a *= 100;
    const set = (id, v) => { document.getElementById(id).textContent = v; };
    if (p && a) {
      const imc = p / Math.pow(a / 100, 2);
      set("imcLive", imc.toFixed(1).replace(".", ","));
      set("imcClassLive", imc < 18.5 ? "Abaixo do peso" : imc < 25 ? "Peso adequado" : imc < 30 ? "Sobrepeso" : imc < 35 ? "Obesidade I" : imc < 40 ? "Obesidade II" : "Obesidade III");
      set("rceLive", c ? (c / a).toFixed(2).replace(".", ",") + (c / a < 0.5 ? " · adequado" : " · atenção") : "—");
    } else { set("imcLive", "—"); set("imcClassLive", "—"); set("rceLive", "—"); }
  }
  form.addEventListener("input", () => { imcAoVivo(); salvar(); });
  form.addEventListener("change", salvar);

  // ---------- render do resultado ----------
  function render(p) {
    const hoje = new Date().toLocaleDateString("pt-BR");
    const cel = (l, v) => `<div class="sum__cell"><span>${l}</span><strong>${esc(v)}</strong></div>`;
    const treinos = p.treinos.map((t) => `
      <article class="wk">
        <header class="wk__head"><span class="wk__letter">${t.letra}</span><span class="wk__tag">TREINO ${t.letra}</span><h3>${esc(t.nome)}</h3></header>
        <div class="wk__scroll"><table class="wk__table">
          <thead><tr><th>#</th><th class="l">Exercício</th><th>Séries</th><th>Reps</th><th>Descanso</th><th>Carga (kg)</th></tr></thead>
          <tbody>${t.exercicios.map((e, i) => `
            <tr><td class="n">${i + 1}</td><td class="l">${esc(e.nome)}</td><td>${esc(e.series)}</td><td>${esc(e.reps)}</td><td>${esc(e.descanso)}</td>
            <td><input class="carga" type="text" inputmode="decimal" aria-label="Carga ${esc(e.nome)}" /></td></tr>`).join("")}
          </tbody></table></div>
      </article>`).join("");

    out.innerHTML = `
      <div class="sum">
        <div class="sum__top">
          <div><p class="eyebrow">Plano de treino de</p><h2>${esc(p.nome ? p.nome.toUpperCase() : "VOCÊ")}</h2></div>
          <div class="sum__date">Gerado em ${hoje}</div>
        </div>
        <div class="sum__grid">
          ${cel("Objetivo", p.objetivo)}${cel("Nível", p.nivel)}${cel("Frequência", p.frequencia)}${cel("Divisão", p.divisao)}
          ${cel("Sequência semanal", p.sequencia)}${cel("Séries", p.series + " séries")}${cel("Repetições", p.reps + " repetições")}${cel("Descanso", p.descanso)}
        </div>
        <div class="sum__eval">
          <div><span>IMC</span><strong>${p.imc}</strong><small>${esc(p.imcClasse)}</small></div>
          ${p.rce ? `<div><span>Cintura / altura</span><strong>${p.rce}</strong><small>${p.rceStatus}</small></div>` : ""}
        </div>
        <p class="sum__line"><b>Cardio</b>${esc(p.cardio)}</p>
        <p class="sum__line"><b>Método</b>${esc(p.metodo)}${p.nota ? " " + esc(p.nota) : ""}</p>
      </div>

      <div class="wks">${treinos}</div>

      <h2 class="sec">Suas metas diárias</h2>
      <div class="metas">
        <div class="meta"><span>Água</span><strong>${p.metas.agua}</strong><small>35 ml por kg de peso</small></div>
        <div class="meta"><span>Proteína</span><strong>${p.metas.proteina}</strong><small>referência para seu objetivo</small></div>
        <div class="meta"><span>Sono</span><strong>${p.metas.sono}</strong><small>recuperação muscular</small></div>
        <div class="meta"><span>Treinos</span><strong>${p.metas.treinos}</strong><small>constância é tudo</small></div>
      </div>

      <h2 class="sec">Ajustes de hábitos e orientações</h2>
      <div class="dicas">${p.dicas.map(([t, d]) => `<div class="dica"><b>${esc(t)}</b><p>${esc(d)}</p></div>`).join("")}</div>

      <div class="tips">
        <h4>Antes de cada treino</h4>
        <ul><li>5–10 min de aquecimento (bike, esteira ou mobilidade)</li><li>1–2 séries leves no 1º exercício do dia</li>
        <li>Movimento controlado: 2s descendo, 1s subindo</li><li>Termine as séries com 1–2 repetições “de reserva”</li></ul>
      </div>

      <div class="cta cta--result no-print">
        <div><h3>Seu treino está pronto!</h3><p>Anote suas cargas e salve em PDF para levar à academia.</p></div>
        <div class="cta__btns">
          <button type="button" class="btn btn--ghost" id="refazer">Editar respostas</button>
          <button type="button" class="btn btn--lime" id="imprimir">Baixar PDF / Imprimir</button>
        </div>
      </div>`;

    document.getElementById("imprimir").addEventListener("click", () => window.print());
    document.getElementById("refazer").addEventListener("click", () => irPara(1));
  }

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const d = dados();
    if (Pulso.validar(d).length) { irPara(1); obrigatoriosEtapa1(); return; }
    render(Pulso.gerarPlano(d));
    salvar();
    irPara(3);
  });

  restaurar();
  imcAoVivo();
})();
