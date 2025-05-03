document.addEventListener("DOMContentLoaded", () => {
  try {
    gerarTabelaPremissas();
    gerarFormularioMacro();
    configurarBotaoExportar();
    logar("Sistema COPOM iniciado com sucesso.");
  } catch (erro) {
    registrarErro("Erro no carregamento inicial: " + erro.message);
  }
});

/* === TABELA DE PREMISSAS === */
function gerarTabelaPremissas() {
  const div = document.getElementById("tabela-premissas");
  const anos = [2025, 2026, 2027, 2028, 2029];
  let html = `<table><thead><tr><th>Ano</th><th>IPCA (%)</th><th>CDI (%)</th></tr></thead><tbody>`;
  anos.forEach(ano => {
    html += `<tr>
      <td>${ano}</td>
      <td><input type="number" id="ipca-${ano}" step="0.01" value="4.0"/></td>
      <td><input type="number" id="cdi-${ano}" step="0.01" value="9.0"/></td>
    </tr>`;
  });
  html += `</tbody></table>`;
  div.innerHTML = html;
}

/* === FORMULÁRIO DE CENÁRIO MACROECONÔMICO === */
function gerarFormularioMacro() {
  const div = document.getElementById("form-markov");
  div.innerHTML = `
    <label>IPCA atual (%): <input type="number" id="ipca-atual" value="4.2" step="0.01"/></label><br/>
    <label>CDI atual (%): <input type="number" id="cdi-atual" value="10.65" step="0.01"/></label><br/>
    <label>Tendência de juros:
      <select id="tendencia-juros">
        <option value="queda">Queda</option>
        <option value="estavel">Estável</option>
        <option value="alta">Alta</option>
      </select>
    </label><br/>
    <label>Atividade econômica:
      <select id="atividade">
        <option value="desaceleracao">Desaceleração</option>
        <option value="estavel" selected>Estável</option>
        <option value="aceleracao">Aceleração</option>
      </select>
    </label><br/>
    <label>Câmbio esperado:
      <select id="cambio">
        <option value="valorizacao">Valorização</option>
        <option value="estabilidade" selected>Estabilidade</option>
        <option value="desvalorizacao">Desvalorização</option>
      </select>
    </label><br/>
    <label>Pressões externas:
      <select id="externo">
        <option value="queda" selected>Pressão em queda</option>
        <option value="estavel">Estável</option>
        <option value="alta">Alta</option>
      </select>
    </label><br/>
    <button onclick="interpretarCenario()">Interpretar Cenário</button>
    <div id="resultado-cenario" style="margin-top: 16px;"></div>
  `;
}

/* === INTERPRETAÇÃO DO CENÁRIO MARKOV SIMPLIFICADO === */
function interpretarCenario() {
  const ipca = parseFloat(document.getElementById("ipca-atual").value);
  const cdi = parseFloat(document.getElementById("cdi-atual").value);
  const juros = document.getElementById("tendencia-juros").value;
  const atividade = document.getElementById("atividade").value;
  const cambio = document.getElementById("cambio").value;
  const externo = document.getElementById("externo").value;

  let estadoAtual = "E2";
  let narrativa = "Cenário moderado com inflação sob controle e viés de queda dos juros.";
  let matriz = `
    <table><thead><tr><th>De / Para</th><th>E1</th><th>E2</th><th>E3</th></tr></thead>
    <tbody><tr><td>E2 (atual)</td><td>10%</td><td>60%</td><td>30%</td></tr></tbody></table>
  `;

  if (ipca > 6 || cdi > 12 || juros === "alta") {
    estadoAtual = "E1";
    narrativa = "Inflação alta e política monetária contracionista.";
    matriz = `
      <table><thead><tr><th>De / Para</th><th>E1</th><th>E2</th><th>E3</th></tr></thead>
      <tbody><tr><td>E1 (atual)</td><td>50%</td><td>40%</td><td>10%</td></tr></tbody></table>
    `;
  }

  if (ipca < 3.5 && cdi < 8 && juros === "queda" && externo === "queda") {
    estadoAtual = "E3";
    narrativa = "Cenário de inflação baixa com corte de juros em andamento.";
    matriz = `
      <table><thead><tr><th>De / Para</th><th>E1</th><th>E2</th><th>E3</th></tr></thead>
      <tbody><tr><td>E3 (atual)</td><td>5%</td><td>25%</td><td>70%</td></tr></tbody></table>
    `;
  }

  const resultado = `
    <p><strong>Estado atual detectado:</strong> ${estadoAtual}</p>
    <p>${narrativa}</p>
    <h4>Matriz de transição sugerida:</h4>
    ${matriz}
  `;
  document.getElementById("resultado-cenario").innerHTML = resultado;
  logar(`Cenário macroeconômico interpretado: ${estadoAtual}`);
}

/* === EXPORTAÇÃO DE RELATÓRIO === */
function configurarBotaoExportar() {
  document.getElementById("btn-exportar").addEventListener("click", () => {
    alert("Exportação de relatório em construção.");
    logar("Exportação acionada.");
  });
}

/* === LOGGING E DEBUG === */
function registrarErro(msg) {
  console.error("[COPOM-ERRO]", msg);
  window.__errosDebug = window.__errosDebug || [];
  window.__errosDebug.push(msg);
  const div = document.getElementById("relatorio-erros");
  if (div) {
    div.style.display = "block";
    div.innerHTML += `<div>[!] ${msg}</div>`;
    div.scrollTop = div.scrollHeight;
  }
}

function logar(msg) {
  console.log("[COPOM-LOG]", msg);
}

function toggleDebug() {
  const log = document.getElementById("relatorio-erros");
  if (log.style.display === "none") {
    log.style.display = "block";
  } else {
    log.style.display = "none";
  }
}
/* === BOTÃO DE SIMULAÇÃO === */
document.getElementById("btn-simular").addEventListener("click", () => {
  try {
    const ipcaAnual = {};
    const cdiAnual = {};
    for (let ano = 2025; ano <= 2029; ano++) {
      ipcaAnual[ano] = parseFloat(document.getElementById(`ipca-${ano}`).value || "0");
      cdiAnual[ano] = parseFloat(document.getElementById(`cdi-${ano}`).value || "0");
    }

    const taxaCurta = parseFloat(document.getElementById("taxa-curta").value);
    const taxaLonga = parseFloat(document.getElementById("taxa-longa").value);
    const prazoCurta = parseFloat(document.getElementById("prazo-curta").value);
    const prazoLonga = parseFloat(document.getElementById("prazo-longa").value);

    const config = {
      taxaCurta,
      prazoCurta,
      taxaLonga,
      prazoLonga,
      ipcaAnual,
      cdiAnual
    };

    const simulacao = calcularSimulacao(config);
    renderizarGraficos(simulacao, prazoCurta, 2025);
    atualizarResumo(simulacao);
    gerarNarrativa(simulacao);

    logar("Simulação atualizada com taxas e prazos manuais.");
  } catch (erro) {
    registrarErro("Erro ao rodar simulação: " + erro.message);
  }
});
function atualizarResumo(simulacao) {
  const container = document.getElementById("resumo-cards");
  container.innerHTML = `
    <div class="resumo-card">
      <h3>Papel Curto + CDI</h3>
      <p>Acumulado: <strong>${simulacao.retornoAcumuladoCurta.toFixed(2)}%</strong></p>
      <p>Média Anual: <strong>${simulacao.retornoAnualCurta.toFixed(2)}% a.a.</strong></p>
    </div>
    <div class="resumo-card">
      <h3>Papel Longo</h3>
      <p>Acumulado: <strong>${simulacao.retornoAcumuladoLonga.toFixed(2)}%</strong></p>
      <p>Média Anual: <strong>${simulacao.retornoAnualLonga.toFixed(2)}% a.a.</strong></p>
    </div>
    <div class="resumo-card">
      <h3>CDI Break-even</h3>
      <p><strong>${simulacao.cdiBreakEven.toFixed(2)}% a.a.</strong></p>
      <p>CDI médio necessário após o vencimento do curto para empatar com o longo.</p>
    </div>
  `;
}

function gerarNarrativa(simulacao) {
  const div = document.getElementById("output-narrativo");

  let texto = "";
  const diff = simulacao.retornoAnualLonga - simulacao.retornoAnualCurta;

  if (diff > 0.15) {
    texto += `<p>O papel <strong>longo</strong> oferece uma rentabilidade média ao ano superior ao papel curto, mesmo com reinvestimento em CDI.`;
  } else if (diff < -0.15) {
    texto += `<p>O papel <strong>curto + CDI</strong> supera o papel longo em retorno anual, indicando melhor eficiência no ciclo atual.</p>`;
  } else {
    texto += `<p>Os dois papéis têm rentabilidades muito próximas. A escolha dependerá do apetite ao risco de duration e da visibilidade sobre a curva futura do CDI.</p>`;
  }

  texto += `<p>Para que o papel curto + CDI empate com o longo, o CDI médio após ${simulacao.curvaCurta.length - 3} anos precisa ser de pelo menos <strong>${simulacao.cdiBreakEven.toFixed(2)}% a.a.</strong></p>`;
  div.innerHTML = texto;
}
function configurarBotaoExportar() {
  document.getElementById("btn-exportar").addEventListener("click", async () => {
    try {
      const canvas1 = document.getElementById("grafico-acumulado");
      const canvas2 = document.getElementById("grafico-anualizado");

      const img1 = canvas1.toDataURL("image/png");
      const img2 = canvas2.toDataURL("image/png");

      const resumo = document.getElementById("resumo-cards").innerHTML;
      const narrativa = document.getElementById("output-narrativo").innerHTML;

      const premissas = [];
      for (let ano = 2025; ano <= 2029; ano++) {
        const ipca = document.getElementById(`ipca-${ano}`).value;
        const cdi = document.getElementById(`cdi-${ano}`).value;
        premissas.push(`<tr><td>${ano}</td><td>${ipca}%</td><td>${cdi}%</td></tr>`);
      }

      const taxaCurta = document.getElementById("taxa-curta").value;
      const taxaLonga = document.getElementById("taxa-longa").value;
      const prazoCurta = document.getElementById("prazo-curta").value;
      const prazoLonga = document.getElementById("prazo-longa").value;

      const html = `
        <h1 style="color:#234E70;">Relatório Estratégico COPOM</h1>
        <p><strong>Simulação gerada automaticamente por advisor.</strong></p>

        <h2>Premissas Econômicas</h2>
        <table border="1" cellpadding="4" cellspacing="0">
          <thead><tr><th>Ano</th><th>IPCA (%)</th><th>CDI (%)</th></tr></thead>
          <tbody>${premissas.join('')}</tbody>
        </table>

        <h2>Configuração dos Papéis</h2>
        <ul>
          <li><strong>Papel Curto:</strong> IPCA+${taxaCurta}% — ${prazoCurta} anos</li>
          <li><strong>Papel Longo:</strong> IPCA+${taxaLonga}% — ${prazoLonga} anos</li>
        </ul>

        <h2>Resumo Estratégico</h2>
        <div style="border-left:4px solid #C9A86B; padding-left:12px;">${resumo}</div>

        <h2>Gráficos</h2>
        <img src="${img1}" alt="Rentabilidade acumulada"/>
        <br/>
        <img src="${img2}" alt="Rentabilidade média ao ano"/>

        <h2>Análise e Interpretação</h2>
        <div style="background:#f4f4f4; padding:12px;">${narrativa}</div>
      `;

      const converted = window.htmlDocx.asBlob(html, { orientation: 'portrait', margins: { top: 720 } });
      saveAs(converted, `Relatorio-COPOM-${new Date().toISOString().split('T')[0]}.docx`);

      logar("Relatório exportado como DOCX.");
    } catch (erro) {
      registrarErro("Erro ao exportar relatório Word: " + erro.message);
    }
  });
}



