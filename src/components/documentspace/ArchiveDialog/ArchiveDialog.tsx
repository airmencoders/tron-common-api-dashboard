import React from 'react';
import GenericDialog from '../../GenericDialog/GenericDialog';
import { ArchiveDialogProps } from './ArchiveDialogProps';

function getItems<T>(items: T | T[] | undefined) {
  if (items == null) {
    return [];
  }

  return Array.isArray(items) ? items : [items];
}

function getContent<T extends { key: string }>(items: T[]) {
  if (items.length === 0) {
    return (
      <>
        No items selected
      </>
    );
  }

  if (items.length > 1) {
    return (
      <>
        Archive these {items.length} items?
      </>
    );
  }

  return (
    <>
      Archive this item - {items[0].key}
    </>
  );
}

function ArchiveDialog<T extends { key: string }>(props: ArchiveDialogProps<T>) {
  const items = getItems(props.items);

  return (
    <GenericDialog
      title="Archive"
      submitText="Archive"
      show={props.show}
      onCancel={props.onCancel}
      onSubmit={props.onSubmit}
      disableSubmit={items.length === 0}
      content={getContent(items)}
    />
  )
}

export default ArchiveDialog;