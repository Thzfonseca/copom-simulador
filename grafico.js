function renderizarGraficos(simulacao, prazoCurta, anoInicial) {
  const anos = simulacao.curvaLonga.map(p => p.ano);
  const labels = anos.map(a => String(a));
  const anoReinv = anoInicial + prazoCurta;
  const indexReinv = anos.indexOf(anoReinv);

  const dadosCurta = simulacao.curvaCurta.map((p, i) => ({
    x: p.ano,
    y: p.rentab,
    borderDash: i >= indexReinv ? [6, 4] : []
  }));

  const dadosLonga = simulacao.curvaLonga.map(p => ({
    x: p.ano,
    y: p.rentab
  }));

  /* === GRÁFICO 1: ACUMULADO === */
  const ctx1 = document.getElementById("grafico-acumulado").getContext("2d");
  new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: ['Papel Curto + CDI', 'Papel Longo'],
      datasets: [{
        label: 'Rentabilidade Acumulada (%)',
        data: [simulacao.retornoAcumuladoCurta.toFixed(2), simulacao.retornoAcumuladoLonga.toFixed(2)],
        backgroundColor: ['#2C9AB7', '#234E70']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${ctx.raw}%`
          }
        }
      }
    }
  });

  /* === GRÁFICO 2: RENTABILIDADE MÉDIA AO ANO === */
  const ctx2 = document.getElementById("grafico-anualizado").getContext("2d");
  new Chart(ctx2, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Papel Longo',
          data: dadosLonga.map(p => p.y),
          borderColor: '#234E70',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Papel Curto + CDI',
          data: dadosCurta.map(p => p.y),
          borderColor: '#2C9AB7',
          borderDash: [],
          fill: true,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${ctx.raw.toFixed(2)}% a.a.`
          }
        },
        annotation: {
          annotations: {
            linhaReinv: {
              type: 'line',
              borderDash: [4, 4],
              borderColor: '#C9A86B',
              borderWidth: 1,
              scaleID: 'x',
              value: String(anoReinv),
              label: {
                display: true,
                content: 'Início CDI',
                color: '#C9A86B',
                position: 'end'
              }
            }
          }
        }
      },
      scales: {
        y: {
          title: { display: true, text: '% ao ano' }
        },
        x: {
          title: { display: true, text: 'Ano' }
        }
      }
    },
    plugins: [ChartAnnotation]
  });
}

// Exportar para uso
window.renderizarGraficos = renderizarGraficos;
