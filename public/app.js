// app.js — frontend logic for the URL Shortener UI. Talks to the Express
// API with fetch(); no framework, no build step.

const shortenForm = document.getElementById("shorten-form");
const submitBtn = document.getElementById("submit-btn");
const formError = document.getElementById("form-error");
const successBox = document.getElementById("success-box");
const shortUrlText = document.getElementById("short-url-text");
const copyBtn = document.getElementById("copy-btn");
const copyConfirm = document.getElementById("copy-confirm");

const listLoading = document.getElementById("list-loading");
const listEmpty = document.getElementById("list-empty");
const urlTable = document.getElementById("url-table");
const urlTableBody = document.getElementById("url-table-body");

// Handle the "Shorten URL" form submit
shortenForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  formError.hidden = true;
  successBox.hidden = true;

  const originalUrl = document.getElementById("original-url").value.trim();
  const customAlias = document.getElementById("custom-alias").value.trim();
  const expiresAt = document.getElementById("expires-at").value;

  const body = { originalUrl };
  if (customAlias) body.customAlias = customAlias;
  if (expiresAt) body.expiresAt = expiresAt;

  submitBtn.disabled = true;
  submitBtn.textContent = "Shortening...";

  try {
    const response = await fetch("/api/urls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      formError.textContent = data.error || "Something went wrong";
      formError.hidden = false;
      return;
    }

    const shortUrl = `${window.location.origin}/${data.short_code}`;
    shortUrlText.textContent = shortUrl;
    successBox.hidden = false;
    shortenForm.reset();
    loadUrls(); // refresh the list so the new URL shows up immediately
  } catch (err) {
    formError.textContent = "Could not reach the server — is it running?";
    formError.hidden = false;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Shorten URL";
  }
});

// Copy the generated short URL to the clipboard
copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(shortUrlText.textContent);
  copyConfirm.hidden = false;
  setTimeout(() => (copyConfirm.hidden = true), 1500);
});

// Format an ISO timestamp as a short readable date, or "—" if null
function formatDate(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString();
}

// Build one <tr> for a url row returned by GET /api/urls
function buildUrlRow(url) {
  const tr = document.createElement("tr");

  const shortUrl = `${window.location.origin}/${url.short_code}`;

  const shortCell = document.createElement("td");
  shortCell.textContent = url.short_code;
  tr.appendChild(shortCell);

  const originalCell = document.createElement("td");
  originalCell.className = "original-url-cell";
  originalCell.textContent = url.original_url;
  originalCell.title = url.original_url; // full URL on hover, since the cell truncates
  tr.appendChild(originalCell);

  const createdCell = document.createElement("td");
  createdCell.textContent = formatDate(url.created_at);
  tr.appendChild(createdCell);

  const expiresCell = document.createElement("td");
  expiresCell.textContent = formatDate(url.expires_at);
  tr.appendChild(expiresCell);

  const clicksCell = document.createElement("td");
  clicksCell.textContent = url.click_count;
  tr.appendChild(clicksCell);

  const actionsCell = document.createElement("td");
  actionsCell.className = "row-actions";

  const analyticsBtn = document.createElement("button");
  analyticsBtn.type = "button";
  analyticsBtn.className = "btn-secondary";
  analyticsBtn.textContent = "View Analytics";
  analyticsBtn.addEventListener("click", () => {
    window.location.href = `analytics.html?id=${url.id}`;
  });
  actionsCell.appendChild(analyticsBtn);

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "btn-danger";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => deleteUrl(url.id, shortUrl));
  actionsCell.appendChild(deleteBtn);

  tr.appendChild(actionsCell);

  return tr;
}

// Fetch all urls and render the table (or the empty state)
async function loadUrls() {
  listLoading.hidden = false;
  listEmpty.hidden = true;
  urlTable.hidden = true;

  try {
    const response = await fetch("/api/urls");
    const urls = await response.json();

    if (urls.length === 0) {
      listEmpty.hidden = false;
      return;
    }

    urlTableBody.innerHTML = "";
    urls.forEach((url) => urlTableBody.appendChild(buildUrlRow(url)));
    urlTable.hidden = false;
  } catch (err) {
    listEmpty.textContent = "Could not load your URLs — is the server running?";
    listEmpty.hidden = false;
  } finally {
    listLoading.hidden = true;
  }
}

// Delete one url after confirmation, then refresh the list
async function deleteUrl(id, shortUrl) {
  const confirmed = window.confirm(`Delete ${shortUrl}? This can't be undone.`);
  if (!confirmed) return;

  await fetch(`/api/urls/${id}`, { method: "DELETE" });
  loadUrls();
}

loadUrls();
