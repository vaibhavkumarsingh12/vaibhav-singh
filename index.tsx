/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Check for browser support
if (!('speechSynthesis' in window)) {
    alert('Sorry, your browser does not support text-to-speech!');
} else {
    const textToSpeak = document.getElementById('text-to-speak') as HTMLTextAreaElement;
    const voiceSelect = document.getElementById('voice-select') as HTMLSelectElement;
    const narrateButton = document.getElementById('narrate-button') as HTMLButtonElement;
    
    // Voice control sliders and value displays
    const rateSlider = document.getElementById('rate') as HTMLInputElement;
    const rateValue = document.getElementById('rate-value') as HTMLSpanElement;
    const pitchSlider = document.getElementById('pitch') as HTMLInputElement;
    const pitchValue = document.getElementById('pitch-value') as HTMLSpanElement;
    const volumeSlider = document.getElementById('volume') as HTMLInputElement;
    const volumeValue = document.getElementById('volume-value') as HTMLSpanElement;


    let voices: SpeechSynthesisVoice[] = [];

    const populateVoiceList = () => {
        voices = speechSynthesis.getVoices();
        const selectedVoiceName = voiceSelect.value;
        voiceSelect.innerHTML = '';
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.textContent = `${voice.name} (${voice.lang})`;
            option.setAttribute('data-lang', voice.lang);
            option.setAttribute('data-name', voice.name);
            option.value = voice.name;
            voiceSelect.appendChild(option);
        });

        // Try to re-select the previously selected voice.
        if (voices.some(voice => voice.name === selectedVoiceName)) {
            voiceSelect.value = selectedVoiceName;
        }
    };

    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }

    // When the page is reloaded, if speech is still active, reset the state.
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }

    const speak = () => {
        // If speaking, cancel speech and update UI.
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
            return; // The 'onend' event handler will reset the button text.
        }

        // If not speaking, start synthesis.
        if (textToSpeak.value.trim() !== '') {
            const utterance = new SpeechSynthesisUtterance(textToSpeak.value);
            
            // Get the selected voice from the dropdown
            const selectedVoice = voices.find(voice => voice.name === voiceSelect.value);
            
            if(selectedVoice) {
                utterance.voice = selectedVoice;
            }

            // Set voice properties from sliders
            utterance.rate = parseFloat(rateSlider.value);
            utterance.pitch = parseFloat(pitchSlider.value);
            utterance.volume = parseFloat(volumeSlider.value);


            utterance.onstart = () => {
                narrateButton.textContent = 'Stop';
                narrateButton.setAttribute('aria-label', 'Stop narration');
            };

            utterance.onend = () => {
                // This is called when speech finishes naturally or is cancelled.
                narrateButton.textContent = 'Narrate';
                narrateButton.setAttribute('aria-label', 'Narrate the text');
            };

            utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
                console.error('Speech synthesis error:', event.error);
                // Also reset the button text on error.
                narrateButton.textContent = 'Narrate';
                narrateButton.setAttribute('aria-label', 'Narrate the text');
            };

            speechSynthesis.speak(utterance);
        }
    };

    narrateButton.addEventListener('click', speak);

    // Also cancel speech synthesis when the user navigates away
    window.addEventListener('beforeunload', () => {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
    });

    // Add event listeners to update slider value displays
    rateSlider.addEventListener('input', () => {
        rateValue.textContent = rateSlider.value;
    });

    pitchSlider.addEventListener('input', () => {
        pitchValue.textContent = pitchSlider.value;
    });

    volumeSlider.addEventListener('input', () => {
        volumeValue.textContent = volumeSlider.value;
    });
}