import React from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { Typography } from '@mui/material';
import { TreeItem } from '@mui/x-tree-view/TreeItem';

interface RenderTree {
  id: string;
  name: string;
  children?: RenderTree[];
}


interface RecursiveTreeViewProps {
  data: RenderTree[];
}
//{Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
export default function RecursiveTreeView({ data }: RecursiveTreeViewProps) {

  const renderTree = (nodes: RenderTree) => {
    return (
      <TreeItem key={nodes.id} itemId={nodes.id} label={nodes?.user?.name}>
        {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
      </TreeItem>
    )
  };

  return (
    <>
      <Typography>Tree View</Typography>

      <SimpleTreeView>
        <TreeItem itemId="1" label="Item 1">
          <TreeItem itemId="2" label="Item 2" />
          <TreeItem itemId="2" label="Item 2" />
          <TreeItem itemId="2" label="Item 2" />
          <TreeItem itemId="2" label="Item 2" />
        </TreeItem>
        <TreeItem itemId="2" label="Item 2" />
      </SimpleTreeView>
    </>
  );
}
/*
      <SimpleTreeView>
        {data.map((d) => renderTree(d))}
      </SimpleTreeView>
      */