
export interface MiniChartDataAccessors<T> {
  [seriesKey: string]: (d: T) => number | Date;
}
