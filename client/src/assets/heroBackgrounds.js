import reluminateThresh from './images/backgrounds/reluminate_thresh.jpg';
import bootcampDragon from './images/backgrounds/bootcamp_dragon.png';
import epicCat from './images/backgrounds/epic_cat.jpg';
import happyTeam from './images/backgrounds/happy_team.jpg';
import summonersRift from './images/backgrounds/summoners_rift.jpg';
import teemoSunset from './images/backgrounds/teemo_sunset.png';
import viBackground from './images/backgrounds/vi_background.gif';

const HERO_BACKGROUNDS = {
  reluminate_thresh: { src: reluminateThresh, label: 'Thresh' },
  bootcamp_dragon: { src: bootcampDragon, label: 'Bootcamp Dragon' },
  epic_cat: { src: epicCat, label: 'Epic Cat' },
  happy_team: { src: happyTeam, label: 'Happy Team' },
  summoners_rift: { src: summonersRift, label: "Summoner's Rift" },
  teemo_sunset: { src: teemoSunset, label: 'Teemo Sunset' },
  vi_background: { src: viBackground, label: 'Vi' },
};

export default HERO_BACKGROUNDS;

export function resolveHeroBackground(key) {
  return HERO_BACKGROUNDS[key]?.src || '';
}
