const API = " https://accionland-rvs.onrender.com";

async function loadIssueDetails() {
  const params = new URLSearchParams(window.location.search);
  const issueId = params.get("id");

  if (!issueId) {
    alert("Invalid Issue ID");
    return;
  }

  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/api/issues/${issueId}`, {
    headers: {
      Authorization: "Bearer " + token
    }
  });

  if (!res.ok) {
    alert("Failed to load issue");
    return;
  }

  const issue = await res.json();

  // Basic info
  document.getElementById("issueStatus").innerText = issue.status;
  document.getElementById("issueFloor").innerText = issue.floorNumber;
  document.getElementById("issueOffice").innerText = issue.officeNumber;

  // PDFs
  document.getElementById("basePdf").src = issue.baseFloorPlan;
  document.getElementById("markedPdf").src = issue.markedFloorPlan;

  // Structure problems
  const container = document.getElementById("structureProblems");
  container.innerHTML = "";

  issue.structureProblems.forEach(problem => {
    container.innerHTML += `
      <div class="border rounded p-3 mb-3">
        <div class="d-flex justify-content-between">
          <strong>${problem.structureType} - ${problem.direction}</strong>
          <span class="badge bg-danger">${problem.riskLevel}</span>
        </div>
        <p class="mb-1">${problem.description}</p>
        <small class="text-muted">${problem.issueType}</small>
      </div>
    `;
  });
}

document.addEventListener("DOMContentLoaded", loadIssueDetails);
