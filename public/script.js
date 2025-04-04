const apiKey = "daad66ed20794a89bdab432f80652162"; 
const apiUrl = '/api/recipes/findByIngredients'; 

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
                'Authorization': `Bearer ${token}`, // Send JWT token
                'Content-Type': 'application/json',
            }
        });

        if (response.status === 401) {
            alert("Session expired. Please log in again.");
            localStorage.removeItem("token");
            window.location.href = "sign.html"; // Redirect to login page
            return;
        }

        const recipes = await response.json();
        displayRecipes(recipes);
    } catch (error) {
        console.error('Error fetching recipes:', error);
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
        `;
        resultsDiv.appendChild(recipeDiv);
    });
}
