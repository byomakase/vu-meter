export interface PeakMeterConfig {
  /**
   * Peak bars orientation. True - vertical, False - horizontal
   */
  vertical: boolean;

  /**
   * Border size between peak bars
   */
  borderSize: number;

  /**
   * Labels font size
   */
  fontSize: number;

  /**
   * Background color
   */
  backgroundColor: string;

  /**
   * Ticks labels color
   */
  tickColor: string;

  /**
   * Peaks values color
   */
  labelColor: string;

  /**
   * Peak bars gradient colors. Single gradient value is color (name or hex code) or color with gradient location percent. Examples ['red', '#00FF00', '#0000FF 40%', 'blue 100%']
   */
  gradient: Array<string>;

  /**
   * Minimum ticks range in dB (peak values out of range will be cut off)
   */
  dbRangeMin: number;

  /**
   * Maximum ticks range in dB (peak values out of range will be cut off)
   */
  dbRangeMax: number;

  /**
   * Size of ticks in dB. For example if {@link dbTickSize} is 6 tick values will be: 0, -6, -12,...
   */
  dbTickSize: number;

  /**
   * CSS time expression for 'clip-path' transition which controls peak bars up-down movement. Example: '0.1s'
   */
  maskTransition: string;

  peakHoldDuration: number;

  /**
   * Ticks scale: default or nordic
   */
  scale: 'default' | 'nordic';

  /**
   * Scale offset
   */
  scaleOffset: number;
}

export const defaultConfig: PeakMeterConfig = {
  vertical: false,
  borderSize: 2,
  fontSize: 9,
  backgroundColor: 'black',
  tickColor: '#ddd',
  labelColor: '#ddd',
  gradient: ['red 1%', '#ff0 16%', 'lime 45%', '#080 100%'],
  dbRangeMin: -48,
  dbRangeMax: 0,
  dbTickSize: 6,
  maskTransition: '0.1s',
  peakHoldDuration: 0,
  scale: 'default',
  scaleOffset: 0,
};
