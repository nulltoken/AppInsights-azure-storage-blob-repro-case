import type { Server as hapiServer } from '@hapi/hapi';
import { v4 as uuidv4 } from 'uuid';

import { apiServer } from '../server';
import { BlobServiceClient, BlockBlobClient } from '@azure/storage-blob';

export interface Closeable<T> {
  wrapped: T;
  close: () => Promise<void>;
}

// cf. https://github.com/Azure/Azurite#https-connection-strings
export const developmentConnectionString = 'DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;';

const blobServiceClient = BlobServiceClient.fromConnectionString(developmentConnectionString);

export const spawnTestServers = async (
  routingSpec: Record<string, unknown>,
): Promise<[specServer: Closeable<BlockBlobClient>, apiServer: hapiServer]> => {
  const containerName = uuidv4();

  const containerClient = blobServiceClient.getContainerClient(containerName);

  if (await containerClient.exists()) {
    throw new Error(`Test container '${containerName}' unexpectedly already exists.`);
  }

  console.log(`Creating test container '${containerName}'`);
  await containerClient.create();

  const blobPath = 'something.json';
  const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

  console.log(`Uploading '${blobPath}'`);
  await publishRoutingSpecDefinition(blockBlobClient, routingSpec);

  const server = await apiServer(
    developmentConnectionString,
    containerName,
    blobPath
  );

  await server.start();

  const wrapped: Closeable<BlockBlobClient> = {
    wrapped: blockBlobClient,

    close: async (): Promise<void> => {
      console.log(`Deleting test container '${containerName}'`);
      await containerClient.delete();
    }
  };

  return [wrapped, server];
};

export const publishRoutingSpecDefinition = async (
  blockBlobClient: BlockBlobClient,
  routingSpec: Record<string, unknown>,
): Promise<void> => {

  const buf = Buffer.from(JSON.stringify(routingSpec));

  await blockBlobClient.upload(buf, buf.length);
};
