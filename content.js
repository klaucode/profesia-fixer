(() => {

    function replacePlaceholders(str, replacements) {
        return str.replace(/\{(\w+)\}/g, (_, match) =>
            replacements.hasOwnProperty(match) ? replacements[match] : `{${match}}`
        );
    }

    function getSettings() {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ action: 'get-settings' }, response => {
                if (chrome.runtime.lastError || !response?.openai) {
                    return reject('Settings not saved yet or missing.');
                }
                resolve(response.openai);
            });
        });
    }

    function initiateBtnBack() {
        const cvDetailEl = document.querySelector(".cv-detail .cv-action-bar-content .tabs");
        if (!cvDetailEl) return;
        const backBtn = document.createElement("button");
        backBtn.setAttribute("type", "button");
        backBtn.setAttribute("class", "btn btn-ghost-secondary");
        backBtn.innerText = "< Back"
        backBtn.onclick = (e) => {
            e.preventDefault();
            window.location = "https://profesia.sk/user_details.php";
        }
        cvDetailEl.prepend(backBtn);
    }

    async function sendToOpenAI(inputText, name = "unknown", skills = []) {
        const settings = await getSettings();
        const replacements = {
            name,
            skills: skills.join(", ")
        }
        const contentString = replacePlaceholders(settings.queryString ? settings.queryString : 'Write message: "Missing query, check extension configuration!"', replacements);
        const reqData = {
            model: 'gpt-4',
            messages: [
                { role: 'system', content: contentString },
                { role: 'user', content: inputText }
            ],
            temperature: 0.7
        };
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${settings.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reqData)
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.choices[0].message.content.trim();
    }

    function initiateBtnOpenAI() {
        // There is used shadowRoot :-O
        const sr = document.querySelector("cv-additional-sections")?.shadowRoot;
        if (!sr) return;
        sr.querySelectorAll('textarea').forEach(textarea => {
            if (textarea.getAttribute("aria-hidden") === "true") return; // Ignore hidden textareas
            if (textarea.classList?.contains('ex-openai')) return; // Ignore already processed textareas
            textarea.classList.add("ex-openai");
            const button = document.createElement('button');
            button.textContent = '💡 Improve with AI';
            button.className = 'gpt-enhance-btn';
            button.style.marginLeft = '10px';

            button.addEventListener('click', async (e) => {
                e.preventDefault();
                const originalText = textarea.value;
                const fieldName = "CV additionalInfo";
                const userSkills = [];
                document.querySelectorAll(".listing-with-buttons .skill-item-name").forEach(el => {
                    if (el.innerText) userSkills.push(el.innerText);
                })
                button.textContent = 'Improving...';
                try {
                    const improved = await sendToOpenAI(originalText, fieldName, userSkills);
                    textarea.value = improved;
                } catch (err) {
                    console.error(err);
                    alert('Failed to improve text.');
                }
                button.textContent = '💡 Improve with AI';
            });
            textarea.parentNode.insertBefore(button, textarea.nextSibling);
        });
    }


    setTimeout(() => {
        initiateBtnBack();
        window.onclick = () => {
            initiateBtnOpenAI();
        }
    }, 250);
})();
