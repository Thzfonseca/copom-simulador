function calcularSimulacao({ taxaCurta, prazoCurta, taxaLonga, prazoLonga, ipcaAnual, cdiAnual }) {
  const anos = Object.keys(ipcaAnual).map(Number).sort();

  // CALCULAR VALOR FUTURO DE CADA OPÇÃO
  const vfCurta = calcularValorFuturoIPCA(ipcaAnual, taxaCurta, prazoCurta, anos[0]);
  const vfLonga = calcularValorFuturoIPCA(ipcaAnual, taxaLonga, prazoLonga, anos[0]);

  // Reinvestimento em CDI após o vencimento do papel curto
  const restante = prazoLonga - prazoCurta;
  const inicioReinvestimento = anos[0] + prazoCurta;
  const vfReinvestido = calcularReinvestimentoCDI(cdiAnual, vfCurta, restante, inicioReinvestimento);

  const vfFinalCurta = vfReinvestido;

  // RENTABILIDADE ACUMULADA
  const retornoAcumuladoCurta = vfFinalCurta - 100;
  const retornoAcumuladoLonga = vfLonga - 100;

  // RENTABILIDADE MÉDIA AO ANO
  const retornoAnualCurta = ((vfFinalCurta / 100) ** (1 / prazoLonga)) - 1;
  const retornoAnualLonga = ((vfLonga / 100) ** (1 / prazoLonga)) - 1;

  // CDI break-even: qual CDI médio no reinvestimento zeraria a diferença
  const cdiBreakEven = calcularCDIBreakEven(vfCurta, vfLonga, restante);

  return {
    retornoAcumuladoCurta,
    retornoAcumuladoLonga,
    retornoAnualCurta,
    retornoAnualLonga,
    cdiBreakEven,
    curvaCurta: gerarCurvaRentabMedia(ipcaAnual, taxaCurta, prazoCurta, cdiAnual, prazoLonga, anos[0]),
    curvaLonga: gerarCurvaRentabMedia(ipcaAnual, taxaLonga, prazoLonga, null, prazoLonga, anos[0]),
  };
}

function calcularValorFuturoIPCA(ipcaAnual, taxaReal, prazo, anoInicial) {
  let vf = 100;
  for (let i = 0; i < prazo; i++) {
    const ano = anoInicial + i;
    const ipca = (ipcaAnual[ano] ?? ipcaAnual[anoInicial]) / 100;
    const taxa = taxaReal / 100;
    vf *= (1 + ipca) * (1 + taxa);
  }
  return vf;
}

function calcularReinvestimentoCDI(cdiAnual, valorInicial, prazo, anoInicial) {
  let vf = valorInicial;
  for (let i = 0; i < prazo; i++) {
    const ano = anoInicial + i;
    const cdi = (cdiAnual[ano] ?? cdiAnual[anoInicial]) / 100;
    vf *= (1 + cdi);
  }
  return vf;
}

function calcularCDIBreakEven(vfCurta, vfLonga, anosReinv) {
  if (anosReinv <= 0) return null;
  const taxa = (vfLonga / vfCurta) ** (1 / anosReinv) - 1;
  return taxa * 100;
}

function gerarCurvaRentabMedia(ipcaAnual, taxaReal, prazoReal, cdiAnual, prazoFinal, anoInicial) {
  const curva = [];
  let vf = 100;
  for (let i = 0; i < prazoFinal; i++) {
    const ano = anoInicial + i;
    if (i < prazoReal) {
      const ipca = (ipcaAnual[ano] ?? 4) / 100;
      const taxa = taxaReal / 100;
      vf *= (1 + ipca) * (1 + taxa);
    } else if (cdiAnual) {
      const cdi = (cdiAnual[ano] ?? 9) / 100;
      vf *= (1 + cdi);
    }
    const rentabMedia = (vf / 100) ** (1 / (i + 1)) - 1;
    curva.push({ ano, rentab: rentabMedia * 100 });
  }
  return curva;
}

// Exportável no futuro
window.calcularSimulacao = calcularSimulacao;
