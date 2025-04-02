// Minimal authentication code without any page refreshes
document.addEventListener('DOMContentLoaded', function() {
  const token = localStorage.getItem('token');
  
  // Update UI based on login status
  if (token) {
    document.querySelectorAll('.logged-in').forEach(el => {
      el.style.display = 'inline-block';
    });
    document.querySelectorAll('.logged-out').forEach(el => {
      el.style.display = 'none';
    });
    
    // Get user info once
    fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        const userInfo = document.getElementById('user-info');
        const userName = document.getElementById('user-name');
        
        if (userInfo) userInfo.style.display = 'inline-block';
        if (userName) userName.textContent = data.data.user.name;

        // Update UI based on user role
        updateUIBasedOnUserRole(data.data.user);

        // Show admin elements if user is admin
        if (data.data.user.role === 'admin') {
          document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'inline-block';
          });
        }

        // Call updateCartCount if it exists
        if (typeof updateCartCount === 'function') {
          updateCartCount();
        }
      }
    })
    .catch(err => console.error('Error fetching user info:', err));
  } else {
    document.querySelectorAll('.logged-in').forEach(el => {
      el.style.display = 'none';
    });
    document.querySelectorAll('.logged-out').forEach(el => {
      el.style.display = 'inline-block';
    });
  }
  
  // Handle login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          localStorage.setItem('token', data.token);
          window.location.href = '/';
        } else {
          alert(data.message || 'Login failed');
        }
      })
      .catch(err => {
        console.error('Login error:', err);
        alert('An error occurred during login');
      });
    });
  }
  
  // Handle logout
  const logoutBtn = document.getElementById('logout-link');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('token');
      window.location.href = '/login';
    });
  }

  // Add event listeners for all Add to Cart buttons
  document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', handleAddToCart);
  });
});

// Clean, simplified cart count function
function updateCartCount() {
  const token = localStorage.getItem('token');
  if (!token) return;
  
  const cartCountElement = document.getElementById('cart-count');
  if (!cartCountElement) return;
  
  fetch('/cart/data', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      const count = data.data.cart.items ? data.data.cart.items.length : 0;
      cartCountElement.textContent = count;
      cartCountElement.style.display = count > 0 ? 'inline' : 'none';
    }
  })
  .catch(err => console.error('Error fetching cart count:', err));
}

// Handle Add to Cart button click
function handleAddToCart(e) {
  e.preventDefault();
  
  const token = localStorage.getItem('token');
  const itemId = this.getAttribute('data-item-id');
  
  if (!token) {
    // Not logged in - redirect to login page
    window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
    return;
  }
  
  // User is logged in - add item to cart
  fetch('/cart/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      itemId: itemId,
      quantity: 1  // Default quantity
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to add item to cart');
    }
    return response.json();
  })
  .then(data => {
    // Show success message
    alert('Item added to cart successfully!');
    
    // Update cart count in the navbar
    if (typeof updateCartCount === 'function') {
      updateCartCount();
    }
  })
  .catch(error => {
    console.error('Error adding item to cart:', error);
    alert('Error adding item to cart: ' + error.message);
  });
}

// Update UI based on user role
function updateUIBasedOnUserRole(userData) {
  if (userData && userData.role === 'admin') {
    // Show admin elements
    document.querySelectorAll('.admin-only').forEach(el => {
      el.style.display = 'block';
    });
    
    // Add admin badge to user name
    const userRoleBadge = document.getElementById('user-role-badge');
    if (userRoleBadge) {
      userRoleBadge.textContent = 'ADMIN';
      userRoleBadge.classList.add('admin-badge');
    }
  }
}

// Make it available globally
window.updateCartCount = updateCartCount;