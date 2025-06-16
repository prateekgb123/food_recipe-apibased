
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
        const response = await fetch(`/api/recipes/findByIngredients?ingredients=${ingredients}&number=15`, {
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
        displayRecipes(favorites);  // reuse same display function
    } catch (err) {
        console.error("Error loading favorites:", err);
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
        const recipeDiv = document.createElement('div');
        recipeDiv.classList.add('recipe');
        recipeDiv.innerHTML = `
    <img src="${recipe.image}" alt="${recipe.title}">
    <h3>${recipe.title}</h3>
    <a href="https://spoonacular.com/recipes/${recipe.title.replace(/ /g, '-').toLowerCase()}-${recipe.id}" target="_blank">View Recipe</a>
    <button onclick="saveToFavorites('${recipe.id}', '${recipe.title}', '${recipe.image}')">❤️ Save</button>
`;

        resultsDiv.appendChild(recipeDiv);
    });
}
