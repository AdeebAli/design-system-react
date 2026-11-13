import { cdp } from 'vitest/browser';

interface FrameTree {
  frame: { id: string; url: string };
  childFrames?: FrameTree[];
}

/** A node of Chrome's accessibility tree, as screen readers get it. */
export interface AXNode {
  role?: { value: string };
  name?: { value: string };
}

interface RawAXNode extends AXNode {
  nodeId: string;
  parentId?: string;
  childIds?: string[];
  ignored?: boolean;
}

/**
 * The frame this test renders in. Browser tests run in an iframe, so the
 * runner's own page is a different frame; it's found by URL at any depth.
 */
async function testFrameId(): Promise<string> {
  const { frameTree } = (await cdp().send('Page.getFrameTree')) as {
    frameTree: FrameTree;
  };
  const find = (tree: FrameTree): FrameTree | undefined =>
    tree.frame.url === location.href
      ? tree
      : tree.childFrames?.map(find).find(Boolean);
  const frame = find(frameTree);
  if (!frame) throw new Error(`No frame at ${location.href}`);
  return frame.frame.id;
}

/**
 * Chrome's accessibility tree for the test frame, in reading order. Chrome
 * returns it breadth-first, so it's walked depth-first from the root. Ignored
 * nodes are left out, but their children are kept, as a screen reader does.
 */
export async function axTree(): Promise<AXNode[]> {
  const { nodes } = (await cdp().send('Accessibility.getFullAXTree', {
    frameId: await testFrameId(),
  })) as { nodes: RawAXNode[] };
  const byId = new Map(nodes.map((node) => [node.nodeId, node]));
  const ordered: AXNode[] = [];
  const walk = (node: RawAXNode) => {
    if (!node.ignored) ordered.push(node);
    for (const id of node.childIds ?? []) {
      const child = byId.get(id);
      if (child) walk(child);
    }
  };
  for (const root of nodes.filter((node) => node.parentId === undefined))
    walk(root);
  return ordered;
}

/** The names of the nodes with this role, in reading order. */
export async function axNames(role: string): Promise<(string | undefined)[]> {
  return (await axTree())
    .filter((node) => node.role?.value === role)
    .map((node) => node.name?.value);
}

/** Each node as `role:name`, in reading order. */
export async function axEntries(): Promise<string[]> {
  return (await axTree()).map(
    (node) => `${node.role?.value}:${node.name?.value ?? ''}`,
  );
}
