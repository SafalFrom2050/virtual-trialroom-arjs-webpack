
# Virtual Trial Room using AR.JS


## Installation

Clone this repo and yarn install.

```bash
yarn install
```

## Usage

### Development server

```bash
yarn start
```

## Test

### Marker-based
You can view the development server at `localhost:8080` and use the `hiro.png` marker from the `public` folder.

Or access a marker simulation mode from `http://localhost:8080/?mode=simulation`.

## Code Description
Modify the source code inside `src/` folder and the `webpack` will automatically bundle it to `dist/` folder. Please use the above guide to start a local development server.

### Marker-based version

`src\js\plugins\arMarkerInit.js`

### NFT-based version

`src\js\plugins\arNFTInit.js`
