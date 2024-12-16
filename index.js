async function verifyUser(username, password) {
  try {
    // First, fetch the user by username
    const users = await getUser(username);

    // Check if any users were found
    if (users.length === 0) {
      console.log("No user found with that username");
      return false;
    }

    // Assuming the first result is the user (if usernames are unique)
    const user = users[0];
    // Compare the provided password with the stored password
    // Note: In a real-world scenario, you'd use password hashing!
    if (user.pass === password) {
      console.log("Correct Password");
      return user;
    } else {
      console.log("Incorrect password");
      return false;
    }
  } catch (error) {
    console.error("Error verifying user:", error);
    return false;
  }
}

// Example of how you might use this in an event handler
async function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;
  const loginError = document.getElementById("loginError");

  const result = await verifyUser(username, password);

  if (result) {
    loginError.textContent = "";
    logIn(username, password);
    alert("Login Successful!");
  } else {
    loginError.textContent = "Invalid username or password";
  }
}

async function handleCreateUser(event) {
  event.preventDefault();
  const new_username = document.getElementById("newUsername").value;
  const new_password = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const createError = document.getElementById("createError");
  const form = document.getElementById("create-user");

  if (new_password !== confirmPassword) {
    createError.textContent = "Passwords do not match";
    return;
  }

  const users = await getUser(new_username);
  console.log(users);

  // Check if any users were found
  if (users.length > 0) {
    createError.textContent = "Username already exists";
    return;
  } else {
    createError.textContent = "";

    if (!form.checkValidity()) {
      form.reportValidity();
      return false;
    }
    await createUser(new_username, new_password);
    alert("Account Created Successfully!");
    switchToLogin();
  }
}
function switchToCreateUser() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("createUserForm").style.display = "block";
}

function switchToLogin() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("createUserForm").style.display = "none";
}
