
import RemoveIcon from '../../icons/RemoveIcon';
import Button from '../Button/Button';
import './DeleteCellRenderer.scss';

function DeleteCellRenderer(props: any) {
  return (
    <div>
      {props.node.data &&
        <div className="delete-cell-renderer" data-testid="delete-cell-renderer">
          <Button type="button" onClick={() => props.onClick(props.node.data)} unstyled className="delete-cell-renderer__btn" transparentBackground disableMobileFullWidth>
            <RemoveIcon iconTitle={'remove'} size={1.25} />
          </Button>
        </div>
      }
    </div>
  );
}

export default DeleteCellRenderer;
