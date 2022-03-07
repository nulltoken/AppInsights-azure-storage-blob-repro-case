import { loadFromAzureBlobStorage } from './loadFromAzureBlobStorage';


export const refresh = async (
  azure_storage_connection_string: string,
  azure_storage_container_name: string,
  routing_spec_name: string,
): Promise<void> => {

  const timer0 = 'Loading new routing specification';
  console.time(timer0);

  const stringifiedRoutingSpec = await loadFromAzureBlobStorage(
    azure_storage_connection_string,
    azure_storage_container_name,
    routing_spec_name,
    'NOT_INITIALIZED_YET');

  console.timeEnd(timer0);

  if (stringifiedRoutingSpec === undefined) {

    console.log('Skipped refresh');

    return;
  }

  console.log(`Retrieved Etag value is '${stringifiedRoutingSpec.etag}'`);
};
