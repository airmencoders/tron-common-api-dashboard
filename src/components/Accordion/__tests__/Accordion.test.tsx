import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import Accordion from '../Accordion';
import {AccordionItem} from '../AccordionItem';

const accordionItems: Array<AccordionItem> = [
  { title: 'Test Title', content: <div>Test</div>, id: 'id'} as AccordionItem
];

test('Accordion Renders', async () => {
  render(<Accordion items={accordionItems} />);
  await waitFor(
      () => expect(screen.findByTestId('accordion-heading-button')).toBeTruthy()
  );
});

test('Accordion Renders', async () => {
  render(<Accordion items={accordionItems} />);
  await waitFor(
      () => expect(screen.findByTestId('accordion-heading-button')).toBeTruthy()
  );
});

test('Accordion Open', async () => {
  render(<Accordion items={accordionItems} />);

  await waitFor(
      () => expect(screen.findByTestId('accordion-heading-button')).toBeTruthy()
  );
  fireEvent(
      screen.getByTestId('accordion-heading-button'),
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      })
  );
  await waitFor(
      () => expect(screen.findByTestId('accordion-body')).toBeTruthy()
  );
});
