"use strict";

const USERS_KEY = "skycast_users";

const CURRENT_USER_KEY = "skycast_current_user";

// =====================================
// GET USERS
// =====================================

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

// =====================================
// SAVE USERS
// =====================================

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// =====================================
// SIGNUP
// =====================================

const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("signupName").value.trim();

    const email = document
      .getElementById("signupEmail")
      .value.trim()
      .toLowerCase();

    const password = document.getElementById("signupPassword").value;

    const confirmPassword = document.getElementById("confirmPassword").value;

    const message = document.getElementById("signupMessage");

    if (password.length < 6) {
      message.textContent = "Password must be at least 6 characters.";

      return;
    }

    if (password !== confirmPassword) {
      message.textContent = "Passwords do not match.";

      return;
    }

    const users = getUsers();

    const existingUser = users.find((user) => user.email === email);

    if (existingUser) {
      message.textContent = "An account with this email already exists.";

      return;
    }

    const newUser = {
      id: Date.now(),

      name,

      email,

      password,

      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    saveUsers(users);

    message.style.color = "#16a34a";

    message.textContent = "Account created successfully!";

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1200);
  });
}

// =====================================
// LOGIN
// =====================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document
      .getElementById("loginEmail")
      .value.trim()
      .toLowerCase();

    const password = document.getElementById("loginPassword").value;

    const message = document.getElementById("loginMessage");

    const users = getUsers();

    const user = users.find(
      (item) => item.email === email && item.password === password,
    );

    if (!user) {
      message.textContent = "Invalid email or password.";

      return;
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    window.location.href = "index.html";
  });
}

// =====================================
// PASSWORD SHOW/HIDE
// =====================================

document.querySelectorAll(".toggle-password").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.target);

    if (target.type === "password") {
      target.type = "text";

      button.textContent = "🙈";
    } else {
      target.type = "password";

      button.textContent = "👁";
    }
  });
});
