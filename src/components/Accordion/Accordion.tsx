import React, {useState} from 'react';
import {AccordionProps} from './AccordionProps';
import './Accordion.scss';

function Accordion(props: AccordionProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const handleAccordionClick = (itemId: string) =>
      (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const expandedToSet = itemId === expandedItem ? null : itemId;
        setExpandedItem(expandedToSet);
        if (props.onItemExpanded != null) {
          props.onItemExpanded(expandedToSet);
        }
      };

  return (
      <div className={`usa-accordion ${props.className}`}>
        {
          props.items.map((accordionItem) => (<>
            <h4 className="usa-accordion__heading">
              <button className="usa-accordion__button"
                      aria-expanded={accordionItem.id === expandedItem} aria-controls={accordionItem.id}
                      onClick={handleAccordionClick(accordionItem.id)}
              >
                {accordionItem.title}
              </button>
            </h4>
            <div id={accordionItem.id} className="usa-accordion__content usa-prose"
                 hidden={accordionItem.id !== expandedItem}>
              {accordionItem.content}
            </div>
          </>))
        }
      </div>
  );
}

export default Accordion;
