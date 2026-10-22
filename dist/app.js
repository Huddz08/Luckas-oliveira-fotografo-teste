(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
  const fallbackImages = {
    hero: 'assets/hero-wedding.webp',
    story: 'assets/wedding-story.webp',
    portrait: 'assets/portrait.webp',
    family: 'assets/family.webp'
  };

  // Only images checked into this site's public asset folder may be used.
  function imagePath(value, fallback = fallbackImages.hero) {
    if (typeof value !== 'string') return fallback;
    const clean = value.replace(/^\//, '');
    return /^assets\/[a-z0-9_./-]+\.(png|jpe?g|webp|gif|avif)$/i.test(clean) && !clean.includes('..')
      ? clean : fallback;
  }

  const money = value => new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL'
  }).format(value);

  const content = {
    services: [],
    portfolio: [],
    testimonials: [],
    about: {},
    appearance: {},
    promotion: { active: false }
  };
  let toastTimer;

  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('visible'), 3500);
  }
  function showModal(id) {
    const dialog = $('#' + id);
    if (dialog && !dialog.open) dialog.showModal();
  }
  function closeModal(button) {
    const dialog = button.closest('dialog');
    if (dialog?.open) dialog.close();
  }

  $$('[data-close-dialog]').forEach(button =>
    button.addEventListener('click', () => closeModal(button))
  );
  $$('dialog').forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  }));

  function renderAppearance() {
    $('#heroImage').style.backgroundImage = `url("${imagePath(content.appearance.heroImage)}")`;
    $('#storyImageStrip > div:first-child').style.backgroundImage =
      `linear-gradient(90deg,rgba(29,29,31,.48),rgba(24,24,26,.11)),url("${imagePath(content.appearance.storyImage, fallbackImages.story)}")`;
  }

  function renderAbout() {
    const about = content.about;
    const portrait = $('#aboutPortrait');
    const illustrative = about.portraitIsIllustrative !== false;
    portrait.src = imagePath(about.portrait, 'assets/luckas-sobre-ilustrativo.webp');
    portrait.alt = illustrative
      ? 'Fotógrafo anônimo em estúdio — imagem ilustrativa, não é Luckas Oliveira'
      : 'Retrato de Luckas Oliveira';
    $('#aboutPortraitCaption').textContent = about.portraitCaption ||
      (illustrative ? 'IMAGEM ILUSTRATIVA · AGUARDANDO RETRATO REAL' : 'LUCKAS OLIVEIRA · FOTOGRAFIA');
    const fieldIds = {
      intro: '#aboutIntro',
      biography: '#aboutBiography',
      journey: '#aboutJourney',
      philosophy: '#aboutPhilosophy'
    };
    Object.entries(fieldIds).forEach(([field, selector]) => {
      if (typeof about[field] === 'string') $(selector).textContent = about[field];
    });
    const note = $('#aboutNote');
    note.textContent = about.note || '';
    note.hidden = !about.note;
  }

  function renderPortfolio() {
    const collections = content.services
      .filter(service => service.visible !== false)
      .map(service => ({ service, album: content.portfolio.find(item => item.serviceId === service.id) }))
      .filter(item => item.album && item.album.visible !== false);
    const grid = $('#portfolioGrid');
    grid.innerHTML = collections.length
      ? collections.map(({ service, album }, index) => `
        <button class="portfolio-card collection-card" type="button" data-collection-index="${index}" aria-label="Abrir portfólio: ${escapeHTML(service.title)}">
          <span class="photo"><img src="${imagePath(album.cover, fallbackImages.portrait)}" alt="${escapeHTML(service.title)} — imagem ilustrativa" loading="lazy" /><span class="collection-overlay">VER FOTOS E PACOTE <span aria-hidden="true">↗</span></span></span>
          <span class="photo-label"><strong>${escapeHTML(service.title)}</strong><span>${escapeHTML(service.category || 'FOTOGRAFIA')}</span></span>
        </button>`).join('')
      : '<p class="portfolio-empty">As galerias estão sendo preparadas. Entre em contato para ver mais informações.</p>';

    $$('[data-collection-index]', grid).forEach(button => button.addEventListener('click', () => {
      const collection = collections[Number(button.dataset.collectionIndex)];
      if (collection) openPortfolio(collection.service, collection.album);
    }));
  }

  function openPortfolio(service, album) {
    const photos = (Array.isArray(album.photos) ? album.photos : [])
      .filter(item => item && typeof item.image === 'string' && item.image.trim());
    const offer = effectiveOffer(service);
    const hasOffer = offer.discount !== null;
    const details = Array.isArray(service.details) ? service.details : [];
    const contentArea = $('#portfolioContent');
    const cover = imagePath(album.cover, fallbackImages.portrait);
    contentArea.innerHTML = `
      <div class="collection-intro">
        <div class="collection-cover"><img src="${cover}" alt="${escapeHTML(service.title)} — foto ilustrativa" /></div>
        <div class="collection-intro-copy">
          <span class="collection-kicker">${escapeHTML(service.category || 'FOTOGRAFIA')} / PORTFÓLIO</span>
          <h2>${escapeHTML(service.title)}</h2>
          <p>${escapeHTML(service.description || '')}</p>
          <div class="collection-plan">
            <div class="collection-investment">
              <span class="collection-plan-label">INVESTIMENTO</span>
              ${offer.regular === null ? '<strong class="collection-price">Sob consulta</strong>' : `
                ${hasOffer ? `<del>${money(offer.regular)}</del>` : ''}
                <strong class="collection-price">${money(hasOffer ? offer.discount : offer.regular)}</strong>
                ${hasOffer ? `<span class="collection-offer-label">${escapeHTML(offer.label)}</span>` : ''}`}
            </div>
            ${details.length ? `<div class="collection-details"><span class="collection-plan-label">DETALHES DO PACOTE</span><ul>${details.map(detail => `<li>${escapeHTML(detail)}</li>`).join('')}</ul></div>` : ''}
            <span class="collection-plan-note">Valores e condições sujeitos à confirmação com Luckas.</span>
          </div>
          <span class="collection-count">${photos.length} ${photos.length === 1 ? 'IMAGEM' : 'IMAGENS'} NESTA GALERIA</span>
          <button type="button" class="collection-primary" id="collectionQuote">Conversar sobre este serviço <span aria-hidden="true">↗</span></button>
        </div>
      </div>
      <div class="collection-gallery-area">
        <div class="collection-gallery-heading"><h3>Um olhar sobre <em>esta experiência.</em></h3><p>Imagens ilustrativas para este protótipo. O acervo real será incluído por Luckas.</p></div>
        <div class="collection-photo-grid">${photos.map((photo, index) => `
          <button type="button" class="collection-photo" data-gallery-photo="${index}" aria-label="Ampliar: ${escapeHTML(photo.caption || service.title)}">
            <img src="${imagePath(photo.image, cover)}" loading="lazy" alt="${escapeHTML(photo.caption || service.title)}" />
            <span>${escapeHTML(photo.caption || service.title)}</span>
          </button>`).join('') || '<p>Em breve, novas imagens nesta galeria.</p>'}
        </div>
      </div>`;
    $('#collectionQuote').addEventListener('click', () => {
      $('#portfolioDialog').close();
      openContact(service.title);
    });
    $$('[data-gallery-photo]', contentArea).forEach(button => button.addEventListener('click', () => {
      const photo = photos[Number(button.dataset.galleryPhoto)];
      if (!photo) return;
      $('#lightboxImage').src = imagePath(photo.image, cover);
      $('#lightboxImage').alt = String(photo.caption || service.title);
      $('#lightboxTitle').textContent = photo.caption || service.title;
      $('#lightboxType').textContent = service.category || 'FOTOGRAFIA';
      showModal('imageDialog');
    }));
    $('#portfolioDialog').scrollTop = 0;
    showModal('portfolioDialog');
  }

  function effectiveOffer(service) {
    const regular = Number(service.price);
    if (!Number.isFinite(regular) || regular < 0) return { regular: null, discount: null };
    const individual = Number(service.promotion?.price);
    if (service.promotion?.active === true && !offerExpired(service.promotion) && individual > 0 && individual < regular) {
      return { regular, discount: individual, label: service.promotion.label || 'OFERTA ESPECIAL' };
    }
    const global = content.promotion;
    const percent = Number(global.discountPercent);
    if (global.active === true && !offerExpired(global) && global.applyToAll === true && percent > 0 && percent < 100) {
      const discounted = Math.round(regular * (1 - percent / 100) * 100) / 100;
      return { regular, discount: discounted, label: `${percent}% OFF` };
    }
    return { regular, discount: null, label: '' };
  }

  function offerExpired(offer) {
    return Boolean(offer?.validUntil && offer.validUntil < new Date().toISOString().slice(0, 10));
  }

  function renderServiceOptions() {
    const services = content.services.filter(service => service.visible !== false);
    const select = $('#serviceSelect');
    const previous = select.value;
    select.replaceChildren();
    services.forEach(service => select.add(new Option(String(service.title), String(service.title))));
    select.add(new Option('Outro serviço', 'Outro'));
    if ([...select.options].some(option => option.value === previous)) select.value = previous;
  }

  function renderTestimonials() {
    const list = $('#testimonialsList');
    const items = Array.isArray(content.testimonials)
      ? content.testimonials.filter(item => item && item.visible !== false)
      : [];
    if (!items.length) {
      list.innerHTML = '<p class="testimonial-loading">Em breve, histórias para compartilhar.</p>';
      return;
    }
    list.innerHTML = items.map((item, index) => `
        <article class="testimonial-story ${index % 2 === 0 ? 'photo-right' : 'photo-left'} ${index === 0 ? 'is-active' : ''}" role="group" aria-roledescription="slide" aria-label="${index + 1} de ${items.length}" aria-hidden="${index !== 0}">
          <div class="testimonial-copy">
            <span class="testimonial-quote-mark" aria-hidden="true">“</span>
            <blockquote>${escapeHTML(item.quote || '')}</blockquote>
            <div class="testimonial-person"><strong>${escapeHTML(item.name || 'Cliente ilustrativo')}</strong><span>${escapeHTML(item.type || 'Experiência fotográfica')} · Personagem fictício</span></div>
          </div>
          <div class="testimonial-portrait"><img src="${imagePath(item.image, fallbackImages.portrait)}" alt="Retrato ilustrativo de ${escapeHTML(item.name || 'uma pessoa fictícia')}" loading="lazy" /></div>
        </article>`).join('');
  }

  function setupTestimonialsCarousel() {
    const viewport = $('#testimonialsViewport');
    const track = $('#testimonialsList');
    const slides = $$('.testimonial-story', track);
    const controls = $('#testimonialControls');
    const dots = $('#testimonialDots');
    const prev = $('#testimonialPrev');
    const next = $('#testimonialNext');
    const pause = $('#testimonialPause');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let index = 0;
    let direction = 1;
    let timer = null;
    let isInView = false;
    let isHovered = false;
    let hasFocus = false;
    let isPaused = reducedMotion;

    if (!slides.length) {
      controls.hidden = true;
      return;
    }
    $('#testimonialTotal').textContent = String(slides.length).padStart(2, '0');
    controls.hidden = slides.length === 1;
    dots.innerHTML = slides.map((_, n) =>
      `<button type="button" class="testimonial-dot" aria-label="Ver depoimento ${n + 1} de ${slides.length}" aria-current="${n === 0}" data-testimonial-dot="${n}"></button>`
    ).join('');
    const dotButtons = $$('[data-testimonial-dot]', dots);

    function showSlide(value) {
      index = Math.min(slides.length - 1, Math.max(0, value));
      track.style.transform = `translate3d(-${index * 100}%, 0, 0)`;
      slides.forEach((slide, n) => {
        slide.classList.toggle('is-active', n === index);
        slide.setAttribute('aria-hidden', String(n !== index));
      });
      dotButtons.forEach((dot, n) => dot.setAttribute('aria-current', String(n === index)));
      $('#testimonialCurrent').textContent = String(index + 1).padStart(2, '0');
      prev.disabled = index === 0;
      next.disabled = index === slides.length - 1;
    }

    function syncAutoplay() {
      if (timer) clearInterval(timer);
      timer = null;
      if (slides.length < 2 || isPaused || !isInView || isHovered || hasFocus || document.hidden) return;
      timer = setInterval(() => {
        if (index === slides.length - 1) direction = -1;
        else if (index === 0) direction = 1;
        showSlide(index + direction);
      }, 5600);
    }

    function manualSlide(value) {
      showSlide(value);
      syncAutoplay();
    }

    prev.addEventListener('click', () => manualSlide(index - 1));
    next.addEventListener('click', () => manualSlide(index + 1));
    dotButtons.forEach((dot, n) => dot.addEventListener('click', () => manualSlide(n)));
    function updatePauseButton() {
      pause.textContent = isPaused ? '▶' : 'Ⅱ';
      pause.setAttribute('aria-label', isPaused ? 'Iniciar transição automática' : 'Pausar transição automática');
      pause.setAttribute('aria-pressed', String(isPaused));
    }
    pause.addEventListener('click', () => {
      isPaused = !isPaused;
      updatePauseButton();
      syncAutoplay();
    });
    updatePauseButton();

    [viewport, controls].forEach(region => {
      region.addEventListener('focusin', () => { hasFocus = true; syncAutoplay(); });
      region.addEventListener('focusout', event => {
        if (!viewport.contains(event.relatedTarget) && !controls.contains(event.relatedTarget)) {
          hasFocus = false;
          syncAutoplay();
        }
      });
    });
    viewport.addEventListener('mouseenter', () => { isHovered = true; syncAutoplay(); });
    viewport.addEventListener('mouseleave', () => { isHovered = false; syncAutoplay(); });
    viewport.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        manualSlide(index + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    let touchStartX = 0;
    let touchStartY = 0;
    viewport.addEventListener('touchstart', event => {
      touchStartX = event.changedTouches[0].clientX;
      touchStartY = event.changedTouches[0].clientY;
    }, { passive: true });
    viewport.addEventListener('touchend', event => {
      const dx = event.changedTouches[0].clientX - touchStartX;
      const dy = event.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) manualSlide(index + (dx < 0 ? 1 : -1));
    }, { passive: true });
    document.addEventListener('visibilitychange', syncAutoplay);
    const observer = new IntersectionObserver(entries => {
      isInView = entries[0].intersectionRatio > 0.55;
      syncAutoplay();
    }, { threshold: [0, 0.55, 0.8] });
    observer.observe(viewport);
    showSlide(0);
  }

  function renderPromotion() {
    const promotion = content.promotion;
    const band = $('#promotionBand');
    band.hidden = promotion.active !== true || offerExpired(promotion);
    if (band.hidden) return;
    $('#promotionLabel').textContent = promotion.label || 'CAMPANHA ESPECIAL';
    $('#promotionTitle').textContent = promotion.title || 'Uma oportunidade especial';
    $('#promotionDescription').textContent = promotion.description || 'Consulte os detalhes da campanha.';
  }

  function openContact(service = '') {
    const select = $('#serviceSelect');
    if (service) {
      if (![...select.options].some(option => option.value === service)) select.add(new Option(service, service));
      select.value = service;
    }
    showModal('contactDialog');
  }

  const header = $('#siteHeader');
  const updateScroll = () => header.classList.toggle('scrolled', window.scrollY > 55);
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();
  $('#mobileToggle').addEventListener('click', () => {
    const nav = $('#primaryNav');
    const opened = nav.classList.toggle('open');
    $('#mobileToggle').setAttribute('aria-expanded', String(opened));
  });
  $$('#primaryNav a').forEach(anchor => anchor.addEventListener('click', () => {
    $('#primaryNav').classList.remove('open');
    $('#mobileToggle').setAttribute('aria-expanded', 'false');
  }));

  // Public gallery is demonstrative only, with no credentials or real Drive links.
  function resetPortal() {
    $('#portalContent').innerHTML = `
      <div class="small-kicker">ACESSO À GALERIA</div><h3>Que bom ter<br />você aqui.</h3>
      <form id="portalForm"><label for="galleryCode">Código de acesso</label>
      <input id="galleryCode" type="text" placeholder="Ex.: LUCKAS2026" autocomplete="off" required />
      <button class="dark-submit" type="submit">Ver minhas fotos <span>↗</span></button></form>
      <p class="demo-tip">Para explorar o protótipo, use o código <button id="fillDemoCode" type="button">LUCKAS2026</button>.</p>
      <p class="portal-error" id="portalError" role="alert"></p>
      <small>Protótipo: este código não oferece segurança real. Não use com fotos privadas.</small>`;
    $('#portalForm').addEventListener('submit', event => {
      event.preventDefault();
      if ($('#galleryCode').value.trim().toUpperCase() !== 'LUCKAS2026') {
        $('#portalError').textContent = 'Código não encontrado. Para testar, use LUCKAS2026.';
        return;
      }
      $('#portalContent').innerHTML = `
        <div class="gallery-success"><div class="small-kicker">GALERIA DE DEMONSTRAÇÃO</div>
        <h3>Uma história para guardar</h3>
        <p>Uma amostra ilustrativa da futura experiência do cliente.</p>
        <div class="gallery-preview">
          <img src="${fallbackImages.story}" alt="Foto ilustrativa de casamento" />
          <img src="${fallbackImages.hero}" alt="Foto ilustrativa" />
          <img src="${fallbackImages.portrait}" alt="Foto ilustrativa de retrato" />
        </div>
        <button class="dark-submit" id="driveDemo" type="button">Entrega pelo Google Drive ↗</button>
        <button class="back-link" id="anotherCode" type="button">Usar outro código</button>
        <p class="form-footnote">Galeria demonstrativa. Não é uma área privada real.</p></div>`;
      $('#anotherCode').addEventListener('click', resetPortal);
      $('#driveDemo').addEventListener('click', () =>
        toast('A integração segura com o Google Drive ficará para uma próxima etapa.'));
    });
    $('#fillDemoCode').addEventListener('click', () => {
      $('#galleryCode').value = 'LUCKAS2026';
      $('#galleryCode').focus();
    });
  }
  resetPortal();
  $$('[data-open-portal]').forEach(button =>
    button.addEventListener('click', () => { resetPortal(); showModal('portalDialog'); })
  );
  $$('[data-open-contact]').forEach(button =>
    button.addEventListener('click', () => openContact(button.dataset.service || ''))
  );
  $('#contactForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    const date = String(form.get('date') || '').trim();
    const service = String(form.get('service') || '').trim();
    const message = String(form.get('message') || '').trim() || 'Não informado.';
    const body = [
      'Olá, Luckas!', '',
      'Vi seu site e gostaria de solicitar um orçamento.', '',
      `Nome: ${name}`, `Serviço: ${service}`,
      ...(date ? [`Data desejada: ${date}`] : []), '',
      'Detalhes:', message
    ].join('\n');
    window.location.href = `https://wa.me/5521964963444?text=${encodeURIComponent(body)}`;
  });

  async function loadJSON(filename) {
    const response = await fetch(`content/${filename}.json`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Arquivo indisponível: ${filename}`);
    return response.json();
  }
  async function start() {
    const files = ['services', 'portfolio', 'appearance', 'promotion', 'testimonials', 'about'];
    const results = await Promise.allSettled(files.map(loadJSON));
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') content[files[index]] = result.value;
      else console.warn('Conteúdo não carregado:', files[index]);
    });
    // Conteúdo dinâmico da Cloudflare tem prioridade; os JSON do GitHub são o fallback.
    // Este endpoint contém apenas dados publicáveis, nunca fotos privadas ou senhas.
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      let response;
      try {
        response = await fetch('https://luckas-fotografia-api.hudsonamorim08.workers.dev/api/content',
          {cache:'no-store',signal:controller.signal});
      } finally {
        clearTimeout(timeout);
      }
      if (response.ok) {
        const result = await response.json();
        if (result.configured && result.content) {
          files.forEach(name => {
            if (Object.prototype.hasOwnProperty.call(result.content,name)) content[name]=result.content[name];
          });
        }
      }
    } catch (_error) {
      // Se a API falhar, o site continua disponível com os dados estáticos.
    }
    if (!Array.isArray(content.services)) content.services = [];
    if (!Array.isArray(content.portfolio)) content.portfolio = [];
    if (!Array.isArray(content.testimonials)) content.testimonials = [];
    if (!content.about || typeof content.about !== 'object') content.about = {};
    if (!content.appearance || typeof content.appearance !== 'object') content.appearance = {};
    if (!content.promotion || typeof content.promotion !== 'object') content.promotion = { active: false };
    renderAppearance();
    renderAbout();
    renderPortfolio();
    renderServiceOptions();
    renderPromotion();
    renderTestimonials();
    setupTestimonialsCarousel();
  }
  start();
})();
