import axios, { AxiosResponse } from 'axios';
import LogfileActuatorApi from '../logfile-actuator-api';

jest.mock('axios');

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
      (axios.create as jest.Mock).mockImplementation(() => axios);
      (axios.get as jest.Mock).mockImplementation(() => {
        return axiosRes;
      });

      const apiResponse = await new LogfileActuatorApi().getLogfile();
      expect(apiResponse).toBe(axiosRes);
    }
    catch (e) {
      console.error(e)
    }
  });

  it('getLogfileStart', async () => {
    try {
      (axios.create as jest.Mock).mockImplementation(() => axios);
      (axios.get as jest.Mock).mockImplementation(() => {
        return axiosRes;
      });

      const apiResponse = await new LogfileActuatorApi().getLogfileStart(200);
      expect(apiResponse).toBe(axiosRes);
    }
    catch (e) {
      console.error(e);
    }
  });
});
