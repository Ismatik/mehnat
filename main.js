const state = 0;

function nextPage(){
    const state = 1;

    const pageone = document.getElementById("firstPage");
    pageone.style.display="none";

    const pagetwo = document.getElementById("secondPage");
    pagetwo.style.display="flex";
}

if (state == 0){
    pageone.style.display = "flex";
    pagetwo.style.display = "none";
}
else{
    pageone.style.display = "none";
    pagetwo.style.display = "flex";
}