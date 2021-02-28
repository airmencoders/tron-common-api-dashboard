import { AppClientPage } from "./pages/AppClient/AppClientPage";
import { HealthPage } from "./pages/Health/HealthPage";
import PersonPage from './pages/Person/PersonPage';
import OrganizationPage from './pages/Organization/OrganizationPage';

export interface RouteItem {
    path: string,
    name: string,
    component: React.FunctionComponent
};

export enum RoutePath {
    HOME = '/',
    HEALTH = '/health',
    PERSON = '/person',
    APP_CLIENT = '/app-clients',
    ORGANIZATION = '/organization',
}

export const routes: RouteItem[] = [
    {
        path: RoutePath.HEALTH,
        name: 'Health',
        component: HealthPage
    },
    {
        path: RoutePath.PERSON,
        name: 'People',
        component: PersonPage
    },
    {
        path: RoutePath.ORGANIZATION,
        name: 'Organizations',
        component: OrganizationPage
    },
    {
        path: RoutePath.APP_CLIENT,
        name: 'App Clients',
        component: AppClientPage
    }
];
