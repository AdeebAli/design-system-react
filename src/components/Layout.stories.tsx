import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Box, type BoxProps } from './Box';
import { Center } from './Center';
import { Container } from './Container';
import { Grid } from './Grid';
import { Inline } from './Inline';
import { Inset } from './Inset';
import { Stack } from './Stack';

const meta: Meta = {
  title: 'Overview/Layout',
  parameters: {
    docs: {
      description: {
        component:
          'The layout components together: `Container` for the page, `Grid` for a bento, `Stack` and `Inline` inside each card, `Inset` for padding, and `Center` for centered content.',
      },
    },
  },
};

export default meta;

function Card({ children, ...props }: BoxProps & { children: ReactNode }) {
  return (
    <Box background="surface" borderRadius="card" boxShadow="card" {...props}>
      <Inset space="4" height="full">
        {children}
      </Inset>
    </Box>
  );
}

export const Bento: StoryObj = {
  render: () => (
    <Box background="canvas" color="default" paddingY="6">
      <Container>
        <Grid columns={{ base: '2', md: '4' }} autoRows="equal">
          <Card gridColumn="span-2" gridRow="span-2">
            <Stack gap="2" height="full" justify="between">
              <strong>Overview</strong>
              <span>A wide card, spanning two columns and two rows.</span>
            </Stack>
          </Card>
          <Card>
            <Center height="full">Centered</Center>
          </Card>
          <Card>
            <Stack gap="1">
              <strong>Stack</strong>
              <span>Top to bottom</span>
            </Stack>
          </Card>
          <Card gridColumn="span-2">
            <Inline>
              <span>Inline</span>
              <span>wraps</span>
              <span>when</span>
              <span>it</span>
              <span>needs</span>
              <span>to</span>
            </Inline>
          </Card>
        </Grid>
      </Container>
    </Box>
  ),
};
