import { ApexOptions } from "apexcharts";
import { CountMetricDto } from "../../../../openapi";
import { findChartHeight, translateData, translateOptions } from "../SimpleMetricChart";

describe('Test for Simple Metric Chart', () => {
    describe('translate data', () => {
        it('should translate data', () => {
            const dataToTranslate: CountMetricDto[] | undefined = [{
                id: '123345',
                path: 'path',
                sum: 1
            }, {
                id: '423423',
                path: 'path2',
                sum: 2
            }];

            const expected = [{name: 'Requests', data: [1, 2]}];

            const result = translateData(dataToTranslate);

            expect(result).toEqual(expected);
        });

        it('should handle nulls in the value set', () => {
            const dataToTranslate: CountMetricDto[] | undefined = [{
                id: undefined,
                path: undefined,
                sum: undefined
            }, {
                id: '423423',
                path: 'path2',
                sum: 2
            }];

            const expected = [{name: 'Requests', data: [0, 2]}];

            const result = translateData(dataToTranslate);

            expect(result).toEqual(expected);
        })

        it('should return blank array for null data set', () => {
            const dataToTranslate: CountMetricDto[] | undefined = undefined;

            const expected = [{name: 'Requests', data: []}];

            const result = translateData(dataToTranslate);

            expect(result).toEqual(expected);
        })

        it('should return blank array when every value in the data is 0', () => {
            const dataToTranslate: CountMetricDto[] | undefined = [{
                id: undefined,
                path: undefined,
                sum: undefined
            }, {
                id: '423423',
                path: 'path2',
                sum: 0
            }];;

            const expected = [{name: 'Requests', data: []}];

            const result = translateData(dataToTranslate);

            expect(result).toEqual(expected);
        })
    });

    describe('translate options', () => {
        it('should translate and build apex chart options with categories, events, and title based on input (endpoint)', () => {
            const dataToTranslate: CountMetricDto[] | undefined = [{
                id: '13123',
                path: 'path1',
                sum: 2
            }, {
                id: '423423',
                path: 'path2',
                sum: 3
            }];

            const result = translateOptions(dataToTranslate, 'endpoint', () => null);

            expect(result.xaxis?.categories).toEqual(['path1', 'path2']);
            expect(result.chart?.events?.dataPointSelection).toBeDefined();
            expect(result.title?.text).toEqual('Requests By Endpoint in the last 30 days');
        });

        it('should translate and build apex chart options with categories, events, and title based on input (app client)', () => {
            const dataToTranslate: CountMetricDto[] | undefined = [{
                id: '13123',
                path: 'path1',
                sum: 2
            }, {
                id: '423423',
                path: 'path2',
                sum: 3
            }];

            const result = translateOptions(dataToTranslate, 'appclient', () => null);

            expect(result.xaxis?.categories).toEqual(['path1', 'path2']);
            expect(result.chart?.events?.dataPointSelection).toBeDefined();
            expect(result.title?.text).toEqual('Requests By App Client in the last 30 days');
        });

        it('should translate and build apex chart options, and filter out nulls in the data set while doing so', () => {
            const dataToTranslate: CountMetricDto[] | undefined = [{
                id: '13123',
                path: 'path1',
                sum: 2
            }, {
                id: '423423',
                path: undefined,
                sum: 3
            }];

            const result = translateOptions(dataToTranslate, 'endpoint', () => null);

            expect(result.xaxis?.categories).toEqual(['path1']);
            expect(result.chart?.events?.dataPointSelection).toBeDefined();
            expect(result.title?.text).toEqual('Requests By Endpoint in the last 30 days');
        });

        it('should handle null data set when translating options', () => {
            const dataToTranslate: CountMetricDto[] | undefined = undefined;

            const result = translateOptions(dataToTranslate, 'endpoint', () => null);

            expect(result.xaxis?.categories).toEqual([]);
            expect(result.chart?.events?.dataPointSelection).toBeDefined();
            expect(result.title?.text).toEqual('Requests By Endpoint in the last 30 days');
        });

        it('should handle null select function when translating options', () => {
            const dataToTranslate: CountMetricDto[] | undefined = undefined;

            const result = translateOptions(dataToTranslate, 'endpoint', undefined);

            expect(result.xaxis?.categories).toEqual([]);
            expect(result.chart?.events).toBeUndefined();
            expect(result.title?.text).toEqual('Requests By Endpoint in the last 30 days');
        });
    });

    describe('find chart height', () => {
        it('should return default (50%) chart height if no options object is given', () => {
            const options: ApexOptions | undefined = undefined;
            const result = findChartHeight(options as unknown as ApexOptions);
            expect(result).toEqual('50%');
        });

        it('should return default (50%) chart height if options object has no categories', () => {
            const options: ApexOptions | undefined = {};
            const result = findChartHeight(options as unknown as ApexOptions);
            expect(result).toEqual('50%');
        });

        [
            [0, '25%'],
            [1, '30%'],
            [2, '35%'],
            [4, '45%'],
            [6, '55%'],
            [8, '65%'],
            [10, '75%'],
            [12, '85%'],
            [14, '95%'],
            [15, '100%'],
            [16, '100%'],
            [100, '100%'],
        ].forEach(([input, output]) =>
                it(`should return '${output}' for ${input} categories`, () => {
                    const categories = [];
                    for(let i = 0; i < input; i++)
                        categories.push(i)

                    expect(findChartHeight({ xaxis: {categories: categories} })).toEqual(output);
                })
            );
        });
});