import withLoading from "../../hocs/UseLoading/WithLoading";
import { WithLoadingProps } from "../../hocs/UseLoading/WithLoadingProps";
import { ChooserProps } from "./ChooserProps";
import ItemChooser from "./ItemChooser";

const WithLoadingItemChooser = withLoading(ItemChooser);

function ItemChooserWithLoading(props: WithLoadingProps & ChooserProps) {
  return (
    <WithLoadingItemChooser {...props} />
  );
}

export default ItemChooserWithLoading;
