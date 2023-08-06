import { 
  Accessor, 
  createContext, 
  createSignal,
  lazy, 
  Match, 
  Setter, 
  Switch, 
  useContext,
} from "solid-js";
import { useSearchParams } from "@solidjs/router";

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
  setConfigValue: Setter<ConfigValue>;
  setImages: Setter<Array<string>>;
};

const SlideshowContext = createContext<SlideshowContextType>({} as SlideshowContextType);

const ConfigContainer = lazy(() => import('../config/ConfigContainer'));
const SlideshowPlayerContainer = lazy(() => import('../slideshow-player/SlideshowPlayerContainer'));

function HomeContainer() {
  const [searchParams] = useSearchParams();
  const [images, setImages] = createSignal<Array<string>>([]);
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
    setConfigValue,
    setImages, 
  };
  
  return (
    <SlideshowContext.Provider value={slideshowContextValue} >
      <Switch fallback={<ConfigContainer />}>
        <Match when={!Boolean(searchParams.type)}>
          <ConfigContainer />
        </Match>
        <Match when={searchParams.type === 'IMAGE'}>
          <SlideshowPlayerContainer />
        </Match>
      </Switch>
    </SlideshowContext.Provider>
  );
}

export const useSlideshowContext = () => useContext<SlideshowContextType>(SlideshowContext);

export default HomeContainer;