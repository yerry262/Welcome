// Particle System
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.connections = [];
    this.mouse = { x: null, y: null, radius: 150 };
    this.particleCount = 80;
    this.maxDistance = 120;

    this.resize();
    this.init();
    this.setupEventListeners();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        color: this.getRandomColor()
      });
    }
  }

  getRandomColor() {
    const colors = [
      'rgba(0, 255, 242, 0.8)',   // cyan
      'rgba(255, 0, 255, 0.6)',    // pink
      'rgba(176, 0, 255, 0.7)',    // purple
      'rgba(0, 102, 255, 0.7)'     // blue
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.resize();
      this.init();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;

      // Update coordinate display
      document.getElementById('mouse-x').textContent = String(Math.floor(e.clientX)).padStart(3, '0');
      document.getElementById('mouse-y').textContent = String(Math.floor(e.clientY)).padStart(3, '0');
    });

    window.addEventListener('mouseout', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }

  update() {
    for (let particle of this.particles) {
      // Mouse interaction
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = particle.x - this.mouse.x;
        const dy = particle.y - this.mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.mouse.radius) {
          const force = (this.mouse.radius - distance) / this.mouse.radius;
          const angle = Math.atan2(dy, dx);
          particle.vx += Math.cos(angle) * force * 0.5;
          particle.vy += Math.sin(angle) * force * 0.5;
        }
      }

      // Apply velocity with damping
      particle.vx *= 0.99;
      particle.vy *= 0.99;

      // Constrain velocity
      const maxVel = 2;
      particle.vx = Math.max(-maxVel, Math.min(maxVel, particle.vx));
      particle.vy = Math.max(-maxVel, Math.min(maxVel, particle.vy));

      particle.x += particle.vx;
      particle.y += particle.vy;

      // Wrap around edges
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw connections
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.maxDistance) {
          const opacity = 1 - (distance / this.maxDistance);
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(0, 255, 242, ${opacity * 0.3})`;
          this.ctx.lineWidth = 1;
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }

    // Draw particles
    for (let particle of this.particles) {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = particle.color;
      this.ctx.fill();

      // Glow effect
      this.ctx.shadowColor = particle.color;
      this.ctx.shadowBlur = 10;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

// Typing Effect
class TypeWriter {
  constructor(element, texts, speed = 50) {
    this.element = element;
    this.texts = texts;
    this.speed = speed;
    this.textIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    this.type();
  }

  type() {
    const currentText = this.texts[this.textIndex];

    if (this.isDeleting) {
      this.element.textContent = currentText.substring(0, this.charIndex - 1);
      this.charIndex--;
    } else {
      this.element.textContent = currentText.substring(0, this.charIndex + 1);
      this.charIndex++;
    }

    let delay = this.isDeleting ? this.speed / 2 : this.speed;

    if (!this.isDeleting && this.charIndex === currentText.length) {
      delay = 2000; // Pause at end
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.textIndex = (this.textIndex + 1) % this.texts.length;
      delay = 500; // Pause before new text
    }

    setTimeout(() => this.type(), delay);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Start particle system
  const canvas = document.getElementById('particles');
  new ParticleSystem(canvas);

  // Start typing effect
  const typedOutput = document.getElementById('typed-output');
  const texts = [
    'echo "Welcome to YerryCLA"',
    'nmap -sV digital-frontier',
    'cat /etc/skills | grep -i awesome',
    'curl https://future.ready',
    './build_something_cool.sh',
    'git push origin innovation'
  ];
  new TypeWriter(typedOutput, texts, 60);

  // Add hover sound effect (optional visual feedback)
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      link.style.transition = 'all 0.1s ease';
    });
  });

  // Parallax effect on mouse move
  document.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.01;

    const glitch = document.querySelector('.glitch');
    if (glitch) {
      glitch.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }
  });

  // Console easter egg
  console.log('%c' + `
  ██╗   ██╗███████╗██████╗ ██████╗ ██╗   ██╗ ██████╗██╗      █████╗
  ╚██╗ ██╔╝██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝██╔════╝██║     ██╔══██╗
   ╚████╔╝ █████╗  ██████╔╝██████╔╝ ╚████╔╝ ██║     ██║     ███████║
    ╚██╔╝  ██╔══╝  ██╔══██╗██╔══██╗  ╚██╔╝  ██║     ██║     ██╔══██║
     ██║   ███████╗██║  ██║██║  ██║   ██║   ╚██████╗███████╗██║  ██║
     ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝╚══════╝╚═╝  ╚═╝
  `, 'color: #00fff2; font-family: monospace;');
  console.log('%cWelcome, curious one. 👀', 'color: #ff00ff; font-size: 14px;');
});
