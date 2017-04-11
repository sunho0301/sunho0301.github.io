
$(function() {
	Plotly.d3.csv("./data/antibiotics-data.csv", function(err, rows) {
        function unpack(rows, key) {
            return rows.map(function(row) {return row[key];});
        }
        var Bacteria = unpack(rows, "Bacteria");
        var Penicilin = unpack(rows, "Penicilin");
        var Streptomycin = unpack(rows, "Streptomycin");
        var Neomycin = unpack(rows, "Neomycin");
        var GramStaining = unpack(rows, "Gram.Staining");

        // data wrangling
        var Antibiotics = ['Penicilin', 'Streptomycin', 'Neomycin'];
        var df = [];
        for (i = 0; i < 16; i++) {
        	var arr = [];
        	arr.push(Penicilin[i], Streptomycin[i], Neomycin[i]);
        	df.push(arr);
        	var labelArr = [];
        }

        // Q1
		var data1 = [];
        for(i = 0; i < 16; i++) {
        	var trace = {
        		x: Antibiotics,
        		y: df[i],
        		//hoverinfo: 'text',
        		//text: dfLabel[i],
        		name: Bacteria[i],
        		type: 'bar'
        	};
        	data1.push(trace);
        }
        var layout1 = {
        	barmode: 'stack',
        	yaxis: {
        		type: 'log',
        		range: [0,4]
        	}
        };
        Plotly.newPlot('q1', data1, layout1);

        // Q2
        var positive = [];
        var negative = [];
        for(i = 0; i <16; i++) {
        	if (GramStaining[i].localeCompare("positive") == 0) {
        		positive.push(i);
        	} else {
        		negative.push(i);
        	}
        }

        var data2 = [];
        for (i = 0; i <16; i++) {
        	var color;
        	if (positive.includes(i)) {
        		color = 'blue';
        	} else {
        		color = 'red';
        	}
        	var trace = {
        		x: Antibiotics,
        		y: df[i],
        		mode: 'markers',
        		type: 'scatter',
        		name: Bacteria[i],
        		marker: {
        			color: color
        		}
        	};
        	data2.push(trace);
        }
        var layout2 = {
        	yaxis: {
        		type: 'log',
        		range: [0,3],
        		autorange: true
        	}
        }
        Plotly.newPlot('q2', data2, layout2);

        // Q3
        var trace1 = {
        	x: Bacteria,
        	y: Penicilin,
        	name: "Penicilin",
        	type: 'bar'
        };
        var trace2 = {
        	x: Bacteria,
        	y: Streptomycin,
        	name: "Streptomycin",
        	type: 'bar'
        };
        var trace3 = {
        	x: Bacteria,
        	y: Neomycin,
        	name: "Neomycin",
        	type: 'bar'
        };
        var data3 = [trace1, trace2, trace3];
        var layout3 = {
        	barmode: 'group',
        	yaxis: {
        		type: 'log',
        		range: [0,3],
        		autorange: true
        	}
        };
        Plotly.newPlot('q3', data3, layout3);


	});
});