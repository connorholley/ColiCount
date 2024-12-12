let colonyCount = 0;
let countOnesAuto = document.getElementById("count-ones-auto");
let countTensAuto = document.getElementById("count-tens-auto");
let countHundredsAuto = document.getElementById("count-hundreds-auto");

let imageInput = document.getElementById("image-input");
let originalCanvas = document.getElementById("originalCanvas");
let processedCanvas = document.getElementById("processedCanvas");
let originalCtx = originalCanvas.getContext("2d");
let processedCtx = processedCanvas.getContext("2d");
let isSelectingPlate = false;
let isDragging = false;
let plateCircle = { x: 0, y: 0, radius: 20 }; // Default circle properties
let colonyAreaMin = document.getElementById("colonyAreaMin");
let colonyAreaMax = document.getElementById("colonyAreaMax");
const colonyCountElement = document.getElementById("colonyCount");
const imageUpload = document.getElementById("imageUpload");
const processButton = document.getElementById("processButton");
let isPlateSelected = false;

const inputImage = new Image();

function validateSteps() {
  const isImageUploaded = imageUpload.files.length > 0;
  const isMinAreaSet = colonyAreaMin.value.trim() !== "";
  const isMaxAreaSet = colonyAreaMax.value.trim() !== "";

  // Enable process button only if all conditions are met
  processButton.disabled = !(
    isImageUploaded &&
    isPlateSelected &&
    isMinAreaSet &&
    isMaxAreaSet
  );
}

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

document.getElementById("imageUpload").addEventListener("change", function (e) {
  originalCanvas.value = "";
  processedCanvas.value = "";
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
      processedCanvas.width = inputImage.width;
      processedCanvas.height = inputImage.height;

      originalCtx.drawImage(inputImage, 0, 0);

      // Validate steps
      validateSteps();

      isSelectingPlate = true;
      alert(
        "Click and drag to adjust the circle over the plate. Release to finalize."
      );
    };
  };
  colonyAreaMin.addEventListener("input", validateSteps);
  colonyAreaMax.addEventListener("input", validateSteps);
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

    document.getElementById("selectedRadius").textContent = Math.round(
      plateCircle.radius
    );
  });

  originalCanvas.addEventListener("mouseup", () => {
    if (!isDragging || !isSelectingPlate) return;

    isDragging = false;
    isSelectingPlate = false;
    isPlateSelected = true; // Mark plate as selected
    alert("Plate selection finalized.");

    // Validate steps
    validateSteps();
  });
  reader.readAsDataURL(file);
});

// Add event listeners to colony area inputs

document.getElementById("processButton").addEventListener("click", function () {
  if (!plateCircle.radius) {
    alert("Please select the plate boundaries first.");
    return;
  }

  // Create Mat from image
  let src = cv.imread(inputImage);

  // Resize image for better processing (adjust based on your image size)
  let resizedSrc = new cv.Mat();
  let scaleFactor = 1; // Adjust scale factor if necessary
  cv.resize(
    src,
    resizedSrc,
    new cv.Size(src.cols * scaleFactor, src.rows * scaleFactor)
  );

  // Create a mask with the plateCircle
  let mask = new cv.Mat.zeros(resizedSrc.rows, resizedSrc.cols, cv.CV_8U);
  cv.circle(
    mask,
    new cv.Point(plateCircle.x * scaleFactor, plateCircle.y * scaleFactor),
    plateCircle.radius * scaleFactor,
    new cv.Scalar(255),
    -1
  );

  // Apply the mask to the resized image
  let maskedSrc = new cv.Mat();
  cv.bitwise_and(resizedSrc, resizedSrc, maskedSrc, mask);

  // Preprocess the masked image
  let { processed, debugImages } = preprocessImage(maskedSrc, "adaptive");

  // Display debug images
  //   displayDebugImages(debugImages);

  // Visualize the processed image for debugging
  cv.imshow("processedCanvas", processed);

  // Detect contours in the processed image
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(
    processed,
    contours,
    hierarchy,
    cv.RETR_TREE,
    cv.CHAIN_APPROX_SIMPLE
  );

  // Initialize variable to store the largest contour area (plate)
  let maxArea = 0;
  let maxContour = null; // To store the largest contour (plate)

  // Iterate through the contours to find the one with the maximum area
  for (let i = 0; i < contours.size(); i++) {
    let contour = contours.get(i);
    let area = cv.contourArea(contour);

    if (area > maxArea) {
      maxArea = area;
      maxContour = contour; // Update the largest contour (plate)
    }
  }

  console.log(`Largest Contour Area (Plate): ${maxArea}`);

  // Function to check if a contour touches the plate
  function touchesContour(contour, plateContour, threshold = 0) {
    for (let i = 0; i < contour.rows; i++) {
      let point = contour.data32S.slice(i * 2, i * 2 + 2);
      let x = point[0];
      let y = point[1];

      // Check if the contour point is near the plate's contour
      for (let j = 0; j < plateContour.rows; j++) {
        let platePoint = plateContour.data32S.slice(j * 2, j * 2 + 2);
        let plateX = platePoint[0];
        let plateY = platePoint[1];

        // Calculate the distance between the point and the plate's contour point
        let distance = Math.sqrt(
          Math.pow(x - plateX, 2) + Math.pow(y - plateY, 2)
        );

        // If the distance is less than the threshold, the contour touches the plate
        if (distance < threshold) {
          return true;
        }
      }
    }
    return false;
  }

  // Iterate through the contours to process the ones that are not touching the plate
  for (let i = 0; i < contours.size(); i++) {
    let contour = contours.get(i);
    let area = cv.contourArea(contour);
    console.log(`Contour ${i} area: ${area}`);

    // Skip the plate contour and contours that touch the plate
    if (contour === maxContour || touchesContour(contour, maxContour)) {
      console.log(`Contour ${i} skipped: Touches the plate or is the plate.`);
      continue;
    }

    // Skip if it's too small or large
    if (area <= colonyAreaMin.value || area >= colonyAreaMax.value) {
      console.log(`Contour ${i} skipped: Out of area range.`);
      continue;
    }

    // Approximate the contour to check if it's circular
    let epsilon = 0.02 * cv.arcLength(contour, true); // Approximation accuracy
    let approx = new cv.Mat();
    cv.approxPolyDP(contour, approx, epsilon, true);

    // If the approximation has fewer than 6 vertices, it's likely a circle

    // Draw the contour for visualization
    let color = new cv.Scalar(0, 255, 0); // Green for colonies
    cv.drawContours(
      resizedSrc,
      contours,
      i,
      color,
      2,
      cv.LINE_8,
      hierarchy,
      100
    );
    colonyCount++;
  }

  // Update colony count
  // colonyCountElement.textContent = `Colony Count: ${colonyCount}`;
  displayColonyCount(colonyCount);
  console.log(`Final Colony Count: ${colonyCount}`);

  // Display processed image
  cv.imshow("processedCanvas", resizedSrc);

  // Clean up resources
  src.delete();
  resizedSrc.delete();
  maskedSrc.delete();
  mask.delete();
  processed.delete();
  contours.delete();
  hierarchy.delete();
});

function displayColonyCount(colonyCount) {
  countOnesAuto.innerText = colonyCount % 10; // Ones place
  countTensAuto.innerText = Math.floor((colonyCount % 100) / 10); // Tens place
  countHundredsAuto.innerText = Math.floor(colonyCount / 100); // Hundreds place
}

function createPlateObjectAuto() {
  const form = document.getElementById("plate-object-form");

  // Check form validity first
  if (!form.checkValidity()) {
    form.reportValidity();
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

  originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
  processedCtx.clearRect(0, 0, processedCanvas.width, processedCanvas.height);
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

    // Position the cursor
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;

    // Optional: You can add logic to change cursor appearance based on canvas position
    // For example, change color or size
    if (x > 0 && x < rect.width && y > 0 && y < rect.height) {
      cursor.style.borderColor = "blue"; // Change border color when inside canvas
      cursor.style.display = "block";
    } else {
      cursor.style.borderColor = "black";
      cursor.style.display = "none";
    }
  });

  // Hide cursor when mouse leaves canvas or no image is present
  canvas.addEventListener("mouseleave", () => {
    cursor.style.display = "none";
  });

  // Show cursor when mouse enters canvas and image is present
  canvas.addEventListener("mouseenter", () => {
    if (canvasHasContent()) {
      cursor.style.display = "block";
    } else {
      cursor.style.display = "none";
    }
  });
});
