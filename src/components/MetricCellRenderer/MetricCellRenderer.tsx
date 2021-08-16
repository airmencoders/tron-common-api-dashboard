
import MetricIcon from '../../icons/MetricIcon';
import Button from '../Button/Button';
import './MetricCellRenderer.scss';

function MetricCellRenderer(props: any) {
  return (
    <div className="metric-cell-renderer" data-testid="metric-cell-renderer">
      <Button type="button" onClick={() => props.onClick(props.data)} unstyled className="metric-cell-renderer__btn no-bg-button" disableMobileFullWidth>
        <MetricIcon iconTitle={'metric'} size={1.25} />
      </Button>
    </div>
  );
}

export default MetricCellRenderer;
