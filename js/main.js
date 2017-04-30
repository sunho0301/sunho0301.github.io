 
$(function() {
    // Reads in  data. On success, runs the rest of the code
    d3.csv('data/2016.csv', function(error, data) {

        // Setting defaults
        var margin = {
                top: 15,
                right: 30,
                bottom: 10,
                left: 120
            },
            width = 1000,
            height = 2000,
            drawWidth = width - margin.left - margin.right,
            drawHeight = height - margin.top - margin.bottom,
            measure = 'Happiness'; // variable to visualize

        data = data.sort(function (a, b) {
            return d3.ascending(a.Happiness, b.Happiness);
        })

        var regions = data.map(function(d) {
            return d.Region;
        });

        var colorScale = d3.scaleOrdinal().domain(regions).range(d3.schemeCategory20);


            // Graph width and height - accounting for margins
        var svg = d3.select("#vis").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.scaleLinear()
            .range([0, width])
            .domain([0, d3.max(data, function (d) {
                return d[measure];
            })]);

        var y = d3.scaleBand()
            .rangeRound([height, 0], .1)
            .domain(data.map(function (d) {
                return d.Country;
            }));

        var yAxis = d3.axisLeft()
            .scale(y)
            .tickSize(0);

        var xAxis = d3.axisTop()
            .scale(x)
            .tickSize(0);

        var gy = svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)

        var gx = svg.append("g")
            .attr("class", "x axis")
            .call(xAxis)

        var bars = svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("g")


        var draw = function() {

            d3.selectAll(".bar").remove();
            d3.selectAll(".label").remove();

            bars.append("rect")
                .attr("class", "bar")
                .attr("y", function (d) {
                    return y(d.Country);
                })
                .transition()
                .duration(750)
                .attr("height", y.bandwidth()-5)
                .attr("x", 0)
                .attr("width", function (d) {
                    return x(d[measure]);
                })
                .style("fill", function(d) {
                    return colorScale(d.Region);
                });
                
            bars.append("text")
                .attr("class", "label")
                //y position of the label is halfway down the bar
                .attr("y", function (d) {
                    return y(d.Country) + y.bandwidth() / 2 + 4;
                })
                .transition()
                .duration(750)
                //x position is 3 pixels to the right of the bar
                .attr("x", function (d) {
                    return x(d[measure]) + 3;
                })
                .text(function (d) {
                    return d[measure];
                });  
 
            bars.exit().remove();
  
        }

        draw();

        // Listen to change events on the input elements
        $("input").on('change', function() {
            // Set your measure variable to the value (which is used in the draw funciton)
            measure = $(this).val();
            draw();
        });
    });
});