# Clean Demo Chatbot

A CLI tool to clean up demo chatbot MongoDB collections.

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
6. Delete all documents from `conversations` and `trainingtasks`
7. Reset `chatbots` collection with default values

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
- **chatbots**: All documents will be updated with default name and introduction

## Error Handling

The script will stop and display an error message if:
- Connection to MongoDB fails
- Any database operation fails
- User cancels the operation (Ctrl+C)
