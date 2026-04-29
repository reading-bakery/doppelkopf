// up.js
function initBackToTop() {
    const button = document.getElementById("backToTop");
    
    if (!button) {
        console.warn("Button 'backToTop' noch nicht im DOM gefunden.");
        return;
    }

    window.onscroll = function() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            button.style.display = "block";
        } else {
            button.style.display = "none";
        }
    };

    button.onclick = function() {
        window.scrollTo({top: 0, behavior: 'smooth'});
    };
}