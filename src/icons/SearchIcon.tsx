import { IconProps } from './IconProps';

function SearchIcon(props: IconProps) {
  return (
      <i className={`search-icon bi bi-search ${props.className}`}
         style={{fontSize: `${props.size}rem`, position:'absolute', margin:`.35rem`}}
         title={ props.iconTitle != null ? props.iconTitle : 'search'}
      ></i>
  );
}

export default SearchIcon;
