const appCache = window.applicationCache;
const INTERVAL = 500;
const TIMEOUT  = 15000; 

function waitForElfStart(interval, timeout) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      fetch(location.href, { method: 'HEAD', cache: 'no-store' })
        .then(r => {
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

if (appCache) {
  appCache.addEventListener('updateready', () => {
    appCache.swapCache();
    location.reload();
  });
}

fetch(location.href, { method: 'HEAD', cache: 'no-store' })
  .then(() => {
  })
  .catch(() => {
    return fetch('http://127.0.0.1:9021/data/wfm/web-file-mgr.elf')
      .then(() => waitForElfStart(INTERVAL, TIMEOUT))
      .then(() => location.reload())
      .catch(err => console.error('Сервер не поднялся:', err));  
  }
);

