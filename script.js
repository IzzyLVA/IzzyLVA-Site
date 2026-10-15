const canvas = document.querySelector('#network-bg');
const context = canvas?.getContext('2d');
const scanHud = document.querySelector('#scan-hud');
const scanCountry = document.querySelector('#scan-country');
const scanIp = document.querySelector('#scan-ip');
const hero = document.querySelector('#home');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvas && context) {
    let width = 0;
    let height = 0;
    let mapBounds = { x: 0, y: 0, width: 0, height: 0 };
    let animationFrame = 0;
    let animationTime = 0;
    let previousFrameTime = null;
    let mapIsActive = false;
    let countryFeatures = [];
    let targetOrder = [];
    let currentTargetIndex = 0;
    let routePairs = [];
    let routeCycle = -1;

    // Fallback silhouettes are used if the real country-boundary data is unavailable.
    const continents = [
        [[.02,.22],[.07,.15],[.12,.13],[.16,.16],[.20,.16],[.23,.21],[.28,.23],[.30,.28],[.27,.32],[.24,.34],[.23,.40],[.20,.43],[.19,.50],[.16,.49],[.15,.44],[.12,.42],[.11,.37],[.07,.34],[.05,.29]],
        [[.24,.52],[.27,.54],[.29,.60],[.31,.65],[.30,.71],[.28,.77],[.27,.84],[.24,.79],[.23,.71],[.21,.66],[.22,.59]],
        [[.36,.15],[.40,.12],[.43,.14],[.42,.18],[.39,.19]],
        [[.45,.25],[.49,.22],[.53,.24],[.56,.22],[.59,.25],[.58,.29],[.55,.30],[.53,.34],[.50,.34],[.49,.31],[.46,.30]],
        [[.48,.35],[.53,.33],[.57,.36],[.59,.42],[.58,.48],[.55,.55],[.53,.63],[.50,.68],[.48,.61],[.47,.53],[.45,.46],[.46,.40]],
        [[.56,.26],[.60,.23],[.65,.22],[.69,.20],[.73,.22],[.78,.20],[.83,.22],[.88,.20],[.94,.24],[.97,.29],[.94,.33],[.89,.33],[.86,.37],[.82,.36],[.80,.41],[.76,.39],[.73,.35],[.70,.36],[.68,.33],[.64,.34],[.61,.31],[.58,.32]],
        [[.59,.36],[.63,.36],[.67,.39],[.69,.44],[.66,.47],[.62,.45],[.60,.41]],
        [[.72,.43],[.76,.44],[.79,.48],[.78,.52],[.75,.51],[.73,.48]],
        [[.79,.66],[.84,.64],[.89,.66],[.92,.70],[.90,.75],[.86,.77],[.82,.75],[.80,.71]],
        [[.91,.41],[.93,.43],[.92,.47],[.90,.45]],
        [[.65,.51],[.70,.51],[.73,.54],[.71,.57],[.67,.56]],
        [[.17,.10],[.21,.09],[.24,.12],[.23,.16],[.19,.15]]
    ];

    const countries = [
        { name: 'UNITED STATES', code: 'US', lon: -98, lat: 39, ip: '198.51.100.24' },
        { name: 'CANADA', code: 'CA', lon: -106, lat: 56, ip: '198.51.100.37' },
        { name: 'MEXICO', code: 'MX', lon: -102, lat: 23, ip: '198.51.100.42' },
        { name: 'BRAZIL', code: 'BR', lon: -52, lat: -10, ip: '203.0.113.18' },
        { name: 'UNITED KINGDOM', code: 'GB', lon: -2, lat: 54, ip: '203.0.113.29' },
        { name: 'FRANCE', code: 'FR', lon: 2, lat: 46, ip: '203.0.113.31' },
        { name: 'GERMANY', code: 'DE', lon: 10, lat: 51, ip: '203.0.113.42' },
        { name: 'NIGERIA', code: 'NG', lon: 8, lat: 9, ip: '192.0.2.54' },
        { name: 'SOUTH AFRICA', code: 'ZA', lon: 24, lat: -29, ip: '192.0.2.61' },
        { name: 'INDIA', code: 'IN', lon: 78, lat: 22, ip: '192.0.2.73' },
        { name: 'SINGAPORE', code: 'SG', lon: 104, lat: 1, ip: '192.0.2.82' },
        { name: 'JAPAN', code: 'JP', lon: 139, lat: 36, ip: '192.0.2.94' },
        { name: 'SOUTH KOREA', code: 'KR', lon: 127, lat: 37, ip: '198.51.100.105' },
        { name: 'AUSTRALIA', code: 'AU', lon: 134, lat: -25, ip: '198.51.100.118' },
        { name: 'ARGENTINA', code: 'AR', lon: -64, lat: -34, ip: '203.0.113.131' },
        { name: 'KENYA', code: 'KE', lon: 37, lat: 0, ip: '203.0.113.144' },
        { name: 'UNITED ARAB EMIRATES', code: 'AE', lon: 54, lat: 24, ip: '192.0.2.157' },
        { name: 'NETHERLANDS', code: 'NL', lon: 5, lat: 52, ip: '198.51.100.170' },
        { name: 'CHILE', code: 'CL', lon: -71, lat: -33, ip: '192.0.2.183' },
        { name: 'INDONESIA', code: 'ID', lon: 118, lat: -2, ip: '203.0.113.196' },
        { name: 'IRELAND', code: 'IE', lon: -8, lat: 53, ip: '198.51.100.201' },
        { name: 'SPAIN', code: 'ES', lon: -4, lat: 40, ip: '203.0.113.202' },
        { name: 'ITALY', code: 'IT', lon: 12, lat: 42, ip: '192.0.2.203' },
        { name: 'SWEDEN', code: 'SE', lon: 18, lat: 60, ip: '198.51.100.204' },
        { name: 'POLAND', code: 'PL', lon: 19, lat: 52, ip: '203.0.113.205' },
        { name: 'TURKEY', code: 'TR', lon: 35, lat: 39, ip: '192.0.2.206' },
        { name: 'EGYPT', code: 'EG', lon: 30, lat: 27, ip: '198.51.100.207' },
        { name: 'GHANA', code: 'GH', lon: -2, lat: 8, ip: '203.0.113.208' },
        { name: 'ETHIOPIA', code: 'ET', lon: 40, lat: 9, ip: '192.0.2.209' },
        { name: 'PAKISTAN', code: 'PK', lon: 69, lat: 30, ip: '198.51.100.210' },
        { name: 'BANGLADESH', code: 'BD', lon: 90, lat: 24, ip: '203.0.113.211' },
        { name: 'THAILAND', code: 'TH', lon: 101, lat: 16, ip: '192.0.2.212' },
        { name: 'VIETNAM', code: 'VN', lon: 108, lat: 16, ip: '198.51.100.213' },
        { name: 'PHILIPPINES', code: 'PH', lon: 122, lat: 12, ip: '203.0.113.214' },
        { name: 'TAIWAN', code: 'TW', lon: 121, lat: 24, ip: '192.0.2.215' },
        { name: 'NEW ZEALAND', code: 'NZ', lon: 174, lat: -41, ip: '198.51.100.216' },
        { name: 'PERU', code: 'PE', lon: -75, lat: -10, ip: '203.0.113.217' },
        { name: 'COLOMBIA', code: 'CO', lon: -73, lat: 4, ip: '192.0.2.218' },
        { name: 'SAUDI ARABIA', code: 'SA', lon: 45, lat: 24, ip: '198.51.100.219' },
        { name: 'ISRAEL', code: 'IL', lon: 35, lat: 31, ip: '203.0.113.220' },
        { name: 'CHINA', code: 'CN', lon: 105, lat: 35, ip: '192.0.2.221' },
        { name: 'RUSSIA', code: 'RU', lon: 90, lat: 60, ip: '198.51.100.222' }
    ];
    const scanTravelMs = 2600;
    const scanDwellMs = 3600;
    const scanCycleMs = scanTravelMs + scanDwellMs;
    const shuffle = (values) => {
        const result = [...values];
        for (let index = result.length - 1; index > 0; index -= 1) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
        }
        return result;
    };
    targetOrder = shuffle(countries.map((_, index) => index));

    function pointOnMap(point) {
        return {
            x: mapBounds.x + ((point.lon + 180) / 360) * mapBounds.width,
            y: mapBounds.y + ((90 - point.lat) / 180) * mapBounds.height,
        };
    }

    function resizeCanvas() {
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * pixelRatio;
        canvas.height = height * pixelRatio;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const mapWidth = width * .96;
        const mapHeight = Math.min(height * .78, mapWidth * .5);
        mapBounds = {
            x: (width - mapWidth) / 2,
            y: (height - mapHeight) / 2,
            width: mapWidth,
            height: mapHeight,
        };
    }

    function drawLand() {
        context.save();
        context.lineJoin = 'round';
        if (countryFeatures.length) {
            countryFeatures.forEach((feature, index) => {
                const polygons = feature.geometry.type === 'Polygon'
                    ? [feature.geometry.coordinates]
                    : feature.geometry.coordinates;
                context.beginPath();
                polygons.forEach((polygon) => polygon.forEach((ring) => {
                    ring.forEach(([longitude, latitude], pointIndex) => {
                        const point = pointOnMap({ lon: longitude, lat: latitude });
                        if (pointIndex === 0) context.moveTo(point.x, point.y);
                        else context.lineTo(point.x, point.y);
                    });
                    context.closePath();
                }));
                context.fillStyle = index % 2 === 0 ? 'rgba(130, 165, 225, .065)' : 'rgba(171, 164, 231, .055)';
                context.strokeStyle = 'rgba(171, 207, 255, .28)';
                context.lineWidth = .7;
                context.fill('evenodd');
                context.stroke();
            });
        } else {
            continents.forEach((continent, index) => {
                context.beginPath();
                continent.forEach(([x, y], pointIndex) => {
                    const point = { x: mapBounds.x + x * mapBounds.width, y: mapBounds.y + y * mapBounds.height };
                    if (pointIndex === 0) context.moveTo(point.x, point.y);
                    else context.lineTo(point.x, point.y);
                });
                context.closePath();
                context.fillStyle = index % 3 === 0 ? 'rgba(130, 165, 225, .085)' : 'rgba(171, 164, 231, .07)';
                context.strokeStyle = 'rgba(171, 207, 255, .31)';
                context.lineWidth = 1.15;
                context.fill();
                context.stroke();
            });
        }

        context.setLineDash([2, 8]);
        context.strokeStyle = 'rgba(171, 207, 255, .14)';
        context.lineWidth = .65;
        for (let index = 1; index < 6; index += 1) {
            const y = mapBounds.y + mapBounds.height * index / 6;
            context.beginPath();
            context.moveTo(mapBounds.x, y);
            context.lineTo(mapBounds.x + mapBounds.width, y);
            context.stroke();
        }
        for (let index = 1; index < 12; index += 1) {
            const x = mapBounds.x + mapBounds.width * index / 12;
            context.beginPath();
            context.moveTo(x, mapBounds.y + mapBounds.height * .12);
            context.lineTo(x, mapBounds.y + mapBounds.height * .88);
            context.stroke();
        }
        context.restore();
    }

    function drawRoutes(time) {
        routePairs.forEach(([startIndex, endIndex], index) => {
            const start = pointOnMap(countries[startIndex]);
            const end = pointOnMap(countries[endIndex]);
            const middleX = (start.x + end.x) / 2;
            const curveHeight = Math.min(mapBounds.height * .22, Math.abs(end.x - start.x) * .17);
            const middleY = Math.min(start.y, end.y) - curveHeight;

            context.beginPath();
            context.moveTo(start.x, start.y);
            context.quadraticCurveTo(middleX, middleY, end.x, end.y);
            context.strokeStyle = index % 2 === 0 ? 'rgba(120, 215, 255, .42)' : 'rgba(169, 144, 255, .39)';
            context.lineWidth = 1;
            context.stroke();

            const progress = reducedMotion ? .5 : ((time / 1900 + index * .23) % 1);
            const inverse = 1 - progress;
            const packetX = inverse * inverse * start.x + 2 * inverse * progress * middleX + progress * progress * end.x;
            const packetY = inverse * inverse * start.y + 2 * inverse * progress * middleY + progress * progress * end.y;
            context.beginPath();
            context.arc(packetX, packetY, 2.2, 0, Math.PI * 2);
            context.fillStyle = index % 2 === 0 ? '#78d7ff' : '#b8aaff';
            context.shadowColor = context.fillStyle;
            context.shadowBlur = 9;
            context.fill();
            context.shadowBlur = 0;
        });

        const routeCountries = [...new Set(routePairs.flat())];
        routeCountries.forEach((countryIndex) => {
            const country = countries[countryIndex];
            const point = pointOnMap(country);
            context.beginPath();
            context.arc(point.x, point.y, 2.5, 0, Math.PI * 2);
            context.fillStyle = '#e3eaff';
            context.shadowColor = '#78d7ff';
            context.shadowBlur = 8;
            context.fill();
            context.shadowBlur = 0;
            context.font = '8px "DM Mono", monospace';
            context.fillStyle = 'rgba(235, 240, 255, .74)';
            context.fillText(country.code, point.x + 6, point.y - 5);
        });
    }

    function getScanState(time) {
        const cycleIndex = reducedMotion ? 0 : Math.floor(time / scanCycleMs);
        if (cycleIndex !== routeCycle) {
            routeCycle = cycleIndex;
            currentTargetIndex = targetOrder[cycleIndex % targetOrder.length];
            const shuffledCountryIndices = shuffle(countries.map((_, index) => index));
            routePairs = [];
            for (let index = 0; index < shuffledCountryIndices.length; index += 2) {
                routePairs.push([shuffledCountryIndices[index], shuffledCountryIndices[index + 1]]);
            }
        }

        const elapsed = reducedMotion ? scanTravelMs + scanDwellMs * .55 : time % scanCycleMs;
        const previousTargetIndex = targetOrder[(cycleIndex - 1 + targetOrder.length) % targetOrder.length];
        const previous = pointOnMap(countries[previousTargetIndex]);
        const current = pointOnMap(countries[currentTargetIndex]);
        const travelProgress = Math.max(0, Math.min(1, elapsed / scanTravelMs));
        const easedTravel = travelProgress * travelProgress * (3 - 2 * travelProgress);
        const point = {
            x: previous.x + (current.x - previous.x) * easedTravel,
            y: previous.y + (current.y - previous.y) * easedTravel,
        };
        const dwellProgress = Math.max(0, Math.min(1, (elapsed - scanTravelMs) / scanDwellMs));
        const zoomIn = Math.min(1, dwellProgress / .28);
        const zoomOut = Math.min(1, (1 - dwellProgress) / .28);
        const zoomEase = Math.min(zoomIn, zoomOut);
        return { point, country: countries[currentTargetIndex], zoom: 1 + zoomEase * .85, isStopped: elapsed >= scanTravelMs };
    }

    function drawScanner(time, scan) {
        const center = scan.point;
        const size = Math.max(64, Math.min(108, mapBounds.width * .09));
        const left = center.x - size / 2;
        const top = center.y - size / 2;
        const corner = size * .23;

        context.save();
        context.fillStyle = 'rgba(120, 215, 255, .035)';
        context.fillRect(left, top, size, size);
        context.setLineDash([4, 5]);
        context.lineWidth = 1;
        context.strokeStyle = 'rgba(120, 215, 255, .9)';
        context.strokeRect(left, top, size, size);
        context.setLineDash([]);
        context.strokeStyle = 'rgba(169, 144, 255, .95)';
        context.lineWidth = 2;
        [[left, top, 1, 1], [left + size, top, -1, 1], [left, top + size, 1, -1], [left + size, top + size, -1, -1]].forEach(([x, y, directionX, directionY]) => {
            context.beginPath();
            context.moveTo(x, y + directionY * corner);
            context.lineTo(x, y);
            context.lineTo(x + directionX * corner, y);
            context.stroke();
        });
        context.strokeStyle = 'rgba(227, 234, 255, .34)';
        context.lineWidth = .7;
        context.beginPath();
        context.moveTo(center.x - size * .17, center.y);
        context.lineTo(center.x + size * .17, center.y);
        context.moveTo(center.x, center.y - size * .17);
        context.lineTo(center.x, center.y + size * .17);
        context.stroke();
        context.fillStyle = 'rgba(227, 234, 255, .86)';
        context.font = '8px "DM Mono", monospace';
        context.fillText(scan.isStopped ? `LOCK // ${scan.country.code}` : 'TRACE // ACTIVE', left, top - 8);

        context.restore();

        if (scanHud) {
            const hudWidth = scanHud.offsetWidth || 155;
            const hudHeight = scanHud.offsetHeight || 53;
            scanHud.style.left = `${Math.max(8, Math.min(width - hudWidth - 8, center.x - hudWidth / 2))}px`;
            scanHud.style.top = `${Math.max(8, Math.min(height - hudHeight - 8, top + size + 10))}px`;
            scanCountry.textContent = `${scan.isStopped ? 'LOCKED / ' : 'ACQUIRING / '}${scan.country.name}`;
            scanIp.textContent = scan.country.ip;
        }
    }

    function drawMap(time = 0) {
        context.clearRect(0, 0, width, height);
        const scan = getScanState(time);
        context.save();
        context.translate(scan.point.x, scan.point.y);
        context.scale(scan.zoom, scan.zoom);
        context.translate(-scan.point.x, -scan.point.y);
        drawLand();
        drawRoutes(time);
        context.restore();
        drawScanner(time, scan);
    }

    function animateMap(time) {
        if (!mapIsActive) return;
        if (previousFrameTime !== null) animationTime += time - previousFrameTime;
        previousFrameTime = time;
        drawMap(animationTime);
        animationFrame = window.requestAnimationFrame(animateMap);
    }

    function setMapActive(isActive) {
        if (mapIsActive === isActive) return;
        mapIsActive = isActive;
        canvas.classList.toggle('is-active', isActive);
        scanHud?.classList.toggle('is-active', isActive);

        if (!isActive) {
            window.cancelAnimationFrame(animationFrame);
            animationFrame = 0;
            previousFrameTime = null;
            context.clearRect(0, 0, width, height);
            return;
        }

        drawMap(animationTime);
        if (!reducedMotion) animationFrame = window.requestAnimationFrame(animateMap);
    }

    resizeCanvas();
    if (hero && 'IntersectionObserver' in window) {
        const heroObserver = new IntersectionObserver(([entry]) => {
            setMapActive(entry.isIntersecting && entry.intersectionRatio >= .5);
        }, { threshold: [0, .5] });
        heroObserver.observe(hero);
    } else {
        setMapActive(true);
    }
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
        .then((response) => {
            if (!response.ok) throw new Error('World map data unavailable');
            return response.json();
        })
        .then((world) => {
            if (!window.topojson?.feature) throw new Error('Map converter unavailable');
            countryFeatures = window.topojson.feature(world, world.objects.countries).features;
            if (mapIsActive) drawMap(animationTime);
        })
        .catch(() => {
            // The lightweight built-in silhouettes remain as an offline fallback.
            if (mapIsActive) drawMap(animationTime);
        });
    window.addEventListener('resize', () => {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        previousFrameTime = null;
        resizeCanvas();
        if (mapIsActive) {
            drawMap(animationTime);
            if (!reducedMotion) animationFrame = window.requestAnimationFrame(animateMap);
        }
    }, { passive: true });
}

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');

menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    navigation?.classList.toggle('is-open', !isOpen);
});

navigation?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
        menuToggle?.setAttribute('aria-expanded', 'false');
        menuToggle?.setAttribute('aria-label', 'Open navigation');
        navigation.classList.remove('is-open');
    });
});

const yearLabel = document.querySelector('#year');
if (yearLabel) yearLabel.textContent = new Date().getFullYear();


// Periodic visual interference: noticeable but brief, and never blocks interaction.
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  const triggerGlitch = () => {
    if (document.hidden || document.body.classList.contains('boot-locked')) return;
    document.body.classList.add('glitch-hit');
    window.setTimeout(() => document.body.classList.remove('glitch-hit'), 520);
  };
  // First hit shortly after the page settles, then occasional signal corruption.
  window.setTimeout(triggerGlitch, 1800);
  window.setInterval(() => { if (Math.random() < 0.72) triggerGlitch(); }, 5200);
})();

// Three-stage browser CTF. All answers are client-side, intentionally educational—not secure scoring.
(() => {
  const stages = [...document.querySelectorAll('.stage-card')];
  if (!stages.length) return;
  const answers = ['FLAG{SOURCE_OF_THE_SIGNAL}', 'INSPECT', 'LEAST PRIVILEGE'];
  const progress = document.querySelector('#challenge-progress-bar');
  const progressLabel = document.querySelector('#challenge-progress-label');
  const completePanel = document.querySelector('#challenge-complete');
  let completed = 0;
  stages.forEach((stage, index) => {
    const form = stage.querySelector('form');
    const input = form?.querySelector('input');
    const button = form?.querySelector('button');
    const feedback = stage.querySelector('.flag-feedback');
    if (!form || !input || !button || !feedback) return;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (index > completed) return;
      const value = input.value.trim().toUpperCase().replace(/\s+/g, ' ');
      const expected = answers[index].toUpperCase();
      if (value === expected) {
        feedback.textContent = index === 2 ? 'CORRECT — all stages complete.' : 'MATCH — next stage unlocked.';
        feedback.className = 'flag-feedback success';
        stage.classList.add('is-complete');
        input.disabled = true; button.disabled = true;
        completed = Math.max(completed, index + 1);
        const next = stages[index + 1];
        if (next) {
          next.classList.remove('is-locked');
          const nextInput = next.querySelector('input');
          const nextButton = next.querySelector('button');
          if (nextInput) nextInput.disabled = false;
          if (nextButton) nextButton.disabled = false;
          next.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
        }
        if (progress) progress.style.width = `${completed / stages.length * 100}%`;
        if (progressLabel) progressLabel.textContent = `${completed} / ${stages.length} STAGES COMPLETE`;
        if (completed === stages.length && completePanel) completePanel.hidden = false;
      } else {
        feedback.textContent = index === 0 ? 'NO MATCH — inspect the source and try again.' : 'NO MATCH — check the clue and try again.';
        feedback.className = 'flag-feedback error';
      }
    });
  });
})();


// Custom cursor: an angular reticle. It stays visible through clicks and above the boot intro.
(() => {
  if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  const cursor = document.createElement('div');
  cursor.className = 'signal-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<span class="signal-cursor-core"></span><span class="signal-cursor-label">TARGET</span>';
  document.body.appendChild(cursor);
  const label = cursor.querySelector('.signal-cursor-label');
  const updatePosition = (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    cursor.classList.add('is-visible');
  };
  window.addEventListener('pointermove', updatePosition, { passive: true });
  window.addEventListener('pointerdown', updatePosition, { passive: true });
  document.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
  document.addEventListener('mouseenter', () => cursor.classList.add('is-visible'));
  document.querySelectorAll('a, button, input, textarea, summary, [role="button"]').forEach((item) => {
    item.addEventListener('pointerenter', () => { cursor.classList.add('is-hovering'); label.textContent = 'INTERACT'; });
    item.addEventListener('pointerleave', () => { cursor.classList.remove('is-hovering'); label.textContent = 'TARGET'; });
  });
})();

// Homepage opening sequence: one time per browser tab session; Enter skips the wait.
(() => {
  const intro = document.querySelector('#boot-intro');
  if (!intro) return;
  const button = document.querySelector('#boot-enter');
  const bar = document.querySelector('#boot-progress-bar');
  const status = document.querySelector('#boot-status');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let finished = false;
  let started = performance.now();
  const duration = reduced ? 250 : 3300;
  const seen = (() => { try { return sessionStorage.getItem('izzyIntroSeen') === '1'; } catch (_) { return false; } })();
  if (seen) { intro.remove(); return; }
  document.body.classList.add('boot-locked');
  function leave() {
    if (finished) return; finished = true;
    try { sessionStorage.setItem('izzyIntroSeen', '1'); } catch (_) {}
    intro.classList.add('is-leaving');
    document.body.classList.remove('boot-locked');
    window.setTimeout(() => intro.remove(), reduced ? 0 : 700);
  }
  button?.addEventListener('click', leave);
  document.addEventListener('keydown', (event) => { if (event.key === 'Enter' && !finished) leave(); });
  intro.classList.add('is-loading');
  function tick(now) {
    if (finished) return;
    const ratio = Math.min(1, (now - started) / duration);
    const percent = Math.round(ratio * 100);
    if (bar) bar.style.width = `${percent}%`;
    if (status) status.innerHTML = `BYPASSING THE BORING PARTS <span>${percent}%</span>`;
    if (ratio >= 1) leave(); else window.requestAnimationFrame(tick);
  }
  window.requestAnimationFrame(tick);
})();
