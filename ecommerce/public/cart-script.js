// Global variables
let appliedCoupon = null;
const coupons = {
  'SAVE10': { discount: 10, type: 'percentage', description: '10% Off' },
  'SAVE20': { discount: 20, type: 'percentage', description: '20% Off' },
  'FLAT50': { discount: 50, type: 'fixed', description: '$50 Off' },
  'WELCOME': { discount: 15, type: 'percentage', description: '15% Off for New Users' }
};

// Display cart items with images
async function displayCart() {
  const cart = getCart();
  const cartItems = document.getElementById('cart-items');
  const cartSummary = document.getElementById('cart-summary-section');

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <h2>Your cart is empty</h2>
        <p>Add some products to get started!</p>
        <a href="index.html" class="btn-continue" style="margin-top: 1rem;">
          <i class="fas fa-shopping-bag"></i> Start Shopping
        </a>
      </div>
    `;
    cartSummary.style.display = 'none';
    return;
  }

  cartSummary.style.display = 'block';

  // Fetch product details for images
  let cartHtml = '';
  for (let i = 0; i < cart.length; i++) {
    const item = cart[i];
    let productImage = 'https://via.placeholder.com/120';
    
    try {
      const response = await fetch(`http://localhost:5000/api/products/${item.productId}`);
      if (response.ok) {
        const product = await response.json();
        productImage = product.image;
      }
    } catch (error) {
      console.log('Could not fetch product image');
    }

    const itemTotal = (item.price * item.quantity).toFixed(2);
    
    cartHtml += `
      <div class="cart-item">
        <img src="${productImage}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
          
          <div class="quantity-controls">
            <button class="qty-btn" onclick="changeQuantity(${i}, -1)">
              <i class="fas fa-minus"></i>
            </button>
            <span class="qty-display">${item.quantity}</span>
            <button class="qty-btn" onclick="changeQuantity(${i}, 1)">
              <i class="fas fa-plus"></i>
            </button>
            <span style="margin-left: 1rem; color: #7f8c8d;">
              Item Total: <strong style="color: #27ae60;">$${itemTotal}</strong>
            </span>
          </div>
          
          <button class="remove-btn" onclick="removeFromCart(${i})">
            <i class="fas fa-trash"></i> Remove
          </button>
        </div>
      </div>
    `;
  }

  cartItems.innerHTML = cartHtml;
  updateSummary();
}

// Change quantity with + and - buttons
function changeQuantity(index, change) {
  const cart = getCart();
  cart[index].quantity += change;
  
  if (cart[index].quantity < 1) {
    cart[index].quantity = 1;
  }
  
  saveCart(cart);
  displayCart();
}

// Update cart summary with breakdown
function updateSummary() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.10; // 10% tax
  const shipping = subtotal > 100 ? 0 : 15; // Free shipping over $100
  
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discount = (subtotal * appliedCoupon.discount) / 100;
    } else {
      discount = appliedCoupon.discount;
    }
  }
  
  const total = subtotal + tax + shipping - discount;

  const summaryHtml = `
    <div class="summary-row">
      <span>Subtotal (${cart.length} items)</span>
      <span>$${subtotal.toFixed(2)}</span>
    </div>
    <div class="summary-row">
      <span>Tax (10%)</span>
      <span>$${tax.toFixed(2)}</span>
    </div>
    <div class="summary-row">
      <span>Shipping</span>
      <span>${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span>
    </div>
    ${appliedCoupon ? `
      <div class="summary-row" style="color: #27ae60;">
        <span>Discount ${appliedCoupon ? `<span class="discount-badge">${appliedCoupon.description}</span>` : ''}</span>
        <span>-$${discount.toFixed(2)}</span>
      </div>
    ` : ''}
    <div class="summary-row total">
      <span>Total</span>
      <span>$${total.toFixed(2)}</span>
    </div>
  `;

  document.getElementById('summary-details').innerHTML = summaryHtml;
}

// Apply coupon code
function applyCoupon() {
  const couponCode = document.getElementById('coupon-code').value.trim().toUpperCase();
  const messageDiv = document.getElementById('coupon-message');

  if (!couponCode) {
    messageDiv.innerHTML = '<span style="color: #e74c3c;">Please enter a coupon code</span>';
    return;
  }

  if (coupons[couponCode]) {
    appliedCoupon = coupons[couponCode];
    messageDiv.innerHTML = `<span style="color: #27ae60;"><i class="fas fa-check-circle"></i> Coupon applied: ${appliedCoupon.description}</span>`;
    updateSummary();
  } else {
    messageDiv.innerHTML = '<span style="color: #e74c3c;"><i class="fas fa-times-circle"></i> Invalid coupon code</span>';
  }
}

// Clear entire cart
function clearCart() {
  if (confirm('Are you sure you want to clear your cart?')) {
    localStorage.removeItem('cart');
    updateCartCount();
    displayCart();
  }
}

// Show checkout form
function showCheckout() {
  const token = localStorage.getItem('token');
  if (!token) {
    if (confirm('Please login first to checkout. Go to login page?')) {
      window.location.href = 'login.html';
    }
    return;
  }

  document.getElementById('checkout-form').style.display = 'block';
  document.querySelector('.cart-container').style.display = 'none';
  updateFinalSummary();
  setupPaymentOptions();
}

// Hide checkout form
function hideCheckout() {
  document.getElementById('checkout-form').style.display = 'none';
  document.querySelector('.cart-container').style.display = 'grid';
}

// Update final summary in checkout
function updateFinalSummary() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.10;
  const shipping = subtotal > 100 ? 0 : 15;
  
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discount = (subtotal * appliedCoupon.discount) / 100;
    } else {
      discount = appliedCoupon.discount;
    }
  }
  
  const total = subtotal + tax + shipping - discount;

  const summaryHtml = `
    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
      <span>Items (${cart.length})</span>
      <span>$${subtotal.toFixed(2)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
      <span>Tax</span>
      <span>$${tax.toFixed(2)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
      <span>Shipping</span>
      <span>${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span>
    </div>
    ${appliedCoupon ? `
      <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; color: #27ae60;">
        <span>Discount</span>
        <span>-$${discount.toFixed(2)}</span>
      </div>
    ` : ''}
    <div style="display: flex; justify-content: space-between; padding: 1rem 0; font-size: 1.5rem; font-weight: bold; border-top: 2px solid #27ae60; margin-top: 0.5rem; color: #27ae60;">
      <span>Total</span>
      <span>$${total.toFixed(2)}</span>
    </div>
  `;

  document.getElementById('final-summary').innerHTML = summaryHtml;
}

// Setup payment option styling and show/hide payment details
function setupPaymentOptions() {
  const paymentOptions = document.querySelectorAll('.payment-option');
  const cardDetails = document.getElementById('card-details');
  const upiDetails = document.getElementById('upi-details');
  
  paymentOptions.forEach(option => {
    const radio = option.querySelector('input[type="radio"]');
    
    // Set initial state
    if (radio.checked) {
      option.style.borderColor = '#667eea';
      option.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))';
    }
    
    option.addEventListener('click', function() {
      paymentOptions.forEach(opt => {
        opt.style.borderColor = '#ddd';
        opt.style.background = 'white';
      });
      
      radio.checked = true;
      this.style.borderColor = '#667eea';
      this.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))';
      
      // Show/hide payment details
      cardDetails.classList.remove('active');
      upiDetails.classList.remove('active');
      
      if (radio.value === 'Card') {
        cardDetails.classList.add('active');
        makeCardFieldsRequired(true);
        makeUpiFieldsRequired(false);
      } else if (radio.value === 'UPI') {
        upiDetails.classList.add('active');
        makeCardFieldsRequired(false);
        makeUpiFieldsRequired(true);
      } else {
        makeCardFieldsRequired(false);
        makeUpiFieldsRequired(false);
      }
    });
  });
  
  // Format card number input
  const cardNumberInput = document.getElementById('card-number');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\s/g, '');
      let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
      e.target.value = formattedValue;
    });
  }
  
  // Format expiry date
  const expiryInput = document.getElementById('card-expiry');
  if (expiryInput) {
    expiryInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      e.target.value = value;
    });
  }
  
  // Format CVV - only numbers
  const cvvInput = document.getElementById('card-cvv');
  if (cvvInput) {
    cvvInput.addEventListener('input', function(e) {
      e.target.value = e.target.value.replace(/\D/g, '');
    });
  }
}

// Toggle required fields based on payment method
function makeCardFieldsRequired(required) {
  const cardFields = ['card-number', 'card-name', 'card-expiry', 'card-cvv'];
  cardFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.required = required;
    }
  });
}

function makeUpiFieldsRequired(required) {
  const upiId = document.getElementById('upi-id');
  if (upiId) {
    upiId.required = required;
  }
}

// Validate card details
function validateCardDetails() {
  const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
  const cardName = document.getElementById('card-name').value.trim();
  const cardExpiry = document.getElementById('card-expiry').value;
  const cardCvv = document.getElementById('card-cvv').value;
  
  if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
    alert('❌ Please enter a valid card number (13-19 digits)');
    return false;
  }
  
  if (!cardName) {
    alert('❌ Please enter cardholder name');
    return false;
  }
  
  if (!cardExpiry || !cardExpiry.match(/^\d{2}\/\d{2}$/)) {
    alert('❌ Please enter expiry date in MM/YY format');
    return false;
  }
  
  // Check if card is expired
  const [month, year] = cardExpiry.split('/').map(num => parseInt(num));
  const currentDate = new Date();
  const currentYear = parseInt(currentDate.getFullYear().toString().substring(2));
  const currentMonth = currentDate.getMonth() + 1;
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    alert('❌ Card has expired');
    return false;
  }
  
  if (!cardCvv || cardCvv.length < 3 || cardCvv.length > 4) {
    alert('❌ Please enter a valid CVV (3-4 digits)');
    return false;
  }
  
  return true;
}

// Handle order submission
document.getElementById('order-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
  
  // Validate card details if card payment selected
  if (paymentMethod === 'Card') {
    if (!validateCardDetails()) {
      return;
    }
  }
  
  // Validate UPI details if UPI selected
  if (paymentMethod === 'UPI') {
    const upiId = document.getElementById('upi-id').value.trim();
    const upiApp = document.querySelector('input[name="upi-app"]:checked');
    
    if (!upiId || !upiId.includes('@')) {
      alert('❌ Please enter a valid UPI ID (e.g., yourname@upi)');
      return;
    }
    
    if (!upiApp) {
      alert('❌ Please select a UPI app');
      return;
    }
  }
  
  const token = localStorage.getItem('token');
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.10;
  const shipping = subtotal > 100 ? 0 : 15;
  
  let discount = 0;
  if (appliedCoupon) {
    discount = appliedCoupon.type === 'percentage' 
      ? (subtotal * appliedCoupon.discount) / 100 
      : appliedCoupon.discount;
  }
  
  const totalAmount = subtotal + tax + shipping - discount;

  // Prepare payment details
  let paymentDetails = { method: paymentMethod };
  
  if (paymentMethod === 'Card') {
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    paymentDetails = {
      method: 'Card',
      cardNumber: cardNumber,
      cardName: document.getElementById('card-name').value,
      cardExpiry: document.getElementById('card-expiry').value,
      cardCvv: document.getElementById('card-cvv').value,
      cardLastFour: cardNumber.slice(-4)
    };
  } else if (paymentMethod === 'UPI') {
    paymentDetails = {
      method: 'UPI',
      upiId: document.getElementById('upi-id').value,
      upiApp: document.querySelector('input[name="upi-app"]:checked')?.value
    };
  }

  const orderData = {
    items: cart.map(item => ({
      product: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    })),
    totalAmount,
    shippingAddress: {
      name: document.getElementById('customer-name').value,
      phone: document.getElementById('phone').value,
      address1: document.getElementById('address1').value,
      address2: '',
      city: document.getElementById('city').value,
      state: document.getElementById('state').value,
      pincode: document.getElementById('pincode').value
    },
    paymentMethod,
    paymentDetails,
    discount: discount,
    tax: tax,
    shipping: shipping,
    couponCode: appliedCoupon ? document.getElementById('coupon-code').value : null
  };

  try {
    // Show processing message
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;

    const response = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();

    if (response.ok) {
      let successMsg = `✅ Order placed successfully!\n\nOrder Total: $${totalAmount.toFixed(2)}\n`;
      
      if (paymentMethod === 'Card') {
        successMsg += `Payment Method: Card ending in ${paymentDetails.cardLastFour}\n`;
      } else if (paymentMethod === 'UPI') {
        successMsg += `Payment Method: ${paymentDetails.upiApp}\n`;
      } else {
        successMsg += `Payment Method: Cash on Delivery\n`;
      }
      
      successMsg += '\nThank you for shopping with E-Shop!';
      
      alert(successMsg);
      localStorage.removeItem('cart');
      appliedCoupon = null;
      window.location.href = 'index.html';
    } else {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      alert('❌ ' + result.message);
    }
  } catch (error) {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
    alert('❌ Error placing order: ' + error.message);
  }
});

// Initialize cart display
displayCart();