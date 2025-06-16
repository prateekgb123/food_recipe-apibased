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
        displayRecipes(recipes);
    } catch (error) {
        console.error('Error fetching recipes:', error);
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
        const favorites = await response.json();
        displayRecipes(favorites);
    } catch (err) {
        console.error("Error loading favorites:", err);
        alert("Could not load favorites.");
    }
}

function displayRecipes(recipes) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (recipes.length === 0) {
        resultsDiv.innerHTML = '<p>No recipes found. Try different ingredients.</p>';
        return;
    }

    recipes.forEach(recipe => {
        // Handle potential undefined fields safely
        const title = recipe.title || "Untitled";
        const image = recipe.image || "";
        const id = recipe.recipeId || recipe.id || null;

        const viewUrl = id
            ? `https://spoonacular.com/recipes/${encodeURIComponent(title.replace(/ /g, '-').toLowerCase())}-${id}`
            : "#";

        const recipeDiv = document.createElement('div');
        recipeDiv.classList.add('recipe');

        // Use dataset for passing data to onclick safely
        recipeDiv.innerHTML = `
            <img src="${image}" alt="${title}">
            <h3>${title}</h3>
            <a href="${viewUrl}" target="_blank">View Recipe</a>
            <button onclick="saveToFavorites('${id}', \`${escapeQuotes(title)}\`, \`${escapeQuotes(image)}\`)">❤️ Save</button>
        `;

        resultsDiv.appendChild(recipeDiv);
    });

    // Add view favorites button if not already added
    if (!document.getElementById('viewFavBtn')) {
        const favBtn = document.createElement('button');
        favBtn.id = 'viewFavBtn';
        favBtn.textContent = "⭐ View Favorites";
        favBtn.style.marginTop = "20px";
        favBtn.onclick = loadFavorites;
        resultsDiv.appendChild(favBtn);
    }
}

// Utility to safely escape quotes in HTML attributes
function escapeQuotes(str) {
    return String(str).replace(/`/g, '\\`').replace(/"/g, '\\"').replace(/'/g, "\\'");
}
