// Script for drawing interactive line chart
$(function() {
    'use strict';

    /* ********************************** Initial graph settings  ********************************** */
    // Graph margin settings
    var margin = {
        top: 10,
        right: 120,
        bottom: 50,
        left: 80
    };

    // Set default countries
    var selectedCountries = ["Australia", "Austria"];
    var selectedData = [];

    // SVG width and height
    var width = 960;
    var height = 500;

    // Graph width and height - accounting for margins
    var drawWidth = width - margin.left - margin.right;
    var drawHeight = height - margin.top - margin.bottom;

    /* ********************************** Append static elements  ********************************** */
    // Append svg to hold elements
    var svg = d3.select("svg")
        .attr('width', width)
        .attr('height', height);

    // Append g for holding chart markers
    var g = svg.append("g")
        .attr('id', 'graph')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // xAxis labels
    var xAxisLabel = g.append("g")
        .attr('transform', 'translate(0,' + drawHeight + ')')
        .attr('class', 'axis')

    // xAxis Text
    g.append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'translate(' + (drawWidth / 2) + ',' + (drawHeight + margin.top + 40) + ')')
        .style('text-anchor', 'middle')
        .text("Year")

    // yAxis labels
    var yAxisLabel = g.append("g")
        .attr('class', 'axis')

    g.append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (drawHeight / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text("CO2 Emissions (in units of kilotonne CO2 equivalent)")

    // Apend an overlay rectangle to catch hover events
    var overlay = g.append('rect')
        .attr("class", "overlay")
        .attr('width', drawWidth)
        .attr('height', drawHeight);

    // Load data in using d3's csv function
    d3.csv('data/un_co2_data.csv', function(error, data) {

        /* ********************************** Data prep  ********************************** */

        // Nest the data by `country_area` to create an **array of objects**, one for each **country**
        var dataByCountry = d3.nest()
            .key(function(d) {
                return d.country_area;
            })
            .entries(data);

        // Get a unique list of countries to make selector
        var uniqCountries = dataByCountry.map(function(d) {
            return d.key
        });

        // function for filtering data based on selected countries
        function filterData() {
            selectedData = dataByCountry.filter(function(d) {
                return selectedCountries.indexOf(d.key) > -1
            })
        }

        /* ********************************** Country selector  ********************************** */

        // Create a country selector menu     
        var countrySelector = $('#countrySelect');

        // fill in select menu
        uniqCountries.forEach(function(d) {
            var newOption = new Option(d, d);
            countrySelector.append(newOption);
        });

        // Set default selector countries in menu
        countrySelector.val(selectedCountries);

        /* ********************************** Define scale and axis variables  ********************************** */

        // Create an ordinal color scale for coloring lines
        var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        // Global scale and axis variables
        var xFormat = d3.format("d");
        var yFormat = d3.format('.2s')
        var xScale = d3.scaleLinear();
        var yScale = d3.scaleLinear();
        var xAxis = d3.axisBottom().tickFormat(xFormat);;
        var yAxis = d3.axisLeft().tickFormat(yFormat);


        /* ********************************** Functions for setting scales and axes  ********************************** */

        // function for setting scales based on given data
        function setScales() {
            // Get set of all values
            var allValues = [];
            selectedData.forEach(function(d) {
                d.values.forEach(function(d) {
                    allValues.push(+d.value);
                });
            });

            // Reset xScale
            var xExtent = d3.extent(selectedData[0].values, function(d) {
                return +d.year;
            });
            xScale.domain([xExtent[0], xExtent[1]]).rangeRound([0, drawWidth]);

            // Reset yScale
            var yExtent = d3.extent(allValues);
            yScale.domain([yExtent[0] * 0.9, yExtent[1] * 1.1]).rangeRound([drawHeight, 0]);

            // Reset color scale to current set of countries
            console.log(selectedCountries)
            colorScale.domain(selectedCountries);
        }

        function setAxes() {
            xAxis.scale(xScale);
            yAxis.scale(yScale);

            xAxisLabel.transition().duration(1000).call(xAxis);
            yAxisLabel.transition().duration(1000).call(yAxis);
        }


        /* ********************************** Function for calculating line path  ********************************** */

        // Define a line function that will return a `path` element based on data
        // hint: https://bl.ocks.org/mbostock/3883245


        var line = d3.line()
            .x(function(d) { return xScale(+d.year); })
            .y(function(d) { return yScale(+d.value); });


        


        /* ********************************** Function for drawing lines  ********************************** */

        // function for drawing graph
        function draw(data) {
            // Set your scales and axes
            setScales(data);
            setAxes();


            // Do a datajoin between your path elements and the data passed to the draw function
            // Make sure to set the identifying key

            var countries = g.selectAll('.countries')
                .data(data, function(d) { return d.key; });
            

            function getLength() {
                d3.select(this).node().getTotalLength();
            }
            

            // Handle entering elements (see README.md)
            countries.enter()
                .append('path')
                .attr('class', 'countries')
                .attr("fill", "none")
                .attr("d", function(d) {return line(d.values)})
                .attr("stroke", function(d) {return colorScale(d.key);})
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 1.5)
                .attr('stroke-dasharray',  function(d) {
                    var totalLength = d3.select(this).node().getTotalLength();
                    return (totalLength + " " + totalLength);
                })
                .attr("stroke-dashoffset", function(d) {
                    return -d3.select(this).node().getTotalLength();
                })
                .transition()
                .duration(2000)
                .attr("stroke-dashoffset", function(d) {
                    return 0;
                });

            // Handle updating elements (see README.md)
            countries.attr("stroke-dasharray", "none")
                .transition()
                .duration(2000)
                .attr("d", function(d) { return line(d.values) });

            // Handle exiting elements (see README.md)
            countries.exit()
                .transition()
                .duration(2000)
                .attr("stroke-dashoffset", function(d) {
                    return -d3.select(this).node().getTotalLength();
                })
                .attr("stroke-dasharray", function(d) {
                    var totalLength = d3.select(this).node().getTotalLength();
                    return (totalLength + " " + totalLength);
                })
                .remove();

        }

        /* ********************************** Function for drawing hovers (circles/text)  ********************************** */
        // Function to draw hovers (circles and text) based on year (called from the `overlay` mouseover)
        function drawHovers(year) {
            // Bisector function to get closest data point: note, this returns an *index* in your array
            var bisector = d3.bisector(function(d, x) {
                return +d.year - x;
            }).left;


            var nearest = selectedData.map(function(d) { 
                d.values.sort(function(a, b) {
                    return a.year - b.year;
                })
                return d.values[bisector(d.values, +year)]
            });

            var drawCircle = g.selectAll('circle').data(nearest);

            drawCircle.enter()
                .append('circle')
                .merge(drawCircle)
                .attr("stroke-width", 2)
                .attr('r', 10)
                .attr('cx', function(d) {return xScale(d.year);})
                .attr('cy', function(d) {return yScale(d.value);})
                .style('stroke', function(d) {return colorScale(d.country_area);})
                .style('fill', 'none')
                .exit().remove();

            var showText = g.selectAll('.textData').data(nearest);

            showText.enter()
                .append('text')
                .attr('class', 'textData')
                .merge(showText)
                .attr('x', function(d) {return xScale(d.year) + 8;})
                .attr('y', function(d) {return yScale(d.value) - 7;})
                .text(function(d) {return d.country_area + ": " + Math.floor(d.value/1000) + "k";})
                .exit().remove();



        }

        /* ********************************** Event listener  ********************************** */

        // Filter your data and draw the initial layout
        filterData();
        draw(selectedData);

        // Assign an event listener to your overlay element
        /*
            - On mousemove, detect the mouse location and use `xScale.invert` to get the data value that corresponds to the pixel value
        
            - On mouseout, remove all the circles and text from inside the g
        */

        g.select('.overlay')
            .on("mousemove", function() {drawHovers(xScale.invert(d3.mouse(this)[0]));})
            .on("mouseout", function() {
                //d3.select(".overlay")
                g.selectAll(".textData").remove()
                g.selectAll("circle").remove();
            });


        // event listener for country selector change
        countrySelector.change(function() {
            // Reset selected countries
            selectedCountries = [];

            // Get selected countries from selector
            $('#countrySelect option:selected').each(function() {
                selectedCountries.push($(this).text());
            });

            // Filter and draw data
            filterData();
            draw(selectedData);
        });
    });
});