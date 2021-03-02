import { AppClientPage } from "./pages/AppClient/AppClientPage";
import { HealthPage } from "./pages/Health/HealthPage";
import PersonPage from './pages/Person/PersonPage';
import { PrivilegeType } from "./state/app-clients/interface/privilege-type";

export interface RouteItem {
    path: string,
    name: string,
    component: React.FunctionComponent,
    requiredPrivilege: PrivilegeType
};

export enum RoutePath {
    HOME = "/",
    HEALTH = "/health",
    PERSON = "/person",
    APP_CLIENT = "/app-clients"
};

export const routes: RouteItem[] = [
    {
        path: RoutePath.HEALTH,
        name: 'Health',
        component: HealthPage,
        requiredPrivilege: PrivilegeType.DASHBOARD_USER
    },
    {
        path: RoutePath.PERSON,
        name: 'Person',
        component: PersonPage,
        requiredPrivilege: PrivilegeType.DASHBOARD_ADMIN
    },
    {
        path: RoutePath.APP_CLIENT,
        name: 'App Clients',
        component: AppClientPage,
        requiredPrivilege: PrivilegeType.DASHBOARD_ADMIN
    }
];
