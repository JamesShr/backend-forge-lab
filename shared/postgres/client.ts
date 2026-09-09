import { Client } from "pg";

export interface CreatePostgresClientOptions {
  applicationName?: string;
}

export async function createPostgresClient(
  databaseUrl: string,
  options: CreatePostgresClientOptions = {},
): Promise<Client> {
  const client = new Client({
    connectionString: options.applicationName
      ? withApplicationName(databaseUrl, options.applicationName)
      : databaseUrl,
  });

  await client.connect();
  return client;
}

export async function withPostgresClient<T>(
  databaseUrl: string,
  callback: (client: Client) => Promise<T>,
  options: CreatePostgresClientOptions = {},
): Promise<T> {
  const client = await createPostgresClient(databaseUrl, options);

  try {
    return await callback(client);
  } finally {
    await client.end();
  }
}

function withApplicationName(value: string, applicationName: string): string {
  const url = new URL(value);
  url.searchParams.set("application_name", applicationName);
  return url.toString();
}
