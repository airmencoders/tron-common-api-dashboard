import axios, { AxiosResponse } from "axios";
import { AppClientsApi } from "../app-clients-api";

jest.mock('axios');

describe('Test App Clients API', () => {
  it('Test Get All Clients', async () => {
    const response = [
      {
        "id": "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
        "name": "Test",
        "nameAsLower": "test",
        "privileges": [
          {
            "id": 1,
            "name": "READ"
          },
          {
            "id": 2,
            "name": "WRITE"
          }
        ]
      }
    ];

    const axiosRes: AxiosResponse = {
      data: response,
      status: 200,
      statusText: 'OK',
      config: {},
      headers: {}
    };

    (axios.create as jest.Mock).mockImplementation(() => axios);

    (axios.get as jest.Mock).mockImplementation(() => {
      return axiosRes;
    });

    const apiResponse = await new AppClientsApi().getAppClients();
    expect(apiResponse).toBe(axiosRes);
  });
});