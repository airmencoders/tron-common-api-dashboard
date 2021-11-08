import { AxiosResponse } from "axios";
import HealthApi from "../health-api";

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

describe('Test Health Api', () => {
  const response = { "status": "UP", "components": { "db": { "status": "UP", "details": { "database": "H2", "validationQuery": "isValid()" } }, "diskSpace": { "status": "UP", "details": { "total": 119501303808, "free": 6275170304, "threshold": 10485760, "exists": true } }, "ping": { "status": "UP" } } };

  const axiosRes: AxiosResponse = {
    data: response,
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  it('getHealth', async () => {
    const api = new HealthApi();

    (api.axiosInstance.get as jest.Mock).mockImplementation(() => {
      return axiosRes;
    });

    const apiResponse = await api.getHealth();
    expect(apiResponse).toBe(axiosRes);
  });
});
