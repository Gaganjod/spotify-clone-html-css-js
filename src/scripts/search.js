/*
This script powers the search functionality for the Spotify web player clone.
Key features:
- Activates search with Ctrl+K.
- Provides a debounced, live search experience.
- Shows an overlay with search results and recent history.
- Supports keyboard navigation (Up, Down, Enter) through results.
- Manages search history using localStorage.
- Includes a clear button and Escape key to exit search.
- Uses smooth CSS transitions for the search overlay.
*/

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Element Selectors ---
    const searchInput = document.querySelector('[data-testid="search-input"]');
    const searchClearButton = document.querySelector('[data-testid="clear-button"]');
    const searchForm = document.querySelector('form[role="search"]');
    const placeholderWrapper = document.querySelector('.al8f6ds34QJ4LZ74vbVP');
    const mainView = document.getElementById('main-view');
    const browseButtonWrapper = searchForm?.querySelector('.Ckze8wMFNiDXk_f1IqjJ');

    if (!searchInput || !searchForm || !mainView) {
        console.warn('Search script could not find essential elements.');
        return;
    }
    
    // --- 2. State Management ---
    let searchOverlay = null;
    let isSearchActive = false;
    let currentFocus = -1;
    let searchHistory = JSON.parse(localStorage.getItem('spotifySearchHistory')) || [];

    // --- 3. Utility ---
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // --- 4. UI Update Functions ---
    const updatePlaceholderVisibility = () => {
        if (!placeholderWrapper) return;
        const isFocused = document.activeElement === searchInput;
        placeholderWrapper.style.visibility = (isFocused || searchInput.value) ? 'hidden' : 'visible';
    };

    const updateClearButtonVisibility = () => {
        if (!searchClearButton || !browseButtonWrapper) return;
        const hasValue = searchInput.value.length > 0;
        searchClearButton.style.display = hasValue ? 'inline-flex' : 'none';
        browseButtonWrapper.style.display = hasValue ? 'none' : 'block';
    };

    // --- 5. Core Search Logic ---
    const openSearch = () => {
        if (isSearchActive) return;
        isSearchActive = true;
        searchOverlay = document.createElement('div');
        searchOverlay.id = 'search-results-overlay';
        searchOverlay.className = 'absolute inset-0 bg-background-secondary z-10 opacity-0 transition-opacity duration-300 ease-in-out';
        
        mainView.style.position = 'relative'; 
        mainView.appendChild(searchOverlay);
        
        requestAnimationFrame(() => searchOverlay.classList.replace('opacity-0', 'opacity-100'));
    };

    const closeSearch = () => {
        if (!isSearchActive || !searchOverlay) return;
        searchInput.blur();
        searchOverlay.classList.replace('opacity-100', 'opacity-0');
        searchOverlay.addEventListener('transitionend', () => {
            searchOverlay?.remove();
            searchOverlay = null;
            mainView.style.position = '';
        }, { once: true });
        isSearchActive = false;
        currentFocus = -1;
    };

    const fetchSearchResults = async (query) => {
        if (!query) return { history: searchHistory, suggestions: [] };
        // Mock data for demonstration.
        const mockSuggestions = [
            { type: 'Song', title: `${query} as a song`, artist: 'Artist A', href: '#' },
            { type: 'Artist', title: `Artist ${query}`, href: '#' },
            { type: 'Album', title: `${query} Album`, artist: 'Artist B', href: '#' },
        ];
        return {
            history: searchHistory.filter(h => h.toLowerCase().includes(query.toLowerCase())),
            suggestions: mockSuggestions,
        };
    };

    const renderResults = (data) => {
        if (!searchOverlay) return;
        searchOverlay.innerHTML = '';
        const container = document.createElement('div');
        container.className = 'p-8 h-full overflow-y-auto text-text-primary';

        const createSection = (title, items, renderItem) => {
            if (!items || items.length === 0) return;
            const sectionEl = document.createElement('section');
            sectionEl.className = 'mb-8';
            const titleEl = document.createElement('h2');
            titleEl.className = 'text-2xl font-bold text-text-primary mb-4';
            titleEl.textContent = title;
            sectionEl.appendChild(titleEl);
            items.forEach(item => sectionEl.appendChild(renderItem(item)));
            container.appendChild(sectionEl);
        };

        createSection('Recent Searches', data.history, (item) => {
            const el = document.createElement('a');
            el.href = '#';
            el.className = 'flex items-center justify-between p-2 rounded-md transition-colors hover:bg-surface-elevated focus:bg-surface-elevated focus:outline-none result-item';
            el.innerHTML = `
                <span class="text-base">${item}</span>
                <button class="text-text-subdued hover:text-text-primary remove-history-btn" data-history-item="${item}" aria-label="Remove ${item} from recent searches">
                    <svg role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 16 16" style="pointer-events: none;"><path d="M.47 1.97a.75.75 0 0 1 1.06 0L8 7.44l6.47-6.47a.75.75 0 1 1 1.06 1.06L9.06 8.5l6.47 6.47a.75.75 0 1 1-1.06 1.06L8 9.56l-6.47 6.47a.75.75 0 0 1-1.06-1.06L6.94 8.5.47 2.03a.75.75 0 0 1 0-1.06z"></path></svg>
                </button>
            `;
            return el;
        });

        createSection('Suggestions', data.suggestions, (item) => {
            const el = document.createElement('a');
            el.href = item.href;
            el.className = 'block p-2 rounded-md transition-colors hover:bg-surface-elevated focus:bg-surface-elevated focus:outline-none result-item';
            el.innerHTML = `<div class="font-bold">${item.title}</div><div class="text-sm text-text-secondary">${item.type} ${item.artist ? '• ' + item.artist : ''}</div>`;
            return el;
        });
        
        if (container.children.length === 0 && searchInput.value) {
            container.innerHTML = `<p class="text-center text-text-secondary">No results for "${searchInput.value}".</p>`;
        }
        
        searchOverlay.appendChild(container);
    };

    const debouncedSearch = debounce(async (query) => {
        if (!isSearchActive && (query || document.activeElement === searchInput)) {
             openSearch();
        }
        
        if (isSearchActive) {
            const results = await fetchSearchResults(query);
            renderResults(results);
        }
    }, 250);

    // --- 6. Search History ---
    const addToSearchHistory = (query) => {
        if (!query) return;
        searchHistory = searchHistory.filter(item => item.toLowerCase() !== query.toLowerCase());
        searchHistory.unshift(query);
        searchHistory.length = Math.min(searchHistory.length, 5);
        localStorage.setItem('spotifySearchHistory', JSON.stringify(searchHistory));
    };

    const removeSearchHistoryItem = (itemToRemove) => {
        searchHistory = searchHistory.filter(item => item.toLowerCase() !== itemToRemove.toLowerCase());
        localStorage.setItem('spotifySearchHistory', JSON.stringify(searchHistory));
        debouncedSearch(searchInput.value);
    };

    // --- 7. Event Handlers ---
    const handleGlobalKeyDown = (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === 'k') { e.preventDefault(); searchInput.focus(); }
        if (e.key === 'Escape' && isSearchActive) { e.preventDefault(); closeSearch(); }
    };
    
    const handleSearchInput = () => { updateClearButtonVisibility(); debouncedSearch(searchInput.value); };
    const handleSearchFocus = () => { updatePlaceholderVisibility(); debouncedSearch(searchInput.value || ''); };
    const handleSearchBlur = () => {
        updatePlaceholderVisibility();
        setTimeout(() => {
            if (searchOverlay && !document.activeElement.closest('#search-results-overlay')) {
                closeSearch();
            }
        }, 200);
    };
    
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) { addToSearchHistory(query); closeSearch(); }
    };
    
    const handleClearClick = (e) => {
        e.preventDefault();
        searchInput.value = '';
        updateClearButtonVisibility();
        searchInput.focus();
        debouncedSearch('');
    };

    const handleNavKeyDown = (e) => {
        if (!isSearchActive || !searchOverlay) return;
        const items = searchOverlay.querySelectorAll('.result-item');
        if (items.length === 0) return;

        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (e.key === 'ArrowDown') currentFocus = (currentFocus + 1) % items.length;
            else currentFocus = (currentFocus - 1 + items.length) % items.length;
            items[currentFocus].focus();
        }
    };
    
    const handleOverlayClick = (e) => {
        const removeBtn = e.target.closest('.remove-history-btn');
        if (removeBtn) {
            e.preventDefault();
            removeSearchHistoryItem(removeBtn.dataset.historyItem);
        }
    };

    // --- 8. Event Listeners ---
    document.addEventListener('keydown', handleGlobalKeyDown);
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('focus', handleSearchFocus);
    searchInput.addEventListener('blur', handleSearchBlur);
    searchInput.addEventListener('keydown', handleNavKeyDown);
    searchForm.addEventListener('submit', handleFormSubmit);
    if(searchClearButton) searchClearButton.addEventListener('click', handleClearClick);
    mainView.addEventListener('click', handleOverlayClick);

    // --- 9. Initial State ---
    updateClearButtonVisibility();
    updatePlaceholderVisibility();
});