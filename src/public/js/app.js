class BusBookingApp {
  constructor() {
    this.currentBus = null;
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadAllBuses();
  }

  bindEvents() {
    const searchBtn = document.getElementById('searchBtn');
    const bookForm = document.getElementById('bookForm');

    if (searchBtn) {
      searchBtn.addEventListener('click', () => this.searchBuses());
    }

    if (bookForm) {
      bookForm.addEventListener('submit', (e) => this.handleBooking(e));
    }
  }

  async loadAllBuses() {
    try {
      const response = await fetch('/api/buses');
      const data = await response.json();
      
      if (data.buses) {
        this.displayBuses(data.buses);
      }
    } catch (error) {
      this.showError('Failed to load buses');
      console.error('Error loading buses:', error);
    }
  }

  async searchBuses() {
    const fromInput = document.getElementById('fromInput');
    const toInput = document.getElementById('toInput');
    
    const from = fromInput ? fromInput.value.trim() : '';
    const to = toInput ? toInput.value.trim() : '';

    let url = '/api/buses';
    const params = new URLSearchParams();
    
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to search buses');
      }
      
      this.displayBuses(data.buses);
    } catch (error) {
      this.showError(error.message);
    }
  }

  displayBuses(buses) {
    const busesList = document.getElementById('busesList');
    
    if (!busesList) return;

    if (buses.length === 0) {
      busesList.innerHTML = '<p class="no-buses">No buses found matching your criteria.</p>';
      return;
    }

    busesList.innerHTML = buses.map(bus => `
      <div class="bus-card" data-bus-id="${bus.id}">
        <div class="bus-header">
          <span class="bus-route">${bus.from} → ${bus.to}</span>
          <span class="bus-price">$${bus.price}</span>
        </div>
        <div class="bus-details">
          <div>
            <strong>Departure:</strong> ${bus.departure}
          </div>
          <div>
            <strong>Arrival:</strong> ${bus.arrival}
          </div>
          <div>
            <strong>Available Seats:</strong> ${bus.available}
          </div>
          <div>
            <strong>Bus:</strong> ${bus.name}
          </div>
        </div>
        <button class="book-btn" onclick="app.selectBus(${bus.id})">
          Book Now
        </button>
      </div>
    `).join('');
  }

  selectBus(busId) {
    this.currentBus = busId;
    
    const bookingForm = document.getElementById('bookingForm');
    const selectedBusId = document.getElementById('selectedBusId');
    
    if (bookingForm && selectedBusId) {
      selectedBusId.value = busId;
      bookingForm.classList.remove('hidden');
      bookingForm.scrollIntoView({ behavior: 'smooth' });
    }
  }

  async handleBooking(event) {
    event.preventDefault();
    
    const passengerName = document.getElementById('passengerName');
    const seats = document.getElementById('seats');
    
    if (!passengerName || !seats || !this.currentBus) {
      this.showError('Please fill all fields');
      return;
    }

    const bookingData = {
      busId: this.currentBus,
      passengerName: passengerName.value.trim(),
      seats: parseInt(seats.value, 10)
    };

    // Validation
    if (!bookingData.passengerName) {
      this.showError('Please enter passenger name');
      return;
    }

    if (bookingData.seats < 1 || bookingData.seats > 10) {
      this.showError('Please select between 1-10 seats');
      return;
    }

    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Booking failed');
      }

      this.showBookingResult(result);
      
      // Reset form
      if (event.target.reset) {
        event.target.reset();
      }
      
      // Reload buses to update availability
      this.loadAllBuses();
    } catch (error) {
      this.showError(error.message);
    }
  }

  showBookingResult(result) {
    const bookingResult = document.getElementById('bookingResult');
    
    if (bookingResult) {
      bookingResult.innerHTML = `
        <h4>✅ Booking Confirmed!</h4>
        <p><strong>Passenger:</strong> ${result.booking.passengerName}</p>
        <p><strong>Seats:</strong> ${result.booking.seats}</p>
        <p><strong>Total Price:</strong> $${result.booking.totalPrice}</p>
        <p><strong>Booking ID:</strong> ${result.booking.id}</p>
        <p>${result.message}</p>
      `;
      bookingResult.classList.remove('hidden');
      bookingResult.scrollIntoView({ behavior: 'smooth' });
    }
  }

  showError(message) {
    const bookingResult = document.getElementById('bookingResult');
    
    if (bookingResult) {
      bookingResult.innerHTML = `
        <div style="color: #721c24; background: #f8d7da; border: 1px solid #f5c6cb; padding: 1rem; border-radius: 4px;">
          <strong>Error:</strong> ${message}
        </div>
      `;
      bookingResult.classList.remove('hidden');
      bookingResult.scrollIntoView({ behavior: 'smooth' });
    } else {
      alert(`Error: ${message}`);
    }
  }
}

// Initialize app
const app = new BusBookingApp();
