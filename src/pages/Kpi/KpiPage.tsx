import React, { useEffect } from 'react';
import { useHookstate } from '@hookstate/core';
import { CancelTokenSource } from 'axios';
import Button from '../../components/Button/Button';
import Form from '../../components/forms/Form/Form';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import PageFormat from '../../components/PageFormat/PageFormat';
import { ToastType } from '../../components/Toast/ToastUtils/toast-type';
import { createTextToast } from '../../components/Toast/ToastUtils/ToastUtils';
import { useKpiState } from '../../state/kpi/kpi-state';
import { formatDateToEnCa, getFirstDayOfWeek, isDateBefore, isDateFuture } from '../../utils/date-utils';
import KpiContentWithLoading from './KpiContentWithLoading';
import './KpiPage.scss';
import { Validation } from '@hookstate/validation';
import { generateStringErrorMessages } from '../../utils/validation-utils';

interface KpiPageState {
  startDate: string;
  endDate: string;
  cancelTokenSource?: CancelTokenSource;
}

function KpiPage() {
  const kpiService = useKpiState();
  const pageState = useHookstate<KpiPageState>({
    startDate: '',
    endDate: '',
    cancelTokenSource: undefined
  });

  pageState.attach(Validation);

  Validation(pageState.startDate).validate(date => !isDateFuture(Date.parse(date)), 'Start Date cannot be in the future', 'error');
  Validation(pageState.startDate).validate(date => isDateBefore(Date.parse(date), Date.parse(pageState.endDate.value)), 'Start Date must be before End Date', 'error');
  Validation(pageState.endDate).validate(date => !isDateBefore(Date.parse(date), Date.parse(pageState.startDate.value)), 'End Date must be after Start Date', 'error');

  useEffect(() => {
    const todayAsString = formatDateToEnCa(Date.now());
    const todayAsDate = Date.parse(todayAsString);
    const startOfWeek = formatDateToEnCa(getFirstDayOfWeek(todayAsDate, 1));

    pageState.set({
      startDate: startOfWeek,
      endDate: todayAsString
    });

    return function cleanup() {
      pageState.cancelTokenSource.value?.cancel();
      kpiService.resetState();
    }
  }, []);

  function fetchKpis(): void {
    const cancellablePromise = kpiService.fetchAndStoreData(pageState.startDate.value, pageState.endDate.value);

    cancellablePromise.promise.catch(err => {
      createTextToast(ToastType.ERROR, err.message);
    });

    pageState.cancelTokenSource.set(cancellablePromise.cancelTokenSource);
  }

  return (
    <PageFormat pageTitle="KPIs">
      <div className="kpi-content">
        <div className="kpi-content__actions">
          <Form className="actions__form" onSubmit={() => { return; }}>
            <div className="form__date-range">
              <div>
                <FormGroup
                  labelName="start-date"
                  labelText="From (UTC)"
                  isError={Validation(pageState.startDate).invalid()}
                  errorMessages={generateStringErrorMessages(pageState.startDate)}
                >
                  <input
                    id="start-date"
                    name="start-date"
                    type="date"
                    value={pageState.startDate.value}
                    onChange={e => pageState.startDate.set(e.target.value)}
                  />
                </FormGroup>
              </div>

              <div>
                <FormGroup
                  labelName="end-date"
                  labelText="To (UTC)"
                  isError={Validation(pageState.endDate).invalid()}
                  errorMessages={generateStringErrorMessages(pageState.endDate)}
                >
                  <input
                    id="end-date"
                    name="end-date"
                    type="date"
                    value={pageState.endDate.value}
                    onChange={e => pageState.endDate.set(e.target.value)}
                  />
                </FormGroup>
              </div>

            </div>

            <Button type="button" disabled={kpiService.isPromised || Validation(pageState).invalid()} onClick={fetchKpis}>Get KPIs</Button>
          </Form>
        </div>

        {!kpiService.error &&
          <KpiContentWithLoading isLoading={kpiService.isPromised} startDate={pageState.startDate.value} endDate={pageState.endDate.value} />
        }
      </div>
    </PageFormat>
  )
}

export default KpiPage;