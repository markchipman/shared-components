import React from 'react';
import { Form, Fields, Input, Toggle } from '@bandwidth/shared-components';

export default ({ children, columns = 2 }) => (
  <Form>
    <Fields columns={columns}>
      <Fields.Field label="Input 1" required>
        <Input value="Value 1" required />
      </Fields.Field>
      <Fields.Field label="Input 2" helpText="Optional">
        <Input value="Value 2" />
      </Fields.Field>
      <Fields.Field label="Toggle 1">
        <Toggle checked description="It's a toggle" />
      </Fields.Field>
      <Fields.Field label="Input 3" helpText="Secret">
        <Input type="password" value="Shhhh" />
      </Fields.Field>
    </Fields>
    {children}
  </Form>
);
