const sciName = document.getElementById("scientific-name-search");
const temp = document.getElementById("temperature-search");
const pressure = document.getElementById("pressure-search");
const duration = document.getElementById("duration-search");
const nutrition = document.getElementById("nutrition-search");
const downloadButton = document.getElementById("download-btn");

let query_object = {};

isLoggedIn();

class DataTable {
  constructor(data, targetElementId, rowsPerPage = 10) {
    this.data = data;
    this.targetElementId = targetElementId;
    this.rowsPerPage = rowsPerPage;
    this.currentPage = 1;
  }

  formatDate(isoDateString) {
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

  getPaginatedData() {
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    return this.data.slice(startIndex, endIndex);
  }

  getTotalPages() {
    return Math.ceil(this.data.length / this.rowsPerPage);
  }

  renderTable() {
    const targetElement = document.getElementById(this.targetElementId);
    if (!targetElement) {
      console.error(`Element with id "${this.targetElementId}" not found.`);
      return;
    }

    // Start building the table
    let tableHTML = '<table border="1" ><tr>';

    // Add table headers dynamically from the first data object
    if (this.data.length > 0) {
      Object.keys(this.data[0]).forEach((key) => {
        tableHTML += `<th style="padding:10px">${cleanUpTitle(key)}</th>`;
      });

      tableHTML += "</tr>";

      // Add paginated rows
      const paginatedData = this.getPaginatedData();
      paginatedData.forEach((item) => {
        tableHTML += "<tr>";
        Object.keys(item).forEach((key) => {
          const value = item[key];
          // Format only the created_at column
          const formattedValue =
            key === "created_at" ? this.formatDate(value) : value;

          tableHTML += `<td>${formattedValue}</td>`;
        });
        tableHTML += "</tr>";
      });
    } else {
      // If no data, show a message inside the table
      tableHTML += "<tr><td colspan='100%'>No data available</td></tr>";
    }

    tableHTML += "</table>";

    // Create pagination controls
    if (this.rowsPerPage < this.data.length) {
      tableHTML += this.renderPaginationControls();
      this.addPaginationEventListeners();
    }

    // Append to target element
    targetElement.innerHTML = tableHTML;
  }
  renderPaginationControls() {
    const totalPages = this.getTotalPages();
    console.log(totalPages);
    return `
      <div id="pagination" style="margin-top: 10px;">
        <button class="blue-btn" id="prevPage" ${
          this.currentPage === 1 ? "disabled" : ""
        }>Previous</button>
        <span>Page ${this.currentPage} of ${totalPages}</span>
        <button class="blue-btn" id="nextPage" ${
          this.currentPage === totalPages ? "disabled" : ""
        }>Next</button>
      </div>
    `;
  }
  addPaginationEventListeners() {
    // Use setTimeout to ensure DOM is fully updated
    setTimeout(() => {
      const prevButton = document.getElementById("prevPage");
      const nextButton = document.getElementById("nextPage");

      // Bind the context explicitly
      if (prevButton) {
        prevButton.addEventListener(
          "click",
          (() => {
            if (this.currentPage > 1) {
              this.currentPage--;
              this.renderTable();
            }
          }).bind(this)
        );
      }

      if (nextButton) {
        nextButton.addEventListener(
          "click",
          (() => {
            if (this.currentPage < this.getTotalPages()) {
              this.currentPage++;
              this.renderTable();
            }
          }).bind(this)
        );
      }
    }, 0);
  }
}

async function visualizePlateObjects() {
  let query_fields = {
    sci_name: sciName,
    temp: temp,
    press: pressure,
    duration: duration,
    plate_type: nutrition,
  };
  // Reset query_object
  query_object = {};

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
    // Create a new DataTable instance
    const dataTable = new DataTable(dataSet, "data-table");
    // Render the table with pagination
    dataTable.renderTable();
    downloadButton.removeAttribute("disabled");
  } else {
    // If no data found, display a "No data found" message
    targetElement.innerHTML = "<p>No data found for the given User Id.</p>";
    console.log("No valid data available.");
  }
}

// Modify the downloadExcelFile function to use the full dataset
async function downloadExcelFile() {
  // Use the existing query_object from visualizePlateObjects
  let dataSet = await getData(query_object); // Await the full data to be fetched

  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();

  today = mm + "/" + dd + "/" + yyyy;
  let filename = "coliform_analytics_" + today + ".xlsx";

  try {
    // Convert full data to a worksheet
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
function cleanUpTitle(sentence) {
  return sentence
    .replaceAll("_", " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
