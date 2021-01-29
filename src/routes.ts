import { PersonControl } from "./components/Person/PersonControl";
import { HealthPage } from "./pages/HealthPage";

export interface RouteItem {
    path: string,
    name: string,
    component: React.FunctionComponent
};

export enum RoutePath {
    HOME = "/",
    HEALTH = "/health",
    PERSON = "/person"
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
    }
];
