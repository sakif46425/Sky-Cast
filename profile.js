"use strict";

/* ===============================
   STORAGE
================================ */

const CURRENT_USER_KEY = "skycast_current_user";

const USERS_KEY = "skycast_users";

const THEME_KEY = "skycast_theme";

/* ===============================
   USER
================================ */

let currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));

if (!currentUser) {
  window.location.href = "login.html";
}

/* ===============================
   DOM
================================ */

const profileName = document.getElementById("profileName");

const profileEmail = document.getElementById("profileEmail");

const profileImage = document.getElementById("profileImage");

const avatarInitial = document.getElementById("avatarInitial");

const profileImageInput = document.getElementById("profileImageInput");

const removeImageBtn = document.getElementById("removeImageBtn");

const editName = document.getElementById("editName");

const editEmail = document.getElementById("editEmail");

const editBio = document.getElementById("editBio");

const profileForm = document.getElementById("profileForm");

const profileLogout = document.getElementById("profileLogout");

const deleteDataBtn = document.getElementById("deleteDataBtn");

const deleteAccountBtn = document.getElementById("deleteAccountBtn");

const themeBtn = document.getElementById("themeBtn");

/* ===============================
   LOAD PROFILE
================================ */

function loadProfile() {
  const name = currentUser.name || "User";

  const email = currentUser.email || "";

  profileName.textContent = name;

  profileEmail.textContent = email;

  editName.value = name;

  editEmail.value = email;

  editBio.value = currentUser.bio || "";

  if (currentUser.profileImage) {
    profileImage.src = currentUser.profileImage;

    profileImage.style.display = "block";

    avatarInitial.style.display = "none";
  } else {
    profileImage.style.display = "none";

    avatarInitial.style.display = "block";

    avatarInitial.textContent = name.charAt(0).toUpperCase();
  }
}

loadProfile();

/* ===============================
   SAVE USER
================================ */

function saveCurrentUser() {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

  let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

  const index = users.findIndex((user) => user.id === currentUser.id);

  if (index !== -1) {
    users[index] = currentUser;

    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}

/* ===============================
   UPLOAD IMAGE
================================ */

profileImageInput.addEventListener("change", function (event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("Please select a valid image.");

    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    currentUser.profileImage = reader.result;

    profileImage.src = reader.result;

    profileImage.style.display = "block";

    avatarInitial.style.display = "none";

    saveCurrentUser();

    alert("Profile image updated successfully!");
  };

  reader.readAsDataURL(file);
});

/* ===============================
   REMOVE IMAGE
================================ */

removeImageBtn.addEventListener("click", function () {
  if (!currentUser.profileImage) {
    alert("No profile image to remove.");

    return;
  }

  if (!confirm("Remove your profile image?")) {
    return;
  }

  delete currentUser.profileImage;

  profileImage.src = "";

  profileImage.style.display = "none";

  avatarInitial.style.display = "block";

  avatarInitial.textContent = currentUser.name.charAt(0).toUpperCase();

  profileImageInput.value = "";

  saveCurrentUser();

  alert("Profile image removed successfully!");
});

/* ===============================
   SAVE PROFILE
================================ */

profileForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = editName.value.trim();

  const email = editEmail.value.trim();

  if (name === "" || email === "") {
    alert("Name and email are required.");

    return;
  }

  currentUser.name = name;

  currentUser.email = email;

  currentUser.bio = editBio.value.trim();

  saveCurrentUser();

  profileName.textContent = name;

  profileEmail.textContent = email;

  avatarInitial.textContent = name.charAt(0).toUpperCase();

  alert("Profile updated successfully!");
});

/* ===============================
   DELETE SAVED DATA
================================ */

deleteDataBtn.addEventListener("click", function () {
  if (!confirm("Delete your saved cities and weather data?")) {
    return;
  }

  localStorage.removeItem(`skycast_favorites_${currentUser.id}`);

  localStorage.removeItem("skycast_last_city");

  alert("Saved data deleted successfully!");
});

/* ===============================
   DELETE ACCOUNT
================================ */

deleteAccountBtn.addEventListener("click", function () {
  if (!confirm("Are you sure you want to permanently delete your account?")) {
    return;
  }

  let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

  users = users.filter((user) => user.id !== currentUser.id);

  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  localStorage.removeItem(CURRENT_USER_KEY);

  localStorage.removeItem(`skycast_favorites_${currentUser.id}`);

  localStorage.removeItem("skycast_last_city");

  alert("Account deleted successfully!");

  window.location.href = "signup.html";
});

/* ===============================
   LOGOUT
================================ */

profileLogout.addEventListener("click", function () {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem(CURRENT_USER_KEY);

    window.location.href = "login.html";
  }
});

/* ===============================
   DARK LIGHT MODE
================================ */

function applyTheme() {
  const theme = localStorage.getItem(THEME_KEY);

  if (theme === "dark") {
    document.body.classList.add("dark-mode");

    themeBtn.textContent = "☀️";
  } else {
    document.body.classList.remove("dark-mode");

    themeBtn.textContent = "🌙";
  }
}

applyTheme();

themeBtn.addEventListener("click", function () {
  const isDark = document.body.classList.toggle("dark-mode");

  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");

  themeBtn.textContent = isDark ? "☀️" : "🌙";
});
