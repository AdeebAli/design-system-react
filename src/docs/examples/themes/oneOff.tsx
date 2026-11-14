import { Card, Text } from '../../../index';
import { promo } from './oneOff.css';

// One instance that needs something the tokens don't cover. className and
// style are escape hatches for this, not a way to restyle every Card.
export function PromoCard() {
  return (
    <Card className={promo}>
      <Text weight="semibold">Spring sale</Text>
    </Card>
  );
}
