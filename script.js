let dataLoaded = false;


function tryShow() {
  if (dataLoaded) {
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
  }
}


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
const w = 1200;
const h = 600;
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
const svg = d3.select(".container")
       .append("svg")
       .attr("viewBox", `0 0 ${w} ${h}`) // <- makes it scalable
       .attr("preserveAspectRatio", "xMidYMid meet") // <- keeps it centered
       .style("width", "100%")
       .style("height", "auto")
       .attr("id", "svg");

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
              const tooltip = d3.select("#tooltip");
              tooltip
                  .style("opacity", 1)
                  .style("z-index", 0)
                  .attr('data-education', dataEducation)
                  .html(`${edData(d).area_name}, ${edData(d).state}: ${edData(d).bachelorsOrHigher}%`)

              const tooltipWidth = tooltip.node().offsetWidth;
              let left = event.pageX + 15;
              let top = event.pageY - 40;

              if (left + tooltipWidth > window.innerWidth) {
                     left = event.pageX - tooltipWidth - 15;
              }

              tooltip
              .style("left", `${left}px`)
              .style("top", `${top}px`); 
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

const source = d3.select(".container")
  .append("div")
  .attr("id", "source")
  .style("text-align", "right")
  .style("margin-right", `${padding}px`)

source.append("span").text("Source: ");

source.append("a")
  .attr("href", "https://www.ers.usda.gov/data-products/county-level-data-sets/county-level-data-sets-download-data")
  .attr("target", "_blank")
  .text("USDA Economic Research Service");
  
dataLoaded = true;
tryShow();

})


.catch(error => console.log('Error:', error));

const formatPercent = value =>  `${value}%`

function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);
setViewportHeight();
