"use strict";
const D3Component = require("idyll-d3-component");
const d3 = require("d3");
const ExternalModel = require("./ExternalModel");
const custom = require("./Customization");
class GraphUI extends D3Component {
    initialize(dom, props) {
        this.svg = d3.select(dom).append('svg');
        this.width = dom.getBoundingClientRect().width;
        this.height = this.width;
        this.svg.attr('width', this.width);
        this.svg.attr('height', this.height);
        this.us = { circles: undefined, circleLabels: undefined, arrows: undefined };
        // todo: should load the file from idyll so don't have to worry about callbacks
        this.em = new ExternalModel('./data/star.json', this);
    }
    // todo: move inside initUI?
    marker(d) {
        let noHashes = custom.ARROW_COLORS[d.type].replace('#', '');
        return 'url(#' + noHashes + ')';
    }
    initUI(es) {
        // necessary for callbacks
        let _this = this;
        // todo: should arrowheads be part of the ui state us?
        // arrowhead
        // http://bl.ocks.org/fancellu/2c782394602a93921faff74e594d1bb1
        this.svg.append('defs').selectAll('marker')
            .data(Object.keys(custom.ARROW_COLORS).map(k => custom.ARROW_COLORS[k]))
            .enter().append('marker')
            .attr('id', d => d.replace('#', ''))
            .attr('viewBox', '-0 -5 10 10')
            .attr('orient', 'auto')
            .attr('markerWidth', 13)
            .attr('markerHeight', 13)
            .attr('xoverflow', 'visible')
            .attr('markerUnits', 'userSpaceOnUse')
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', d => d)
            .style('stroke', 'none');
        // todo: which (render) order should these appear in?
        /* add elements */
        this.us.circles =
            this.svg.append('g')
                .attr('class', 'circles')
                .selectAll('circle')
                .data(es.nodes)
                .enter().append('circle')
                .attr('r', d => +d.radius)
                .attr('cx', d => d.x * this.width)
                .attr('cy', d => d.y * this.height)
                .style('fill', d => custom.CIRCLE_FILL[d.fill])
                .style('stroke', d => custom.CIRCLE_OUTLINE[d.outline])
                .style('stroke-width', '3px');
        this.us.arrows =
            this.svg.append('g')
                .attr('class', 'arrows')
                .selectAll('line')
                .data(es.links)
                .enter().append('line')
                .style('stroke', d => custom.ARROW_COLORS[d.type])
                .style('stroke-width', '4px')
                .attr('marker-end', this.marker);
        // create circle labels
        this.us.circleLabels =
            this.svg.append('g')
                .attr('class', 'circleLabels')
                .selectAll('text')
                .data(es.nodes)
                .enter().append('text')
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .style('font-family', 'FontAwesome')
                .style('font-size', '20px')
                .style('pointer-events', 'none')
                .text(d => d.label)
                .style('fill', 'black');
        /* add event handling */
        this.us.circles
            .on('mouseover', function (d) {
            _this.em.mouseoverNode(d);
        })
            .on('mouseout', function (d) {
            _this.em.mouseoutNode(d);
        })
            .on('mousedown', function (d) {
            _this.em.mousedownNode(d);
        })
            .on('mouseup', function (d) {
            _this.em.mouseupNode(d);
        });
    }
    updatePositions() {
        this.us.circles
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
        // todo: replace with more intelligent code that accounts for arrow heads and size of circles
        this.us.arrows
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        this.us.circleLabels
            .attr('x', d => d.x)
            .attr('y', d => d.y);
    }
    // todo: make this one local OR make a local version of this
    updateSizes(es) {
        this.us.circles
            .data(es.nodes)
            .attr('r', d => d.radius);
    }
    updateOutlines(es) {
        this.us.circles
            .data(es.nodes)
            .style('stroke', d => custom.CIRCLE_OUTLINE[d.outline]);
    }
}
module.exports = GraphUI;
