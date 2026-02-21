// Search index — all site pages with keywords for search
var articles = [
  {
    title: 'Is Tintin\'s rocket realistic?',
    content: 'Comic, tintin, physics, math, Herge, fun data analysis, rocket, moon',
    date: '2023-07-27',
    link: 'tintin_fusee.html'
  },
  {
    title: 'Research',
    content: 'neuroscience, neuropixels, corticostriatal, striatum, cortex, UnitMatch, unit tracking, basal ganglia, sensorimotor, taste aversion, learning, Nature, electrophysiology',
    link: 'resources.html'
  },
  {
    title: 'Open Science in Academia',
    content: 'open science, UCL, award, freely available, research tools, open development, reproducibility',
    link: 'open-science.html'
  },
  {
    title: 'Promoting Open Science',
    content: 'open science, promotion, academic initiatives, advocacy',
    link: 'promotion.html'
  },
  {
    title: 'Software',
    content: 'software, tools, code, bombcell, unitmatch, neuropixels, spike sorting, quality control',
    link: 'software.html'
  },
  {
    title: 'Protocols',
    content: 'protocols, methods, experimental, neuroscience',
    link: 'protocols.html'
  },
  {
    title: 'Shoemaking',
    content: 'shoemaking, shoes, leather, handmade, craft, cobbler, DIY',
    link: 'shoemaking.html'
  },
  {
    title: 'Leatherwork',
    content: 'leather, handbag, cycling gloves, LED, handcrafted, crafts, leatherwork',
    link: 'leatherwork.html'
  },
  {
    title: 'Other Tinkering Projects',
    content: 'tinkering, DIY, projects, making, building',
    link: 'tinkering-other.html'
  },
  {
    title: 'Fun Data Analysis',
    content: 'fun, data analysis, physics, pop culture, tintin',
    link: 'fun-data-analysis.html'
  },
  {
    title: 'About',
    content: 'about, Julie Fabre, RSS, font, IM Fell English, website',
    link: 'about.html'
  },
];

function hideElements() {
  document.getElementById('hide_from_search_results_page').style.display = 'none';
}

function searchArticles(event) {
  // Prevent the form from submitting normally
  event.preventDefault();

  var query = document.getElementById('search').value;

  // Clear current search results
  document.getElementById('searchResults').innerHTML = '';

  // Filter the articles based on the user's query
  var results = articles.filter(function (article) {
    return article.title.toLowerCase().includes(query.toLowerCase()) ||
      article.content.toLowerCase().includes(query.toLowerCase());
  });

  // Hide other sections of the page
  hideElements();

  // Create a title for the search results
  var resultsTitle = document.createElement('h2');
  resultsTitle.textContent = 'Search results for “' + query + '”:';
  document.getElementById('searchResults').appendChild(resultsTitle);

  // Create a list for the search results
  var resultsList = document.createElement('ul');

  // Display the results
  if (results.length > 0) {
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

// Listen for form submission
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchForm').addEventListener('submit', searchArticles);

    // Apply dark mode from saved preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    // Highlight active nav link based on current page
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    var navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(function(link) {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});
