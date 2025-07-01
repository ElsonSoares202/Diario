document.addEventListener("DOMContentLoaded", () => {
  const diaryTitleInput = document.getElementById("diaryTitle");
  const diaryEntryInput = document.getElementById("diaryEntry");
  const saveButton = document.getElementById("saveButton");
  const diaryEntriesContainer = document.getElementById(
    "diaryEntriesContainer"
  );

  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const clearSearchButton = document.getElementById("clearSearchButton");
  const downloadEntriesButton = document.getElementById(
    "downloadEntriesButton"
  ); // NOVO: Botão de download

  // Novos elementos para o humor
  const moodEmojis = document.querySelectorAll(".emoji-option");
  const selectedMoodInput = document.getElementById("selectedMood");
  const emojiMap = {
    // Mapeia o valor do data-mood para o emoji real
    feliz: "😄",
    neutro: "😐",
    triste: "🙁",
    bravo: "😡",
    animado: "🤩",
    chorando: "😭",
    derretendo: "🫠",
  };

  let diaryEntries = [];
  let editingIndex = -1;

  // --- Funções Auxiliares ---

  function loadEntries() {
    const storedEntries = localStorage.getItem("diaryEntries");
    if (storedEntries) {
      diaryEntries = JSON.parse(storedEntries);
      renderEntries(diaryEntries);
    }
  }

  function saveEntries() {
    localStorage.setItem("diaryEntries", JSON.stringify(diaryEntries));
  }

  // MODIFICADO: Função para renderizar as entradas (agora colapsáveis)
  function renderEntries(entriesToRender) {
    diaryEntriesContainer.innerHTML = "";

    if (entriesToRender.length === 0) {
      diaryEntriesContainer.innerHTML =
        '<p style="text-align: center; color: #777;">Nenhuma entrada encontrada.</p>';
      return;
    }

    // Renderiza as entradas da mais nova para a mais antiga
    for (let i = entriesToRender.length - 1; i >= 0; i--) {
      const entry = entriesToRender[i];
      const originalIndex = diaryEntries.indexOf(entry); // Para garantir que editamos/excluímos o item correto

      const entryDiv = document.createElement("div");
      entryDiv.classList.add("diary-entry");
      entryDiv.dataset.index = originalIndex; // Usamos o index original para manipular

      const moodEmojiChar = entry.moodEmoji || "❓"; // Emoji ou padrão
      const formattedDate = entry.date; // A data já vem formatada

      entryDiv.innerHTML = `
                <span class="mood-emoji">${moodEmojiChar}</span>
                <div class="diary-entry-content">
                    <span class="date">${formattedDate}</span>
                    <h3 class="entry-title">${entry.title}</h3>
                    <p class="entry-text" style="display: none;">${entry.text}</p> <div class="actions">
                        <button data-index="${originalIndex}" class="edit-button">Editar</button>
                        <button data-index="${originalIndex}" class="delete-button">Excluir</button>
                    </div>
                </div>
            `;
      diaryEntriesContainer.appendChild(entryDiv);
    }

    // NOVO: Adiciona evento de clique para expandir/colapsar o texto
    document.querySelectorAll(".entry-title").forEach((title) => {
      title.addEventListener("click", function () {
        const entryText = this.nextElementSibling; // Pega o <p> que é o próximo irmão do <h3>
        if (entryText.style.display === "none") {
          entryText.style.display = "block";
        } else {
          entryText.style.display = "none";
        }
      });
    });

    addEntryButtonListeners();
  }

  function addEntryButtonListeners() {
    document.querySelectorAll(".edit-button").forEach((button) => {
      button.addEventListener("click", (event) => {
        const indexToEdit = parseInt(event.target.dataset.index);
        editEntry(indexToEdit);
      });
    });

    document.querySelectorAll(".delete-button").forEach((button) => {
      button.addEventListener("click", (event) => {
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
    selectMoodEmoji(null, entryToEdit.mood);

    editingIndex = index;
    saveButton.textContent = "Atualizar Entrada";
    diaryTitleInput.focus();
  }

  function deleteEntry(index) {
    if (confirm("Tem certeza que deseja excluir esta entrada?")) {
      diaryEntries.splice(index, 1);
      saveEntries();
      renderEntries(diaryEntries);
      if (editingIndex === index) {
        resetForm();
      }
    }
  }

  function resetForm() {
    diaryTitleInput.value = "";
    diaryEntryInput.value = "";
    saveButton.textContent = "Salvar Entrada";
    editingIndex = -1;
    // Limpa a seleção de humor
    moodEmojis.forEach((emoji) => emoji.classList.remove("selected"));
    selectedMoodInput.value = "";
  }

  // --- Lógica de Busca ---
  function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
      const filteredEntries = diaryEntries.filter(
        (entry) =>
          entry.title.toLowerCase().includes(searchTerm) ||
          entry.text.toLowerCase().includes(searchTerm) // Permite buscar por título ou texto
      );
      renderEntries(filteredEntries);
    } else {
      renderEntries(diaryEntries);
    }
  }

  // --- Lógica do Mood Selector ---
  function selectMoodEmoji(event, moodValue = null) {
    // Remove a classe 'selected' de todos os emojis
    moodEmojis.forEach((emoji) => {
      emoji.classList.remove("selected");
    });

    let targetEmoji;
    if (event) {
      // Se a função foi chamada por um evento de clique
      targetEmoji = event.target;
      selectedMoodInput.value = targetEmoji.dataset.mood;
    } else if (moodValue) {
      // Se a função foi chamada para setar um mood específico (ex: edição)
      targetEmoji = document.querySelector(
        `.emoji-option[data-mood="${moodValue}"]`
      );
      selectedMoodInput.value = moodValue;
    } else {
      // Se não há evento nem moodValue (ex: resetForm)
      selectedMoodInput.value = "";
      return;
    }

    if (targetEmoji) {
      targetEmoji.classList.add("selected");
    }
  }

  // --- Event Listeners ---

  // Event listeners para os emojis de humor
  moodEmojis.forEach((emoji) => {
    emoji.addEventListener("click", selectMoodEmoji);
  });

  saveButton.addEventListener("click", () => {
    const title = diaryTitleInput.value.trim();
    const text = diaryEntryInput.value.trim();
    const selectedMood = selectedMoodInput.value; // Pega o humor selecionado

    // Agora exige título, texto E seleção de humor
    if (title && text && selectedMood) {
      const now = new Date();
      const dateOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      };
      const formattedDate = now.toLocaleDateString("pt-BR", dateOptions);

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
          moodEmoji: moodEmojiChar, // Salva o caractere do emoji
        };
        diaryEntries.push(newEntry);
      }

      saveEntries();
      renderEntries(diaryEntries);
      resetForm();
      searchInput.value = ""; // Limpa o campo de busca
    } else {
      alert("Por favor, preencha o título, o conteúdo e selecione seu humor!");
    }
  });

  // Eventos para a busca
  searchButton.addEventListener("click", performSearch);
  searchInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      performSearch();
    } else if (searchInput.value.trim() === "") {
      renderEntries(diaryEntries);
    }
  });
  clearSearchButton.addEventListener("click", () => {
    searchInput.value = "";
    renderEntries(diaryEntries);
  });

  // NOVO: Lógica para baixar as entradas
  downloadEntriesButton.addEventListener("click", () => {
    let allEntriesText = "";
    if (diaryEntries.length === 0) {
      alert("Não há entradas para baixar!");
      return;
    }
    diaryEntries.forEach((entry) => {
      const date = entry.date;
      const moodEmoji = entry.moodEmoji || "❓";
      const title = entry.title || "Sem Título";
      const text = entry.text;
      allEntriesText += `Data: ${date}\nHumor: ${moodEmoji}\nTítulo: ${title}\nEntrada:\n${text}\n\n---\n\n`;
    });

    const blob = new Blob([allEntriesText], {
      type: "text/plain;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "meu_diario_pessoal.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href); // Libera a URL do objeto para economizar memória
  });

  // --- Inicialização ---
  loadEntries();
});
