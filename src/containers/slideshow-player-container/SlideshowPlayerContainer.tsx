import { useSearchParams } from "@solidjs/router";

// Note: This will cause circular dependencies. Don't do this for real project! Separate your context
import { useSlideshowContext } from '../home/HomeContainer';

import styles from './SlideshowPlayerContainer.module.css';
import SlideshowPlayer from '../slideshow-player/SlideshowPlayer';


function SlideshowPlayerContainer() {
  const [ _, setSearchParams ] = useSearchParams();
  const { images, configValue } = useSlideshowContext();

  function handleBackToConfig() {
    return () => setSearchParams({type: null});
  }

  return (
    <div class={styles.playerWrapper}>
      <div class={styles.playerContent}>
        <div class={styles.backIcon} onClick={handleBackToConfig()}>
          <i class="arrow left icon" />
          <span>Back to config</span>
        </div>
        <div>
          <SlideshowPlayer images={images()} configValue={configValue()} />
        </div>
      </div>
    </div>
  );
}

export default SlideshowPlayerContainer;