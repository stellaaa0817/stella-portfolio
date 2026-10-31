(() => {
  'use strict';
  const data = window.PORTFOLIO;
  const projects = data.projects.filter(project => project.published);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const url = value => /^(https?:\/\/|mailto:|[^:/?#]+(?:\/|\.|$))/.test(value || '') ? escape(value) : '';
  const previewUrl = value => url(value?.startsWith('assets/evidence/') && value.endsWith('.png') ? value.replace(/\.png$/, '.webp') : value);
  const icon = (name, alt = '') => `<img src="assets/icons/${escape(name)}${name.includes('.') ? '' : '.svg'}" alt="${escape(alt)}" loading="lazy">`;
  const tool = ([name, mark, purpose, level = 75], detailed = false) => `<div class="tool-chip${detailed ? ' tool-chip-detail' : ''}" tabindex="0" aria-label="${escape(name)}: ${escape(purpose)}, ${level}% proficiency">${icon(mark)}<strong class="tool-name">${escape(name)}</strong>${detailed ? `<small>${escape(purpose)}</small>` : `<span class="tool-meter" aria-hidden="true"><span style="width:${level}%"></span></span><small class="tool-percent">${level}%</small>`}<span class="tooltip" role="tooltip">${escape(name)} · ${level}%</span></div>`;
  document.querySelector('#about-tools').innerHTML = data.tools.map(item => tool(item)).join('');
  document.querySelectorAll('.stella-badge-name').forEach(node => { node.firstChild.textContent = data.profile.name; });
  document.querySelectorAll('.stella-card-top span:last-child').forEach(node => { node.textContent = `${data.profile.name.toUpperCase()} / 001`; });
  document.querySelector('#project-grid').innerHTML = projects.map((p, i) => `
    <article class="project" id="${escape(p.id)}">
      <button class="project-link" type="button" data-project="${escape(p.id)}" aria-haspopup="dialog" aria-controls="project-detail" aria-label="Open ${escape(p.title)} project">
        <div class="visual"><img class="cover-image" src="${url(p.coverImage)}" alt="${escape(p.title)} — transparent 3D project icon" loading="lazy" width="1254" height="1254"><span class="badge glass">0${i + 1} / ${escape(p.category)}</span><span class="arrow">${icon('arrow-up-right')}</span></div>
        <div class="project-info"><div><small>${escape(p.brand)}</small><h3>${escape(p.title)}</h3></div><p>${escape(p.description)}</p></div>
      </button>
    </article>`).join('');
  const {email,phone,whatsapp,wechat,linkedin} = data.profile;
  const contactRows = [
    email && `<a class="contact-link" href="mailto:${escape(email)}">${icon('envelope')}<span><b>EMAIL</b><small>${escape(email)}</small></span>${icon('arrow-up-right')}</a>`,
    phone && `<a class="contact-link" href="tel:${escape(phone.replace(/\s/g,''))}">${icon('phone')}<span><b>PHONE</b><small>${escape(phone)}</small></span>${icon('arrow-up-right')}</a>`,
    whatsapp && `<a class="contact-link" href="https://wa.me/${escape(whatsapp)}" target="_blank" rel="noopener noreferrer">${icon('whatsapp')}<span><b>WHATSAPP</b><small>${escape(phone)}</small></span>${icon('arrow-up-right')}</a>`,
    wechat && `<button class="contact-link wechat-copy" type="button" data-copy-wechat="${escape(wechat)}" aria-label="Copy WeChat ID ${escape(wechat)}">${icon('wechat')}<span><b>WECHAT</b><small>${escape(wechat)}</small></span>${icon('copy')}</button>`,
    linkedin && `<a class="contact-link" href="${url(linkedin)}" target="_blank" rel="noopener noreferrer">${icon('arrow-up-right')}<span><b>LINKEDIN</b><small>Open profile</small></span>${icon('arrow-up-right')}</a>`
  ].filter(Boolean).join('');
  document.querySelector('#contact-method').innerHTML = `<div class="contact-info-panel"><div class="contact-links" aria-label="Ways to contact Stella Wen">${contactRows}</div><span class="copy-feedback" role="status" aria-live="polite"></span></div>`;
  document.querySelector('[data-copy-wechat]')?.addEventListener('click', async event => {
    const id = event.currentTarget.dataset.copyWechat;
    try { await navigator.clipboard.writeText(id); document.querySelector('.copy-feedback').textContent = 'WeChat ID copied'; }
    catch { document.querySelector('.copy-feedback').textContent = `WeChat ID: ${id}`; }
  });

  const dialog = document.querySelector('#project-detail');
  const detail = document.querySelector('#detail-content');
  let selectedProject = null;
  let opener = null;
  const ready = item => Boolean(item.source && url(item.source) && ['ready','verified','published'].includes(item.status));
  const mediaItem = item => `<figure class="media-item">${item.mediaType === 'video' ? `<video controls preload="none" playsinline ${item.thumbnail ? `poster="${url(item.thumbnail)}"` : ''} aria-label="${escape(item.title)}"><source src="${url(item.source)}">Your browser cannot play this video. <a href="${url(item.source)}">Open video</a></video>` : `<img src="${previewUrl(item.source)}" alt="${escape(item.description || item.title)}" loading="lazy" decoding="async">`}<figcaption>${escape(item.title)}<small>${escape(item.description)}</small>${item.evidenceLink ? `<a href="${url(item.evidenceLink)}" target="_blank" rel="noopener noreferrer">Supporting evidence</a>` : ''}</figcaption></figure>`;
  const missing = (items, title) => `<div class="evidence-empty"><strong>${escape(title)}</strong><p>Original project materials will be added here. No performance claims are presented without supporting evidence.</p><div class="evidence-tags">${items.map(item => `<span>${escape(item.title)}</span>`).join('')}</div></div>`;
  function gallery(items, title, emptyTitle) {
    if (!items.length) return '';
    const available = items.filter(ready);
    return `<section class="detail-block"><h3>${escape(title)}</h3>${available.length ? `<div class="media-grid">${available.map(mediaItem).join('')}</div>` : missing(items, emptyTitle)}</section>`;
  }
  function creativeItems(project, category = 'All') {
    const items = project.actualMedia.filter(item => item.mediaType === 'video' && ready(item) && (category === 'All' || item.contentType === category));
    return items.map(item => ready(item) && item.viewer ? `<a class="media-video-link" href="${url(item.viewer)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escape(item.title)} in a new page"><div class="video-preview-frame"><img src="${url(item.thumbnail)}" alt="" loading="lazy" decoding="async"><span class="video-play-icon" aria-hidden="true">${icon('play-circle')}</span></div><div class="video-preview-copy"><strong>${escape(item.title)}</strong><small>${escape(item.description)}</small><span>WATCH VIDEO ${icon('arrow-up-right')}</span></div></a>` : ready(item) ? mediaItem(item) : `<article class="media-pending">${icon(item.platform || 'play-circle')}<strong>${escape(item.title)}</strong><small>${escape(item.description)}</small><span class="pending-label">ORIGINAL MEDIA COMING SOON</span></article>`).join('');
  }
  function renderBrandCase(project, index) {
    const d = project.detailContent;
    const paragraphs = items => items.map(text => `<p>${escape(text)}</p>`).join('');
    return `<div class="detail-layout detail-layout-brand">
      <div class="detail-top">
        <div><p class="detail-kicker">0${index + 1} / SELECTED WORK</p><h2 id="detail-title">${escape(project.title)}</h2><h3>${escape(d.subtitle)}</h3><p class="brand-headline">${escape(d.headline)}</p><div class="detail-links">${project.externalLinks.map(link => `<a class="pill dark" href="${url(link.url)}" target="_blank" rel="noopener noreferrer">${escape(link.label)} ${icon('arrow-up-right')}</a>`).join('')}</div></div>
        <figure class="detail-art"><img src="${url(project.coverImage)}" alt="Sinoalta brand building project" width="600" height="600"></figure>
      </div>
      <figure class="brand-full-screenshot brand-homepage-preview"><a href="assets/evidence/sinoalta-website-homepage.png" target="_blank" rel="noopener noreferrer" aria-label="Open full-size screenshot"><img src="assets/evidence/sinoalta-website-homepage.webp" alt="Sinoalta website homepage" width="3016" height="1694" loading="lazy" decoding="async"></a><a class="document-open screenshot-open" href="assets/evidence/sinoalta-website-homepage.png" target="_blank" rel="noopener noreferrer"><span>Open full-size screenshot</span>${icon('arrow-up-right')}</a></figure>
      <div class="brand-highlights">${d.highlights.map(([value,label,caption]) => `<div><strong>${escape(value)}</strong><b>${escape(label)}</b><span>${escape(caption)}</span></div>`).join('')}</div>
      <div class="brand-introduction">${paragraphs(d.overviewParagraphs)}</div>
      <div class="detail-story brand-story"><section><h3>THE OPPORTUNITY</h3><h4>${escape(d.opportunityTitle)}</h4>${paragraphs(d.opportunityParagraphs)}</section><section><h3>MY APPROACH</h3><h4>${escape(d.approachTitle)}</h4>${paragraphs(d.approachParagraphs)}</section></div>
      <section class="detail-block brand-builds"><h3>WHAT I BUILT</h3><div class="brand-build-grid">${d.builds.map(([title,body],i) => `<article><span class="build-number">0${i+1}</span><h4>${escape(title)}</h4><p>${escape(body)}</p></article>`).join('')}</div></section>
      <section class="detail-block brand-deliverables"><h3>PROJECT DELIVERABLES</h3><div class="brand-document-grid">${project.documents.map(doc => `<article class="brand-document"><span class="document-type">${escape(doc.type)}</span><h4>${escape(doc.title)}</h4><small>${escape(doc.meta)}</small><p>${escape(doc.description)}</p><a class="document-open" href="${url(doc.viewer || doc.source)}" target="_blank" rel="noopener noreferrer"><span>${doc.viewer ? 'View complete workbook' : 'Open full PDF'}</span>${icon('arrow-up-right')}</a>${doc.viewer ? `<a class="document-download" href="${url(doc.source)}" download>Download XLSX</a>` : ''}</article>`).join('')}</div>
        ${project.actualMedia.filter(ready).map(item => `<figure class="brand-full-screenshot"><figcaption><h4>${escape(item.title)}</h4><p>${escape(item.description)}</p></figcaption><a href="${url(item.source)}" target="_blank" rel="noopener noreferrer" aria-label="Open full-size screenshot"><img src="${previewUrl(item.source)}" alt="${escape(item.title)}" width="2582" height="1720" loading="lazy" decoding="async"></a><a class="document-open screenshot-open" href="${url(item.source)}" target="_blank" rel="noopener noreferrer"><span>Open full-size screenshot</span>${icon('arrow-up-right')}</a></figure>`).join('')}
      </section>
      <section class="detail-block"><h3>WHAT I WORKED ON</h3><div class="action-grid brand-action-grid">${d.actions.map(([label,mark]) => `<div class="action-item">${icon(mark)}<span>${escape(label)}</span></div>`).join('')}</div></section>
      <section class="detail-block detail-outcome brand-outcome"><h3>THE OUTCOME</h3><h4>${escape(d.outcomeTitle)}</h4>${paragraphs(d.outcomeParagraphs)}<div class="brand-takeaway"><h3>MY TAKEAWAY</h3><blockquote>${escape(d.takeaway)}</blockquote></div></section>
      <div class="detail-pagination"><button type="button" data-project="${projects[(index-1+projects.length)%projects.length].id}">${icon('arrow-left')} Previous project</button><small>0${index+1} / 0${projects.length}</small><button type="button" data-project="${projects[(index+1)%projects.length].id}">Next project ${icon('arrow-right')}</button></div>
    </div>`;
  }
  function openProject(id, trigger) {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    if (!dialog.open) opener = trigger || document.activeElement;
    selectedProject = project;
    const index = projects.indexOf(project), d = project.detailContent;
    const actionGrid = d.actions.length ? `<div class="action-grid">${d.actions.map(([name, mark]) => `<div class="action-item">${icon(mark)}<span>${escape(name)}</span></div>`).join('')}</div>` : '';
    const creative = id === 'content' ? `<div class="creative-filters" role="group" aria-label="Filter creative work">${['All',...new Set(project.actualMedia.filter(item => ready(item) && item.mediaType === 'video').map(item => item.contentType))].map((name,i) => `<button type="button" data-filter="${name}" aria-pressed="${i === 0}">${name}</button>`).join('')}</div><div class="media-grid creative-video-grid" id="creative-media" aria-live="polite">${creativeItems(project)}</div>` : '';
    const creativeScreenshots = id === 'content' ? `<section class="detail-block creative-account-section"><h3>SOCIAL ACCOUNT SCREENSHOTS</h3><div class="creative-account-gallery">${project.actualMedia.filter(item => ready(item) && item.mediaType === 'image').map(item => `<figure class="media-item"><a class="account-image-link" href="${url(item.source)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escape(item.title)} full-size screenshot"><img src="${previewUrl(item.source)}" alt="${escape(item.title)}" loading="lazy" decoding="async"></a><figcaption>${escape(item.title)}<small>${escape(item.description)}</small><a class="document-open" href="${url(item.source)}" target="_blank" rel="noopener noreferrer"><span>Open full-size screenshot</span>${icon('arrow-up-right')}</a></figcaption></figure>`).join('')}</div></section>` : '';
    const workflow = id === 'workflow' ? `<div class="workflow-steps">${['RESEARCH','CREATE','EXECUTE','OPTIMIZE'].map((label,i) => `<div class="workflow-step">${icon(d.actions[i][1])}<strong>${label}</strong><small>${escape(d.deliverables[i])}</small></div>`).join('')}</div><h4>TOOLS I USE</h4><div class="detail-tools">${data.tools.map(t => tool(t,true)).join('')}</div>` : '';
    const workMedia = id === 'content' ? creative : gallery(project.actualMedia, id === 'website' ? 'PROJECT PAGES' : 'AD CREATIVES & VIDEO', 'Original project gallery');
    const socialProof = project.socialLinks?.length ? `<div class="social-proof-links">${project.socialLinks.map(link => `<a href="${url(link.url)}" target="_blank" rel="noopener noreferrer">${escape(link.label)} ${icon('arrow-up-right')}</a>`).join('')}</div>` : '';
    const workEvidence = gallery(project.evidence, id === 'workflow' ? 'WORK EXAMPLES' : id === 'advertising' ? 'CAMPAIGN EVIDENCE' : 'SUPPORTING EVIDENCE', 'Verified evidence to follow');
    const leadEvidence = project.leadGallery?.length || project.contactFormGallery?.length ? `<section class="detail-block lead-evidence"><h3>REAL INQUIRY EVIDENCE</h3><div class="lead-evidence-grid">${project.leadGallery?.length ? `<button class="lead-evidence-card" type="button" data-open-lead-gallery="whatsapp" aria-haspopup="dialog" aria-controls="lead-gallery">${icon('whatsapp')}<span><strong>WhatsApp Conversations</strong><small>Three real inquiry and follow-up examples · View screenshots</small></span><span class="lead-evidence-arrow">${icon('arrow-up-right')}</span></button>` : ''}${project.contactFormGallery?.length ? `<button class="lead-evidence-card" type="button" data-open-lead-gallery="forms" aria-haspopup="dialog" aria-controls="lead-gallery">${icon('envelope')}<span><strong>Website Contact Forms</strong><small>Three website inquiry submissions · View screenshots</small></span><span class="lead-evidence-arrow">${icon('arrow-up-right')}</span></button>` : ''}</div><p>These screenshots document incoming inquiries and conversations. A conversion rate requires a defined lead and visitor count, so no percentage is claimed here.</p></section>` : '';
    const results = project.results.filter(result => result.status === 'verified' && result.source);
    detail.innerHTML = `<div class="detail-layout${id === 'seo' ? ' detail-layout-seo' : ''}${id === 'advertising' ? ' detail-layout-advertising' : ''}"><div class="detail-top"><div><p class="detail-kicker">0${index + 1} / SELECTED WORK</p><h2 id="detail-title">${escape(project.title)}</h2><h3>${escape(d.subtitle)}</h3>${d.channels ? `<p class="detail-channels">${escape(d.channels)}</p>` : ''}<p class="detail-overview">${escape(d.overview)}</p>${project.externalLinks.length ? `<div class="detail-links">${project.externalLinks.map(link => `<a class="pill dark" href="${url(link.url)}" target="_blank" rel="noopener noreferrer">${escape(link.label)} ${icon('arrow-up-right')}</a>`).join('')}</div>` : ''}</div><figure class="detail-art"><img src="${url(project.coverImage)}" alt="${escape(project.title)} 3D project icon" width="600" height="600"></figure></div><div class="detail-story${d.impact ? ' has-impact' : ''}"><section><h3>THE CHALLENGE</h3><p>${escape(d.challenge)}</p></section><section><h3>MY APPROACH</h3><p>${escape(d.approach)}</p>${d.directions ? `<ul class="creative-directions">${d.directions.map(([heading,body]) => `<li><strong>${escape(heading)}</strong><span>${escape(body)}</span></li>`).join('')}</ul>` : ''}${d.approachClosing ? `<p class="approach-closing">${escape(d.approachClosing)}</p>` : ''}</section>${d.impact ? `<section><h3>THE IMPACT</h3><h4>${escape(d.impactTitle)}</h4><p>${escape(d.impact)}</p></section>` : ''}</div><section class="detail-block see-work" id="detail-work"><h3>SEE THE WORK</h3>${workMedia}${socialProof}${workEvidence}</section>${creativeScreenshots}<section class="detail-block"><h3>WHAT I WORKED ON</h3>${actionGrid}${workflow}${id === 'website' || id === 'seo' ? '<h4 class="detail-summary-heading">My Contributions & Key Deliverables</h4>' : ''}<div class="detail-columns"><div><h4>MY CONTRIBUTIONS</h4><ul>${d.contributions.map(text => `<li>${escape(text)}</li>`).join('')}</ul></div><div><h4>KEY DELIVERABLES</h4><ul>${d.deliverables.map(text => `<li>${escape(text)}</li>`).join('')}</ul></div></div></section>${leadEvidence}<section class="detail-block detail-outcome"><h3>THE OUTCOME</h3><p>${escape(d.outcome)}</p>${results.length ? `<div class="result-grid">${results.map(result => `<div class="verified-result"><strong>${escape(result.value)}</strong><span>${escape(result.label)}</span><small>${escape(result.period)}</small><a href="${url(result.source)}" target="_blank" rel="noopener noreferrer">View source</a></div>`).join('')}</div>` : ''}${d.reflection ? `<p class="project-reflection">${escape(d.reflection)}</p>` : ''}</section><div class="detail-pagination"><button type="button" data-project="${projects[(index-1+projects.length)%projects.length].id}">${icon('arrow-left')} Previous project</button><small>0${index+1} / 0${projects.length}</small><button type="button" data-project="${projects[(index+1)%projects.length].id}">Next project ${icon('arrow-right')}</button></div></div>`;
    if (id === 'website') detail.innerHTML = renderBrandCase(project, index);
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('detail-open');
    dialog.scrollTop = 0;
    document.querySelector('.dialog-close').focus({preventScroll:true});
  }
  document.addEventListener('click', event => {
    const projectTrigger = event.target.closest('[data-project]');
    if (projectTrigger) openProject(projectTrigger.dataset.project, projectTrigger);
    if (event.target.closest('[data-open-lead-gallery]')) openLeadGallery(event.target.closest('[data-open-lead-gallery]'));
    const filter = event.target.closest('[data-filter]');
    if (filter && selectedProject) {
      detail.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button === filter)));
      detail.querySelector('#creative-media').innerHTML = creativeItems(selectedProject,filter.dataset.filter);
    }
  });
  function closeProject() { dialog.close(); }
  document.querySelector('.dialog-close').addEventListener('click', closeProject);
  document.querySelector('.detail-home').addEventListener('click', closeProject);
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeProject();
  });
  dialog.addEventListener('close', () => {
    detail.querySelectorAll('video').forEach(video => video.pause());
    document.body.classList.remove('detail-open');
    if (opener?.isConnected) opener.focus({preventScroll:true});
  });
  const leadGalleryDialog = document.querySelector('#lead-gallery');
  const leadGalleryImage = document.querySelector('#lead-gallery-image');
  let leadGalleryItems = [];
  let leadGalleryIndex = 0;
  let leadGalleryOpener = null;
  function showLeadImage() {
    const item = leadGalleryItems[leadGalleryIndex];
    if (!item) return;
    leadGalleryImage.src = previewUrl(item.source);
    leadGalleryImage.alt = item.title;
    document.querySelector('#lead-gallery-caption').textContent = item.title;
    document.querySelector('#lead-gallery-description').textContent = item.description;
    document.querySelector('#lead-gallery-fullsize').href = url(item.source);
    document.querySelector('#lead-gallery-count').textContent = `${leadGalleryIndex + 1} / ${leadGalleryItems.length}`;
  }
  function stepLeadImage(direction) {
    if (!leadGalleryItems.length) return;
    leadGalleryIndex = (leadGalleryIndex + direction + leadGalleryItems.length) % leadGalleryItems.length;
    showLeadImage();
  }
  function openLeadGallery(openerButton) {
    const isFormGallery = openerButton.dataset.openLeadGallery === 'forms';
    leadGalleryItems = isFormGallery ? selectedProject?.contactFormGallery || [] : selectedProject?.leadGallery || [];
    document.querySelector('#lead-gallery-title').textContent = isFormGallery ? 'Website Contact Forms' : 'WhatsApp Conversations';
    if (!leadGalleryItems.length) return;
    leadGalleryIndex = 0;
    leadGalleryOpener = openerButton;
    showLeadImage();
    leadGalleryDialog.showModal();
    leadGalleryDialog.querySelector('.lead-gallery-close').focus();
  }
  leadGalleryDialog.querySelector('.lead-gallery-close').addEventListener('click', () => leadGalleryDialog.close());
  leadGalleryDialog.querySelector('[data-lead-prev]').addEventListener('click', () => stepLeadImage(-1));
  leadGalleryDialog.querySelector('[data-lead-next]').addEventListener('click', () => stepLeadImage(1));
  leadGalleryDialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); stepLeadImage(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); stepLeadImage(1); }
  });
  leadGalleryDialog.addEventListener('click', event => { if (event.target === leadGalleryDialog) leadGalleryDialog.close(); });
  leadGalleryDialog.addEventListener('close', () => { if (leadGalleryOpener?.isConnected) leadGalleryOpener.focus({preventScroll:true}); });
  const menu = document.querySelector('#main-navigation');
  const menuButton = document.querySelector('.menu-toggle');
  function closeMenu() { menu.classList.remove('is-open'); menuButton.setAttribute('aria-expanded','false'); menuButton.setAttribute('aria-label','Open navigation'); }
  menuButton.addEventListener('click', () => { const open = menu.classList.toggle('is-open'); menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open ? 'Close navigation' : 'Open navigation'); });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  document.addEventListener('click', event => { if (!event.target.closest('.nav')) closeMenu(); });
  const navLinks = [...menu.querySelectorAll('a')];
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
    if (visible) navLinks.forEach(link => { const active = link.hash === '#'+visible.target.id; link.classList.toggle('is-active',active); if (active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current'); });
  }, {rootMargin:'-18% 0px -55% 0px',threshold:0});
  navLinks.forEach(link => { const section = document.querySelector(link.hash); if (section) observer.observe(section); });
  document.querySelectorAll('.project').forEach(card => {
    card.addEventListener('pointermove', event => {
      if(matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(pointer: coarse)').matches) return;
      const box=card.getBoundingClientRect(),x=(event.clientX-box.left)/box.width-.5,y=(event.clientY-box.top)/box.height-.5;
      card.style.transform=`perspective(1200px) rotateY(${x*2}deg) rotateX(${-y*2}deg)`;
    });
    card.addEventListener('pointerleave',()=>{card.style.transform='';});
  });
  // Reveal each text block once, in reading order, without reserving extra space.
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  if (!motionPreference.matches && 'IntersectionObserver' in window && Element.prototype.animate) {
    const textSelector = '.stella-hero-copy h1,.stella-eyebrow,.stella-description p,.section h2,.section-label,.about-intro>p,.project-info h3,.project-info p,.project-info small,.lab-copy>small,.lab-intro,.lab-list .principle,.contact-get-in-touch,.contact-description,.contact-link>span';
    const activeReveals = new Set();
    const textObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
      visible.forEach((entry, index) => {
        textObserver.unobserve(entry.target);
        if (motionPreference.matches) return;
        const animation = entry.target.animate([
          { opacity: 0, transform: 'translateY(-14px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 650, delay: Math.min(index * 75, 225), easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'backwards' });
        activeReveals.add(animation);
        animation.finished.then(() => activeReveals.delete(animation), () => activeReveals.delete(animation));
      });
    }, { threshold: 0, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll(textSelector).forEach(element => textObserver.observe(element));
    motionPreference.addEventListener('change', event => {
      if (!event.matches) return;
      textObserver.disconnect();
      activeReveals.forEach(animation => animation.cancel());
      activeReveals.clear();
    });
  }
  const workList = document.querySelector('.lab-list');
  const workPortrait = document.querySelector('.lab-portrait');
  if (workList && workPortrait) {
    const workSteps = [...workList.querySelectorAll('p')];
    const setGaze = (position) => {
      // SVG user units keep gaze bounds consistent at every display size.
      const y = position === null ? -3 : -7 + position * 12;
      const x = position === null ? 5 : 12 - position * 5;
      workPortrait.style.setProperty('--eye-x', `${x.toFixed(2)}px`);
      workPortrait.style.setProperty('--eye-y', `${y.toFixed(2)}px`);
      workSteps.forEach((step, index) => step.classList.toggle('is-gazed', position !== null && Math.round(position * (workSteps.length - 1)) === index));
    };
    workList.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const first = workSteps[0].getBoundingClientRect();
      const last = workSteps[workSteps.length - 1].getBoundingClientRect();
      const start = first.top + first.height / 2;
      const end = last.top + last.height / 2;
      setGaze(Math.max(0, Math.min(1, (event.clientY - start) / (end - start))));
    });
    workList.addEventListener('pointerleave', () => setGaze(null));
  }
})();
