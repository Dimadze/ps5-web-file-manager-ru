const appCache = window.applicationCache;
const INTERVAL = 500;   // проверять каждые 0.5 сек
const TIMEOUT  = 15000; // сдаться через 15 сек

function waitForElfStart(interval, timeout) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      fetch(location.href, { method: 'HEAD', cache: 'no-store' })
        .then(r => {
          // сервер ответил — готов
          if (r.ok) return resolve();          
          throw new Error('not ready');
        })
        .catch(() => {
          if (Date.now() - start > timeout) return reject(new Error('timeout'));
          // ещё не готов — пробуем снова
          setTimeout(tick, interval);          
        });
    };
    tick();
  });
}

// AppCache: новая версия — переключаемся и перезагружаемся
if (appCache) {
  appCache.addEventListener('updateready', () => {
    appCache.swapCache();
    location.reload();
  });
}

// Проверяем, отвечает ли страница index.html
fetch(location.href, { method: 'HEAD', cache: 'no-store' })
  .then(() => {
    // Сервер отвечает — страница загружена, ничего не делаем
  })
  .catch(() => {
    // Сервер не отвечает — страница из AppCache, запуск ELF
    return fetch('http://127.0.0.1:9021/data/wfm/web-file-mgr-ru.elf')
      .then(() => waitForElfStart(INTERVAL, TIMEOUT))
      .then(() => location.reload())
      .catch(err => console.error('Сервер не поднялся:', err));  
  }
);

