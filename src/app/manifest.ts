import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KGDX Study Group',
    short_name: 'KGDX',
    description: 'KGDXStudy Group 動画研修プラットフォーム',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d1117',
    theme_color: '#0d1117',
    icons: [
      {
        src: '/kgdx-logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/kgdx-logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
