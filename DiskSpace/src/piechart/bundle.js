(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * General constructs to store navigation history.
     *
     * It's implemented as a stack.
     */
    var NavigationHistory = /** @class */ (function () {
        function NavigationHistory(history) {
            this.history = history;
        }
        NavigationHistory.prototype.navigate = function (t) {
            this.history.push(t);
        };
        NavigationHistory.prototype.back = function () {
            if (this.history.length > 0) {
                this.history.pop();
            }
        };
        /**
         * Return the current navigation
         */
        NavigationHistory.prototype.current = function () {
            var len = this.history.length;
            if (len > 0) {
                return this.history[len - 1];
            }
            else {
                return undefined;
            }
        };
        /**
         * Return the previous navigation
         */
        NavigationHistory.prototype.previous = function () {
            var len = this.history.length;
            if (len > 1) {
                return this.history[len - 2];
            }
            else {
                return undefined;
            }
        };
        /**
         * Return the number of entries stored in the history.
         */
        NavigationHistory.prototype.size = function () {
            return this.history.length;
        };
        return NavigationHistory;
    }());
    var HierarchicalPieChart = /** @class */ (function () {
        function HierarchicalPieChart(d3, data, options) {
            if (options === void 0) { options = {}; }
            this.d3 = d3;
            this.data = data;
            this.labelFn = options.labelFn || function (d) { return d.name + ": " + d.description; };
            this.legendFn = options.legendFn || function (d) {
                var name = d.name || "&nbsp;";
                var description = d.description || "&nbsp;";
                return "<h2>" + name + "</h2><p>" + description + "</p>";
            };
            var color = d3.scaleOrdinal(d3.schemeTableau10);
            this.colorFn = options.colorFn || function (d) {
                return color(d.name);
            };
            this.plotWidth = options.plotWidth || 400;
            this.plotHeight = options.plotHeight || this.plotWidth;
            this.legendPosition = options.legendPosition || 'bottom';
            this.animating = false;
            this.arcData = this.processData(this.data, 0, 0, 2 * Math.PI);
            this.arcClickHistory = new NavigationHistory([this.arcData[0]]);
        }
        /**
         * Render hierarchical pie chart on a given element.
         */
        HierarchicalPieChart.prototype.render = function (el) {
            var _this = this;
            if (!el.querySelector(".chart-plot")) {
                var div = document.createElement('div');
                div.setAttribute('class', 'chart-plot');
                el.append(div);
            }
            if (!el.querySelector(".chart-legend")) {
                var div = document.createElement('div');
                div.setAttribute('class', 'chart-legend');
                div.innerHTML = this.legendFn(this.data);
                if (this.legendPosition == 'top') {
                    el.prepend(div);
                }
                else {
                    el.append(div);
                }
            }
            var plotEl = el.querySelector(".chart-plot");
            var legendEl = el.querySelector(".chart-legend");
            var width = this.plotWidth;
            var height = this.plotHeight;
            var maxLevel = this.maxLevel(this.data);
            var svg = this.d3.select(plotEl).selectAll("svg")
                .data([null])
                .join("svg")
                .attr("width", width)
                .attr("height", height);
            var group = svg.selectAll("g")
                .data([null])
                .join("g")
                .attr("transform", "translate(" + width / 2 + "," + height * .52 + ")");
            var thickness = width / 2.0 / (maxLevel + 2) * 1.1;
            var arc = this.d3.arc()
                .startAngle(function (d) { return d.startAngle; })
                .endAngle(function (d) { return d.stopAngle; })
                .innerRadius(function (d) { return 1.1 * d.level * thickness; })
                .outerRadius(function (d) { return (1.1 * d.level + 1) * thickness; });
            var slices = group.selectAll("path")
                .data(this.arcData)
                .join("path")
                .attr("d", arc)
                .style("fill", function (d) { return _this.colorFn(d); });
            this.d3on(slices, "click", this.onClickArc.bind(this, plotEl, arc));
            if (this.labelFn) {
                slices.append("svg:title").text(this.labelFn);
            }
            if (this.legendFn) {
                var legend = this.d3.select(legendEl);
                var updateLegend = function (d) {
                    legend.html(_this.legendFn(d));
                    legend.transition().duration(200).style("opacity", "1");
                };
                var removeLegend = function () {
                    legend.transition().duration(1000).style("opacity", "0");
                };
                this.d3on(slices, "mouseover", updateLegend);
                this.d3on(slices, "mouseout", removeLegend);
            }
        };
        /**
         * Wrapper for `d3obj.on(evtName, fn)`
         */
        HierarchicalPieChart.prototype.d3on = function (d3obj, evtName, fn) {
            var version = parseInt(this.d3.version.split('.')[0]);
            if (version <= 5) {
                d3obj.on(evtName, fn);
            }
            else {
                d3obj.on(evtName, function (evt) {
                    evt.stopPropagation();
                    var args = Array.from(arguments).slice(1);
                    fn.apply(void 0, args);
                });
            }
        };
        /**
         * Interpolates arc during animation.
         */
        HierarchicalPieChart.prototype.arcTween = function (arc, baseArc, targetArc) {
            var _this = this;
            // The function passed to arcTween is invoked for each selected element
            // when the transition starts, and for each element returns the 
            // interpolator to use over the course of transition.
            return function (d) {
                var level = _this.d3.interpolate(_this.getLevel(d, baseArc), _this.getLevel(d, targetArc));
                var startDeg = _this.d3.interpolate(_this.getStartAngle(d, baseArc), _this.getStartAngle(d, targetArc));
                var stopDeg = _this.d3.interpolate(_this.getStopAngle(d, baseArc), _this.getStopAngle(d, targetArc));
                // The argument t ranges from 0, at the start of the transition, to 1, 
                // at the end. It's used to control the animation.
                return function (t) {
                    return arc({
                        startAngle: startDeg(t),
                        stopAngle: stopDeg(t),
                        name: d.name,
                        description: d.description,
                        value: d.value,
                        level: level(t),
                    });
                };
            };
        };
        /**
         * Callback when an arc is clicked.
         *
         * The parameter arc is actually a function returned from calling `d3.arc()`.
         * We're using any because of a lack of d3 type annotations.
         */
        HierarchicalPieChart.prototype.onClickArc = function (plotEl, arc, d) {
            var _this = this;
            if (this.animating) {
                return;
            }
            var svg = this.d3.select(plotEl);
            this.animating = true;
            var revert = false;
            var baseArc = this.arcClickHistory.current();
            var targetArc = d;
            if (d == this.arcClickHistory.current() && this.arcClickHistory.size() > 1) {
                revert = true;
                baseArc = this.arcClickHistory.current();
                targetArc = this.arcClickHistory.previous();
            }
            if (revert) {
                svg.selectAll("path")
                    .filter(function (b) {
                    return (b.startAngle >= targetArc.startAngle &&
                        b.stopAngle <= targetArc.stopAngle &&
                        b.level >= targetArc.level);
                })
                    .transition().duration(1000).style("opacity", "1").attr("pointer-events", "all");
            }
            else {
                svg.selectAll("path")
                    .filter(function (b) {
                    return (b.startAngle < d.startAngle || b.stopAngle > d.stopAngle ||
                        b.level < d.level);
                })
                    .transition().duration(1000).style("opacity", "0").attr("pointer-events", "none");
            }
            svg.selectAll("path")
                .filter(function (b) {
                return (b.startAngle >= d.startAngle &&
                    b.stopAngle <= d.stopAngle &&
                    b.level >= d.level);
            })
                .transition().duration(1000).attrTween("d", this.arcTween(arc, baseArc, targetArc));
            setTimeout(function () {
                _this.animating = false;
                if (!revert) {
                    _this.arcClickHistory.navigate(d);
                }
                else {
                    _this.arcClickHistory.back();
                }
            }, 1000);
        };
        /**
         * Get the depth of the `data` tree
         */
        HierarchicalPieChart.prototype.maxLevel = function (data) {
            var level = 0;
            for (var _i = 0, _a = data.children; _i < _a.length; _i++) {
                var child = _a[_i];
                level = Math.max(this.maxLevel(child) + 1, level);
            }
            return level;
        };
        HierarchicalPieChart.prototype.processData = function (data, level, startAngle, stopAngle, result) {
            result = result || [];
            var total = data.value;
            if (startAngle == stopAngle) {
                return;
            }
            result.push({
                startAngle: startAngle,
                stopAngle: stopAngle,
                name: data.name,
                description: data.description,
                value: data.value,
                level: level,
            });
            var angle = startAngle;
            for (var _i = 0, _a = data.children; _i < _a.length; _i++) {
                var child = _a[_i];
                var angleInc = (stopAngle - startAngle) / total * child.value;
                var childStartAngle = angle;
                var childStopAngle = angle + angleInc;
                this.processData(child, level + 1, childStartAngle, childStopAngle, result);
                angle += angleInc;
            }
            return result;
        };
        HierarchicalPieChart.prototype.getStartAngle = function (d, ref) {
            var span = ref.stopAngle - ref.startAngle;
            return (d.startAngle - ref.startAngle) / span * Math.PI * 2.0;
        };
        HierarchicalPieChart.prototype.getStopAngle = function (d, ref) {
            var span = ref.stopAngle - ref.startAngle;
            return (d.stopAngle - ref.startAngle) / span * Math.PI * 2.0;
        };
        HierarchicalPieChart.prototype.getLevel = function (d, ref) {
            return d.level - ref.level;
        };
        return HierarchicalPieChart;
    }());
    exports.default = HierarchicalPieChart;
    
    },{}],
    
    2:[function(require,module,exports){
    var HierarchicalPieChart = require('../dist/es5/index.js').default
    
    function init() {
      const chart = new HierarchicalPieChart(d3, data)
      chart.render(document.querySelector("#chart"))
    }
    
    //window.onload = init
    window.onresize = init;

    const { invoke } = window.__TAURI__.tauri;
    let greetInputEl;
    var data;

    let json;
  
    async function to_pie_chart(path_search) {
        // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
        console.log(path_search);
        json = await invoke("toPieChart", {path : path_search});
        
        try{
            data = JSON.parse(json);
        } catch(err) {
            console.log(err.message)
        }
    }

    window.onload = () => {
        init;
    }
    window.addEventListener("DOMContentLoaded", () => {
        to_pie_chart("/home/abdelaziz/Downloads").then(init);
        });
    window.addEventListener("DOMContentLoaded", () => {
        greetInputEl = document.querySelector("#input-path");
        document.querySelector('#input-path').addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                to_pie_chart(greetInputEl.value).then(init);
            }
        });
    });

    
    },{"../dist/es5/index.js":1}]},{},[2]);