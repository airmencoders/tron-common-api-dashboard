import { PersonControl } from "./components/Person/PersonControl";
import { HealthPage } from "./pages/HealthPage";

export interface RouteItem {
    path: string,
    name: string,
    component: React.FunctionComponent
};

const routes: RouteItem[] = [
    {
        path: "/health",
        name: "Health",
        component: HealthPage
    },
    {
        path: "/person",
        name: "Person",
        component: PersonControl
    }
];

export default routes;