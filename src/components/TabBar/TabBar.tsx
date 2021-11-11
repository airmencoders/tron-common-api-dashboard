import React, { ReactNode } from 'react';
import './TabBar.scss';

export interface TabBarItem {
  id?: string;
  text: string;
  content: ReactNode;
  onClick: () => void;
}

export interface TabBarProps {
  id?: string;
  items: TabBarItem[];
  selectedIndex: number;
}

// Homebrew reimplementation of Tab control as hosted in the USSF Astro UXDS,
//  but more React-like

export default function TabBar(props: TabBarProps) {
  function buildItems() {
    const items = [];
    for (let i = 0; i < props.items.length; i++) {
      if (i == props.selectedIndex) {
        items.push(
          <li className={'selected selected-item'} key={`tab_${props.items[i].text}_${i}`} onClick={props.items[i].onClick}>
            <a>{props.items[i].text}</a>
          </li>
        );
      } else {
        items.push(
          <li className={'tab'} key={`tab_${props.items[i].text}_${i}`} onClick={props.items[i].onClick}>
            <a>{props.items[i].text}</a>
          </li>
        );
      }
    }
    return items;
  }

  return (
    <>
      <div className="tabs">
        <ul>{buildItems()}</ul>
      </div>
      <div className="tabs-content">{props.items.length > 0 && props.items[props.selectedIndex].content}</div>
    </>
  );
}
