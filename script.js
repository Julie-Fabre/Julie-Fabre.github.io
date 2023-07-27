// Assuming articles is an array of objects with 'title' and 'content' properties
var articles = [ {
        title: 'Tintin\'s rocket',
        content: 'Web development has its roots in the early days of the internet...',
        date: '2023-07-27',
        link: 'tintin_fusee.html'
    },];

function hideElements() {
    document.getElementById('home').style.display = 'none';
    //document.getElementById('article').style.display = 'none';
    //document.getElementById('footer').style.display = 'none';
    //document.body.style.display = 'none';
}


function searchArticles() {
    var query = document.getElementById('search').value;

    // Clear current search results
    document.getElementById('searchResults').innerHTML = '';

    // Filter the articles based on the user's query
    var results = articles.filter(function(article) {
        return article.title.toLowerCase().includes(query.toLowerCase()) ||
               article.content.toLowerCase().includes(query.toLowerCase());
    });

    // Hide other sections of the page
    hideElements();

    // Create a title for the search results
    var resultsTitle = document.createElement('h2');
    resultsTitle.textContent = 'Search results for "' + query + '":';
    document.getElementById('searchResults').appendChild(resultsTitle);

    // Create a list for the search results
    var resultsList = document.createElement('ul');

    // Display the results
    if(results.length > 0) {
        for (var i = 0; i < results.length; i++) {
            var listItem = document.createElement('li');
            var titleLink = document.createElement('a'); // Create a link instead of a heading

            titleLink.textContent = results[i].title;
            titleLink.href = results[i].link; // Set the link's URL to the article's link

            listItem.appendChild(titleLink);
            resultsList.appendChild(listItem);
        }
    } else {
        var noResults = document.createElement('li');
        noResults.textContent = 'No search results found. Check your search query, this search function is pretty basic and doesn\'t handle typos.';
        resultsList.appendChild(noResults);
    }

    // Append the list of results to the search results container
    document.getElementById('searchResults').appendChild(resultsList);
}



document.getElementById('searchButton').addEventListener('click', searchArticles);
