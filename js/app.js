// ---------- utilidades ----------

function normalizar(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // remove pontuação
    .replace(/\s+/g, " ")
    .trim();
}

function falar(texto) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = "pt-BR";
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

// separa cada palavra do texto em { palavra, pontuacao }
function tokenizarPalavras(texto) {
  return texto.split(" ").map((raw) => {
    const m = raw.match(/^([A-Za-zÀ-ÿ]+)([.,!?;:]*)$/);
    if (m) return { palavra: m[1], pontuacao: m[2] };
    return { palavra: raw, pontuacao: "" };
  });
}

const CHAVE_PROGRESSO = "afterschol_progresso_mandamentos";

function carregarProgresso() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_PROGRESSO)) || { dominados: [] };
  } catch {
    return { dominados: [] };
  }
}

function salvarProgresso(p) {
  localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify(p));
}

// ---------- estado ----------

const itens = MODULOS.mandamentos.itens;

let estado = {
  indiceAtual: 0, // índice do mandamento sendo aprendido
  etapaIndex: 0, // índice dentro da sequência de etapas do mandamento atual
};

function etapasParaIndice(indice) {
  const base = [
    "apresentacao",
    "repeticao",
    "completar_poucas",
    "completar_mais",
    "iniciais",
    "sozinho",
  ];
  if (indice > 0) base.push("revisao_cumulativa");
  return base;
}

// ---------- navegação de telas ----------

const app = document.getElementById("app");

function irParaHome() {
  const progresso = carregarProgresso();
  app.innerHTML = `
    <div class="tela tela-home">
      <h1>App de Memorização Católica 🙏</h1>
      <p class="subtitulo">Método Charlotte Mason adaptado para a catequese infantil</p>
      <div class="lista-modulos">
        <button class="cartao-modulo" id="btn-mandamentos">
          <span class="cartao-titulo">${MODULOS.mandamentos.titulo}</span>
          <span class="cartao-progresso">${progresso.dominados.length} de ${itens.length} aprendidos</span>
        </button>
        ${MODULOS_EM_BREVE.map(
          (m) => `<div class="cartao-modulo cartao-em-breve">
            <span class="cartao-titulo">${m.titulo}</span>
            <span class="cartao-progresso">em breve</span>
          </div>`
        ).join("")}
      </div>
    </div>
  `;
  document.getElementById("btn-mandamentos").addEventListener("click", () => {
    const progresso = carregarProgresso();
    // começa no primeiro mandamento ainda não dominado
    let idx = itens.findIndex((_, i) => !progresso.dominados.includes(i));
    if (idx === -1) idx = 0; // já dominou tudo, deixa revisar do início
    estado.indiceAtual = idx;
    estado.etapaIndex = 0;
    renderizarEtapa();
  });
}

function progressoBarraHtml() {
  const etapas = etapasParaIndice(estado.indiceAtual);
  return `
    <div class="progresso-topo">
      <button class="botao-voltar" id="btn-home">← início</button>
      <div class="bolinhas">
        ${itens
          .map((_, i) => {
            const dominado = carregarProgresso().dominados.includes(i);
            const atual = i === estado.indiceAtual;
            return `<span class="bolinha ${dominado ? "dominado" : ""} ${atual ? "atual" : ""}"></span>`;
          })
          .join("")}
      </div>
      <div class="barra-etapa">Etapa ${estado.etapaIndex + 1} de ${etapas.length}</div>
    </div>
  `;
}

function ligarBotaoHome() {
  const b = document.getElementById("btn-home");
  if (b) b.addEventListener("click", irParaHome);
}

function avancarEtapa() {
  const etapas = etapasParaIndice(estado.indiceAtual);
  if (estado.etapaIndex < etapas.length - 1) {
    estado.etapaIndex += 1;
    renderizarEtapa();
  } else {
    concluirMandamentoAtual();
  }
}

function reiniciarMandamentoAtual() {
  estado.etapaIndex = 0;
  renderizarEtapa();
}

function concluirMandamentoAtual() {
  const progresso = carregarProgresso();
  if (!progresso.dominados.includes(estado.indiceAtual)) {
    progresso.dominados.push(estado.indiceAtual);
    salvarProgresso(progresso);
  }
  if (estado.indiceAtual < itens.length - 1) {
    estado.indiceAtual += 1;
    estado.etapaIndex = 0;
    renderizarEtapa();
  } else {
    renderizarConclusaoFinal();
  }
}

function renderizarConclusaoFinal() {
  app.innerHTML = `
    <div class="tela tela-final">
      <h1>🎉 Parabéns!</h1>
      <p>Você aprendeu os ${itens.length} primeiros mandamentos!</p>
      <button class="botao-primario" id="btn-fim-home">Voltar ao início</button>
    </div>
  `;
  document.getElementById("btn-fim-home").addEventListener("click", irParaHome);
}

function renderizarEtapa() {
  const item = itens[estado.indiceAtual];
  const etapas = etapasParaIndice(estado.indiceAtual);
  const etapa = etapas[estado.etapaIndex];

  const renderizadores = {
    apresentacao: renderApresentacao,
    repeticao: renderRepeticao,
    completar_poucas: () => renderCompletar(item, "poucas"),
    completar_mais: () => renderCompletar(item, "mais"),
    iniciais: renderIniciais,
    sozinho: renderSozinho,
    revisao_cumulativa: renderRevisaoCumulativa,
  };

  renderizadores[etapa](item);
  ligarBotaoHome();
}

// ---------- etapa 1: apresentação ----------

function renderApresentacao(item) {
  app.innerHTML = `
    ${progressoBarraHtml()}
    <div class="tela tela-etapa">
      <p class="rotulo">${item.rotulo}</p>
      <p class="texto-grande">${item.texto}</p>
      <button class="botao-secundario" id="btn-ouvir">🔊 Ouvir de novo</button>
      <button class="botao-primario" id="btn-continuar">Continuar</button>
    </div>
  `;
  falar(item.texto);
  document.getElementById("btn-ouvir").addEventListener("click", () => falar(item.texto));
  document.getElementById("btn-continuar").addEventListener("click", avancarEtapa);
}

// ---------- etapa 2: repetição ----------

function renderRepeticao(item) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  app.innerHTML = `
    ${progressoBarraHtml()}
    <div class="tela tela-etapa">
      <p class="rotulo">Agora repita em voz alta</p>
      <p class="texto-grande">${item.texto}</p>
      <button class="botao-secundario" id="btn-ouvir">🔊 Ouvir de novo</button>
      ${SpeechRecognition ? '<button class="botao-secundario" id="btn-microfone">🎤 Falar</button>' : ""}
      <p class="mensagem" id="mensagem-feedback"></p>
      <button class="botao-primario" id="btn-continuar">✅ Consegui repetir!</button>
    </div>
  `;
  document.getElementById("btn-ouvir").addEventListener("click", () => falar(item.texto));
  document.getElementById("btn-continuar").addEventListener("click", avancarEtapa);

  if (SpeechRecognition) {
    document.getElementById("btn-microfone").addEventListener("click", () => {
      const rec = new SpeechRecognition();
      rec.lang = "pt-BR";
      rec.onresult = (e) => {
        const dito = e.results[0][0].transcript;
        const acertou = normalizar(dito) === normalizar(item.texto);
        const msg = document.getElementById("mensagem-feedback");
        msg.textContent = acertou
          ? "Perfeito! Você repetiu certinho. 🙌"
          : `Você disse: "${dito}". Tente ouvir de novo e repetir.`;
        msg.className = "mensagem " + (acertou ? "sucesso" : "erro");
      };
      rec.start();
    });
  }
}

// ---------- etapas 3 e 4: completar com lacunas ----------

function renderCompletar(item, nivel) {
  const palavras = tokenizarPalavras(item.texto);
  const total = palavras.length;
  const ocultarQtd =
    nivel === "poucas" ? Math.max(1, Math.floor(total * 0.25)) : Math.max(2, Math.floor(total * 0.6));
  const indiceCorte = total - ocultarQtd;

  const camposHtml = palavras
    .map((p, i) => {
      if (i < indiceCorte) {
        return `<span class="palavra-fixa">${p.palavra}${p.pontuacao}</span>`;
      }
      return `<span class="campo-lacuna">
        <input type="text" data-index="${i}" data-resposta="${p.palavra}" size="${Math.max(3, p.palavra.length)}" />${p.pontuacao}
      </span>`;
    })
    .join(" ");

  app.innerHTML = `
    ${progressoBarraHtml()}
    <div class="tela tela-etapa">
      <p class="rotulo">${item.rotulo} — complete as palavras que faltam</p>
      <div class="frase-lacunas">${camposHtml}</div>
      <button class="botao-secundario" id="btn-ouvir">🔊 Ouvir de novo</button>
      <p class="mensagem" id="mensagem-feedback"></p>
      <button class="botao-primario" id="btn-verificar">Verificar</button>
    </div>
  `;
  document.getElementById("btn-ouvir").addEventListener("click", () => falar(item.texto));
  document.getElementById("btn-verificar").addEventListener("click", () => {
    const inputs = [...document.querySelectorAll(".campo-lacuna input")];
    const todasCertas = inputs.every((inp) => normalizar(inp.value) === normalizar(inp.dataset.resposta));
    const msg = document.getElementById("mensagem-feedback");
    inputs.forEach((inp) => {
      const certo = normalizar(inp.value) === normalizar(inp.dataset.resposta);
      inp.classList.toggle("input-certo", certo);
      inp.classList.toggle("input-errado", !certo && inp.value.trim() !== "");
    });
    if (todasCertas) {
      msg.textContent = "Isso mesmo! 🎉";
      msg.className = "mensagem sucesso";
      setTimeout(avancarEtapa, 700);
    } else {
      msg.textContent = "Quase lá! Confira as palavras marcadas e tente de novo.";
      msg.className = "mensagem erro";
    }
  });
}

// ---------- etapa 5: apenas iniciais ----------

function renderIniciais(item) {
  const palavras = tokenizarPalavras(item.texto);
  const camposHtml = palavras
    .map((p, i) => {
      const primeiraLetra = p.palavra[0];
      const resto = p.palavra.slice(1);
      return `<span class="campo-lacuna campo-inicial">
        <span class="letra-inicial">${primeiraLetra}</span><input type="text" data-index="${i}" data-resposta="${resto}" size="${Math.max(2, resto.length)}" />${p.pontuacao}
      </span>`;
    })
    .join(" ");

  app.innerHTML = `
    ${progressoBarraHtml()}
    <div class="tela tela-etapa">
      <p class="rotulo">${item.rotulo} — só as iniciais para te ajudar</p>
      <div class="frase-lacunas">${camposHtml}</div>
      <p class="mensagem" id="mensagem-feedback"></p>
      <button class="botao-primario" id="btn-verificar">Verificar</button>
    </div>
  `;
  document.getElementById("btn-verificar").addEventListener("click", () => {
    const inputs = [...document.querySelectorAll(".campo-lacuna input")];
    const todasCertas = inputs.every((inp) => normalizar(inp.value) === normalizar(inp.dataset.resposta));
    const msg = document.getElementById("mensagem-feedback");
    inputs.forEach((inp) => {
      const certo = normalizar(inp.value) === normalizar(inp.dataset.resposta);
      inp.classList.toggle("input-certo", certo);
      inp.classList.toggle("input-errado", !certo && inp.value.trim() !== "");
    });
    if (todasCertas) {
      msg.textContent = "Isso mesmo! Você já sabe quase de cor! 🌟";
      msg.className = "mensagem sucesso";
      setTimeout(avancarEtapa, 700);
    } else {
      msg.textContent = "Quase! Olhe as letrinhas marcadas em vermelho.";
      msg.className = "mensagem erro";
    }
  });
}

// ---------- etapa 6: recitar sozinho ----------

function renderSozinho(item) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  app.innerHTML = `
    ${progressoBarraHtml()}
    <div class="tela tela-etapa">
      <p class="rotulo">Agora fale ou escreva o ${item.rotulo.toLowerCase()} completo, sozinho(a)!</p>
      <textarea id="resposta-sozinho" rows="3" placeholder="Digite aqui ou use o microfone..."></textarea>
      ${SpeechRecognition ? '<button class="botao-secundario" id="btn-microfone">🎤 Falar</button>' : ""}
      <p class="mensagem" id="mensagem-feedback"></p>
      <button class="botao-primario" id="btn-verificar">Verificar</button>
    </div>
  `;

  document.getElementById("btn-verificar").addEventListener("click", () => {
    const resposta = document.getElementById("resposta-sozinho").value;
    const acertou = normalizar(resposta) === normalizar(item.texto);
    const msg = document.getElementById("mensagem-feedback");
    if (acertou) {
      msg.textContent = "Você memorizou! Muito bem! 🏆";
      msg.className = "mensagem sucesso";
      setTimeout(avancarEtapa, 900);
    } else {
      msg.textContent = "Ainda não ficou igual. Vamos praticar esse mandamento de novo desde o início.";
      msg.className = "mensagem erro";
      setTimeout(reiniciarMandamentoAtual, 1800);
    }
  });

  if (SpeechRecognition) {
    document.getElementById("btn-microfone").addEventListener("click", () => {
      const rec = new SpeechRecognition();
      rec.lang = "pt-BR";
      rec.onresult = (e) => {
        document.getElementById("resposta-sozinho").value = e.results[0][0].transcript;
      };
      rec.start();
    });
  }
}

// ---------- etapa extra (a partir do 2º item): revisão cumulativa ----------

function renderRevisaoCumulativa(item) {
  const aprendidos = itens.slice(0, estado.indiceAtual + 1);

  app.innerHTML = `
    ${progressoBarraHtml()}
    <div class="tela tela-etapa">
      <p class="rotulo">Revisão: fale todos os mandamentos que você já aprendeu</p>
      ${aprendidos
        .map(
          (m, i) => `
        <div class="revisao-item" data-idx="${i}">
          <p class="revisao-rotulo">${m.rotulo}</p>
          <textarea rows="2" data-resposta="${m.texto}" placeholder="Escreva o ${m.rotulo.toLowerCase()}..."></textarea>
          <p class="mensagem-inline"></p>
        </div>
      `
        )
        .join("")}
      <button class="botao-primario" id="btn-verificar">Verificar tudo</button>
    </div>
  `;

  document.getElementById("btn-verificar").addEventListener("click", () => {
    const blocos = [...document.querySelectorAll(".revisao-item")];
    let tudoCerto = true;
    blocos.forEach((bloco) => {
      const textarea = bloco.querySelector("textarea");
      const msgInline = bloco.querySelector(".mensagem-inline");
      const certo = normalizar(textarea.value) === normalizar(textarea.dataset.resposta);
      if (!certo) tudoCerto = false;
      msgInline.textContent = certo ? "✅ Certinho!" : "❌ Ainda não, tente de novo.";
      msgInline.className = "mensagem-inline " + (certo ? "sucesso" : "erro");
    });
    if (tudoCerto) {
      setTimeout(avancarEtapa, 800);
    }
  });
}

// ---------- inicialização ----------

irParaHome();
