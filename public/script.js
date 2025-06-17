document.getElementById('searchBtn').addEventListener('click', handleSearch);
document.getElementById('search').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

async function handleSearch() {
    const query = document.getElementById('search').value.trim();
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please log in first to search for recipes.");
        window.location.href = "sign.html";
        return;
    }

    if (query) {
        fetchRecipes(query, token);
    } else {
        alert('Please enter some ingredients!');
    }
}

async function fetchRecipes(ingredients, token) {
    try {
        const response = await fetch(`/api/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients)}&number=15`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (response.status === 401) {
            alert("Session expired. Please log in again.");
            localStorage.removeItem("token");
            window.location.href = "sign.html";
            return;
        }

        const recipes = await response.json();
        displayRecipes(recipes, false);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        alert("Error fetching recipes.");
    }
}

async function saveToFavorites(recipeId, title, image) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please log in to save recipes.");
        return;
    }

    try {
        const response = await fetch("/api/favorites", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ recipeId, title, image })
        });

        const data = await response.json();
        alert(data.message || "Saved to favorites!");
    } catch (error) {
        console.error("Error saving favorite:", error);
        alert("Something went wrong.");
    }
}

async function removeFromFavorites(recipeId) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please log in to remove favorites.");
        return;
    }

    try {
        const response = await fetch(`/api/favorites/${recipeId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const contentType = response.headers.get("content-type");
        if (!response.ok) {
            if (contentType && contentType.includes("application/json")) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to remove favorite.");
            } else {
                const rawText = await response.text();
                console.error("Unexpected response:", rawText);
                throw new Error("Unexpected server response (not JSON).");
            }
        }

        const data = await response.json();
        alert(data.message || "Removed from favorites!");
        loadFavorites(); // Refresh
    } catch (error) {
        console.error("Error removing favorite:", error);
        alert("Something went wrong while removing the recipe.");
    }
}

async function loadFavorites() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please log in to view favorites.");
        return;
    }

    try {
        const response = await fetch("/api/favorites", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const contentType = response.headers.get("content-type");
        if (!response.ok) {
            if (contentType && contentType.includes("application/json")) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to load favorites.");
            } else {
                const rawText = await response.text();
                console.error("Unexpected response:", rawText);
                throw new Error("Unexpected server response (not JSON).");
            }
        }

        const favorites = await response.json();
        displayRecipes(favorites, true); // isFavorite = true
    } catch (err) {
        console.error("Error loading favorites:", err);
        alert("Could not load favorites.");
    }
}

function displayRecipes(recipes, isFavorite = false) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (!recipes || recipes.length === 0) {
        resultsDiv.innerHTML = '<p>No recipes found. Try different ingredients.</p>';
        return;
    }

    recipes.forEach(recipe => {
        const title = recipe.title || "Untitled";
        const image = recipe.image || "";
        const id = recipe.recipeId || recipe.id || null;

        const viewUrl = id
            ? `https://spoonacular.com/recipes/${encodeURIComponent(title.replace(/ /g, '-').toLowerCase())}-${id}`
            : "#";

        const recipeDiv = document.createElement('div');
        recipeDiv.classList.add('recipe');

        recipeDiv.innerHTML = `
            <img src="${image}" alt="${title}">
            <h3>${title}</h3>
            <p><a href="${viewUrl}" target="_blank" class="view-link">View Recipe</a></p>
            ${isFavorite
                ? `<button onclick="removeFromFavorites('${id}')">🗑️ Remove</button>`
                : `<button onclick="saveToFavorites('${id}', \`${escapeQuotes(title)}\`, \`${escapeQuotes(image)}\`)">❤️ Add to Favorites</button>`
            }
        `;

        resultsDiv.appendChild(recipeDiv);
    });
}

function escapeQuotes(str) {
    return String(str).replace(/`/g, '\\`').replace(/"/g, '\\"').replace(/'/g, "\\'");
}
