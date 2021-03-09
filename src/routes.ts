import { AppClientPage } from "./pages/AppClient/AppClientPage";
import { HealthPage } from "./pages/Health/HealthPage";
import PersonPage from './pages/Person/PersonPage';
import { PrivilegeType } from "./state/app-clients/interface/privilege-type";
import OrganizationPage from './pages/Organization/OrganizationPage';
import LogfilePage from "./pages/Logfile/LogfilePage";
import DashboardUserPage from "./pages/DashboardUser/DashboardUserPage";
import ScratchStoragePage from "./pages/ScratchStorage/ScratchStoragePage";

export interface RouteItem {
    path: string,
    name: string,
    component: React.FunctionComponent,
    requiredPrivilege: PrivilegeType
}

export enum RoutePath {
    HOME = '/',
    HEALTH = '/health',
    PERSON = '/person',
    APP_CLIENT = '/app-clients',
    ORGANIZATION = '/organization',
    LOGFILE = '/logfile',
    DASHBOARD_USER = '/dashboard-user',
    SCRATCH_STORAGE = '/scratch-storage'
}

export const routes: RouteItem[] = [
    {
        path: RoutePath.HEALTH,
        name: 'Health',
        component: HealthPage,
        requiredPrivilege: PrivilegeType.DASHBOARD_USER
    },
    {
        path: RoutePath.PERSON,
        name: 'People',
        component: PersonPage,
        requiredPrivilege: PrivilegeType.DASHBOARD_ADMIN
    },
    {
        path: RoutePath.ORGANIZATION,
        name: 'Organizations',
        component: OrganizationPage,
        requiredPrivilege: PrivilegeType.DASHBOARD_ADMIN
    },
    {
        path: RoutePath.APP_CLIENT,
        name: 'App Clients',
        component: AppClientPage,
        requiredPrivilege: PrivilegeType.DASHBOARD_ADMIN
    },
    {
        path: RoutePath.SCRATCH_STORAGE,
        name: 'Scratch Storage Apps',
        component: ScratchStoragePage,
        requiredPrivilege: PrivilegeType.DASHBOARD_ADMIN
    },
    {
        path: RoutePath.LOGFILE,
        name: 'Logfile',
        component: LogfilePage,
        requiredPrivilege: PrivilegeType.DASHBOARD_ADMIN
    },
    {
        path: RoutePath.DASHBOARD_USER,
        name: 'Dashboard Users',
        component: DashboardUserPage,
        requiredPrivilege: PrivilegeType.DASHBOARD_ADMIN
    }
];
