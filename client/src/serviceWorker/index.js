importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

if(workbox){
    workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
}

self.addEventListener('push', event => {
    const data = event.data.json()

    const title = data.title || "Jellyphone"
    const options = {
        body: data.body || "New message",
        icon: '/favicon.ico',
        data: {
            url: data.open_url
        }
    }

    event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', event => {
    event.notification.close()
    const urlToOpen = event.notification.data.url
    if(urlToOpen){
        event.waitUntil(clients.openWindow(urlToOpen))
    }
})
