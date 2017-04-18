$(function() {
    // Graph margin settings
    var margin = {
        top: 10,
        right: 10,
        bottom: 150,
        left: 60
    };

    // SVG width and height
    var width = 960;
    var height = 500;

    // Graph width and height - accounting for margins
    var drawWidth = width - margin.left - margin.right;
    var drawHeight = height - margin.top - margin.bottom;

    /************************************** Create chart wrappers ***************************************/
    // Create a variable `svg` in which you store a selection of the element with id `viz`
    // Set the width and height to your `width` and `height` variables
    var svg = d3.select('#viz').attr('height', height).attr('width', width);

    // Append a `g` element to your svg in which you'll draw your bars. Store the element in a variable called `g`, and
    // Transform the g using `margin.left` and `margin.top`
    
    var g = svg.append('g').attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr('height', drawHeight)
                .attr('width', drawWidth);



    // Load data in using d3's csv function.
    d3.csv('data/airbnb.csv', function(error, data) {


        /************************************** Data prep ***************************************/

        // You'll need to *aggregate* the data such that, for each device-app combo, you have the *count* of the number of occurances
        // Lots of ways to do it, but here's a slick d3 approach: 
        // http://www.d3noob.org/2014/02/grouping-and-summing-data-using-d3nest.html
        var data = d3.nest().key(function(d) {return d.dim_device_app_combo;}).rollup(function(d) {return d.length;}).entries(data);

        /************************************** Defining scales and axes ***************************************/
        x = [];
        y = [];
        for (i = 0; i < data.length; i++) {
            x.push(data[i].key);
            y.push(data[i].value);
        }

        // Create an `xScale` for positioning the bars horizontally. Given the data type, `d3.scaleBand` is a good approach.
        var xScale = d3.scaleBand().range([0, drawWidth]).domain(x);

        // Using `d3.axisBottom`, create an `xAxis` object that holds can be later rendered in a `g` element
        // Make sure to set the scale as your `xScale`
        var xAxis = d3.axisBottom().scale(xScale);

        // Create a variable that stores the maximum count using `d3.max`, and multiply this value by 1.1
        // to create some breathing room in the top of the graph.
        var yTop = d3.max(data, function(data) {return data.value * 1.1});

        // Create a `yScale` for drawing the heights of the bars. Given the data type, `d3.scaleLinear` is a good approach.
        var yScale = d3.scaleLinear().range([drawHeight, 0]).domain([0, yTop]);

        // Using `d3.axisLeft`, create a `yAxis` object that holds can be later rendered in a `g` element
        // Make sure to set the scale as your `yScale`
        var yAxis = d3.axisLeft().scale(yScale);


        /************************************** Rendering Axes and Axis Labels ***************************************/

        // Create an `xAxisLabel` by appending a `g` element to your `svg` variable and give it a class called 'axis'.
        // Transform the `g` element so that it will be properly positioned (need to shift x and y position)
        // Finally, use the `.call` method to render your `xAxis` in your `xAxisLabel`        
        var xAxisLabel = svg.append('g').attr('class', 'axis').attr('transform', 'translate(' + margin.left + "," + (margin.top + drawHeight) + ")").call(xAxis);

        // To rotate the text elements, select all of the `text` elements in your `xAxisLabel and rotate them 45 degrees        
        // This may help: https://bl.ocks.org/mbostock/4403522
        xAxisLabel.selectAll('text').attr('transform', 'rotate(-45)').style("text-anchor", "end");

        // Create a text element to label your x-axis by appending a text element to your `svg` 
        // You'll need to use the `transform` property to position it below the chart
        // Set its class to 'axis-label', and set the text to "Device-App Combinations"
        var xText = svg.append('text').attr('transform', 'translate(' + (margin.left + (drawWidth / 2) - 70) + ',' + (drawHeight + margin.top + 100) + ')')
                        .attr('class', 'axis-label').text("Device-App Combinations"); 

        // Using the same pattern as your x-axis, append another g element and create a y-axis for your graph
        var yAxisLabel = svg.append('g').attr('class', 'axis')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')').call(yAxis);

        // Using the same pattern as your x-axis, append a text element to label your y axis
        // Set its class to 'axis-label', and set the text to "Count"
        var yText = svg.append('text').attr('transform', 'translate(' + (margin.left)+ ',' + (drawHeight / 2 + margin.top) + ')')
                        .attr('class', 'axis-label');//.text('Count'); <- this makes different than the expected output.

        /************************************** Drawing Data ***************************************/

        // Select all elements with the class 'bar' in your `g` element. Then, conduct a data-join
        // with your parsedData array to append 'rect' elements with `he class set as 'bar'
        // Determine which elements are new to the screen (`enter`), and for each element, 
        // Append a `rect` element, setting the `x`, `y`, `width`, and `height` attributes using your data and scales
        var bars = g.selectAll('bar').data(data);

        bars.enter().append('rect')
                .attr('x', function(d) {
                    return xScale(d.key)+5;
                })
                .attr('y', function(d) {
                    return yScale(d.value);
                })
                //.style("fill", "green")
                .attr('class', 'bar')
                .attr('height', function(d) {return drawHeight - yScale(d.value)})
                .attr('width', 45)
                .on("mouseover", function() {
                    d3.select(this).style("fill", "DarkRed");
                })
                .merge(bars);
        //bars.exit();



    });
});