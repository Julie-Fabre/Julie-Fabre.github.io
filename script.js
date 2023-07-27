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
    var query = document.getElementById('searchButton').value;

    // Clear current search results
    document.getElementById('searchResults').innerHTML = '';

    // Filter the articles based on the user's query
    var results = articles.filter(function(article) {
        return article.title.toLowerCase().includes(query.toLowerCase()) ||
               article.content.toLowerCase().includes(query.toLowerCase());
    });

    // Hide other sections of the page
    hideElements(); // Add this line to hide non-related sections


    // Display the results
    if(results.length > 0) {
        for (var i = 0; i < results.length; i++) {
            var resultDiv = document.createElement('div');
            var titleLink = document.createElement('a'); // Create a link instead of a heading
            var content = document.createElement('p');

            titleLink.textContent = results[i].title;
            titleLink.href = results[i].link; // Set the link's URL to the article's link
            content.textContent = results[i].content;

            resultDiv.appendChild(titleLink);
            resultDiv.appendChild(content);

            document.getElementById('searchResults').appendChild(resultDiv);
        }
    } else {
        var noResults = document.createElement('p');
        noResults.textContent = 'No search results found for "' + query + '".';
        document.getElementById('searchResults').appendChild(noResults);
    }
}


document.getElementById('searchButton').addEventListener('click', searchArticles);
