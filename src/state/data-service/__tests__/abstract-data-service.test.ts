import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import axios from 'axios';
import { CancellableDataRequest } from '../../../utils/cancellable-data-request';
import { flushPromises } from '../../../utils/TestUtils/test-utils';
import { AbstractDataService } from '../abstract-data-service';

interface MockDto {
  id: number;
  name: string;
}

class TestDataService extends AbstractDataService<MockDto, MockDto> {
  constructor(public state: State<MockDto[]>) {
    super(state);
  }

  fetchAndStoreData(): CancellableDataRequest<MockDto[]> {
    const cancelTokenSource = axios.CancelToken.source();
    return {
      promise: Promise.resolve([]),
      cancelTokenSource
    };
  }

  sendUpdate(toUpdate: MockDto): Promise<MockDto> {
    return Promise.resolve(toUpdate);
  }

  sendCreate(toCreate: MockDto): Promise<MockDto> {
    return Promise.resolve(toCreate);
  }

  sendDelete(toDelete: MockDto): Promise<void> {
    return Promise.resolve();
  }

  convertRowDataToEditableData(rowData: MockDto): Promise<MockDto> {
    return Promise.resolve(rowData);
  }

  sendPatch = undefined;
  fetchAndStorePaginatedData = undefined;
}

describe('Abstract Data Service Test', () => {
  let mockState: State<MockDto[]> & StateMethodsDestroy;
  let mockService: TestDataService;

  beforeEach(async () => {
    mockState = createState<MockDto[]>(new Array<MockDto>());
    mockService = new TestDataService(mockState);

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  })

  it('Test mergeDataToState no dups', () => {
    const mockDtos = [
      {
        id: 1,
        name: '1'
      },
      {
        id: 2,
        name: '2'
      }
    ] as Array<MockDto>;

    mockState.set(mockDtos);

    expect(mockState.get()).toEqual(mockDtos);

    const newMockDtos = [
      {
        id: 3,
        name: '3'
      }
    ] as Array<MockDto>;

    mockService.mergeDataToState(newMockDtos);

    const mergedDtos = mockDtos.concat(newMockDtos);
    expect(mockState.get()).toEqual(mergedDtos);
  });

  it('Test mergeDataToState dups', () => {
    const mockDtos = [
      {
        id: 1,
        name: '1'
      },
      {
        id: 2,
        name: '2'
      }
    ] as Array<MockDto>;

    mockState.set(mockDtos);

    expect(mockState.get()).toEqual(mockDtos);

    const newMockDtos = [
      {
        id: 3,
        name: '3'
      },
      {
        id: 1,
        name: '1'
      }
    ] as Array<MockDto>;

    mockService.mergeDataToState(newMockDtos, true);

    const mergedDtos = mockDtos.concat({
      id: 3,
      name: '3'
    });
    expect(mockState.get()).toEqual(mergedDtos);
  });

  it('Test resetState', async () => {
    const data = [{ id: 1, name: '1' }];
    mockState.set(data);

    expect(mockState.get()).toEqual(data);

    const promiseState: Promise<MockDto[]> = new Promise(resolve => setTimeout(() => resolve([{ id: 1, name: '1' }]), 1000));
    mockState.set(promiseState);

    expect(mockState.promised);

    jest.runOnlyPendingTimers();
    await flushPromises();

    mockService.resetState();
    expect(mockState.promised).toEqual(false);
    expect(mockState.get()).toEqual([]);
  });
});