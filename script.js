// JavaScript
var searchForm = document.getElementById('searchForm');
var input = document.getElementById('search');

// Add keyup event listener to the search input field
input.addEventListener('keyup', function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        searchPosts();
    }
});

// Add submit event listener to the search form
searchForm.addEventListener('submit', function(event) {
    event.preventDefault();
    searchPosts();
});

function searchPosts() {
    var filter = input.value.toUpperCase();
    //var section = document.getElementById("blog");
    var articles = document.getElementsByTagName('article');

    for (var i = 0; i < articles.length; i++) {
        var h3 = articles[i].getElementsByTagName("h3")[0];
        var txtValue = h3.textContent || h3.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            articles[i].style.display = "";
        } else {
            articles[i].style.display = "none";
        }
    }
}
