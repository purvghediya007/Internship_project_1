// ===============================
// GLOBAL API CONFIG
// ===============================

const API = "http://localhost:5000";

// Auth header helper
function authHeaders() {
  return {
    Authorization: "Bearer " + localStorage.getItem("token"),
  };
}

// JSON header helper
function jsonHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + localStorage.getItem("token"),
  };
}
