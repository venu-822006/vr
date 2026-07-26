/**
 * Sample TypeScript command for quickmart.
 * Demonstrates the programmatic cli() registration API.
 */

import { cli, Strategy } from '@agentrhq/webcmd/registry';

cli({
  site: 'quickmart',
  name: 'greet',
  description: 'Another pipeline command',
  access: 'read',
  strategy: Strategy.PUBLIC,
  browser: false,
  args: [
    { name: 'name', positional: true, required: true, help: 'Name to greet' },
  ],
  columns: ['greeting'],
  func: async (kwargs) => [{ greeting: `Hello, ${String(kwargs.name ?? 'World')}!` }],
});
