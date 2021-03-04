import { useEffect } from "react";
import { usePrivilegeState } from "../../state/privilege/privilege-state";
import { DashboardUserContent } from "./DashboardUserContent";

function DashboardUserPage() {
  const privilegeState = usePrivilegeState();

  useEffect(() => {
    privilegeState.fetchAndStorePrivileges();
  }, []);

  return (
    <DashboardUserContent />
  );
}

export default DashboardUserPage;