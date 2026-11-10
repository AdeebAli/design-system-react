import {
  Box,
  Checkbox,
  Field,
  Radio,
  RadioGroup,
  Stack,
  Switch,
} from '@adeebali/design-system-react';
import Home from '../(site)/page';

// The home page's components, plus every control Base UI hides a native input
// for, and a style prop, served under a strict CSP.
export default function CspPage() {
  return (
    <>
      <Home />
      <Stack as="section" gap="3" marginTop="6" data-testid="csp-controls">
        <Checkbox label="Remember me" name="remember" />
        <Switch label="Live updates" name="live" />
        <Field label="Billing">
          <RadioGroup name="billing" defaultValue="monthly">
            <Radio value="monthly" label="Monthly" />
            <Radio value="yearly" label="Yearly" />
          </RadioGroup>
        </Field>
        <Box
          data-testid="styled"
          style={{ outline: '2px dashed currentColor' }}
        >
          Styled with a style prop
        </Box>
      </Stack>
    </>
  );
}
