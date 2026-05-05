i want a script that can clean up a demo-chatbot. it contains mongodb 4 collections where the content should be deleted. the connection string looks something like this:
mongodb+srv://demo-kd6zk2:XXXXX@production.1zpny.mongodb.net/demo-kd6zk2?retryWrites=true&w=majority. the screept should ask for the project "kd6zk2" and the
password.

I want that the script can be called with nix run github:ApptivaAG/clean-demo from any pc running nix.

the script should delete the content of the following collections:

- conversations
- trainingtasks

On the following it should reset the collection:

- chatbots
  { name: 'Demo Chatbot', introduction: '- Du bist ein KI-basierter Chatbot der Musterorganisation' +
      '- Du hilfst bei Fragen rund um die Dienstleistungen der Musterorganisation.'}

Before deleting or reseting always show a summary of the data in a collection and ask the user to confirm.
