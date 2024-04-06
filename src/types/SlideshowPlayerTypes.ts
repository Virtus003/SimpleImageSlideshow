interface ConfigValue {
  transitionType: 'SLIDE' | 'FADE';
  transitionDuration: number;
  fullscreen: boolean;
  autoplay: boolean;
  autoplayDelay: number;
};

export type { ConfigValue };