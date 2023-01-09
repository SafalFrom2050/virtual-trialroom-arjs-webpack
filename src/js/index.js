import '../styles/index.scss';

// (Initializing GLTFLoader) TODO: initialize GLTFLoader in another way
import * as GLTFLoader from "./plugins/three/GLTFLoader";

// Import for ARJS image-based version
import initarNFT from './plugins/arNFTInit';
// Import for ARJS marker-based version
import initArMarker from './plugins/arMarkerInit';
import {APP_CONFIGS} from "../appConfigs";


// Launch the ARJS simulation mode if ?mode=simulation in URL
const queryString = window.location.search;
let params = new URLSearchParams(queryString);

// ARJS image-based version if ?type=nft
if (params.get("type") === "nft") {
  initarNFT(params.get("mode"));
} else {
  // ARJS marker-based version
  initArMarker(params.get("mode"));
}

const markerImage = document.getElementById("markerImage")
markerImage.src = APP_CONFIGS.markerImage


console.log(
  `%c Virtual Trial Room using AR.JS`,
  `background: linear-gradient( -70deg, rgba(9,9,121,0.6) 11.2%, rgba(144,6,161,0.6) 53.7%, rgba(0,212,255,0.6) 100.2% );`
);
