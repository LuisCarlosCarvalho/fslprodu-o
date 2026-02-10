import { useEffect } from 'react';

type SEOProps = {
  title: string;
  description?: string;
};

export function SEO({ title, description }: SEOProps) {
  useEffect(() => {
    // Update Document Title
    const prevTitle = document.title;
    document.title = `${title} | FSL Solution`;

    // Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    const prevDescription = metaDescription?.getAttribute('content');

    if (description) {
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }

    // Cleanup (optional, but good for SPAs)
    return () => {
      document.title = prevTitle;
      if (prevDescription) {
        metaDescription?.setAttribute('content', prevDescription);
      }
    };
  }, [title, description]);

  return null;
}
