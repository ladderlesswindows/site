import Link from 'next/link';

type BackHomeLinkProps = {
  className?: string;
  label?: string;
};

export function BackHomeLink({
  className = 'block w-full text-sm text-neutral-500 hover:text-neutral-700 py-2 text-center',
  label = '← Back to Home',
}: BackHomeLinkProps) {
  return (
    <Link href="/" className={className}>
      {label}
    </Link>
  );
}