import { AxiosResponse } from 'axios';
import LogfileApi from '../logfile-api';
import { LogfileDto } from '../logfile-dto';

jest.mock('axios', () => {
  return {
    create: () => {
      return {
        interceptors: {
          request: { eject: jest.fn(), use: jest.fn() },
          response: { eject: jest.fn(), use: jest.fn() },
        },
        get: jest.fn()
      }
    }
  }
});

describe('Test Logfile API', () => {
  const responseData: Array<LogfileDto> = [
    {
      name: 'spring.log',
      downloadUri: 'http://localhost:8088/api/v1/logfile/spring.log'
    },
    {
      name: 'spring.log.2021-02-17.0.gz',
      downloadUri: 'http://localhost:8088/api/v1/logfile/spring.log.2021-02-17.0.gz'
    },
  ];

  const axiosRes: AxiosResponse = {
    data: responseData,
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  it('getLogfile', async () => {
    const api = new LogfileApi();
    (api.axiosInstance.get as jest.Mock).mockImplementation(() => {
      return axiosRes;
    });

    const apiResponse = await api.getLogfiles();
    expect(apiResponse).toBe(axiosRes);
  });
});
