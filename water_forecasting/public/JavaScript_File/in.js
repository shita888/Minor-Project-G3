 
  function generateRain(containerId, count) {
    const container = document.getElementById(containerId);
    for (let i = 0; i < count; i++) {
      const streak = document.createElement('div');
      streak.className = 'rain-streak';
      streak.style.cssText = `
        left: ${Math.random() * 120 - 10}%;
        height: ${40 + Math.random() * 120}px;
        animation-delay: ${Math.random() * 6}s;
        animation-duration: ${1.8 + Math.random() * 2.5}s;
        opacity: ${0.2 + Math.random() * 0.5};
        top: 0;
      `;
      container.appendChild(streak);
    }
  }
  generateRain('rain', 60);
 