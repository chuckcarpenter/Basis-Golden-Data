'use-strict';
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    return define(['b'], function(b) {
      return root.returnExportsGlobal = factory(b);
    });
  } else if (typeof exports === 'object') {
    return module.exports = factory(require("b"));
  } else {
    return root.returnExportsGlobal = factory(root.b);
  }
})(this, function(b) {
  var XMLHttpFactories, auth, createXMLHTTPObject, getData, sendRequest, settings;
  settings = {
    userId: '',
    rootUrl: 'app.mybasis.com',
    protocol: 'https://',
    version: 'v1',
    debug: false,
    offset: 0,
    interval: 60
  };
  sendRequest = function(url, callback, postData) {
    var method, req;
    req = createXMLHTTPObject();
    if (!req) {
      return;
    }
    method = (postData ? "POST" : "GET");
    req.open(method, url, true);
    req.setRequestHeader("Referer", "https://app.mybasis.com");
    if (postData) {
      req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    }
    req.onreadystatechange = function() {
      if (req.readyState !== 4) {
        return;
      }
      if (req.status !== 200 && req.status !== 304) {
        return;
      }
      return callback(req);
    };
    if (req.readyState === 4) {
      return;
    }
    return req.send(postData);
  };
  createXMLHTTPObject = function() {
    var e, i, xmlhttp;
    xmlhttp = false;
    i = 0;
    while (i < XMLHttpFactories.length) {
      try {
        xmlhttp = XMLHttpFactories[i]();
      } catch (_error) {
        e = _error;
        continue;
      }
      break;
      i++;
    }
    return xmlhttp;
  };
  XMLHttpFactories = [
    function() {
      return new XMLHttpRequest();
    }, function() {
      return new ActiveXObject('Msxml2.XMLHTTP');
    }, function() {
      return new ActiveXObject('Msxml3.XMLHTTP');
    }, function() {
      return new ActiveXObject('Microsoft.XMLHTTP');
    }
  ];
  window.auth = function(username, password) {
    var data, log, u;
    console.log(settings);
    u = 'https://app.mybasis.com/login';
    data = new FormData();
    data.append('username', username);
    data.append('password', password);
    sendRequest(u, log, data);
    return log = function(d) {
      return console.log(d);
    };
  };
  getData = function() {};
  return {};
});
