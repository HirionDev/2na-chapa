const connectWebSocket = (onMessage) => {
  const ws = new WebSocket('ws://localhost:3001');

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    onMessage(message);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');
  };

  return () => ws.close();
};

export { connectWebSocket };