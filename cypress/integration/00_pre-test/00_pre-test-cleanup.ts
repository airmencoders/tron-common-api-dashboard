import { prepForTest } from "../../support/cleanup-helper";


describe('Pre test cleanup', () => {
  it('Should clean up before tests', () => {
      prepForTest();
  });
});