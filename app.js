/* ---------- Constantes ---------- */

const DIAS = [
  { key: "dom", label: "Domingo", curto: "Dom" },
  { key: "seg", label: "Segunda", curto: "Seg" },
  { key: "ter", label: "Terça", curto: "Ter" },
  { key: "qua", label: "Quarta", curto: "Qua" },
  { key: "qui", label: "Quinta", curto: "Qui" },
  { key: "sex", label: "Sexta", curto: "Sex" },
  { key: "sab", label: "Sábado", curto: "Sáb" },
];

const CATEGORIAS = {
  casa: { label: "Casa", emoji: "🏡" },
  trabalho: { label: "Trabalho", emoji: "💼" },
  filhos: { label: "Filhos", emoji: "🧒" },
  catequese: { label: "Catequese", emoji: "✝️" },
  instagram: { label: "Instagram", emoji: "📸" },
  pessoal: { label: "Pessoal", emoji: "🌷" },
};

const RECORRENCIAS = {
  nenhuma: "Só uma vez",
  diaria: "Todo dia",
  semanal: "Toda semana",
  mensal: "Todo mês",
};

const STORAGE_KEY = "minha-rotina-v1";

/* ---------- Utilitários ---------- */

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function hojeKeyDia() {
  return DIAS[new Date().getDay()].key;
}

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function mesAtualKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function segundaDaSemana(date) {
  const d = new Date(date);
  const dia = d.getDay();
  const diff = (dia === 0 ? -6 : 1) - dia;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function semanaAtualKey() {
  return segundaDaSemana(new Date());
}

/* ---------- Estado ---------- */

function estadoPadrao() {
  return {
    nomeMae: "",
    filhos: [
      { id: uid(), nome: "Filho(a) 1", dias: [], atividade: "" },
      { id: uid(), nome: "Filho(a) 2", dias: [], atividade: "" },
      { id: uid(), nome: "Filho(a) 3", dias: [], atividade: "" },
    ],
    rotina: { dom: [], seg: [], ter: [], qua: [], qui: [], sex: [], sab: [] },
    tarefas: [
      { id: uid(), titulo: "Planejar a semana (agenda + refeições)", categoria: "pessoal", recorrencia: "semanal", concluida: false, ultimaConclusao: null, criadoEm: hojeISO() },
      { id: uid(), titulo: "Organizar mochilas e uniformes dos filhos", categoria: "filhos", recorrencia: "diaria", concluida: false, ultimaConclusao: null, criadoEm: hojeISO() },
      { id: uid(), titulo: "Preparar aula/atividade da catequese", categoria: "catequese", recorrencia: "semanal", concluida: false, ultimaConclusao: null, criadoEm: hojeISO() },
      { id: uid(), titulo: "Planejar posts do Instagram", categoria: "instagram", recorrencia: "semanal", concluida: false, ultimaConclusao: null, criadoEm: hojeISO() },
    ],
    limpeza: [
      { id: uid(), titulo: "Lavar cortinas", concluidoNoMes: null },
      { id: uid(), titulo: "Limpar geladeira por dentro", concluidoNoMes: null },
      { id: uid(), titulo: "Trocar e lavar edredons/cobertores", concluidoNoMes: null },
      { id: uid(), titulo: "Organizar guarda-roupas", concluidoNoMes: null },
      { id: uid(), titulo: "Limpar armários da cozinha por dentro", concluidoNoMes: null },
      { id: uid(), titulo: "Organizar a despensa", concluidoNoMes: null },
      { id: uid(), titulo: "Limpar janelas e vidros", concluidoNoMes: null },
      { id: uid(), titulo: "Revisar validade de remédios e alimentos", concluidoNoMes: null },
      { id: uid(), titulo: "Separar roupas/objetos para doação", concluidoNoMes: null },
    ],
  };
}

let estado = carregarEstado();

function carregarEstado() {
  try {
    const bruto = localStorage.getItem(STORAGE_KEY);
    if (!bruto) return estadoPadrao();
    const dados = JSON.parse(bruto);
    return { ...estadoPadrao(), ...dados };
  } catch (e) {
    console.error("Erro ao carregar dados salvos, iniciando do zero.", e);
    return estadoPadrao();
  }
}

function salvarEstado() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
}

/* Reseta tarefas e itens de limpeza recorrentes quando o período virou */
function resetarRecorrencias() {
  const hoje = hojeISO();
  const semana = semanaAtualKey();
  const mes = mesAtualKey();

  estado.tarefas.forEach((t) => {
    if (!t.concluida) return;
    if (t.recorrencia === "diaria" && t.ultimaConclusao !== hoje) {
      t.concluida = false;
    } else if (t.recorrencia === "semanal" && segundaDaSemana(t.ultimaConclusao || hoje) !== semana) {
      t.concluida = false;
    } else if (t.recorrencia === "mensal" && (t.ultimaConclusao || "").slice(0, 7) !== mes) {
      t.concluida = false;
    }
  });

  estado.limpeza.forEach((item) => {
    if (item.concluidoNoMes && item.concluidoNoMes !== mes) {
      item.concluidoNoMes = null;
    }
  });

  salvarEstado();
}

/* ---------- Navegação por abas ---------- */

document.getElementById("tabs").addEventListener("click", (e) => {
  const btn = e.target.closest(".tab-btn");
  if (!btn) return;
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
});

/* ---------- Cabeçalho ---------- */

function renderCabecalho() {
  const hoje = new Date();
  const label = DIAS[hoje.getDay()].label;
  const dataFmt = hoje.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
  document.getElementById("dataAtual").textContent = `${label}, ${dataFmt}`;
  document.getElementById("tituloHoje").textContent = estado.nomeMae ? `Oi, ${estado.nomeMae}! Hoje é ${label}` : `Hoje é ${label}`;
  document.getElementById("tituloMes").textContent = `Limpeza de ${hoje.toLocaleDateString("pt-BR", { month: "long" })}`;
}

/* ---------- Renderização: Hoje ---------- */

function tagCategoria(cat) {
  const c = CATEGORIAS[cat] || CATEGORIAS.pessoal;
  return `<span class="tag-cat tag-${cat}">${c.emoji} ${c.label}</span>`;
}

function renderHoje() {
  const dia = hojeKeyDia();
  const blocos = [...(estado.rotina[dia] || [])].sort((a, b) => a.hora.localeCompare(b.hora));
  const cont = document.getElementById("blocosHoje");
  cont.innerHTML = blocos.length
    ? blocos.map((b) => `
        <div class="bloco">
          <span class="hora">${b.hora}</span>
          <span class="titulo">${escapeHtml(b.titulo)}</span>
          ${tagCategoria(b.categoria)}
        </div>`).join("")
    : `<p class="vazio">Nenhum compromisso cadastrado para hoje. Adicione na aba Semana.</p>`;

  const pendentes = estado.tarefas.filter((t) => !t.concluida);
  const contT = document.getElementById("tarefasHoje");
  contT.innerHTML = pendentes.length
    ? pendentes.map(renderTarefaHTML).join("")
    : `<p class="vazio">Tudo em dia por aqui! 🎉</p>`;
}

/* ---------- Renderização: Semana ---------- */

function renderSemana() {
  const cont = document.getElementById("grade-semana");
  cont.innerHTML = DIAS.map((d) => {
    const blocos = [...(estado.rotina[d.key] || [])].sort((a, b) => a.hora.localeCompare(b.hora));
    return `
      <div class="dia-coluna">
        <h3>${d.label}</h3>
        <div class="blocos-lista">
          ${blocos.length
            ? blocos.map((b) => `
              <div class="bloco">
                <span class="hora">${b.hora}</span>
                <span class="titulo">${escapeHtml(b.titulo)}</span>
                ${tagCategoria(b.categoria)}
                <button class="btn-excluir" data-acao="excluir-bloco" data-dia="${d.key}" data-id="${b.id}">✕</button>
              </div>`).join("")
            : `<p class="vazio">Sem compromissos</p>`
          }
        </div>
        <button class="btn-add-bloco" data-acao="add-bloco" data-dia="${d.key}">+ adicionar</button>
      </div>`;
  }).join("");
}

/* ---------- Renderização: Tarefas ---------- */

let filtroAtual = "todas";

function renderTarefaHTML(t) {
  return `
    <div class="tarefa-item ${t.concluida ? "concluida" : ""}">
      <input type="checkbox" data-acao="toggle-tarefa" data-id="${t.id}" ${t.concluida ? "checked" : ""}>
      <div class="conteudo">
        <span class="titulo">${escapeHtml(t.titulo)}</span>
        <div class="meta">${tagCategoria(t.categoria)}<span>${RECORRENCIAS[t.recorrencia]}</span></div>
      </div>
      <button class="btn-excluir" data-acao="excluir-tarefa" data-id="${t.id}">✕</button>
    </div>`;
}

function renderTarefas() {
  const lista = estado.tarefas.filter((t) => filtroAtual === "todas" || t.categoria === filtroAtual);
  const cont = document.getElementById("listaTarefas");
  cont.innerHTML = lista.length
    ? lista.map(renderTarefaHTML).join("")
    : `<p class="vazio">Nenhuma tarefa aqui.</p>`;
}

document.getElementById("filtrosCategoria").addEventListener("click", (e) => {
  const btn = e.target.closest(".filtro-btn");
  if (!btn) return;
  filtroAtual = btn.dataset.filtro;
  document.querySelectorAll(".filtro-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  renderTarefas();
});

/* ---------- Renderização: Limpeza ---------- */

function renderLimpeza() {
  const mes = mesAtualKey();
  const cont = document.getElementById("listaLimpeza");
  cont.innerHTML = estado.limpeza.length
    ? estado.limpeza.map((item) => {
        const feito = item.concluidoNoMes === mes;
        return `
          <div class="tarefa-item ${feito ? "concluida" : ""}">
            <input type="checkbox" data-acao="toggle-limpeza" data-id="${item.id}" ${feito ? "checked" : ""}>
            <div class="conteudo"><span class="titulo">${escapeHtml(item.titulo)}</span></div>
            <button class="btn-excluir" data-acao="excluir-limpeza" data-id="${item.id}">✕</button>
          </div>`;
      }).join("")
    : `<p class="vazio">Nenhum item cadastrado.</p>`;

  const total = estado.limpeza.length;
  const feitos = estado.limpeza.filter((i) => i.concluidoNoMes === mes).length;
  const pct = total ? Math.round((feitos / total) * 100) : 0;
  document.getElementById("progressoLimpeza").style.width = pct + "%";
  document.getElementById("progressoTexto").textContent = `${feitos}/${total}`;
}

/* ---------- Renderização: Família ---------- */

function renderFamilia() {
  document.getElementById("nomeMae").value = estado.nomeMae || "";
  const cont = document.getElementById("listaFilhos");
  cont.innerHTML = estado.filhos.map((f) => `
    <div class="filho-card">
      <div class="filho-topo">
        <input type="text" class="input-full" style="margin:0;flex:1" value="${escapeAttr(f.nome)}" data-acao="editar-nome-filho" data-id="${f.id}">
        <button class="btn-excluir" data-acao="excluir-filho" data-id="${f.id}">✕</button>
      </div>
      <input type="text" class="input-full" placeholder="Atividade (ex: futebol, reforço, música)" value="${escapeAttr(f.atividade)}" data-acao="editar-atividade-filho" data-id="${f.id}" style="margin-top:8px">
      <label class="campo-label">Dias de afterschool</label>
      <div class="dias-tags">
        ${DIAS.map((d) => `<span class="dia-tag ${f.dias.includes(d.key) ? "ativo" : ""}" data-acao="toggle-dia-filho" data-id="${f.id}" data-dia="${d.key}">${d.curto}</span>`).join("")}
      </div>
    </div>
  `).join("");
}

document.getElementById("nomeMae").addEventListener("input", (e) => {
  estado.nomeMae = e.target.value;
  salvarEstado();
  renderCabecalho();
});

/* ---------- Helpers de escape ---------- */

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(str) {
  return escapeHtml(str);
}

/* ---------- Ações via delegação de evento ---------- */

document.getElementById("app").addEventListener("click", (e) => {
  const alvo = e.target.closest("[data-acao]");
  if (!alvo) return;
  const acao = alvo.dataset.acao;
  const id = alvo.dataset.id;

  if (acao === "excluir-bloco") {
    estado.rotina[alvo.dataset.dia] = estado.rotina[alvo.dataset.dia].filter((b) => b.id !== id);
    salvarEstado(); renderSemana(); renderHoje();
  } else if (acao === "add-bloco") {
    abrirModalNovoBloco(alvo.dataset.dia);
  } else if (acao === "excluir-tarefa") {
    estado.tarefas = estado.tarefas.filter((t) => t.id !== id);
    salvarEstado(); renderTarefas(); renderHoje();
  } else if (acao === "excluir-limpeza") {
    estado.limpeza = estado.limpeza.filter((i) => i.id !== id);
    salvarEstado(); renderLimpeza();
  } else if (acao === "excluir-filho") {
    estado.filhos = estado.filhos.filter((f) => f.id !== id);
    salvarEstado(); renderFamilia();
  } else if (acao === "toggle-dia-filho") {
    const filho = estado.filhos.find((f) => f.id === id);
    const dia = alvo.dataset.dia;
    if (filho.dias.includes(dia)) filho.dias = filho.dias.filter((d) => d !== dia);
    else filho.dias.push(dia);
    salvarEstado(); renderFamilia();
  }
});

document.getElementById("app").addEventListener("change", (e) => {
  const alvo = e.target.closest("[data-acao]");
  if (!alvo) return;
  const acao = alvo.dataset.acao;
  const id = alvo.dataset.id;

  if (acao === "toggle-tarefa") {
    const t = estado.tarefas.find((x) => x.id === id);
    t.concluida = alvo.checked;
    t.ultimaConclusao = alvo.checked ? hojeISO() : t.ultimaConclusao;
    salvarEstado(); renderTarefas(); renderHoje();
  } else if (acao === "toggle-limpeza") {
    const item = estado.limpeza.find((x) => x.id === id);
    item.concluidoNoMes = alvo.checked ? mesAtualKey() : null;
    salvarEstado(); renderLimpeza();
  } else if (acao === "editar-nome-filho") {
    estado.filhos.find((f) => f.id === id).nome = alvo.value;
    salvarEstado(); renderHoje();
  } else if (acao === "editar-atividade-filho") {
    estado.filhos.find((f) => f.id === id).atividade = alvo.value;
    salvarEstado();
  }
});

/* ---------- Formulário rápido (aba Hoje) ---------- */

document.getElementById("formRapido").addEventListener("submit", (e) => {
  e.preventDefault();
  const titulo = document.getElementById("rapidoTitulo").value.trim();
  const categoria = document.getElementById("rapidoCategoria").value;
  if (!titulo) return;
  estado.tarefas.unshift({ id: uid(), titulo, categoria, recorrencia: "nenhuma", concluida: false, ultimaConclusao: null, criadoEm: hojeISO() });
  salvarEstado();
  e.target.reset();
  renderHoje(); renderTarefas();
});

/* ---------- Modal genérico ---------- */

const modalOverlay = document.getElementById("modalOverlay");
document.getElementById("modalFechar").addEventListener("click", fecharModal);
modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) fecharModal(); });

function abrirModal(titulo, corpoHtml) {
  document.getElementById("modalTitulo").textContent = titulo;
  document.getElementById("modalCorpo").innerHTML = corpoHtml;
  modalOverlay.classList.remove("hidden");
}
function fecharModal() {
  modalOverlay.classList.add("hidden");
}

function opcoesCategoria(selecionada) {
  return Object.entries(CATEGORIAS).map(([k, v]) => `<option value="${k}" ${k === selecionada ? "selected" : ""}>${v.emoji} ${v.label}</option>`).join("");
}

/* Nova tarefa */
document.getElementById("btnNovaTarefa").addEventListener("click", () => {
  abrirModal("Nova tarefa", `
    <form id="formModalTarefa">
      <label class="campo-label">O que precisa ser feito?</label>
      <input type="text" id="mTituloTarefa" class="input-full" required>
      <label class="campo-label">Categoria</label>
      <select id="mCategoriaTarefa" class="input-full">${opcoesCategoria("pessoal")}</select>
      <label class="campo-label">Repetir</label>
      <select id="mRecorrenciaTarefa" class="input-full">
        ${Object.entries(RECORRENCIAS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}
      </select>
      <button type="submit" class="btn-primary full">Salvar</button>
    </form>
  `);
  document.getElementById("formModalTarefa").addEventListener("submit", (e) => {
    e.preventDefault();
    const titulo = document.getElementById("mTituloTarefa").value.trim();
    if (!titulo) return;
    estado.tarefas.unshift({
      id: uid(),
      titulo,
      categoria: document.getElementById("mCategoriaTarefa").value,
      recorrencia: document.getElementById("mRecorrenciaTarefa").value,
      concluida: false,
      ultimaConclusao: null,
      criadoEm: hojeISO(),
    });
    salvarEstado(); fecharModal(); renderTarefas(); renderHoje();
  });
});

/* Novo bloco de rotina */
function abrirModalNovoBloco(diaKey) {
  const diaLabel = DIAS.find((d) => d.key === diaKey).label;
  abrirModal(`Novo compromisso - ${diaLabel}`, `
    <form id="formModalBloco">
      <label class="campo-label">Horário</label>
      <input type="time" id="mHoraBloco" class="input-full" required value="08:00">
      <label class="campo-label">O que é?</label>
      <input type="text" id="mTituloBloco" class="input-full" placeholder="Ex: Afterschool, Catequese, Trabalho..." required>
      <label class="campo-label">Categoria</label>
      <select id="mCategoriaBloco" class="input-full">${opcoesCategoria("filhos")}</select>
      <button type="submit" class="btn-primary full">Salvar</button>
    </form>
  `);
  document.getElementById("formModalBloco").addEventListener("submit", (e) => {
    e.preventDefault();
    const titulo = document.getElementById("mTituloBloco").value.trim();
    if (!titulo) return;
    estado.rotina[diaKey].push({
      id: uid(),
      hora: document.getElementById("mHoraBloco").value,
      titulo,
      categoria: document.getElementById("mCategoriaBloco").value,
    });
    salvarEstado(); fecharModal(); renderSemana(); renderHoje();
  });
}
document.getElementById("btnNovoBloco").addEventListener("click", () => abrirModalNovoBloco(hojeKeyDia()));

/* Novo item de limpeza */
document.getElementById("btnNovoItemLimpeza").addEventListener("click", () => {
  abrirModal("Novo item de limpeza mensal", `
    <form id="formModalLimpeza">
      <label class="campo-label">O que precisa ser limpo/organizado?</label>
      <input type="text" id="mTituloLimpeza" class="input-full" required>
      <button type="submit" class="btn-primary full">Salvar</button>
    </form>
  `);
  document.getElementById("formModalLimpeza").addEventListener("submit", (e) => {
    e.preventDefault();
    const titulo = document.getElementById("mTituloLimpeza").value.trim();
    if (!titulo) return;
    estado.limpeza.push({ id: uid(), titulo, concluidoNoMes: null });
    salvarEstado(); fecharModal(); renderLimpeza();
  });
});

/* Novo filho */
document.getElementById("btnNovoFilho").addEventListener("click", () => {
  estado.filhos.push({ id: uid(), nome: "Novo filho(a)", dias: [], atividade: "" });
  salvarEstado(); renderFamilia();
});

/* ---------- Configurações: exportar / importar / resetar ---------- */

const configOverlay = document.getElementById("configOverlay");
document.getElementById("btnConfig").addEventListener("click", () => configOverlay.classList.remove("hidden"));
document.getElementById("configFechar").addEventListener("click", () => configOverlay.classList.add("hidden"));
configOverlay.addEventListener("click", (e) => { if (e.target === configOverlay) configOverlay.classList.add("hidden"); });

document.getElementById("btnExportar").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(estado, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `minha-rotina-backup-${hojeISO()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

document.getElementById("inputImportar").addEventListener("change", (e) => {
  const arquivo = e.target.files[0];
  if (!arquivo) return;
  const leitor = new FileReader();
  leitor.onload = () => {
    try {
      const dados = JSON.parse(leitor.result);
      estado = { ...estadoPadrao(), ...dados };
      resetarRecorrencias();
      salvarEstado();
      renderTudo();
      configOverlay.classList.add("hidden");
    } catch (err) {
      alert("Não foi possível ler esse arquivo de backup.");
    }
  };
  leitor.readAsText(arquivo);
  e.target.value = "";
});

document.getElementById("btnResetar").addEventListener("click", () => {
  if (!confirm("Isso vai apagar todos os seus dados salvos neste navegador. Tem certeza?")) return;
  estado = estadoPadrao();
  salvarEstado();
  renderTudo();
  configOverlay.classList.add("hidden");
});

/* ---------- Inicialização ---------- */

function renderTudo() {
  renderCabecalho();
  renderHoje();
  renderSemana();
  renderTarefas();
  renderLimpeza();
  renderFamilia();
}

resetarRecorrencias();
renderTudo();
