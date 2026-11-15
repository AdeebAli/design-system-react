import { vars } from '../../themes/contract.css';

/**
 * The line under a props table (Spec 18, API): the HTML attributes a
 * component also accepts and, with `layout`, a link to the style props page.
 */
export function AlsoAccepts({
  element,
  layout = false,
}: {
  element: string;
  layout?: boolean;
}) {
  return (
    <p style={{ marginBlockStart: vars.space['3'] }}>
      Also accepts <code>{element}</code> attributes
      {layout ? (
        <>
          , and the{' '}
          {/* A plain anchor in the docs iframe: load the manager URL in the top window. */}
          <a
            href="./?path=/docs/components-layout-box-all-style-props--docs"
            target="_top"
          >
            layout props
          </a>
        </>
      ) : null}
      .
    </p>
  );
}

/**
 * The API line for a part that declares no props of its own, which gets no
 * props table (Spec 18, Component pages; v0.8.1 plan Departure 3).
 */
export function NoOwnProps({
  name,
  element,
  layout = false,
}: {
  name: string;
  element: string;
  layout?: boolean;
}) {
  return (
    <p>
      <code>{name}</code> has no props of its own. It accepts{' '}
      <code>{element}</code> attributes
      {layout ? (
        <>
          , and the{' '}
          {/* A plain anchor in the docs iframe: load the manager URL in the top window. */}
          <a
            href="./?path=/docs/components-layout-box-all-style-props--docs"
            target="_top"
          >
            layout props
          </a>
        </>
      ) : null}
      .
    </p>
  );
}
