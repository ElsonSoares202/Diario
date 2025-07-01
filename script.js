document.addEventListener('DOMContentLoaded', () => {
    const diaryTitleInput = document.getElementById('diaryTitle');
    const diaryEntryInput = document.getElementById('diaryEntry');
    const saveButton = document.getElementById('saveButton');
    const diaryEntriesContainer = document.getElementById('diaryEntriesContainer');

    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const clearSearchButton = document.getElementById('clearSearchButton');

    // Novos elementos para o humor
    const moodEmojis = document.querySelectorAll('.emoji-option');
    const selectedMoodInput = document.getElementById('selectedMood');
    const emojiMap = { // Mapeia o valor do data-mood para o emoji real
        'feliz': '😄',
        'neutro': '😐',
        'triste': '🙁',
        'bravo': '😡',
        'animado': '🤩',
        'chorando': '😭',
        'derretendo': '🫠'
    };

    let diaryEntries = [];
    let editingIndex = -1;

    // --- Funções Auxiliares ---

    function loadEntries() {
        const storedEntries = localStorage.getItem('diaryEntries');
        if (storedEntries) {
            diaryEntries = JSON.parse(storedEntries);
            renderEntries(diaryEntries);
        }
    }

    function saveEntries() {
        localStorage.setItem('diaryEntries', JSON.stringify(diaryEntries));
    }

    function renderEntries(entriesToRender) {
        diaryEntriesContainer.innerHTML = '';

        if (entriesToRender.length === 0) {
            diaryEntriesContainer.innerHTML = '<p style="text-align: center; color: #777;">Nenhuma entrada encontrada.</p>';
            return;
        }

        for (let i = entriesToRender.length - 1; i >= 0; i--) {
            const entry = entriesToRender[i];
            const originalIndex = diaryEntries.indexOf(entry);

            const entryDiv = document.createElement('div');
            entryDiv.classList.add('diary-entry');
            entryDiv.innerHTML = `
                <span class="mood-emoji">${entry.moodEmoji || '❓'}</span> <div class="diary-entry-content">
                    <span class="date">${entry.date}</span>
                    <h3>${entry.title}</h3>
                    <p>${entry.text}</p>
                    <div class="actions">
                        <button data-index="${originalIndex}" class="edit-button">Editar</button>
                        <button data-index="${originalIndex}" class="delete-button">Excluir</button>
                    </div>
                </div>
            `;
            diaryEntriesContainer.appendChild(entryDiv);
        }

        addEntryButtonListeners();
    }

    function addEntryButtonListeners() {
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const indexToEdit = parseInt(event.target.dataset.index);
                editEntry(indexToEdit);
            });
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const indexToDelete = parseInt(event.target.dataset.index);
                deleteEntry(indexToDelete);
            });
        });
    }

    function editEntry(index) {
        const entryToEdit = diaryEntries[index];
        diaryTitleInput.value = entryToEdit.title;
        diaryEntryInput.value = entryToEdit.text;

        // Seleciona o emoji correspondente
        selectMoodEmoji(null, entryToEdit.mood); // Passa null para o evento e o valor do humor
        
        editingIndex = index;
        saveButton.textContent = 'Atualizar Entrada';
        diaryTitleInput.focus();
    }

    function deleteEntry(index) {
        if (confirm('Tem certeza que deseja excluir esta entrada?')) {
            diaryEntries.splice(index, 1);
            saveEntries();
            renderEntries(diaryEntries);
            if (editingIndex === index) {
                resetForm();
            }
        }
    }

    function resetForm() {
        diaryTitleInput.value = '';
        diaryEntryInput.value = '';
        saveButton.textContent = 'Salvar Entrada';
        editingIndex = -1;
        // Limpa a seleção de humor
        moodEmojis.forEach(emoji => emoji.classList.remove('selected'));
        selectedMoodInput.value = '';
    }

    // --- Lógica de Busca ---
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            const filteredEntries = diaryEntries.filter(entry =>
                entry.title.toLowerCase().includes(searchTerm)
            );
            renderEntries(filteredEntries);
        } else {
            renderEntries(diaryEntries);
        }
    }

    // --- Lógica do Mood Selector ---
    function selectMoodEmoji(event, moodValue = null) {
        // Remove a classe 'selected' de todos os emojis
        moodEmojis.forEach(emoji => {
            emoji.classList.remove('selected');
        });

        let targetEmoji;
        if (event) { // Se a função foi chamada por um evento de clique
            targetEmoji = event.target;
            selectedMoodInput.value = targetEmoji.dataset.mood;
        } else if (moodValue) { // Se a função foi chamada para setar um mood específico (ex: edição)
            targetEmoji = document.querySelector(`.emoji-option[data-mood="${moodValue}"]`);
            selectedMoodInput.value = moodValue;
        } else { // Se não há evento nem moodValue (ex: resetForm)
            selectedMoodInput.value = '';
            return;
        }
        
        if (targetEmoji) {
            targetEmoji.classList.add('selected');
        }
    }

    // --- Event Listeners ---

    // Event listeners para os emojis de humor
    moodEmojis.forEach(emoji => {
        emoji.addEventListener('click', selectMoodEmoji);
    });

    saveButton.addEventListener('click', () => {
        const title = diaryTitleInput.value.trim();
        const text = diaryEntryInput.value.trim();
        const selectedMood = selectedMoodInput.value; // Pega o humor selecionado

        // Agora exige título, texto E seleção de humor
        if (title && text && selectedMood) {
            const now = new Date();
            const dateOptions = {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            };
            const formattedDate = now.toLocaleDateString('pt-BR', dateOptions);

            // Obtém o emoji real baseado no valor do data-mood
            const moodEmojiChar = emojiMap[selectedMood];

            if (editingIndex !== -1) {
                // Atualiza entrada existente
                diaryEntries[editingIndex].title = title;
                diaryEntries[editingIndex].text = text;
                diaryEntries[editingIndex].date = formattedDate;
                diaryEntries[editingIndex].mood = selectedMood; // Salva o valor do humor
                diaryEntries[editingIndex].moodEmoji = moodEmojiChar; // Salva o caractere do emoji
                resetForm();
            } else {
                // Adiciona nova entrada
                const newEntry = {
                    title: title,
                    text: text,
                    date: formattedDate,
                    mood: selectedMood, // Salva o valor do humor
                    moodEmoji: moodEmojiChar // Salva o caractere do emoji
                };
                diaryEntries.push(newEntry);
            }

            saveEntries();
            renderEntries(diaryEntries);
            resetForm();
            searchInput.value = '';
        } else {
            alert('Por favor, preencha o título, o conteúdo e selecione seu humor!');
        }
    });

    // Eventos para a busca
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        } else if (searchInput.value.trim() === '') {
            renderEntries(diaryEntries);
        }
    });
    clearSearchButton.addEventListener('click', () => {
        searchInput.value = '';
        renderEntries(diaryEntries);
    });

    // --- Inicialização ---

    loadEntries();
});