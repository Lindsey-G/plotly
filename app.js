// run python -m http.server for local host 8000

// List dataset information for quick reference
/**
 * @param {array} rows 
 * @param {integer} index
 * metadata array [1]:
 * index 0 - id
 * index 1 - ethnicity
 * index 2 - gender
 * index 3 - age
 * index 4 - location
 * index 5 - bbtype
 * index 6 - wfreq
 * samples array[2]:
 * index 0 - id
 * index 1 - otu_ids
 * index 2 - sample_values
 * index 3 - otu_labels
 */

// Set up unpack function for when retrieving data
function unpack(rows, index) {
    return rows.map(function(row) {
        return row[index];
    });
  }

// Create default charts
createPlots('940');

// Create funtion to plot all the charts
function createPlots(newSearchRequest) {

    // Read in json data 
    d3.json("samples.json").then((data) => {
        /** Create variables for names, otu_ids, sample_values, otu_labels, 
        metadata, and wfreq to use on plots*/
        var individualNames = data.names;
        var OTUsIds = unpack(data.samples, 'otu_ids');
        var sampleValues = unpack(data.samples, 'sample_values');
        var OTUsLabels = unpack(data.samples, 'otu_labels');
        var OTUsMetadata = data.metadata;
        var wfreq = unpack(data.metadata, 'wfreq');
        
        // Create empty list for current selected data
        var namesList = [];
        var currentOTUsIds = [];
        var currentSampleValues = [];
        var currentOTUsLabels = [];
        var currentOTUsMetadata = [];
        var currentWFreq = [];

        // for loop to itterate through individualNames array for dropdown menu
        for (var i = 0; i < individualNames.length; i++){
            if (namesList.indexOf(individualNames[i]) === -1 ) {
                namesList.push(individualNames[i]);
            }
        } 
        
        // .append nameList to option to appear on dropdown menu
        for (const [key, value] of Object.entries(namesList)) {
            var menuList = d3.select("#selDataset").append("option");
            menuList.text(`${value}`).attr("value", value);
        }

        // Create function to retrieve data and store in list
        function getNameData(newSearchRequest) {
            // Create empty list to store selected data
            currentOTUsIdsList = [];
            currentSampleValues = [];
            currentOTUsLabel = [];
            currentOTUsMetadata = [];
            currentWFreq = [];

            // for loop to itterate through namesList and match selected data, then 
            // push each value to correct list.
            for (var i = 0; i < namesList.length; i ++) {
                if (namesList[i] === newSearchRequest) {
                    currentOTUsIds.push(OTUsIds[i]);
                    currentSampleValues.push(sampleValues[i]);
                    currentOTUsLabels.push(OTUsLabels[i]);
                    currentOTUsMetadata.push(OTUsMetadata[i]);
                    currentWFreq.push(wfreq[i]);
                }
            }    
        };

        // Call getNameData to use the same parameter and use variables
        getNameData(newSearchRequest);
        
        // Slice data for Top Ten OTU's Bar Chart
        var slicedOTUsIds = currentOTUsIds[0].slice(0, 10);
        var slicedSampleValues = currentSampleValues[0].slice(0, 10);
        var slicedOTUsLabels = currentOTUsLabels[0].slice(0, 10);

        // Reverse data from slice to get descending order
        slicedOTUsIds.reverse();
        slicedSampleValues.reverse();
        slicedOTUsLabels.reverse();

        /** Remove null values from wfreq array, only array with null all others */
        var cleanWFreq = currentWFreq.filter((item) => {
            return item != null;
        }) 

        // Turn Id numbers into string and added "OTU" so that when plotting 
        // bar chart it displays as a string value instead of a range of integer vaules
        var stringIds = [];
        slicedOTUsIds.forEach(item => {
            stringIds.push("OTU" + " " + item + "");
        });        

        // Create Bar Chart for Top Ten OTU Ids using 
        // stringIds, slicedSampleValues, slicedOTUsLables
        var topTenBarChart = [{
            type: 'bar',
            x: slicedSampleValues,
            y: stringIds,
            text: slicedOTUsLabels,
            orientation: 'h',
            marker: {
                color: 'rgba (50,171,96,0.6)',
                line: {
                    color: 'rgba (50, 171, 96, 1.0)',
                    width: 1
                }
            },

        }];

        // Create layout for Bar Chart
        var barChartLayout = {
            title: "Top Ten OTU's",
            // yaxis: {title: "IDS"},
            xaxis: {title: "Sample Values"},
            range: [0, 20],
            domain: [0, 0.5],
            zeroline: false,
            showline: false,
            showticklabels: true,
            showgrid: true,
            legend: {
                x: 0.029,
                y: 1.238,
                font: {
                    family: 'Arial',
                    size: 10
                }
            },
            width: 300,
            height: 500,
            paper_bgcolor: 'rgb (248,248,255)',
            plot_bgcolor: 'rgb(248,248,255)',
            font: {
                family: 'Arial'
            }

        };
        // Display Bar Chart
        Plotly.newPlot("OTUs-top-ten", topTenBarChart, barChartLayout);

        // Create Bubble Chart using currentOTUsIds, currentSampleValues,
        // and current OTUsLabels
        var bubbleChart = [{
            x: currentOTUsIds[0],
            y: currentSampleValues[0],
            text: currentOTUsLabels[0],
            mode: 'markers',
            marker: {
                color: currentOTUsIds[0],
                size: currentSampleValues[0]
            }
        }];

        // Create Layout for Bubble Chart
        var bubbleLayout = {
            title: `All OTU Samples`,
            xaxis: {title: "OTU ID"},
            yaxis: {title: "Sample Values"},
            height: 600,
            width: 1200,
            paper_bgcolor: 'rgb (248,248,255)',
            plot_bgcolor: 'rgb(248,248,255)',
            font: {
                family: 'Arial'
            }
        };
        // Display Bubble Chart
        Plotly.newPlot("bubble", bubbleChart, bubbleLayout);

        // Create Gauge Chart using cleanWFreq
        var gaugePlot = [{
            type: "indicator",
            mode: "gauge+number+delta",
            value: cleanWFreq[0],
            title: {text: "Belly Button Washing Frequency", font: {size: 25}},
            gauge: {
                axis: [
                { range: [0, 1], color: "rgba (97,209,139,)"},
                { range: [1, 2], color: "rgba (77,203,124)"},
                { range: [2, 3], color: "rgba (57,197,110)"},
                { range: [3, 4], color: "rgba (51,177,99)"},
                { range: [4, 5], color: "rgba (50,171,96)"},
                { range: [5, 6], color: "rgba (46,158,88)"},
                { range: [7, 8], color: "rgba (40,138,77)"},
                { range: [8, 9], color: "rgba (34,118,66)"}]
            }

        
        }];
        // Create Layput for Gauge Chart
        var gaugeLayout = {
            width: 500,
            height: 400,
            margin: {t: 25, r: 25, l: 25, b: 25},
            paper_bgcolor: 'lavendar',
            font: {color: "purple", family: "Arial"} 
        };
        // Display Gauge Chart
        Plotly.newPlot("gauge", gaugePlot, gaugeLayout);

        // Create Demographic chart
        // clear menu
        d3.select("#sample-metadata").html("");
    
        // for loop through defaultMetadata entries and append key and values
        // #sample-metadata (panel body)
        for (const [key, value] of Object.entries(currentOTUsMetadata[0])) {
            // Select panel body
            var panelBody = d3.select("#sample-metadata").append("div");
            // .text to append key and value
            panelBody.text(`${key}:${value}`);
        }

});
};

// Even Listener calling on optionChanged()
d3.selectAll("#selDataset").on("change", optionChanged);

// Create optionchanged() to get value from menu and update all the charts by calling createPlots()
function optionChanged(){

    var dropdownMenu = d3.selectAll("#selDataset");
    var dataset = dropdownMenu.property("value");
    
    createPlots(dataset);
};