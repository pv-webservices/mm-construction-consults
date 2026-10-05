import { services } from './services';
import { projects, allVideos } from './projects';

export const routes = [
  '/', '/about', '/services', '/ndt-services', '/projects', '/videos', '/contact',
  ...services.map((s) => `/services/${s.slug}`),
  ...projects.map((p) => `/projects/${p.slug}`),
  ...allVideos.map((v) => `/videos/${v.id}`),
  '/privacy-policy', '/terms-conditions', '/sitemap',
];
