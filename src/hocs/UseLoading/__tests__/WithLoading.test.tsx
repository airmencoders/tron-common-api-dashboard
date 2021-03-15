import { render } from "@testing-library/react";
import withLoading from "../WithLoading";

describe('Test UseLoading HOC', () => {
  function TestComp() {
    return (
      <div>Test Comp</div>
    );
  }

  it('Loading', () => {
    const Page = withLoading(TestComp);

    const renderedComponent = render(
      <Page isLoading={true} />
    );

    expect(renderedComponent.findByText('Loading...')).toBeDefined();
  });

  it('Not loading', () => {
    const Page = withLoading(TestComp);

    const renderedComponent = render(
      <Page isLoading={false} />
    );

    expect(renderedComponent.findByText('Test Comp')).toBeDefined();
  });
});