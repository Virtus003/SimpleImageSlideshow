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


type SlideshowContextType = {
  images: Accessor<Array<string>>;
  pageState: Accessor<'CONFIG' | 'IMAGE'>;
  setImages: Setter<Array<string>>;
  setPageState: Setter<'CONFIG' | 'IMAGE'>;
};

const SlideshowContext = createContext<SlideshowContextType>({} as SlideshowContextType);

const ConfigContainer = lazy(() => import('../config/ConfigContainer'));
const SlideshowPlayerContainer = lazy(() => import('../slideshow-player/SlideshowPlayerContainer'));

function HomeContainer() {
  const [images, setImages] = createSignal<Array<string>>([]);
  const [pageState, setPageState] = createSignal<'CONFIG' | 'IMAGE'>('CONFIG');
  
  const slideshowContextValue = {
    images, 
    pageState, 
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