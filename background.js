chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'get-api-key') {
    chrome.storage.sync.get('openaiApiKey', data => {
      sendResponse({ apiKey: data.openaiApiKey });
    });
    return true; // Keep the message channel open for async response
  }

  if (message.action === 'get-settings') {
    chrome.storage.sync.get('openai', data => {
      sendResponse(data);
    });
    return true; // Keep the message channel open for async response
  }
});
