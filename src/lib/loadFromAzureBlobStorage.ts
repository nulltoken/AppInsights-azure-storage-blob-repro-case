import { BlobClient, RestError } from '@azure/storage-blob';
import Boom from '@hapi/boom';

const errMessage = 'Error while loading routing specification';

export interface LoadingResult {
  content: string;
  etag: string;
}

export const loadFromAzureBlobStorage = async (
  connectionString: string,
  containerName: string,
  blobPath: string,
  lastKnownEtag: string,
): Promise<LoadingResult | undefined> => {

  try {
    const bc = new BlobClient(connectionString, containerName, blobPath, undefined);

    const downloadBlockBlobResponse = await bc.download(undefined, undefined, { conditions: { ifNoneMatch: lastKnownEtag } });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const buf = await streamToBuffer3(downloadBlockBlobResponse.readableStreamBody!);

    return {
      content: buf.toString('utf8'),

      // According to https://docs.microsoft.com/en-us/rest/api/storageservices/get-blob#response-headers
      // the etag is always returned, and as this is the basis for concurrency management (cf.
      // https://docs.microsoft.com/en-us/azure/storage/blobs/concurrency-manage?tabs=dotnet#optimistic-concurrency)
      // I believe this should be quite trustable.
      //
      // cf. https://github.com/Azure/azure-sdk-for-js/issues/18164
      etag: downloadBlockBlobResponse.etag ?? 'UNITIALIZED_ETAG'
    };

  } catch (e) {
    if (!(e instanceof RestError)) {
      throw Boom.badImplementation(errMessage, e);
    }

    if (e.statusCode !== 304) {
      throw Boom.badImplementation(errMessage, e);
    }

    return undefined;
  }
};

// From https://github.com/Azure/azure-sdk-for-js/blob/af9572946ce1ba33c89118f21dd3809dbb241732/sdk/storage/storage-file-share/src/utils/utils.node.ts
// Licence MIT (https://github.com/Azure/azure-sdk-for-js/blob/master/LICENSE)

export async function streamToBuffer3(
  readableStream: NodeJS.ReadableStream,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    readableStream.on('data', (data: Buffer | string) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on('error', reject);
  });
}
