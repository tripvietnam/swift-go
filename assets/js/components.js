// Component loader for static HTML
(function() {
  let loadedCount = 0;
  let totalComponents = 0;

  async function loadComponent(elementId, componentPath) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    try {
      const response = await fetch(componentPath);
      if (!response.ok) throw new Error(`Failed to load ${componentPath}`);
      const html = await response.text();
      element.outerHTML = html;
      
      loadedCount++;
      if (loadedCount === totalComponents) {
        // All components loaded - dispatch custom event
        document.dispatchEvent(new CustomEvent('components-loaded'));
      }
    } catch (error) {
      console.error('Error loading component:', error);
      loadedCount++;
      if (loadedCount === totalComponents) {
        document.dispatchEvent(new CustomEvent('components-loaded'));
      }
    }
  }

  // Auto-load components on page load
  document.addEventListener('DOMContentLoaded', () => {
    // Load header if placeholder exists
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
      totalComponents++;
    }

    // Load footer if placeholder exists
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
      totalComponents++;
    }

    // Start loading components
    if (headerPlaceholder) {
      loadComponent('header-placeholder', 'components/header.html');
    }
    if (footerPlaceholder) {
      loadComponent('footer-placeholder', 'components/footer.html');
    }

    // If no components to load, dispatch event immediately
    if (totalComponents === 0) {
      document.dispatchEvent(new CustomEvent('components-loaded'));
    }
  });
})();

