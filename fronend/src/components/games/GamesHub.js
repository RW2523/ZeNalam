import { Link } from 'react-router-dom';
import PageLayout from '../PageLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWater,
  faCircle,
  faPalette,
  faStar,
  faLeaf,
  faWind,
} from '@fortawesome/free-solid-svg-icons';
import './games.css';

const GAMES = [
  {
    to: '/games/ripples',
    title: 'Quiet ripples',
    blurb: 'Tap anywhere. Watch rings expand and fade—no score, no rush.',
    icon: faWater,
  },
  {
    to: '/games/bubbles',
    title: 'Soft bubbles',
    blurb: 'Gentle floats upward. Touch them to let them go.',
    icon: faCircle,
  },
  {
    to: '/games/harmony',
    title: 'Calm palette',
    blurb: 'Slide hues until the screen feels right for you.',
    icon: faPalette,
  },
  {
    to: '/games/stars',
    title: 'Drifting lights',
    blurb: 'Catch slow stars if you like. Or simply watch them pass.',
    icon: faStar,
  },
  {
    to: '/games/bloom',
    title: 'Bloom garden',
    blurb: 'Plant glowing blooms on canvas. Optional pentatonic chimes with each tap.',
    icon: faLeaf,
  },
  {
    to: '/games/flow',
    title: 'Flow river',
    blurb: 'Draw rivers of gold light; optional music breathes with your movement.',
    icon: faWind,
  },
];

export default function GamesHub() {
  return (
    <PageLayout
      title="Peaceful games"
      subtitle="Short, low-stress moments—no timers, no losing. Bloom garden and Flow river add optional calm music."
      wide
    >
      <div className="games-hub-grid">
        {GAMES.map((g) => (
          <Link key={g.to} to={g.to} className="games-hub-card">
            <span className="games-hub-card__icon" aria-hidden="true">
              <FontAwesomeIcon icon={g.icon} />
            </span>
            <h2 className="games-hub-card__title">{g.title}</h2>
            <p className="games-hub-card__blurb">{g.blurb}</p>
            <span className="games-hub-card__cta">Open</span>
          </Link>
        ))}
      </div>
    </PageLayout>
  );
}
