import { 
  Accessor, 
  createContext, 
  createSignal,
  lazy, 
  Match, 
  Setter, 
  Switch, 
  useContext 
} from "solid-js";

interface ConfigValue {
  transitionType: 'SLIDE' | 'FADE';
  transitionDuration: number;
  fullscreen: boolean;
  autoplay: boolean;
  autoplayDelay: number;
};

type SlideshowContextType = {
  configValue: Accessor<ConfigValue>;
  images: Accessor<Array<string>>;
  pageState: Accessor<'CONFIG' | 'IMAGE'>;
  setConfigValue: Setter<ConfigValue>;
  setImages: Setter<Array<string>>;
  setPageState: Setter<'CONFIG' | 'IMAGE'>;
};

const SlideshowContext = createContext<SlideshowContextType>({} as SlideshowContextType);

const ConfigContainer = lazy(() => import('../config/ConfigContainer'));
const SlideshowPlayerContainer = lazy(() => import('../slideshow-player/SlideshowPlayerContainer'));

function HomeContainer() {
  const [images, setImages] = createSignal<Array<string>>([]);
  const [pageState, setPageState] = createSignal<'CONFIG' | 'IMAGE'>('CONFIG');
  const [configValue, setConfigValue] = createSignal<ConfigValue>({
    fullscreen: false,
    transitionDuration: 500,
    transitionType: 'SLIDE',
    autoplay: false,
    autoplayDelay: 2000,
  });
  
  const slideshowContextValue = {
    configValue,
    images, 
    pageState, 
    setConfigValue,
    setImages, 
    setPageState
  };
  
  return (
    <SlideshowContext.Provider value={slideshowContextValue} >
      <Switch fallback={<ConfigContainer />}>
        <Match when={pageState() === 'CONFIG'}>
          <ConfigContainer />
        </Match>
        <Match when={pageState() === 'IMAGE'}>
          <SlideshowPlayerContainer />
        </Match>
      </Switch>
    </SlideshowContext.Provider>
  );
}

export const useSlideshowContext = () => useContext<SlideshowContextType>(SlideshowContext);

export default HomeContainer;