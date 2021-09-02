/// <reference path="jquery-3.4.1.js" />

"use strict";

$(function () {

    $("#aboutLink").click(function () {
        $("#contentDiv").empty();
        $("#searchButton").unbind();
        $("#searchInput").val("");

        let html = `
            <h1>coins project</h1>
            <h3>First Name: Itay<br>
            Last Name: Tzdaka</h3>
            <p>This project enables selection and tracking of currencies and their values.</p>
            <img src="assets/pictures/me.jpg" alt="">
            `;
        $("#contentDiv").append(html);
    });

});