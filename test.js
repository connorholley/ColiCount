let searchEId = document.getElementById("search-eid");
let sciName = document.getElementById("scientific-name-search");
let temp = document.getElementById("temperature-search");
let pressure = document.getElementById("pressure-search");
let duration = document.getElementById("duration-search");
let nutrition = document.getElementById("nutrition-search");
let query_object = {};

async function visualizePlateObjects() {
  let query_fields = {
    eId: searchEId,
    sci_name: sciName,
    temp: temp,
    press: pressure,
    duration: duration,
    plate_type: nutrition,
  };
  for (let key in query_fields) {
    if (query_fields.hasOwnProperty(key) && query_fields[key] != null) {
      query_object[key] = query_fields[key].value;
    }
  }
  let dataSet = await getData(query_object); // Await the data to be fetched
  // Clear the previous content from the table before adding new data
  const targetElement = document.getElementById("data-table");
  targetElement.innerHTML = ""; // This will remove any previous table content

  // Check if valid data was fetched
  if (dataSet && Array.isArray(dataSet) && dataSet.length > 0) {
    createTableWithInnerHTML(dataSet, "data-table");
  } else {
    // If no data found, display a "No data found" message
    targetElement.innerHTML = "<p>No data found for the given EID.</p>";
    console.log("No valid data available.");
  }
}
function formatDate(isoDateString) {
  const date = new Date(isoDateString);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  // Create the formatted date string with ordinal day
  const dayWithSuffix =
    day +
    (day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th");

  return `${month} ${dayWithSuffix} ${year}`;
}

function createTableWithInnerHTML(data, targetElementId) {
  // Ensure the target element exists
  const targetElement = document.getElementById(targetElementId);
  if (!targetElement) {
    console.error(`Element with id "${targetElementId}" not found.`);
    return;
  }

  // Start building the table
  let tableHTML = '<table border="1"><tr>';

  // Add table headers dynamically from the first data object
  if (data.length > 0) {
    Object.keys(data[0]).forEach((key) => {
      tableHTML += `<th style="padding:10px">${key}</th>`;
    });

    tableHTML += "</tr>";

    // Add table rows
    data.forEach((item) => {
      tableHTML += "<tr>";
      Object.keys(item).forEach((key) => {
        const value = item[key];
        // Format only the created_at column
        const formattedValue = key === "created_at" ? formatDate(value) : value;

        tableHTML += `<td>${formattedValue}</td>`;
      });
      tableHTML += "</tr>";
    });
  } else {
    // If no data, show a message inside the table
    tableHTML += "<tr><td colspan='100%'>No data available</td></tr>";
  }

  tableHTML += "</table>";

  // Append the table (or message) to the target element
  targetElement.innerHTML = tableHTML;
}
async function downloadExcelFile() {
  let dataSet = await getData(query_object); // Await the data to be fetched

  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();

  today = mm + "/" + dd + "/" + yyyy;
  let filename =
    "coliform_analytics_" + searchEId.value + "_" + today + ".xlsx";

  try {
    // Convert data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataSet);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Generate and download the Excel file
    XLSX.writeFile(workbook, filename);
  } catch (err) {
    console.error("Error generating Excel file:", err);
    alert("Failed to generate Excel file. Please try again.");
  }
}
