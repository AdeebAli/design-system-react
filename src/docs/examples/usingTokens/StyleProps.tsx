import { Box, Stack, Text } from '../../../index';

// Style props take tokens, and most take a responsive object.
export function StyleProps() {
  return (
    <Box
      padding={{ base: '3', md: '6' }}
      borderRadius="card"
      background="surface"
      maxWidth="container.sm"
    >
      <Stack gap={{ base: '2', md: '3' }}>
        <Text weight="semibold">Tokens only</Text>
        <Text tone="muted">More padding from md up.</Text>
      </Stack>
    </Box>
  );
}
