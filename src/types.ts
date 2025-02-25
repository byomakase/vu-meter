export interface OmpPeakProcessorDataMessage {
  type: 'message';
  message: number[][];
}

export interface OmpPeakProcessorDataPeaks {
  type: 'peaks';
  peaks: number[];
}

export interface AudioPeakProcessorMessageEvent {
  data: OmpPeakProcessorDataMessage | OmpPeakProcessorDataPeaks;
}

export interface Peaks {
  current: number[];
  maxes: number[];
  currentDB: number[];
  maxesDB: number[];
}
