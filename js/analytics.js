(() => {
  const measurementId = 'G-Z6JEQHKYJF';
  const storageKey = 'myj-analytics-consent';
  const consentLifetime = 180 * 24 * 60 * 60 * 1000;
  const banner = document.getElementById('cookie-banner');
  const settings = document.getElementById('cookie-settings');
  const accept = document.getElementById('cookie-accept');
  const reject = document.getElementById('cookie-reject');
  const close = document.getElementById('cookie-close');
  const status = document.getElementById('cookie-status');
  let consent = null;
  let analyticsLoaded = false;
  let storageFailed = false;

  function reportStorageError(error) {
    storageFailed = true;
    console.error('No se pudo acceder a las preferencias de Analytics.', error);
  }

  function showStatus(message) {
    status.textContent = message + (storageFailed
      ? ' No se pudo guardar o recuperar su elección; puede que se vuelva a solicitar en la próxima visita.'
      : '');
  }

  function removeAnalyticsCookies() {
    const hostname = window.location.hostname;
    const domains = [null, hostname];
    const parts = hostname.split('.');
    while (parts.length > 2) {
      parts.shift();
      domains.push(parts.join('.'));
    }
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.trim().split('=')[0];
      if (name !== '_ga' && !name.startsWith('_ga_') && name !== '_gid' && !name.startsWith('_gat')) {
        return;
      }
      domains.forEach(domain => {
        document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`;
      });
    });
  }

  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    window[`ga-disable-${measurementId}`] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.addEventListener('error', () => {
      console.error('No se pudo cargar Google Analytics.');
      showStatus('Analytics aceptado, pero no se pudo cargar. Puede estar bloqueado por el navegador o la conexión.');
    });
    document.head.appendChild(script);
  }

  function hideBanner() {
    const restoreFocus = banner.contains(document.activeElement);
    banner.hidden = true;
    if (restoreFocus) settings.focus();
  }

  function saveConsent(choice) {
    consent = choice;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ choice, timestamp: Date.now() }));
    } catch (error) {
      reportStorageError(error);
    }
    close.hidden = false;
    if (choice === 'accepted') {
      showStatus('Analytics aceptado. Puede cambiar su elección en Preferencias de cookies.');
      loadAnalytics();
    } else {
      window[`ga-disable-${measurementId}`] = true;
      removeAnalyticsCookies();
      showStatus('Analytics rechazado. No se medirán las visitas con Google Analytics.');
    }
    hideBanner();
    // Recargar elimina también los manejadores y temporizadores de la etiqueta ya cargada.
    if (choice === 'rejected' && analyticsLoaded) window.location.reload();
  }

  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      let record;
      try {
        record = JSON.parse(stored);
      } catch (error) {
        console.warn('Las preferencias guardadas de Analytics no son válidas.', error);
      }
      if (record && (record.choice === 'accepted' || record.choice === 'rejected')
          && Number.isFinite(record.timestamp) && record.timestamp <= Date.now()
          && Date.now() - record.timestamp < consentLifetime) {
        consent = record.choice;
      } else {
        localStorage.removeItem(storageKey);
      }
    }
  } catch (error) {
    reportStorageError(error);
  }

  settings.hidden = false;
  accept.addEventListener('click', () => saveConsent('accepted'));
  reject.addEventListener('click', () => saveConsent('rejected'));
  close.addEventListener('click', hideBanner);
  settings.addEventListener('click', () => {
    banner.hidden = false;
    accept.focus();
  });
  banner.addEventListener('keydown', event => {
    if (event.key === 'Escape' && consent) hideBanner();
  });
  window.addEventListener('storage', event => {
    if (event.storageArea === localStorage && (event.key === storageKey || event.key === null)) {
      window[`ga-disable-${measurementId}`] = true;
      window.location.reload();
    }
  });

  close.hidden = !consent;
  if (consent === 'accepted') {
    showStatus('Analytics aceptado. Puede cambiar su elección en Preferencias de cookies.');
    loadAnalytics();
  } else {
    window[`ga-disable-${measurementId}`] = true;
    removeAnalyticsCookies();
    if (consent === 'rejected') {
      showStatus('Analytics rechazado. No se medirán las visitas con Google Analytics.');
    } else {
      showStatus('Analytics pendiente de su consentimiento.');
      banner.hidden = false;
    }
  }
})();
