import {AccordionItem} from './AccordionItem';

export interface AccordionProps {
  className?: string;
  items: Array<AccordionItem>;
  onItemExpanded?: (itemId: string | null) => void;
}
