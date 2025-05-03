// grafico.js

function renderizarGraficos(simulacao, prazoCurta, anoInicial) {
  const labels = simulacao.anos;

  const ctx1 = document.getElementById("grafico-acumulado").getContext("2d");
  const ctx2 = document.getElementById("grafico-anualizado").getContext("2d");

  if (window.graficoAcumulado) window.graficoAcumulado.destroy();
  if (window.graficoAnualizado) window.graficoAnualizado.destroy();

  window.graficoAcumulado = new Chart(ctx1, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Papel Curto + CDI",
          data: simulacao.curvaCurta,
          fill: true,
          tension: 0.2,
          borderWidth: 2
        },
        {
          label: "Papel Longo",
          data: simulacao.curvaLonga,
          fill: true,
          tension: 0.2,
          borderWidth: 2
        }
      ]
    },
    options: {
      plugins: {
        legend: { position: "top" },
        annotation: {
          annotations: {
            linhaReinv: {
              type: "line",
              scaleID: "x",
              value: labels[prazoCurta],
              borderColor: "#C9A86B",
              borderWidth: 2,
              label: {
                content: "Início CDI",
                enabled: true,
                position: "start"
              }
            }
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      scales: {
        y: {
          ticks: {
            callback: function(value) {
              return value.toFixed(1) + "%";
            }
          }
        }
      }
    }
  });

  window.graficoAnualizado = new Chart(ctx2, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Papel Curto + CDI",
          data: simulacao.curvaCurtaMediaAno,
          fill: false,
          tension: 0.2,
          borderWidth: 2
        },
        {
          label: "Papel Longo",
          data: simulacao.curvaLongaMediaAno,
          fill: false,
          tension: 0.2,
          borderWidth: 2
        }
      ]
    },
    options: {
      plugins: {
        legend: { position: "top" },
        annotation: {
          annotations: {
            linhaReinv: {
              type: "line",
              scaleID: "x",
              value: labels[prazoCurta],
              borderColor: "#C9A86B",
              borderWidth: 2,
              label: {
                content: "Início CDI",
                enabled: true,
                position: "start"
              }
            }
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      scales: {
        y: {
          ticks: {
            callback: function(value) {
              return value.toFixed(1) + "%";
            }
          }
        }
      }
    }
  });
}
