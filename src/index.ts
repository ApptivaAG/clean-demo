#!/usr/bin/env node

import { MongoClient } from 'mongodb';
import prompts from 'prompts';

const AZURE_SEARCH_SERVICES = [
  {
    name: 'bubble-chat-ai-search-s1',
    sku: 'standard',
    url: 'https://portal.azure.com/#view/Microsoft_Azure_Search/Index.ReactView/id/%2Fsubscriptions%2F113f017c-5068-4425-97b6-7cb15ccad2e6%2FresourceGroups%2Fbubble-chat%2Fproviders%2FMicrosoft.Search%2FsearchServices%2Fbubble-chat-ai-search-s1%23bubble-demo-PROJECT_ID/location/Switzerland%20North/sku/standard',
  },
  {
    name: 'bubble-chat-ai-search-s1-2',
    sku: 'standard',
    url: 'https://portal.azure.com/#view/Microsoft_Azure_Search/Index.ReactView/id/%2Fsubscriptions%2F113f017c-5068-4425-97b6-7cb15ccad2e6%2FresourceGroups%2Fbubble-chat%2Fproviders%2FMicrosoft.Search%2FsearchServices%2Fbubble-chat-ai-search-s1-2%23bubble-demo-PROJECT_ID/location/Switzerland%20North/sku/standard',
  },
  {
    name: 'bubble-chat-ai-search-basic-demo',
    sku: 'basic',
    url: 'https://portal.azure.com/#view/Microsoft_Azure_Search/Index.ReactView/id/%2Fsubscriptions%2F113f017c-5068-4425-97b6-7cb15ccad2e6%2FresourceGroups%2Fbubble-chat%2Fproviders%2FMicrosoft.Search%2FsearchServices%2Fbubble-chat-ai-search-basic-demo%23bubble-demo-PROJECT_ID/location/Switzerland%20North/sku/basic',
  },
];

async function main() {
  console.log('🧹 Demo Chatbot Cleanup Tool\n');

  // Prompt for project ID
  const { projectId } = await prompts({
    type: 'text',
    name: 'projectId',
    message: 'Enter project ID (e.g., kd6zk2):',
    validate: (value) => (value.length > 0 ? true : 'Project ID is required'),
  });

  if (!projectId) {
    console.log('❌ Operation cancelled');
    process.exit(0);
  }

  // Perform MongoDB cleanup
  await performMongoDBCleanup(projectId);

  // Display Azure AI Search index cleanup instructions
  await displayAzureSearchCleanupInstructions(projectId);

  // Restart Kubernetes deployment
  await restartKubernetesDeployment(projectId);
}

async function performMongoDBCleanup(projectId: string) {
  // Prompt for password
  const { password } = await prompts({
    type: 'password',
    name: 'password',
    message: 'Enter password:',
    validate: (value) => (value.length > 0 ? true : 'Password is required'),
  });

  if (!password) {
    console.log('❌ Operation cancelled');
    process.exit(0);
  }

  // Build connection string
  const connectionString = `mongodb+srv://demo-${projectId}:${password}@production.1zpny.mongodb.net/demo-${projectId}?retryWrites=true&w=majority`;

  console.log('\n📡 Connecting to MongoDB...');
  const client = new MongoClient(connectionString);

  try {
    await client.connect();
    console.log('✅ Connected successfully\n');

    const db = client.db(`demo-${projectId}`);

    // Get all collections with their document counts
    const collections = await getAllCollectionsWithCounts(db);

    if (collections.length === 0) {
      console.log('ℹ️  No collections found in database');
      return;
    }

    // Display all collections in a formatted table
    console.log('📊 Collections in database:\n');
    console.log('   Collection Name                    Documents');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    let totalDocuments = 0;
    for (const col of collections) {
      const paddedName = col.name.padEnd(35);
      const paddedCount = col.count.toString().padStart(6);
      console.log(`   ${paddedName}${paddedCount}`);
      totalDocuments += col.count;
    }

    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const paddedTotal = 'Total:'.padEnd(35);
    const paddedTotalCount = totalDocuments.toString().padStart(6);
    console.log(`   ${paddedTotal}${paddedTotalCount}\n`);

    // Single confirmation to delete all collections
    const { confirmDelete } = await prompts({
      type: 'confirm',
      name: 'confirmDelete',
      message: `Delete all ${collections.length} collection(s) with ${totalDocuments} total document(s)?`,
      initial: false,
    });

    if (confirmDelete) {
      // Delete all collections
      await deleteAllCollections(db, collections);
      console.log('\n✅ Collections deleted successfully!');
    } else {
      console.log('\n⏭️  Skipped collection deletion');
    }

    console.log('\n✨ Database operations completed!');
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

async function getAllCollectionsWithCounts(db: any) {
  const collectionsList = await db.listCollections().toArray();
  const collections = [];

  for (const col of collectionsList) {
    const collection = db.collection(col.name);
    const count = await collection.countDocuments();
    collections.push({ name: col.name, count });
  }

  return collections;
}

async function deleteAllCollections(
  db: any,
  collections: { name: string; count: number }[]
) {
  console.log('\n🗑️  Deleting collections...\n');

  for (const col of collections) {
    try {
      await db.collection(col.name).drop();
      console.log(`   ✅ Deleted collection: ${col.name} (${col.count} document(s))`);
    } catch (error) {
      console.error(
        `   ❌ Failed to delete ${col.name}:`,
        error instanceof Error ? error.message : error
      );
    }
  }
}

function generateAzureSearchUrls(projectId: string) {
  return AZURE_SEARCH_SERVICES.map((service) => ({
    ...service,
    url: service.url.replace('PROJECT_ID', projectId),
  }));
}

async function displayAzureSearchCleanupInstructions(projectId: string) {
  console.log('\n🔍 Azure AI Search Index Cleanup');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\nTo complete the cleanup, delete the Azure AI Search index:\n`);
  console.log(`   Index name: bubble-demo-${projectId}\n`);
  console.log('   The index could be in one of these search services:');
  console.log('   (Click the correct link - Ctrl+Click or Cmd+Click)\n');

  const searchUrls = generateAzureSearchUrls(projectId);
  searchUrls.forEach((service, index) => {
    console.log(`   ${index + 1}. ${service.name} (${service.sku}):`);
    console.log(`      ${service.url}\n`);
  });

  console.log('   Instructions:');
  console.log('   1. Click one of the links above to open Azure Portal');
  console.log('   2. If the index exists, click the "Delete" button');
  console.log('   3. If not found, try the next link');
  console.log('   4. Confirm the deletion when found\n');

  const { confirmed } = await prompts({
    type: 'confirm',
    name: 'confirmed',
    message: 'Have you completed the Azure AI Search index cleanup?',
    initial: false,
  });

  if (confirmed) {
    console.log('   ✅ Azure AI Search index cleanup confirmed\n');
  } else {
    console.log('   ⚠️  Please complete the Azure AI Search index cleanup manually\n');
  }
}

async function restartKubernetesDeployment(projectId: string) {
  const namespace = `bubble-demo-${projectId}-chatbot`;

  console.log('\n🔄 Kubernetes Chatbot Restart');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\nNamespace: ${namespace}\n`);

  const { confirm } = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: 'Do you want to restart the Kubernetes deployment now?',
    initial: true,
  });

  if (!confirm) {
    console.log('\n   ⏭️  Skipped Kubernetes restart');
    console.log('   ℹ️  To restart manually later, use:\n');
    console.log(`   kubectl rollout restart deployment -n ${namespace}\n`);
    console.log('   Or use Lens:');
    console.log(`   1. Select namespace: ${namespace}`);
    console.log('   2. Navigate to Workloads > Deployments');
    console.log('   3. Right-click the deployment and select "Restart"\n');
    return;
  }

  console.log(`\n   Executing: kubectl rollout restart deployment -n ${namespace}`);

  try {
    // Execute rollout restart
    const { execSync } = await import('child_process');

    execSync(`kubectl rollout restart deployment -n ${namespace}`, {
      stdio: 'inherit',
    });

    console.log(`\n   Waiting for rollout to complete...`);

    // Wait for rollout status
    execSync(`kubectl rollout status deployment -n ${namespace}`, {
      stdio: 'inherit',
    });

    console.log('\n   ✅ Deployment restarted successfully!');
    console.log('   The chatbot is now running with fresh data.\n');
  } catch (error) {
    console.error('\n   ⚠️  Failed to restart deployment automatically');
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}\n`);
    }
    console.log('   Please restart manually using Lens:\n');
    console.log('   1. Open Lens');
    console.log(`   2. Select namespace: ${namespace}`);
    console.log('   3. Navigate to Workloads > Deployments');
    console.log('   4. Right-click the deployment and select "Restart"');
    console.log('   5. Wait for the new pods to be ready\n');
  }
}

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n\n❌ Operation cancelled by user');
  process.exit(0);
});

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
