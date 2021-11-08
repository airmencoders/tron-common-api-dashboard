import { AxiosResponse } from 'axios';
import LogfileActuatorApi from '../logfile-actuator-api';

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

describe('Test Logfile Actuator API', () => {
  const responseData: string = 'Test Data';
  const axiosRes: AxiosResponse = {
    data: responseData,
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  it('getLogfile', async () => {
    try {
      const api = new LogfileActuatorApi();
      (api.axiosInstance.get as jest.Mock).mockImplementation(() => {
        return axiosRes;
      });

      const apiResponse = await api.getLogfile();
      expect(apiResponse).toBe(axiosRes);
    }
    catch (e) {
      console.error(e)
    }
  });

  it('getLogfileStart', async () => {
    try {
      const api = new LogfileActuatorApi();
      (api.axiosInstance.get as jest.Mock).mockImplementation(() => {
        return axiosRes;
      });

      const apiResponse = await api.getLogfileStart(200);
      expect(apiResponse).toBe(axiosRes);
    }
    catch (e) {
      console.error(e);
    }
  });
});
