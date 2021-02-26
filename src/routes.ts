import { PersonControl } from "./components/Person/PersonControl";
import { AppClientPage } from "./pages/AppClient/AppClientPage";
import { HealthPage } from "./pages/HealthPage";

export interface RouteItem {
    path: string,
    name: string,
    component: React.FunctionComponent,
    protectedStatus: ProtectedStatus
};

export enum RoutePath {
    HOME = "/",
    HEALTH = "/health",
    PERSON = "/person",
    APP_CLIENT = "/app-clients"
};

export enum ProtectedStatus {
    ADMIN,
    USER,
    ANONYMOUS
};

export const routes: RouteItem[] = [
    {
        path: RoutePath.HEALTH,
        name: 'Health',
        component: HealthPage,
        protectedStatus: ProtectedStatus.ANONYMOUS
    },
    {
        path: RoutePath.PERSON,
        name: 'Person',
        component: PersonControl,
        protectedStatus: ProtectedStatus.ADMIN
    },
    {
        path: RoutePath.APP_CLIENT,
        name: 'App Clients',
        component: AppClientPage,
        protectedStatus: ProtectedStatus.ADMIN
    }
];
