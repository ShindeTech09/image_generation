document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signup-form');
  const spinner = document.getElementById('spinner');
  const buttonText = document.querySelector('.button-text');
  const toast = document.getElementById('toast');
  // Ensure toast is hidden by default
  toast.classList.add('hidden');
  toast.classList.remove('show');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    // Show spinner and hide button text
    spinner.classList.remove('hidden');
    buttonText.style.opacity = '0';

    try {
      const response = await fetch('/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Signup successful!');
        form.reset();

        // Show toast notification
        toast.classList.remove('hidden');
        toast.classList.add('show');
        setTimeout(() => {
          toast.classList.remove('show');
          toast.classList.add('hidden');
        }, 5000);

        // Add fade-out animation
        document.body.classList.add('fade-out');

        // Redirect to login.html after animation
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1000); // Match the duration of the fade-out animation
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error signing up. Please try again.');
    } finally {
      // Hide spinner and show button text
      spinner.classList.add('hidden');
      buttonText.style.opacity = '1';
    }
  });
});