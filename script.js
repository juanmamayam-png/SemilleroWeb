/**
 * INNOVA-SIS | Semillero de Investigación
 * script.js — Funcionalidad JavaScript principal
 * Autor: Equipo INNOVA-SIS
 *
 * Contenido:
 *  1. Inicialización AOS (Animate On Scroll)
 *  2. Navbar: clase "scrolled" y link activo
 *  3. Scroll suave entre secciones
 *  4. Animación de contadores (estadísticas del hero)
 *  5. Filtro de eventos (botones de categoría)
 *  6. Galería + Lightbox con navegación
 *  7. Validación del formulario de contacto
 *  8. Botón "Volver arriba"
 *  9. Año actual en el footer
 */

'use strict'; // Modo estricto: mejores prácticas de JS


/* =============================================
   1. INICIALIZACIÓN DE AOS
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {

  // Inicializa la librería AOS con configuración personalizada
  AOS.init({
    duration: 700,          // Duración de la animación en ms
    easing:   'ease-out-cubic', // Curva de animación
    once:     true,         // La animación ocurre solo una vez
    offset:   80,           // Distancia antes de activar (px)
    delay:    0,
  });


  /* =============================================
     2. NAVBAR – clase "scrolled" y enlace activo
     ============================================= */
  const navbar = document.getElementById('mainNavbar');
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  const sections = document.querySelectorAll('section[id]');

  /**
   * Actualiza el estado de la navbar al hacer scroll:
   * – Añade la clase "scrolled" (fondo más opaco)
   * – Resalta el link del menú correspondiente a la sección visible
   */
  function onScroll() {
    const scrollY = window.scrollY;

    // ---- Clase "scrolled" ----
    if (scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // ---- Link activo según sección visible ----
    let currentSection = '';

    sections.forEach(section => {
      const sectionTop    = section.offsetTop - 100;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollY >= sectionTop && scrollY < sectionBottom) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      // Compara el href del link con la sección actual
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }

  // Ejecuta inmediatamente y en cada evento scroll
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });


  /* =============================================
     3. SCROLL SUAVE
     ============================================= */
  /**
   * Intercepta los clics en todos los enlaces "#..." del sitio
   * y realiza un scroll suave hacia la sección destino.
   * También cierra el menú móvil al navegar.
   */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return; // Ignora "#" vacío

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      // Cierra el menú de Bootstrap en móvil
      const navCollapse = document.getElementById('navMenu');
      if (navCollapse && navCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
        if (bsCollapse) bsCollapse.hide();
      }

      // Scroll suave al destino
      const navHeight = navbar.offsetHeight;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

      window.scrollTo({
        top:      targetPosition,
        behavior: 'smooth',
      });
    });
  });


  /* =============================================
     4. CONTADORES ANIMADOS (hero stats)
     ============================================= */
  /**
   * Anima los números de las estadísticas del hero
   * desde 0 hasta el valor objetivo (data-target).
   * Se activa cuando el elemento entra en el viewport.
   */
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');

  /**
   * Función de animación de conteo
   * @param {HTMLElement} el  – Elemento a animar
   * @param {number}      end – Valor final
   * @param {number}      dur – Duración en ms
   */
  function animateCounter(el, end, dur = 1500) {
    let start    = 0;
    const step   = end / (dur / 16); // Incremento por frame (~60fps)

    const timer  = setInterval(() => {
      start += step;
      if (start >= end) {
        el.textContent = end;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(start);
      }
    }, 16);
  }

  // IntersectionObserver para activar cuando el elemento sea visible
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el     = entry.target;
          const target = parseInt(el.dataset.target, 10);
          animateCounter(el, target);
          counterObserver.unobserve(el); // Solo ejecuta una vez
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));
  }


  /* =============================================
     5. FILTRO DE EVENTOS
     ============================================= */
  /**
   * Botones de filtro en la sección Eventos.
   * Filtra las tarjetas de eventos según su data-category.
   */
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const eventItems  = document.querySelectorAll('.event-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {

      // Actualiza estado activo del botón
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter; // "all" | "taller" | "conferencia" | "concurso"

      eventItems.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          // Muestra el elemento con animación
          item.classList.remove('hidden');
          item.style.animation = 'fadeInUp 0.4s ease forwards';
        } else {
          // Oculta el elemento
          item.classList.add('hidden');
        }
      });
    });
  });


  /* =============================================
     6. GALERÍA + LIGHTBOX
     ============================================= */
  /**
   * Galería de imágenes con modal tipo lightbox.
   * Permite navegar entre imágenes con botones o teclado.
   */
  const galleryItems   = document.querySelectorAll('.gallery-item');
  const lightboxModal  = document.getElementById('lightboxModal');
  const lightboxOverlay= document.getElementById('lightboxOverlay');
  const lightboxContent= document.getElementById('lightboxContent');
  const lightboxClose  = document.getElementById('lightboxClose');
  const lightboxPrev   = document.getElementById('lightboxPrev');
  const lightboxNext   = document.getElementById('lightboxNext');

  let currentIndex = 0; // Índice de la imagen activa

  // Datos de cada item de la galería
  const galleryData = Array.from(galleryItems).map(item => ({
    title:   item.dataset.title || 'Imagen',
    index:   parseInt(item.dataset.index, 10),
    // En producción: item.querySelector('img').src
    bgClass: item.querySelector('[class^="gallery-placeholder"]')?.className || '',
    icon:    item.querySelector('.gallery-placeholder i')?.className || 'fa-solid fa-image',
  }));

  /**
   * Abre el lightbox mostrando el item del índice dado
   * @param {number} index – Índice en galleryData
   */
  function openLightbox(index) {
    currentIndex = index;
    renderLightbox();
    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Evita scroll de fondo
  }

  /** Cierra el lightbox */
  function closeLightbox() {
    lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  /** Muestra el contenido del item actual */
  function renderLightbox() {
    const item = galleryData[currentIndex];

    // Obtiene las clases del placeholder para replicar el color de fondo
    const originalPlaceholder = galleryItems[currentIndex].querySelector('.gallery-placeholder');
    const placeholderClasses   = originalPlaceholder ? originalPlaceholder.className : 'gallery-placeholder';

    lightboxContent.innerHTML = `
      <div class="lb-placeholder ${placeholderClasses}" style="width:600px;max-width:80vw;height:400px;border-radius:12px;">
        <i class="${item.icon}" style="font-size:4rem;opacity:0.6;"></i>
      </div>
      <p class="lb-caption">${item.title} (${currentIndex + 1} / ${galleryData.length})</p>
    `;
  }

  /** Avanza al siguiente item */
  function nextItem() {
    currentIndex = (currentIndex + 1) % galleryData.length;
    renderLightbox();
  }

  /** Retrocede al item anterior */
  function prevItem() {
    currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
    renderLightbox();
  }

  // Eventos: click en cada item de la galería
  galleryItems.forEach((item, idx) => {
    item.addEventListener('click', () => openLightbox(idx));
  });

  // Botones de cierre y navegación
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxOverlay.addEventListener('click', closeLightbox);
  lightboxNext.addEventListener('click', nextItem);
  lightboxPrev.addEventListener('click', prevItem);

  // Navegación con teclado
  document.addEventListener('keydown', (e) => {
    if (!lightboxModal.classList.contains('active')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowRight') nextItem();
    if (e.key === 'ArrowLeft')  prevItem();
  });

  // Soporte de swipe táctil básico en móvil
  let touchStartX = 0;

  lightboxContent.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightboxContent.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextItem() : prevItem();
    }
  }, { passive: true });


  /* =============================================
     7. VALIDACIÓN DEL FORMULARIO DE CONTACTO
     ============================================= */
  /**
   * Validación del lado cliente sin backend.
   * Marca campos inválidos, muestra mensajes de error
   * y simula un "envío" con feedback visual al usuario.
   */
  const contactForm  = document.getElementById('contactForm');
  const submitBtn    = document.getElementById('submitBtn');
  const btnText      = submitBtn?.querySelector('.btn-text');
  const btnLoading   = submitBtn?.querySelector('.btn-loading');
  const successAlert = document.getElementById('successAlert');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Previene recarga de página

      // Agrega clase de Bootstrap para mostrar validación visual
      contactForm.classList.add('was-validated');

      // Verifica validez nativa del formulario
      if (!contactForm.checkValidity()) {
        // Hace foco en el primer campo inválido
        const firstInvalid = contactForm.querySelector(':invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // --- Formulario válido: simular envío ---

      // Muestra estado de carga
      btnText.classList.add('d-none');
      btnLoading.classList.remove('d-none');
      submitBtn.disabled = true;

      // Simula latencia de red (en producción: usar fetch() a un backend o EmailJS)
      setTimeout(() => {
        // Oculta estado de carga
        btnText.classList.remove('d-none');
        btnLoading.classList.add('d-none');
        submitBtn.disabled = false;

        // Muestra mensaje de éxito
        successAlert.classList.remove('d-none');

        // Resetea el formulario
        contactForm.reset();
        contactForm.classList.remove('was-validated');

        // Oculta la alerta tras 5 segundos
        setTimeout(() => {
          successAlert.classList.add('d-none');
        }, 5000);

      }, 1800);

    });

    // Limpia el estado de validación de un campo al modificarlo
    contactForm.querySelectorAll('.custom-input').forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('is-invalid');
      });
    });
  }


  /* =============================================
     8. BOTÓN "VOLVER ARRIBA"
     ============================================= */
  /**
   * Muestra el botón de "volver arriba" después de
   * desplazar 400px hacia abajo en la página.
   */
  const backToTopBtn = document.getElementById('backToTop');

  if (backToTopBtn) {
    // Actualiza visibilidad del botón al hacer scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    // Al hacer clic: regresa al inicio suavemente
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /* =============================================
     9. AÑO ACTUAL EN EL FOOTER
     ============================================= */
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }


  /* =============================================
     10. ANIMACIÓN ADICIONAL: HOVER EN LÍNEAS DE TIEMPO
     ============================================= */
  /**
   * Añade efecto de highlight a los items de la línea de tiempo
   * al pasar el cursor.
   */
  document.querySelectorAll('.tl-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.querySelector('.tl-dot')?.classList.add('hovered');
    });
    item.addEventListener('mouseleave', () => {
      item.querySelector('.tl-dot')?.classList.remove('hovered');
    });
  });


  /* =============================================
     11. REFRESH DE AOS AL CAMBIAR PESTAÑAS (Bootstrap Tabs)
     ============================================= */
  /**
   * Cuando el usuario cambia de pestaña (equipos, publicaciones),
   * AOS necesita recalcular las posiciones para las animaciones.
   */
  document.querySelectorAll('[data-bs-toggle="pill"]').forEach(tab => {
    tab.addEventListener('shown.bs.tab', () => {
      AOS.refresh();
    });
  });


  /* =============================================
     12. EFECTO PARALLAX SUTIL EN HERO
     ============================================= */
  /**
   * Mueve levemente los orbes del fondo del hero
   * en función del movimiento del ratón (desktop only).
   */
  const hero = document.getElementById('inicio');
  const orbs = document.querySelectorAll('.orb');

  if (hero && window.innerWidth > 992) {
    hero.addEventListener('mousemove', (e) => {
      const { clientX: x, clientY: y } = e;
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;

      orbs.forEach((orb, i) => {
        const factor = (i + 1) * 0.015;
        const moveX  = (x - cx) * factor;
        const moveY  = (y - cy) * factor;
        orb.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    });
  }


  /* =============================================
     13. EFECTO TYPEWRITER EN EL LEMA DEL HERO
     ============================================= */
  /**
   * Efecto de máquina de escribir en el lema/tagline del hero.
   * Borra y reescribe diferentes frases en bucle.
   */
  const taglineEl = document.querySelector('.hero-tagline');

  if (taglineEl) {
    const phrases = [
      '"Sembramos ideas, cosechamos conocimiento."',
      '"Innovar hoy para transformar el mañana."',
      '"Ciencia, tecnología y pasión por aprender."',
      '"Investigamos para impactar al mundo."',
    ];

    let phraseIndex = 0;
    let charIndex   = 0;
    let isDeleting  = false;
    let isPaused    = false;

    /**
     * Función recursiva del efecto typewriter
     */
    function typeWriter() {
      if (isPaused) return;

      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        // Borra un carácter
        charIndex--;
        taglineEl.textContent = currentPhrase.substring(0, charIndex);
      } else {
        // Escribe un carácter
        charIndex++;
        taglineEl.textContent = currentPhrase.substring(0, charIndex);
      }

      let delay = isDeleting ? 40 : 80; // Velocidad de borrado vs escritura

      // Al terminar de escribir: pausa, luego borra
      if (!isDeleting && charIndex === currentPhrase.length) {
        delay = 2500; // Pausa al completar la frase
        isDeleting = true;
      }

      // Al terminar de borrar: pasa a la siguiente frase
      if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 400; // Pausa antes de empezar la siguiente
      }

      setTimeout(typeWriter, delay);
    }

    // Inicia el efecto después de 2 segundos
    setTimeout(typeWriter, 2000);
  }

  /* Fin del bloque DOMContentLoaded */
});


/* =============================================
   UTILIDAD: Animación CSS dinámica (fadeInUp)
   ============================================= */
/**
 * Agrega la keyframe fadeInUp al document si no existe,
 * usada por el filtro de eventos.
 */
(function injectKeyframe() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
})();
