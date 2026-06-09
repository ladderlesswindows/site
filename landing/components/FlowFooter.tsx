import { BackHomeLink } from './BackHomeLink';

export function FlowFooter() {
  return (
    <footer className="pb-8">
      <p className="mt-8 text-center text-xs uppercase tracking-[2.5px] text-neutral-400 font-medium">
        Fully Insured • Vetted Technicians • Satisfaction Guaranteed
      </p>
      <BackHomeLink className="block mt-3 text-center text-sm text-neutral-500 hover:text-neutral-700 py-1" />
    </footer>
  );
}