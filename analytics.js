let countOnes = document.getElementById("count-ones");
let countTens = document.getElementById("count-tens");
let countHundreds = document.getElementById("count-hundreds");

let sciName = document.getElementById("scientific-name");
let temp = document.getElementById("temperature");
let pressure = document.getElementById("pressure");
let duration = document.getElementById("duration");
let nutrition = document.getElementById("nutrition");

let count = 0;
let ones = 0;
let tens = 0;
let hundreds = 0;

isLoggedIn();

function increment() {
  count = count + 1;
  if (count % 100 === 0) {
    hundreds += 1;
    tens = 0;
    ones = 0;
  }
  if (count % 10 === 0 && count % 100 != 0) {
    tens += 1;
    ones = 0;
  }
  if (count % 10 != 0 && count % 100 != 0) {
    ones += 1;
  }
  countOnes.innerText = ones;
  countTens.innerText = tens;
  countHundreds.innerText = hundreds;
  placeColiform();
}

function createPlateObject() {
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
      count
    );

    alert(`Plate Object Created Successfully!
    
      Scientific Name: ${sciName.value}
      Temperature: ${temp.value}
      Pressure: ${pressure.value}
      Duration: ${duration.value}
      Nutrition: ${nutrition.value}
      `);

    // Clear form and reset elements

    clearAgar();
    initializeAgar();
    clearFormAndNumbers();
  } catch (error) {
    // If an error occurs during writeData or subsequent processes
    console.error("Error creating plate object:", error);
    alert(`Error creating plate object: ${error.message}`);
  }
}

function clearFormAndNumbers() {
  count = 0;
  ones = 0;
  tens = 0;
  hundreds = 0;

  countOnes.innerText = 0;
  countTens.innerText = 0;
  countHundreds.innerText = 0;

  sciName.value = null;
  temp.value = null;
  pressure.value = null;
  duration.value = null;
  nutrition.value = null;
}
