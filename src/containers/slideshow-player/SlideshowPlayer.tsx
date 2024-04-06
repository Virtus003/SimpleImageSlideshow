import { JSXElement, createEffect, createMemo, createSignal, onMount } from 'solid-js';

import { ConfigValue } from '../../types/SlideshowPlayerTypes';
import ClassNames from '../../utils/ClassNames/ClassNames';

import styles from './SlideshowPlayer.module.css';


type SlideshowPlayerProps = {
  images: Array<string>,
  configValue: ConfigValue
};

function SlideshowPlayer(props: SlideshowPlayerProps) {
  const { images, configValue } = props;
  const [ imageTransitionClass, setImageTransitionClass ] = createSignal<Array<undefined | string>>([]);
  const [ imageToProcess, setImageToProcess ] = createSignal<HTMLImageElement | undefined>();
  const [ imagesInProgress, setImagesInProgress ] = createSignal<Array<number>>([]);
  const [ playerState, setPlayerState ] = createSignal<'READY' | 'TRANSITION'>('READY');
  const [ scaledImages, setScaledImages ] = createSignal<Array<string>>([]);
  const [ displayedImages, setDisplayedImages ] = createSignal<Array<JSXElement>>([]);
  const [ isPlayerOnFullscreen, setIsPlayerOnFullscreen ] = createSignal<Boolean>(false);
  const [ activeImageIndex, setActiveImageIndex ] = createSignal<number>(0);
  const [ shouldShowExitButton, setShouldShowExitButton ] = createSignal<Boolean>(false);
  const processIncrement = 10;
  let totalProcessed = 0;
  const leftPosition: Array<string> = [
    '-100%',
    '0%',
    '100%'
  ];

  onMount(() => {
    setDisplayedImages(generatePlayerImages());

    const player = document.getElementById('player');
    player!.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement) {
        setIsPlayerOnFullscreen(true);
      } else {
        setIsPlayerOnFullscreen(false);
      }
    });
  });

  // Create logic to process the thumbnail images in batch to ease the browser load
  createEffect(() => {
    if (imagesInProgress().length === 0 && totalProcessed < images.length) {
      totalProcessed += processIncrement;
      const updatedImagesInProgress = [];
      if (images.length < processIncrement) {
        for (let i = 0; i < images.length; i++) {
          updatedImagesInProgress.push(i);
          _scaleImage(i);
        }
      } else {
        for (let i = totalProcessed - processIncrement; i < (images.length > totalProcessed ? totalProcessed : images.length); i++) {
          updatedImagesInProgress.push(i);
          _scaleImage(i);
        }
      }
      setImagesInProgress(updatedImagesInProgress);
    }
  })

  // Scale the thumbnail images so the render won't be too heavy for big images
  const _calculateScaledImage = createMemo(() => {
    if (Boolean(imageToProcess())) {
      // Calculation to maintain image aspect ration
      let scaledWidth = 0;
      let scaledHeight = 0;
      if (imageToProcess()!.width > imageToProcess()!.height) {
        const widthFactor = Math.floor(imageToProcess()!.width/212);
        scaledWidth = Math.round(imageToProcess()!.width/widthFactor);
        scaledHeight = Math.round(imageToProcess()!.height/imageToProcess()!.width*scaledWidth);
      } else {
        const heightFactor = Math.floor(imageToProcess()!.width/120);
        scaledHeight = Math.round(imageToProcess()!.height/heightFactor);
        scaledWidth = Math.round(imageToProcess()!.width/imageToProcess()!.height*scaledHeight);
      }
  
      // Scale the image using canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      ctx!.canvas.width = scaledWidth;
      ctx!.canvas.height = scaledHeight;
      ctx!.drawImage(imageToProcess()!, 0, 0, scaledWidth, scaledHeight);
      const scaledUrl = canvas.toDataURL();
      
      return scaledUrl;
    }

    return null;
  });

  function _scaleImage(index: number) {
    const image = document.createElement('img');
    image.src = images[index];

    image.onload = () => {
      setImageToProcess(image);
      const scaledUrl = _calculateScaledImage();

      const updatedScaledImages = [...scaledImages()];
      updatedScaledImages[index] = scaledUrl as string;

      setScaledImages(updatedScaledImages);

      const updatedImagesInProgress = [...imagesInProgress()];
      const imageInProgressIndex = updatedImagesInProgress.indexOf(index);

      if (imageInProgressIndex !== -1) {
        updatedImagesInProgress.splice(imageInProgressIndex, 1);
        setImagesInProgress(updatedImagesInProgress);
      }
    }
  }

  function generatePlayerImages(): Array<JSXElement> {
    const tempDisplayImages: Array<JSXElement> = [];

    switch(configValue.transitionType) {
      case 'FADE': {
        break;
      }
      default:
      case 'SLIDE': {
        for (let i = -1; i < 2; i++) {
          let imageIndex = activeImageIndex() + i;
          if (imageIndex < 0) imageIndex = images.length - 1;
          if (imageIndex === images.length) imageIndex = 0;
          tempDisplayImages.push(
            <div 
              class={`${styles.image} ${imageTransitionClass()?.[i + 1] || '' }`} 
              style={{ 
                'background-image': `url('${images[imageIndex]}')`,
                'transition': `left ${configValue.transitionDuration}ms`,
                'left': leftPosition[i + 1],
              }} 
            />
          );
        }    

        break;
      }
    }

    return tempDisplayImages;
  }

  function resetPlayerState() {
    setImageTransitionClass([]);
    setDisplayedImages(generatePlayerImages());
    setPlayerState('READY');
  }

  function handleThumbnailOnClick(index: number) {
    return () => {
      if (playerState() === 'READY' && index !== activeImageIndex()) {
        setPlayerState('TRANSITION');

        const updatedDisplayedImages = [...displayedImages()];
        const updatedImageTransitionClass: Array<string> = [];

        if (index > activeImageIndex()) {
          updatedDisplayedImages[2] = (
            <div 
              class={`${styles.image} ${imageTransitionClass()?.[2] || '' }`} 
              style={{ 
                'background-image': `url('${images[index]}')`,
                'transition': `left ${configValue.transitionDuration}ms`,
                'left': leftPosition[2],
              }} 
            />
          );

          updatedImageTransitionClass[1] = styles.imageLeft;
          updatedImageTransitionClass[2] = styles.imageCenter;
        }

        if (index < activeImageIndex()) {
          updatedDisplayedImages[0] = (
            <div 
              class={`${styles.image} ${imageTransitionClass()?.[0] || '' }`} 
              style={{ 
                'background-image': `url('${images[index]}')`,
                'transition': `left ${configValue.transitionDuration}ms`,
                'left': leftPosition[0],
              }} 
            />
          );

          updatedImageTransitionClass[0] = styles.imageCenter;
          updatedImageTransitionClass[1] = styles.imageRight;
        }

        setDisplayedImages(updatedDisplayedImages);
        setActiveImageIndex(index);

        // Hack to wait signal for displayed image
        setTimeout(() => {
          setImageTransitionClass(updatedImageTransitionClass);
  
          setTimeout(() => {
            resetPlayerState();
          }, configValue.transitionDuration);
        }, 0)
      }
    }
  }

  function handlePlayerNextOnClick() {
    return () => {
      if (playerState() === 'READY') {
        setPlayerState('TRANSITION');

        const updatedImageTransitionClass: Array<string> = [];
        updatedImageTransitionClass[1] = styles.imageLeft;
        updatedImageTransitionClass[2] = styles.imageCenter;

        setImageTransitionClass(updatedImageTransitionClass);

        if (activeImageIndex() === images.length - 1) {
          setActiveImageIndex(0);
        } else {
          setActiveImageIndex(activeImageIndex() + 1);
        }

        setTimeout(() => {
          resetPlayerState();
        }, configValue.transitionDuration);
      }
    }
  }

  function handlePlayerPrevOnClick() {
    return () => {
      if (playerState() === 'READY') {
        setPlayerState('TRANSITION');

        const updatedImageTransitionClass: Array<string> = [];
        updatedImageTransitionClass[0] = styles.imageCenter;
        updatedImageTransitionClass[1] = styles.imageRight;

        setImageTransitionClass(updatedImageTransitionClass);

        if (activeImageIndex() === 0) {
          setActiveImageIndex(images.length - 1);
        } else {
          setActiveImageIndex(activeImageIndex() - 1);
        }

        setTimeout(() => {
          resetPlayerState();
        }, configValue.transitionDuration);
      }
    }
  }

  function handleFullscreenIconOnClick() {
    return () => {
      const element = document.getElementById('player');
      element!.requestFullscreen();
    }
  }

  function handleExitFullscreenOnClick() {
    return () => {
      document.exitFullscreen()
        .catch(() => {
          // Do nothing
        });
    }
  }

  return (
    <div>
      <div class={styles.player} id={'player'}>
        { displayedImages() }
        <div class={styles.playerPrev} onclick={handlePlayerPrevOnClick()} />
        <div style={{ flex: 1 }} />
        <div class={styles.playerNext} onclick={handlePlayerNextOnClick()} />
        { !isPlayerOnFullscreen() && (
          <div class={styles.fullscreenIcon} onclick={handleFullscreenIconOnClick()}>
            <i class="expand icon" />
          </div>
        )}
        <div class={styles.exitNavigation}>
          <div class={styles.playerPrev} onclick={handlePlayerPrevOnClick()} />
          <div 
            style={{ flex: 1 }}
            onmouseleave={() => setShouldShowExitButton(false)}
            onmouseenter={() => setShouldShowExitButton(true)}
          >
            <div class={ClassNames(styles.exitButton, (isPlayerOnFullscreen() && shouldShowExitButton()) && styles.active)} onclick={handleExitFullscreenOnClick()}>
              <i class="times icon" />
            </div>
          </div>
          <div class={styles.playerNext} onclick={handlePlayerNextOnClick()} />
        </div>
      </div>
      <div class={styles.galleryWrapper}>
        <div class={styles.galleryContent}>
          { images.map((_, index: number) => (
            <div class={ClassNames(styles.galleryThumb, activeImageIndex() === index && styles.galleryThumbActive)} style={{'background-image': `url('${scaledImages()[index]}')`}} onClick={handleThumbnailOnClick(index)}>
              <div class={`ui loader ${!Boolean(scaledImages()[index]) && 'active'}`} />
            </div>
          )) }
        </div>
      </div>
    </div>
  );
}

export default SlideshowPlayer;