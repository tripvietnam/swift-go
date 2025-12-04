// Autocomplete for destination search
(function() {
  'use strict';

  let servicesData = null;
  let autocompleteList = null;
  let selectedIndex = -1;

  // Load services data
  async function loadServicesData() {
    try {
      const response = await fetch('data/services.json');
      servicesData = await response.json();
    } catch (error) {
      console.error('Failed to load services data:', error);
    }
  }

  // Extract all searchable items from JSON
  function getAllSearchableItems() {
    if (!servicesData) return [];

    const items = [];

    // Add destinations
    if (servicesData.destinations) {
      servicesData.destinations.forEach(dest => {
        items.push({
          type: 'destination',
          name: dest.name,
          subtitle: dest.country,
          description: dest.description,
          searchText: `${dest.name} ${dest.country} ${dest.description}`.toLowerCase()
        });
      });
    }

    // Add services and their items
    if (servicesData.services) {
      servicesData.services.forEach(service => {
        if (service.items) {
          service.items.forEach(item => {
            const searchText = [
              item.name,
              item.location,
              item.type,
              item.cuisine,
              item.airline,
              item.provider,
              service.name
            ].filter(Boolean).join(' ').toLowerCase();

            items.push({
              type: service.category,
              name: item.name,
              subtitle: item.location || item.type || item.cuisine || '',
              price: item.price,
              rating: item.rating,
              searchText: searchText
            });
          });
        }
      });
    }

    return items;
  }

  // Fuzzy search algorithm
  function fuzzyMatch(text, query) {
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();

    // Exact match gets highest score
    if (textLower.includes(queryLower)) {
      return 100;
    }

    // Check if all characters in query appear in order
    let textIndex = 0;
    let queryIndex = 0;
    let matches = 0;

    while (textIndex < text.length && queryIndex < query.length) {
      if (textLower[textIndex] === queryLower[queryIndex]) {
        matches++;
        queryIndex++;
      }
      textIndex++;
    }

    // Score based on matched characters
    if (matches === query.length) {
      return 50 + (matches / text.length) * 50;
    }

    return 0;
  }

  // Search items
  function searchItems(query) {
    if (!query || query.length < 1) return [];

    const allItems = getAllSearchableItems();
    const results = [];

    allItems.forEach(item => {
      const score = fuzzyMatch(item.searchText, query);
      if (score > 0) {
        results.push({ ...item, score });
      }
    });

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    // Return top 8 results
    return results.slice(0, 8);
  }

  // Create autocomplete dropdown
  function createAutocompleteList() {
    const list = document.createElement('div');
    list.className = 'autocomplete-list';
    list.id = 'destination-autocomplete';
    list.style.display = 'none';
    return list;
  }

  // Get icon for item type
  function getItemIcon(type) {
    const icons = {
      destination: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/></svg>',
      accommodation: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2"/></svg>',
      transportation: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17 8h3l3 3v5h-2a3 3 0 0 1-6 0H9a3 3 0 0 1-6 0H1v-6l3-3h3" stroke="currentColor" stroke-width="2"/></svg>',
      dining: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z" stroke="currentColor" stroke-width="2"/></svg>',
      entertainment: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2"/></svg>'
    };
    return icons[type] || icons.destination;
  }

  // Render results
  function renderResults(results, input) {
    if (!autocompleteList) return;

    if (results.length === 0) {
      autocompleteList.style.display = 'none';
      return;
    }

    let html = '';
    results.forEach((item, index) => {
      const priceText = item.price ? `<span class="autocomplete-price">${item.price.toLocaleString('vi-VN')}₫</span>` : '';
      const ratingText = item.rating ? `<span class="autocomplete-rating">${item.rating}</span>` : '';
      
      html += `
        <div class="autocomplete-item ${index === selectedIndex ? 'selected' : ''}" data-index="${index}" data-value="${item.name}">
          <div class="autocomplete-icon">${getItemIcon(item.type)}</div>
          <div class="autocomplete-content">
            <div class="autocomplete-name">${highlightMatch(item.name, input.value)}</div>
            <div class="autocomplete-subtitle">${item.subtitle}</div>
          </div>
          <div class="autocomplete-meta">
            ${ratingText}
            ${priceText}
          </div>
        </div>
      `;
    });

    autocompleteList.innerHTML = html;
    autocompleteList.style.display = 'block';

    // Position the list
    positionAutocomplete(input);

    // Add click handlers
    autocompleteList.querySelectorAll('.autocomplete-item').forEach(item => {
      item.addEventListener('click', () => {
        selectItem(item.dataset.value);
      });
    });
  }

  // Highlight matching text
  function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
  }

  // Position autocomplete list
  function positionAutocomplete(input) {
    const rect = input.getBoundingClientRect();
    autocompleteList.style.top = `${rect.bottom + window.scrollY}px`;
    autocompleteList.style.left = `${rect.left + window.scrollX}px`;
    autocompleteList.style.width = `${rect.width}px`;
  }

  // Select item
  function selectItem(value) {
    const input = document.getElementById('destination');
    if (input) {
      input.value = value;
      autocompleteList.style.display = 'none';
      selectedIndex = -1;
    }
  }

  // Handle keyboard navigation
  function handleKeyboard(e, input, results) {
    if (!results || results.length === 0) return;

    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
        renderResults(results, input);
        break;

      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        renderResults(results, input);
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          selectItem(results[selectedIndex].name);
        }
        break;

      case 'Escape':
        autocompleteList.style.display = 'none';
        selectedIndex = -1;
        break;
    }
  }

  // Initialize
  async function init() {
    await loadServicesData();

    const input = document.getElementById('destination');
    if (!input) return;

    // Create autocomplete list
    autocompleteList = createAutocompleteList();
    document.body.appendChild(autocompleteList);

    let currentResults = [];
    let debounceTimer = null;

    // Input event
    input.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      
      debounceTimer = setTimeout(() => {
        const query = e.target.value.trim();
        
        if (query.length === 0) {
          autocompleteList.style.display = 'none';
          currentResults = [];
          selectedIndex = -1;
          return;
        }

        currentResults = searchItems(query);
        selectedIndex = -1;
        renderResults(currentResults, input);
      }, 150);
    });

    // Focus event - show results if has value
    input.addEventListener('focus', () => {
      if (input.value.trim().length > 0 && currentResults.length > 0) {
        autocompleteList.style.display = 'block';
      }
    });

    // Keyboard navigation
    input.addEventListener('keydown', (e) => {
      handleKeyboard(e, input, currentResults);
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !autocompleteList.contains(e.target)) {
        autocompleteList.style.display = 'none';
        selectedIndex = -1;
      }
    });

    // Reposition on scroll/resize
    window.addEventListener('scroll', () => {
      if (autocompleteList.style.display === 'block') {
        positionAutocomplete(input);
      }
    });

    window.addEventListener('resize', () => {
      if (autocompleteList.style.display === 'block') {
        positionAutocomplete(input);
      }
    });
  }

  // Run when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

