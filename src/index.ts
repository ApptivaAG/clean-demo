#!/usr/bin/env node

import { MongoClient } from 'mongodb';
import prompts from 'prompts';

const RESET_CHATBOT_DATA = {
  name: 'Demo Chatbot',
  introduction:
    '- Du bist ein KI-basierter Chatbot der Musterorganisation.\n' +
    '- Du hilfst bei Fragen rund um die Dienstleistungen der Musterorganisation.',
};

async function main() {
  console.log('🧹 Demo Chatbot Cleanup Tool\n');

  // Prompt for project ID and password
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

    // Process conversations collection
    await deleteCollection(db, 'conversations');

    // Process trainingtasks collection
    await deleteCollection(db, 'trainingtasks');

    // Process settings collection
    await deleteCollection(db, 'knowledgebases');

    // Process settings collection
    await deleteCollection(db, 'knowledgebasedocuments');

    // Process settings collection
    await deleteCollection(db, 'settings');

    // Process users collection
    await deleteCollection(db, 'users');

    // Process chatbots collection (reset)
    await resetChatbotsCollection(db);

    console.log('\n✨ All operations completed successfully!');
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

async function deleteCollection(db: any, collectionName: string) {
  console.log(`\n📊 Collection: ${collectionName}`);

  const collection = db.collection(collectionName);
  const count = await collection.countDocuments();

  console.log(`   Documents: ${count}`);

  if (count === 0) {
    console.log('   ℹ️  Collection is already empty, skipping...');
    return;
  }

  const { confirm } = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: `Delete all ${count} document(s) from ${collectionName}?`,
    initial: false,
  });

  if (!confirm) {
    console.log(`   ⏭️  Skipped ${collectionName}`);
    return;
  }

  const result = await collection.deleteMany({});
  console.log(`   ✅ Deleted ${result.deletedCount} document(s)`);
}

async function resetChatbotsCollection(db: any) {
  console.log(`\n📊 Collection: chatbots`);

  const collection = db.collection('chatbots');
  const count = await collection.countDocuments();

  console.log(`   Documents: ${count}`);

  const { confirm } = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: `Reset chatbots collection (update all documents with default values)?`,
    initial: false,
  });

  if (!confirm) {
    console.log(`   ⏭️  Skipped chatbots`);
    return;
  }

  const result = await collection.updateMany({}, { $set: RESET_CHATBOT_DATA });
  console.log(`   ✅ Updated ${result.modifiedCount} document(s)`);
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
