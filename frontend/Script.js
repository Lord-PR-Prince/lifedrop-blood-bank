const stock = [
  ["O+", "18"],
  ["O-", "4"],
  ["A+", "12"],
  ["A-", "3"],
  ["B+", "9"],
  ["B-", "2"],
  ["AB+", "5"],
  ["AB-", "1"]
];

const centres = [
  {
    name: "District Hospital Blood Centre",
    city: "Gurugram, Haryana",
    address: "Civil Hospital Road, Sector 10, Gurugram, Haryana",
    phone: "+91 00000 00000",
    groups: "O+, A+, B+, AB+",
    map: "https://www.google.com/maps/search/?api=1&query=Civil+Hospital+Road+Sector+10+Gurugram+Haryana"
  },
  {
    name: "Fortis Memorial Research Institute Blood Centre",
    city: "Gurugram, Haryana",
    address: "Sector 44, Gurugram, Haryana",
    phone: "+91 00000 00000",
    groups: "O+, O-, A+, B+",
    map: "https://www.google.com/maps/search/?api=1&query=Fortis+Memorial+Research+Institute+Gurugram"
  },
  {
    name: "Safdarjung Hospital Blood Centre",
    city: "New Delhi",
    address: "Ansari Nagar, New Delhi, Delhi",
    phone: "+91 00000 00000",
    groups: "A+, B+, O+, O-",
    map: "https://www.google.com/maps/search/?api=1&query=Safdarjung+Hospital+New+Delhi"
  }
];

document.addEventListener("DOMContentLoaded", () => {

  const stockBox = document.getElementById("stock");

  if (stockBox) {
    stockBox.innerHTML = stock.map(item => `
      <div class="card">
        <div class="group">${item[0]}</div>
        <div class="units">${item[1]} units</div>
        <div class="available">● Available</div>
      </div>
    `).join("");
  }

  showDonors();
  showRequests();

  const user = localStorage.getItem("lifedropUser");

  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      showDashboard(parsedUser.name || "User");
    } catch (error) {
      console.error("Invalid stored user.");
    }
  }

  const modal = document.getElementById("modal");

  if (modal) {
    modal.addEventListener("click", event => {
      if (event.target.id === "modal") {
        closeModal();
      }
    });
  }
});


function go(id) {
  const element = document.getElementById(id);

  if (element) {
    element.scrollIntoView({
      behavior: "smooth"
    });
  }
}


function toggleMenu() {
  const menu = document.getElementById("mobileMenu");

  if (menu) {
    menu.classList.toggle("open");
  }
}


function isLoggedIn() {
  return !!localStorage.getItem("lifedropUser");
}


function requireAuth(type) {

  if (!isLoggedIn()) {
    window.location.href = "/signup.html";
    return;
  }

  openModal(type);
}


function showDashboard(name = "User") {

  const dashboard = document.getElementById("dashboard");

  if (!dashboard) {
    return;
  }

  dashboard.style.display = "block";

  const hero = document.querySelector(".hero");

  if (hero) {
    hero.style.display = "none";
  }

  document
    .querySelectorAll("main#home > section:not(#dashboard)")
    .forEach(section => {
      section.style.display = "none";
    });

  const welcomeUser = document.getElementById("welcomeUser");

  if (welcomeUser) {
    welcomeUser.textContent =
      "Welcome, " +
      name +
      ". Find blood, hospital details, address, location and request blood from one dashboard.";
  }

  go("dashboard");

  showBloodResults();
}


function showBloodResults() {

  const box = document.getElementById("bloodResults");

  if (!box) {
    return;
  }

  box.innerHTML = `
    <div class="card">
      <h3>Blood centres & hospitals</h3>

      <p style="color:var(--muted)">
        Demo location data for the mini project.
        Confirm stock by phone before travelling.
      </p>

      ${centres.map(centre => `
        <div class="card" style="margin-top:12px">

          <h3>${centre.name}</h3>

          <p>
            <b>Blood groups:</b>
            ${centre.groups}
          </p>

          <p>
            <b>City:</b>
            ${centre.city}
          </p>

          <p>
            <b>Address:</b>
            ${centre.address}
          </p>

          <p>
            <b>Contact:</b>
            ${centre.phone}
          </p>

          <a
            class="btn"
            href="${centre.map}"
            target="_blank"
            rel="noopener"
          >
            📍 Open Location
          </a>

        </div>
      `).join("")}

    </div>
  `;
}


function logoutUser() {

  localStorage.removeItem("lifedropUser");

  const dashboard = document.getElementById("dashboard");

  if (dashboard) {
    dashboard.style.display = "none";
  }

  const hero = document.querySelector(".hero");

  if (hero) {
    hero.style.display = "grid";
  }

  document
    .querySelectorAll("main#home > section:not(#dashboard)")
    .forEach(section => {
      section.style.display = "block";
    });

  alert("Logged out.");

  go("home");
}


async function showDonors() {

  const box = document.getElementById("donorList");

  if (!box) {
    return;
  }

  try {

    const response = await fetch("/api/donors");

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to load donors."
      );
    }

    const donors = data.donors || [];

    if (!donors.length) {

      box.innerHTML = `
        <div class="card">
          <p style="color:var(--muted)">
            No donor registrations saved yet.
            Click "Become a Donor" and submit the form.
          </p>
        </div>
      `;

      return;
    }

    box.innerHTML = `
      <div class="grid">

        ${donors.map(donor => `
          <div class="card">

            <div class="group">
              ${escapeHtml(donor.name)}
            </div>

            <p>
              <b>Blood group:</b>
              ${escapeHtml(donor.bloodGroup)}
            </p>

            <p>
              <b>Phone:</b>
              ${escapeHtml(donor.phone)}
            </p>

            <p>
              <b>Email:</b>
              ${escapeHtml(donor.email)}
            </p>

            <p>
              <b>City:</b>
              ${escapeHtml(donor.city)}
            </p>

            <button
              class="btn"
              onclick="deleteDonor('${donor._id}')"
            >
              Delete
            </button>

          </div>
        `).join("")}

      </div>
    `;

  } catch (error) {

    box.innerHTML = `
      <div class="card">
        <p style="color:var(--muted)">
          ${escapeHtml(error.message)}
        </p>
      </div>
    `;
  }
}


async function saveDonor(donor) {

  const response = await fetch("/api/donors", {
    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify(donor)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to save donor."
    );
  }

  await showDonors();

  return data.donor;
}


async function deleteDonor(id) {

  try {

    const response = await fetch(
      "/api/donors/" + encodeURIComponent(id),
      {
        method: "DELETE"
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to delete donor."
      );
    }

    await showDonors();

  } catch (error) {

    alert(error.message);
  }
}


async function showRequests() {

  const box = document.getElementById("requestList");

  if (!box) {
    return;
  }

  try {

    const response = await fetch("/api/requests");

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to load requests."
      );
    }

    const requests = data.requests || [];

    if (!requests.length) {

      box.innerHTML = `
        <div class="card">
          <p style="color:var(--muted)">
            No blood requests saved yet.
          </p>
        </div>
      `;

      return;
    }

    box.innerHTML = `
      <div class="grid">

        ${requests.map(request => `
          <div class="card">

            <div class="group">
              ${escapeHtml(request.patientName)}
            </div>

            <p>
              <b>Blood group:</b>
              ${escapeHtml(request.bloodGroup)}
            </p>

            <p>
              <b>Units:</b>
              ${escapeHtml(String(request.units))}
            </p>

            <p>
              <b>Hospital:</b>
              ${escapeHtml(request.hospital)}
            </p>

            <p>
              <b>Contact:</b>
              ${escapeHtml(request.contact)}
            </p>

            <p>
              <b>Address:</b>
              ${escapeHtml(request.address)}
            </p>

            <button
              class="btn"
              onclick="deleteRequest('${request._id}')"
            >
              Delete
            </button>

          </div>
        `).join("")}

      </div>
    `;

  } catch (error) {

    box.innerHTML = `
      <div class="card">
        <p style="color:var(--muted)">
          ${escapeHtml(error.message)}
        </p>
      </div>
    `;
  }
}


async function saveRequest(request) {

  const response = await fetch("/api/requests", {
    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify(request)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to save request."
    );
  }

  await showRequests();

  return data.request;
}


async function deleteRequest(id) {

  try {

    const response = await fetch(
      "/api/requests/" + encodeURIComponent(id),
      {
        method: "DELETE"
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to delete request."
      );
    }

    await showRequests();

  } catch (error) {

    alert(error.message);
  }
}


function openModal(type) {

  const titles = {
    donor: "Become a Donor",
    request: "Request Blood",
    login: "Login",
    signup: "Create Account"
  };

  const title =
    titles[type] || "Blood Bank";

  document.getElementById("modalTitle").textContent = title;

  const form =
    document.querySelector("#modal form");

  if (!form) {
    return;
  }


  if (type === "signup") {

    form.innerHTML = `
      <input
        required
        placeholder="Full name"
      >

      <input
        required
        type="email"
        placeholder="Email address"
      >

      <input
        required
        type="password"
        minlength="6"
        placeholder="Password"
      >

      <input
        required
        type="password"
        minlength="6"
        placeholder="Confirm password"
      >

      <button
        class="btn primary"
        type="submit"
      >
        Send OTP
      </button>

      <small style="color:var(--muted)">
        Real OTP verification is handled by your
        Node.js/Express backend.
      </small>
    `;

  }


  else if (type === "login") {

    form.innerHTML = `
      <input
        id="loginEmail"
        required
        type="email"
        placeholder="Email"
      >

      <input
        required
        type="password"
        placeholder="Password"
      >

      <button
        class="btn primary"
        type="submit"
      >
        Login
      </button>
    `;

  }


  else if (type === "request") {

    form.innerHTML = `
      <input
        required
        placeholder="Patient name"
      >

      <div class="row">

        <select required>
          <option value="">Blood group</option>
          <option>O+</option>
          <option>O-</option>
          <option>A+</option>
          <option>A-</option>
          <option>B+</option>
          <option>B-</option>
          <option>AB+</option>
          <option>AB-</option>
        </select>

        <input
          required
          type="number"
          min="1"
          placeholder="Units required"
        >

      </div>

      <input
        required
        placeholder="Hospital name"
      >

      <input
        required
        placeholder="Contact number"
      >

      <input
        required
        placeholder="Hospital address"
      >

      <button
        class="btn primary"
        type="submit"
      >
        Submit Request
      </button>
    `;

  }


  else {

    form.innerHTML = `
      <div class="row">

        <input
          required
          placeholder="Full name"
        >

        <input
          required
          placeholder="Phone number"
        >

      </div>

      <div class="row">

        <select required>
          <option value="">Blood group</option>
          <option>O+</option>
          <option>O-</option>
          <option>A+</option>
          <option>A-</option>
          <option>B+</option>
          <option>B-</option>
          <option>AB+</option>
          <option>AB-</option>
        </select>

        <input
          required
          placeholder="City"
        >

      </div>

      <input
        required
        type="email"
        placeholder="Email"
      >

      <button
        class="btn primary"
        type="submit"
      >
        Register
      </button>
    `;
  }


  document
    .getElementById("modal")
    .classList.add("open");
}


function closeModal() {

  document
    .getElementById("modal")
    .classList.remove("open");
}


async function submitForm(event) {

  event.preventDefault();

  const title =
    document.getElementById("modalTitle").textContent;


  // LOGIN
  if (title === "Login") {

    const inputs =
      event.target.querySelectorAll("input");

    try {

      const response = await fetch("/api/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          email: inputs[0].value,
          password: inputs[1].value
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed."
        );
      }

      localStorage.setItem(
        "lifedropUser",
        JSON.stringify(data.user)
      );

      closeModal();

      window.location.href =
        "/dashboard.html";

    } catch (error) {

      alert(error.message);
    }

    return;
  }


  // CREATE ACCOUNT
  if (title === "Create Account") {

    window.location.href =
      "/signup.html";

    return;
  }


  // DONOR
  if (title === "Become a Donor") {

    const inputs =
      event.target.querySelectorAll("input");

    const select =
      event.target.querySelector("select");

    try {

      await saveDonor({
        name: inputs[0].value,
        phone: inputs[1].value,
        bloodGroup: select.value,
        city: inputs[2].value,
        email: inputs[3].value
      });

      closeModal();

      alert(
        "Donor registration saved successfully in MongoDB."
      );

      go("donors");

    } catch (error) {

      alert(error.message);
    }

    return;
  }


  // BLOOD REQUEST
  if (title === "Request Blood") {

    const inputs =
      event.target.querySelectorAll("input");

    const select =
      event.target.querySelector("select");

    try {

      await saveRequest({
        patientName: inputs[0].value,
        bloodGroup: select.value,
        units: Number(inputs[1].value),
        hospital: inputs[2].value,
        contact: inputs[3].value,
        address: inputs[4].value
      });

      closeModal();

      alert(
        "Blood request saved successfully in MongoDB."
      );

      go("requests");

    } catch (error) {

      alert(error.message);
    }

    return;
  }
}


function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}