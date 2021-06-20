const apiURL = "http://localhost:3000/api/";
let selectedId = "";
let editEntryMode = false;











function main(){
    document.querySelector("#decButton").onclick = (event) => {
        fetch(apiURL).then(response => response.json()).then((data) => {
            // console.log(data);
            document.querySelector("#counterText").innerHTML = data.str;
        });
        
    }


}

main();