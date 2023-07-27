// Assuming articles is an array of objects with 'title' and 'content' properties
var articles = [{
        title: 'Tintin\'s rocket',
        content: 'Web development has its roots in the early days of the internet...',
        date: '2023-07-27'
    }];

function searchArticles() {
    var query = document.getElementById('search').value;

    // Clear current search results
    document.getElementById('searchResults').innerHTML = '';

    // Filter the articles based on the user's query
    var results = articles.filter(function(article) {
        return article.title.includes(query) || article.content.includes(query);
    });

    // Display the results
    for (var i = 0; i < results.length; i++) {
        var resultDiv = document.createElement('div');
        var title = document.createElement('h2');
        var content = document.createElement('p');

        title.textContent = results[i].title;
        content.textContent = results[i].content;

        resultDiv.appendChild(title);
        resultDiv.appendChild(content);

        document.getElementById('searchResults').appendChild(resultDiv);
    }
}

document.getElementById('searchButton').addEventListener('click', searchArticles);
