const JustValidate = require("just-validate"); // Or use import if you're using ES Modules

const validation = new JustValidate("#plate-object-form");

// Add validation rules for each field
validation
  .addField("#scientific-name", [
    { rule: "required", errorMessage: "Scientific Name is required" },
    {
      rule: "minLength",
      value: 3,
      errorMessage: "Scientific Name must be at least 3 characters long",
    },
  ])
  .addField("#temperature", [
    { rule: "required", errorMessage: "Temperature is required" },
    { rule: "number", errorMessage: "Temperature must be a valid number" },
    { rule: "min", value: 0, errorMessage: "Temperature cannot be negative" },
  ])
  .addField("#pressure", [
    { rule: "required", errorMessage: "Pressure is required" },
    { rule: "number", errorMessage: "Pressure must be a valid number" },
    { rule: "min", value: 0, errorMessage: "Pressure cannot be negative" },
  ])
  .addField("#duration", [
    { rule: "required", errorMessage: "Duration is required" },
    { rule: "number", errorMessage: "Duration must be a valid number" },
    { rule: "min", value: 1, errorMessage: "Duration must be at least 1 day" },
  ])
  .addField("#nutrition", [
    { rule: "required", errorMessage: "Nutrition selection is required" },
  ])
  .addField("#user-id", [
    { rule: "required", errorMessage: "user ID is required" },
    { rule: "number", errorMessage: "user ID must be a valid number" },
    { rule: "min", value: 1, errorMessage: "user ID must be at least 1" },
  ]);

// Optionally, handle form submission only when the form is valid
document
  .getElementById("plate-object-form")
  .addEventListener("submit", function (event) {
    const isValid = validation.isValid();
    if (!isValid) {
      event.preventDefault();
    } else {
      alert("Form is valid and ready to submit!");
    }
  });
