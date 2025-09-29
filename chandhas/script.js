document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sanskrit animations
    initializeSanskritAnimations();
    
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to current button and content
            btn.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Image upload functionality
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const previewImage = document.getElementById('preview-image');
    const removeImageBtn = document.getElementById('remove-image-btn');
    const analyzeImageBtn = document.getElementById('analyze-image-btn');

    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-color)';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--border-color)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--border-color)';
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect();
        }
    });

    fileInput.addEventListener('change', handleFileSelect);

    function handleFileSelect() {
        if (fileInput.files.length === 0) return;
        
        const file = fileInput.files[0];
        // Validate file type with more specific checks
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/tiff'];
        if (!validTypes.includes(file.type)) {
            alert('Please select a valid image file (JPEG, PNG, GIF, WEBP, or TIFF)');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            uploadArea.style.display = 'none';
            previewContainer.hidden = false;
            analyzeImageBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    removeImageBtn.addEventListener('click', () => {
        fileInput.value = '';
        previewImage.src = '';
        previewContainer.hidden = true;
        uploadArea.style.display = 'flex';
        analyzeImageBtn.disabled = true;
    });

    // Sample texts data
    const sampleTexts = {
        'गायत्री मंत्र': 'ॐ भूर्भुवः स्वः\nतत्सवितुर्वरेण्यं\nभर्गो देवस्य धीमहि\nधियो यो नः प्रचोदयात्',
        'रामायण श्लोक': 'वाल्मीकिर्नाम मुनिराजः\nकृतवान् रामायणं महत्\nतस्य शिष्यो भवान् रामः\nसर्वशास्त्रविशारदः',
        'भगवद्गीता श्लोक': 'धर्मक्षेत्रे कुरुक्षेत्रे\nसमवेता युयुत्सवः\nमामकाः पाण्डवाश्चैव\nकिमकुर्वत सञ्जय',
        'वैदिक मंत्र': 'अग्निमीळे पुरोहितं\nयज्ञस्य देवं ऋत्विजं\nहोतारं रत्नधातमं',
        'Test Simple': 'अ आ इ ई उ ऊ ऋ ॠ ऌ ॡ ए ऐ ओ औ'
    };

    // Sample text buttons
    const sampleBtns = document.querySelectorAll('.sample-btn');
    sampleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const textType = btn.getAttribute('data-text');
            const sampleText = sampleTexts[textType];
            if (sampleText) {
                sanskritText.value = sampleText;
                // Add visual feedback
                btn.style.background = 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))';
                btn.style.color = 'white';
                btn.style.transform = 'scale(0.95)';
                
                setTimeout(() => {
                    btn.style.background = '';
                    btn.style.color = '';
                    btn.style.transform = '';
                }, 200);
            }
        });
    });

    // Analyze buttons
    const analyzeTextBtn = document.getElementById('analyze-text-btn');
    const sanskritText = document.getElementById('sanskrit-text');
    const resultSection = document.getElementById('result-section');
    const loadingIndicator = document.getElementById('loading-indicator');
    const chandhasType = document.getElementById('chandhas-type');
    const patternDisplay = document.getElementById('pattern-display');
    const chandhasDetails = document.getElementById('chandhas-details');

    analyzeTextBtn.addEventListener('click', () => {
        const text = sanskritText.value.trim();
        if (!text) {
            showError('Please enter some Sanskrit text to analyze.');
            return;
        }
        
        // Clear previous results
        clearResults();
        analyzeText(text);
    });

    analyzeImageBtn.addEventListener('click', () => {
        loadingIndicator.style.display = 'flex';
        
        // Use Tesseract.js for OCR with improved Sanskrit recognition
        Tesseract.recognize(
            previewImage.src,
            'san+hin+eng', // Try Sanskrit, Hindi, and English for better recognition
            { 
                logger: m => console.log(m),
                // Improve OCR settings for Sanskrit text
                tessedit_char_whitelist: 'अआइईउऊऋॠऌॡएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहक्षत्रज्ञ०१२३४५६७८९ ।॥',
                preserve_interword_spaces: '1'
            }
        ).then(({ data: { text } }) => {
            loadingIndicator.style.display = 'none';
            if (text.trim()) {
                // Clean up the recognized text
                const cleanedText = cleanSanskritText(text.trim());
                analyzeText(cleanedText);
                
                // Show the recognized text to the user
                const recognizedTextArea = document.createElement('div');
                recognizedTextArea.className = 'recognized-text';
                recognizedTextArea.innerHTML = `<h4>Recognized Text:</h4><p>${cleanedText}</p>`;
                
                // Insert before the result section
                document.querySelector('.input-section').after(recognizedTextArea);
            } else {
                alert('Could not extract text from the image. Please try a clearer image or enter text manually.');
            }
        }).catch(err => {
            loadingIndicator.style.display = 'none';
            console.error(err);
            alert('Error processing the image. Please try again or enter text manually.');
        });
    });
    
    // Function to clean up recognized Sanskrit text
    function cleanSanskritText(text) {
        // Remove non-Sanskrit characters that might be misrecognized
        let cleaned = text.replace(/[^\u0900-\u097F\s।॥]/g, '');
        
        // Fix common OCR errors in Sanskrit
        const commonErrors = {
            'o': 'ो',
            'O': 'ओ',
            '0': '०',
            'l': 'ल',
            'I': 'इ'
            // Add more replacements as needed
        };
        
        for (const [error, correction] of Object.entries(commonErrors)) {
            cleaned = cleaned.replace(new RegExp(error, 'g'), correction);
        }
        
        return cleaned;
    }

    // Error handling functions
    function showError(message) {
        // Remove existing error messages
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <span>${message}</span>
            </div>
        `;
        
        // Insert error message before the input section
        const inputSection = document.querySelector('.input-section');
        inputSection.parentNode.insertBefore(errorDiv, inputSection);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.classList.add('fade-out');
                setTimeout(() => errorDiv.remove(), 500);
            }
        }, 5000);
    }

    function showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem; background-color: #d1fae5; color: #065f46; padding: 1rem; border-radius: var(--radius); border-left: 4px solid #10b981;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22,4 12,14.01 9,11.01"></polyline>
                </svg>
                <span>${message}</span>
            </div>
        `;
        
        const inputSection = document.querySelector('.input-section');
        inputSection.parentNode.insertBefore(successDiv, inputSection);
        
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.classList.add('fade-out');
                setTimeout(() => successDiv.remove(), 500);
            }
        }, 3000);
    }

    function clearResults() {
        resultSection.hidden = true;
        chandhasType.textContent = '-';
        patternDisplay.innerHTML = '-';
        chandhasDetails.textContent = '-';
        
        // Remove any existing recognized text display
        const recognizedText = document.querySelector('.recognized-text');
        if (recognizedText) {
            recognizedText.remove();
        }
    }

    function analyzeText(text) {
        loadingIndicator.style.display = 'flex';
        
        try {
            // Simulate processing delay (replace with actual algorithm)
            setTimeout(() => {
                try {
                    const result = identifyChandhas(text);
                    
                    if (!result || !result.pattern || result.pattern.length === 0) {
                        showError('Unable to analyze the text. Please check if it contains valid Sanskrit characters.');
                        loadingIndicator.style.display = 'none';
                        return;
                    }
                    
                    // Debug information
                    console.log('Analysis Result:', result);
                    console.log('Pattern:', result.pattern);
                    console.log('Total Syllables:', result.pattern.length);
                    
                    // Display results
                    chandhasType.textContent = result.type;
                    patternDisplay.innerHTML = formatPattern(result.pattern);
                    chandhasDetails.textContent = result.details;
                    
                    // Add confidence indicator if available
                    if (result.confidence) {
                        const confidenceIndicator = document.createElement('div');
                        confidenceIndicator.className = 'confidence-indicator';
                        confidenceIndicator.innerHTML = `
                            <span class="confidence-label">Confidence:</span>
                            <span class="confidence-value confidence-${result.confidence.toLowerCase()}">${result.confidence}</span>
                        `;
                        chandhasDetails.parentNode.appendChild(confidenceIndicator);
                    }
                    
                    resultSection.hidden = false;
                    loadingIndicator.style.display = 'none';
                    
                    // Show success message
                    showSuccess(`Successfully analyzed ${result.pattern.length} syllables.`);
                    
                    // Scroll to results
                    resultSection.scrollIntoView({ behavior: 'smooth' });
                } catch (error) {
                    console.error('Analysis error:', error);
                    showError('An error occurred during analysis. Please try again.');
                    loadingIndicator.style.display = 'none';
                }
            }, 1500);
        } catch (error) {
            console.error('Analysis error:', error);
            showError('An error occurred during analysis. Please try again.');
            loadingIndicator.style.display = 'none';
        }
    }

    // Chandhas identification algorithm
    function identifyChandhas(text) {
        // Clean the text - remove punctuation and normalize
        const cleanText = text.replace(/[।॥,;.!?]/g, '').trim();
        
        // Split into lines/verses
        const lines = cleanText.split(/\n+/).filter(line => line.trim().length > 0);
        
        // Identify syllables and mark as laghu (L) or guru (G)
        const pattern = analyzeSyllables(cleanText);
        
        // Count syllables per line/pada
        const syllablesPerLine = lines.map(line => countSyllables(line));
        
        // Determine Chandhas type based on pattern and syllable count
        const result = determineChandhasType(pattern, syllablesPerLine);
        
        return result;
    }

    function analyzeSyllables(text) {
        // Proper Sanskrit prosody rules for identifying laghu and guru syllables
        // Rules:
        // 1. Short vowels (अ, इ, उ, ऋ, ऌ) are laghu
        // 2. Long vowels (आ, ई, ऊ, ॠ, ॡ, ए, ऐ, ओ, औ) are guru
        // 3. A short vowel followed by a conjunct consonant becomes guru
        // 4. A short vowel followed by anusvara (ं) or visarga (ः) is guru
        // 5. A short vowel at the end of a word or followed by a single consonant is laghu
        
        const pattern = [];
        
        // Define vowel categories
        const shortVowels = ['अ', 'इ', 'उ', 'ऋ', 'ऌ'];
        const longVowels = ['आ', 'ई', 'ऊ', 'ॠ', 'ॡ', 'ए', 'ऐ', 'ओ', 'औ'];
        
        // Convert text to an array of characters for easier processing
        const chars = Array.from(text);
        let i = 0;
        
        while (i < chars.length) {
            const char = chars[i];
            let syllableWeight = null;
            let advanceBy = 1;
            
            // Skip whitespace and punctuation
            if (char === ' ' || char === '\n' || char === '\t' || char === '।' || char === '॥') {
                i++;
                continue;
            }
            
            // Check if it's a standalone vowel
            if (shortVowels.includes(char)) {
                // Check what follows the short vowel
                if (i + 1 < chars.length) {
                    const nextChar = chars[i + 1];
                    
                    // If followed by anusvara or visarga, it's guru
                    if (nextChar === 'ं' || nextChar === 'ः') {
                        syllableWeight = 'G';
                        advanceBy = 2;
                    }
                    // If followed by a consonant, check if it's conjunct
                    else if (isConsonant(nextChar)) {
                        // Check if there's another consonant after this one
                        if (i + 2 < chars.length && isConsonant(chars[i + 2])) {
                            syllableWeight = 'G'; // Conjunct consonant makes it guru
                            advanceBy = 3;
                        } else {
                            syllableWeight = 'L'; // Single consonant makes it laghu
                            advanceBy = 2;
                        }
                    } else {
                        syllableWeight = 'L'; // No consonant following
                    }
                } else {
                    syllableWeight = 'L'; // End of text
                }
            }
            else if (longVowels.includes(char)) {
                syllableWeight = 'G';
            }
            else if (isConsonant(char)) {
                // Consonant with implicit 'अ' vowel
                // Check if followed by vowel matra
                if (i + 1 < chars.length) {
                    const nextChar = chars[i + 1];
                    if (isVowelMatra(nextChar)) {
                        syllableWeight = getVowelMatraWeight(nextChar);
                        advanceBy = 2;
                    } else {
                        syllableWeight = 'L'; // Implicit 'अ' is laghu
                    }
                } else {
                    syllableWeight = 'L'; // End of text
                }
            }
            else {
                // Skip other characters
                i++;
                continue;
            }
            
            if (syllableWeight) {
                pattern.push(syllableWeight);
            }
            
            i += advanceBy;
        }
        
        return pattern;
    }
    
    function isVowelMatra(char) {
        const matras = ['ा', 'ि', 'ी', 'ु', 'ू', 'ृ', 'ॄ', 'ॢ', 'ॣ', 'े', 'ै', 'ो', 'ौ'];
        return matras.includes(char);
    }
    
    function getVowelMatraWeight(matra) {
        const matraWeights = {
            'ा': 'G', // aa
            'ि': 'L', // i
            'ी': 'G', // ii
            'ु': 'L', // u
            'ू': 'G', // uu
            'ृ': 'L', // ri
            'ॄ': 'G', // rii
            'ॢ': 'L', // li
            'ॣ': 'G', // lii
            'े': 'G', // e
            'ै': 'G', // ai
            'ो': 'G', // o
            'ौ': 'G'  // au
        };
        return matraWeights[matra] || 'L';
    }
    
    function isConsonant(char) {
        // Sanskrit consonants range in Unicode
        const code = char.charCodeAt(0);
        return (code >= 0x0915 && code <= 0x0939) || // क to ह
               (code >= 0x0958 && code <= 0x095F);   // क़ to य़
    }

    function countSyllables(line) {
        // Count syllables based on vowels and vowel matras
        const vowels = line.match(/[अआइईउऊऋॠऌॡएऐओऔ]/g) || [];
        const matras = line.match(/[ािीुूृॄॢॣेैोौं:]/g) || [];
        
        return vowels.length + matras.length;
    }

    function determineChandhasType(pattern, syllablesPerLine) {
        // Calculate total syllables and analyze structure
        const totalSyllables = pattern.length;
        
        // Define known Chandhas patterns with correct syllable counts
        const chandhasPatterns = {
            // Common Vedic meters with correct syllable counts
            'Gayatri': {
                syllablesPerPada: 8,
                totalSyllables: 24, // 3 padas of 8 syllables each
                details: "Gayatri has 8 syllables per pada, totaling 24 syllables. It's used in many Vedic hymns including the famous Gayatri mantra."
            },
            'Anushtup': {
                syllablesPerPada: 8,
                totalSyllables: 32, // 4 padas of 8 syllables each
                padaRules: {4: 'L', 5: 'G', 6: 'L'}, // 5th laghu, 6th guru, 7th laghu (0-indexed: 4, 5, 6)
                details: "Anushtup (Shloka) has 8 syllables per pada, totaling 32 syllables. The 5th syllable should be laghu, 6th guru, and 7th laghu in each pada. It's the most common meter in Sanskrit epics like Ramayana and Mahabharata."
            },
            'Trishtup': {
                syllablesPerPada: 11,
                totalSyllables: 44, // 4 padas of 11 syllables each
                details: "Trishtup has 11 syllables per pada, totaling 44 syllables. It's common in Vedic literature."
            },
            'Jagati': {
                syllablesPerPada: 12,
                totalSyllables: 48, // 4 padas of 12 syllables each
                details: "Jagati has 12 syllables per pada, totaling 48 syllables. It's often used for descriptive poetry."
            },
            'Brihati': {
                syllablesPerPada: 9,
                totalSyllables: 36, // 4 padas of 9 syllables each
                details: "Brihati has 9 syllables per pada, totaling 36 syllables."
            },
            'Pankti': {
                syllablesPerPada: 10,
                totalSyllables: 40, // 4 padas of 10 syllables each
                details: "Pankti has 10 syllables per pada, totaling 40 syllables."
            },
            'Ushnik': {
                syllablesPerPada: 7,
                totalSyllables: 28, // 4 padas of 7 syllables each
                details: "Ushnik has 7 syllables per pada, totaling 28 syllables."
            }
        };
        
        // Check for specific pattern matches first
        // For Anushtup (most common) - 32 syllables, 4 padas of 8 each
        if (totalSyllables >= 30 && totalSyllables <= 34) {
            // Check if the pattern matches Anushtup rules
            // In Anushtup, 5th syllable should be laghu, 6th guru, and 7th laghu
            let isAnushtup = true;
            let padaCount = 0;
            
            for (let i = 0; i < pattern.length; i += 8) {
                if (i + 7 < pattern.length) {
                    const pada = pattern.slice(i, i + 8);
                    // Check 5th, 6th, 7th positions (0-indexed: 4, 5, 6)
                    if (!(pada[4] === 'L' && pada[5] === 'G' && pada[6] === 'L')) {
                        isAnushtup = false;
                        break;
                    }
                    padaCount++;
                }
            }
            
            if (isAnushtup && padaCount === 4) {
                return {
                    type: "Anushtup (Shloka)",
                    pattern,
                    details: chandhasPatterns.Anushtup.details,
                    confidence: "High"
                };
            }
        }
        
        // If no specific pattern match, use syllable count
        for (const [type, info] of Object.entries(chandhasPatterns)) {
            const avgSyllablesPerPada = totalSyllables / (type === 'Gayatri' ? 3 : 4);
            const lowerBound = info.syllablesPerPada - 1;
            const upperBound = info.syllablesPerPada + 1;
            
            if (avgSyllablesPerPada >= lowerBound && avgSyllablesPerPada <= upperBound) {
                return {
                    type,
                    pattern,
                    details: info.details,
                    confidence: "Medium"
                };
            }
        }
        
        // If no match found
        return {
            type: "Unknown Pattern",
            pattern,
            details: `The pattern doesn't match common Chandas types. Total syllables: ${totalSyllables}. It might be a less common variety or require specialized analysis.`,
            confidence: "Low"
        };
    }

    function formatPattern(pattern) {
        // Format the pattern for display
        // L for laghu (short) and G for guru (long)
        
        let html = '';
        
        // Group pattern into padas (quarters) for better visualization
        const padas = [];
        const padaSize = Math.ceil(pattern.length / 4); // Assuming 4 padas
        
        for (let i = 0; i < pattern.length; i += padaSize) {
            padas.push(pattern.slice(i, i + padaSize));
        }
        
        // Display each pada on a new line
        padas.forEach((pada, padaIndex) => {
            html += `<div class="pada-row"><span class="pada-label">Pada ${padaIndex + 1}:</span> `;
            
            pada.forEach((syllable, i) => {
                const symbolClass = syllable === 'L' ? 'laghu' : 'guru';
                html += `<span class="${symbolClass}" title="${syllable === 'L' ? 'Laghu (Short)' : 'Guru (Long)'}">${syllable}</span>`;
            });
            
            html += '</div>';
        });
        
        // Add visual representation with symbols
        html += '<div class="visual-pattern">';
        pattern.forEach((syllable, i) => {
            // Add line break every padaSize syllables
            if (i > 0 && i % padaSize === 0) {
                html += '<br>';
            }
            
            // Use Unicode symbols: ⏑ for laghu (short) and — for guru (long)
            const symbol = syllable === 'L' ? '⏑' : '—';
            const symbolClass = syllable === 'L' ? 'laghu-symbol' : 'guru-symbol';
            
            html += `<span class="${symbolClass}">${symbol}</span>`;
        });
        html += '</div>';
        
        return html;
    }
    
    // Add CSS for enhanced pattern display
    const patternStyle = document.createElement('style');
    patternStyle.textContent = `
        .pada-row {
            margin-bottom: 10px;
            font-family: monospace;
            font-size: 1.1rem;
        }
        
        .pada-label {
            font-weight: bold;
            margin-right: 10px;
            color: var(--text-color);
        }
        
        .laghu, .guru {
            display: inline-block;
            width: 30px;
            height: 30px;
            line-height: 30px;
            text-align: center;
            margin: 0 2px;
            border-radius: 50%;
            font-weight: bold;
        }
        
        .laghu {
            background-color: rgba(79, 70, 229, 0.2);
            color: #4f46e5;
        }
        
        .guru {
            background-color: rgba(245, 158, 11, 0.2);
            color: #f59e0b;
        }
        
        .visual-pattern {
            margin-top: 15px;
            font-size: 1.5rem;
            letter-spacing: 5px;
            line-height: 1.8;
        }
        
        .laghu-symbol {
            color: #4f46e5;
        }
        
        .guru-symbol {
            color: #f59e0b;
        }
        
        .recognized-text {
            margin: 20px 0;
            padding: 15px;
            background-color: var(--card-bg);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
        }
        
        .recognized-text h4 {
            margin-bottom: 10px;
            color: var(--primary-color);
        }
    `;
    document.head.appendChild(patternStyle);

    // Add CSS for pattern display
    const style = document.createElement('style');
    style.textContent = `
        .laghu {
            color: #4f46e5;
            font-weight: bold;
        }
        .guru {
            color: #f59e0b;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);

    // Sanskrit Animation Functions
    function initializeSanskritAnimations() {
        createFloatingSanskritCharacters();
        createLotusEffect();
        addSanskritParticles();
        createConstellationEffect();
        addMorphingShapes();
    }

    function createFloatingSanskritCharacters() {
        const sanskritChars = ['ॐ', 'अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ॠ', 'ऌ', 'ॡ', 'ए', 'ऐ', 'ओ', 'औ'];
        const container = document.body;
        
        function createFloatingChar() {
            const char = document.createElement('div');
            char.textContent = sanskritChars[Math.floor(Math.random() * sanskritChars.length)];
            const size = Math.random() * 25 + 15;
            const opacity = Math.random() * 0.4 + 0.1;
            const duration = Math.random() * 12 + 18;
            const delay = Math.random() * 5;
            
            char.style.cssText = `
                position: fixed;
                font-size: ${size}px;
                color: rgba(30, 58, 138, ${opacity});
                pointer-events: none;
                z-index: -1;
                left: ${Math.random() * 100}vw;
                top: 100vh;
                animation: floatUp ${duration}s linear forwards;
                animation-delay: ${delay}s;
                font-family: serif;
                text-shadow: 0 0 15px rgba(30, 58, 138, 0.4);
                filter: blur(${Math.random() * 0.5}px);
            `;
            
            container.appendChild(char);
            
            setTimeout(() => {
                if (char.parentNode) {
                    char.parentNode.removeChild(char);
                }
            }, (duration + delay) * 1000);
        }
        
        // Create floating characters periodically
        setInterval(createFloatingChar, 2000);
        
        // Add CSS for floating animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatUp {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function createLotusEffect() {
        const container = document.body;
        
        function createLotus() {
            const lotus = document.createElement('div');
            lotus.innerHTML = '🪷';
            lotus.style.cssText = `
                position: fixed;
                font-size: ${Math.random() * 30 + 20}px;
                left: ${Math.random() * 100}vw;
                top: 100vh;
                animation: lotusFloat ${Math.random() * 8 + 12}s ease-in-out forwards;
                pointer-events: none;
                z-index: -1;
                opacity: 0.6;
            `;
            
            container.appendChild(lotus);
            
            setTimeout(() => {
                if (lotus.parentNode) {
                    lotus.parentNode.removeChild(lotus);
                }
            }, 20000);
        }
        
        setInterval(createLotus, 5000);
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes lotusFloat {
                0% {
                    transform: translateY(0) scale(0.5) rotate(0deg);
                    opacity: 0;
                }
                20% {
                    opacity: 0.8;
                }
                80% {
                    opacity: 0.8;
                }
                100% {
                    transform: translateY(-100vh) scale(1.2) rotate(180deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function addSanskritParticles() {
        const container = document.body;
        
        function createParticle() {
            const particle = document.createElement('div');
            const size = Math.random() * 6 + 2;
            const duration = Math.random() * 8 + 10;
            const colors = [
                'rgba(30, 58, 138, 0.8)',
                'rgba(14, 165, 233, 0.8)',
                'rgba(6, 182, 212, 0.8)'
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.style.cssText = `
                position: fixed;
                width: ${size}px;
                height: ${size}px;
                background: radial-gradient(circle, ${color}, transparent);
                border-radius: 50%;
                left: ${Math.random() * 100}vw;
                top: 100vh;
                animation: particleFloat ${duration}s linear forwards;
                pointer-events: none;
                z-index: -1;
                box-shadow: 0 0 15px ${color};
                filter: blur(${Math.random() * 1}px);
            `;
            
            container.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, duration * 1000);
        }
        
        function createWaveEffect() {
            const wave = document.createElement('div');
            wave.style.cssText = `
                position: fixed;
                width: 200px;
                height: 200px;
                border: 2px solid rgba(14, 165, 233, 0.3);
                border-radius: 50%;
                left: ${Math.random() * 100}vw;
                top: ${Math.random() * 100}vh;
                animation: waveExpand 4s ease-out forwards;
                pointer-events: none;
                z-index: -1;
            `;
            
            container.appendChild(wave);
            
            setTimeout(() => {
                if (wave.parentNode) {
                    wave.parentNode.removeChild(wave);
                }
            }, 4000);
        }
        
        setInterval(createParticle, 800);
        setInterval(createWaveEffect, 3000);
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes particleFloat {
                0% {
                    transform: translateY(0) scale(0) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                    transform: translateY(-10vh) scale(1) rotate(45deg);
                }
                50% {
                    transform: translateY(-50vh) scale(1.2) rotate(180deg);
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100vh) scale(0) rotate(360deg);
                    opacity: 0;
                }
            }
            
            @keyframes waveExpand {
                0% {
                    transform: scale(0);
                    opacity: 1;
                }
                50% {
                    opacity: 0.5;
                }
                100% {
                    transform: scale(3);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Add interactive Sanskrit character effects on hover
    function addInteractiveEffects() {
        const elements = document.querySelectorAll('.sample-btn, .primary-btn, .result-card');
        
        elements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                createSanskritBurst(element);
            });
        });
    }

    function createSanskritBurst(element) {
        const rect = element.getBoundingClientRect();
        const sanskritChars = ['ॐ', 'अ', 'आ', 'इ', 'ई', 'उ', 'ऊ'];
        const colors = [
            'rgba(30, 58, 138, 0.9)',
            'rgba(14, 165, 233, 0.9)',
            'rgba(6, 182, 212, 0.9)'
        ];
        
        for (let i = 0; i < 8; i++) {
            const char = document.createElement('div');
            char.textContent = sanskritChars[Math.floor(Math.random() * sanskritChars.length)];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 10 + 14;
            
            char.style.cssText = `
                position: fixed;
                font-size: ${size}px;
                color: ${color};
                pointer-events: none;
                z-index: 1000;
                left: ${rect.left + rect.width / 2}px;
                top: ${rect.top + rect.height / 2}px;
                animation: burst ${1.5}s ease-out forwards;
                font-family: serif;
                text-shadow: 0 0 10px ${color};
                filter: blur(${Math.random() * 0.5}px);
            `;
            
            document.body.appendChild(char);
            
            setTimeout(() => {
                if (char.parentNode) {
                    char.parentNode.removeChild(char);
                }
            }, 1500);
        }
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes burst {
                0% {
                    transform: translate(0, 0) scale(0);
                    opacity: 1;
                }
                100% {
                    transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(1);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize interactive effects
    addInteractiveEffects();

    // Constellation Effect
    function createConstellationEffect() {
        const container = document.body;
        
        function createStar() {
            const star = document.createElement('div');
            const size = Math.random() * 3 + 1;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const duration = Math.random() * 4 + 2;
            
            star.style.cssText = `
                position: fixed;
                width: ${size}px;
                height: ${size}px;
                background: radial-gradient(circle, rgba(14, 165, 233, 0.8), transparent);
                border-radius: 50%;
                left: ${x}vw;
                top: ${y}vh;
                animation: twinkle ${duration}s ease-in-out infinite;
                pointer-events: none;
                z-index: -1;
                box-shadow: 0 0 10px rgba(14, 165, 233, 0.5);
            `;
            
            container.appendChild(star);
        }
        
        // Create initial stars
        for (let i = 0; i < 20; i++) {
            createStar();
        }
        
        // Add more stars periodically
        setInterval(createStar, 2000);
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes twinkle {
                0%, 100% {
                    opacity: 0.3;
                    transform: scale(1);
                }
                50% {
                    opacity: 1;
                    transform: scale(1.5);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Morphing Shapes Effect
    function addMorphingShapes() {
        const container = document.body;
        
        function createMorphingShape() {
            const shape = document.createElement('div');
            const size = Math.random() * 100 + 50;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const duration = Math.random() * 8 + 6;
            
            shape.style.cssText = `
                position: fixed;
                width: ${size}px;
                height: ${size}px;
                background: linear-gradient(45deg, rgba(30, 58, 138, 0.1), rgba(14, 165, 233, 0.1));
                border-radius: 50%;
                left: ${x}vw;
                top: ${y}vh;
                animation: morph ${duration}s ease-in-out infinite;
                pointer-events: none;
                z-index: -1;
                filter: blur(1px);
            `;
            
            container.appendChild(shape);
            
            setTimeout(() => {
                if (shape.parentNode) {
                    shape.parentNode.removeChild(shape);
                }
            }, duration * 1000);
        }
        
        setInterval(createMorphingShape, 4000);
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes morph {
                0% {
                    border-radius: 50%;
                    transform: scale(0.8) rotate(0deg);
                }
                25% {
                    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
                    transform: scale(1.2) rotate(90deg);
                }
                50% {
                    border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%;
                    transform: scale(0.9) rotate(180deg);
                }
                75% {
                    border-radius: 40% 60% 60% 40% / 60% 40% 60% 40%;
                    transform: scale(1.1) rotate(270deg);
                }
                100% {
                    border-radius: 50%;
                    transform: scale(0.8) rotate(360deg);
                }
            }
        `;
        document.head.appendChild(style);
    }
});