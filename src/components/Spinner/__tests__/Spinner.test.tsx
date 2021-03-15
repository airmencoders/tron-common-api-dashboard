import { render } from "@testing-library/react";
import Spinner from "../Spinner";

describe('Test Spinner', () => {
  it('Renders', () => {
    const renderedComponent = render(
      <Spinner />
    );

    expect(renderedComponent.findByText('Loading...')).toBeDefined();
  });
});