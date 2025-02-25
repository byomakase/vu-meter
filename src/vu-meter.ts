import {defaultConfig, PeakMeterConfig} from './config';
import {audioClipPath, createBars, createChannelElements, createContainerDiv, createPeakLabels, createTicks} from './markup';
import {dbFromFloat} from './utils';
import {Observable, Subject, takeUntil} from 'rxjs';
import {AudioPeakProcessorMessageEvent, Peaks} from './types';
import {VuMeterApi} from './api';

export class VuMeter implements VuMeterApi {
  channelCount: number;
  config: PeakMeterConfig;

  parent?: HTMLElement;
  ticks?: Array<HTMLElement>;
  channelElements?: Array<HTMLElement>;
  bars?: Array<HTMLElement>;
  peakLabels?: Array<HTMLElement>;
  tempPeaks: Array<number>;
  heldPeaks: Array<number>;
  peakHoldTimeouts: Array<number>;
  animationRequestId?: number;

  private _eventSource$?: Observable<AudioPeakProcessorMessageEvent>;
  private _eventSourceBreaker$ = new Subject<void>();

  private _destroyed$ = new Subject<void>();

  constructor(channelCount: number, ele: HTMLElement, options: Partial<PeakMeterConfig> = {}) {
    this.channelCount = channelCount;
    this.config = Object.assign({...defaultConfig}, options);
    if (this.config.scale === 'nordic') {
      this.config.scaleOffset = 9;
      this.config.dbTickSize = 3;
      this.config.dbRangeMin = -46;
      this.config.dbRangeMax = 3;
    }

    this.tempPeaks = new Array(this.channelCount).fill(0.0);
    this.heldPeaks = new Array(this.channelCount).fill(0.0);
    this.peakHoldTimeouts = new Array(this.channelCount).fill(0);
    if (ele) {
      this.parent = createContainerDiv(ele, this.config);
      this.channelElements = createChannelElements(this.parent, this.config, this.channelCount);
      this.peakLabels = createPeakLabels(this.channelElements, this.config);
      this.bars = createBars(this.channelElements, this.config);
      this.ticks = createTicks(this.parent, this.config);
      this.parent.addEventListener('click', this.clearPeaks.bind(this));
      this.paintMeter();
    }
  }

  attachSource(eventStreamFactory: Observable<Observable<AudioPeakProcessorMessageEvent>>): VuMeterApi {
    this._eventSourceBreaker$.next();
    this._eventSourceBreaker$.complete();
    this._eventSourceBreaker$ = new Subject<void>();

    eventStreamFactory.subscribe({
      next: (eventStream) => {
        this._eventSource$ = eventStream;
        this._eventSource$.pipe(takeUntil(this._eventSourceBreaker$), takeUntil(this._destroyed$)).subscribe({
          next: (message) => {
            this.handlePeakProcessorMessageEvent(message);
          },
        });
      },
    });

    return this;
  }

  private handlePeakProcessorMessageEvent(event: AudioPeakProcessorMessageEvent) {
    if (event.data.type === 'message') {
      console.log(event.data.message);
    }
    if (event.data.type === 'peaks') {
      const {peaks} = event.data;
      for (let i = 0; i < this.tempPeaks.length; i += 1) {
        if (peaks.length > i) {
          this.tempPeaks[i] = peaks[i];
        } else {
          this.tempPeaks[i] = 0.0;
        }
      }
      if (peaks.length < this.channelCount) {
        this.tempPeaks.fill(0.0, peaks.length);
      }
      for (let i = 0; i < peaks.length; i += 1) {
        if (peaks[i] > this.heldPeaks[i]) {
          this.heldPeaks[i] = peaks[i];
          if (this.peakHoldTimeouts[i]) {
            clearTimeout(this.peakHoldTimeouts[i]);
          }
          if (this.config.peakHoldDuration) {
            this.peakHoldTimeouts[i] = window.setTimeout(() => {
              this.clearPeak(i);
            }, this.config.peakHoldDuration);
          }
        }
      }
    }
  }

  private paintMeter() {
    const {dbRangeMin, dbRangeMax, vertical, scaleOffset} = this.config;
    if (this.bars) {
      this.bars.forEach((barDiv, i) => {
        const tempPeak = dbFromFloat(this.tempPeaks[i]);
        const clipPath = audioClipPath(tempPeak, dbRangeMin, dbRangeMax, vertical);
        barDiv.style.clipPath = clipPath;
      });
    }
    if (this.peakLabels) {
      this.peakLabels.forEach((textLabel, i) => {
        if (this.heldPeaks[i] === 0.0) {
          textLabel.textContent = '-∞';
        } else {
          const heldPeak = dbFromFloat(this.heldPeaks[i]) + scaleOffset!;
          textLabel.textContent = heldPeak.toFixed(1);
        }
      });
    }
    this.animationRequestId = window.requestAnimationFrame(this.paintMeter.bind(this));
  }

  private clearPeak(i: number) {
    this.heldPeaks[i] = this.tempPeaks[i];
  }

  private clearPeaks() {
    for (let i = 0; i < this.heldPeaks.length; i += 1) {
      this.clearPeak(i);
    }
  }

  getPeaks(): Peaks {
    return {
      current: this.tempPeaks,
      maxes: this.heldPeaks,
      currentDB: this.tempPeaks.map(dbFromFloat),
      maxesDB: this.heldPeaks.map(dbFromFloat),
    };
  }

  destroy(): void {
    this._eventSourceBreaker$.next();
    this._eventSourceBreaker$.complete();

    this._destroyed$.next();
    this._destroyed$.complete();

    if (this.parent) {
      this.parent.removeEventListener('click', this.clearPeaks.bind(this));
      if (this.animationRequestId !== undefined) {
        window.cancelAnimationFrame(this.animationRequestId);
      }
      this.parent.remove();
    }
  }
}
