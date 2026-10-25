const appCache = window.applicationCache;
const INTERVAL = 500;   // проверять каждые 0.5 сек
const TIMEOUT  = 15000; // сдаться через 15 сек

function waitServer(interval, timeout) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      fetch(location.href, { method: 'HEAD', cache: 'no-store' })
        .then(r => {
          if (r.ok) return resolve();          // сервер ответил — готов
          throw new Error('not ready');
        })
        .catch(() => {
          if (Date.now() - start > timeout) return reject(new Error('timeout'));
          setTimeout(tick, interval);          // ещё не готов — пробуем снова
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

// Проверяем, отвечает ли основной сервер (тот, что отдал index.html)
fetch(location.href, { method: 'HEAD', cache: 'no-store' })
  .then(() => {
    // Сервер отвечает — страница загружена из сети, ничего не делаем
    //document.getElementById('status').textContent = 'Онлайн ✅';
  })
  .catch(() => {
    // Сервер не отвечает — страница из AppCache, делаем fetch к локальному серверу
    //document.getElementById('status').textContent = 'Офлайн, запрашиваю payload...';
    return fetch('http://127.0.0.1:9021/data/wfm/web-file-mgr-ru.elf')
      .then(() => waitServer(INTERVAL, TIMEOUT))
      .then(() => location.reload())
      .catch(err => console.error('Сервер не поднялся:', err));  
  }
);

