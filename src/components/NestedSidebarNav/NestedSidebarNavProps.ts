
export interface NestedSidebarNavProps {
  id: string;
  title: string;
  isOpened: boolean;
  children: React.ReactNode;
  onToggleClicked: (navItemClicked: string) => void;
}
