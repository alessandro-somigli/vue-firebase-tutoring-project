const manifest = {
    name: 'ITIS Meucci School Tutoring',
    short_name: 'school tutoring',
    description: 'ITIS Meucci school tutoring website for students to organize and apply to courses',
    theme_color: '#FFFFFF',
    background_color: '#FFFFFF',
    display: 'standalone',
    icons: [
        {
            src: '/icons/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
        }, {
            src: '/icons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
        }, {
            src: '/icons/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
        }
    ]
}

export default { 
    includeAssets: ['/pine-cone-vector.svg'],
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    workbox: {
        globPatterns: ['**/*.{js,css,html,json,vue,txt,ico,png,svg}'],
        cleanupOutdatedCaches: false
    },
    manifest: manifest
}