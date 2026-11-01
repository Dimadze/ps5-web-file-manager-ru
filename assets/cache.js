const appCache = window.applicationCache;
const INTERVAL = 500;   // poll every 0.5 s
const TIMEOUT  = 15000; // give up after 15 s

function waitForPayloadStart(interval, timeout) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      fetch(location.href, { method: 'HEAD', cache: 'no-store' })
        .then(r => {
          // server responded: it is ready
          if (r.ok) return resolve();
          throw new Error('not ready');
        })
        .catch(() => {
          if (Date.now() - start > timeout) return reject(new Error('timeout'));
          setTimeout(tick, interval);
        });
    };
    tick();
  });
}

// AppCache: a new version is ready, swap the cache and reload
if (appCache) {
  appCache.addEventListener('updateready', () => {
    appCache.swapCache();
    location.reload();
  });
}

// Check whether index.html is served by the server
fetch(location.href, { method: 'HEAD', cache: 'no-store' })
  .then(() => {
    // The server responds: the page was loaded normally, do nothing
  })
  .catch(() => {
    // The server does not respond: the page came from AppCache, launch the ELF
    return fetch('http://127.0.0.1:9021/data/wfm/web-file-mgr.elf')
      .then(() => waitForPayloadStart(INTERVAL, TIMEOUT))
      .then(() => location.reload())
      //.catch(err => console.error('Server did not start:', err));
  });