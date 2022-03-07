import * as AppInsights from 'applicationinsights';
import Hapi from '@hapi/hapi';
import { refresh } from './lib/refresh';

export const apiServer = async (
  azure_storage_connection_string: string,
  azure_storage_container_name: string,
  routing_spec_name: string,
): Promise<Hapi.Server> => {

  AppInsights.setup('00000000-0000-0000-0000-000000000000');

  // Comment the following line out to make the test pass
  AppInsights.start();

  const hapiServer = new Hapi.Server({
    host: '0.0.0.0',
    port: 3006,
  });


  await refresh(
    azure_storage_connection_string,
    azure_storage_container_name,
    routing_spec_name,
  );

  hapiServer.route([
    {
      method: 'GET',
      path: '/test',
      options: {
        handler: (_request, h) => {

          const res = { 'ok': 200 };

          return h.response(res)
            .code(200)
            .header('content-type', 'application/json; charset=utf-8');
        }
      }
    }
  ]);

  return hapiServer;
};
