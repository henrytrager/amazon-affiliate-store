function scrapeReddit(subreddit, limitToAmazon, lastId) {  
  var url = "https://www.reddit.com/r/shutupandtakemymoney/hot/.json?count=100"
  if (lastId) url = url + "&after=" + lastId;
  var response = UrlFetchApp.fetch(url);    
  var body = response.getContentText(); 
  var json = JSON.parse(body);  
  var data = [];
    
  for (var i=0; i<json.data.children.length; i++) {
    /* Extract post date, title, description and link from Reddit */
    var item = json.data.children[i].data;
    var url = item.url;
    var updated = item.created;
    var title = item.title;

    var hostname = '';
    try {
      hostname = extractHostname(url);
    } catch(ex) {
    }

    var asin = '';
    try {
      var myRegexp = /\/dp\/([^\/]+)\//g;
      var match = myRegexp.exec(url);
      if (match) {
        asin = match[1];
      }
    } catch(ex) {
    }
    

    if (limitToAmazon === true) {
      if (asin) {
        data.push([asin, hostname, url, title, updated])      
      }
    } else {
      data.push([asin, hostname, url, title, updated])
    }
  }

  return [data, json.data.after];
}

function getValue(entry, name) {
  try {
    var child = entry.getChild(name, ATOM);
    var val = child.getText();
    return val;
  } catch(ex) {
    console.log(ex);
    return '';
  }
}


// Looks for the link in the HTML
function getLink(entry, name) {
  var html = getValue(entry, name);
  var myRegexp = /a href="([^"]+)">\[link\]/g;
  var match = myRegexp.exec(html);
  if (match) {
    return match[1];
  } else {
    return '';
  }
}

// From: https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string
function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}