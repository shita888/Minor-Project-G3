 
  function generateRain(id, count) {
    const container = document.getElementById(id);
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div');
      s.className = 'rain-streak';
      s.style.cssText = `
        left: ${Math.random() * 120 - 10}%;
        height: ${40 + Math.random() * 120}px;
        animation-delay: ${Math.random() * 6}s;
        animation-duration: ${1.8 + Math.random() * 2.5}s;
        opacity: ${0.2 + Math.random() * 0.5};
        top: 0;
      `;
      container.appendChild(s);
    }
  }
  generateRain('rain', 60);
 