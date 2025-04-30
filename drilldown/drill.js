const chartDataString = `[
  {
    "Name": "Corrective Action",
    "WithinTarget": 19,
    "Overdue": 14,
    "GroupKPITargetList": [
      {
        "Name": "Officer",
        "WithinTarget": 15,
        "Overdue": 12,
        "UserKPITargetList": [
          {
            "ID": 1,
            "Name": "Officer 1",
            "WithinTarget": 12,
            "Overdue": 11
          },
          {
            "ID": 2,
            "Name": "Officer 2",
            "WithinTarget": 13,
            "Overdue": 11
          }
        ]
      },
      {
        "Name": "Supervisor",
        "WithinTarget": 13,
        "Overdue": 11,
        "UserKPITargetList": [
          {
            "ID": 1,
            "Name": "Supervisor 1",
            "WithinTarget": 13,
            "Overdue": 11
          },
          {
            "ID": 2,
            "Name": "Supervisor 2",
            "WithinTarget": 14,
            "Overdue": 12
          }
        ]
      }
    ]
  },
  {
    "Name": "RPF in Market",
    "WithinTarget": 17,
    "Overdue": 13,
    "GroupKPITargetList": [
      {
        "Name": "Officer",
        "WithinTarget": 13,
        "Overdue": 11,
        "UserKPITargetList": [
          {
            "ID": 1,
            "Name": "Officer 1",
            "WithinTarget": 12,
            "Overdue": 11
          }
        ]
      },
      {
        "Name": "Supervisor",
        "WithinTarget": 13,
        "Overdue": 11,
        "UserKPITargetList": [
          {
            "ID": 1,
            "Name": "Supervisor 1",
            "WithinTarget": 13,
            "Overdue": 11
          }
        ]
      }
    ]
  }
]`;

const chartData = JSON.parse(chartDataString);

let historyStack = [];

function getCurrentNode() {
  let node = chartData;
  for (const step of historyStack) {
    if (Array.isArray(node)) {
      node = node[step.index].GroupKPITargetList || node[step.index].UserKPITargetList;
    } else if (node.GroupKPITargetList) {
      node = node.GroupKPITargetList[step.index].UserKPITargetList;
    }
  }
  return node;
}

function getChartData(node) {
  if (Array.isArray(node)) {
    return {
      categories: node.map((item) => item.Name),
      series: [
        {
          name: "Within Target",
          data: node.map((item) => item.WithinTarget),
          color: "#a67ebd",
        },
        {
          name: "Overdue",
          data: node.map((item) => item.Overdue),
          color: "#f39c12",
        },
      ],
    };
  }
  return { categories: [], series: [] };
}

function canDrilldown(node, index) {
  if (Array.isArray(node)) {
    return !!(node[index].GroupKPITargetList || node[index].UserKPITargetList);
  }
  return false;
}

function drilldown(index, label) {
  const node = getCurrentNode();
  if (!canDrilldown(node, index)) return;

  historyStack.push({ index, label });
  renderChart();
  updateBreadcrumbs();
}

function goBack() {
  if (historyStack.length > 0) {
    historyStack.pop();
    renderChart();
    updateBreadcrumbs();
  }
}

function updateBreadcrumbs() {
  const breadcrumbs = [
    `<span class="breadcrumb" data-index="-1" style="cursor: pointer;">Home</span>`,
    ...historyStack.map((step, i) => {
      return `<span class="breadcrumb" data-index="${i}" style="cursor: pointer;">${step.label}</span>`;
    }),
  ].join(" > ");

  document.getElementById($parameters.breadcrumbsId).innerHTML = breadcrumbs;

  // Add click event listeners to breadcrumbs
  document.querySelectorAll(".breadcrumb").forEach((el) => {
    el.addEventListener("click", (e) => {
      const index = parseInt(e.target.dataset.index, 10);
      if (index === -1) {
        historyStack = []; // Reset to initial chart
      } else {
        historyStack = historyStack.slice(0, index + 1); // Retain only up to the clicked breadcrumb
      }
      renderChart();
      updateBreadcrumbs();
    });
  });

  // Show or hide the back button based on history stack length
  document.getElementById($parameters.backId).style.display = historyStack.length > 0 ? "block" : "none";
}

function renderChart() {
  const node = getCurrentNode();
  const { categories, series } = getChartData(node);

  Highcharts.chart($parameters.containerId, {
    chart: { type: "bar" },
    title: { text: null },
    xAxis: { categories },
    yAxis: { min: 0, title: { text: "Applications" } },
    series,
    plotOptions: {
      bar: {
        stacking: "normal", // Enable stacking for side-by-side comparison
        cursor: "pointer",
        events: {
          click: function (event) {
            drilldown(event.point.index, event.point.category);
          },
        },
      },
    },
  });
}

document.getElementById($parameters.backId).addEventListener("click", goBack);

renderChart();
updateBreadcrumbs();