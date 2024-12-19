let selection = document.getElementById("x-axis");
let typeSelect = document.getElementById("type-select");

async function plotData() {
  // Check if a valid option was selected

  let i_var = selection.value;
  let graph_type = typeSelect.value;

  // Fetch all datasets concurrently
  const [bloodArray, chocolateArray, thayerArray] = await Promise.all([
    getData({ plate_type: "blood" }),
    getData({ plate_type: "chocolate" }),
    getData({ plate_type: "thayer-martin" }),
  ]);

  // Prepare data for Blood
  const xBloodValues = bloodArray.map((item) => parseFloat(item[i_var] || 0));
  const yBloodValues = bloodArray.map((item) => parseFloat(item["count"] || 0));

  // Prepare data for Chocolate
  const xChocolateValues = chocolateArray.map((item) =>
    parseFloat(item[i_var] || 0)
  );
  const yChocolateValues = chocolateArray.map((item) =>
    parseFloat(item["count"] || 0)
  );

  // Prepare data for Thayer-Martin
  const xThayerValues = thayerArray.map((item) => parseFloat(item[i_var] || 0));
  const yThayerValues = thayerArray.map((item) =>
    parseFloat(item["count"] || 0)
  );

  // Define the chart data
  const data = [
    {
      x: xBloodValues,
      y: yBloodValues,
      name: "Blood",
      type: graph_type,
      mode: "markers",
      marker: { color: "red" },
    },
    {
      x: xChocolateValues,
      y: yChocolateValues,
      name: "Chocolate",
      type: graph_type,
      mode: "markers",

      marker: { color: "brown" },
    },
    {
      x: xThayerValues,
      y: yThayerValues,
      name: "Thayer-Martin",
      type: graph_type,
      mode: "markers",

      marker: { color: "blue" },
    },
  ];

  in_title = "";
  if (i_var === "press" || i_var === "") {
    in_title = "Pressure (KPa)";
  } else if (i_var === "temp") {
    in_title = "Temperature (°C)";
  } else {
    in_title = "Duration (Days)";
  }
  // Define layout
  const layout = {
    title: `Colony Count vs ${in_title}`,
    xaxis: { title: `${in_title}` },
    yaxis: { title: "Colony Count" },
    barmode: "group", // Grouped bars
  };

  // Render the bar chart
  Plotly.react("myPlot", data, layout);
}
document.addEventListener("DOMContentLoaded", plotData);
