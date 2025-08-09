    const wordDisplay = document.getElementById('wordDisplay');
    const meaningDisplay = document.getElementById('meaningDisplay');
    const customInputArea = document.getElementById('customInputArea');
    const customWordsInput = document.getElementById('customWords');
    const customSubmitBtn = document.getElementById('customSubmit');
    const loader = document.getElementById('loader');
    const navButtons = document.querySelectorAll('nav button');
    const saveFavBtn = document.getElementById('saveFavBtn');
    const shareBtn = document.getElementById('shareBtn');
    const retryBtn = document.getElementById('retryBtn');
    const showFavBtn = document.getElementById('showFavBtn');
    const favoritesModal = document.getElementById('favoritesModal');
    const favoritesList = document.getElementById('favoritesList');
    const closeFavBtn = document.getElementById('closeFavBtn');

    let currentCategory = 'nouns';
    let currentWord = '';
    let currentMeaning = '';

    function randomFromArray(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
    function showLoader() {
      loader.style.display = 'block';
      wordDisplay.style.display = 'none';
      meaningDisplay.style.display = 'none';
      saveFavBtn.disabled = true;
      shareBtn.disabled = true;
    }
    function hideLoader() {
      loader.style.display = 'none';
      wordDisplay.style.display = 'block';
      meaningDisplay.style.display = 'block';
      saveFavBtn.disabled = false;
      shareBtn.disabled = false;
    }
    function resetCustomInput() {
      customWordsInput.value = '';
      customInputArea.style.display = 'none';
    }
    async function fetchRandomWord() {
      const res = await fetch('https://random-word-api.herokuapp.com/word?number=1');
      if (!res.ok) throw new Error('Failed to fetch random word');
      const data = await res.json();
      return data[0];
    }
    async function fetchDictionaryData(word) {
      try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data[0];
      } catch {
        return null;
      }
    }
    function formatDictionaryData(dictData) {
      if (!dictData || !dictData.meanings || dictData.meanings.length === 0) return null;
      const meanings = dictData.meanings;
      const defTexts = [];
      meanings.forEach(meaning => {
        if (meaning.definitions && meaning.definitions.length > 0) {
          meaning.definitions.slice(0, 2).forEach(def => {
            defTexts.push(`- ${def.definition}`);
          });
        }
      });
      return defTexts.join('\n') || null;
    }
    async function fetchRandomName() {
      
      try {
        const res = await fetch('https://randomuser.me/api/?inc=name&nat=us&results=1');
        if (!res.ok) throw new Error('Failed to fetch name');
        const data = await res.json();
        const nameObj = data.results[0].name;
        return `${nameObj.first} ${nameObj.last}`;
      } catch {
        return null;
      }
    }
    async function fetchRandomSentence() {
    try {
    const res = await fetch('https://api.quotable.io/random');
    if (!res.ok) throw new Error('Sentence fetch failed');
    const data = await res.json();
    return data.content || 'Here is a sample sentence.';
      } catch (err) {
    
    return "This is a fallback sample sentence because the API call failed.";
      }
    }

    async function generateContent(type) {
      currentCategory = type;
      resetCustomInput();
      wordDisplay.textContent = '';
      meaningDisplay.textContent = '';
      showLoader();

      try {
        switch(type) {
          case 'nouns':
          case 'verbs': {
            const word = await fetchRandomWord();
            const dictData = await fetchDictionaryData(word);
            const meaning = formatDictionaryData(dictData);
            currentWord = word;
            currentMeaning = meaning || 'Meaning not found.';
            wordDisplay.textContent = word;
            meaningDisplay.textContent = currentMeaning;
            break;
          }
          case 'names': {
            const name = await fetchRandomName();
            if (!name) throw new Error('Name fetch failed');
            currentWord = name;
            currentMeaning = 'A random human name.';
            wordDisplay.textContent = name;
            meaningDisplay.textContent = currentMeaning;
            break;
          }
          case 'sentences': {
            hideLoader();
            currentWord = await fetchRandomSentence();
            currentMeaning = ''; 
            wordDisplay.textContent = currentWord;
            meaningDisplay.textContent = currentMeaning;
            break;
          }

          case 'number': {
            const num = Math.floor(Math.random() * 1000);
            currentWord = num.toString();
            currentMeaning = 'A random number.';
            wordDisplay.textContent = currentWord;
            meaningDisplay.textContent = currentMeaning;
            break;
          }
          case 'alphabet': {
            const alpha = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            currentWord = alpha;
            currentMeaning = 'A random letter.';
            wordDisplay.textContent = currentWord;
            meaningDisplay.textContent = currentMeaning;
            break;
          }
          case 'custom': {
            hideLoader();
            customInputArea.style.display = 'flex';
            currentWord = '';
            currentMeaning = '';
            saveFavBtn.disabled = true;
            shareBtn.disabled = true;
            return; 
          }
          default: {
            currentWord = '';
            currentMeaning = '';
            wordDisplay.textContent = 'Unknown category';
            meaningDisplay.textContent = '';
          }
        }
      } catch (e) {
        wordDisplay.textContent = 'Failed to load data.';
        meaningDisplay.textContent = '';
        currentWord = '';
        currentMeaning = '';
      }
      hideLoader();
    }
    function saveFavorite() {
      if (!currentWord) return;
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      if (favorites.find(fav => fav.word === currentWord)) {
        alert('Already in favorites!');
        return;
      }
      favorites.push({word: currentWord, meaning: currentMeaning});
      localStorage.setItem('favorites', JSON.stringify(favorites));
      alert(`Saved "${currentWord}" to favorites!`);
    }
    function shareCurrent() {
      if (!currentWord) return;
      const shareText = `Check out this:\n"${currentWord}"\nMeaning: ${currentMeaning}`;
      if (navigator.share) {
        navigator.share({
          title: 'Fun Word Generator',
          text: shareText,
          url: window.location.href
        }).catch(() => alert('Share failed or cancelled.'));
      } else {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank', 'noopener');
      }
    }
    function showFavorites() {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      favoritesList.innerHTML = '';
      if (favorites.length === 0) {
        favoritesList.innerHTML = '<li>No favorites saved yet.</li>';
      } else {
        favorites.forEach((fav, idx) => {
          const li = document.createElement('li');
          const span = document.createElement('span');
          span.textContent = `${fav.word} - ${fav.meaning}`;
          const btn = document.createElement('button');
          btn.className = 'remove-fav-btn';
          btn.setAttribute('aria-label', `Remove favorite ${fav.word}`);
          btn.textContent = '✖';
          btn.addEventListener('click', () => {
            removeFavorite(idx);
          });
          li.appendChild(span);
          li.appendChild(btn);
          favoritesList.appendChild(li);
        });
      }
      favoritesModal.classList.add('show');
      favoritesModal.focus();
    }
    function removeFavorite(index) {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      favorites.splice(index, 1);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      showFavorites();
    }
    function closeFavorites() {
      favoritesModal.classList.remove('show');
      showFavBtn.focus();
    }
    
    async function retryCurrent() {
      if (currentCategory === 'custom') {
        
        const val = customWordsInput.value.trim();
        if (!val) {
          alert('Please enter some words or phrases separated by commas.');
          return;
        }
        const list = val.split(',').map(s => s.trim()).filter(s => s.length > 0);
        if (list.length === 0) {
          alert('Please enter valid words or phrases.');
          return;
        }
        const picked = randomFromArray(list);
        currentWord = picked;
        currentMeaning = '';
        wordDisplay.textContent = picked;
        meaningDisplay.textContent = '';
        saveFavBtn.disabled = false;
        shareBtn.disabled = false;
      } else {
        await generateContent(currentCategory);
      }
    }
    customSubmitBtn.addEventListener('click', () => {
      retryCurrent();
      saveFavBtn.disabled = false;
      shareBtn.disabled = false;
    });
    saveFavBtn.addEventListener('click', saveFavorite);
    shareBtn.addEventListener('click', shareCurrent);
    retryBtn.addEventListener('click', retryCurrent);
    showFavBtn.addEventListener('click', showFavorites);
    closeFavBtn.addEventListener('click', closeFavorites);
    favoritesModal.addEventListener('click', e => {
      if (e.target === favoritesModal) closeFavorites();
    });
    navButtons.forEach(btn => {
  btn.addEventListener('click', async () => {
    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    await generateContent(btn.getAttribute('data-type'));
  });
});


    
    const darkModeToggle = document.getElementById('darkModeToggle');
    function applyTheme(theme) {
      if(theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        darkModeToggle.textContent = '☀️ Light Mode';
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        darkModeToggle.textContent = '🌙 Dark Mode';
      }
      localStorage.setItem('theme', theme);
    }
    function toggleDarkMode() {
      const current = document.documentElement.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    }
    darkModeToggle.addEventListener('click', toggleDarkMode);
    (function init() {
      const savedTheme = localStorage.getItem('theme') || 'light';
      applyTheme(savedTheme);
      generateContent('nouns');
    })();