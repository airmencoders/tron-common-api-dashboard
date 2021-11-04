import React from 'react';
import { render } from '@testing-library/react';
import GridDownloadButton from '../GridDownloadButton';


describe('GridDownloadButton Tests', () => {

  it('should render with title', () => {
    const element = render(
      <GridDownloadButton
        link=""
        title="Test"
      />
    );

    expect(element.getByTitle('Download Test')).toBeInTheDocument();
  });

  it('should render with default title', () => {
    const element = render(
      <GridDownloadButton
        link=""
      />
    );

    expect(element.getByTitle('Download')).toBeInTheDocument();
  });

  it('should render with correct a tag href', () => {
    const element = render(
      <GridDownloadButton
        link="/test/link"
      />
    );

    const aTag = element.getByRole('link');
    expect(aTag).toBeInTheDocument();
    expect(aTag).toHaveAttribute('href', '/test/link');
  });
})
