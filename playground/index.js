/*
 * Copyright 2024 ByOmakase, LLC (https://byomakase.org)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {VuMeter} from '../src';

window.addEventListener('load', () => {
  let omp = new omakase.OmakasePlayer();

  let createMainAudioVuMeter = () => {
    new VuMeter(6, document.getElementById('vu-meter1')).attachSource(omp.audio.createMainAudioPeakProcessor());
  };

  let createSidecarAudioVuMeter = () => {
    omp.audio.onAudioLoaded$.subscribe((event) => {
      if (event) {
        omp.audio.exportMainAudioTrackToSidecar(omp.audio.getActiveAudioTrack().id).subscribe({
          next: (sidecarAudioTrack) => {
            console.log('Sidecar audio track created (Main audio export)', sidecarAudioTrack)

            new VuMeter(6, document.getElementById('vu-meter2')).attachSource(omp.audio.createSidecarAudioPeakProcessor(sidecarAudioTrack.id));

            // activate sidecar audio track to show sidecar audio track peaks
            omp.audio.activateSidecarAudioTracks([sidecarAudioTrack.id])
          }
        })
      }
    })
  };

  let createMainAudioVuMeterCustomConfig = () => {
    new VuMeter(6, document.getElementById('vu-meter3'), {
      vertical: true,
      borderSize: 30,
      fontSize: 15,
      backgroundColor: 'black',
      tickColor: 'red',
      labelColor: 'blue',
      gradient: ['red', 'green', 'blue'],
      // dbRangeMin: -30,
      // dbRangeMax: -20,
      dbTickSize: 6,
      // maskTransition: '0.01s',
      // scale: 'nordic',
      scaleOffset: 20
    }).attachSource(omp.audio.createMainAudioPeakProcessor());
  };

  omp.loadVideo('https://demo.player.byomakase.org/data/sdr-ts/meridian_sdr.m3u8', 25).subscribe({
    next: (video) => {
      console.log('Video loaded', video);

      createMainAudioVuMeter();

      createSidecarAudioVuMeter();

      createMainAudioVuMeterCustomConfig()
    },
  });

  window['omp'] = omp;
});
