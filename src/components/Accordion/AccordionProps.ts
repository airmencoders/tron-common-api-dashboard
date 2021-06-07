import {AccordionItem} from './AccordionItem';

export interface AccordionProps {
  items: Array<AccordionItem>;
  onItemExpanded?: (itemId: string | null) => void;
}
