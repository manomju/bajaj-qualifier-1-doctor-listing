let doctors = [];
let filteredDoctors = [];

const apiUrl = 'https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json';

async function fetchDoctors() {
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    doctors = data;
    filteredDoctors = data;
    renderDoctors(filteredDoctors);
    generateSpecialtyCheckboxes(data);
  } catch (error) {
    console.error('Failed to fetch doctors:', error);
  }
}

function renderDoctors(list) {
  const container = document.getElementById('doctor-list');
  container.innerHTML = '';

  if (list.length === 0) {
    container.innerHTML = '<p>No doctors found.</p>';
    return;
  }

  list.forEach(doc => {
    const div = document.createElement('div');
    div.className = 'doctor-card';
    div.setAttribute('data-testid', 'doctor-card');

    div.innerHTML = `
      <div class="doctor-card-content">
        <img src="${doc.image || 'https://via.placeholder.com/80'}" alt="Doctor Photo" />
        <div class="doctor-info">
          <h3 data-testid="doctor-name">${doc.name}</h3>
          <p class="specialty" data-testid="doctor-specialty">${doc.specialties ? doc.specialties.join(', ') : 'No Specialties Listed'}</p>
          <p class="experience" data-testid="doctor-experience">Experience: ${doc.experience} years</p>
          <p class="fee" data-testid="doctor-fee">₹${doc.fees}</p>
        </div>
        <div class="appointment-button">
          <button class="book-btn">Book Appointment</button>
        </div>
      </div>
    `;

    container.appendChild(div);
  });
}

function generateSpecialtyCheckboxes(data) {
  const specialtiesSet = new Set();
  data.forEach(d => {
    if (d.specialties) {
      d.specialties.forEach(s => specialtiesSet.add(s));
    }
  });

  const container = document.getElementById('specialty-checkboxes');
  container.innerHTML = '';

  specialtiesSet.forEach(specialty => {
    const safeId = specialty.replace(/\W+/g, '-');
    const checkbox = document.createElement('div');
    checkbox.innerHTML = `
      <label>
        <input type="checkbox" value="${specialty}" data-testid="filter-specialty-${safeId}">
        ${specialty}
      </label>
    `;
    container.appendChild(checkbox);

    checkbox.querySelector('input').addEventListener('change', applyFilters);
  });
}

function applyFilters() {
  let result = [...doctors];

  const selectedConsultation = document.querySelector('input[name="consultation"]:checked');
  if (selectedConsultation) {
    result = result.filter(doc => doc.consultation_mode === selectedConsultation.value);
  }

  const selectedSpecialties = Array.from(document.querySelectorAll('#specialty-checkboxes input[type="checkbox"]:checked')).map(cb => cb.value);
  if (selectedSpecialties.length > 0) {
    result = result.filter(doc =>
      selectedSpecialties.every(spec => doc.specialties && doc.specialties.includes(spec))
    );
  }

  const selectedSort = document.querySelector('input[name="sort"]:checked');
  if (selectedSort) {
    if (selectedSort.value === 'fees') {
      result.sort((a, b) => a.fees - b.fees);
    } else if (selectedSort.value === 'experience') {
      result.sort((a, b) => b.experience - a.experience);
    }
  }

  renderDoctors(result);
}

// Search Autocomplete
const searchInput = document.getElementById('autocomplete-input');
const suggestionsList = document.getElementById('suggestions-list');

searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  suggestionsList.innerHTML = '';

  if (!query) return;

  const matches = doctors
    .filter(doc => doc.name.toLowerCase().includes(query))
    .slice(0, 3);

  matches.forEach(match => {
    const li = document.createElement('li');
    li.textContent = match.name;
    li.setAttribute('data-testid', 'suggestion-item');
    li.addEventListener('click', () => {
      searchInput.value = match.name;
      suggestionsList.innerHTML = '';
      const matchedDoctor = doctors.filter(doc => doc.name === match.name);
      renderDoctors(matchedDoctor);
    });
    suggestionsList.appendChild(li);
  });
});

// Close suggestion box on click outside
document.addEventListener('click', (e) => {
  if (!searchInput.contains(e.target) && !suggestionsList.contains(e.target)) {
    suggestionsList.innerHTML = '';
  }
});

// Attach filter and sort listeners
document.querySelectorAll('input[name="consultation"]').forEach(input => {
  input.addEventListener('change', applyFilters);
});

document.querySelectorAll('input[name="sort"]').forEach(input => {
  input.addEventListener('change', applyFilters);
});

// Start
fetchDoctors();
