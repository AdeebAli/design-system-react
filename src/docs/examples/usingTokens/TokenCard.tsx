import { Text } from '../../../index';
import { tokenCard } from './tokenCard.css';

export function TokenCard() {
  return (
    <div className={tokenCard}>
      <Text>Styled with vars, so it follows the theme and the color mode.</Text>
    </div>
  );
}
