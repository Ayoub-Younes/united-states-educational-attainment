//Fetching data
const educationUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
const countyUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

Promise.all([
  fetch(educationUrl).then(response => response.json()),
  fetch(countyUrl).then(response => response.json())
])
.then(data => {
  const [educationData, countyData] = data;

// Define the dimensions
const w = window.innerWidth * 0.8;
const h = window.innerHeight * 0.8;
const padding = 90;

const edData = d => educationData.find(el => el.fips == d.id)

// Define a color scale
const colorScale = d3.scaleThreshold()
                     .domain(d3.range(3,67,9))
                     .range(d3.schemeBlues[8])

// Convert TopoJSON to GeoJSON
const counties = topojson.feature(countyData, countyData.objects.counties).features;

// Define path
const path = d3.geoPath()

// Create SVG container
const svg = d3.select("svg")
       .attr("width", w)
       .attr("height", h)

svg.selectAll('path')
       .data(counties)
       .enter()
       .append('path')
       .attr('transform', 'scale(0.9) translate(100, 0)')
       .attr('class',"county")
       .attr('data-fips', d => edData(d).fips)
       .attr('data-education', d => edData(d).bachelorsOrHigher)
       .attr("fill", d => colorScale(edData(d).bachelorsOrHigher))
       .attr('d', path)
       .on("mouseover", function(event, d) {
              const dataEducation = this.getAttribute('data-education')
              d3.select("#tooltip")
                  .style("opacity", 1)
                  .style("z-index", 0)
                  .attr('data-education', dataEducation)
                  .html(`${edData(d).area_name}, ${edData(d).state}: ${edData(d).bachelorsOrHigher}%`)
                  .style("left", `${event.pageX}px`)
                  .style("top", `${event.pageY}px`)
          })
       .on("mouseout", function() {
       d3.select("#tooltip")
              .style("opacity", 0)
              .style("z-index", -1)
       });


// Create legend scale
const legendScale = d3.scaleLinear()
                     .domain([3,66])
                     .range([h - 2 * padding, padding]);

// Create legend-axis
const legendAxis = d3.axisLeft(legendScale).tickValues(colorScale.domain()).tickFormat(d => `${d}%`).tickSizeOuter(10).tickSize(10);

// Add legend
const legend = svg.append("g")
              .attr('id', 'legend')
              .attr("transform", `translate(${w - 1.2 * padding},0)`)


legend.call(legendAxis);

const rectSize = (h - 3 * padding) / 7
legend.selectAll("rect")
       .data(colorScale.domain().slice(0, -1))
       .enter()
       .append('rect')
       .attr("class", "rect-legend")
       .attr("transform", `translate(0,${-rectSize})`)
       .attr('y', (d,i) => `${h - 2 * padding - i*rectSize}px`)
       .attr('width', rectSize)
       .attr('height', rectSize)
       .attr('fill', d => colorScale(d))
})


.catch(error => console.log('Error:', error));

const formatPercent = value =>  `${value}%`