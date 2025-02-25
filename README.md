# VU Meter

Customizable peak meters, using the web audio API. It can measure peak or true peak based on [ITU-R BS.1770](https://www.itu.int/rec/R-REC-BS.1770)

The project is clone of https://esonderegger.github.io/web-audio-peak-meter adjusted for seamless integration with [Omakase Player](https://github.com/byomakase/omakase-player)

## Prerequisites

VU Meter can be loaded as UMD module inside HTML page:

```html

<script src="https://cdn.jsdelivr.net/npm/@byomakase/vu-meter@latest/dist/vu-meter.umd.min.js"></script>
```

VU Meter can be used as ES module and CJS module as well.

If used with modern Typescript / Javascript frameworks (such as Angular, React or Vue), it is recommended to simply install VU Meter as dependency into `package.json`:

```bash
npm install @byomakase/vu-meter
```

## Usage

VU Meter is using data provided by Omakase Player's peak processor. Peak processor can be created on Main audio track or on Sidecar audio tracks. See [Omakase Player Github repository](https://github.com/byomakase/omakase-player) for more info on how to create and use Omakase Player.

### Main audio

VU Meter DOM node is created by providing number of channels and VU Meter DOM container. Then, attach event source by providing Omakase Player audio peak processor in `attachSource` method. Peak processor is a stream of `AudioPeakProcessorMessageEvent` objects used by VU Meter for peaks visualization.

```html

<div id="vu-meter"></div>
```

```javascript
// create Omakase Player instance
let omp = new omakase.OmakasePlayer();

// load video
omp.loadVideo('https://demo.player.byomakase.org/data/sdr-ts/meridian_sdr.m3u8', 25).subscribe({
  next: (video) => {
    console.log('Video loaded', video);
    
    // number of displayed channels
    let channelsCount = 6;

    // create Omakase Player Main audio peak processor
    let peakProcessor = omp.audio.createMainAudioPeakProcessor();

    // create VU Meter by providing number of channels and VU Meter DOM container. Attach peak processor source to start peak processing
    const vuMeter = new VuMeter(channelsCount, document.getElementById('vu-meter')).attachSource(peakProcessor);
  }
});
```

### Sidecar audio

```html

<div id="vu-meter"></div>
```

```javascript
// create Omakase Player instance
let omp = new omakase.OmakasePlayer();

// load video
omp.loadVideo('https://demo.player.byomakase.org/data/sdr-ts/meridian_sdr.m3u8', 25).subscribe({
  next: (video) => {
    console.log('Video loaded', video);

    // number of displayed channels
    let channelsCount = 6;

    omp.audio.createSidecarAudioTrack({
      src: 'https://demo.player.byomakase.org/data/sdr-ts/sidecar.AAC', // TODO upload this to server
      label: 'Sidecar audio',
      active: true,
    }).subscribe({
      next: (sidecarAudioTrack) => {

    	// create Omakase Player Sidecar audio peak processor
    	let peakProcessor = omp.audio.createSidecarAudioPeakProcessor(sidecarAudioTrack.id);

        // create VU Meter
        const vuMeter = new VuMeter(channelsCount, document.getElementById('vu-meter')).attachSource(peakProcessor);
      }
    })
  }
});
```

### Changing peak processor source

Peak processor stream on single VU Meter instance can be changed on the fly. For example, we can use single VU meter instance to visualize data coming from different peak processors on demand: 

```html

<div id="vu-meter"></div>
```

```javascript
// create VU Meter
const vuMeter = new VuMeter(2, document.getElementById('vu-meter'));

// attach first source
vuMeter.attachSource(omp.audio.createSidecarAudioPeakProcessor(sidecarAudioTrack1.id))

// detach first source and attach second source
vuMeter.attachSource(omp.audio.createSidecarAudioPeakProcessor(sidecarAudioTrack2.id))
```

### Configuration options
VU Meter can be configured and styled by providing `PeakMeterConfig` object during instantiation:

```javascript
export interface PeakMeterConfig {

  /**
   * Peak bars orientation. True - vertical, False - horizontal
   */
  vertical: boolean,

  /**
   * Border size between peak bars
   */
  borderSize: number,

  /**
   * Labels font size
   */
  fontSize: number,

  /**
   * Background color
   */
  backgroundColor: string,

  /**
   * Ticks labels color
   */
  tickColor: string,

  /**
   * Peaks values color
   */
  labelColor: string,

  /**
   * Peak bars gradient colors. Single gradient value is color (name or hex code) or color with gradient location percent. Examples ['red', '#00FF00', '#0000FF 40%', 'blue 100%']
   */
  gradient: Array<string>,

  /**
   * Minimum ticks range in dB (peak values out of range will be cut off)
   */
  dbRangeMin: number,

  /**
   * Maximum ticks range in dB (peak values out of range will be cut off)
   */
  dbRangeMax: number,

  /**
   * Size of ticks in dB. For example if {@link dbTickSize} is 6 tick values will be: 0, -6, -12,...
   */
  dbTickSize: number,

  /**
   * CSS time expression for 'clip-path' transition which controls peak bars up-down movement. Example: '0.1s'
   */
  maskTransition: string,

  /**
   * Ticks scale: default or nordic
   */
  scale: 'default' | 'nordic',

  /**
   * Scale offset
   */
  scaleOffset: number
}
```
