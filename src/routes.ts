import { AppClientPage } from "./pages/AppClient/AppClientPage";
import HealthPage from "./pages/Health/HealthPage";
import PersonPage from './pages/Person/PersonPage';
import { PrivilegeType } from "./state/privilege/privilege-type";
import OrganizationPage from './pages/Organization/OrganizationPage';
import LogfilePage from "./pages/Logfile/LogfilePage";
import DashboardUserPage from "./pages/DashboardUser/DashboardUserPage";
import ScratchStoragePage from "./pages/ScratchStorage/ScratchStoragePage";
import HomePage from "./pages/Home/Home";
import { AppSourcePage } from "./pages/AppSource/AppSourcePage";
import MyDigitizeAppsPage from "./pages/MyDigitizeApps/MyDigitizeAppsPage";

export interface RouteItem {
    path: string,
    name: string,
    component: React.FunctionComponent,
    requiredPrivileges: PrivilegeType[]
}

export enum RoutePath {
    HOME = '/',
    HEALTH = '/health',
    PERSON = '/person',
    APP_CLIENT = '/app-clients',
    ORGANIZATION = '/organization',
    LOGFILE = '/logfile',
    DASHBOARD_USER = '/dashboard-user',
    SCRATCH_STORAGE = '/scratch-storage',
    APP_SOURCE = '/app-source',
    MY_DIGITIZE_APPS = '/digitize-apps'
}

export const routes: RouteItem[] = [
    {
        path: RoutePath.HOME,
        name: 'Home',
        component: HomePage,
        requiredPrivileges: [
            PrivilegeType.DASHBOARD_USER,
            PrivilegeType.DASHBOARD_ADMIN,
            PrivilegeType.APP_SOURCE_ADMIN,
            PrivilegeType.SCRATCH_READ,
            PrivilegeType.SCRATCH_WRITE,
            PrivilegeType.SCRATCH_ADMIN
        ]
    },
    {
        path: RoutePath.HEALTH,
        name: 'Health',
        component: HealthPage,
        requiredPrivileges: [PrivilegeType.DASHBOARD_USER]
    },
    {
        path: RoutePath.MY_DIGITIZE_APPS,
        name: 'My Digitize Apps',
        component: MyDigitizeAppsPage,
        requiredPrivileges: [PrivilegeType.DASHBOARD_USER]
    },
    {
        path: RoutePath.PERSON,
        name: 'People',
        component: PersonPage,
        requiredPrivileges: [PrivilegeType.DASHBOARD_ADMIN]
    },
    {
        path: RoutePath.ORGANIZATION,
        name: 'Organizations',
        component: OrganizationPage,
        requiredPrivileges: [PrivilegeType.DASHBOARD_ADMIN]
    },
    {
        path: RoutePath.APP_CLIENT,
        name: 'App Clients',
        component: AppClientPage,
        requiredPrivileges: [PrivilegeType.DASHBOARD_ADMIN]
    },
    {
        path: RoutePath.SCRATCH_STORAGE,
        name: 'Scratch Storage Apps',
        component: ScratchStoragePage,
        requiredPrivileges: [PrivilegeType.DASHBOARD_ADMIN]
    },
    {
        path: RoutePath.DASHBOARD_USER,
        name: 'Dashboard Users',
        component: DashboardUserPage,
        requiredPrivileges: [PrivilegeType.DASHBOARD_ADMIN]
    },
    {
        path: RoutePath.APP_SOURCE,
        name: 'App Sources',
        component: AppSourcePage,
        requiredPrivileges: [PrivilegeType.DASHBOARD_ADMIN, PrivilegeType.APP_SOURCE_ADMIN]
    },
    {
        path: RoutePath.LOGFILE,
        name: 'Logfile',
        component: LogfilePage,
        requiredPrivileges: [PrivilegeType.DASHBOARD_ADMIN]
    }
];
