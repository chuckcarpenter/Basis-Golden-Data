##
 #
 # Basis Gold Data
 #
 # Utility that exports and saves your Basis device's uploaded sensor device data.
 # You can learn more about Basis at http://www.mybasis.com/
 #
 #
##
'use-strict'

((root, factory) ->
  
    if typeof define is 'function' and define.amd
    
        # AMD
        define ['b'], (b) ->
            root.returnExportsGlobal = factory(b)
    
    else if typeof exports is 'object'
    
        # CommonJS
        module.exports = factory(require("b"))

    else
    
        # Global Variables
        root.returnExportsGlobal = factory(root.b)
    
) this, (b) ->

    # Params
    # 
    # ?summary=true
    # &interval=60
    # &units=ms
    # &start_date=2014-01-07
    # &start_offset=-10800
    # &end_offset=10800
    # &heartrate=true
    # &steps=true
    # &calories=true
    # &gsr=true
    # &skin_temp=true
    # &bodystates=true
    # &breaks=4

    # Let's begin with some settings, shall we?
    settings = 
        userId: ''
        rootUrl: 'app.mybasis.com'
        protocol: 'https://'
        version: 'v1'
        debug: false
        offset: 0
        interval: 60

    sendRequest = (url, callback, postData) ->
        req = createXMLHTTPObject()
        return  unless req
        method = (if (postData) then "POST" else "GET")
        req.open method, url, true
        req.setRequestHeader "User-Agent", "XMLHTTP/1.0"
        req.setRequestHeader "Content-type", "application/x-www-form-urlencoded"  if postData
        req.onreadystatechange = ->
            return  unless req.readyState is 4
        
            #           alert('HTTP error ' + req.status);
            return  if req.status isnt 200 and req.status isnt 304
            callback req

        return  if req.readyState is 4
        req.send postData

    createXMLHTTPObject = ->
        xmlhttp = false
        i = 0

        while i < XMLHttpFactories.length
            try
                xmlhttp = XMLHttpFactories[i]()
            catch e
                continue
            break
            i++
        xmlhttp

    XMLHttpFactories = [->
      new XMLHttpRequest()
    , ->
      new ActiveXObject( 'Msxml2.XMLHTTP' )
    , ->
      new ActiveXObject( 'Msxml3.XMLHTTP' )
    , ->
      new ActiveXObject( 'Microsoft.XMLHTTP' )
    ]        

    # Call to get auth token
    auth = (username, password, settings)->   
        u = '#{settings.rootUrl}/login'
        
        data = new FormData()
        data.append 'username', username
        data.append 'password', password

        sendRequest u, log, data

        # xhr = new XMLHttpRequest()
        # xhr.open('POST', 'somewhere', true)
        # xhr.onload = ()->
        #     do something to response
        #     console.log @responseText

        # xhr.send data
        
        log = (data)->
            console.log data

    getData = ()->


    {}