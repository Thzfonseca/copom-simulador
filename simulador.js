// simulador.js

function calcularSimulacao(config) {
  const {
    taxaCurta,
    prazoCurta,
    taxaLonga,
    prazoLonga,
    ipcaAnual,
    cdiAnual
  } = config;

  const anos = [];
  const curvaCurta = [];
  const curvaLonga = [];
  const curvaCurtaMediaAno = [];
  const curvaLongaMediaAno = [];

  let acumuladoCurta = 0;
  let acumuladoLonga = 0;

  const anoInicial = 2025;
  const anoFinal = anoInicial + Math.round(prazoLonga);

  for (let ano = anoInicial; ano <= anoFinal; ano++) {
    const i = ano - anoInicial;
    anos.push(ano);

    const ipca = ipcaAnual[ano] / 100;
    const cdi = cdiAnual[ano] / 100;

    // Papel Curto: até o vencimento segue a taxa definida, depois CDI
    let rendimentoCurta = 0;
    if (i < prazoCurta) {
      rendimentoCurta = (1 + ipca) * (1 + taxaCurta / 100) - 1;
    } else {
      rendimentoCurta = cdi;
    }
    acumuladoCurta = (1 + acumuladoCurta) * (1 + rendimentoCurta) - 1;
    curvaCurta.push(acumuladoCurta * 100);

    // Média anualizada até o ponto atual da curva curta
    const mediaCurta = Math.pow(1 + acumuladoCurta, 1 / (i + 1)) - 1;
    curvaCurtaMediaAno.push(mediaCurta * 100);

    // Papel Longo: segue até o vencimento
    if (i < prazoLonga) {
      const rendimentoLonga = (1 + ipca) * (1 + taxaLonga / 100) - 1;
      acumuladoLonga = (1 + acumuladoLonga) * (1 + rendimentoLonga) - 1;
    }
    curvaLonga.push(acumuladoLonga * 100);
    const mediaLonga = Math.pow(1 + acumuladoLonga, 1 / (i + 1)) - 1;
    curvaLongaMediaAno.push(mediaLonga * 100);
  }

  // CDI break-even: quanto precisa render após prazoCurta para empatar com o longo
  const retornoFinalCurta = curvaCurta[prazoCurta - 1] / 100;
  const anosReinv = prazoLonga - prazoCurta;
  const fatorReinv = (1 + acumuladoLonga) / (1 + retornoFinalCurta);
  const cdiBreakEven = Math.pow(fatorReinv, 1 / anosReinv) - 1;

  return {
    anos,
    curvaCurta,
    curvaLonga,
    curvaCurtaMediaAno,
    curvaLongaMediaAno,
    retornoAcumuladoCurta: curvaCurta[curvaCurta.length - 1],
    retornoAcumuladoLonga: curvaLonga[curvaLonga.length - 1],
    retornoAnualCurta: curvaCurtaMediaAno[curvaCurtaMediaAno.length - 1],
    retornoAnualLonga: curvaLongaMediaAno[curvaLongaMediaAno.length - 1],
    cdiBreakEven: cdiBreakEven * 100
  };
}
