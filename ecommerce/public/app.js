// Cart Management
function getCart() {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function addToCart(productId, name, price) {
  const cart = getCart();
  const existingItem = cart.find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ productId, name, price, quantity: 1 });
  }
  saveCart(cart);
  alert('Product added to cart!');
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  location.reload();
}

function updateQuantity(index, quantity) {
  const cart = getCart();
  cart[index].quantity = parseInt(quantity);
  saveCart(cart);
  location.reload();
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountElement = document.getElementById('cart-count');
  if (cartCountElement) {
    cartCountElement.textContent = count;
  }
}

// Checkout
async function checkout() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first!');
    window.location.href = 'login.html';
    return;
  }
  const cart = getCart();
  if (cart.length === 0) {
    alert('Cart is empty!');
    return;
  }
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const items = cart.map(item => ({
    product: item.productId,
    name: item.name,
    price: item.price,
    quantity: item.quantity
  }));
  try {
    const response = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ items, totalAmount })
    });
    const data = await response.json();
    if (response.ok) {
      alert('Order placed successfully!');
      localStorage.removeItem('cart');
      window.location.href = 'index.html';
    } else {
      alert(data.message);
    }
  } catch (error) {
    alert('Order failed!');
  }
}

// Auth Management
function updateAuthLink() {
  const authLink = document.getElementById('auth-link');
  if (authLink) {
    const token = localStorage.getItem('token');
    if (token) {
      const user = JSON.parse(localStorage.getItem('user'));
      authLink.textContent = user.name;
      authLink.href = '#';
      authLink.onclick = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
      };
    } else {
      authLink.textContent = 'Login';
      authLink.href = 'login.html';
    }
  }
}

// Initialize
updateCartCount();
updateAuthLink();