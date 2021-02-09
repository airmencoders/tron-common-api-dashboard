class Config {
    public static get API_BASE_URL(): string {
        return process.env.REACT_APP_API_BASE_URL || '';
    }

    public static get API_PATH_PREFIX(): string {
        return process.env.REACT_APP_API_PATH_PREFIX || '';
    }

    public static get API_VERSION_PREFIX(): string {
        return process.env.REACT_APP_API_VERSION_PREFIX || '';
    }

    public static get API_URL(): string {
        return this.API_BASE_URL + this.API_PATH_PREFIX + "/" + this.API_VERSION_PREFIX + "/";
    }

    public static get ACTUATOR_URL(): string {
        return this.API_BASE_URL + this.API_PATH_PREFIX + "/actuator/";
    }

    public static get ACCESS_TOKEN(): string | undefined {
        return process.env.REACT_APP_TEST_USER_TOKEN;
    }
}

export default Config;
