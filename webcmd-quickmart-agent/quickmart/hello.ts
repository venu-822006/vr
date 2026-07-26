/**
 * Sample pipeline command for quickmart.
 * Demonstrates the declarative pipeline API.
 */

import { cli, Strategy } from '@agentrhq/webcmd/registry';

cli({
  site: 'quickmart',
  name: 'hello',
  description: 'A sample pipeline command',
  access: 'read',
  strategy: Strategy.PUBLIC,
  browser: false,
  columns: ['greeting'],
  pipeline: [
    { fetch: { url: 'https://httpbin.org/get?greeting=hello' } },
    { select: 'args' },
  ],
});
