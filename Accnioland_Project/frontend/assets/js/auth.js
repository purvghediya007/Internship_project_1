// ===============================
// AUTH LOGIC (LOGIN & REGISTER)
// ===============================

// ---------- LOGIN ----------
async function handleLogin() {
  const userType = document.getElementById("userType").value;
  const password = document.getElementById("password").value;

  if (!password) {
    alert("Password is required");
    return;
  }

  const body = { userType, password };

  if (userType === "manager") {
    const email = document.getElementById("email").value;
    if (!email) {
      alert("Email is required for manager login");
      return;
    }
    body.email = email;
  } else {
    const floor = document.getElementById("floor").value;
    if (!floor) {
      alert("Floor number is required for office worker");
      return;
    }
    body.floorNumber = Number(floor);
  }

  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    // // Save session
    // localStorage.setItem("token", data.token);
    // localStorage.setItem("userType", userType);
    // Decode JWT payload
const payload = JSON.parse(atob(data.token.split(".")[1]));

// Save session
localStorage.setItem("token", data.token);
localStorage.setItem("userType", payload.userType);

// ✅ THESE FIX THE NULL ISSUE
localStorage.setItem("floorNumber", payload.floorNumber);
localStorage.setItem("officeNumber", payload.officeNumber);


    // index.html will handle redirect
    window.location.href = "../index.html";
  } catch (err) {
    console.error(err);
    alert("Server error during login");
  }
}

// ---------- REGISTER ----------
async function handleRegister() {
  const userType = document.getElementById("userType").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  if (!email || !password) {
    alert("Email and password are required");
    return;
  }

  const body = {
    userType,
    email,
    password,
  };

  if (userType === "office_worker") {
    const floor = document.getElementById("regFloor").value;
    const office = document.getElementById("regOffice").value;

    if (!floor || !office) {
      alert("Floor and office number are required for office worker");
      return;
    }

    body.floorNumber = Number(floor);
    body.officeNumber = Number(office);
  }

  try {
    const res = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Registration failed");
      return;
    }

    alert("Registration successful. Please login.");
    window.location.href = "login.html";
  } catch (err) {
    console.error(err);
    alert("Server error during registration");
  }
}
