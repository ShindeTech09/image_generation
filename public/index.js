document.addEventListener('DOMContentLoaded', async function () {
  const response = await fetch('/check-auth');
  const data = await response.json();

  if (!data.authenticated) {
    window.location.href = '/login.html';
    return;
  }

  const displayName = localStorage.getItem('name') || 'User';
  const userDisplayElement = document.getElementById('user-email');
  userDisplayElement.textContent = `Welcome, ${displayName}!`;

  // Continue with other initialization code
  initializeSidebarAndTheme();

  const logoutButton = document.getElementById('logout-btn');
  logoutButton.addEventListener('click', async function () {
    await fetch('/logout', { method: 'POST' });
    localStorage.removeItem('name');
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/login.html';
  });
});

function initializeSidebarAndTheme() {
  const sidebar = document.querySelector('.sidebar');
  const toggleButton = document.querySelector('.sidebar .topBarAction .icon i');
  const themeToggleButton = document.getElementById('theme-toggle');
  const toggleThemeBtn = document.getElementById('toggle-theme-btn');

  // Sidebar toggle
  toggleButton?.addEventListener('click', () => sidebar.classList.toggle('expanded'));

  // Theme toggle handlers
  themeToggleButton?.addEventListener('click', () => {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    body.setAttribute('data-theme', currentTheme === 'light' ? 'dark' : 'light');
  });

  toggleThemeBtn?.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    updateThemeIcon(toggleThemeBtn.querySelector('i'));
  });
}

function updateThemeIcon(icon) {
  if (!icon) return;
  
  if (document.body.classList.contains('dark-theme')) {
    icon.classList.replace('fa-moon', 'fa-sun');
  } else {
    icon.classList.replace('fa-sun', 'fa-moon');
  }
}

function createImageElement(imageUrl) {
  const imageElement = document.createElement('div');
  imageElement.className = 'image';
  imageElement.innerHTML = `<img src="${imageUrl}" alt="Generated Image" />`;

  const downloadBtn = document.createElement('a');
  downloadBtn.style.display = 'block';
  downloadBtn.style.fontSize = '0.9em';
  downloadBtn.style.marginTop = '10px';
  downloadBtn.style.padding = '5px 10px';
  downloadBtn.style.backgroundColor = '#007bff';
  downloadBtn.style.color = '#fff';
  downloadBtn.style.borderRadius = '5px';
  downloadBtn.style.textAlign = 'center';
  downloadBtn.style.transition = 'background-color 0.3s ease';
  downloadBtn.href = imageUrl;
  downloadBtn.download = 'generated-image.png';
  downloadBtn.textContent = 'Download Image';

  downloadBtn.addEventListener('mouseover', () => {
    downloadBtn.style.backgroundColor = '#0056b3';
  });

  downloadBtn.addEventListener('mouseout', () => {
    downloadBtn.style.backgroundColor = '#007bff';
  });

  imageElement.appendChild(downloadBtn);

  return imageElement;
}

function scrollToBottom(element) {
  element.scrollTop = element.scrollHeight;
}

// Image generation form handler
document.getElementById('image-form')?.addEventListener('submit', async function(event) {
  event.preventDefault();
  
  const prompt = document.getElementById('prompt');
  const chatBox = document.getElementById('chat-box');
  const chatContainer = document.querySelector('.chat-container');

  // Create and append prompt element
  const promptElement = document.createElement('div');
  promptElement.className = 'prompt';
  promptElement.textContent = prompt.value;
  chatBox.appendChild(promptElement);

  // Clear input and add animation
  prompt.value = '';
  // chatContainer?.classList.add('pop-out');

  try {
    const response = await fetch('/generate-pig-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptElement.textContent })
    });

    const data = await response.json();

    if (data.filePath) {
      const imageUrl = `${data.filePath}?t=${Date.now()}`;
      const imageElement = createImageElement(imageUrl);
      chatBox.appendChild(imageElement);
      scrollToBottom(chatBox); // Scroll to the bottom after appending the image
    } else {
      throw new Error('Image generation failed');
    }
  } catch (error) {
    console.error('Error:', error);
    const errorElement = document.createElement('div');
    errorElement.className = 'image';
    errorElement.innerHTML = `<p style="color: red;">Error generating image. Please try again later.</p>`;
    chatBox.appendChild(errorElement);
    scrollToBottom(chatBox); // Scroll to the bottom after appending the error message
  }
});


