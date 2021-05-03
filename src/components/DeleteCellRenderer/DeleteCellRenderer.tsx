
import RemoveIcon from '../../icons/RemoveIcon';
import Button from '../Button/Button';
import './DeleteCellRenderer.scss';

function DeleteCellRenderer(props: any) {
  return (
    <div className="delete-cell-renderer" data-testid="delete-cell-renderer">
      <Button type="button" onClick={() => props.onClick(props.data)} unstyled className="delete-cell-renderer__btn" disableMobileFullWidth>
        <RemoveIcon iconTitle={'remove'} size={1.25} />
      </Button>
    </div>
  );
}

export default DeleteCellRenderer;
