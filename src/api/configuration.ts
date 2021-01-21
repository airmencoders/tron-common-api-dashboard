class Config {
    public static get BASE_URL(): string {
        return "http://localhost:8080/api/";
    }

    public static get ACTUATOR_URL(): string {
        return Config.BASE_URL + "actuator/";
    }
}

export default Config;