"use strict";

const CURRENT_USER_KEY = "skycast_current_user";

const USERS_KEY = "skycast_users";

let currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));

if (!currentUser) {
  window.location.href = "login.html";
}

/* ===============================
   DOM
================================ */

const profileName = document.getElementById("profileName");

const profileEmail = document.getElementById("profileEmail");

const largeAvatar = document.getElementById("largeAvatar");

const editName = document.getElementById("editName");

const editEmail = document.getElementById("editEmail");

const editBio = document.getElementById("editBio");

const profileForm = document.getElementById("profileForm");

const profileLogout = document.getElementById("profileLogout");

const deleteDataBtn = document.getElementById("deleteDataBtn");

const deleteAccountBtn = document.getElementById("deleteAccountBtn");

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

  largeAvatar.textContent = name.charAt(0).toUpperCase();
}

/* ===============================
   SAVE PROFILE
================================ */

profileForm.addEventListener("submit", function (event) {
  event.preventDefault();

  currentUser.name = editName.value.trim();

  currentUser.email = editEmail.value.trim();

  currentUser.bio = editBio.value.trim();

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

  profileName.textContent = currentUser.name;

  profileEmail.textContent = currentUser.email;

  largeAvatar.textContent = currentUser.name.charAt(0).toUpperCase();

  alert("Profile updated successfully!");
});

/* ===============================
   DELETE SAVED DATA
================================ */

deleteDataBtn.addEventListener("click", function () {
  if (confirm("Delete your saved cities and last weather data?")) {
    localStorage.removeItem(`skycast_favorites_${currentUser.id}`);

    localStorage.removeItem("skycast_last_city");

    alert("Saved data deleted successfully!");
  }
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

loadProfile();
