export interface ChartSeries {
  name?: string;
  data: Array<number | {x: number, y: number} | undefined>;
}
