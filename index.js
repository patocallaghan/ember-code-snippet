/*jshint node: true */
'use strict';

var fs   = require('fs');
var mergeTrees = require('broccoli-merge-trees');
var flatiron = require('broccoli-flatiron');
var snippetFinder = require('./snippet-finder');
var findHost = require('./utils/findHost');

module.exports = {
  name: 'ember-code-snippet',

  snippetPaths: function() {
    var app = findHost(this);
    return app.options.snippetPaths || ['snippets'];
  },

  snippetSearchPaths: function(){
    var app = findHost(this);
    return app.options.snippetSearchPaths || ['app'];
  },

  snippetRegexes: function() {
    var app = findHost(this);
    return [{
      begin: /\bBEGIN-SNIPPET\s+(\S+)\b/,
      end: /\bEND-SNIPPET\b/
    }].concat(app.options.snippetRegexes || []);
  },

  includeExtensions: function() {
    var app = findHost(this);
    return app.options.includeFileExtensionInSnippetNames !== false;
  },

  treeForApp: function(tree){
    var snippets = mergeTrees(this.snippetPaths().filter(function(path){
      return fs.existsSync(path);
    }));

    var snippetOptions = {
      snippetRegexes: this.snippetRegexes(),
      includeExtensions: this.includeExtensions()
    };

    snippets = mergeTrees(this.snippetSearchPaths().map(function(path){
      return snippetFinder(path, snippetOptions);
    }).concat(snippets));

    snippets = flatiron(snippets, {
      outputFile: 'snippets.js'
    });

    return mergeTrees([tree, snippets]);
  },

  included: function(app) {
    app.import('vendor/prismjs/prism.js');
    app.import('vendor/prismjs/prism.css');
  }
};
