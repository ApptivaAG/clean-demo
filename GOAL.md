# Clean Demo Chatbot

A CLI tool to clean up demo chatbot data, including MongoDB collections, Azure AI Search indexes, and Kubernetes deployment restart.

The script can be called with `nix run github:ApptivaAG/clean-demo` from any PC running Nix.

The script prompts for:
- Project ID (e.g., `kd6zk2`)
- Password (for MongoDB connection)

Connection string format: `mongodb+srv://demo-{projectId}:{password}@production.1zpny.mongodb.net/demo-{projectId}?retryWrites=true&w=majority`

The script should perform the following operations:

## 1. MongoDB Cleanup
- Delete ALL collections found in the database
- Show a summary of all collections with document counts
- Ask the user for a single confirmation before deleting all collections

## 2. Azure AI Search Index Cleanup
- Display clickable links to the Azure Portal for deleting the Azure AI Search index
- The index name follows the pattern: `bubble-demo-{projectId}`
- The index could be in one of three Azure AI Search services:
  1. bubble-chat-ai-search-s1 (standard)
  2. bubble-chat-ai-search-s1-2 (standard)
  3. bubble-chat-ai-search-basic-demo (basic)
- Provide instructions for manually deleting the index
- Ask for confirmation that the Azure AI Search cleanup is complete

## 3. Kubernetes Deployment Restart
- Ask for confirmation to restart the Kubernetes deployment
- The namespace follows the pattern: `bubble-demo-{projectId}-chatbot`
- Execute `kubectl rollout restart deployment -n bubble-demo-{projectId}-chatbot`
- Wait for the rollout to complete
- If the automated restart fails, provide instructions for manual restart using Lens or kubectl
