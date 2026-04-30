// Ümumi cəmi hesabla
function calcTotal(id) {
    let table = document.getElementById(id);
    let inputs = table.getElementsByTagName("input");

    let sum = 0;

    for (let i = 0; i < inputs.length; i++) {
        sum += Number(inputs[i].value);
    }

    if (id === "b1") {
        document.getElementById("res1").innerText =
            "Brigada üzrə cəmi: " + sum;
    } else {
        document.getElementById("res2").innerText =
            "Brigada üzrə cəmi: " + sum;
    }
}


// Hər sətir üzrə cəmi
function calcRow(id) {
    let table = document.getElementById(id);
    let rows = table.getElementsByTagName("tr");

    let result = "";

    for (let i = 1; i < rows.length; i++) {
        let inputs = rows[i].getElementsByTagName("input");
        let rowSum = 0;

        for (let j = 0; j < inputs.length; j++) {
            rowSum += Number(inputs[j].value);
        }

        result += "Sətir " + i + " cəmi: " + rowSum + "<br>";
    }

    if (id === "b1") {
        document.getElementById("res1").innerHTML = result;
    } else {
        document.getElementById("res2").innerHTML = result;
    }
}