import { useState } from 'react';
import { Button, Field, Heading, Input, Stack } from '../../../index';

// The house rules in one small form: composed layout with gap, a heading at
// the right level, a visible label, an error that says how to fix it, and a
// button labeled with a verb.
export function SignUpForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  return (
    <Stack
      as="form"
      gap="4"
      maxWidth="container.sm"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setError(
          email.includes('@')
            ? undefined
            : 'Enter an email address with an @, such as ada@example.com.',
        );
      }}
    >
      <Heading level={2} size="xl">
        Get product updates
      </Heading>
      <Field label="Email" error={error}>
        <Input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>
      <div>
        <Button type="submit">Subscribe</Button>
      </div>
    </Stack>
  );
}
