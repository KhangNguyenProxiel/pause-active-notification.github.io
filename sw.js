self.addEventListener("notificationclick", function (event) {
    let url = "https://example.com/some-path/";
    event.notification.close(); // Android needs explicit close.
    event.waitUntil(
        clients.matchAll({ type: "window" }).then((windowClients) => {
            // Check if there is already a window/tab open with the target URL
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                // If so, just focus it.
                if (client.url === url && "focus" in client) {
                    return client.focus();
                }
            }
            // If not, then open the target URL in a new window/tab.
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

// Cached core static resources 
self.addEventListener("install",e=>{
    e.waitUntil(
      caches.open("static").then(cache=>{
        return cache.addAll(["./",'./muc-192x75.png']);
      })
    );
  });
  

/** An empty service worker! */
self.addEventListener("fetch", function (event) {
    /** An empty fetch handler! */
    event.respondWith(
        caches.match(event.request).then(response=>{
          return response||fetch(event.request);
        })
      );
});
