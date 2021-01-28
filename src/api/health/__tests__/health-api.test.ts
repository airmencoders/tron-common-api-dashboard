import axios, { AxiosResponse } from "axios";
import HealthApi from "../health-api";
import Health from "../interface/health";

jest.mock('axios');

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
        (axios.create as jest.Mock).mockImplementation(() => axios);

        (axios.get as jest.Mock).mockImplementation(() => {
            return axiosRes;
        });

        const apiResponse = await new HealthApi().getHealth();
        expect(apiResponse).toBe(axiosRes);
    });
});
