import { Link as RouterLink } from 'react-router-dom';

type LinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent) => void;
};

export function Link({ href, children, className = '', target, rel, onClick }: LinkProps) {
  const isExternal = href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:');

  if (isExternal) {
    return (
      <a href={href} className={className} target={target} rel={rel} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <RouterLink to={href} className={className} target={target} rel={rel} onClick={onClick}>
      {children}
    </RouterLink>
  );
}
