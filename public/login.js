document.getElementById('login-form').addEventListener('submit', async function (event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorMessage = document.getElementById('error-message');

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      errorMessage.textContent = ''; // Clear any previous error messages
      document.getElementById('login-form').reset();

      // Store the user's email in local storage
      localStorage.setItem('isAuthenticated', 'true');

      // Add fade-out animation
      document.body.classList.add('fade-out');

      // Redirect to index.html after animation
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000); // Match the duration of the fade-out animation
    } else {
      if (data.error === 'Email not confirmed') {
        errorMessage.textContent = 'Please confirm your email before logging in.';
      } else {
        errorMessage.textContent = data.error;
      }
    }
  } catch (error) {
    console.error('Error:', error);
    errorMessage.textContent = 'Error logging in. Please try again.';
  }
});