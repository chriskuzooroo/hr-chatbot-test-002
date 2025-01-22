document.getElementById('sendButton').addEventListener('click', async () => {
  const userMessage = document.getElementById('userMessage').value;
  const responseDiv = document.getElementById('response');

  // Clear the previous response
  responseDiv.textContent = 'Loading...';

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userMessage }),
    });

    const data = await res.json();
    if (data.assistantMessage) {
      responseDiv.textContent = data.assistantMessage;
    } else {
      responseDiv.textContent = 'No response received.';
    }
  } catch (error) {
    console.error(error);
    responseDiv.textContent = 'Error: Unable to communicate with the server.';
  }
});
