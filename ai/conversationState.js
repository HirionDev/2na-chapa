const conversationStates = new Map();

const getConversationState = (from) => {
  return conversationStates.get(from) || {};
};

const setConversationState = (from, state) => {
  conversationStates.set(from, state);
};

module.exports = { getConversationState, setConversationState };