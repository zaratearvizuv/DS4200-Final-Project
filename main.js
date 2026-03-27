// Set up dimensions
let width = 600,
    height = 400;

let margin = {
  top: 50,
  bottom: 80,
  left: 80,
  right: 30
};

// Create SVG
let svg = d3.select('#vis')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', '#f9f9f9');

// Load data from CSV
d3.csv("shopping_behavior_updated.csv").then(function(data) {

  // Aggregate: sum Purchase Amount by Category
  let grouped = d3.rollup(data, 
      v => d3.sum(v, d => +d["Purchase Amount (USD)"]), 
      d => d.Category
  );
  let chartData = Array.from(grouped, ([key, value]) => ({category: key, total: value}));

  // Define scales
  let xScale = d3.scaleBand()
      .domain(chartData.map(d => d.category))
      .range([margin.left, width - margin.right])
      .padding(0.3);

  let yScale = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.total)])
      .range([height - margin.bottom, margin.top]);

  let colorScale = d3.scaleOrdinal()
      .domain(chartData.map(d => d.category))
      .range(["#440154", "#31688e", "#35b779", "#fde725"]);

  // Draw axes
  let xAxis = svg.append('g')
      .call(d3.axisBottom().scale(xScale))
      .attr('transform', `translate(0, ${height - margin.bottom})`);

  // Tilt x-axis labels
  xAxis.selectAll('text')
      .attr('transform', 'rotate(-25)')
      .style('text-anchor', 'end');

  let yAxis = svg.append('g')
      .call(d3.axisLeft().scale(yScale))
      .attr('transform', `translate(${margin.left}, 0)`);

  // X-axis label
  svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 10)
      .text('Category')
      .style('text-anchor', 'middle')
      .style('font-family', 'Arial')
      .style('font-size', '14px');

  // Y-axis label
  svg.append('text')
      .attr('x', 0 - height / 2)
      .attr('y', 20)
      .text('Purchase Amount (USD)')
      .style('text-anchor', 'middle')
      .style('font-family', 'Arial')
      .style('font-size', '14px')
      .attr('transform', 'rotate(-90)');

  // Draw bars
  let bars = svg.selectAll('rect')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.category))
      .attr('y', d => yScale(d.total))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - margin.bottom - yScale(d.total))
      .attr('fill', d => colorScale(d.category));

  // Add mouseover interaction
  bars
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style('fill', 'red');

        // Show tooltip text
        svg.append('text')
            .attr('id', 'tooltip')
            .attr('x', xScale(d.category) + xScale.bandwidth() / 2)
            .attr('y', yScale(d.total) - 10)
            .text('$' + d.total.toLocaleString())
            .style('text-anchor', 'middle')
            .style('font-family', 'Arial')
            .style('font-size', '13px')
            .style('font-weight', 'bold');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style('fill', colorScale(d.category));

        // Remove tooltip
        svg.select('#tooltip').remove();
      });

});