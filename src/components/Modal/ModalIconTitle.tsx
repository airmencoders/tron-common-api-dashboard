import './ModalIconTitle.scss';

export interface ModalIconTitleProps {
  icon: React.ReactNode;
  text: string;
}

/**
 * Component to pair an icon with text for a modal header
 * @param props 
 */

export default function ModalIconTitle(props: ModalIconTitleProps) {

  return (
    <span className='icon-title-header'>
      <span className='icon-box'>{props.icon}</span>
      <h3 className='icon-title-text'>{props.text}</h3>
    </span>
  )
}