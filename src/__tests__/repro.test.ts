import { spawnTestServers } from './_helper';

it('repro', async () => {

  const [routingSpecServer, server] = await spawnTestServers({ 'a': 1 });

  const res = await server.inject({ method: 'GET', url: '/test' });

  expect(res.statusCode).toBe(200);

  expect(JSON.parse(res.payload)).toEqual({
    ok: 200
  });

  await routingSpecServer.close();
  await server.stop();
});
