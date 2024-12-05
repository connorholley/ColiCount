let colonyCount = 0;
let countOnesAuto = document.getElementById("count-ones-auto");
let countTensAuto = document.getElementById("count-tens-auto");
let countHundredsAuto = document.getElementById("count-hundreds-auto");

let imageInput = document.getElementById("image-input");
let originalCanvas = document.getElementById("originalCanvas");
let processedCanvas = document.getElementById("processedCanvas");
let originalCtx = originalCanvas.getContext("2d");
let processedCtx = processedCanvas.getContext("2d");

document.addEventListener("DOMContentLoaded", () => {
  const processButton = document.getElementById("processButton");
  let imgElement = new Image();

  // Handle file input change
  imageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];

    // Reset colony count and clear processed canvas
    colonyCount = 0;
    processedCtx.clearRect(0, 0, processedCanvas.width, processedCanvas.height);

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imgElement.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // When the image loads, draw it on the original canvas
  imgElement.onload = () => {
    originalCanvas.width = imgElement.width;
    originalCanvas.height = imgElement.height;
    originalCtx.drawImage(imgElement, 0, 0);
  };

  // Process the image when the button is clicked
  processButton.addEventListener("click", () => {
    if (!imgElement.src) {
      alert("Please upload an image first.");
      return;
    }

    // Reset colony count before processing
    colonyCount = 0;

    // Create OpenCV matrices to manage image processing
    const matrices = {
      src: cv.imread(originalCanvas),
      gray: new cv.Mat(),
      blurred: new cv.Mat(),
      binary: new cv.Mat(),
      colorImg: new cv.Mat(),
      contours: new cv.MatVector(),
      hierarchy: new cv.Mat(),
    };

    try {
      // Image preprocessing steps
      cv.cvtColor(matrices.src, matrices.gray, cv.COLOR_RGBA2GRAY);
      cv.GaussianBlur(matrices.gray, matrices.blurred, new cv.Size(5, 5), 0);
      cv.adaptiveThreshold(
        matrices.blurred,
        matrices.binary,
        255,
        cv.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv.THRESH_BINARY,
        11,
        2
      );

      // Morphological operations to reduce noise
      const kernel = cv.Mat.ones(3, 3, cv.CV_8U);
      cv.morphologyEx(matrices.binary, matrices.binary, cv.MORPH_CLOSE, kernel);
      cv.morphologyEx(matrices.binary, matrices.binary, cv.MORPH_OPEN, kernel);

      // Find contours
      cv.findContours(
        matrices.binary,
        matrices.contours,
        matrices.hierarchy,
        cv.RETR_CCOMP,
        cv.CHAIN_APPROX_SIMPLE
      );

      // Prepare color image for drawing
      cv.cvtColor(matrices.src, matrices.colorImg, cv.COLOR_RGBA2BGR);

      // Colony detection parameters
      const MIN_AREA = 5;
      const MIN_CIRCULARITY = 0.1;

      // Detect and mark colonies
      for (let i = 0; i < matrices.contours.size(); i++) {
        const contour = matrices.contours.get(i);
        const area = cv.contourArea(contour);

        // Get the hierarchy for the current contour
        const h = matrices.hierarchy.data32S;
        const parentContourIndex = h[i * 4 + 3];

        // Skip external contours (plate)
        if (parentContourIndex === -1) continue;

        // Filter contours based on area
        if (area > MIN_AREA) {
          const perimeter = cv.arcLength(contour, true);
          const circularity = (4 * Math.PI * area) / (perimeter * perimeter);

          // Count and mark colonies
          if (circularity > MIN_CIRCULARITY) {
            colonyCount++;

            cv.drawContours(
              matrices.colorImg,
              matrices.contours,
              i,
              new cv.Scalar(0, 255, 0), // Green color
              cv.FILLED,
              cv.LINE_8,
              matrices.hierarchy,
              100
            );
          }
        }
      }

      // Display processed images
      cv.imshow(originalCanvas, matrices.src);
      cv.imshow(processedCanvas, matrices.colorImg);

      // Update colony count display
      displayColonyCount(colonyCount);
    } catch (error) {
      console.error("Error during image processing:", error);
      alert("An error occurred during image processing.");
    } finally {
      // Safely delete all matrices
      Object.values(matrices).forEach((matrix) => {
        if (matrix && typeof matrix.delete === "function") {
          matrix.delete();
        }
      });
    }
  });
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
      eId.value,
      colonyCount
    );

    alert(`Plate Object Created Successfully!
    
      Scientific Name: ${sciName.value}
      Temperature: ${temp.value}
      Pressure: ${pressure.value}
      Duration: ${duration.value}
      Nutrition: ${nutrition.value}
      Experiment ID: ${eId.value}`);

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
  eId.value = null;
  imageInput.value = null;
  colonyCount = 0;

  originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
  processedCtx.clearRect(0, 0, processedCanvas.width, processedCanvas.height);
}
