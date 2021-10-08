import {Validation} from '@hookstate/validation';
import {useEffect} from 'react';
import Button from '../../components/Button/Button';
import Form from '../../components/forms/Form/Form';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import {
  addWeeksToDate,
  formatDateToEnCa,
  getEndOfWeek,
  getFirstDayOfWeek,
  getStartOfDay,
  isDateBefore,
  isDateEqual,
  isDateFuture,
  isDateInThisWeek,
  parseIsoDate
} from '../../utils/date-utils';
import {generateStringErrorMessages} from '../../utils/validation-utils';
import {KpiType} from './kpi-type';
import {KpiDatePickerProps} from './KpiDatePickerProps';
import './KpiDatePicker.scss';
import {useKpiPageState} from './kpi-page-state';

function KpiDatePicker(props: KpiDatePickerProps) {
  const pageState = useKpiPageState();

  useEffect(() => {
    const todayIso = formatDateToEnCa(Date.now());
    const today = parseIsoDate(todayIso);
    const firstDayOfThisWeekIso = formatDateToEnCa(getFirstDayOfWeek(today, 1));
    const firstDayOfThisWeek = parseIsoDate(firstDayOfThisWeekIso);

    let startDate: Date;
    let endDate: Date;

    if (props.kpiType === KpiType.SERIES) {
      startDate = addWeeksToDate(firstDayOfThisWeek, -1);
      endDate = getStartOfDay(getEndOfWeek(startDate, 1));
    } else {
      startDate = firstDayOfThisWeek;
      endDate = today;
    }

    pageState.set({
      startDate: formatDateToEnCa(startDate),
      endDate: formatDateToEnCa(endDate)
    });
  }, []);

  pageState.attach(Validation);

  Validation(pageState.startDate).validate(date => {
    if (props.kpiType === KpiType.SUMMARY) {
      return !isDateFuture(parseIsoDate(date));
    }

    return true;
  }, 'Start Date cannot be in the future', 'error');

  Validation(pageState.startDate).validate(date => {
    if (props.kpiType === KpiType.SERIES) {
      const inputDate = parseIsoDate(date);

      return !isDateFuture(inputDate) && !isDateInThisWeek(inputDate);
    }

    return true;
  }, 'Start Date cannot be in the future or within the current week', 'error');

  Validation(pageState.startDate).validate(date => {
    const inputDate = parseIsoDate(date);
    const endDate = parseIsoDate(pageState.endDate.value);

    return isDateBefore(inputDate, endDate) || isDateEqual(inputDate, endDate);
  }, 'Start Date must be equal to or before End Date', 'error');

  return (
    <div className="kpi-content__actions">
      <Form className="actions__form" onSubmit={() => { return; }}>
        <div className="form__date-range">
          <div>
            <FormGroup
              labelName={`${props.kpiType.toLocaleLowerCase()}-start-date`}
              labelText={`${props.kpiType} From (UTC)`}
              isError={Validation(pageState.startDate).invalid()}
              errorMessages={generateStringErrorMessages(pageState.startDate)}
            >
              <input
                id={`${props.kpiType.toLocaleLowerCase()}-start-date`}
                name={`${props.kpiType.toLocaleLowerCase()}-start-date`}
                type="date"
                value={pageState.startDate.value}
                onChange={e => pageState.startDate.set(e.target.value)}
              />
            </FormGroup>
          </div>

          <div>
            <FormGroup
              labelName={`${props.kpiType.toLocaleLowerCase()}-end-date`}
              labelText={`${props.kpiType} To (UTC)`}
              isError={Validation(pageState.endDate).invalid()}
              errorMessages={generateStringErrorMessages(pageState.endDate)}
            >
              <input
                id={`${props.kpiType.toLocaleLowerCase()}-end-date`}
                name={`${props.kpiType.toLocaleLowerCase()}-end-date`}
                type="date"
                value={pageState.endDate.value}
                onChange={e => pageState.endDate.set(e.target.value)}
              />
            </FormGroup>
          </div>
        </div>

        <div className="form__submit">
          <Button
            type="button"
            disabled={Validation(pageState).invalid()}
            onClick={() => props.onClickCallBack(pageState.startDate.value, pageState.endDate.value)}
          >
            {props.kpiType === KpiType.SUMMARY ? "Get KPI Summary" : "Get KPI Series"}
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default KpiDatePicker;
