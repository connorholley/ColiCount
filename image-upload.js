const sciName = document.getElementById("scientific-name");
const temp = document.getElementById("temperature");
const pressure = document.getElementById("pressure");
const duration = document.getElementById("duration");
const nutrition = document.getElementById("nutrition");
let colonyCount = 0;
let countOnesAuto = document.getElementById("count-ones-auto");
let countTensAuto = document.getElementById("count-tens-auto");
let countHundredsAuto = document.getElementById("count-hundreds-auto");

let originalCanvas = document.getElementById("originalCanvas");
let processedCanvas = document.getElementById("processedCanvas");
let originalCtx = originalCanvas.getContext("2d");
// let processedCtx = processedCanvas.getContext("2d");
let isSelectingPlate = false;
let isDragging = false;
let plateCircle = { x: 0, y: 0, radius: 20 }; // Default circle properties
let colonyAreaMin = document.getElementById("colonyAreaMin");
let colonyAreaMax = document.getElementById("colonyAreaMax");
const colonyCountElement = document.getElementById("colonyCount");
const imageUpload = document.getElementById("imageUpload");
let isPlateSelected = false;
let imageProcessed = false;
const inputImage = new Image();
const imageContainer = document.getElementById("image-container-cv");
const auto = document.getElementById("auto-plate");
const currentValueMin = document.getElementById("currentValueMin");
const currentValueMax = document.getElementById("currentValueMax");

// Preprocessing methods
function preprocessImage(src, method) {
  let gray = new cv.Mat();
  let processed = new cv.Mat();
  let debugImages = [];

  // Convert to grayscale
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  debugImages.push({ mat: gray.clone(), name: "Grayscale" });

  // Apply Gaussian blur
  let blurred = new cv.Mat();
  cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
  debugImages.push({ mat: blurred.clone(), name: "Blurred" });

  // Apply selected preprocessing method
  switch (method) {
    case "adaptive":
      cv.adaptiveThreshold(
        blurred,
        processed,
        255,
        cv.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv.THRESH_BINARY_INV,
        11,
        2
      );
      debugImages.push({
        mat: processed.clone(),
        name: "Adaptive Threshold",
      });
      break;

    case "laplacian":
      let laplacian = new cv.Mat();
      cv.Laplacian(blurred, laplacian, cv.CV_64F);
      laplacian.convertTo(processed, cv.CV_8U);
      cv.threshold(
        processed,
        processed,
        0,
        255,
        cv.THRESH_BINARY_INV | cv.THRESH_OTSU
      );
      debugImages.push({ mat: laplacian.clone(), name: "Laplacian" });
      debugImages.push({
        mat: processed.clone(),
        name: "Laplacian Threshold",
      });
      break;
  }

  // Morphological operations to clean up image
  let kernel = cv.Mat.ones(3, 3, cv.CV_8U);
  let opened = new cv.Mat();
  console.log(opened);
  cv.morphologyEx(processed, opened, cv.MORPH_OPEN, kernel);
  debugImages.push({ mat: opened.clone(), name: "Morphological Open" });

  // Clean up
  gray.delete();
  blurred.delete();
  kernel.delete();

  return { processed: opened, debugImages };
}

// Function to process image and count colonies
function processImageAndCountColonies() {
  if (!plateCircle.radius) {
    alert("Please select the plate boundaries first.");
    return;
  }

  if (!auto.checkValidity()) {
    auto.reportValidity();
    return;
  }

  if (!isPlateSelected) {
    alert("Select plate region on image");
    return;
  }

  // Create Mat from image and resize
  let src = cv.imread(inputImage);
  let resizedSrc = new cv.Mat();
  let scaleFactor = 1;
  cv.resize(
    src,
    resizedSrc,
    new cv.Size(src.cols * scaleFactor, src.rows * scaleFactor)
  );

  // Create and apply mask
  let mask = new cv.Mat.zeros(resizedSrc.rows, resizedSrc.cols, cv.CV_8U);
  cv.circle(
    mask,
    new cv.Point(plateCircle.x * scaleFactor, plateCircle.y * scaleFactor),
    plateCircle.radius * scaleFactor,
    new cv.Scalar(255),
    -1
  );

  let maskedSrc = new cv.Mat();
  cv.bitwise_and(resizedSrc, resizedSrc, maskedSrc, mask);

  // Process image and find contours
  let { processed } = preprocessImage(maskedSrc, "adaptive");
  cv.imshow("originalCanvas", processed);

  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(
    processed,
    contours,
    hierarchy,
    cv.RETR_TREE,
    cv.CHAIN_APPROX_SIMPLE
  );

  // Find largest contour (plate)
  let maxArea = 0;
  let maxContour = null;
  for (let i = 0; i < contours.size(); i++) {
    let contour = contours.get(i);
    let area = cv.contourArea(contour);
    if (area > maxArea) {
      maxArea = area;
      maxContour = contour;
    }
  }

  // Count colonies
  colonyCount = 0;
  for (let i = 0; i < contours.size(); i++) {
    let contour = contours.get(i);
    let area = cv.contourArea(contour);

    if (contour === maxContour || touchesContour(contour, maxContour)) {
      continue;
    }

    if (area <= colonyAreaMin.value || area >= colonyAreaMax.value) {
      continue;
    }

    // Draw colony contour
    cv.drawContours(
      resizedSrc,
      contours,
      i,
      new cv.Scalar(0, 255, 0),
      2,
      cv.LINE_8,
      hierarchy,
      100
    );
    colonyCount++;
  }

  displayColonyCount(colonyCount);
  cv.imshow("originalCanvas", resizedSrc);

  // Clean up
  [src, resizedSrc, maskedSrc, mask, processed, contours, hierarchy].forEach(
    (mat) => mat.delete()
  );
}

// Helper function to check if contour touches plate
function touchesContour(contour, plateContour, threshold = 0) {
  for (let i = 0; i < contour.rows; i++) {
    let point = contour.data32S.slice(i * 2, i * 2 + 2);
    let x = point[0];
    let y = point[1];

    for (let j = 0; j < plateContour.rows; j++) {
      let platePoint = plateContour.data32S.slice(j * 2, j * 2 + 2);
      let plateX = platePoint[0];
      let plateY = platePoint[1];

      let distance = Math.sqrt(
        Math.pow(x - plateX, 2) + Math.pow(y - plateY, 2)
      );
      if (distance < threshold) {
        return true;
      }
    }
  }
  return false;
}

// Event listeners for sliders
colonyAreaMin.addEventListener("input", function () {
  currentValueMin.textContent = this.value + " px";
  processImageAndCountColonies();
});

colonyAreaMax.addEventListener("input", function () {
  currentValueMax.textContent = this.value + " px";
  processImageAndCountColonies();
});

document.getElementById("imageUpload").addEventListener("change", function (e) {
  originalCanvas.value = "";
  // processedCanvas.value = "";
  isSelectingPlate = false;
  isDragging = false;
  isPlateSelected = false;
  plateCircle = { x: 0, y: 0, radius: 20 };
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    inputImage.src = event.target.result;

    inputImage.onload = function () {
      // Set canvas sizes and draw the original image
      originalCanvas.width = inputImage.width;
      originalCanvas.height = inputImage.height;
      // processedCanvas.width = inputImage.width;
      // processedCanvas.height = inputImage.height;

      originalCtx.drawImage(inputImage, 0, 0);
      imageContainer.style.display = "flex";
      // Validate steps

      isSelectingPlate = true;
      alert(
        "Click and drag to adjust the circle over the plate. Release to finalize."
      );
    };
  };

  originalCanvas.addEventListener("mousedown", (e) => {
    if (!isSelectingPlate) return;

    isDragging = true;
    // Use offsetX and offsetY which are more reliable for canvas coordinates
    plateCircle.x = e.offsetX;
    plateCircle.y = e.offsetY;
  });

  originalCanvas.addEventListener("mousemove", (e) => {
    if (!isDragging || !isSelectingPlate) return;

    // Use offsetX and offsetY which provide coordinates relative to the canvas
    const currentX = e.offsetX;
    const currentY = e.offsetY;

    const dx = currentX - plateCircle.x;
    const dy = currentY - plateCircle.y;
    plateCircle.radius = Math.sqrt(dx * dx + dy * dy);

    // Redraw the image and overlay the adjustable circle
    originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
    originalCtx.drawImage(inputImage, 0, 0);
    originalCtx.beginPath();
    originalCtx.arc(
      plateCircle.x,
      plateCircle.y,
      plateCircle.radius,
      0,
      2 * Math.PI
    );
    originalCtx.strokeStyle = "red";
    originalCtx.lineWidth = 2;
    originalCtx.stroke();
  });

  originalCanvas.addEventListener("mouseup", () => {
    if (!isDragging || !isSelectingPlate) return;

    isDragging = false;
    isSelectingPlate = false;
    isPlateSelected = true; // Mark plate as selected
    processImageAndCountColonies();
    // Validate steps
  });
  reader.readAsDataURL(file);
});

function displayColonyCount(colonyCount) {
  countOnesAuto.innerText = colonyCount % 10; // Ones place
  countTensAuto.innerText = Math.floor((colonyCount % 100) / 10); // Tens place
  countHundredsAuto.innerText = Math.floor(colonyCount / 100); // Hundreds place
  imageProcessed = true;
}

function createPlateObjectAuto() {
  const form = document.getElementById("plate-object-form");

  // Check form validity first
  if (!form.checkValidity()) {
    form.reportValidity();
    return false;
  }

  if (!imageProcessed) {
    alert("Ensure image has been processed to get proper count");
    return false;
  }
  try {
    // Attempt to write data
    writeData(
      sciName.value,
      temp.value,
      pressure.value,
      duration.value,
      nutrition.value,
      colonyCount
    );

    alert(`Plate Object Created Successfully!
    
      Scientific Name: ${sciName.value}
      Temperature: ${temp.value}
      Pressure: ${pressure.value}
      Duration: ${duration.value}
      Nutrition: ${nutrition.value}
      `);

    // Clear form and reset elements

    clearFormAndNumbersAuto();
  } catch (error) {
    // If an error occurs during writeData or subsequent processes
    console.error("Error creating plate object:", error);
    alert(`Error creating plate object: ${error.message}`);
  }
}

function clearFormAndNumbersAuto() {
  countOnesAuto.innerText = 0;
  countTensAuto.innerText = 0;
  countHundredsAuto.innerText = 0;

  sciName.value = null;
  temp.value = null;
  pressure.value = null;
  duration.value = null;
  nutrition.value = null;
  colonyCount = 0;
  imageProcessed = false;
  colonyAreaMax.value = null;
  colonyAreaMin.value = null;
  imageUpload.value = "";
  imageContainer.style.display = "none";
  originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
  // processedCtx.clearRect(0, 0, processedCanvas.width, processedCanvas.height);
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("originalCanvas");
  const cursor = document.createElement("div");
  cursor.classList.add("drawing-cursor");
  document.body.appendChild(cursor);

  // Function to check if canvas has content
  function canvasHasContent() {
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // Check if all pixels are transparent (0 alpha)
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] > 0) {
        return true; // Found a non-transparent pixel
      }
    }
    return false;
  }

  canvas.addEventListener("mousemove", (e) => {
    // Only proceed if canvas has an image
    if (!canvasHasContent()) return;

    // Get canvas's position and dimensions
    const rect = canvas.getBoundingClientRect();

    // Calculate mouse position relative to canvas
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;

    if (x > 0 && x < rect.width && y > 0 && y < rect.height) {
      cursor.style.borderColor = "blue"; // Change border color when inside canvas
      cursor.style.display = "block";
    } else {
      cursor.style.borderColor = "black";
      cursor.style.display = "none";
    }
  });

  canvas.addEventListener("mouseleave", () => {
    cursor.style.display = "none";
  });

  canvas.addEventListener("mouseenter", () => {
    if (canvasHasContent()) {
      cursor.style.display = "block";
    } else {
      cursor.style.display = "none";
    }
  });
});
