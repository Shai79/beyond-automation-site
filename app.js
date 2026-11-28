const $ = (s, p = document) => p.querySelector(s);
function animatePath() {
  const path = document.querySelector('.path');
  if (!path) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    path.classList.add('is-shown');
    return;
  }
  const show = () => path.classList.add('is-playing');
  if (!('IntersectionObserver' in window)) { show(); return; }
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    show();
    observer.disconnect();
  }, { threshold: 0.35 });
  observer.observe(path);
}
function drawHomeMark() {
 const art = $('.hero-brand-art');
 if (!art) return;
 const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
 const narrow = matchMedia('(max-width: 760px)').matches;
 if (reduce || narrow) return;
 art.classList.add('is-drawing');
 const coral = new Image(), order = new Image();
 let pending = 2, failed = false;
 const fail = () => { if (failed) return; failed = true; art.classList.remove('is-drawing'); };
 const ready = () => { if (failed || --pending) return; sweepMark(art, coral, order); };
 for (const [img, src] of [[coral, '/assets/symbol-coral.png'], [order, '/assets/symbol-coral-order.png']]) {
  img.onload = ready; img.onerror = fail; img.src = src;
 }
}
function sweepMark(art, coral, order) {
 const w = 547, h = 485;
 const canvas = document.createElement('canvas');
 canvas.className = 'mark-draw'; canvas.width = w; canvas.height = h;
 art.appendChild(canvas);
 const ctx = canvas.getContext('2d');
 const scratch = document.createElement('canvas');
 scratch.width = w; scratch.height = h;
 const sctx = scratch.getContext('2d', {willReadFrequently: true});
 sctx.drawImage(coral, 0, 0);
 const coralPx = sctx.getImageData(0, 0, w, h).data;
 sctx.drawImage(order, 0, 0);
 const orderPx = sctx.getImageData(0, 0, w, h).data;
 const frame = sctx.createImageData(w, h);
 const out = frame.data;
 const indexes = [];
 for (let i = 0; i < orderPx.length; i += 4) if (orderPx[i]) indexes.push(i);
 const duration = 1600, delay = 360, feather = 22;
 const start = performance.now() + delay;
 const tick = now => {
  if (now < start) { requestAnimationFrame(tick); return; }
  const p = Math.min(1, (now - start) / duration);
  const thresh = (1 - Math.pow(1 - p, 3)) * 255;
  out.fill(0);
  for (const i of indexes) {
   const delta = thresh - orderPx[i];
   const alpha = coralPx[i + 3];
   if (delta <= 0 || !alpha) continue;
   out[i] = coralPx[i]; out[i + 1] = coralPx[i + 1]; out[i + 2] = coralPx[i + 2];
   out[i + 3] = delta >= feather ? alpha : Math.round(alpha * delta / feather);
  }
  sctx.putImageData(frame, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(scratch, 0, 0);
  if (p < 1) requestAnimationFrame(tick);
  else { art.classList.remove('is-drawing'); canvas.remove(); }
 };
 requestAnimationFrame(tick);
}
const icons = {
 mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
 people:'<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v3"/>',
 file:'<path d="M14 2H5v20h14V7zM14 2v6h5M8 12h8m-8 4h6"/>',
 chart:'<path d="M4 20V13h4v7zm6 0V8h4v12zm6 0V3h4v17z"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18M7 15h2m6 0h2m-10 3h2"/>',
 invoice:'<path d="M14 2H5v20h14V7zM14 2v6h5M14 12c-4-3-5 1-3 3l-1 3h5m-6-3h5"/>',
 code:'<path d="m7 6-6 6 6 6m10-12 6 6-6 6M14 3l-4 18"/>',
 help:'<circle cx="12" cy="12" r="10"/><path d="M9 8a3 3 0 1 1 4 3c-1 1-1 1-1 3m0 3v1"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3"/>',
 phone:'<path d="M8 3h3l1.5 4-2 1a12 12 0 0 0 5.5 5.5l1-2 4 1.5V16a2 2 0 0 1-2 2A15 15 0 0 1 6 5a2 2 0 0 1 2-2"/>',
 layers:'<path d="m12 2 10 6-10 6L2 8zm-10 11 10 6 10-6M2 18l10 5 10-5"/>',
 shield:'<path d="m12 2 9 4v6c0 5-6 9-9 10-3-1-9-5-9-10V6zM7 12l3 3 7-7"/>',
 video:'<rect x="2" y="5" width="14" height="14" rx="3"/><path d="m16 10 6-4v12l-6-4"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 handshake:'<path d="m2 9 5-5 5 2 5-2 5 5-6 10-3 2-7-5zm5-5 5 2-4 5 3 2 4-3 5 6M2 9l4 7m13-1-6-5"/>',
 star:'<path d="m12 3 2.6 5.4 6 .8-4.3 4.2 1 5.9L12 16.8 6.7 19.3l1-5.9L3.4 9.2l6-.8z"/>',
 chat:'<path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/>',
 pen:'<path d="M14 4 20 10 8 22H2v-6zM14 4l2-2 4 4-2 2"/>',
 bell:'<path d="M6 16V10a6 6 0 0 1 12 0v6l2 2H4zM10 20a2 2 0 0 0 4 0"/>',
 clipboard:'<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4.5h6V3H9zM8 10h8M8 14h6"/>',
 card:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M13 10h5M13 14h4"/>',
 link:'<path d="M9 12a4 4 0 0 1 0-6l2-2a4 4 0 0 1 6 6l-1 1M15 12a4 4 0 0 1 0 6l-2 2a4 4 0 0 1-6-6l1-1"/>',
 search:'<circle cx="10" cy="10" r="6"/><path d="m20 20-4.2-4.2"/>',
 puzzle:'<path d="M8 4h3a2 2 0 1 0 4 0h3v4a2 2 0 1 1 0 4v3h-4a2 2 0 1 0-4 0H4v-3a2 2 0 1 1 0-4V4z"/>'
};
const icon = (name, cls='') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.code}</svg>`;
const serviceGroups = [
 ['Getting in touch', [
  ['calls','phone','Answer all calls 24/7','An agent answers the call, books or reschedules the appointment, sends a confirmation, and updates your calendar.'],
  ['enquiries','chat','Reply on WhatsApp, email and the website','An agent answers the enquiry in your wording, on the channel they used, while they are still waiting.'],
  ['reminders','bell','Send the reminder','A reminder goes out before the appointment. If the customer moves it, the diary updates.'],
  ['reviews','star','Ask for the review','After the job is finished, a message asks the customer for a review.']
 ]],
 ['The administration', [
  ['quotes','pen','Draft the quote','A quote is built from your prices and left for you to check before anyone sends it.'],
  ['invoices','invoice','Chase the invoice','A polite reminder goes out for an unpaid invoice, and it stops as soon as that invoice is paid.'],
  ['documents','file','Read and file the paperwork','A form or invoice is read, anything missing is marked, and the document is filed.'],
  ['reporting','chart','A report from the numbers you keep','The spreadsheets and records you already have are turned into one plain report.']
 ]],
 ['The working day', [
  ['crm','card','One record for each customer','Each person’s name, how to reach them, the last conversation, and the next step sit in one place your team can open.'],
  ['management','clipboard','Jobs, shifts and today’s tasks','Jobs, who is on shift, and the tasks for today stay in one list the team can follow.'],
  ['workflows','link','Connect the software you already use','The inbox, diary, spreadsheets and accounts you already pay for pass a detail across, so it is typed once.'],
  ['prospects','search','People who may need your work','People who may need the business are found, with a way to reach them, and kept next to the customers you already know.']
 ]]
];
const shaped = ['shaped','puzzle','Built around your own job','An automation made for a job the other tools do not cover, around the way your team already works.'];
const services = [...serviceGroups.flatMap(([,items]) => items), shaped, ['unsure','help','Not sure yet','Tell us about your day-to-day work and we’ll explore it together.']];
const legacyServiceIds = {email:'enquiries',reception:'calls',leads:'prospects',scheduling:'reminders',bespoke:'shaped'};
const currentServiceId = id => legacyServiceIds[id] || id;
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let servicesHeading = 'Turning AI into Real Business Value';
let servicesLead = 'We Create Tools That:';
function applyServiceWriting(text) {
 const blocks = new Map();
 let id = '', headline = '', body = [];
 const save = () => { if (id) blocks.set(id, {headline, line: body.join(' ').replace(/\s+/g, ' ').trim()}); };
 for (const raw of String(text).split(/\r?\n/)) {
  const line = raw.trim();
  const tag = line.match(/^\[([a-z0-9-]+)\]$/i);
  if (tag) { save(); id = tag[1].toLowerCase(); headline = ''; body = []; continue; }
  if (!id || !line) continue;
  if (!headline) headline = line;
  else body.push(line);
 }
 save();
 if (blocks.get('heading')?.headline) servicesHeading = blocks.get('heading').headline;
 if (blocks.get('lead')?.headline) servicesLead = blocks.get('lead').headline;
 for (const item of services) {
  const next = blocks.get(item[0]);
  if (!next) continue;
  if (next.headline) item[2] = next.headline;
  if (next.line) item[3] = next.line;
 }
}
let reviewsHeading = '';
let reviewsNote = '';
const reviews = {
 luca: {name: 'Luca', business: 'Form & Function Training', paragraphs: [
  'Between clients, I was always on my phone. I’d book someone in, send them a reminder, then dig around for their training plan five minutes before they walked through the door.',
  'Now the system does all of that for me. It books the session and sends a reminder to me and to the client. Before they arrive, it sends me their training plan, so I’ve got it ready.',
  'It saves me an hour or two a day. I don’t worry about the admin anymore, and I spend that time on the person standing in front of me.']},
 shona: {name: 'Shona', business: 'Shona’s Chair', paragraphs: [
  'The admin was eating my day. Who’s on the morning shift, who’s covering for who, and what we’re about to run out of.',
  'The team came to the shop and spent time with us. They watched me with clients, saw how I work with my staff, and checked every station. Then they came back with a report showing which jobs a bot could take off my hands.',
  'Now I’ve got a rota that sorts itself out, and a supply checker that tells me what’s running low before we run out.',
  'Could I have bought something online for a bit cheaper? Probably. But it wouldn’t have fitted my shop. The team at Beyond Automation built the tool around our needs and how we actually work.',
  'I also joined Beyond’s maintenance plan. They keep it running, and they keep improving it as the shop changes.']},
 jason: {name: 'Jason', business: 'Pennington Grey LLP', paragraphs: [
  'This Christmas I gave my paralegal the best present she’s ever had from me. Her words, not mine. And it wasn’t the hamper.',
  'She’d been doing two jobs, the legal work and all my admin. Letters, diaries, chasing clients. Now the admin almost runs itself, and she’s got much more time to work on cases.',
  'I’ll admit I fought it. I’m a few years from retiring, and I thought this sort of thing wasn’t for me. Turns out it’s easier than my phone.',
  'I should have done it sooner.']}
};
function applyReviews(text) {
 const found = new Map();
 let id = '', lines = [];
 const save = () => { if (id) found.set(id, lines); };
 for (const raw of String(text).split(/\r?\n/)) {
  const line = raw.trim();
  const tag = line.match(/^\[([a-z0-9-]+)\]$/i);
  if (tag) { save(); id = tag[1].toLowerCase(); lines = []; continue; }
  if (id && line) lines.push(line);
 }
 save();
 if (found.get('heading')?.[0]) reviewsHeading = found.get('heading')[0];
 if (found.get('note')?.[0]) reviewsNote = found.get('note')[0];
 for (const key of Object.keys(reviews)) {
  const block = found.get(key);
  if (!block) continue;
  const name = block.find(l => /^Name:/i.test(l));
  const business = block.find(l => /^Business:/i.test(l));
  const paragraphs = block.filter(l => !/^(Name|Business):/i.test(l));
  if (name) reviews[key].name = name.replace(/^Name:\s*/i, '');
  if (business) reviews[key].business = business.replace(/^Business:\s*/i, '');
  if (paragraphs.length) reviews[key].paragraphs = paragraphs;
 }
}
function reviewsSection() {
 const people = [['luca', '/assets/luca.jpg?v=2'], ['shona', '/assets/shona.jpg?v=3'], ['jason', '/assets/jason.jpg?v=4']];
 return `<section class="section quotes"><div class="container">${reviewsHeading || reviewsNote ? `<div class="section-heading">${reviewsHeading ? `<h2>${esc(reviewsHeading)}</h2>` : ''}${reviewsNote ? `<p>${esc(reviewsNote)}</p>` : ''}</div>` : ''}<div class="quote-grid">${people.map(([key, src]) => { const r = reviews[key]; return `<blockquote><img class="quote-face" src="${src}" width="84" height="84" alt=""><div class="quote-text">${r.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}</div><p class="quote-by"><span>${esc(r.name)}</span>${esc(r.business)}</p></blockquote>`; }).join('')}</div></div></section>`;
}
let config = {preview: true, schedulingConnected: false};
try {config = await (await fetch('/site-config.json')).json();} catch {}
try {
 const writing = await (await fetch('/service-writing.txt', {cache: 'no-store'})).text();
 if (writing && !writing.trim().startsWith('<')) applyServiceWriting(writing);
} catch {}
try {
 const reviewText = await (await fetch('/reviews.txt', {cache: 'no-store'})).text();
 if (reviewText && !reviewText.trim().startsWith('<')) applyReviews(reviewText);
} catch {}
const route = location.pathname.replace(/\/$/, '') || '/';
if (route === '/services') location.replace('/');
const symbolSrc = '/assets/symbol-warm.png';
const logo = `<span class="brand-symbol"><img src="${symbolSrc}" alt="" width="52" height="46"></span><span>Beyond<br>Automation</span>`;
const header = `<div class="top-bar"><div class="top-bar-inner">${config.launch ? '' : `<p class="top-bar-note">Website preview · ${config.preview ? 'Test enquiries stay on this Mac. Booking is not connected.' : 'Private review · connected services enabled.'}</p>`}<a class="top-bar-support" href="/contact">${icon('help')}<span>Customer Support</span></a><a class="top-bar-enquiries" href="mailto:hello@beyond-automation.co.uk"><span>New Enquiries</span>${icon('mail')}<span>hello@beyond-automation.co.uk</span></a></div></div><header class="header"><div class="wide nav"><a class="brand" href="/" aria-label="Beyond Automation home">${logo}</a><button class="menu-toggle" aria-expanded="false" aria-controls="navigation" aria-label="Open navigation"><span></span><span></span><span></span></button><nav id="navigation" aria-label="Main navigation">${[['/about','About'],['/case-study','Case study'],['/contact','Contact']].map(([p,n]) => `<a href="${p}" ${route===p ? 'aria-current="page"' : ''}>${n}</a>`).join('')}<a class="nav-cta" href="/book" ${route==='/book'?'aria-current="page"':''}>Book a Consultation</a></nav></div></header>`;
const footer = `<footer><div class="container footer-inner"><a class="brand" href="/" aria-label="Beyond Automation home">${logo}</a><div class="footer-links"><a href="/privacy">Privacy</a><a href="/terms">Terms &amp; conditions</a><a href="/contact">Contact us</a><a href="/cookies">Cookies</a></div><p>© ${new Date().getFullYear()} Beyond Automation.</p></div></footer>`;
const cta = `<section class="container"><div class="cta-strip">${icon('calendar')}<div><h2>Let’s explore what automation can do for your business.</h2><p>Start with a free 30-minute phone call. No obligation.</p></div><a class="button" href="/book">Book a Consultation</a></div></section>`;
const wave = `<div class="wave-art" aria-hidden="true">${Array.from({length:15},(_,i)=>`<i class="wave w${i}"></i>`).join('')}</div>`;
const hero = (eyebrow, title, text, extra='') => `<section class="page-hero">${wave}<div class="container"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1>${text ? `<p class="hero-copy">${text}</p>` : ''}${extra}</div></section>`;
const topHero = (eyebrow, title, text = '', extra = '') => `<section class="top-hero case-hero"><div class="hero-field" aria-hidden="true"></div><img class="top-hero-mark" src="/assets/symbol-warm.png" alt="" width="547" height="485"><div class="wide case-hero-inner"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1>${text ? `<p class="top-hero-text">${text}</p>` : ''}${extra}</div></div></section>`;
const buttons = `<div class="button-row"><a class="button" href="/book">Book a Consultation</a></div>`;
const wa = (time, thread) => `<div class="phone wa"><div class="wa-bar"><span class="wa-avatar" aria-hidden="true"></span><span class="wa-who"><strong>Bookings</strong><small>official channel</small></span><span>${time}</span></div><div class="chat-screen">${thread}</div><div class="wa-compose" aria-hidden="true"><span>Message</span></div></div>`;
const weekPlaybackData = {
 tue: {
  label: 'Tue 21:14 · Missed call while with a client',
  kicker: 'ANSWERING · TUESDAY 21:14',
  title: 'Stays with the client in the room.',
  summary: 'Phone rings in the locker room. Four rings later, the system answers, checks live calendar space, and sends a clear SMS.',
  phone: `<div class="phone"><p class="phone-top"><span>21:14</span><span>Mobile</span></p><p class="phone-status">Incoming call</p><p class="phone-quote">“Have you got anything after work this week?”</p><div class="phone-text"><p class="phone-status">SMS · 21:16</p><p>You’re booked for Thursday at 7:00. Reply C to change it.</p></div></div>`,
  trace: [
   ['21:14:04', 'Call unanswered after 4 rings · Number checked against active clients'],
   ['21:14:11', 'Read live diary: offered Thu 19:00 & Fri 18:30 (buffer rules applied)'],
   ['21:15:48', 'Thu 19:00 selected · Duplicate slot check passed'],
   ['21:16:02', 'SMS confirmation sent · Customer record updated with timestamp']
  ]
 },
 wed: {
  label: 'Wed 18:02 · Rescheduled on WhatsApp',
  kicker: 'WHATSAPP · WEDNESDAY 18:02',
  title: 'Thursday moves. The reminder still goes.',
  summary: 'Client asks to switch days. The old slot stays protected until the new one is picked, so double-bookings cannot sneak in.',
  phone: wa('18:02', `<p class="bubble in">Can I move Thursday? Something’s come up.</p><p class="bubble out">Friday at 6:30 is free. Thursday at 7:00 can stay. Which do you want?</p><p class="bubble in">Friday 6:30 please.</p><p class="bubble out">Friday at 6:30 is yours. I’ll remind you tomorrow evening.</p><p class="bubble-time">Thursday 18:00 · Reminder</p><p class="bubble out">See you tomorrow at 6:30. Reply if you can’t make it.</p><p class="bubble in">I’ll be there.</p>`),
  trace: [
   ['18:02:09', 'Inbound message matched to open booking #BK-408 (Thu 19:00)'],
   ['18:02:14', 'Held Thu 19:00 locked until customer confirmed Fri 18:30'],
   ['18:03:01', 'Atomic swap: Fri 18:30 booked, Thu 19:00 opened cleanly'],
   ['Thu 18:00', '24h reminder sent on official API · Client reply logged']
  ]
 },
 fri: {
  label: 'Fri 18:40 · Session ends, next week booked',
  kicker: 'WHATSAPP · FRIDAY 18:40',
  title: 'The session ends. Next week is agreed.',
  summary: 'As Friday wraps up, the same slot next week is offered cleanly and logged straight into both diaries.',
  phone: wa('18:40', `<p class="bubble out">Same time next week is free if you want it.</p><p class="bubble in">Yes, book me in.</p><p class="bubble out">Friday at 6:30 next week is yours. I’ll send the usual reminder the evening before.</p>`),
  trace: [
   ['18:40:00', 'Session marked complete in calendar · Client history verified'],
   ['18:40:06', 'Checked next Friday 18:30 availability & travel rules'],
   ['18:41:22', 'Client confirmed · Next Friday booked and reminder queued'],
   ['18:41:23', 'Plain-English summary added to daily digest for the owner']
  ]
 }
};
const homeFaqs = [
 ['What happens when the AI is unsure or an unusual case appears?', 'Every workflow has clear boundaries. When a message is ambiguous, a form is missing fields, or wording needs judgement, the system pauses that item and routes a crisp summary straight to a named person in your team.'],
 ['Who owns the workflows, code and third-party accounts?', 'You do. Telephony, WhatsApp Business, email, calendar and automation accounts sit in your business name. At handover you receive access, documentation and a clean plain-English summary of how everything connects.'],
 ['How do you stop quotes, invoices or bookings going wrong?', 'Outbound money, quotes and sensitive client replies sit behind human approval buttons until you trust a narrow rule. Duplicate protection ensures automated email link scanners or repeat clicks cannot trigger an action twice.'],
 ['What happens when WhatsApp, our calendar or accounting software changes?', 'We build on official APIs rather than brittle browser hacks, keep email or SMS fallbacks ready if a channel stalls, and verify builds with a software engineer before launch. Every project starts with a year of technical advice and one included update, with optional ongoing care as your tools evolve.'],
 ['Do we need to replace the software our team already uses?', 'No. We connect the inbox, calendar, spreadsheets, CRM and accounting packages your team already opens every day — including the custom columns and informal workarounds nobody wrote down.']
];
function home() {
 const firstWeek = weekPlaybackData.tue;
 return `<section class="top-hero">
  <div class="hero-field" aria-hidden="true"></div>
  <img class="top-hero-mark" src="/assets/symbol-warm.png" alt="" width="547" height="485">
  <div class="wide top-hero-inner">
   <div class="top-hero-copy">
    <h1>Business Automation for <span>Smarter, Simpler Admin</span></h1>
    <a class="top-hero-cta" href="/book">Book a Free Consultation</a>
   </div>
   <aside class="hero-demo-wrap" id="call-demo" aria-label="Example AI call tool, animated">
    <div class="call-demo">
     <div class="call-demo-bar">
      <span class="call-demo-live"><i aria-hidden="true"></i>LIVE</span>
      <span class="call-demo-title">Example · Out-of-hours line</span>
      <span class="call-demo-time" data-call-time>00:00</span>
     </div>
     <div class="call-demo-caller">
      <span class="call-demo-icon" aria-hidden="true">${icon('phone')}</span>
      <div class="call-demo-who">
       <strong>Incoming call · Mobile</strong>
       <small>Caller asking about a boiler service</small>
      </div>
      <div class="taper-wave" aria-hidden="true">${Array.from({length: 18}, (_, i) => `<i class="tw tw${i}"></i>`).join('')}</div>
     </div>
     <p class="call-demo-label">Live transcript</p>
     <div class="call-demo-captions" data-call-captions></div>
    </div>
   </aside>
  </div>
 </section>

 <section class="top-intro">
  <div class="top-intro-blob" aria-hidden="true"></div>
  <div class="container top-intro-inner">
   <h2>${esc(servicesHeading)}</h2>
   <span class="top-intro-rule" aria-hidden="true"></span>
  </div>
 </section>

 <section class="section jobs">
  <div class="container">
   <h2 class="tool-lead">${esc(servicesLead)}</h2>
   <ul class="tool-grid">
    ${services.filter(([id]) => id !== 'unsure').map(([, ic, name, desc]) => `<li><a href="/book">${icon(ic)}<h3>${name}</h3><p>${desc}</p></a></li>`).join('')}
   </ul>
   <ul class="value-list">
    <li>${icon('clock')}<h3>Increased productivity</h3><p>Free up your teams from repetitive tasks so they can focus on higher-value work.</p></li>
    <li>${icon('chart')}<h3>Smarter decision making</h3><p>Use AI insights to support faster, more informed business decisions.</p></li>
    <li>${icon('layers')}<h3>Reduced operational complexity</h3><p>Simplify processes with intelligent automation that works alongside your people.</p></li>
    <li>${icon('star')}<h3>Future-ready technology</h3><p>Build AI capabilities that scale with your business, from initial use cases through to enterprise-wide adoption.</p></li>
    <li>${icon('shield')}<h3>Confidence in security and compliance</h3><p>Implement AI safely with clear governance and protection for your data.</p></li>
   </ul>
  </div>
 </section>

 ${reviewsSection()}

 <section class="section process-section">
  <div class="container">
   <ol class="path">
    <li><span class="path-n">1</span><h3>A free 30-min call</h3><p>We listen to how work moves through your week today. No obligation.</p></li>
    <li><span class="path-n">2</span><h3>Map &amp; agree scope</h3><p>Choose one focused build or office shadowing, with clear boundaries and approval steps.</p></li>
    <li><span class="path-n">3</span><h3>Build, test &amp; review</h3><p>Tested on real examples and reviewed by an engineer before entering your working day.</p></li>
   </ol>
  </div>
 </section>

 ${cta}

 <section class="section faq-section">
  <div class="container faq-wrap">
   <div class="section-heading">
    <h2>Common questions</h2>
   </div>
   <div class="faq-list" id="home-faqs">
    ${homeFaqs.map(([q, a], i) => `<div class="faq-item"><button type="button" class="faq-q" aria-expanded="false" aria-controls="faq-a-${i}"><span>${q}</span><i aria-hidden="true">+</i></button><div class="faq-a" id="faq-a-${i}" hidden><p>${a}</p></div></div>`).join('')}
   </div>
  </div>
 </section>`;
}
function setupCallDemo() {
 const demo = $('#call-demo');
 if (!demo) return;
 const panel = demo.querySelector('.call-demo');
 const captions = demo.querySelector('[data-call-captions]');
 const timer = demo.querySelector('[data-call-time]');
 const items = [...demo.querySelectorAll('[data-auto]')];
 const labels = { caller: 'Caller', ai: 'AI tool' };
 const script = [
  { who: 'ai', text: 'Good evening, how can I help?' },
  { who: 'caller', text: 'Hi, I need a boiler service. Have you got anything free after six this week?' },
  { who: 'ai', text: 'Thursday at seven or Friday at half past six. Which suits you?' },
  { who: 'caller', text: 'Thursday, please.', done: [0, 1] },
  { who: 'ai', text: 'Thursday at seven, you’re booked in. Goodbye.', done: [2] }
 ];
 const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
 const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
 const alive = () => demo.isConnected;

 const addLine = who => {
  const line = document.createElement('p');
  line.className = `cap cap-${who}`;
  const label = document.createElement('span');
  label.className = 'cap-who';
  label.textContent = labels[who];
  const text = document.createElement('span');
  text.className = 'cap-text';
  line.append(label, text);
  captions.append(line);
  return text;
 };
 const reset = () => {
  captions.textContent = '';
  items.forEach(li => li.classList.remove('is-working', 'is-done'));
  timer.textContent = '00:00';
  panel.classList.remove('is-live');
 };
 const typeLine = async (who, message) => {
  const out = addLine(who);
  out.classList.add('is-typing');
  for (let i = 1; i <= message.length; i++) {
   out.textContent = message.slice(0, i);
   await sleep(who === 'caller' ? 26 : 18);
   if (!alive()) return false;
  }
  out.classList.remove('is-typing');
  return true;
 };
 const completeItem = async index => {
  const li = items[index];
  if (!li) return true;
  li.classList.add('is-working');
  await sleep(850);
  if (!alive()) return false;
  li.classList.replace('is-working', 'is-done');
  return true;
 };
 const playCall = async () => {
  reset();
  panel.classList.add('is-live');
  let seconds = 0;
  const clock = setInterval(() => { seconds += 1; timer.textContent = fmt(seconds); }, 1000);
  try {
   await sleep(500);
   for (const line of script) {
    if (!(await typeLine(line.who, line.text))) return false;
    for (const index of line.done || []) {
     if (!(await completeItem(index))) return false;
    }
    await sleep(450);
   }
   panel.classList.remove('is-live');
   await sleep(4500);
   return alive();
  } finally {
   clearInterval(clock);
  }
 };

 if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  captions.textContent = '';
  script.forEach(line => {
   const out = addLine(line.who);
   out.textContent = line.text;
  });
  timer.textContent = '00:41';
  items.forEach(li => li.classList.add('is-done'));
  return;
 }
 (async () => { while (await playCall()) { /* loop the example call */ } })();
}

function setupCaseChat() {
 const chat = $('.case-chat .chat-screen');
 if (!chat || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
 const bubbles = [...chat.querySelectorAll('.bubble')];
 const typing = document.createElement('p');
 typing.className = 'bubble in typing';
 typing.innerHTML = '<i></i><i></i><i></i>';
 const wait = ms => new Promise(r => setTimeout(r, ms));
 let started = false;
 const play = async () => {
  for (;;) {
   bubbles.forEach(b => b.classList.remove('is-shown'));
   await wait(900);
   for (const b of bubbles) {
    if (b.classList.contains('in')) {
     chat.insertBefore(typing, b);
     await wait(1300);
     typing.remove();
    } else {
     await wait(900);
    }
    b.classList.add('is-shown');
    await wait(700);
   }
   await wait(6000);
  }
 };
 chat.classList.add('chat-anim');
 bubbles.forEach(b => b.classList.remove('is-shown'));
 const start = () => { if (!started) { started = true; play(); } };
 if (!('IntersectionObserver' in window)) { start(); return; }
 const observer = new IntersectionObserver(entries => {
  if (!entries.some(e => e.isIntersecting)) return;
  observer.disconnect();
  start();
 }, { threshold: 0.4 });
 observer.observe(chat);
}

function setupHomeInteractive() {
 const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
 const weekBox = $('#week-playback');
 if (weekBox) {
  let weekTimer = null;
  const selectWeek = key => {
   const data = weekPlaybackData[key];
   if (!data) return;
   weekBox.querySelectorAll('.play-step').forEach(b => b.setAttribute('aria-selected', String(b.dataset.week === key)));
   $('#week-phone').innerHTML = data.phone;
   $('#week-title').textContent = data.title;
   $('#week-trace').innerHTML = data.trace.map(([t, txt]) => `<li><time>${t}</time><span>${txt}</span></li>`).join('');
  };
  weekBox.querySelectorAll('.play-step').forEach(btn => btn.addEventListener('click', () => {
   clearInterval(weekTimer);
   selectWeek(btn.dataset.week);
  }));
  $('#week-replay')?.addEventListener('click', () => {
   clearInterval(weekTimer);
   const keys = ['tue', 'wed', 'fri'];
   let idx = 0;
   selectWeek(keys[0]);
   if (reduceMotion) return;
   weekTimer = setInterval(() => {
    idx++;
    if (idx >= keys.length) { clearInterval(weekTimer); return; }
    selectWeek(keys[idx]);
   }, 1600);
  });
 }

 $('#home-faqs')?.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
   const expanded = btn.getAttribute('aria-expanded') === 'true';
   btn.setAttribute('aria-expanded', String(!expanded));
   const panel = document.getElementById(btn.getAttribute('aria-controls'));
   if (panel) panel.hidden = expanded;
  });
 });
}
function about() {return `${topHero('ABOUT US','Creating technology for <span>smart business growth</span>','')}<section class="section container"><div class="section-heading"><p class="eyebrow blue">OUR STORY</p><h2>Making AI and automation accessible.</h2></div><div class="story"><p>Beyond Automation was established with a simple vision: to make artificial intelligence and automation accessible to small and established businesses.</p><p>With an academic background in artificial intelligence and a practical interest in emerging technologies, our founder believes that businesses should benefit from technological innovation without unnecessary complexity or expense.</p></div><div class="three-cards">${[['layers','Our approach','AI-assisted development and modern automation to create practical, tailored solutions.'],['code','Specialist support','Where projects require additional expertise, we bring in independent software professionals.'],['shield','Our philosophy','Transparent, simple and responsible innovation, keeping you in control at all times.']].map(([ic,title,text])=>`<article class="info-card">${icon(ic)}<h3>${title}</h3><p>${text}</p></article>`).join('')}</div></section><section class="section soft" id="approach"><div class="container process-layout"><div><p class="eyebrow blue">HOW WE WORK</p><h2>A clear path from<br>conversation to solution.</h2><p>We begin by understanding your needs. You can come with a specific idea or a process you would like to improve.</p></div><ol class="process-list"><li><span>Free initial consultation</span><p>Thirty minutes on the phone, with no obligation. We listen to the work you already do.</p></li><li><span>Optional assessment</span><p>We review your processes remotely or onsite and recommend where automation could help.</p></li><li><span>Proposal and development</span><p>Agree the scope and quotation, then build and test the solution together.</p></li><li><span>Implementation and support</span><p>Introduce the solution, provide guidance and discuss any ongoing support you need.</p></li></ol></div></section>${cta}`;}
const choice = ([id,ic,name,desc]) => `<label class="service-choice"><input type="checkbox" name="services" value="${id}"><span class="choice-check">${icon('check')}</span>${icon(ic)}<strong>${name}</strong><span>${desc}</span></label>`;
function choices() {return `<fieldset id="services"><legend>What are you interested in?</legend><p class="field-help">Choose any that apply.</p>${serviceGroups.map(([title,items])=>`<fieldset class="choice-group"><legend>${title}</legend><div class="service-grid choice-grid">${items.map(choice).join('')}</div></fieldset>`).join('')}<div class="service-grid choice-grid">${choice(shaped)}${choice(services.at(-1))}</div></fieldset>`;}
function servicesPage() {const card = ([id,ic,name,desc]) => `<li id="${id}">${icon(ic)}<h3>${name}</h3><p>${desc}</p><a class="text-link" href="/book">Book a call</a></li>`;return `${topHero('SERVICES','The work we can take on.','Each one is a tool for a job your team already does.', `<div class="button-row"><a class="button" href="/book">Book a Consultation</a></div>`)}<section class="section container service-why"><h2>Why AI solutions matter for businesses</h2><p>AI has the potential to transform how your business works, but many organisations struggle to identify where it can deliver the greatest value.</p><p>Our approach helps bridge the gap between AI ambition and practical implementation, enabling businesses to adopt AI with confidence and achieve measurable outcomes.</p><p>Backed by expert knowledge, clear governance and a focus on real-world business outcomes, we help organisations introduce AI in a way that feels natural for their teams, delivers lasting value and supports long-term growth.</p></section><section class="section container service-catalogue">${serviceGroups.map(([title,items])=>`<section class="service-block"><h2>${title}</h2><ul class="service-list">${items.map(card).join('')}</ul></section>`).join('')}<section class="service-block"><ul class="service-list service-list-single">${card(shaped)}</ul></section></section>${cta}`;}
function details() {return `<div class="form-grid"><label>Full name <span class="required">*</span><input name="name" autocomplete="name" required maxlength="120"></label><label>Business name <span class="required">*</span><input name="business" autocomplete="organization" required maxlength="160"></label><label class="full">Email address <span class="required">*</span><input type="email" name="email" autocomplete="email" required maxlength="254"></label></div><fieldset class="phone-options"><legend>May we contact you by telephone about this enquiry?</legend><label class="radio"><input type="radio" name="phonePermission" value="false" checked> I prefer email</label><label class="radio"><input type="radio" name="phonePermission" value="true"> Yes, you may telephone me</label><label id="phone-field" hidden>Telephone number<input type="tel" name="phone" autocomplete="tel" maxlength="40"></label></fieldset><label class="honeypot" aria-hidden="true">Leave empty<input name="website" tabindex="-1" autocomplete="off"></label>`;}
const caseChat = wa('18:02', `<p class="bubble out">Hi. Can I move Thursday? Something came up.</p><p class="bubble in">Hi Ryan, at the moment our next available slots are Thursday at 20:00 or Friday at 06:30. Would either of these work?</p><p class="bubble out">Friday 6:30 please.</p><p class="bubble in">Friday at 06:30 is yours, Ryan. Thanks.</p>`);
function caseStudy() {return `<section class="top-hero case-hero"><div class="hero-field" aria-hidden="true"></div><img class="top-hero-mark" src="/assets/symbol-warm.png" alt="" width="547" height="485"><div class="wide case-hero-inner"><img class="case-hero-face" src="/assets/luca.jpg?v=2" width="132" height="132" alt=""><div><p class="eyebrow">CASE STUDY</p><h1>Meet Luca - a busy personal trainer</h1></div></div></section><section class="section container"><div class="luca-story"><article class="luca-scene"><div class="luca-scene-text"><p class="eyebrow blue">WHATSAPP</p><h3>A client moves their session.</h3><ol class="luca-steps"><li>Ryan asks to move his Thursday session.</li><li>The assistant greets him by name and offers the next two free slots.</li><li>Ryan picks Friday at 06:30 and it is booked.</li></ol><p>Luca stays with his clients while the chat takes care of it.</p></div><div class="luca-scene-phone case-chat" role="img" aria-label="Example WhatsApp conversation: Ryan asks to move Thursday, is offered Thursday at 20:00 or Friday at 06:30, picks Friday at 06:30, and it is confirmed.">${caseChat}</div></article></div></section>${cta}`;}
function contact() {return `${topHero('LET’S TALK','How can we help <span>your business?</span>','')}<section class="container form-section"><form id="enquiry-form" class="form-panel"><div class="form-grid needs-fields"><label>What type of business do you run?<input name="businessType" placeholder="e.g. solicitor, accountant, retailer" maxlength="160"></label><label>What would you like to improve? <span class="required">*</span><textarea name="improvements" placeholder="Tell us about your daily challenges…" required maxlength="3000" rows="4"></textarea></label></div><div class="contact-paths"><div class="consult-card">${icon('phone')}<h2>Ask for a call.</h2><p>Free phone call<br><strong>30 minutes · No obligation</strong></p><button type="button" class="button" id="continue-booking">Choose a time</button></div><div class="email-form"><p class="eyebrow blue">PREFER EMAIL?</p><h2>Send us your enquiry.</h2>${details()}<p class="small-copy">${config.launch ? `Review your enquiry in your email app, then press Send. ` : ''}We’ll only use your details to respond to this enquiry. <a href="/privacy">Privacy information</a></p><button type="submit" class="button" id="send-enquiry">${config.launch?'Open enquiry in email app':config.preview?'Save a test enquiry':'Send enquiry'}</button><div class="form-message" role="status" aria-live="polite"></div></div></div></form></section>`;}
function consultFields() {return `<div class="form-grid"><label>Full name <span class="required">*</span><input name="name" autocomplete="name" required maxlength="120"></label><label>Business name <span class="required">*</span><input name="business" autocomplete="organization" required maxlength="160"></label><label>Email address <span class="required">*</span><input type="email" name="email" autocomplete="email" required maxlength="254"></label><label>Telephone <span class="required">*</span><input type="tel" name="phone" autocomplete="tel" required maxlength="40" placeholder="The number we should call"></label><label class="full">What would you like to talk about? <span class="required">*</span><textarea name="improvements" required maxlength="3000" rows="4" placeholder="The job that keeps coming back."></textarea></label></div><fieldset class="phone-options"><legend>If you already know how you’d like to go on</legend><label class="radio"><input type="radio" name="way" value="tool"> A tool built for the work</label><label class="radio"><input type="radio" name="way" value="visit"> A team in the office</label><label class="radio"><input type="radio" name="way" value="unsure" checked> Happy to decide on the call</label></fieldset><label class="honeypot" aria-hidden="true">Leave empty<input name="website" tabindex="-1" autocomplete="off"></label>`;}
function booking() {return `${topHero('BOOK A CONSULTATION','Thirty minutes <span>on the phone.</span>','Free, with no obligation. Pick a time, or ask for a call back.')}<section class="container booking-section"><div class="booking-layout"><div class="form-panel diary-panel"><div class="book-modes" role="group" aria-label="How should we arrange the call"><button type="button" class="book-mode" id="mode-slot" aria-pressed="true">${icon('calendar')}<span><strong>Pick a time</strong><small>30 minutes · UK time</small></span></button><button type="button" class="book-mode" id="mode-callback" aria-pressed="false">${icon('phone')}<span><strong>Ask for a call back</strong><small>Leave your number</small></span></button></div><div id="diary"></div><div class="hours-block" id="hours" hidden><h2 id="hours-label"></h2><div class="hour-list" id="hour-list"></div></div><div class="callback-note" id="callback-note" hidden><h2>We’ll call you back.</h2><p>${config.launch ? 'Leave your number, and the day and time you prefer. We will confirm the time when we reply.' : 'Leave your number, and the day and time you prefer. That hour comes off the diary.'}</p></div></div><div class="booking-main form-panel"><form id="consult-form"><h2 id="book-heading">Request this time</h2><p id="chosen-time">Choose a day, then a time.</p><div class="form-grid preference" id="callback-when" hidden><label>Preferred day <span class="required">*</span><select name="preferredDay"><option value="">Choose a day</option></select></label><label>Preferred time <span class="required">*</span><select name="preferredTime"><option value="">Choose a time</option><option>09:00</option><option>09:30</option><option>10:00</option><option>10:30</option><option>11:00</option><option>11:30</option><option>12:00</option><option>12:30</option><option>13:00</option><option>13:30</option><option>14:00</option><option>14:30</option><option>15:00</option><option>15:30</option><option>16:00</option><option>16:30</option></select></label></div>${consultFields()}<p id="booking-context" class="small-copy"></p><p class="small-copy">${config.launch ? `This opens your email app, addressed to ${esc(config.contactEmail)}. No time is booked until we reply.` : 'This preview saves your request on this Mac and holds that hour on the diary. No email is sent.'} <a href="/privacy">Privacy information</a></p><button type="submit" class="button" disabled>Request this time</button><div class="form-message" role="status" aria-live="polite"></div></form></div></div></section>`;}
function legal(type) {
 const email='<a href="mailto:hello@beyond-automation.co.uk">hello@beyond-automation.co.uk</a>';
 const content={
 privacy: ['Privacy information', `<h2>About this notice</h2><p>Beyond Automation is a service being developed by BeyondReel.ai. BeyondReel.ai is responsible for the enquiry information described here. This notice covers the current website and email enquiry flow. Contact ${email} about your information. We use your information to respond to requests and arrange trial consultations. Our lawful basis is our legitimate interest in handling enquiries and testing the service you have asked to try; where you request steps towards a paid agreement, we process the necessary information for those pre-contractual steps.</p><h2>Information you choose to share</h2><p>The forms ask for your name, business, email address, enquiry and, when you request a call, your telephone number and preferred time. Please do not include client records, health information, passwords or payment details.</p><h2>How enquiries work</h2><p>On the public site, submitting a form prepares a message in your email application. You must press Send there. The form does not save your enquiry to a shared website database or automatically send an email. We use the information you send to respond and arrange the conversation you requested. We do not automatically subscribe enquiries to marketing.</p><h2>Who handles the information</h2><p>Domain email is forwarded through Names.co.uk to our Google Gmail inbox. Your own email provider also handles the message. The website is hosted through ChatGPT Sites; hosting providers may process connection information for delivery and security. Email and hosting providers have their own processing and backup arrangements. We do not promise that deleting an email removes all provider backups.</p><h2>Browser storage</h2><p>If you continue from the questionnaire to booking, your selected services and enquiry description are temporarily stored in this browser tab. See our <a href="/cookies">cookie and storage information</a>. Closing the tab normally ends that session; browser restore features may retain it.</p><h2>How long we keep information</h2><p>We delete unsuccessful enquiries and trial booking records 90 days after the last contact. If an enquiry becomes a paid project, we will explain the retention arrangements for that project separately. A specific legal obligation or dispute may require particular records to be retained longer. Provider backups may follow different deletion schedules.</p><h2>Your choices and requests</h2><p>You can contact ${email} to ask about access, correction or deletion of information you have sent, or raise a concern. Other rights, including restriction, objection and portability, depend on the circumstances. You can also <a href="https://ico.org.uk/make-a-complaint/">raise a concern with the UK Information Commissioner’s Office</a>.</p><h2>Before connected bookings</h2><p>This notice will be updated with the chosen booking provider and any relevant international transfer arrangements before a shared booking service is enabled.</p>`],
 terms: ['Terms &amp; conditions', `<h2>Using this development website</h2><p>Beyond Automation is a service being developed by BeyondReel.ai. We are preparing and testing these services. These terms describe use of this website and requests for an introductory conversation. They are not a contract for a paid development project.</p><h2>Consultations and trial requests</h2><p>The introductory phone conversation is free and planned for 30 minutes. The current diary lets you request a preferred time by email. Displayed times are UK time (Europe/London). Choosing a time does not reserve it, check a shared calendar or guarantee availability. We will agree the time with you by reply.</p><h2>Changing or cancelling a request</h2><p>Email ${email}, preferably by replying to the arrangement email. Include your name and the requested date and time. Automatic reminders, cancellation links and rescheduling are not connected yet.</p><h2>Examples and planned services</h2><p>Illustrated conversations, example quotations and service scenarios show proposed uses. Unless explicitly identified as a completed project, they are not verified client results or promises of performance. Products under development may change after testing.</p><h2>Paid work</h2><p>This website takes no payments. Before any paid work begins, the supplier identity, scope, price, taxes, delivery arrangements, ownership, support and cancellation terms must be agreed separately in writing. An enquiry does not commit you to purchasing work.</p><h2>Responsible use</h2><p>Please provide information you are entitled to share and do not misuse the forms, impersonate others or attempt to disrupt the website. External services have their own terms. Nothing on this page limits rights or responsibilities that cannot lawfully be excluded.</p><h2>Questions or concerns</h2><p>Contact ${email} about this website, a consultation request or these terms.</p>`],
 cookies: ['Cookies &amp; browser storage', `<h2>What the website uses</h2><p>The website code does not add advertising trackers or analytics cookies. Its questionnaire uses session storage to carry your selected services, business type and enquiry description to the booking page when you choose to continue.</p><h2>Clear your saved questionnaire</h2><p>You can remove these saved answers now. This does not delete emails you have already sent or information held by your email provider.</p><button class="button" id="clear-questionnaire" type="button">Clear saved questionnaire</button><p id="storage-status" role="status"></p><h2>Hosting and external services</h2><p>The hosting platform may use storage or connection information needed to deliver and secure the site. Opening your email application takes you to a separate service. No calendar widget is currently embedded. We will review storage and consent requirements before adding booking, analytics or other embedded services.</p><p>For information about enquiries, read our <a href="/privacy">privacy information</a>. Questions: ${email}.</p>`]
 };
 const [title,body]=content[type];
 return `${hero('BEYOND AUTOMATION',title,'Website and consultation information')}<section class="section container prose"><p class="small-copy">Updated 25 November 2026</p>${body}<p><a class="button" href="/contact">Contact us</a></p></section>`;
}
const pages = {'/':home,'/services':home,'/case-study':caseStudy,'/about':about,'/contact':contact,'/book':booking,'/privacy':()=>legal('privacy'),'/terms':()=>legal('terms'),'/cookies':()=>legal('cookies')};
const titles = {'/':'Practical AI for your business','/case-study':'Case study','/about':'About us','/contact':'Contact us','/book':'Book a free consultation','/privacy':'Privacy information','/terms':'Terms and conditions','/cookies':'Cookies and browser storage'};
document.title = `${titles[route] || 'Page not found'} | Beyond Automation`;
document.body.classList.toggle('is-home', route === '/');
$('#app').innerHTML = header + `<main id="main">${(pages[route] || (()=>hero('PAGE NOT FOUND','Let’s get you back on track.','', '<a class="button" href="/">Go home</a>')))()}</main>` + footer;
$('#clear-questionnaire')?.addEventListener('click',()=>{try{sessionStorage.removeItem('beyond-questionnaire');$('#storage-status').textContent='Your saved questionnaire has been cleared.';}catch{$('#storage-status').textContent='Please clear this site’s storage in your browser settings.'}});
drawHomeMark();
animatePath();
setupHomeInteractive();
setupCallDemo();
setupCaseChat();
$('.menu-toggle').addEventListener('click', e=>{const button=e.currentTarget; const expanded=button.getAttribute('aria-expanded')==='true'; button.setAttribute('aria-expanded', String(!expanded)); button.setAttribute('aria-label',expanded?'Open navigation':'Close navigation'); $('#navigation').classList.toggle('open',!expanded);});

function setupPhone(form) {form.querySelectorAll('[name="phonePermission"]').forEach(input=>input.addEventListener('change',()=>{const yes=$('[name="phonePermission"]:checked',form).value==='true'; $('#phone-field',form).hidden=!yes; $('[name="phone"]',form).required=yes;}));}
function readForm(form) {const data = new FormData(form);return {...Object.fromEntries(data), services:data.getAll('services'),phonePermission:data.get('phonePermission')==='true',phone:data.get('phone') || ''};}
function context() {try{return JSON.parse(sessionStorage.getItem('beyond-questionnaire')) || {};}catch{return {};}}
async function submit(form, endpoint, body) {
 const message=$('.form-message',form), button=$('[type="submit"]',form);
 button.disabled=true; message.textContent='Sending…'; message.className='form-message';
 form.dataset.requestId ||= crypto.randomUUID();
 try {const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':form.dataset.requestId},body:JSON.stringify(body)});const data=await res.json();if(!res.ok)throw new Error(data.error || 'Please try again.');message.classList.add('success');
 if(data.status==='preview') message.textContent=form.id==='consult-form'?(form.dataset.timeNote || 'Saved on this Mac. No time is booked, and no email was sent.'):data.message;
 else if(data.status==='confirmed'){message.textContent=`Your consultation is confirmed for ${new Intl.DateTimeFormat('en-GB',{dateStyle:'full',timeStyle:'short',timeZone:'Europe/London'}).format(new Date(data.start))} (UK time). Check your email for the meeting link.`;sessionStorage.removeItem('beyond-questionnaire');}
 else message.textContent=form.id==='consult-form'?(form.dataset.timeNote || 'Your request has been sent. No time is booked until we reply.'):'Your enquiry has been sent. Check your inbox for your confirmation.';
 if(form.id==='consult-form' && (data.status==='preview' || data.status==='sent')) {delete form.dataset.requestedStart; form.dispatchEvent(new Event('consult-reset'));}
 form.reset(); const phone=$('#phone-field',form); if(phone)phone.hidden=true; const phoneInput=$('[name="phone"]',form);if(phoneInput)phoneInput.required=false;
 delete form.dataset.requestId;
 if(data.status==='confirmed') {button.hidden=true;document.querySelectorAll('.slot').forEach(s=>s.disabled=true);}
 }catch(e){message.classList.add('error');message.textContent=e.message; if(form.id==='consult-form')form.dispatchEvent(new Event('consult-refresh'));}finally{button.disabled=form.id==='consult-form' && form.dataset.mode!=='callback' && !form.dataset.requestedStart;}
}
const enquiry=$('#enquiry-form');
if(enquiry){setupPhone(enquiry);const selected=currentServiceId(new URLSearchParams(location.search).get('service'));enquiry.querySelectorAll('[name="services"]').forEach(input=>input.checked=input.value===selected);
 enquiry.addEventListener('submit',e=>{e.preventDefault();const body=readForm(enquiry);if(!body.services.length) body.services=['unsure'];if(config.launch){const summary = ['Name: '+body.name,'Business: '+body.business,'Email: '+body.email,'Services: '+body.services.map(id=>services.find(s=>s[0]===currentServiceId(id))?.[2]).join(', '),'Business type: '+body.businessType,'What I would like to improve: '+body.improvements,'Telephone permission: '+(body.phonePermission?'Yes':'No'),...(body.phonePermission?['Telephone: '+body.phone]:[])].join('\n\n');location.href='mailto:'+encodeURIComponent(config.contactEmail)+'?subject='+encodeURIComponent('Beyond Automation enquiry')+'&body='+encodeURIComponent(summary);$('.form-message',enquiry).textContent='Press Send in your email app to send your enquiry. If it hasn’t opened, email '+config.contactEmail+' directly.';return;}submit(enquiry,'/api/enquiries',body);});
 $('#continue-booking').addEventListener('click',()=>{const data=readForm(enquiry);try{sessionStorage.setItem('beyond-questionnaire',JSON.stringify({services:data.services,businessType:data.businessType,improvements:data.improvements}));}catch{}location.href='/book';});
 enquiry.addEventListener('input',()=>delete enquiry.dataset.requestId);
}
const CALL_HOURS = [9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5];
const CALL_TIMES = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'];
function londonParts(date) {return Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',weekday:'short',hourCycle:'h23'}).formatToParts(date).filter(part=>part.type!=='literal').map(part=>[part.type,part.value]));}
function atLondon(year, month, day, hour, minute) {let guess = Date.UTC(year, month-1, day, hour, minute); for (let i=0;i<3;i++) {const part=londonParts(new Date(guess)); const got=Date.UTC(+part.year,+part.month-1,+part.day,+part.hour,+part.minute); const want=Date.UTC(year, month-1, day, hour, minute); if (got===want) return new Date(guess); guess += want-got;} return new Date(guess);}
function dayKey(year, month, day) {return `${year}-${month}-${String(day).padStart(2,'0')}`;}
function keyOf(date) {const part=londonParts(date); return dayKey(part.year, part.month, part.day);}
const consultForm=$('#consult-form');
if(consultForm){const saved=context();const jobs=(saved.services||[]).map(currentServiceId).filter(id=>services.some(s=>s[0]===id));const named=jobs.filter(id=>id!=='unsure');const note=$('#booking-context');if(note)note.textContent=named.length?`From your enquiry: ${named.map(id=>services.find(s=>s[0]===id)[2]).join(', ')}`:'';if(saved.improvements)$('[name="improvements"]',consultForm).value=saved.improvements;if(jobs.includes('tool'))consultForm.querySelector('[name="way"][value="tool"]').checked=true;if(jobs.includes('visit'))consultForm.querySelector('[name="way"][value="visit"]').checked=true;
 const diary=$('#diary'), hours=$('#hours'), hourList=$('#hour-list'), hoursLabel=$('#hours-label'), chosen=$('#chosen-time'), bookButton=$('[type="submit"]',consultForm);
 let liveSlots=null, taken=new Set();
 if(config.schedulingConnected){try{const res=await fetch('/api/availability');const data=await res.json();if(data.connected)liveSlots=data.slots.map(slot=>({id:slot.id,start:new Date(slot.start)})).filter(slot=>slot.start.getTime()>Date.now());}catch{}}
 async function loadTaken(){try{const data=await (await fetch('/api/taken')).json();taken=new Set((data.starts||[]).filter(start=>Number.isFinite(Date.parse(start))).map(start=>new Date(start).toISOString()));}catch{taken=new Set();}}
 await loadTaken();
 const nowParts=londonParts(new Date());
 let view={y:+nowParts.year,m:+nowParts.month}, focus=null, selected=null;
 const weekdayIndex={Mon:0,Tue:1,Wed:2,Thu:3,Fri:4,Sat:5,Sun:6};
 function hoursFor(year, month, day) {const weekday=londonParts(atLondon(year, month, day, 12, 0)).weekday; if(weekday==='Sat'||weekday==='Sun')return []; if(liveSlots)return liveSlots.filter(slot=>keyOf(slot.start)===dayKey(year, month, day)).map(slot=>slot.start); return CALL_HOURS.map(hour=>atLondon(year, month, day, Math.floor(hour), hour%1?30:0)).filter(date=>date.getTime()>Date.now()+30*60*1000);}
 function timeLabel(date) {return new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone:'Europe/London'}).format(date);}
 function dateLabel(date) {return new Intl.DateTimeFormat('en-GB',{weekday:'long',day:'numeric',month:'long',timeZone:'Europe/London'}).format(date);}
 function paintHours() {if(!focus){hours.hidden=true;return;} const list=hoursFor(focus.y, focus.m, focus.d); hours.hidden=false; hoursLabel.textContent=dateLabel(atLondon(focus.y, focus.m, focus.d, 12, 0)); hourList.innerHTML=list.length?list.map(date=>{const held=taken.has(date.toISOString()); const pressed=!held&&selected&&selected.getTime()===date.getTime(); return `<button type="button" class="slot${held?' is-taken':''}" data-start="${date.toISOString()}" ${held?'disabled':''} aria-pressed="${pressed?'true':'false'}"${held?` aria-label="${timeLabel(date)}, already booked"`:''}>${timeLabel(date)}</button>`;}).join(''):'<p class="small-copy">No times left on this day.</p>'; hourList.querySelectorAll('.slot:not(:disabled)').forEach(button=>button.addEventListener('click',()=>{selected=new Date(button.dataset.start); consultForm.dataset.requestedStart=selected.toISOString(); bookButton.disabled=false; chosen.textContent=`${dateLabel(selected)} at ${timeLabel(selected)}`; paintHours();}));}
 function paint() {const today=londonParts(new Date()); const todayKey=dayKey(today.year, today.month, today.day); const first=londonParts(atLondon(view.y, view.m, 1, 12, 0)).weekday; const offset=weekdayIndex[first]??0; const count=new Date(Date.UTC(view.y, view.m, 0)).getUTCDate(); const cells=[]; for(let i=0;i<offset;i++)cells.push('<span></span>'); for(let day=1;day<=count;day++){const open=hoursFor(view.y, view.m, day).length>0; const key=dayKey(view.y, view.m, day); const pressed=focus&&dayKey(focus.y, focus.m, focus.d)===key; cells.push(`<button type="button" class="day${key===todayKey?' is-today':''}" data-day="${day}" ${open?'':'disabled'} aria-pressed="${pressed?'true':'false'}">${day}</button>`);} const earliest={y:+today.year,m:+today.month}; const latestMonth=new Date(Date.UTC(+today.year, +today.month-1+2, 1)); const latest={y:latestMonth.getUTCFullYear(),m:latestMonth.getUTCMonth()+1}; diary.innerHTML=`<div class="diary-head"><h2>${esc(new Intl.DateTimeFormat('en-GB',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(view.y, view.m-1, 1))))}</h2><div class="diary-nav"><button type="button" id="diary-prev" aria-label="Previous month" ${view.y===earliest.y&&view.m===earliest.m?'disabled':''}>‹</button><button type="button" id="diary-next" aria-label="Next month" ${view.y===latest.y&&view.m===latest.m?'disabled':''}>›</button></div></div><div class="diary-grid"><span class="dow">Mo</span><span class="dow">Tu</span><span class="dow">We</span><span class="dow">Th</span><span class="dow">Fr</span><span class="dow">Sa</span><span class="dow">Su</span>${cells.join('')}</div><p class="small-copy diary-key">Choose a highlighted day, then a time. All times are UK time.</p>`;
  $('#diary-prev').addEventListener('click',()=>{const next=new Date(Date.UTC(view.y, view.m-2, 1)); view={y:next.getUTCFullYear(),m:next.getUTCMonth()+1}; paint();});
  $('#diary-next').addEventListener('click',()=>{const next=new Date(Date.UTC(view.y, view.m, 1)); view={y:next.getUTCFullYear(),m:next.getUTCMonth()+1}; paint();});
  diary.querySelectorAll('.day:not(:disabled)').forEach(button=>button.addEventListener('click',()=>{focus={y:view.y,m:view.m,d:+button.dataset.day}; paint(); paintHours();}));}
 function firstOpenDay(){const t=londonParts(new Date()); let y=+t.year,m=+t.month,d=+t.day; for(let i=0;i<92;i++){if(hoursFor(y,m,d).length)return {y,m,d}; const n=new Date(Date.UTC(y,m-1,d+1)); y=n.getUTCFullYear(); m=n.getUTCMonth()+1; d=n.getUTCDate();} return null;}
 const firstOpen=firstOpenDay(); if(firstOpen){focus=firstOpen; view={y:firstOpen.y,m:firstOpen.m};}
 paint(); paintHours();
 const bookHeading=$('#book-heading'), callbackNote=$('#callback-note');
 let mode='slot';
 const preferredDay=consultForm.querySelector('[name="preferredDay"]'), preferredTime=consultForm.querySelector('[name="preferredTime"]'), callbackWhen=$('#callback-when');
 function preferenceDays(){if(preferredDay.options.length>1)return; const start=londonParts(new Date()); let y=+start.year,m=+start.month,d=+start.day; const options=[]; for(let i=0;options.length<10&&i<24;i++){const next=new Date(Date.UTC(y,m-1,d+1)); y=next.getUTCFullYear(); m=next.getUTCMonth()+1; d=next.getUTCDate(); const at=atLondon(y,m,d,12,0); if(['Sat','Sun'].includes(londonParts(at).weekday))continue; options.push(`<option value="${dayKey(y,m,d)}">${esc(dateLabel(at))}</option>`);} preferredDay.insertAdjacentHTML('beforeend',options.join(''));}
 function instantFromKey(key, time){const [y,m,d]=key.split('-').map(Number); const [hour,minute]=time.split(':').map(Number); return atLondon(y,m,d,hour,minute);}
 function renderPreferenceTimes(){const current=preferredTime.value; preferredTime.innerHTML='<option value="">Choose a time</option>'+CALL_TIMES.map(time=>{const held=Boolean(preferredDay.value)&&taken.has(instantFromKey(preferredDay.value,time).toISOString()); return `<option value="${time}">${time}${held?' · booked':''}</option>`;}).join(''); preferredTime.value=CALL_TIMES.includes(current)?current:''; return warnIfHeld();}
 function warnIfHeld(){const message=$('.form-message',consultForm); const held=mode==='callback'&&preferredDay.value&&preferredTime.value&&taken.has(instantFromKey(preferredDay.value,preferredTime.value).toISOString()); if(!held){if(message.textContent==='That time is already booked. Choose another.'){message.textContent=''; message.className='form-message';} return false;} message.className='form-message error'; message.textContent='That time is already booked. Choose another.'; return true;}
 function setMode(next){mode=next; consultForm.dataset.mode=next; const callback=next==='callback'; $('#mode-slot').setAttribute('aria-pressed',String(!callback)); $('#mode-callback').setAttribute('aria-pressed',String(callback)); diary.hidden=callback; callbackNote.hidden=!callback; callbackWhen.hidden=!callback; preferredDay.required=callback; preferredTime.required=callback; if(callback){hours.hidden=true; preferenceDays(); renderPreferenceTimes();} else if(focus)paintHours(); bookHeading.textContent=callback?'Ask for a call back':'Request this time'; bookButton.textContent=callback?'Ask for a call back':'Request this time'; bookButton.disabled=!callback&&!selected; chosen.textContent=callback?'Tell us the day and time you prefer.':selected?`${dateLabel(selected)} at ${timeLabel(selected)}`:'Choose a day, then a time.';}
 $('#mode-slot').addEventListener('click',()=>setMode('slot'));
 $('#mode-callback').addEventListener('click',()=>setMode('callback'));
 if(location.hash==='#callback')setMode('callback');
 preferredDay.addEventListener('change',renderPreferenceTimes);
 preferredTime.addEventListener('change',()=>warnIfHeld());
 consultForm.addEventListener('consult-reset',async()=>{selected=null; focus=null; delete consultForm.dataset.requestedStart; hours.hidden=true; await loadTaken(); paint(); setMode('slot');});
 consultForm.addEventListener('consult-refresh',async()=>{await loadTaken(); paint(); if(focus)paintHours(); if(mode==='callback')renderPreferenceTimes();});
 consultForm.addEventListener('input',()=>delete consultForm.dataset.requestId);
 consultForm.addEventListener('submit',e=>{e.preventDefault();const callback=mode==='callback';if(!callback&&!selected){const message=$('.form-message',consultForm);message.className='form-message error';message.textContent='Choose a time in the diary.';return;}const body=readForm(consultForm);if(callback&&(!body.preferredDay||!body.preferredTime)){const message=$('.form-message',consultForm);message.className='form-message error';message.textContent='Choose a preferred day and time.';return;}const way=body.way||'unsure';const chosenServices=[...new Set([...named,way])].slice(0,8);const callbackStart=callback?instantFromKey(body.preferredDay,body.preferredTime):null; if((callback&&taken.has(callbackStart.toISOString()))||(!callback&&taken.has(selected.toISOString()))){const message=$('.form-message',consultForm);message.className='form-message error';message.textContent='That time is already booked. Choose another.';return;}const when=callback?`${dateLabel(callbackStart)} at ${timeLabel(callbackStart)}`:`${dateLabel(selected)} at ${timeLabel(selected)}`;const payload={name:body.name,business:body.business,email:body.email,services:chosenServices.length?chosenServices:['unsure'],businessType:saved.businessType||'',improvements:body.improvements,phonePermission:true,phone:body.phone,website:body.website||''}; if(callback){payload.callbackWhen=when; payload.callbackStart=callbackStart.toISOString();} else payload.requestedStart=selected.toISOString();
  consultForm.dataset.timeNote=callback?(config.launch?`Your email app should open for a call back on ${when}. No time is booked.`:`Saved on this Mac as a call back for ${when}. That hour is held on this diary. No email was sent.`):(config.launch?`Your email app should open for ${when}. No time is booked until we reply.`:`Saved on this Mac for ${when}. That hour is held on this diary. No email was sent.`);
  if(config.launch){const wayName=way==='tool'?'A tool built for the work':way==='visit'?'A team in the office':'Decide on the call';const summary=['Name: '+payload.name,'Business: '+payload.business,'Email: '+payload.email,'Telephone: '+payload.phone,(callback?'Call back':'Phone call')+': '+when,'Way: '+wayName,'Talk about: '+payload.improvements].join('\n\n');location.href='mailto:'+encodeURIComponent(config.contactEmail)+'?subject='+encodeURIComponent(callback?'Ask for a call back':'Book a phone call')+'&body='+encodeURIComponent(summary);const message=$('.form-message',consultForm);message.className='form-message';message.textContent=consultForm.dataset.timeNote;return;}
  submit(consultForm,'/api/enquiries',payload);});
}
if(location.hash) requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView());
