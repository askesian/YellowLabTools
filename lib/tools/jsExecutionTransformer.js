var debug = require('debug')('ylt:jsExecutionTransformer');

var jsExecutionTransformer = function() {

    this.transform = function(data) {
        var javascriptExecutionTree = {};

        debug('Starting JS execution transformation');

        try {
            javascriptExecutionTree = JSON.parse(data.toolsResults.phantomas.offenders.javascriptExecutionTree[0]);
        
            if (javascriptExecutionTree.children) {
                javascriptExecutionTree.children.forEach(function(node) {
                    
                    // Mark abnormal things with a warning flag
                    var contextLenght = (node.data.callDetails && node.data.callDetails.context) ? node.data.callDetails.context.length : null;
                    if ((node.data.type === 'jQuery - bind' && contextLenght > 5) ||
                            node.data.resultsNumber === 0 ||
                            contextLenght === 0) {
                        node.warning = true;
                    }

                    // Mark errors with an error flag
                    if (node.data.type === 'error' || node.data.type === 'jQuery version change') {
                        node.error = true;
                    }

                    // Mark a performance flag
                    if (['domInteractive', 'domContentLoaded', 'domContentLoadedEnd', 'domComplete'].indexOf(node.data.type) >= 0) {
                        node.windowPerformance = true;
                    }

                    // Read the execution tree and adjust the navigation timings (cause their not very well synchronised)
                    switch(node.data.type) {
                        case 'domInteractive':
                            data.toolsResults.phantomas.metrics.domInteractive = node.data.timestamp;
                            break;
                        case 'domContentLoaded':
                            data.toolsResults.phantomas.metrics.domContentLoaded = node.data.timestamp;
                            break;
                        case 'domContentLoadedEnd':
                            data.toolsResults.phantomas.metrics.domContentLoadedEnd = node.data.timestamp;
                            break;
                        case 'domComplete':
                            data.toolsResults.phantomas.metrics.domComplete = node.data.timestamp;
                            break;
                    }
                });
            }

            debug('JS execution transformation complete');

        } catch(err) {
            throw err;
        }

        return javascriptExecutionTree;
    };
};

module.exports = new jsExecutionTransformer();