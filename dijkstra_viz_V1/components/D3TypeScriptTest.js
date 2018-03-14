var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var D3Component = require('idyll-d3-component');
var d3 = require('d3');
var D3TypeScriptTest = /** @class */ (function (_super) {
    __extends(D3TypeScriptTest, _super);
    function D3TypeScriptTest() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    D3TypeScriptTest.prototype.initialize = function (node, props) {
        var svg = d3.select(node).append('svg');
        var width = node.getBoundingClientRect().width;
        var height = width;
        svg.attr('width', width);
        svg.attr('height', height);
        svg
            .append("circle")
            .attr("r", 5)
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("fill", "red");
    };
    return D3TypeScriptTest;
}(D3Component));
module.exports = D3TypeScriptTest;
