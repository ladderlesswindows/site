export type QualifyingWindowSlide = {
  src: string;
  alt: string;
  caption: string;
  qualifies: boolean;
};

export const QUALIFYING_WINDOW_SLIDES: QualifyingWindowSlide[] = [
  {
    src: '/images/windows/qualify-01.jpg',
    alt: 'Multi-pane first-story windows on siding and brick',
    caption: 'Standard 1st story — qualifies',
    qualifies: true,
  },
  {
    src: '/images/windows/qualify-02.jpg',
    alt: 'Classic white-framed residential windows',
    caption: 'Standard residential — qualifies',
    qualifies: true,
  },
  {
    src: '/images/windows/qualify-03.jpg',
    alt: 'Upper dormer windows with ladderless access',
    caption: 'Accessible upper story — qualifies',
    qualifies: true,
  },
  {
    src: '/images/windows/qualify-04.jpg',
    alt: 'Standard exterior residential window',
    caption: 'Direct ground access — qualifies',
    qualifies: true,
  },
  {
    src: '/images/windows/qualify-05.jpg',
    alt: 'Modern suburban exterior window',
    caption: 'Standard size — qualifies',
    qualifies: true,
  },
  {
    src: '/images/windows/not-qualify-01.jpg',
    alt: 'Tall multi-story windows beyond ladderless reach',
    caption: 'Too tall — may not qualify',
    qualifies: false,
  },
];