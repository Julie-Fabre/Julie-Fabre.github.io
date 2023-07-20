function searchPosts() {
    // Declare variables
    var input, filter, section, article, h3, i, txtValue;
    input = document.getElementById('search');
    filter = input.value.toUpperCase();
    section = document.getElementById("blog");
    article = section.getElementsByTagName('article');

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < article.length; i++) {
        h3 = article[i].getElementsByTagName("h3")[0];
        txtValue = h3.textContent || h3.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            article[i].style.display = "";
        } else {
            article[i].style.display = "none";
        }
    }
}
