document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKeyInput');
  const queryStringInput = document.getElementById('queryStringInput');
  const status = document.getElementById('status');
  const saveBtn = document.getElementById('saveKey');

  // Load settings
  chrome.storage.sync.get(['openai'], (result) => {
    queryStringInput.value = (result.openai && result.openai.queryString) ? result.openai.queryString : "Act as copywriter, HR senior or headhunter advisor focused to help to improve candidate information in his own name. Candidate skills {skills} and item name to fill {name}. Don\'t enter concrete skills (they are only available for you to better understand the person). Improve content to make it more interesting and return it as plain text. Focus to the most innovate or most interesting areas for example AI, automation and others depends of candidate skills. Generate 3 variants.";
  });

  // Save settings
  saveBtn.addEventListener('click', () => {
    const key = (""+apiKeyInput.value).trim();
    const query = queryStringInput.value;
    const data = {openai: {queryString: query}};
    if(key) data.openai.apiKey = key;
    chrome.storage.sync.set(data, () => {
      status.textContent = 'API configuration saved.';
      setTimeout(() => (status.textContent = ''), 2000);
    });
  });
});