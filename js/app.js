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
    rating: 0, // 0 = unrated, 1-5 = stars
    created: new Date().toLocaleString(),
  };
}

// Build the interactive 5-star control for a card
function renderStars(prompt) {
  const rating = prompt.rating || 0; // backfill prompts saved before ratings
  let stars = "";
  // Rendered high-to-low; .prompt-rating uses row-reverse so 1 shows leftmost.
  // This lets the CSS-only hover preview highlight a star and all lower ones.
  for (let value = 5; value >= 1; value--) {
    const filled = value <= rating ? "star-filled" : "";
    stars += `<span class="star ${filled}" role="radio" tabindex="0" aria-checked="${
      value === rating
    }" aria-label="Rate ${value} star${value > 1 ? "s" : ""}" data-id="${
      prompt.id
    }" data-value="${value}">&#9733;</span>`;
  }
  return `<div class="prompt-rating" role="radiogroup" aria-label="Prompt rating">${stars}</div>`;
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
            ${renderStars(prompt)}
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

  // Attach rating listeners (click + keyboard)
  document.querySelectorAll(".star").forEach((star) => {
    star.addEventListener("click", setRating);
    star.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setRating(e);
      }
    });
  });
}

// Set a prompt's rating; clicking the current rating clears it back to 0
function setRating(e) {
  const { id, value } = e.target.dataset;
  const prompts = getPrompts();
  const prompt = prompts.find((p) => p.id === id);
  if (!prompt) return;
  const newRating = Number(value);
  prompt.rating = prompt.rating === newRating ? 0 : newRating;
  savePrompts(prompts);
  renderPrompts();
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
