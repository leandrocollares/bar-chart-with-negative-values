// Bostock's margin convention: https://gist.github.com/mbostock/3019563

var margin = { top: 15, right: 50, bottom: 60, left: 85 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom; 

/* Indentation pattern for method chaining:
   four spaces for methods that preserve the current selection
   two spaces for methods that change the selection. 
*/

var xScale = d3.scaleLinear()
    .range([0, width]);

var yScale = d3.scaleBand()
    .rangeRound([height, 0])
    .padding(0.05);
 
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");   

// Margins between a bar and its label, and between the bottom bar and the x axis, respectively:     

var labelMargin = 5, 
    xAxisMargin = 5; 

/* Countries and respective GDP growth rates are loaded from an external
   csv file: 
*/      
   
d3.csv("data/gdpGrowthRates.csv", type, function (error, data) {

  // Bars are displayed in ascending order: 

  data = data.sort(function(a, b) { return b["gdpGrowth"] - a["gdpGrowth"]; });	
  
  // Scales' input domains are defined taking into consideration the data loaded: 

  xScale.domain(d3.extent(data, function (d) { return d.gdpGrowth; })).nice();
  yScale.domain(data.map(function (d) { return d.country; }));
      
  var xAxis = svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + (height + xAxisMargin) + ")")
      .call(d3.axisBottom(xScale))
    .append("text")
      .attr("x", width / 2)
      .attr("y", 45)
      .style("text-anchor", "middle")
      .attr("fill", "#333333")
      .text("GDP growth rate (%)");  

  var bars = svg.append("g")
      .attr("class", "bars")

  /* The colour #ef3b2c is employed for negative growth rates, whereas #4292c6 is used for 
     positive growth rates.  
  */    

  bars.selectAll("rect")
      .data(data)
    .enter().append("rect")
      .attr("x", function(d) { return xScale(Math.min(0, d.gdpGrowth)); })
      .attr("y", function(d) { return yScale(d.country); })
      .attr("width", function(d) { return Math.abs(xScale(d.gdpGrowth) - xScale(0)); })
      .attr("height", yScale.bandwidth())
      .attr("fill", function(d) { return d.gdpGrowth < 0 ? "#ef3b2c" : "#4292c6"; })

      /* Moving the mouse over a bar causes its colour to change. If the bar
         corresponds to a negative GDP growth rate, the colour is set to #cb181d. 
         Otherwise, the bar colour is set to #2171b5.

         A tooltip with the GDP growth rate is shown next to the bar. 
      */

      .on("mouseover", function(d) {
      	d3.select(this)
            .attr("fill", function(d) { return d.gdpGrowth < 0 ? "#cb181d" : "#2171b5"; }) 

        var xNegativePosition = parseFloat(d3.select(this).attr("x")) - 15;
        var xPositivePosition = parseFloat(d3.select(this).attr("x")) + parseFloat(d3.select(this).attr("width")) + 15;    

        var xPosition = d.gdpGrowth < 0 ? xNegativePosition : xPositivePosition;    

        var yPosition = parseFloat(d3.select(this).attr("y")) + yScale.bandwidth() / 2 + 5;

        // A tooltip containing GDP growth rate is created and positioned: 

        svg.append("text")
           .attr("id", "tooltip")
           .attr("x", xPosition) 
           .attr("y", yPosition)
           .attr("text-anchor", "middle")
           .attr("fill", "#333333")
           .text(d["gdpGrowth"]); 
        })

      /* On a mouseout event the bar's original colour is restored and 
         the tooltip removed:
      */
    
      .on("mouseout", function(d) {
      	d3.select(this)
            .attr("fill", function(d) { return d.gdpGrowth < 0 ? "#ef3b2c" : "#4292c6"; });
        d3.select("#tooltip").remove();    
  });

  /* Bar labels, i.e., country names are positioned accordingly. For negative GDP growth rates,
     labels are placed to the right of the bars. For positive GDP growth rates, labels are placed
     to the left of the bars.
  */
 
  var labels = svg.append("g")
      .attr("class", "labels");

  labels.selectAll("text")
      .data(data)
    .enter().append("text")
      .attr("class", "bar-label")
      .attr("x", xScale(0))
      .attr("y", function(d) { return yScale(d.country); })
      .attr("dx", function(d) { return d.gdpGrowth < 0 ? labelMargin : -labelMargin; })
      .attr("dy", yScale.bandwidth() / 2 + 5)
      .attr("text-anchor", function(d) { return d.gdpGrowth < 0 ? "start" : "end"; })
      .text(function(d) { return d.country });
});

// Strings are converted into numbers: 

function type(d) {
  d.gdpGrowth = +d.gdpGrowth;
  return d;
}