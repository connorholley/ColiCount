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
    // Set canvas size to the image size
    originalCanvas.width = imgElement.width;
    originalCanvas.height = imgElement.height;
    // Draw the original image on the canvas
    originalCtx.drawImage(imgElement, 0, 0);
  };

  // Process the image when the button is clicked
  processButton.addEventListener("click", () => {
    if (!imgElement.src) {
      alert("Please upload an image first.");
      return;
    }

    // Convert the canvas to OpenCV Mat
    const src = cv.imread(originalCanvas);
    const gray = new cv.Mat();
    const blurred = new cv.Mat();
    const binary = new cv.Mat();

    try {
      // Convert to grayscale
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

      // Apply Gaussian Blur to reduce noise
      cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

      // Apply adaptive thresholding (more flexible for varying lighting)
      cv.adaptiveThreshold(
        blurred,
        binary,
        255,
        cv.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv.THRESH_BINARY,
        11,
        2
      );

      // Apply morphological operations (to remove small noise and fill gaps)
      const kernel = cv.Mat.ones(3, 3, cv.CV_8U);
      cv.morphologyEx(binary, binary, cv.MORPH_CLOSE, kernel); // Closing operation to join broken colonies
      cv.morphologyEx(binary, binary, cv.MORPH_OPEN, kernel); // Opening operation to remove small noise

      // Find contours and hierarchy
      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();
      cv.findContours(
        binary,
        contours,
        hierarchy,
        cv.RETR_CCOMP, // Use CCOMP retrieval mode to find both external and internal contours
        cv.CHAIN_APPROX_SIMPLE
      );

      // Convert the grayscale image to BGR to allow color drawing
      const colorImg = new cv.Mat();
      cv.cvtColor(src, colorImg, cv.COLOR_RGBA2BGR);

      // Filter contours based on area and shape
      const minArea = 5; // Minimum area threshold for colonies

      // Loop through the contours and filter out the plate contour (largest external contour)
      for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        const area = cv.contourArea(contour);

        // Get the hierarchy for the current contour
        const h = hierarchy.data32S;
        const parentContourIndex = h[i * 4 + 3]; // Index of parent contour

        // Skip external contours (the plate) by checking if it has no parent (i.e., it is a root contour)
        if (parentContourIndex === -1) {
          continue; // Skip the plate contour
        }

        // Filter based on area (this will help exclude noise or small irrelevant contours)
        if (area > minArea) {
          // Optional: further shape filtering (e.g., circularity)
          const perimeter = cv.arcLength(contour, true);
          const circularity = (4 * Math.PI * area) / (perimeter * perimeter);

          // Only count circular contours (representing colonies)
          if (circularity > 0.1) {
            colonyCount++; // Increment if the contour looks like a colony

            const color = new cv.Scalar(0, 255, 0); // Green color for shading (in BGR)
            cv.drawContours(
              colorImg, // Drawing on the converted BGR image
              contours,
              i,
              color,
              cv.FILLED, // Use cv.FILLED to fill the contour area
              cv.LINE_8,
              hierarchy,
              100
            );
          }
        }
      }

      // Display the original image (already on the originalCanvas)
      cv.imshow(originalCanvas, src);

      // Display the processed image (on the processedCanvas)
      cv.imshow(processedCanvas, colorImg);

      // Update the colony count on the HTML page
      displayColonyCount(colonyCount);

      // Release allocated memory for contours, hierarchy, and color image
      contours.delete();
      hierarchy.delete();
      colorImg.delete();
    } catch (error) {
      console.error("Error during image processing:", error);
    } finally {
      // Ensure all matrices are deleted in the `finally` block
      src.delete();
      gray.delete();
      blurred.delete();
      binary.delete();
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
