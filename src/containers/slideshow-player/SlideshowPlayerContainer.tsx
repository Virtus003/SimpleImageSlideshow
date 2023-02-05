import { createEffect, createSignal, onMount } from 'solid-js';
import ClassNames from '../../utils/ClassNames/ClassNames';

// Note: This is circular dependencies. Don't do this for real project! Separate your context
import { useSlideshowContext } from "../home/HomeContainer";

import styles from './SlideshowPlayerContainer.module.css';


function SlideshowPlayerContainer() {
  const { images } = useSlideshowContext();
  const [ isPlayerOnFullscreen, setIsPlayerOnFullscreen ] = createSignal<Boolean>(false);
  const [ imagesInProgress, setImagesInProgress ] = createSignal<Array<number>>([]);
  const [ scaledImages, setScaledImages ] = createSignal<Array<string>>([]);
  const [ activeImageIndex, setActiveImageIndex ] = createSignal<number>(0);
  const [ activeDisplayIndex, setActiveDisplayIndex ] = createSignal<number>(0);
  const [ shouldShowExitButton, setShouldShowExitButton ] = createSignal<Boolean>(false);
  const processIncrement = 10;
  let totalProcessed = 0;

  onMount(() => {
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
    if (imagesInProgress().length === 0 && totalProcessed < images().length) {
      totalProcessed += processIncrement;
      const updatedImagesInProgress = [];
      if (images().length < processIncrement) {
        for (let i = 0; i < images().length; i++) {
          updatedImagesInProgress.push(i);
          _scaleImage(i);
        }
      } else {
        for (let i = totalProcessed - processIncrement; i < (images().length > totalProcessed ? totalProcessed : images().length); i++) {
          updatedImagesInProgress.push(i);
          _scaleImage(i);
        }
      }
      setImagesInProgress(updatedImagesInProgress);
    }
  })

  // Scale the thumbnail images so the render won't be too heavy for big images
  function _scaleImage(index: number) {
    const image = document.createElement('img');
    image.src = images()[index];

    image.onload = () => {
      // Calculation to maintain image aspect ration
      let scaledWidth = 0;
      let scaledHeight = 0;
      if (image.width > image.height) {
        const widthFactor = Math.floor(image.width/212);
        scaledWidth = Math.round(image.width/widthFactor);
        scaledHeight = Math.round(image.height/image.width*scaledWidth);
      } else {
        const heightFactor = Math.floor(image.width/120);
        scaledHeight = Math.round(image.height/heightFactor);
        scaledWidth = Math.round(image.width/image.height*scaledHeight);
      }

      // Scale the image using canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      ctx!.canvas.width = scaledWidth;
      ctx!.canvas.height = scaledHeight;
      ctx!.drawImage(image, 0, 0, scaledWidth, scaledHeight);
      const scaledUrl = canvas.toDataURL();

      const updatedScaledImages = [...scaledImages()];
      updatedScaledImages[index] = scaledUrl;

      setScaledImages(updatedScaledImages);

      const updatedImagesInProgress = [...imagesInProgress()];
      const imageInProgressIndex = updatedImagesInProgress.indexOf(index);

      if (imageInProgressIndex !== -1) {
        updatedImagesInProgress.splice(imageInProgressIndex, 1);
        setImagesInProgress(updatedImagesInProgress);
      }

    }
  }

  function handleThumbnailOnClick(index: number) {
    return () => {
      setActiveImageIndex(index);
    }
  }

  function handlePlayerNextOnClick() {
    return () => {
      if (activeImageIndex() === images().length - 1) {
        setActiveImageIndex(0);
      } else {
        setActiveImageIndex(activeImageIndex() + 1);
      }
    }
  }

  function handlePlayerPrevOnClick() {
    return () => {
      if (activeImageIndex() === 0) {
        setActiveImageIndex(images().length - 1);
      } else {
        setActiveImageIndex(activeImageIndex() - 1);
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
    <div class={styles.playerWrapper}>
      <div>
        <div class={styles.player} id={'player'}>
          <div class={styles.image} style={{ 'background-image': `url('${images()[activeImageIndex()]}')`}} />
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
      </div>
      <div class={styles.galleryWrapper}>
        <div class={styles.galleryContent}>
          { images().map((_, index: number) => (
            <div class={ClassNames(styles.galleryThumb, activeImageIndex() === index && styles.galleryThumbActive)} style={{'background-image': `url('${scaledImages()[index]}')`}} onClick={handleThumbnailOnClick(index)}>
              <div class={`ui loader ${!Boolean(scaledImages()[index]) && 'active'}`} />
            </div>
          )) }
        </div>
      </div>
    </div>
  );
}

export default SlideshowPlayerContainer;