/* ================= CONFIG ================= */

// const API = window.API || "http://localhost:5000";
// const token = localStorage.getItem("token");

let editingVendorId = null;


/* ================= LOAD VENDORS ================= */

async function loadVendors() {
  try {
    const res = await fetch(API + "/api/vendors", {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Vendor Load Error:", text);
      return;
    }

    const data = await res.json();
    renderVendorList(data);

  } catch (err) {
    console.error("Vendor Load Error:", err);
  }
}


/* ================= OPEN MAIN MODAL ================= */

window.openVendorModal = function () {
  document.getElementById("vendorModal").classList.add("show");
  document.body.classList.add("modal-open");
  loadVendors();
};

window.closeVendorModal = function () {
  document.getElementById("vendorModal").classList.remove("show");
  document.body.classList.remove("modal-open");
};


/* ================= RENDER LIST ================= */

function renderVendorList(list) {
  const container = document.getElementById("vendorListContainer");
  container.innerHTML = "";

  if (!list || !list.length) {
    container.innerHTML =
      `<div class="text-muted fw-semibold">No Vendors Found</div>`;
    return;
  }

  list.forEach(v => {

    const div = document.createElement("div");
    div.className = "vendor-card";

    div.innerHTML = `
      <div style="display:flex; justify-content:space-between;">
        <div>
          <div class="vendor-name">${v.name}</div>
          <div class="vendor-service">${v.service}</div>
          <div class="vendor-info">
            📞 ${v.phone}<br>
            ✉ ${v.email}<br>
            ⭐ Rating: ${v.rating}/5
          </div>
        </div>

        <div class="d-flex gap-2">
          <i class="bi bi-pencil-square text-primary"
             style="cursor:pointer"
             onclick="openVendorForm('${v._id}')"></i>

          <i class="bi bi-trash-fill text-danger"
             style="cursor:pointer"
             onclick="deleteVendor('${v._id}')"></i>
        </div>
      </div>
    `;

    container.appendChild(div);
  });
}


/* ================= OPEN FORM ================= */

window.openVendorForm = async function (id = null) {

  editingVendorId = id;

  document.getElementById("vendorFormModal").classList.add("show");

  if (id) {
    try {
      const res = await fetch(API + "/api/vendors", {
        headers: {
          Authorization: "Bearer " + token
        }
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Vendor Fetch Error:", text);
        return;
      }

      const vendors = await res.json();
      const vendor = vendors.find(v => v._id === id);

      if (!vendor) return;

      document.getElementById("vendorFormTitle").innerText = "Edit Vendor";

      document.getElementById("vendorName").value = vendor.name;
      document.getElementById("vendorService").value = vendor.service;
      document.getElementById("vendorPhone").value = vendor.phone;
      document.getElementById("vendorEmail").value = vendor.email;
      document.getElementById("vendorRating").value = vendor.rating;

    } catch (err) {
      console.error("Open Vendor Form Error:", err);
    }

  } else {
    document.getElementById("vendorFormTitle").innerText = "Add Vendor";
    clearVendorForm();
  }
};


window.closeVendorForm = function () {
  document.getElementById("vendorFormModal").classList.remove("show");
  clearVendorForm();
};


function clearVendorForm() {
  document.getElementById("vendorName").value = "";
  document.getElementById("vendorService").value = "";
  document.getElementById("vendorPhone").value = "";
  document.getElementById("vendorEmail").value = "";
  document.getElementById("vendorRating").value = "";
  editingVendorId = null;
}


/* ================= SAVE ================= */

window.saveVendor = async function () {

  const data = {
    name: document.getElementById("vendorName").value,
    service: document.getElementById("vendorService").value,
    phone: document.getElementById("vendorPhone").value,
    email: document.getElementById("vendorEmail").value,
    rating: document.getElementById("vendorRating").value
  };

  try {

    if (editingVendorId) {

      await fetch(API + "/api/vendors/" + editingVendorId, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(data)
      });

    } else {

      await fetch(API + "/api/vendors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(data)
      });
    }

    closeVendorForm();
    loadVendors();

  } catch (err) {
    console.error("Save Vendor Error:", err);
  }
};


/* ================= DELETE ================= */

window.deleteVendor = async function (id) {

  const ok = confirm("Delete this vendor?");
  if (!ok) return;

  try {

    await fetch(API + "/api/vendors/" + id, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token
      }
    });

    loadVendors();

  } catch (err) {
    console.error("Delete Vendor Error:", err);
  }
};
/* ================= PRINT VENDORS ================= */

window.printVendorList = async function () {
  try {

    const res = await fetch(API + "/api/vendors", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      }
    });

    const vendors = await res.json();

    if (!vendors.length) {
      alert("No vendors to print!");
      return;
    }

    let html = `
      <html>
      <head>
        <title>Approved Vendors</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2 { margin-bottom: 20px; }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background: #f2f2f2;
          }
        </style>
      </head>
      <body>
        <h2>Approved Vendors List</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Service</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
    `;

    vendors.forEach(v => {
      html += `
        <tr>
          <td>${v.name}</td>
          <td>${v.service}</td>
          <td>${v.phone}</td>
          <td>${v.email}</td>
          <td>${v.rating}/5</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    const printWindow = window.open("", "", "width=900,height=700");
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);

  } catch (err) {
    console.error("Print Error:", err);
    alert("Failed to generate PDF");
  }
};