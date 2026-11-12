/**
 * PULSO — motor de geração do treino.
 * Função pura: recebe os dados do formulário e devolve o plano completo.
 */
(function (global) {
  "use strict";

  const fmt = (x, d) => x.toFixed(d).replace(".", ",");
  const num = (v) => {
    const x = parseFloat(String(v ?? "").replace(",", ".").replace(/[^0-9.]/g, ""));
    return isNaN(x) ? 0 : x;
  };

  // n = padrão | j = alternativa p/ joelho | l = lombar | o = ombro
  const X = (n, j = null, l = null, o = null) => ({ n, j, l, o });
  const E = {
    AGACH: X("Agachamento livre", "Leg press 45° (amplitude controlada)", "Agachamento no Smith"),
    LEGP: X("Leg press 45°", "Leg press 45° (amplitude controlada)"),
    STIFF: X("Stiff com halteres", null, "Mesa flexora"),
    TERRA: X("Levantamento terra romeno", null, "Cadeira flexora"),
    AFUN: X("Afundo com halteres", "Elevação pélvica na máquina"),
    BULG: X("Agachamento búlgaro", "Cadeira abdutora"),
    HACK: X("Agachamento hack", "Leg press 45° (amplitude controlada)"),
    EXT: X("Cadeira extensora", "Cadeira extensora (carga leve, 0–60°)"),
    FLEX: X("Mesa flexora"),
    CFLEX: X("Cadeira flexora"),
    PELV: X("Elevação pélvica"),
    ABDU: X("Cadeira abdutora"),
    PANT: X("Panturrilha em pé", null, "Panturrilha sentado"),
    PANTS: X("Panturrilha sentado"),
    SUPB: X("Supino reto com barra", null, null, "Supino reto com halteres (pegada neutra)"),
    SUPH: X("Supino reto com halteres", null, null, "Supino máquina (pegada neutra)"),
    SUPI: X("Supino inclinado com halteres", null, null, "Supino inclinado máquina"),
    SUPIM: X("Supino inclinado máquina"),
    CRUC: X("Crucifixo máquina (voador)"),
    CROSS: X("Crossover na polia", null, null, "Crucifixo máquina (amplitude curta)"),
    DESH: X("Desenvolvimento com halteres", null, "Desenvolvimento máquina", "Elevação lateral (carga leve)"),
    DESM: X("Desenvolvimento máquina", null, null, "Elevação frontal com anilha (carga leve)"),
    ELAT: X("Elevação lateral"),
    FACE: X("Face pull na polia"),
    PUXF: X("Puxada frontal", null, null, "Puxada com pegada neutra"),
    PUXN: X("Puxada com pegada neutra"),
    REMC: X("Remada curvada com barra", null, "Remada apoiada no banco"),
    REMB: X("Remada baixa"),
    REMU: X("Remada unilateral com halter", null, "Remada máquina"),
    PULLD: X("Pulldown braços estendidos"),
    ROSD: X("Rosca direta"),
    ROSM: X("Rosca martelo"),
    ROSS: X("Rosca Scott"),
    TRIP: X("Tríceps na polia (barra)"),
    TRIC: X("Tríceps corda"),
    TRIF: X("Tríceps francês com halter", null, null, "Tríceps corda unilateral"),
    MERG: X("Mergulho no banco", null, null, "Tríceps na polia (barra)"),
    PRAN: X("Prancha"),
    PRANL: X("Prancha lateral"),
    ABD: X("Abdominal crunch", null, "Prancha"),
    ABDI: X("Abdominal infra (elevação de pernas)", null, "Dead bug"),
  };
  const EXTRA = [X("Abdominal na máquina", null, "Prancha"), E.PRAN, E.PRANL, X("Bird dog"), X("Dead bug")];

  const T = {
    FA: ["Full Body A", ["AGACH", "SUPH", "PUXF", "STIFF", "DESH", "ROSD", "TRIP", "PRAN"]],
    FB: ["Full Body B", ["LEGP", "REMB", "SUPIM", "FLEX", "ELAT", "PELV", "ABD", "PANT"]],
    FC: ["Full Body C", ["AFUN", "PUXN", "CRUC", "EXT", "REMU", "ABDU", "ROSM", "PRANL"]],
    U1: ["Superiores 1", ["SUPB", "REMC", "DESH", "PUXF", "CRUC", "ROSD", "TRIC", "ELAT"]],
    L1: ["Inferiores 1", ["AGACH", "STIFF", "LEGP", "FLEX", "EXT", "PELV", "PANT", "PRAN"]],
    U2: ["Superiores 2", ["SUPI", "PUXN", "REMB", "DESM", "FACE", "ROSM", "TRIF", "ABD"]],
    L2: ["Inferiores 2", ["TERRA", "BULG", "HACK", "CFLEX", "ABDU", "PELV", "PANTS", "ABDI"]],
    PU: ["Peito · Ombros · Tríceps", ["SUPB", "SUPI", "DESH", "CRUC", "ELAT", "TRIC", "TRIF", "MERG"]],
    PL: ["Costas · Bíceps · Abdômen", ["PUXF", "REMC", "REMB", "PULLD", "FACE", "ROSD", "ROSM", "ABD"]],
    LG: ["Pernas completo", ["AGACH", "LEGP", "STIFF", "EXT", "FLEX", "PELV", "PANT", "PRAN"]],
    CT: ["Peito · Tríceps", ["SUPB", "SUPI", "CRUC", "CROSS", "TRIP", "TRIF", "TRIC", "MERG"]],
    CB: ["Costas · Bíceps", ["PUXF", "REMC", "REMU", "REMB", "PULLD", "ROSD", "ROSM", "ROSS"]],
    OA: ["Ombros · Abdômen", ["DESH", "ELAT", "FACE", "DESM", "PRAN", "ABD", "ABDI", "PRANL"]],
    QD: ["Quadríceps · Panturrilha", ["AGACH", "HACK", "LEGP", "BULG", "EXT", "ABDU", "PANT", "PANTS"]],
    OB: ["Ombros · Braços", ["DESH", "ELAT", "FACE", "ROSD", "TRIP", "ROSM", "TRIF", "ABD"]],
    PG: ["Posteriores · Glúteos", ["TERRA", "FLEX", "PELV", "CFLEX", "BULG", "ABDU", "PANTS", "ABDI"]],
    PE: ["Peito", ["SUPB", "SUPI", "SUPH", "CRUC", "CROSS", "MERG", "PRAN", "ABD"]],
    CO: ["Costas", ["PUXF", "REMC", "REMB", "REMU", "PULLD", "FACE", "PRANL", "ABDI"]],
  };

  function validar(d) {
    const falta = [];
    if (!num(d.peso)) falta.push("Peso");
    if (!num(d.altura)) falta.push("Altura");
    if (!d.objetivo) falta.push("Objetivo");
    if (!d.nivel) falta.push("Nível de experiência");
    if (!d.dias) falta.push("Dias por semana");
    return falta;
  }

  function gerarPlano(d) {
    const peso = num(d.peso), idade = num(d.idade), cint = num(d.cintura);
    let alt = num(d.altura);
    if (alt > 0 && alt < 3) alt *= 100;
    const obj = d.objetivo, niv = d.nivel, dias = parseInt(d.dias, 10), tempo = parseInt(d.tempo, 10) || 0;
    const ini = niv === "Iniciante", adv = niv === "Avancado";

    // Avaliação
    const imc = peso / Math.pow(alt / 100, 2);
    const imcClasse = imc < 18.5 ? "Abaixo do peso" : imc < 25 ? "Peso adequado" : imc < 30 ? "Sobrepeso"
      : imc < 35 ? "Obesidade grau I" : imc < 40 ? "Obesidade grau II" : "Obesidade grau III";
    const rce = cint > 0 ? cint / alt : 0;

    const fJ = !!d.r_joelho, fL = !!d.r_lombar, fO = !!d.r_ombro;
    const fI = !!d.r_impacto || imc >= 30 || idade >= 60;

    // Divisão
    let plan, seq, divNome, nota = "";
    if (dias <= 2) { plan = ["FA", "FB"]; seq = "A – B"; divNome = "Full Body (AB)"; }
    else if (dias === 3) {
      if (ini) { plan = ["FA", "FB", "FC"]; divNome = "Full Body (ABC)"; }
      else { plan = ["PU", "PL", "LG"]; divNome = "ABC – Empurrar / Puxar / Pernas"; }
      seq = "A – B – C";
    } else if (dias === 4) {
      if (adv) { plan = ["CT", "CB", "LG", "OA"]; divNome = "ABCD"; }
      else { plan = ["U1", "L1", "U2", "L2"]; divNome = "Superiores / Inferiores (ABCD)"; }
      seq = "A – B – C – D";
    } else if (dias === 5) {
      if (ini) {
        plan = ["U1", "L1", "U2", "L2"]; seq = "A – B – C – D – A"; divNome = "Superiores / Inferiores (ABCD)";
        nota = "Para iniciantes, 3 a 4 treinos de musculação por semana são suficientes. No 5º dia, se preferir, troque por cardio leve.";
      } else { plan = ["PE", "CO", "QD", "OB", "PG"]; seq = "A – B – C – D – E"; divNome = "ABCDE"; }
    } else {
      if (ini) {
        plan = ["U1", "L1", "U2", "L2"]; seq = "A – B – C – D – A – B"; divNome = "Superiores / Inferiores (ABCD)";
        nota = "Para iniciantes, recomendamos no máximo 4 treinos de musculação por semana. Use os dias extras para cardio leve ou mobilidade.";
      } else { plan = ["PU", "PL", "LG"]; seq = "A – B – C – A – B – C"; divNome = "ABC 2x (Empurrar / Puxar / Pernas)"; }
    }

    // Parâmetros
    let nEx = ini ? 5 : adv ? 7 : 6;
    if (tempo === 30) nEx -= 2; else if (tempo === 45) nEx -= 1; else if (tempo === 90) nEx += 1;
    nEx = Math.max(4, Math.min(8, nEx));

    let S, R, D, cardio, metodo, objNome;
    if (obj === "Emagrecimento") {
      objNome = "Emagrecimento"; S = "3"; R = "12–15"; D = "30–45s";
      cardio = fI ? "25–35 min de bike, elíptico ou caminhada inclinada após o treino" : "25–35 min moderado após o treino (ou HIIT de 15 min, 2x/sem)";
      metodo = "Ritmo contínuo: descanso curto e bi-set nos 2 últimos exercícios.";
    } else if (obj === "Hipertrofia") {
      objNome = "Hipertrofia"; S = ini ? "3" : "4"; R = adv ? "6–12" : "8–12"; D = "60–90s";
      cardio = "15–20 min leve, 2 a 3x por semana";
      metodo = "Progressão de carga: ao fazer o topo das repetições em todas as séries, aumente a carga.";
    } else if (obj === "Forca") {
      objNome = "Força"; S = ini ? "3" : adv ? "5" : "4"; R = "4–6"; D = "2–3 min";
      cardio = "10 min leve no aquecimento";
      metodo = "Os 2 primeiros exercícios são os principais (carga alta); os demais são acessórios.";
    } else if (obj === "Condicionamento") {
      objNome = "Condicionamento físico"; S = "3"; R = "15–20"; D = "30s";
      cardio = fI ? "20 min intervalado na bike (1 min forte / 2 min leve)" : "20 min intervalado (1 min forte / 2 min leve)";
      metodo = "Faça em circuito: um exercício após o outro; descanse 1–2 min ao fim de cada volta.";
    } else {
      objNome = "Saúde e qualidade de vida"; S = ini ? "2" : "3"; R = "12–15"; D = "60s";
      cardio = "30 min de caminhada ou bike, 3 a 5x por semana";
      metodo = "Foque na técnica e na regularidade: constância vale mais que intensidade.";
    }

    // Treinos
    const letras = ["A", "B", "C", "D", "E"];
    const treinos = plan.map((key, w) => {
      const used = new Set();
      const lista = T[key][1].map((k) => E[k]).concat(EXTRA);
      const nomes = [];
      for (const e of lista) {
        if (nomes.length >= nEx) break;
        let nm = e.n;
        if (fL && e.l) nm = e.l;
        if (fJ && e.j) nm = e.j;
        if (fO && e.o) nm = e.o;
        if (!used.has(nm)) { used.add(nm); nomes.push(nm); }
      }
      const exercicios = nomes.map((nm, i) => {
        let s = S, r = R, dd = D;
        if (obj === "Forca" && i >= 2) { r = "8–10"; dd = "90s"; s = "3"; }
        if (/Prancha|Dead bug|Bird dog/.test(nm)) { r = "30–45s"; dd = obj === "Forca" ? "60s" : D; }
        if (obj === "Condicionamento") dd = "—";
        return { nome: nm, series: s, reps: r, descanso: dd };
      });
      return { letra: letras[w], nome: T[key][0], exercicios };
    });

    // Metas e dicas
    const aguaMeta = peso * 0.035, agua = num(d.agua), sono = num(d.sono);
    let pMin, pMax;
    if (obj === "Hipertrofia" || obj === "Forca") { pMin = 1.6; pMax = 2.2; }
    else if (obj === "Emagrecimento") { pMin = 1.6; pMax = 2.0; }
    else { pMin = 1.2; pMax = 1.6; }
    const prot = `${Math.round(peso * pMin)}–${Math.round(peso * pMax)} g/dia`;

    const dicas = [];
    if (agua > 0 && agua < aguaMeta) dicas.push(["Hidratação", `Você bebe cerca de ${fmt(agua, 1)} L e sua meta é ${fmt(aguaMeta, 1)} L. Deixe uma garrafa sempre por perto e beba um copo a cada refeição.`]);
    else if (!agua) dicas.push(["Hidratação", `Sua meta diária é de ${fmt(aguaMeta, 1)} L de água (35 ml por kg).`]);
    if (d.refeicoes === "1-2") dicas.push(["Refeições", "Com apenas 1–2 refeições fica difícil bater a proteína e manter energia para treinar. Tente organizar 3 a 4 refeições."]);
    if (d.proteina === "Raramente" || d.proteina === "Algumas") dicas.push(["Proteína", `Inclua uma fonte (ovos, carnes, frango, peixe, laticínios ou leguminosas) em cada refeição. Referência para seu objetivo: ${prot.replace("/dia", " por dia")}.`]);
    if (d.frutas === "Raramente" || d.frutas === "Algumas") dicas.push(["Frutas e vegetais", "Inclua ao menos 2 frutas por dia e metade do prato com vegetais no almoço e jantar."]);
    if (d.ultra === "Diario") dicas.push(["Ultraprocessados", "O consumo diário atrapalha seu resultado. Comece trocando um item por dia (ex.: biscoito por fruta, refrigerante por água com gás ou suco natural)."]);
    else if (d.ultra === "Semanal") dicas.push(["Ultraprocessados", "Mantenha o consumo ocasional e planeje lanches práticos (frutas, iogurte, castanhas) para os dias corridos."]);
    if (d.alcool === "Frequente") dicas.push(["Álcool", "O consumo frequente prejudica a recuperação muscular, o sono e o controle de peso. Tente reduzir para ocasiões pontuais."]);
    if (sono > 0 && sono < 7) dicas.push(["Sono", `Você dorme cerca de ${fmt(sono, 0)} h. Busque 7 a 9 h: é no descanso que o músculo se recupera e o apetite se regula.`]);
    else if (d.sono_q === "Ruim") dicas.push(["Sono", "Mesmo dormindo horas suficientes, a qualidade conta. Evite telas e cafeína à noite e mantenha horários regulares."]);
    if (d.estresse === "Alto") dicas.push(["Estresse", "Nível alto aumenta o cansaço e a fome. Nos dias mais pesados, reduza uma série por exercício em vez de faltar ao treino."]);
    if (obj === "Emagrecimento") dicas.push(["Para emagrecer", "O resultado vem do déficit calórico moderado somado ao treino. Evite dietas restritivas e procure um(a) nutricionista para um plano individual."]);
    if (obj === "Hipertrofia") dicas.push(["Para ganhar massa", "Coma o suficiente (leve superávit calórico), distribua a proteína ao longo do dia e registre suas cargas para garantir progressão."]);
    if (obj === "Forca") dicas.push(["Para ganhar força", "Aqueça bem antes dos exercícios principais (2–3 séries leves) e priorize a técnica perfeita antes de subir a carga."]);
    if (fI) dicas.push(["Baixo impacto", "Priorizamos exercícios e cardio de baixo impacto para proteger as articulações."]);
    if (fJ || fL || fO) dicas.push(["Restrições", "Alguns exercícios foram substituídos por versões mais seguras. Se sentir dor, interrompa e procure orientação."]);
    if (idade >= 60) dicas.push(["Acima dos 60", "Faça uma avaliação médica antes de iniciar e priorize máquinas e movimentos controlados."]);
    if (dicas.length < 3) dicas.push(["Bom trabalho", "Seus hábitos estão no caminho certo! Mantenha a regularidade e reavalie suas medidas a cada 4 semanas."]);

    return {
      nome: (d.nome || "").trim(),
      imc: fmt(imc, 1), imcClasse,
      rce: rce ? fmt(rce, 2) : "", rceStatus: rce ? (rce < 0.5 ? "adequado" : "atenção") : "",
      objetivo: objNome,
      nivel: ini ? "Iniciante" : adv ? "Avançado" : "Intermediário",
      frequencia: `${dias}x por semana${tempo ? " · " + (tempo >= 60 ? (tempo === 60 ? "1h" : "1h30") : tempo + " min") : ""}`,
      divisao: divNome, sequencia: seq,
      series: S, reps: R, descanso: D, cardio, metodo, nota,
      treinos,
      metas: { agua: `${fmt(aguaMeta, 1)} L/dia`, proteina: prot, sono: "7–9 h/noite", treinos: `${Math.min(dias, ini ? 4 : 6)} treinos/sem` },
      dicas,
    };
  }

  global.Pulso = { gerarPlano, validar };
})(typeof window !== "undefined" ? window : globalThis);
