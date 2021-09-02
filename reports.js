/// <reference path="jquery-3.4.1.js" />

"use strict";

$(function () {

    let reportsArray = [];


    //import coins from the local storage to the array
    function updateReportArray() {
        if (localStorage.getItem("reports") != null) {
            reportsArray = JSON.parse(localStorage.getItem("reports"));
        }
        else {
            reportsArray = []
        }
    }



    function ajaxRequestGetETLForCoins(coinsArray) {
        return new Promise((resolve, reject) => {

            //create the part of the coins names for the URL
            let addToURL = "";

            for (let coin of coinsArray) {
                if (addToURL != "")
                    addToURL += `,${coin.symbol}`;
                else
                    addToURL = coin.symbol;
            }

            $.ajax({
                type: 'GET',
                url: `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${addToURL}&tsyms=USD`,
                success: list => resolve(list),
                error: err => reject(err),
            });

        });
    }




    //when the user get into the reports page 
    $("#reportsLink").click(function () {

        $("#searchButton").unbind();

        $("#searchInput").val("");

        updateReportArray();
        $("#contentDiv").empty();

        //create the graph div
        let html = `
            <div id="chartContainer" style="height: 370px; width: 100%;"></div>  
            `;
        $("#contentDiv").append(html);



        //function for the graph
        function toggleDataSeries(e) {
            if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                e.dataSeries.visible = false;
            } else {
                e.dataSeries.visible = true;
            }
            e.chart.render();
        }



        //array for all the coins data
        let allData = [];
        //check if it's the first call from ajax
        let firstTime = true;


        //run every 2 seconds
        const interval = setInterval(() => {
            ajaxRequestGetETLForCoins(reportsArray)
                .then(list => {


                    let symbol; //coin symbol
                    let value;  //coin value


                    //check if it's the first call from ajax
                    if (firstTime) {

                        //get the symbol and the value
                        for (let name in list) {
                            symbol = name;

                            let findValue = list[name];
                            for (let val in findValue) {
                                value = findValue[val];
                            }

                            const date = new Date();

                            //position of the points on the graph
                            const dataPoints = {
                                x: date,
                                y: value
                            };

                            //data of specific coin
                            const dataCoin = {
                                type: "spline",
                                name: name,
                                showInLegend: true,
                                xValueFormatString: "MMM YYYY",
                                yValueFormatString: "#,##0 Units",
                                dataPoints: [dataPoints]
                            };

                            //add the specific coin to all data array 
                            allData.push(dataCoin);

                        }

                        firstTime = false;

                    }

                    //if it's not the first request
                    if (!firstTime) {

                        //index in the all data array
                        let index = 0;

                        //updating the data in the all data array
                        for (let name in list) {
                            symbol = name;

                            allData[index].name = name;

                            let findValue = list[name];
                            for (let val in findValue) {
                                value = findValue[val];
                            }

                            const date = new Date();

                            const dataPoints = {
                                x: date,
                                y: value
                            };

                            allData[index].dataPoints.push(dataPoints);

                            index++;
                        }

                    }




                    //graph properties
                    var options = {
                        exportEnabled: false,
                        animationEnabled: false,
                        title: {
                            text: "Coins to USD"
                        },

                        axisX: {
                            title: "coins and colors"
                        },
                        axisY: {
                            title: "coin value",
                            titleFontColor: "#4F81BC",
                            lineColor: "#4F81BC",
                            labelFontColor: "#4F81BC",
                            tickColor: "#4F81BC",
                            includeZero: false
                        },
                        axisY2: {
                            title: "Profit in USD",
                            titleFontColor: "#C0504E",
                            lineColor: "#C0504E",
                            labelFontColor: "#C0504E",
                            tickColor: "#C0504E",
                            includeZero: false
                        },
                        toolTip: {
                            shared: true
                        },
                        legend: {
                            cursor: "pointer",
                            itemclick: toggleDataSeries
                        },
                        data: allData
                    };

                    $("#chartContainer").CanvasJSChart(options);


                })
                .catch(err => alert(err.message));
        }, 2000);


        //stop interval when exiting
        $("a").click(() => {
            clearInterval(interval);
        });

    });

});