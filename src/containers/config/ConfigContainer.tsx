import { createSignal } from "solid-js";
import { useSearchParams } from "@solidjs/router";

// Note: This is circular dependencies. Don't do this for real project! Separate your context
import { useSlideshowContext } from '../home/HomeContainer';
import ClassNames from '../../utils/ClassNames/ClassNames';

import styles from './ConfigContainer.module.css';


function ConfigContainer() {
  const [_, setSearchParams] = useSearchParams();
  const { images, setImages } = useSlideshowContext();
  const [configActive, setConfigActive] = createSignal<boolean>(false);
  const [inputDesc, setInputDesc] = createSignal<string>(images.length > 0 ? `${images.length} file(s) selected` :'');

  function handleSelectFolderOnClick() {
    return () => {
      setImages([]);
      setInputDesc('');

      const fileSelector = document.getElementById('fileSelector') as HTMLInputElement;
      fileSelector!.value = '';
      fileSelector!.click();
    };
  }

  function handleFileSelectorOnChange() {
    return (event: Event) => {
      const updatedImages: Array<string> = [];
      const _imageExtensions = [".jpg", ".jpeg", ".bmp", ".gif", ".png"];  

      const files = (event.target as HTMLInputElement).files;

      for (let i=0; i < (files?.length || 0); i++) {
        const allowedFileExtension = _imageExtensions.filter((extention: string) => files![i].name.toLowerCase().indexOf(extention) !== -1);
        if (allowedFileExtension.length > 0) {
          updatedImages.push(URL.createObjectURL(files![i]));
        }
      }

      setImages(updatedImages);
      setInputDesc(updatedImages.length + ' file(s) selected');
    }
  }

  function handleConfigAccordionOnClick() {
    return () => {
      setConfigActive((configActive) => !configActive);
    };
  }

  function startSlideshowOnClick() {
    return () => {
      if (images().length === 0) {
        alert('Please select folder for the slideshow');
      } else {
        setSearchParams({type: 'IMAGE'});
      }
    }
  }
  

  return (
    <div class={ styles.contentWrapper }>
      <div class={ styles.content }>
        <div class={ClassNames("ui huge header", styles.header)}>
          Simple Image Slideshow
        </div>

        <div class={ClassNames("ui action input", styles.fileInputWrapper)}>
          <input style={{cursor: 'pointer'}} type="text" placeholder="Folder" readOnly value={inputDesc()} onClick={handleSelectFolderOnClick()} />
          <button class="ui button" onClick={handleSelectFolderOnClick()}>Select Folder</button>
          {/* @ts-ignore */}
          <input id="fileSelector" type="file"  webkitDirectory directory multiple={false} style={{display: 'none'}} onChange={handleFileSelectorOnChange()} />
        </div>

        <div class={ClassNames(styles.settingAccordion)}>
          <div class="ui inverted accordion fluid">
            <div class={ClassNames("title", styles.settingTitle, configActive() ? 'active' : '')} onClick={handleConfigAccordionOnClick()}>
              <i class={ClassNames("dropdown icon", styles.settingIcon)}></i>
              Config
            </div>
            <div class={ClassNames("content", configActive() ? 'active' : '')}>
              <div class={ClassNames("ui card fluid", styles.settingContent)}>
                <div class="content">
                  
                </div>
              </div>
            </div>
          </div>
        </div>

        <button class="ui inverted button" onClick={ startSlideshowOnClick() }>Start Slideshow</button>
      </div>
    </div>
  );
}

export default ConfigContainer;