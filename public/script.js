const apiKey = "daad66ed20794a89bdab432f80652162"; 
const apiUrl = '/api/recipes/findByIngredients'; 

const handleSearch = () => {
    const query = document.getElementById('search').value.trim();
    if (query) {
        fetchRecipes(query);
    } else {
        alert('Please enter some ingredients!');
    }
};

document.getElementById('searchBtn').addEventListener('click', handleSearch);

document.getElementById('search').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

async function fetchRecipes(ingredients) {
    const url = `${apiUrl}?ingredients=${ingredients}&number=15`; // Removed apiKey from frontend URL
    try {
        const response = await fetch(url);
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