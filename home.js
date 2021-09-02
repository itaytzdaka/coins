/// <reference path="jquery-3.4.1.js" />

"use strict";

$(function () {

    //length of the max amount of coins in the report page
    const reportsArrayLength = 5;
    let reportsArray = [];

    //create the home page on load
    createHomePage();

    //event listener when the user clicks on home page
    $("#homeLink").click(function () {
        createHomePage();
    });


    function createHomePage() {

        //clear content from container
        $("#contentDiv").empty();
        //clear content from search box
        $("#searchInput").val("");
        //add event listener to the search button
        $("#searchButton").click(() => {
            createCoinsDivs($("#searchInput").val());
        });

        //get array of the selected coins from the storage
        if (localStorage.getItem("reports") != null) {
            reportsArray = JSON.parse(localStorage.getItem("reports"));
        }

        //symbol: empty filter
        let symbol = "";
        
        createCoinsDivs(symbol);
    }

    //function for getting the coins list and display their properties 
    function createCoinsDivs(symbol) {

        ajaxRequestGetIcons()
            .then(list => {



                let startRow = `<div class="row mx-col-0 mx-md-5">`;
                let endRow = `</div>`;

                let index = 1;

                let html = ``;


                for (let i = 0; i < list.length; i++) {

                    const coin = list[i];

                    if (symbol == "" || symbol == coin.symbol) {
                        if (index === 1)
                            html += startRow;

                        html +=
                            `<div class="coinContainer col-12  col-md-4 rounded border border-muted">
                                    <div class="m-3">
                                        <label class="switch">
                                            <input type="checkbox" id="checkID${coin.id}" class="mainToggle">
                                            <span class="slider round"></span>
                                        </label>
                                        <b>${coin.symbol}</b><br>
                                        <span>${coin.id}</span><br>
                                        <button id="${coin.id}" class="moreInfoBtn btn btn-primary mt-3" type="button" data-toggle="collapse"
                                            data-target="#collapse${coin.id}" aria-expanded="false" >
                                            More Info
                                        </button>
                                        <div class="collapse" id="collapse${coin.id}"></div>
                                    </div>
                                </div>`;

                        if (index === 3) {
                            html += endRow;
                            index = 0;
                        }
                        index++;
                    }


                }


                //paste the HTML code
                $("#contentDiv").html(html);

                //if no results
                if (html == "") {
                    $("#contentDiv").html("<p>no results</p>");
                }

                updateToggles();

            })
            .catch(err => alert("error"));

    }


    //update the checked toggles
    function updateToggles() {
        for (let report of reportsArray) {
            $(`#checkID${report.id}`).prop('checked', true);
        }
    }




    //event listener for clicking on a main toggle
    $("#contentDiv").on("change", '[type=checkbox]', event => {

        //if toggle was selected
        if (event.target.checked === true) {


            //find coin symbol and coin id by the toggle element
            const coinSymbol = $(`#${event.target.id}`).parent().next()[0].innerHTML;
            const coinID = $(`#${event.target.id}`).parent().next().next().next()[0].innerHTML;


            //create object of type "coin"
            const coin = {
                symbol: coinSymbol,
                id: coinID
            };

            //if was selected less then max toggles, add to array 
            if (reportsArray.length < reportsArrayLength) {
                reportsArray.push(coin);
                localStorage.setItem("reports", JSON.stringify(reportsArray));
            }

            //modal bar

            //if it's the max amount, open modal bar
            else {
                $('#exampleModal').modal('show');

                let modelBodyContent = "unselect one or more coins to remove: <br><br><br> ";

                //display the selected coins and their toggles
                for (let report of reportsArray) {
                    let html = `
                    <div>
                    <label class="switch">
                        <input type="checkbox" id="modelSwitchID${report.id}" class="modelSwitch">
                        <span class="slider round"></span>
                    </label>
                    <b>${report.symbol}</b><br>
                    ${report.id}<br>
                    <div>
                    <br>
                    `;
                    modelBodyContent += html;

                }
                $("#modelBody").html(modelBodyContent);
                $(`.modelSwitch`).prop('checked', true);


                //if the save button was selected
                $("#saveButtonModal").click(() => {

                    //check the unselected toggles and remove them
                    let toggleWasSelected = false;

                    $(`.modelSwitch`).each((index, element) => {

                        //if the toggle was unchecked
                        if (element.checked === false) {
                            toggleWasSelected = true;
                            reportsArray = $.grep(reportsArray, coin => {
                                if (`modelSwitchID${coin.id}` != element.id) {
                                    return true;
                                }

                                else {
                                    $(`#checkID${coin.id}`).prop('checked', false);

                                    return false;
                                }
                            });
                        }
                    });

                    //if the user unselect one toggle at least - confirm
                    if (toggleWasSelected) {
                        reportsArray.push(coin);
                        localStorage.setItem("reports", JSON.stringify(reportsArray));
                        updateToggles();
                        $('#exampleModal').modal('hide');
                        $("#saveButtonModal").unbind();
                        $(".modalCloseButton").unbind();
                    }

                    //if not, display an alert
                    else {
                        alert("unselect at least one coin");

                    }


                });


                //if the exit button was selected, turn off the toggle that opened the model bar
                $(".modalCloseButton").click(() => {
                    event.target.checked = false;
                    $("#saveButtonModal").unbind();
                    $(".modalCloseButton").unbind();
                });

            }
        }

        //if toggle was unselected, remove the coin from the array
        if (event.target.checked === false) {
            reportsArray = $.grep(reportsArray, report => { return `checkID${report.id}` != event.target.id });
            localStorage.setItem("reports", JSON.stringify(reportsArray));
        }


    });





    //event listener for clicking on "more info" dynamic buttons 
    $("#contentDiv").on("click", "button", (event) => {

        //get the checked coins array from the storage
        let cookie = document.cookie;
        cookie = cookie.replace(/=coin/g, "");
        const cacheCoinsArray = cookie.split("; ");

        
        let existInCache = false;


        //if the user opened the button for more info
        if (event.target.getAttribute("aria-expanded") === "false") {


            //check if the coin was checked in the last two minutes
            cacheCoinsArray.forEach(value => {
                if (value === event.target.id) {
                    existInCache = true;
                }
            });


            const container = $(`#collapse${event.target.id}`).html();

            //if the coin wasn't in use in the last two minutes, or it's the first time after a refresh page
            if (!existInCache || container === "") {

                //save the coin in cache
                var date = new Date(); // Get current date and time.
                date.setMinutes(date.getMinutes() + 2);
                document.cookie = `${event.target.id}=coin; expires=` + date.toUTCString();

                //put a loader
                $(`#collapse${event.target.id}`).html(`
                    <div class="card card-body">
                    <img id="loader${event.target.id}" class="coinLoading" src="/assets/pictures/loading2.gif">
                    </div>
                `);

                //call ajax, update coin's details
                ajaxRequestGetSpecificIcon(event.target.id)
                    .then(coin => {
                        $(`#collapse${coin.id}`).children().html(
                            `
                        <img class="coinImage" src="${coin.image.large}">
                        <p>${coin.market_data.current_price.usd} $<br/>
                        ${coin.market_data.current_price.eur} €<br/>
                        ${coin.market_data.current_price.ils} ₪</p>
                        `);
                    }).catch(err => alert("err"));

            }
        }





    });





    //ajax request, get all icons
    function ajaxRequestGetIcons() {
        return new Promise((resolve, reject) => {

            $.ajax({
                type: 'GET',

                url: `https://api.coingecko.com/api/v3/coins/list`,


                success: list => resolve(list),
                error: err => reject(err),
                beforeSend: function () {
                    // Show image container
                    $("#loader").show();
                },
                complete: function () {
                    // Hide image container
                    $("#loader").hide();
                }
            });

        });

    }


    function ajaxRequestGetSpecificIcon(id) {
        return new Promise((resolve, reject) => {

            $.ajax({
                type: 'GET',
                url: `https://api.coingecko.com/api/v3/coins/${id}`,
                success: list => resolve(list),
                error: err => reject(err),
                beforeSend: function () {
                    // Show image container
                    $(`#loader${id}`).show();
                },
                complete: function () {
                    // Hide image container
                    $(`#loader${id}`).hide();
                }
            });

        });


    }

});