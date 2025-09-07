// --- JavaScript for Glitch & Datastream Portfolio ---

window.onload = function() {
    const introPrompt = document.getElementById('intro-prompt');
    const mainContent = document.getElementById('main-content');
    const buttons = document.querySelectorAll('.button');
    const sections = document.querySelectorAll('.content-section');
    const datastreamBg = document.getElementById('datastream-bg');

    // --- Datastream effect ---
    function createDatastream() {
        const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < 50; i++) {
            const span = document.createElement('span');
            span.textContent = chars[Math.floor(Math.random() * chars.length)];
            span.style.left = `${Math.random() * 100}vw`;
            span.style.animationDelay = `${Math.random() * 5}s`;
            span.style.animationDuration = `${5 + Math.random() * 5}s`;
            datastreamBg.appendChild(span);
        }
    }
    createDatastream();

    // Initial delay before showing main content
    setTimeout(() => {
        introPrompt.style.display = 'none';
        mainContent.classList.remove('hidden');
    }, 3000); // 3 seconds for the "glitch" to finish

    // Button click handler
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            if (targetId === 'home') {
                // Reset to home view
                mainContent.classList.add('hidden');
                introPrompt.style.display = 'block';
            } else {
                // Show the selected section
                sections.forEach(section => {
                    if (section.id === targetId) {
                        section.classList.remove('hidden');
                        section.classList.add('active');
                    } else {
                        section.classList.add('hidden');
                        section.classList.remove('active');
                    }
                });
            }
        });
    });

    // --- Gemini API Integration for Bio Refiner ---
    const generateBtn = document.getElementById('generate-bio-btn');
    const bioInput = document.getElementById('bio-input');
    const loadingSpinner = document.getElementById('loading-spinner');
    const generatedBioOutput = document.getElementById('generated-bio-output');

    generateBtn.addEventListener('click', async () => {
        const userBioDraft = bioInput.value.trim();
        if (userBioDraft === '') {
            generatedBioOutput.textContent = "Error: Please enter a bio draft to refine.";
            generatedBioOutput.classList.remove('hidden');
            return;
        }

        loadingSpinner.classList.remove('hidden');
        generatedBioOutput.classList.add('hidden');
        generateBtn.disabled = true;

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${''}`;
        const systemPrompt = "You are a professional career coach and writer. Refine and expand the user's bio to make it more professional, engaging, and suitable for a software engineering portfolio.";

        const payload = {
            contents: [{ parts: [{ text: userBioDraft }] }],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            
            const generatedText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (generatedText) {
                generatedBioOutput.textContent = generatedText;
            } else {
                generatedBioOutput.textContent = "Error: Could not generate bio. Please try again.";
            }
        } catch (error) {
            console.error('API call failed:', error);
            generatedBioOutput.textContent = "Error: Failed to connect to the generator. Please check your network.";
        } finally {
            loadingSpinner.classList.add('hidden');
            generatedBioOutput.classList.remove('hidden');
            generateBtn.disabled = false;
        }
    });
};
