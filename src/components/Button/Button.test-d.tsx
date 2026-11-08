import { Button } from './index';

test('tone and variant take their named values', () => {
  <Button variant="ghost" tone="danger" />;
  // @ts-expect-error not a tone
  <Button tone="success" />;
  // @ts-expect-error padding isn't a Button prop
  <Button padding="2" />;
  <Button as="a" href="/x" />;
});
