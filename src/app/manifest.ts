import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Checklist 5S',
    short_name: 'Checklist',
    description: 'Checklist frota 5s',
    start_url: '/',
    display: 'fullscreen',
    background_color: '#ffffff',
    theme_color: '#2788e4ff',
    icons: [
      {
        src: '/favicon/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}