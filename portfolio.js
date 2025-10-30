// --- JavaScript for Glitch & Datastream Portfolio ---

window.onload = function() {
    const introPrompt = document.getElementById('intro-prompt');
    const introWrap = document.getElementById('intro-wrap');
    const loadingProgress = document.getElementById('loading-progress');
    const mainContent = document.getElementById('main-content');
    const buttons = document.querySelectorAll('.button');
    const sections = document.querySelectorAll('.content-section');
    const datastreamBg = document.getElementById('datastream-bg');

    // --- Enhanced Datastream (matrix rain) ---
    function createDatastream() {
        // clear any previous
        datastreamBg.innerHTML = '';
        const cols = Math.floor(window.innerWidth / 20);
        const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < cols; i++) {
            const col = document.createElement('div');
            col.className = 'ds-col';
            col.style.position = 'absolute';
            col.style.left = (i * 20) + 'px';
            col.style.top = (Math.random() * -1000) + 'px';
            col.style.width = '20px';
            col.style.pointerEvents = 'none';
            // create chain of characters
            const len = 12 + Math.floor(Math.random() * 20);
            for (let j = 0; j < len; j++) {
                const span = document.createElement('div');
                span.textContent = chars.charAt(Math.floor(Math.random() * chars.length));
                span.style.color = j === 0 ? 'rgba(180,255,190,1)' : 'rgba(52,255,74,' + (0.02 + Math.random() * 0.3) + ')';
                span.style.fontFamily = "'Space Mono', monospace";
                span.style.fontSize = '14px';
                span.style.lineHeight = '14px';
                col.appendChild(span);
            }
            datastreamBg.appendChild(col);
            // animate column
            (function(c){
                const duration = 6000 + Math.random() * 8000;
                c.animate([
                    { transform: `translateY(${ -200 - Math.random()*800 }px)`},
                    { transform: `translateY(${ window.innerHeight + Math.random()*200 }px)`}
                ], { duration: duration, iterations: Infinity, delay: Math.random()*-duration });
            })(col);
        }
    }
    createDatastream();
    window.addEventListener('resize', () => { createDatastream(); });

    // ---------- Animated Intro sequence ----------
    function animateIntroSequence() {
        // add subtle pulse
        introWrap.classList.add('pulse');
        // start occasional glitch + flicker
        function randomGlitch() {
            introPrompt.classList.add('animate');
            setTimeout(()=> introPrompt.classList.remove('animate'), 250 + Math.random()*300);
            if (Math.random() < 0.25) {
                introPrompt.classList.add('flicker');
                setTimeout(()=> introPrompt.classList.remove('flicker'), 500);
            }
        }
        // type/appear effect by fading letters in (simple approach)
        const text = introPrompt.getAttribute('data-text') || introPrompt.textContent;
        introPrompt.textContent = '';
        const chars = text.split('');
        chars.forEach((ch, idx) => {
            const s = document.createElement('span');
            s.textContent = ch;
            s.style.opacity = '0';
            s.style.transition = 'opacity .12s linear';
            introPrompt.appendChild(s);
            setTimeout(()=> s.style.opacity = '1', 120 * idx + 200);
        });

        // loading progress simulation
        let progress = 0;
        const progTimer = setInterval(() => {
            // accelerate then slow near the end
            progress += 1 + Math.floor(Math.random()*3);
            if (progress > 98) progress = 98;
            loadingProgress.style.width = progress + '%';
            if (Math.random() < 0.18) randomGlitch();
        }, 90);

        // finalize after a short delay
        setTimeout(() => {
            clearInterval(progTimer);
            // finish bar
            loadingProgress.style.width = '100%';
            // final flourish
            introPrompt.classList.add('animate');
            setTimeout(()=> introPrompt.classList.remove('animate'), 600);
            setTimeout(() => {
                // hide intro and reveal main content
                introWrap.style.transition = 'opacity .6s ease, transform .6s ease';
                introWrap.style.opacity = '0';
                introWrap.style.transform = 'scale(.98) translateY(-8px)';
                setTimeout(() => {
                    introWrap.style.display = 'none';
                    mainContent.classList.remove('hidden');
                    // ensure first section is reset (optional)
                    const firstSection = document.querySelector('.content-section');
                    if (firstSection) firstSection.classList.add('hidden');
                }, 600);
            }, 700);
        }, 2400); // total intro length ~2.4s before finalization
    }

    // Start the animated intro (replace previous fixed timeout)
    animateIntroSequence();

    // Button click handler
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            if (targetId === 'home') {
                // Reset to home view
                mainContent.classList.add('hidden');
                if (introWrap) { introWrap.style.display = 'flex'; introWrap.style.opacity = '1'; }
            } else {
                // Show the selected section
                sections.forEach(section => {
                    if (section.id === targetId) {
                        section.classList.remove('hidden');
                        section.classList.add('active');
                        // ensure internal scroll container (decoded-text) is at top
                        const inner = section.querySelector('.decoded-text');
                        if (inner) inner.scrollTop = 0;
                        // smooth scroll section into view
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
