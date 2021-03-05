
import Button from '../Button/Button';
import './DeleteCellRenderer.scss';

function DeleteCellRenderer(props: any) {
  return (
    <div className="delete-cell-renderer">
      <Button type="button" secondary={true} onClick={() => props.onClick(props.data)} unstyled>
        Delete
      </Button>
    </div>
  );
}

export default DeleteCellRenderer;
