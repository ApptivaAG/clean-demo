# Clean Demo Chatbot

A CLI tool to clean up demo chatbot MongoDB collections and provide Azure AI Search index deletion link.

## Usage

Run directly with Nix (no installation needed):

```bash
nix run github:ApptivaAG/clean-demo
```

The script will:
1. Ask for your project ID (e.g., `kd6zk2`)
2. Ask for your password (hidden input)
3. Connect to the MongoDB database
4. Show document count for each collection
5. Ask for confirmation before each operation
6. Delete all documents from collections: `conversations`, `trainingtasks`, `knowledgebases`, `knowledgebasedocuments`, `settings`, `users`
7. Reset `chatbots` collection with default values
8. Display clickable links to delete the Azure AI Search index in Azure Portal
9. Ask for confirmation that the Azure AI Search cleanup is complete
10. Ask for confirmation to restart the Kubernetes deployment
11. Execute `kubectl rollout restart deployment` and wait for completion

## Development

Enter the development environment:

```bash
nix develop
```

Install dependencies:

```bash
npm install
```

Build the project:

```bash
npm run build
```

Run locally:

```bash
npm start
```

## Collections

- **conversations**: All documents will be deleted
- **trainingtasks**: All documents will be deleted
- **knowledgebases**: All documents will be deleted
- **knowledgebasedocuments**: All documents will be deleted
- **settings**: All documents will be deleted
- **users**: All documents will be deleted
- **chatbots**: All documents will be updated with default name and introduction

## Azure AI Search Index

After the MongoDB cleanup completes, the script will display clickable links to the Azure Portal where you can manually delete the Azure AI Search index for the project. The index name follows the pattern: `bubble-demo-{projectId}`

The index could be located in one of three Azure AI Search services:
1. **bubble-chat-ai-search-s1** (standard)
2. **bubble-chat-ai-search-basic-demo** (basic)
3. **bubble-chat-ai-search-s1-2** (standard)

To delete the index:
1. Ctrl+Click (or Cmd+Click on Mac) one of the displayed links to open Azure Portal
2. If the index exists in that service, click the "Delete" button and confirm
3. If the index is not found, try the next link
4. Continue until you find and delete the correct index
5. Confirm in the script that you've completed the cleanup

## Kubernetes Restart

After completing all cleanup steps, the script will automatically restart the Kubernetes deployment.

The namespace follows the pattern: `bubble-demo-{projectId}-chatbot`

### Automated Restart (Default)

The script will:
1. Ask for confirmation to restart the deployment
2. Execute `kubectl rollout restart deployment -n bubble-demo-{projectId}-chatbot`
3. Wait for the rollout to complete
4. Display success message when the chatbot is running with fresh data

### Manual Restart (If Automated Fails)

If the automated restart fails (e.g., kubectl not configured, insufficient permissions), you can restart manually:

**Using Lens (Kubernetes IDE):**
1. Open Lens
2. Select the namespace: `bubble-demo-{projectId}-chatbot`
3. Navigate to Workloads > Deployments
4. Right-click the deployment and select "Restart"
5. Wait for the new pods to be ready

**Using kubectl:**
```bash
kubectl rollout restart deployment -n bubble-demo-{projectId}-chatbot
```

For example, for project `kd6zk2`:
```bash
kubectl rollout restart deployment -n bubble-demo-kd6zk2-chatbot
```

## Requirements

- **kubectl**: Required for automated Kubernetes deployment restart. Included automatically when running via Nix.
- **Kubernetes access**: You must have permissions to restart deployments in the target namespace.

## Error Handling

The script will stop and display an error message if:
- Connection to MongoDB fails
- Any database operation fails
- User cancels the operation (Ctrl+C)
