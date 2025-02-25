import {Observable} from 'rxjs';
import {AudioPeakProcessorMessageEvent, Peaks} from '../types';

export interface VuMeterApi {
  /**
   * Attaches peak processor message stream. If method is called multiple times, previous event stream is detached and only last event stream remains active
   *
   * @param eventStreamFactory Peak processor message stream provided as Observable
   */
  attachSource(eventStreamFactory: Observable<Observable<AudioPeakProcessorMessageEvent>>): VuMeterApi;

  /**
   * @returns Peaks
   */
  getPeaks(): Peaks;

  /**
   * Cleans up resources and event handlers
   */
  destroy(): void;
}
