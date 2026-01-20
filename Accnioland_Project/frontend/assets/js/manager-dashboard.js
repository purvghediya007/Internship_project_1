const API = " https://accionland-rvs.onrender.com";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "../login.html";
}

async function loadIssues() {
  try {
    const res = await fetch(API + "/api/issues/all", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch issues");
    }

    const issues = await res.json();
    renderIssues(issues);
  } catch (err) {
    document.getElementById("issuesContainer").innerHTML =
      `<p class="text-danger">Error loading issues</p>`;
    console.error(err);
  }
}

function renderIssues(issues) {
  const container = document.getElementById("issuesContainer");
  container.innerHTML = "";

  if (!issues.length) {
    container.innerHTML = `<p class="text-muted">No issues reported yet.</p>`;
    return;
  }

  issues.forEach(issue => {
    const div = document.createElement("div");
    div.className = "card mb-3";

    div.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">
          Floor ${issue.floorNumber} | Office ${issue.officeNumber}
        </h5>
        <p class="card-text">
          Reported by: ${issue.reportedBy?.email || "Office Worker"}
        </p>
        <a href="issue-details.html?id=${issue._id}" class="btn btn-sm btn-primary">
          View Details
        </a>
      </div>
    `;

    container.appendChild(div);
  });
}

// Load on page open
loadIssues();
