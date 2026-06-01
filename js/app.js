const STORAGE_KEY = "prompts";

// Get all prompts from localStorage
function getPrompts() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Save prompts to localStorage
function savePrompts(prompts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
}

// Create a new prompt object
function createPrompt(title, content) {
  return {
    id: Date.now().toString(),
    title,
    content,
    created: new Date().toLocaleString(),
  };
}

// Render prompts to the DOM
function renderPrompts() {
  const prompts = getPrompts();
  const promptsList = document.getElementById("promptsList");

  if (prompts.length === 0) {
    promptsList.innerHTML =
      '<div class="empty-message">No prompts saved yet. Create one to get started!</div>';
    return;
  }

  promptsList.innerHTML = prompts
    .map((prompt) => {
      const preview =
        prompt.content.split("\n")[0].substring(0, 60) +
        (prompt.content.length > 60 ? "..." : "");
      return `
        <div class="prompt-card">
          <div class="prompt-card-title">${escapeHtml(prompt.title)}</div>
          <div class="prompt-card-preview">${escapeHtml(preview)}</div>
          <div class="prompt-card-footer">
            <button class="btn btn-delete" data-id="${prompt.id}">Delete</button>
          </div>
        </div>
      `;
    })
    .join("");

  // Attach delete listeners
  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", deletePrompt);
  });
}

// Delete a prompt
function deletePrompt(e) {
  const id = e.target.dataset.id;
  const prompts = getPrompts();
  const filtered = prompts.filter((prompt) => prompt.id !== id);
  savePrompts(filtered);
  renderPrompts();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Form submission
document.getElementById("promptForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();

  if (!title || !content) return;

  const newPrompt = createPrompt(title, content);
  const prompts = getPrompts();
  prompts.unshift(newPrompt);
  savePrompts(prompts);

  document.getElementById("promptForm").reset();
  renderPrompts();
});

// Initialize on page load
document.addEventListener("DOMContentLoaded", renderPrompts);
