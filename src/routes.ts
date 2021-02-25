import { PersonControl } from "./components/Person/PersonControl";
import { AppClientPage } from "./pages/AppClient/AppClientPage";
import { HealthPage } from "./pages/HealthPage";
import LogfilePage from "./pages/Logfile/LogfilePage";

export interface RouteItem {
    path: string,
    name: string,
    component: React.ComponentType<any>
};

export enum RoutePath {
    HOME = "/",
    HEALTH = "/health",
    PERSON = "/person",
    APP_CLIENT = "/app-clients",
    LOGFILE = "/logfile"
}

export const routes: RouteItem[] = [
    {
        path: RoutePath.HEALTH,
        name: 'Health',
        component: HealthPage
    },
    {
        path: RoutePath.PERSON,
        name: 'Person',
        component: PersonControl
    },
    {
        path: RoutePath.APP_CLIENT,
        name: 'App Clients',
        component: AppClientPage
    },
    {
        path: RoutePath.LOGFILE,
        name: 'Logfile',
        component: LogfilePage
    }
];
