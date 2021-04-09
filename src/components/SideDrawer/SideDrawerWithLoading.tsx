import withLoading from "../../hocs/UseLoading/WithLoading";
import { WithLoadingProps } from "../../hocs/UseLoading/WithLoadingProps";
import SideDrawer from "./SideDrawer";
import { SideDrawerProps } from "./SideDrawerProps";

const WithLoadingSideDrawer = withLoading(SideDrawer);

function SideDrawerWithLoading(props: WithLoadingProps & SideDrawerProps) {
  return (
    <WithLoadingSideDrawer {...props} />
  );
}

export default SideDrawerWithLoading;
