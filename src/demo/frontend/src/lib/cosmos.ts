// File: src/lib/cosmos.ts
import { CosmosClient } from "@azure/cosmos";

// Khởi tạo Client một lần duy nhất
const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT!,
  key: process.env.COSMOS_KEY!,
});

// Hàm tiện ích để lấy Container nhanh
export function getContainer(containerName: string) {
  const database = client.database(process.env.COSMOS_DATABASE!);
  return database.container(containerName);
}