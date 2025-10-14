const ORIGIN_WHITELIST = [
    'https://raw.githubusercontent.com',
    'https://leetcode.com',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.searchParams.has('jsonp') && ORIGIN_WHITELIST.indexOf(url.origin) >= 0) {
    const callback = url.searchParams.get('jsonp');
    event.respondWith(
      fetch(url)
        .then(response => response.text())
        .then(data => {
          const jsonpResponse = `${callback}(${data})`;
          return new Response(jsonpResponse, {
            status: 200,
            headers: {
              'Content-Type': 'application/javascript',
            }
          });
        })
        .catch(error => {
          console.error('Failed to fetch GitHub data:', error);
          return new Response(`${callback}({error: "Failed to fetch data"})`, {
            status: 500,
            headers: { 'Content-Type': 'application/javascript' }
          });
        })
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
