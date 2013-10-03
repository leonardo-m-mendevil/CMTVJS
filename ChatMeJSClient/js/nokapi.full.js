$estr = function() { return js.Boot.__string_rec(this,''); }
Firebug = function() { }
Firebug.__name__ = ["Firebug"];
Firebug.enable = function() {
	haxe.Log.trace = $closure(Firebug,"log");
}
Firebug.log = function(msg,infos) {
	var win = js.Lib.window;
	win.console.log(msg);
}
Firebug.prototype.__class__ = Firebug;
Hash = function(p) { if( p === $_ ) return; {
	this.h = {}
	if(this.h.__proto__ != null) {
		this.h.__proto__ = null;
		delete(this.h.__proto__);
	}
	else null;
}}
Hash.__name__ = ["Hash"];
Hash.prototype.exists = function(key) {
	try {
		key = "$" + key;
		return this.hasOwnProperty.call(this.h,key);
	}
	catch( $e0 ) {
		{
			var e = $e0;
			{
				
				for(var i in this.h)
					if( i == key ) return true;
			;
				return false;
			}
		}
	}
}
Hash.prototype.get = function(key) {
	return this.h["$" + key];
}
Hash.prototype.h = null;
Hash.prototype.iterator = function() {
	return { ref : this.h, it : this.keys(), hasNext : function() {
		return this.it.hasNext();
	}, next : function() {
		var i = this.it.next();
		return this.ref["$" + i];
	}}
}
Hash.prototype.keys = function() {
	var a = new Array();
	
			for(var i in this.h)
				a.push(i.substr(1));
		;
	return a.iterator();
}
Hash.prototype.remove = function(key) {
	if(!this.exists(key)) return false;
	delete(this.h["$" + key]);
	return true;
}
Hash.prototype.set = function(key,value) {
	this.h["$" + key] = value;
}
Hash.prototype.toString = function() {
	var s = new StringBuf();
	s.b[s.b.length] = "{";
	var it = this.keys();
	{ var $it1 = it;
	while( $it1.hasNext() ) { var i = $it1.next();
	{
		s.b[s.b.length] = i;
		s.b[s.b.length] = " => ";
		s.b[s.b.length] = Std.string(this.get(i));
		if(it.hasNext()) s.b[s.b.length] = ", ";
	}
	}}
	s.b[s.b.length] = "}";
	return s.b.join("");
}
Hash.prototype.__class__ = Hash;
knocknok = {}
knocknok.Tag = function(url) { if( url === $_ ) return; {
	this.topicId = "";
	this.sourceId = "";
	this.ready = false;
	this.launchRequested = false;
	this.url = url;
	if(url == null || url.length <= 0) {
		url = js.Lib.window.location.href;
	}
	this.id = Std.string(knocknok.Tag.idCounter);
	knocknok.Tag.idCounter += 1;
	knocknok.Tag.tagRegistry.set(this.id,this);
	this.iconHTML = "<div id=\"noktag" + this.id + "\" onclick=\"knocknok.Tag.launchTag('" + this.id + "')\" style=\"width: {WIDTH}px; height: 22px; cursor: hand; cursor: pointer;\"><div style=\"float: left\"><img src=\"http://static.knocknok.com/discussionator/nok.gif\" width=\"28\" height=\"22\" /></div><div style=\"float: right; font-size: 12px; padding-top: 5px; font-family: Helvetica; color: #EF4023; font-weight: bold;\">Chat Now ({NUM_SUBSCRIBERS})</div></div>";
	var req = new knocknok.WebRequest("http://d.api.knocknok.com/source/register/" + StringTools.urlEncode(url));
	req.addEventListener(events.WebRequestEvent.SUCCESS,$closure(this,"_urlRegistered"));
	req.send();
}}
knocknok.Tag.__name__ = ["knocknok","Tag"];
knocknok.Tag.launchTag = function(id) {
	var tag = knocknok.Tag.tagRegistry.get(id);
	if(tag == null) {
		return;
	}
	tag.launch();
}
knocknok.Tag.updateSubscribersCount = function() {
	var itr = knocknok.Tag.topics.keys();
	while(itr.hasNext()) {
		var key = itr.next();
		var topic = knocknok.Tag.topics.get(key);
		knocknok.Global.log("Updating subscriber count for topic: " + key);
		topic.updateSubscribersCount();
	}
}
knocknok.Tag.prototype._getIconHTML = function() {
	var html = this.iconHTML;
	var width = 110;
	var topic = knocknok.Tag.topics.get(this.topicId);
	var count = 0;
	if(topic != null) {
		if(topic.subscribersCount >= 10) {
			width = 115;
		}
		else if(topic.subscribersCount >= 100) {
			width = 122;
		}
		count = topic.subscribersCount;
	}
	html = StringTools.replace(html,"{WIDTH}",Std.string(width));
	html = StringTools.replace(html,"{NUM_SUBSCRIBERS}",Std.string(count));
	return html;
}
knocknok.Tag.prototype._onSubscribersCount = function(e) {
	this._updateHTML();
}
knocknok.Tag.prototype._updateHTML = function() {
	var tag = js.Lib.document.getElementById("noktag" + this.id);
	if(tag == null) {
		return;
	}
	tag.innerHTML = this._getIconHTML();
}
knocknok.Tag.prototype._urlRegistered = function(e) {
	var result = e.data;
	this.topicId = result.topic.topic_id;
	if(!knocknok.Tag.topics.exists(this.topicId)) {
		var t = new knocknok.Topic(this.topicId);
		t.title = result.topic.title;
		t.updateSubscribersCount();
		knocknok.Tag.topics.set(this.topicId,t);
	}
	knocknok.Tag.topics.get(this.topicId).addEventListener(events.TopicEvent.SUBSCRIBER_COUNT_CHANGED,$closure(this,"_onSubscribersCount"));
	this.sourceId = result.source.source_id;
	this.ready = true;
	this.onReady(this.url);
	if(this.launchRequested) {
		this.launch();
	}
	this._updateHTML();
}
knocknok.Tag.prototype.iconHTML = null;
knocknok.Tag.prototype.id = null;
knocknok.Tag.prototype.launch = function() {
	var topic = knocknok.Tag.topics.get(this.topicId);
	if(!this.ready || topic == null) {
		this.launchRequested = true;
		return;
	}
	var opts = StringTools.urlEncode(knocknok.Base64.encode(hxJSON.Json.encode({ topicId : topic.id, topicTitle : topic.title, sourceId : this.sourceId})));
	var width = "700";
	var height = "600";
	var winid = "discussionator" + this.id;
	var url = "http://cdn.knocknok.com/d/v2/index.html?opts=" + opts;
	js.Lib.window.open(url,winid,"width=" + width + ",height=" + height + ",resizable=no,scrollbars=no");
}
knocknok.Tag.prototype.launchRequested = null;
knocknok.Tag.prototype.onReady = function(url) {
	null;
}
knocknok.Tag.prototype.output = function() {
	var html = this.iconHTML;
	js.Lib.document.write(this._getIconHTML());
	if(knocknok.Tag.subscribersTimer == null) {
		knocknok.Tag.subscribersTimer = new haxe.Timer(10000);
		knocknok.Tag.subscribersTimer.run = $closure(knocknok.Tag,"updateSubscribersCount");
	}
}
knocknok.Tag.prototype.ready = null;
knocknok.Tag.prototype.sourceId = null;
knocknok.Tag.prototype.topicId = null;
knocknok.Tag.prototype.url = null;
knocknok.Tag.prototype.__class__ = knocknok.Tag;
knocknok.Global = function() { }
knocknok.Global.__name__ = ["knocknok","Global"];
knocknok.Global.isIE = null;
knocknok.Global.isOpera = null;
knocknok.Global.isFF = null;
knocknok.Global.isSafari = null;
knocknok.Global.browserVersion = null;
knocknok.Global._eventDispatcher = null;
knocknok.Global.main = function() {
	knocknok.Global._eventDispatcher = new events.EventDispatcher();
	var nav = js.Lib.window.navigator;
	knocknok.Global.userAgent = nav.userAgent;
	knocknok.Global.useSockets = false;
	knocknok.Global.browserVersion = Std.parseFloat(nav.appVersion);
	knocknok.Global.screenResolution = Std.string(js.Lib.window.screen.width) + "x" + Std.string(js.Lib.window.screen.height);
	var r = new EReg("Firefox","i");
	knocknok.Global.isFF = r.match(knocknok.Global.userAgent);
	r = new EReg("MSIE","i");
	knocknok.Global.isIE = r.match(knocknok.Global.userAgent);
	r = new EReg("Opera","i");
	knocknok.Global.isOpera = r.match(knocknok.Global.userAgent);
	r = new EReg("Safari","i");
	knocknok.Global.isSafari = r.match(knocknok.Global.userAgent);
	knocknok.Global.addEventListener(knocknok.Global.DOJO_LOADED,$closure(knocknok.WebRequest,"onDojoLoaded"));
	var scripts = js.Lib.document.getElementsByTagName("script");
	var i = 0;
	var found = false;
	while(i < scripts.length && !found) {
		var script = scripts[i];
		var src = knocknok.Global.toAbsURL(script.src);
		if(src.indexOf("embed.js") > 0) {
			knocknok.Global.baseURL = src.substr(0,src.lastIndexOf("/embed.js"));
			found = true;
		}
		i += 1;
	}
}
knocknok.Global.addEventListener = function(eventType,fn) {
	knocknok.Global._eventDispatcher.addEventListener(eventType,fn);
}
knocknok.Global.removeEventListener = function(eventType,fn) {
	knocknok.Global._eventDispatcher.removeEventListener(eventType,fn);
}
knocknok.Global.log = function(msg) {
	var w = js.Lib.window;
	if(w.console) {
		w.console.log(msg);
	}
}
knocknok.Global.toAbsURL = function(s) {
	var doc = js.Lib.document;
	var l = doc.location;
	var h;
	var p;
	var i;
	var r = new EReg("^\\w+:","");
	if(r.match(s)) {
		return s;
	}
	h = l.protocol + "//" + l.host;
	if(s.indexOf("/") == 0) {
		return h + s;
	}
	r = new EReg("/[^/]*$","");
	p = r.replace(l.pathname,"");
	return h + p + "/" + s;
	return s;
}
knocknok.Global.prototype.__class__ = knocknok.Global;
StringTools = function() { }
StringTools.__name__ = ["StringTools"];
StringTools.urlEncode = function(s) {
	return encodeURIComponent(s);
}
StringTools.urlDecode = function(s) {
	return decodeURIComponent(s.split("+").join(" "));
}
StringTools.htmlEscape = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
}
StringTools.htmlUnescape = function(s) {
	return s.split("&gt;").join(">").split("&lt;").join("<").split("&amp;").join("&");
}
StringTools.startsWith = function(s,start) {
	return (s.length >= start.length && s.substr(0,start.length) == start);
}
StringTools.endsWith = function(s,end) {
	var elen = end.length;
	var slen = s.length;
	return (slen >= elen && s.substr(slen - elen,elen) == end);
}
StringTools.isSpace = function(s,pos) {
	var c = s.charCodeAt(pos);
	return (c >= 9 && c <= 13) || c == 32;
}
StringTools.ltrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) {
		r++;
	}
	if(r > 0) return s.substr(r,l - r);
	else return s;
}
StringTools.rtrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,l - r - 1)) {
		r++;
	}
	if(r > 0) {
		return s.substr(0,l - r);
	}
	else {
		return s;
	}
}
StringTools.trim = function(s) {
	return StringTools.ltrim(StringTools.rtrim(s));
}
StringTools.rpad = function(s,c,l) {
	var sl = s.length;
	var cl = c.length;
	while(sl < l) {
		if(l - sl < cl) {
			s += c.substr(0,l - sl);
			sl = l;
		}
		else {
			s += c;
			sl += cl;
		}
	}
	return s;
}
StringTools.lpad = function(s,c,l) {
	var ns = "";
	var sl = s.length;
	if(sl >= l) return s;
	var cl = c.length;
	while(sl < l) {
		if(l - sl < cl) {
			ns += c.substr(0,l - sl);
			sl = l;
		}
		else {
			ns += c;
			sl += cl;
		}
	}
	return ns + s;
}
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
}
StringTools.hex = function(n,digits) {
	var neg = false;
	if(n < 0) {
		neg = true;
		n = -n;
	}
	var s = n.toString(16);
	s = s.toUpperCase();
	if(digits != null) while(s.length < digits) s = "0" + s;
	if(neg) s = "-" + s;
	return s;
}
StringTools.prototype.__class__ = StringTools;
knocknok.UUID = function() { }
knocknok.UUID.__name__ = ["knocknok","UUID"];
knocknok.UUID.generate = function() {
	var dg = new Date(1582,12,15,0,0,0);
	var dc = Date.now();
	var t = Math.floor(dc.getTime() - dg.getTime());
	var h = "-";
	var tl = knocknok.UUID.getIntegerBits(t,0,31);
	var tm = knocknok.UUID.getIntegerBits(t,32,47);
	var thv = knocknok.UUID.getIntegerBits(t,48,59) + "1";
	var csar = knocknok.UUID.getIntegerBits(knocknok.UUID.rand(4095),0,7);
	var csl = knocknok.UUID.getIntegerBits(knocknok.UUID.rand(4095),0,7);
	var n = knocknok.UUID.getIntegerBits(knocknok.UUID.rand(8191),0,7) + knocknok.UUID.getIntegerBits(knocknok.UUID.rand(8191),8,15) + knocknok.UUID.getIntegerBits(knocknok.UUID.rand(8191),0,7) + knocknok.UUID.getIntegerBits(knocknok.UUID.rand(8191),8,15) + knocknok.UUID.getIntegerBits(knocknok.UUID.rand(8191),0,15);
	return tl + h + tm + h + thv + h + csar + csl + h + n;
}
knocknok.UUID.getIntegerBits = function(val,start,end) {
	var base16 = knocknok.UUID.returnBase(val,16);
	var quadArray = new Array();
	var quadString = "";
	var i = 0;
	while(i < base16.length) {
		quadArray.push(base16.substr(i,1));
		i++;
	}
	i = Math.floor(start / 4);
	while(i <= Math.floor(end / 4)) {
		if(quadArray[i] == null || quadArray[i] == "") quadString += "0";
		else quadString += quadArray[i];
		i++;
	}
	return quadString;
}
knocknok.UUID.returnBase = function(num,base) {
	var convert = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
	if(num < base) {
		return Std.string(num);
	}
	else {
		var MSD = Math.floor((num + 0.0) / (base + 0.0));
		var LSD = num - MSD * base;
		if(MSD >= base) {
			return knocknok.UUID.returnBase(MSD,base) + convert[LSD];
		}
		else {
			return convert[MSD] + convert[LSD];
		}
	}
}
knocknok.UUID.rand = function(max) {
	return Math.floor(Math.random() * (max + 1));
}
knocknok.UUID.prototype.__class__ = knocknok.UUID;
Reflect = function() { }
Reflect.__name__ = ["Reflect"];
Reflect.hasField = function(o,field) {
	if(o.hasOwnProperty != null) return o.hasOwnProperty(field);
	var arr = Reflect.fields(o);
	{ var $it2 = arr.iterator();
	while( $it2.hasNext() ) { var t = $it2.next();
	if(t == field) return true;
	}}
	return false;
}
Reflect.field = function(o,field) {
	var v = null;
	try {
		v = o[field];
	}
	catch( $e3 ) {
		{
			var e = $e3;
			null;
		}
	}
	return v;
}
Reflect.setField = function(o,field,value) {
	o[field] = value;
}
Reflect.callMethod = function(o,func,args) {
	return func.apply(o,args);
}
Reflect.fields = function(o) {
	if(o == null) return new Array();
	var a = new Array();
	if(o.hasOwnProperty) {
		
					for(var i in o)
						if( o.hasOwnProperty(i) )
							a.push(i);
				;
	}
	else {
		var t;
		try {
			t = o.__proto__;
		}
		catch( $e4 ) {
			{
				var e = $e4;
				{
					t = null;
				}
			}
		}
		if(t != null) o.__proto__ = null;
		
					for(var i in o)
						if( i != "__proto__" )
							a.push(i);
				;
		if(t != null) o.__proto__ = t;
	}
	return a;
}
Reflect.isFunction = function(f) {
	return typeof(f) == "function" && f.__name__ == null;
}
Reflect.compare = function(a,b) {
	return ((a == b)?0:((((a) > (b))?1:-1)));
}
Reflect.compareMethods = function(f1,f2) {
	if(f1 == f2) return true;
	if(!Reflect.isFunction(f1) || !Reflect.isFunction(f2)) return false;
	return f1.scope == f2.scope && f1.method == f2.method && f1.method != null;
}
Reflect.isObject = function(v) {
	if(v == null) return false;
	var t = typeof(v);
	return (t == "string" || (t == "object" && !v.__enum__) || (t == "function" && v.__name__ != null));
}
Reflect.deleteField = function(o,f) {
	if(!Reflect.hasField(o,f)) return false;
	delete(o[f]);
	return true;
}
Reflect.copy = function(o) {
	var o2 = { }
	{
		var _g = 0, _g1 = Reflect.fields(o);
		while(_g < _g1.length) {
			var f = _g1[_g];
			++_g;
			o2[f] = Reflect.field(o,f);
		}
	}
	return o2;
}
Reflect.makeVarArgs = function(f) {
	return function() {
		var a = new Array();
		{
			var _g1 = 0, _g = arguments.length;
			while(_g1 < _g) {
				var i = _g1++;
				a.push(arguments[i]);
			}
		}
		return f(a);
	}
}
Reflect.prototype.__class__ = Reflect;
events = {}
events.EventDispatcher = function(p) { if( p === $_ ) return; {
	this._listeners = new Hash();
}}
events.EventDispatcher.__name__ = ["events","EventDispatcher"];
events.EventDispatcher.prototype._listeners = null;
events.EventDispatcher.prototype.addEventListener = function(eventType,fn) {
	var fns = null;
	if(!this._listeners.exists(eventType)) {
		fns = new List();
		this._listeners.set(eventType,fns);
	}
	fns = this._listeners.get(eventType);
	fns.add(fn);
	this._listeners.set(eventType,fns);
}
events.EventDispatcher.prototype.dispatchEvent = function(e) {
	if(!this._listeners.exists(e.type)) {
		return;
	}
	var fns = this._listeners.get(e.type);
	var i = fns.iterator();
	while(i.hasNext()) {
		var fn = i.next();
		fn(e);
	}
}
events.EventDispatcher.prototype.removeEventListener = function(eventType,fn) {
	if(!this._listeners.exists(eventType)) {
		return;
	}
	var fns = this._listeners.get(eventType);
	fns.remove(fn);
	this._listeners.set(eventType,fns);
}
events.EventDispatcher.prototype.__class__ = events.EventDispatcher;
knocknok.WebRequestBase = function(url,method) { if( url === $_ ) return; {
	if(method == null) method = "GET";
	events.EventDispatcher.apply(this,[]);
	this._loading = false;
	this._url = url;
	this._method = method;
	this._params = new Hash();
	this._requestTimeout = 30;
}}
knocknok.WebRequestBase.__name__ = ["knocknok","WebRequestBase"];
knocknok.WebRequestBase.__super__ = events.EventDispatcher;
for(var k in events.EventDispatcher.prototype ) knocknok.WebRequestBase.prototype[k] = events.EventDispatcher.prototype[k];
knocknok.WebRequestBase.prototype._loading = null;
knocknok.WebRequestBase.prototype._method = null;
knocknok.WebRequestBase.prototype._onRequestError = function(result) {
	this._loading = false;
	this._requestTimer.stop();
	this.dispatchEvent(new events.WebRequestEvent(events.WebRequestEvent.ERROR,result));
}
knocknok.WebRequestBase.prototype._onRequestSuccess = function(result) {
	this._loading = false;
	this._requestTimer.stop();
	this.dispatchEvent(new events.WebRequestEvent(events.WebRequestEvent.SUCCESS,result));
}
knocknok.WebRequestBase.prototype._onRequestTimeout = function() {
	this._loading = false;
	this._requestTimer.stop();
	this.dispatchEvent(new events.WebRequestEvent(events.WebRequestEvent.TIMEOUT,"Web request has timed out."));
}
knocknok.WebRequestBase.prototype._params = null;
knocknok.WebRequestBase.prototype._requestTimeout = null;
knocknok.WebRequestBase.prototype._requestTimer = null;
knocknok.WebRequestBase.prototype._url = null;
knocknok.WebRequestBase.prototype.addParam = function(key,val) {
	this._params.set(key,val);
}
knocknok.WebRequestBase.prototype.isLoading = function() {
	return this._loading;
}
knocknok.WebRequestBase.prototype.removeParam = function(key) {
	this._params.remove(key);
}
knocknok.WebRequestBase.prototype.send = function() {
	if(this._requestTimeout > 0) {
		this._requestTimer = new haxe.Timer(this._requestTimeout * 1000);
		this._requestTimer.run = $closure(this,"_onRequestTimeout");
	}
}
knocknok.WebRequestBase.prototype.setTimeout = function(timeout) {
	this._requestTimeout = timeout;
}
knocknok.WebRequestBase.prototype.__class__ = knocknok.WebRequestBase;
List = function(p) { if( p === $_ ) return; {
	this.length = 0;
}}
List.__name__ = ["List"];
List.prototype.add = function(item) {
	var x = [item];
	if(this.h == null) this.h = x;
	else this.q[1] = x;
	this.q = x;
	this.length++;
}
List.prototype.clear = function() {
	this.h = null;
	this.q = null;
	this.length = 0;
}
List.prototype.filter = function(f) {
	var l2 = new List();
	var l = this.h;
	while(l != null) {
		var v = l[0];
		l = l[1];
		if(f(v)) l2.add(v);
	}
	return l2;
}
List.prototype.first = function() {
	return (this.h == null?null:this.h[0]);
}
List.prototype.h = null;
List.prototype.isEmpty = function() {
	return (this.h == null);
}
List.prototype.iterator = function() {
	return { h : this.h, hasNext : function() {
		return (this.h != null);
	}, next : function() {
		if(this.h == null) return null;
		var x = this.h[0];
		this.h = this.h[1];
		return x;
	}}
}
List.prototype.join = function(sep) {
	var s = new StringBuf();
	var first = true;
	var l = this.h;
	while(l != null) {
		if(first) first = false;
		else s.b[s.b.length] = sep;
		s.b[s.b.length] = l[0];
		l = l[1];
	}
	return s.b.join("");
}
List.prototype.last = function() {
	return (this.q == null?null:this.q[0]);
}
List.prototype.length = null;
List.prototype.map = function(f) {
	var b = new List();
	var l = this.h;
	while(l != null) {
		var v = l[0];
		l = l[1];
		b.add(f(v));
	}
	return b;
}
List.prototype.pop = function() {
	if(this.h == null) return null;
	var x = this.h[0];
	this.h = this.h[1];
	if(this.h == null) this.q = null;
	this.length--;
	return x;
}
List.prototype.push = function(item) {
	var x = [item,this.h];
	this.h = x;
	if(this.q == null) this.q = x;
	this.length++;
}
List.prototype.q = null;
List.prototype.remove = function(v) {
	var prev = null;
	var l = this.h;
	while(l != null) {
		if(l[0] == v) {
			if(prev == null) this.h = l[1];
			else prev[1] = l[1];
			if(this.q == l) this.q = prev;
			this.length--;
			return true;
		}
		prev = l;
		l = l[1];
	}
	return false;
}
List.prototype.toString = function() {
	var s = new StringBuf();
	var first = true;
	var l = this.h;
	s.b[s.b.length] = "{";
	while(l != null) {
		if(first) first = false;
		else s.b[s.b.length] = ", ";
		s.b[s.b.length] = Std.string(l[0]);
		l = l[1];
	}
	s.b[s.b.length] = "}";
	return s.b.join("");
}
List.prototype.__class__ = List;
knocknok.WebRequest = function(url,method) { if( url === $_ ) return; {
	if(method == null) method = "GET";
	method = "GET";
	knocknok.WebRequestBase.apply(this,[url,method]);
	this._ignoreOnLoad = false;
	knocknok.WebRequest._instanceCount++;
	this._id = Std.string(knocknok.WebRequest._instanceCount);
	if(this._method == "GET") {
		knocknok.WebRequest.Callbacks.set(this._id,$closure(this,"onWebRequestResult"));
		this.addParam("jsonp","knocknok.WebRequest.Callbacks.get('" + this._id + "')");
		this._head = js.Lib.document.getElementsByTagName("head")[0];
		this._script = js.Lib.document.createElement("script");
		this._script.setAttribute("type","text/javascript");
		this._script.setAttribute("id","nokscript" + this._id);
	}
}}
knocknok.WebRequest.__name__ = ["knocknok","WebRequest"];
knocknok.WebRequest.__super__ = knocknok.WebRequestBase;
for(var k in knocknok.WebRequestBase.prototype ) knocknok.WebRequest.prototype[k] = knocknok.WebRequestBase.prototype[k];
knocknok.WebRequest.onDojoLoaded = function(e) {
	var i = knocknok.WebRequest._QueuedRequests.iterator();
	while(i.hasNext()) {
		var request = i.next();
		request.send();
	}
}
knocknok.WebRequest.prototype._head = null;
knocknok.WebRequest.prototype._id = null;
knocknok.WebRequest.prototype._ignoreOnLoad = null;
knocknok.WebRequest.prototype._script = null;
knocknok.WebRequest.prototype.cleanup = function() {
	if(this._method == "GET") {
		this._head.removeChild(this._script);
	}
}
knocknok.WebRequest.prototype.onWebRequestResult = function(data) {
	this._loading = false;
	this._requestTimer.stop();
	this.dispatchEvent(new events.WebRequestEvent(events.WebRequestEvent.SUCCESS,data));
	this.cleanup();
}
knocknok.WebRequest.prototype.send = function() {
	if(this._method == "GET") {
		var srcUrl = this._url;
		if(srcUrl.indexOf("?") < 0) {
			srcUrl = srcUrl + "?";
		}
		var i = 0;
		var itr = this._params.keys();
		while(itr.hasNext()) {
			i++;
			var key = itr.next();
			var val = this._params.get(key);
			if(i != 1) {
				srcUrl = srcUrl + "&";
			}
			srcUrl = srcUrl + key + "=" + StringTools.urlEncode(val);
		}
		this._url = srcUrl;
		this._script.setAttribute("src",this._url);
		this._head.appendChild(this._script);
	}
	else {
		var method = "POST";
		var opts = { url : this._url}
		opts.content = { }
		var itr = this._params.keys();
		while(itr.hasNext()) {
			var key = itr.next();
			var val = hxJSON.Json.encode(this._params.get(key));
			eval('opts.content.' + key + ' = ' + val);
		}
		if(!knocknok.Global.dojoLoaded) {
			knocknok.WebRequest._QueuedRequests.add(this);
			return;
		}
		var deferred = dojox.io.windowName.send(method,opts);
		deferred.addBoth(this._webRequestComplete);
	}
	knocknok.WebRequestBase.prototype.send.apply(this,[]);
}
knocknok.WebRequest.prototype.__class__ = knocknok.WebRequest;
knocknok.ApiRequest = function(path,method) { if( path === $_ ) return; {
	if(method == null) method = "GET";
	knocknok.WebRequest.apply(this,["http://knockserver.chat.unitedfuture.com:8080" + path,method]);
	this.addParam("nocache",Std.string(Math.random()));
}}
knocknok.ApiRequest.__name__ = ["knocknok","ApiRequest"];
knocknok.ApiRequest.__super__ = knocknok.WebRequest;
for(var k in knocknok.WebRequest.prototype ) knocknok.ApiRequest.prototype[k] = knocknok.WebRequest.prototype[k];
knocknok.ApiRequest.prototype.__class__ = knocknok.ApiRequest;
haxe = {}
haxe.Log = function() { }
haxe.Log.__name__ = ["haxe","Log"];
haxe.Log.trace = function(v,infos) {
	js.Boot.__trace(v,infos);
}
haxe.Log.clear = function() {
	js.Boot.__clear_trace();
}
haxe.Log.prototype.__class__ = haxe.Log;
knocknok.Topic = function(id) { if( id === $_ ) return; {
	events.EventDispatcher.apply(this,[]);
	this.id = id;
	this.subscribers = new Hash();
	this.sources = new Hash();
	this.subscribersCount = 0;
	knocknok.Topic._instances.set(id,this);
	this.subscriberCountRequest = null;
	this.subscriberInfoRequest = null;
	this.sourceInfoRequest = null;
}}
knocknok.Topic.__name__ = ["knocknok","Topic"];
knocknok.Topic.__super__ = events.EventDispatcher;
for(var k in events.EventDispatcher.prototype ) knocknok.Topic.prototype[k] = events.EventDispatcher.prototype[k];
knocknok.Topic.setTopicSources = function(id,sourceinfo) {
	knocknok.Global.log("Updating sources for topic...");
	if(!knocknok.Topic._instances.exists(id)) return;
	var t = knocknok.Topic._instances.get(id);
	if(t.subscriberCountRequest != null) t.sourceInfoRequest.onWebRequestResult(null);
	var skitr = t.sources.keys();
	while(skitr.hasNext()) {
		t.sources.remove(skitr.next());
	}
	var itr = sourceinfo.iterator();
	while(itr.hasNext()) {
		var srcinfo = itr.next();
		var terms = new Array();
		if(srcinfo.terms != null) {
			var srcterms = srcinfo.terms;
			var titr = srcterms.iterator();
			while(titr.hasNext()) {
				var term = titr.next();
				terms.push(new knocknok.TermInfo(term,"",0));
			}
		}
		var src = new knocknok.Source(srcinfo.id,srcinfo.host,srcinfo.title,srcinfo.url,terms);
		t.sources.set(src.id,src);
		t.dispatchEvent(new events.SourceEvent(events.SourceEvent.LOADED,src));
	}
	t.sourceInfoRequest = null;
	t.dispatchEvent(new events.TopicEvent(events.TopicEvent.SOURCES_CHANGED,t));
}
knocknok.Topic.setTopicSubscribersCount = function(id,count) {
	if(!knocknok.Topic._instances.exists(id)) return;
	var t = knocknok.Topic._instances.get(id);
	if(t.subscriberCountRequest != null) t.subscriberCountRequest.onWebRequestResult(null);
	if(t.subscribersCount != count) {
		t.subscribersCount = count;
		t.dispatchEvent(new events.TopicEvent(events.TopicEvent.SUBSCRIBER_COUNT_CHANGED,t));
	}
	t.subscriberCountRequest = null;
}
knocknok.Topic.setTopicSubscribers = function(id,subinfo) {
	knocknok.Global.log("Updating subscribers for topic...");
	if(!knocknok.Topic._instances.exists(id)) return;
	var t = knocknok.Topic._instances.get(id);
	if(t.subscriberInfoRequest != null) t.subscriberInfoRequest.onWebRequestResult(null);
	var droppedUsers = new Array();
	var addedUsers = new Array();
	var subitr = t.subscribers.keys();
	var newsubitr = subinfo.iterator();
	while(subitr.hasNext()) {
		var existingSub = subitr.next();
		var found = false;
		while(newsubitr.hasNext() && !found) {
			var subinfo1 = newsubitr.next();
			if(subinfo1.id == existingSub) {
				found = true;
			}
		}
		if(!found) {
			droppedUsers.push(t.subscribers.get(existingSub));
		}
	}
	newsubitr = subinfo.iterator();
	while(newsubitr.hasNext()) {
		var subinfo1 = newsubitr.next();
		if(!t.subscribers.exists(subinfo1.id)) {
			addedUsers.push(new knocknok.User(subinfo1.id,subinfo1.sn,subinfo1.source));
		}
	}
	knocknok.Global.log("Dropped: ");
	knocknok.Global.log(droppedUsers);
	knocknok.Global.log("Added: ");
	knocknok.Global.log(addedUsers);
	if(droppedUsers.length > 0 || addedUsers.length > 0) {
		var skitr = t.subscribers.keys();
		while(skitr.hasNext()) {
			t.subscribers.remove(skitr.next());
		}
		var itr = subinfo.iterator();
		while(itr.hasNext()) {
			var subinfo1 = itr.next();
			var usr = new knocknok.User(subinfo1.id,subinfo1.sn,subinfo1.source);
			t.subscribers.set(usr.session,usr);
		}
		t.dispatchEvent(new events.TopicEvent(events.TopicEvent.SUBSCRIBER_COUNT_CHANGED,t));
		t.dispatchEvent(new events.TopicEvent(events.TopicEvent.SUBSCRIBERS_CHANGED,t));
		var uitr = droppedUsers.iterator();
		while(uitr.hasNext()) {
			var u = uitr.next();
			t.dispatchEvent(new events.UserEvent(events.UserEvent.LEAVE,u));
		}
		uitr = addedUsers.iterator();
		while(uitr.hasNext()) {
			var u = uitr.next();
			t.dispatchEvent(new events.UserEvent(events.UserEvent.JOIN,u));
		}
	}
	t.subscriberInfoRequest = null;
}
knocknok.Topic.prototype.getSource = function(id) {
	return this.sources.get(id);
}
knocknok.Topic.prototype.getSources = function() {
	var arr = new Array();
	var i = this.sources.iterator();
	while(i.hasNext()) {
		arr.push(i.next());
	}
	return arr;
}
knocknok.Topic.prototype.getSubscriber = function(id) {
	return this.subscribers.get(id);
}
knocknok.Topic.prototype.getSubscribers = function() {
	var arr = new Array();
	var i = this.subscribers.iterator();
	while(i.hasNext()) {
		arr.push(i.next());
	}
	return arr;
}
knocknok.Topic.prototype.id = null;
knocknok.Topic.prototype.sourceInfoRequest = null;
knocknok.Topic.prototype.sources = null;
knocknok.Topic.prototype.subscriberCountRequest = null;
knocknok.Topic.prototype.subscriberInfoRequest = null;
knocknok.Topic.prototype.subscribers = null;
knocknok.Topic.prototype.subscribersCount = null;
knocknok.Topic.prototype.title = null;
knocknok.Topic.prototype.updateSources = function() {
	if(this.sourceInfoRequest != null) return;
	this.sourceInfoRequest = new knocknok.WebRequest("http://messages.knocknok.com/" + this.id + "/d.js.sources");
	this.sourceInfoRequest.send();
}
knocknok.Topic.prototype.updateSubscribers = function() {
	if(this.subscriberInfoRequest != null) return;
	this.subscriberInfoRequest = new knocknok.WebRequest("http://messages.knocknok.com/" + this.id + "/d.js.subscribers");
	this.subscriberInfoRequest.send();
}
knocknok.Topic.prototype.updateSubscribersCount = function() {
	if(this.subscriberCountRequest != null) return;
	this.subscriberCountRequest = new knocknok.WebRequest("http://messages.knocknok.com/" + this.id + "/d.js.subscribers_count");
	this.subscriberCountRequest.send();
}
knocknok.Topic.prototype.__class__ = knocknok.Topic;
StringBuf = function(p) { if( p === $_ ) return; {
	this.b = new Array();
}}
StringBuf.__name__ = ["StringBuf"];
StringBuf.prototype.add = function(x) {
	this.b[this.b.length] = x;
}
StringBuf.prototype.addChar = function(c) {
	this.b[this.b.length] = String.fromCharCode(c);
}
StringBuf.prototype.addSub = function(s,pos,len) {
	this.b[this.b.length] = s.substr(pos,len);
}
StringBuf.prototype.b = null;
StringBuf.prototype.toString = function() {
	return this.b.join("");
}
StringBuf.prototype.__class__ = StringBuf;
knocknok.Session = function(sourceId) { if( sourceId === $_ ) return; {
	events.EventDispatcher.apply(this,[]);
	this.endTime = null;
	this.screenName = "";
	this.source = sourceId;
	var req = new knocknok.WebRequest("http://knockserver.chat.unitedfuture.com:8080/sessionregister","GET");
	req.addParam("screen",knocknok.Global.screenResolution);
	req.addParam("flash",knocknok.Global.flashVersion);
	req.addParam("source",this.source);
	req.addEventListener(events.WebRequestEvent.SUCCESS,$closure(this,"_sessionStartSuccess"));
	req.send();
}}
knocknok.Session.__name__ = ["knocknok","Session"];
knocknok.Session.__super__ = events.EventDispatcher;
for(var k in events.EventDispatcher.prototype ) knocknok.Session.prototype[k] = events.EventDispatcher.prototype[k];
knocknok.Session.prototype._sessionStartSuccess = function(e) {
	var result = e.data;
	knocknok.Global.log("Session has been started and the following data was returned:");
	knocknok.Global.log(result);
	this.id = Std.string(result.id);
	this.ip = Std.string(result.ip);
	this.httpReferrer = result.httpReferrer;
	this.startTime = Date.fromTime(Std.parseFloat(result.time));
	this.screenName = Std.string(result.sn);
	this.dispatchEvent(new events.SessionEvent(events.SessionEvent.STARTED));
}
knocknok.Session.prototype.endTime = null;
knocknok.Session.prototype.httpReferrer = null;
knocknok.Session.prototype.id = null;
knocknok.Session.prototype.ip = null;
knocknok.Session.prototype.screenName = null;
knocknok.Session.prototype.source = null;
knocknok.Session.prototype.startTime = null;
knocknok.Session.prototype.__class__ = knocknok.Session;
events.Event = function(type) { if( type === $_ ) return; {
	this.type = type;
}}
events.Event.__name__ = ["events","Event"];
events.Event.prototype.type = null;
events.Event.prototype.__class__ = events.Event;
events.TopicEvent = function(type,topic) { if( type === $_ ) return; {
	events.Event.apply(this,[type]);
	this.topic = topic;
}}
events.TopicEvent.__name__ = ["events","TopicEvent"];
events.TopicEvent.__super__ = events.Event;
for(var k in events.Event.prototype ) events.TopicEvent.prototype[k] = events.Event.prototype[k];
events.TopicEvent.prototype.topic = null;
events.TopicEvent.prototype.__class__ = events.TopicEvent;
knocknok.TermInfo = function(text,classification,relevancy) { if( text === $_ ) return; {
	this.text = text;
	this.classification = classification;
	this.relevancy = relevancy;
}}
knocknok.TermInfo.__name__ = ["knocknok","TermInfo"];
knocknok.TermInfo.fromString = function(str) {
	var arr = str.split(":");
	return new knocknok.TermInfo(arr[2],arr[1],Std.parseFloat(arr[0]));
}
knocknok.TermInfo.prototype.classification = null;
knocknok.TermInfo.prototype.relevancy = null;
knocknok.TermInfo.prototype.text = null;
knocknok.TermInfo.prototype.__class__ = knocknok.TermInfo;
events.SourceEvent = function(type,source) { if( type === $_ ) return; {
	events.Event.apply(this,[type]);
	this.source = source;
}}
events.SourceEvent.__name__ = ["events","SourceEvent"];
events.SourceEvent.__super__ = events.Event;
for(var k in events.Event.prototype ) events.SourceEvent.prototype[k] = events.Event.prototype[k];
events.SourceEvent.prototype.source = null;
events.SourceEvent.prototype.__class__ = events.SourceEvent;
IntIter = function(min,max) { if( min === $_ ) return; {
	this.min = min;
	this.max = max;
}}
IntIter.__name__ = ["IntIter"];
IntIter.prototype.hasNext = function() {
	return this.min < this.max;
}
IntIter.prototype.max = null;
IntIter.prototype.min = null;
IntIter.prototype.next = function() {
	return this.min++;
}
IntIter.prototype.__class__ = IntIter;
haxe.Timer = function(time_ms) { if( time_ms === $_ ) return; {
	this.id = haxe.Timer.arr.length;
	haxe.Timer.arr[this.id] = this;
	this.timerId = window.setInterval("haxe.Timer.arr[" + this.id + "].run();",time_ms);
}}
haxe.Timer.__name__ = ["haxe","Timer"];
haxe.Timer.delay = function(f,time_ms) {
	var t = new haxe.Timer(time_ms);
	t.run = function() {
		t.stop();
		f();
	}
	return t;
}
haxe.Timer.stamp = function() {
	return Date.now().getTime() / 1000;
}
haxe.Timer.prototype.id = null;
haxe.Timer.prototype.run = function() {
	null;
}
haxe.Timer.prototype.stop = function() {
	if(this.id == null) return;
	window.clearInterval(this.timerId);
	haxe.Timer.arr[this.id] = null;
	if(this.id > 100 && this.id == haxe.Timer.arr.length - 1) {
		var p = this.id - 1;
		while(p >= 0 && haxe.Timer.arr[p] == null) p--;
		haxe.Timer.arr = haxe.Timer.arr.slice(0,p + 1);
	}
	this.id = null;
}
haxe.Timer.prototype.timerId = null;
haxe.Timer.prototype.__class__ = haxe.Timer;
hxJSON = {}
hxJSON.Json = function() { }
hxJSON.Json.__name__ = ["hxJSON","Json"];
hxJSON.Json.encode = function(v) {
	var e = new hxJSON._Json.Encode(v);
	return e.getString();
}
hxJSON.Json.decode = function(v) {
	var d = new hxJSON._Json.Decode(v);
	var v1 = d.getObject();
	return v1;
}
hxJSON.Json.prototype.__class__ = hxJSON.Json;
hxJSON._Json = {}
hxJSON._Json.Encode = function(value) { if( value === $_ ) return; {
	this.jsonString = this.convertToString(value);
}}
hxJSON._Json.Encode.__name__ = ["hxJSON","_Json","Encode"];
hxJSON._Json.Encode.prototype.arrayToString = function(a) {
	var s = new StringBuf();
	var i = 0;
	while(i < a.length) {
		s.b[s.b.length] = this.convertToString(a[i]);
		s.b[s.b.length] = ",";
		i++;
	}
	return "[" + s.b.join("").substr(0,-1) + "]";
}
hxJSON._Json.Encode.prototype.convertToString = function(value) {
	if(Std["is"](value,String)) {
		return this.escapeString(Std.string(value));
	}
	else if(Std["is"](value,Float)) {
		return (Math.isFinite(value)?Std.string(value):"null");
	}
	else if(Std["is"](value,Bool)) {
		return (value?"true":"false");
	}
	else if(Std["is"](value,Array)) {
		return this.arrayToString(value);
	}
	else if(Std["is"](value,List)) {
		haxe.Log.trace("process a list",{ fileName : "Json.hx", lineNumber : 70, className : "hxJSON._Json.Encode", methodName : "convertToString"});
		return this.listToString(value);
	}
	else if(value != null && Reflect.isObject(value)) {
		return this.objectToString(value);
	}
	return "null";
}
hxJSON._Json.Encode.prototype.escapeString = function(str) {
	var s = new StringBuf();
	var ch;
	var i = 0;
	while((ch = str.charAt(i)) != "") {
		switch(ch) {
		case "\"":{
			s.b[s.b.length] = "\\\"";
		}break;
		case "\\":{
			s.b[s.b.length] = "\\\\";
		}break;
		case "\\b":{
			s.b[s.b.length] = "\\b";
		}break;
		case "\\f":{
			s.b[s.b.length] = "\\f";
		}break;
		case "\\n":{
			s.b[s.b.length] = "\\n";
		}break;
		case "\\r":{
			s.b[s.b.length] = "\\r";
		}break;
		case "\\t":{
			s.b[s.b.length] = "\\t";
		}break;
		default:{
			s.b[s.b.length] = ch;
		}break;
		}
		i++;
	}
	return "\"" + s.b.join("") + "\"";
}
hxJSON._Json.Encode.prototype.getString = function() {
	return this.jsonString;
}
hxJSON._Json.Encode.prototype.jsonString = null;
hxJSON._Json.Encode.prototype.listToString = function(l) {
	var s = new StringBuf();
	var i = 0;
	{ var $it5 = l.iterator();
	while( $it5.hasNext() ) { var v = $it5.next();
	{
		s.b[s.b.length] = this.convertToString(v);
		s.b[s.b.length] = ",";
	}
	}}
	return "[" + s.b.join("").substr(0,-1) + "]";
}
hxJSON._Json.Encode.prototype.objectToString = function(o) {
	var s = new StringBuf();
	if(Reflect.isObject(o)) {
		if(Reflect.hasField(o,"__cache__")) {
			o = Reflect.field(o,"__cache__");
		}
		var value;
		var sortedFields = Reflect.fields(o);
		sortedFields.sort(function(k1,k2) {
			if(k1 == k2) return 0;
			if(k1 < k2) return -1;
			return 1;
		});
		{
			var _g = 0;
			while(_g < sortedFields.length) {
				var key = sortedFields[_g];
				++_g;
				value = Reflect.field(o,key);
				if(Reflect.isFunction(value)) continue;
				s.b[s.b.length] = this.escapeString(key) + ":" + this.convertToString(value);
				s.b[s.b.length] = ",";
			}
		}
	}
	else {
		{
			var _g = 0, _g1 = Reflect.fields(o);
			while(_g < _g1.length) {
				var v = _g1[_g];
				++_g;
				s.b[s.b.length] = this.escapeString(v) + ":" + this.convertToString(Reflect.field(o,v));
				s.b[s.b.length] = ",";
			}
		}
		var sortedFields = Reflect.fields(o);
		sortedFields.sort(function(k1,k2) {
			if(k1 == k2) return 0;
			if(k1 < k2) return -1;
			return 1;
		});
		{
			var _g = 0;
			while(_g < sortedFields.length) {
				var v = sortedFields[_g];
				++_g;
				s.b[s.b.length] = this.escapeString(v) + ":" + this.convertToString(Reflect.field(o,v));
				s.b[s.b.length] = ",";
			}
		}
	}
	return "{" + s.b.join("").substr(0,-1) + "}";
}
hxJSON._Json.Encode.prototype.__class__ = hxJSON._Json.Encode;
hxJSON._Json.Decode = function(t) { if( t === $_ ) return; {
	this.parsedObj = this.parse(t);
}}
hxJSON._Json.Decode.__name__ = ["hxJSON","_Json","Decode"];
hxJSON._Json.Decode.prototype.arr = function() {
	var a = [];
	if(this.ch == "[") {
		this.next();
		this.white();
		if(this.ch == "]") {
			this.next();
			return a;
		}
		while(this.ch != "") {
			var v;
			v = this.value();
			a.push(v);
			this.white();
			if(this.ch == "]") {
				this.next();
				return a;
			}
			else if(this.ch != ",") {
				break;
			}
			this.next();
			this.white();
		}
	}
	this.error("Bad array");
	return [];
}
hxJSON._Json.Decode.prototype.at = null;
hxJSON._Json.Decode.prototype.ch = null;
hxJSON._Json.Decode.prototype.error = function(m) {
	throw { name : "JSONError", message : m, at : this.at - 1, text : this.text}
}
hxJSON._Json.Decode.prototype.getObject = function() {
	return this.parsedObj;
}
hxJSON._Json.Decode.prototype.next = function() {
	this.ch = this.text.charAt(this.at);
	this.at += 1;
	if(this.ch == "") return this.ch = "0";
	return this.ch;
}
hxJSON._Json.Decode.prototype.num = function() {
	var n = "";
	var v;
	if(this.ch == "-") {
		n = "-";
		this.next();
	}
	while(this.ch >= "0" && this.ch <= "9") {
		n += this.ch;
		this.next();
	}
	if(this.ch == ".") {
		n += ".";
		this.next();
		while(this.ch >= "0" && this.ch <= "9") {
			n += this.ch;
			this.next();
		}
	}
	if(this.ch == "e" || this.ch == "E") {
		n += this.ch;
		this.next();
		if(this.ch == "-" || this.ch == "+") {
			n += this.ch;
			this.next();
		}
		while(this.ch >= "0" && this.ch <= "9") {
			n += this.ch;
			this.next();
		}
	}
	v = Std.parseFloat(n);
	if(!Math.isFinite(v)) {
		this.error("Bad number");
	}
	return v;
}
hxJSON._Json.Decode.prototype.obj = function() {
	var k;
	var o = "";
	if(this.ch == "{") {
		this.next();
		this.white();
		if(this.ch == "}") {
			this.next();
			return o;
		}
		while(this.ch != "") {
			k = this.str();
			this.white();
			if(this.ch != ":") {
				break;
			}
			this.next();
			var v;
			v = this.value();
			o[k] = v;
			this.white();
			if(this.ch == "}") {
				this.next();
				return o;
			}
			else if(this.ch != ",") {
				break;
			}
			this.next();
			this.white();
		}
	}
	this.error("Bad object");
	return o;
}
hxJSON._Json.Decode.prototype.parse = function(text) {
	try {
		this.at = 0;
		this.ch = "";
		this.text = text;
		var v;
		v = this.value();
		return v;
	}
	catch( $e6 ) {
		{
			var exc = $e6;
			null;
		}
	}
	return "{\"err\":\"parse error\"}";
}
hxJSON._Json.Decode.prototype.parsedObj = null;
hxJSON._Json.Decode.prototype.str = function() {
	var i, s = "", t, u;
	var outer = false;
	if(this.ch == "\"") {
		try {
			while(this.next() != "") {
				if(this.ch == "\"") {
					this.next();
					return s;
				}
				else if(this.ch == "\\") {
					switch(this.next()) {
					case "n":{
						s += "\n";
					}break;
					case "r":{
						s += "\r";
					}break;
					case "t":{
						s += "\t";
					}break;
					case "u":{
						u = 0;
						{
							var _g = 0;
							while(_g < 4) {
								var i1 = _g++;
								t = Std.parseInt(this.next());
								if(!Math.isFinite(t)) {
									outer = true;
									break;
								}
								u = u * 16 + t;
							}
						}
						if(outer) {
							outer = false;
							throw "__break__";
						}
						s += String.fromCharCode(u);
					}break;
					default:{
						s += this.ch;
					}break;
					}
				}
				else {
					s += this.ch;
				}
			}
		} catch( e ) { if( e != "__break__" ) throw e; }
	}
	else {
		this.error("ok this should be a quote");
	}
	this.error("Bad string");
	return s;
}
hxJSON._Json.Decode.prototype.text = null;
hxJSON._Json.Decode.prototype.value = function() {
	this.white();
	var v;
	switch(this.ch) {
	case "{":{
		v = this.obj();
	}break;
	case "[":{
		v = this.arr();
	}break;
	case "\"":{
		v = this.str();
	}break;
	case "-":{
		v = this.num();
	}break;
	default:{
		if(this.ch >= "0" && this.ch <= "9") {
			v = this.num();
		}
		else {
			v = this.word();
		}
	}break;
	}
	return v;
}
hxJSON._Json.Decode.prototype.white = function() {
	try {
		while(this.ch != "") {
			if(this.ch <= " ") {
				this.next();
			}
			else if(this.ch == "/") {
				switch(this.next()) {
				case "/":{
					while(this.next() != "" && this.ch != "\n" && this.ch != "\r") null;
					throw "__break__";
				}break;
				case "*":{
					this.next();
					while(true) {
						if(this.ch != "") {
							if(this.ch == "*") {
								if(this.next() == "/") {
									this.next();
									break;
								}
							}
							else {
								this.next();
							}
						}
						else {
							this.error("Unterminated comment");
						}
					}
					throw "__break__";
				}break;
				default:{
					this.error("Syntax error");
				}break;
				}
			}
			else {
				throw "__break__";
			}
		}
	} catch( e ) { if( e != "__break__" ) throw e; }
}
hxJSON._Json.Decode.prototype.word = function() {
	switch(this.ch) {
	case "t":{
		if(this.next() == "r" && this.next() == "u" && this.next() == "e") {
			this.next();
			return true;
		}
	}break;
	case "f":{
		if(this.next() == "a" && this.next() == "l" && this.next() == "s" && this.next() == "e") {
			this.next();
			return false;
		}
	}break;
	case "n":{
		if(this.next() == "u" && this.next() == "l" && this.next() == "l") {
			this.next();
			return null;
		}
	}break;
	}
	this.error("Syntax error");
	return false;
}
hxJSON._Json.Decode.prototype.__class__ = hxJSON._Json.Decode;
events.WebRequestEvent = function(type,data) { if( type === $_ ) return; {
	events.Event.apply(this,[type]);
	this.data = data;
}}
events.WebRequestEvent.__name__ = ["events","WebRequestEvent"];
events.WebRequestEvent.__super__ = events.Event;
for(var k in events.Event.prototype ) events.WebRequestEvent.prototype[k] = events.Event.prototype[k];
events.WebRequestEvent.prototype.data = null;
events.WebRequestEvent.prototype.__class__ = events.WebRequestEvent;
knocknok.Message = function(txt,topic,subscriber) { if( txt === $_ ) return; {
	this.uuid = knocknok.UUID.generate();
	this.text = txt;
	this.topic = topic;
	this.subscriber = subscriber;
}}
knocknok.Message.__name__ = ["knocknok","Message"];
knocknok.Message.prototype.meta = null;
knocknok.Message.prototype.subscriber = null;
knocknok.Message.prototype.text = null;
knocknok.Message.prototype.topic = null;
knocknok.Message.prototype.uuid = null;
knocknok.Message.prototype.__class__ = knocknok.Message;
Std = function() { }
Std.__name__ = ["Std"];
Std["is"] = function(v,t) {
	return js.Boot.__instanceof(v,t);
}
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
}
Std["int"] = function(x) {
	if(x < 0) return Math.ceil(x);
	return Math.floor(x);
}
Std.parseInt = function(x) {
	var v = parseInt(x);
	if(Math.isNaN(v)) return null;
	return v;
}
Std.parseFloat = function(x) {
	return parseFloat(x);
}
Std.random = function(x) {
	return Math.floor(Math.random() * x);
}
Std.prototype.__class__ = Std;
knocknok.ConnectionBase = function(topic,sess) { if( topic === $_ ) return; {
	events.EventDispatcher.apply(this,[]);
	this.topic = topic;
	this.session = sess;
	this.user = new knocknok.User(this.session.id,this.session.screenName,this.session.source);
	this._connected = false;
}}
knocknok.ConnectionBase.__name__ = ["knocknok","ConnectionBase"];
knocknok.ConnectionBase.__super__ = events.EventDispatcher;
for(var k in events.EventDispatcher.prototype ) knocknok.ConnectionBase.prototype[k] = events.EventDispatcher.prototype[k];
knocknok.ConnectionBase.prototype._connected = null;
knocknok.ConnectionBase.prototype._onMessageRecieved = function(msg) {
	if(msg.meta != null && msg.subscriber == "system") {
		knocknok.Global.log("System message received --> " + msg.meta.type);
		knocknok.Global.log(msg);
		var meta = msg.meta;
		if(meta.type == "userjoin" || meta.type == "userleave") {
			knocknok.Global.log("users have changed... updating subscribers");
			this.topic.updateSubscribers();
		}
		if(meta.type == "snchange") {
			var usr = this.topic.getSubscriber(meta.user);
			if(usr != null) {
				this.topic.dispatchEvent(new events.UserEvent(events.UserEvent.LEAVE,usr));
				usr.screenName = meta.sn;
				this.topic.subscribers.set(usr.session,usr);
				this.topic.dispatchEvent(new events.UserEvent(events.UserEvent.JOIN,usr));
			}
			else {
				this.topic.updateSubscribers();
			}
		}
	}
	else {
		this.dispatchEvent(new events.MessageEvent(events.MessageEvent.RECEIVED,msg));
	}
}
knocknok.ConnectionBase.prototype._sendMessage = function(message) {
	null;
}
knocknok.ConnectionBase.prototype.changeScreenName = function(newSn) {
	var oldScreenName = this.session.screenName;
	this.session.screenName = newSn;
	this.user.screenName = newSn;
	this.sendMessage("Greetings! this is my new screen name, I used to be known as \"" + oldScreenName + "\"");
}
knocknok.ConnectionBase.prototype.connect = function() {
	null;
}
knocknok.ConnectionBase.prototype.disconnect = function() {
	this.dispatchEvent(new events.ConnectionEvent(events.ConnectionEvent.DISCONNECTED));
}
knocknok.ConnectionBase.prototype.sendMessage = function(str) {
	var msg = new knocknok.Message(str,this.topic.id,this.session.id);
	this._sendMessage(msg);
}
knocknok.ConnectionBase.prototype.session = null;
knocknok.ConnectionBase.prototype.topic = null;
knocknok.ConnectionBase.prototype.user = null;
knocknok.ConnectionBase.prototype.__class__ = knocknok.ConnectionBase;
knocknok.Connection = function(topic,sess) { if( topic === $_ ) return; {
	knocknok.ConnectionBase.apply(this,[topic,sess]);
	this._messageSendRequest = null;
	this._messageQueue = new Array();
	this._polling = false;
	this._firstPoll = true;
}}
knocknok.Connection.__name__ = ["knocknok","Connection"];
knocknok.Connection.__super__ = knocknok.ConnectionBase;
for(var k in knocknok.ConnectionBase.prototype ) knocknok.Connection.prototype[k] = knocknok.ConnectionBase.prototype[k];
knocknok.Connection.prototype._firstPoll = null;
knocknok.Connection.prototype._messageQueue = null;
knocknok.Connection.prototype._messageSendRequest = null;
knocknok.Connection.prototype._msgPollSuccess = function(e) {
	this._polling = false;
	var res = e.data;
	if(this._firstPoll) {
		this._firstPoll = false;
		this._connected = true;
		this.dispatchEvent(new events.ConnectionEvent(events.ConnectionEvent.CONNECTED));
	}
	if(res.status == 200) {
		knocknok.Global.log(res.messages);
		if(res.messages) {
			var messageCounter = 0;
			while(messageCounter < res.messages.length) {
				var inboundMsg = res.messages[messageCounter];
				var msg = new knocknok.Message(inboundMsg.body,this.topic.id,inboundMsg.session);
				msg.uuid = inboundMsg.id;
				msg.meta = inboundMsg.meta;
				knocknok.Global.log("Message received:");
				knocknok.Global.log(msg);
				knocknok.ConnectionBase.prototype._onMessageRecieved.apply(this,[msg]);
				messageCounter = messageCounter + 1;
			}
		}
	}
	else {
		knocknok.Global.log("There was an error with the message polling request");
		knocknok.Global.log(res);
	}
	this._sendMessagePoll();
}
knocknok.Connection.prototype._msgPollTimeout = function(e) {
	knocknok.Global.log("Polling has timed out... resending request");
	this._polling = false;
	this._sendMessagePoll();
}
knocknok.Connection.prototype._polling = null;
knocknok.Connection.prototype._sendMessage = function(message) {
	if(this._messageSendRequest != null) {
		this._messageQueue.push(message);
		return;
	}
	else {
		var send = new knocknok.WebRequest("http://knockserver.chat.unitedfuture.com:8080/publish","GET");
		this._sentMessage = message;
		this._messageSendRequest = send;
		send.addParam("m",message.text);
		send.addParam("c",this.topic.id);
		send.addParam("s",this.session.id);
		send.addParam("sn",this.user.screenName);
		send.send();
		haxe.Timer.delay($closure(this,"_sendMessageSuccess"),750);
	}
}
knocknok.Connection.prototype._sendMessagePoll = function() {
	if(!this._polling) {
		this._polling = true;
		var req = new knocknok.PollRequest(this);
		req.addEventListener(events.WebRequestEvent.SUCCESS,$closure(this,"_msgPollSuccess"));
		req.addEventListener(events.WebRequestEvent.TIMEOUT,$closure(this,"_msgPollTimeout"));
		req.send();
	}
}
knocknok.Connection.prototype._sendMessageSuccess = function() {
	this.dispatchEvent(new events.MessageEvent(events.MessageEvent.SENT,this._sentMessage));
	this._messageSendRequest = null;
	if(this._messageQueue.length > 0) {
		this._sendMessage(this._messageQueue.shift());
	}
}
knocknok.Connection.prototype._sentMessage = null;
knocknok.Connection.prototype.connect = function() {
	this._sendMessagePoll();
}
knocknok.Connection.prototype.__class__ = knocknok.Connection;
js = {}
js.Lib = function() { }
js.Lib.__name__ = ["js","Lib"];
js.Lib.isIE = null;
js.Lib.isOpera = null;
js.Lib.document = null;
js.Lib.window = null;
js.Lib.alert = function(v) {
	alert(js.Boot.__string_rec(v,""));
}
js.Lib.eval = function(code) {
	return eval(code);
}
js.Lib.setErrorHandler = function(f) {
	js.Lib.onerror = f;
}
js.Lib.prototype.__class__ = js.Lib;
FlashDetect = function() { }
FlashDetect.__name__ = ["FlashDetect"];
FlashDetect.ControlVersion = function() {
	var version = "";
	var axo = null;
	try {
		axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.7');
		version = axo.GetVariable('$version');
	}
	catch( $e7 ) {
		{
			var e = $e7;
			null;
		}
	}
	if(version == null || version == "") {
		try {
			axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
			version = "WIN 6,0,21,0";
			axo.AllowScriptAccess = "always";
			version = axo.GetVariable("$version");
		}
		catch( $e8 ) {
			{
				var e = $e8;
				null;
			}
		}
	}
	if(version == null || version == "") {
		try {
			axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.3');
			version = axo.GetVariable("$version");
		}
		catch( $e9 ) {
			{
				var e = $e9;
				null;
			}
		}
	}
	if(version == null || version == "") {
		try {
			axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.3');
			version = "WIN 3,0,18,0";
		}
		catch( $e10 ) {
			{
				var e = $e10;
				null;
			}
		}
	}
	if(version == null || version == "") {
		try {
			axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
			version = "WIN 2,0,0,11";
		}
		catch( $e11 ) {
			{
				var e = $e11;
				{
					version = "-1";
				}
			}
		}
	}
	return version;
}
FlashDetect._navPlugin = function(key) {
	var val = "";
	__js__("val = navigator.plugins[" + key + "];");
	return val;
}
FlashDetect.GetSwfVer = function() {
	var flashVer = "-1";
	if(FlashDetect.nav.plugins != null && FlashDetect.nav.plugins.length > 0) {
		if(FlashDetect._navPlugin("Shockwave Flash 2.0") != null || FlashDetect._navPlugin("Shockwave Flash") != null) {
			var swVer2 = (FlashDetect._navPlugin("Shockwave Flash 2.0") == null?" 2.0":"");
			var flashDescription = FlashDetect._navPlugin("Shockwave Flash" + swVer2).description;
			var descArray = flashDescription.split(" ");
			var tempArrayMajor = descArray[2].split(".");
			var versionMajor = tempArrayMajor[0];
			var versionMinor = tempArrayMajor[1];
			var versionRevision = descArray[3];
			if(versionRevision == "") {
				versionRevision = descArray[4];
			}
			if(versionRevision.charAt(0) == "d") {
				versionRevision = versionRevision.substr(1);
			}
			else if(versionRevision.charAt(0) == "r") {
				versionRevision = versionRevision.substr(1);
				if(versionRevision.indexOf("d") > 0) {
					versionRevision = versionRevision.substr(0,versionRevision.indexOf("d"));
				}
			}
			flashVer = versionMajor + "." + versionMinor + "." + versionRevision;
		}
	}
	else if(js.Lib.window.navigator.userAgent.toLowerCase().indexOf("webtv/2.6") != -1) flashVer = "4";
	else if(js.Lib.window.navigator.userAgent.toLowerCase().indexOf("webtv/2.5") != -1) flashVer = "3";
	else if(js.Lib.window.navigator.userAgent.toLowerCase().indexOf("webtv") != -1) flashVer = "2";
	else if(FlashDetect.isIE && FlashDetect.isWin && !FlashDetect.isOpera) {
		flashVer = FlashDetect.ControlVersion();
	}
	return flashVer;
}
FlashDetect.DetectFlashVer = function(reqMajorVer,reqMinorVer,reqRevision) {
	var versionStr = FlashDetect.GetSwfVer();
	var versionArray;
	if(versionStr == "-1") {
		return false;
	}
	else if(versionStr != "0" && versionStr.length > 0) {
		if(FlashDetect.isIE && FlashDetect.isWin && !FlashDetect.isOpera) {
			var tempArray = versionStr.split(" ");
			var tempString = tempArray[1];
			versionArray = tempString.split(",");
		}
		else {
			versionArray = versionStr.split(".");
		}
		var versionMajor = versionArray[0];
		var versionMinor = versionArray[1];
		var versionRevision = versionArray[2];
		if(Std.parseFloat(versionMajor) > Std.parseFloat(reqMajorVer)) {
			return true;
		}
		else if(Std.parseFloat(versionMajor) == Std.parseFloat(reqMajorVer)) {
			if(Std.parseFloat(versionMinor) > Std.parseFloat(reqMinorVer)) {
				return true;
			}
			else if(Std.parseFloat(versionMinor) == Std.parseFloat(reqMinorVer)) {
				if(Std.parseFloat(versionRevision) >= Std.parseFloat(reqRevision)) {
					return true;
				}
			}
		}
		return false;
	}
	return false;
}
FlashDetect.prototype.__class__ = FlashDetect;
events.MessageEvent = function(type,message) { if( type === $_ ) return; {
	events.Event.apply(this,[type]);
	this.message = message;
}}
events.MessageEvent.__name__ = ["events","MessageEvent"];
events.MessageEvent.__super__ = events.Event;
for(var k in events.Event.prototype ) events.MessageEvent.prototype[k] = events.Event.prototype[k];
events.MessageEvent.prototype.message = null;
events.MessageEvent.prototype.__class__ = events.MessageEvent;
knocknok.User = function(session,sn,source) { if( session === $_ ) return; {
	this.source = source;
	this.session = session;
	this.screenName = sn;
}}
knocknok.User.__name__ = ["knocknok","User"];
knocknok.User.prototype.screenName = null;
knocknok.User.prototype.session = null;
knocknok.User.prototype.source = null;
knocknok.User.prototype.__class__ = knocknok.User;
js.Boot = function() { }
js.Boot.__name__ = ["js","Boot"];
js.Boot.__unhtml = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
}
js.Boot.__trace = function(v,i) {
	var msg = (i != null?i.fileName + ":" + i.lineNumber + ": ":"");
	msg += js.Boot.__unhtml(js.Boot.__string_rec(v,"")) + "<br/>";
	var d = document.getElementById("haxe:trace");
	if(d == null) alert("No haxe:trace element defined\n" + msg);
	else d.innerHTML += msg;
}
js.Boot.__clear_trace = function() {
	var d = document.getElementById("haxe:trace");
	if(d != null) d.innerHTML = "";
	else null;
}
js.Boot.__closure = function(o,f) {
	var m = o[f];
	if(m == null) return null;
	var f1 = function() {
		return m.apply(o,arguments);
	}
	f1.scope = o;
	f1.method = m;
	return f1;
}
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ != null || o.__ename__ != null)) t = "object";
	switch(t) {
	case "object":{
		if(o instanceof Array) {
			if(o.__enum__ != null) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				{
					var _g1 = 2, _g = o.length;
					while(_g1 < _g) {
						var i = _g1++;
						if(i != 2) str += "," + js.Boot.__string_rec(o[i],s);
						else str += js.Boot.__string_rec(o[i],s);
					}
				}
				return str + ")";
			}
			var l = o.length;
			var i;
			var str = "[";
			s += "\t";
			{
				var _g = 0;
				while(_g < l) {
					var i1 = _g++;
					str += ((i1 > 0?",":"")) + js.Boot.__string_rec(o[i1],s);
				}
			}
			str += "]";
			return str;
		}
		var tostr;
		try {
			tostr = o.toString;
		}
		catch( $e12 ) {
			{
				var e = $e12;
				{
					return "???";
				}
			}
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = (o.hasOwnProperty != null);
		for( var k in o ) { ;
		if(hasp && !o.hasOwnProperty(k)) continue;
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__") continue;
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	}break;
	case "function":{
		return "<function>";
	}break;
	case "string":{
		return o;
	}break;
	default:{
		return String(o);
	}break;
	}
}
js.Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0, _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js.Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js.Boot.__interfLoop(cc.__super__,cl);
}
js.Boot.__instanceof = function(o,cl) {
	try {
		if(o instanceof cl) {
			if(cl == Array) return (o.__enum__ == null);
			return true;
		}
		if(js.Boot.__interfLoop(o.__class__,cl)) return true;
	}
	catch( $e13 ) {
		{
			var e = $e13;
			{
				if(cl == null) return false;
			}
		}
	}
	switch(cl) {
	case Int:{
		return Math.ceil(o%2147483648.0) === o;
	}break;
	case Float:{
		return typeof(o) == "number";
	}break;
	case Bool:{
		return o === true || o === false;
	}break;
	case String:{
		return typeof(o) == "string";
	}break;
	case Dynamic:{
		return true;
	}break;
	default:{
		if(o == null) return false;
		return o.__enum__ == cl || (cl == Class && o.__name__ != null) || (cl == Enum && o.__ename__ != null);
	}break;
	}
}
js.Boot.__init = function() {
	js.Lib.isIE = (document.all != null && window.opera == null);
	js.Lib.isOpera = (window.opera != null);
	Array.prototype.copy = Array.prototype.slice;
	Array.prototype.insert = function(i,x) {
		this.splice(i,0,x);
	}
	Array.prototype.remove = (Array.prototype.indexOf?function(obj) {
		var idx = this.indexOf(obj);
		if(idx == -1) return false;
		this.splice(idx,1);
		return true;
	}:function(obj) {
		var i = 0;
		var l = this.length;
		while(i < l) {
			if(this[i] == obj) {
				this.splice(i,1);
				return true;
			}
			i++;
		}
		return false;
	});
	Array.prototype.iterator = function() {
		return { cur : 0, arr : this, hasNext : function() {
			return this.cur < this.arr.length;
		}, next : function() {
			return this.arr[this.cur++];
		}}
	}
	var cca = String.prototype.charCodeAt;
	String.prototype.cca = cca;
	String.prototype.charCodeAt = function(i) {
		var x = cca.call(this,i);
		if(isNaN(x)) return null;
		return x;
	}
	var oldsub = String.prototype.substr;
	String.prototype.substr = function(pos,len) {
		if(pos != null && pos != 0 && len != null && len < 0) return "";
		if(len == null) len = this.length;
		if(pos < 0) {
			pos = this.length + pos;
			if(pos < 0) pos = 0;
		}
		else if(len < 0) {
			len = this.length + len - pos;
		}
		return oldsub.apply(this,[pos,len]);
	}
	$closure = js.Boot.__closure;
}
js.Boot.prototype.__class__ = js.Boot;
knocknok.Cookie = function() { }
knocknok.Cookie.__name__ = ["knocknok","Cookie"];
knocknok.Cookie.set = function(name,value,hours,path,domain) {
	if(domain == null) domain = "";
	if(path == null) path = "/";
	var expires = "";
	if(hours != null) {
		var datef = Date.now().getTime();
		datef += hours * 60 * 60 * 1000;
		expires = ";expires=" + DateTools.format(Date.fromTime(datef),"%d/%m/%Y %H:%M:%S");
	}
	else {
		expires = "";
	}
	js.Lib.document.cookie = name + "=" + value + expires + "; path=" + path;
}
knocknok.Cookie.get = function(name) {
	var nameEQ = name + "=";
	var ca = js.Lib.document.cookie.split(";");
	var i = 0;
	while(i < ca.length) {
		var c = ca[i];
		while(c.charAt(0) == " ") {
			c = c.substr(1);
		}
		if(c.indexOf(nameEQ) == 0) {
			return c.substr(nameEQ.length);
		}
		i += 1;
	}
	return null;
}
knocknok.Cookie["delete"] = function(name) {
	knocknok.Cookie.set(name,"",-1);
}
knocknok.Cookie.prototype.__class__ = knocknok.Cookie;
knocknok.Base64 = function() { }
knocknok.Base64.__name__ = ["knocknok","Base64"];
knocknok.Base64.encode = function(input) {
	var output = "";
	var chr1;
	var chr2;
	var chr3;
	var enc1;
	var enc2;
	var enc3;
	var enc4;
	var i = 0;
	input = knocknok.Base64._utf8_encode(input);
	while(i < input.length) {
		chr1 = input.charCodeAt(i++);
		chr2 = input.charCodeAt(i++);
		chr3 = input.charCodeAt(i++);
		enc1 = chr1 >> 2;
		enc2 = (((chr1 & 3) << 4) | (chr2 >> 4));
		enc3 = (((chr2 & 15) << 2) | (chr3 >> 6));
		enc4 = (chr3 & 63);
		if(chr2 == null) {
			enc3 = enc4 = 64;
		}
		else if(chr3 == null) {
			enc4 = 64;
		}
		output = output + knocknok.Base64._keyStr.charAt(enc1) + knocknok.Base64._keyStr.charAt(enc2) + knocknok.Base64._keyStr.charAt(enc3) + knocknok.Base64._keyStr.charAt(enc4);
	}
	return output;
}
knocknok.Base64.decode = function(input) {
	var output = "";
	var chr1;
	var chr2;
	var chr3;
	var enc1;
	var enc2;
	var enc3;
	var enc4;
	var i = 0;
	var r = new EReg("[^A-Za-z0-9\\+/\\=]","g");
	input = r.replace(input,"");
	while(i < input.length) {
		enc1 = knocknok.Base64._keyStr.indexOf(input.charAt(i++));
		enc2 = knocknok.Base64._keyStr.indexOf(input.charAt(i++));
		enc3 = knocknok.Base64._keyStr.indexOf(input.charAt(i++));
		enc4 = knocknok.Base64._keyStr.indexOf(input.charAt(i++));
		chr1 = ((enc1 << 2) | (enc2 >> 4));
		chr2 = (((enc2 & 15) << 4) | (enc3 >> 2));
		chr3 = (((enc3 & 3) << 6) | enc4);
		output = output + String.fromCharCode(chr1);
		if(enc3 != 64) {
			output = output + String.fromCharCode(chr2);
		}
		if(enc4 != 64) {
			output = output + String.fromCharCode(chr3);
		}
	}
	output = knocknok.Base64._utf8_decode(output);
	return output;
}
knocknok.Base64._utf8_encode = function(string) {
	var r = new EReg("\\r\\n","g");
	string = r.replace(string,"\n");
	var utftext = "";
	var n = 0;
	while(n < string.length) {
		var c = string.charCodeAt(n);
		if(c < 128) {
			utftext += String.fromCharCode(c);
		}
		else if((c > 127) && (c < 2048)) {
			utftext += String.fromCharCode((c >> 6) | 192);
			utftext += String.fromCharCode((c & 63) | 128);
		}
		else {
			utftext += String.fromCharCode((c >> 12) | 224);
			utftext += String.fromCharCode(((c >> 6) & 63) | 128);
			utftext += String.fromCharCode((c & 63) | 128);
		}
		n++;
	}
	return utftext;
}
knocknok.Base64._utf8_decode = function(utftext) {
	var string = "";
	var i = 0;
	var c = 0;
	var c1 = 0;
	var c2 = 0;
	var c3 = 0;
	while(i < utftext.length) {
		c = utftext.charCodeAt(i);
		if(c < 128) {
			string += String.fromCharCode(c);
			i++;
		}
		else if((c > 191) && (c < 224)) {
			c2 = utftext.charCodeAt(i + 1);
			string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
			i += 2;
		}
		else {
			c2 = utftext.charCodeAt(i + 1);
			c3 = utftext.charCodeAt(i + 2);
			string += String.fromCharCode((((c & 15) << 12) | ((c2 & 63) << 6)) | (c3 & 63));
			i += 3;
		}
	}
	return string;
}
knocknok.Base64.prototype.__class__ = knocknok.Base64;
DateTools = function() { }
DateTools.__name__ = ["DateTools"];
DateTools.__format_get = function(d,e) {
	return (function($this) {
		var $r;
		switch(e) {
		case "%":{
			$r = "%";
		}break;
		case "C":{
			$r = StringTools.lpad(Std.string(Std["int"](d.getFullYear() / 100)),"0",2);
		}break;
		case "d":{
			$r = StringTools.lpad(Std.string(d.getDate()),"0",2);
		}break;
		case "D":{
			$r = DateTools.__format(d,"%m/%d/%y");
		}break;
		case "e":{
			$r = Std.string(d.getDate());
		}break;
		case "H":case "k":{
			$r = StringTools.lpad(Std.string(d.getHours()),(e == "H"?"0":" "),2);
		}break;
		case "I":case "l":{
			$r = (function($this) {
				var $r;
				var hour = d.getHours() % 12;
				$r = StringTools.lpad(Std.string((hour == 0?12:hour)),(e == "I"?"0":" "),2);
				return $r;
			}($this));
		}break;
		case "m":{
			$r = StringTools.lpad(Std.string(d.getMonth() + 1),"0",2);
		}break;
		case "M":{
			$r = StringTools.lpad(Std.string(d.getMinutes()),"0",2);
		}break;
		case "n":{
			$r = "\n";
		}break;
		case "p":{
			$r = (d.getHours() > 11?"PM":"AM");
		}break;
		case "r":{
			$r = DateTools.__format(d,"%I:%M:%S %p");
		}break;
		case "R":{
			$r = DateTools.__format(d,"%H:%M");
		}break;
		case "s":{
			$r = Std.string(Std["int"](d.getTime() / 1000));
		}break;
		case "S":{
			$r = StringTools.lpad(Std.string(d.getSeconds()),"0",2);
		}break;
		case "t":{
			$r = "\t";
		}break;
		case "T":{
			$r = DateTools.__format(d,"%H:%M:%S");
		}break;
		case "u":{
			$r = (function($this) {
				var $r;
				var t = d.getDay();
				$r = (t == 0?"7":Std.string(t));
				return $r;
			}($this));
		}break;
		case "w":{
			$r = Std.string(d.getDay());
		}break;
		case "y":{
			$r = StringTools.lpad(Std.string(d.getFullYear() % 100),"0",2);
		}break;
		case "Y":{
			$r = Std.string(d.getFullYear());
		}break;
		default:{
			$r = (function($this) {
				var $r;
				throw "Date.format %" + e + "- not implemented yet.";
				return $r;
			}($this));
		}break;
		}
		return $r;
	}(this));
}
DateTools.__format = function(d,f) {
	var r = new StringBuf();
	var p = 0;
	while(true) {
		var np = f.indexOf("%",p);
		if(np < 0) break;
		r.b[r.b.length] = f.substr(p,np - p);
		r.b[r.b.length] = DateTools.__format_get(d,f.substr(np + 1,1));
		p = np + 2;
	}
	r.b[r.b.length] = f.substr(p,f.length - p);
	return r.b.join("");
}
DateTools.format = function(d,f) {
	return DateTools.__format(d,f);
}
DateTools.delta = function(d,t) {
	return Date.fromTime(d.getTime() + t);
}
DateTools.getMonthDays = function(d) {
	var month = d.getMonth();
	var year = d.getFullYear();
	if(month != 1) return DateTools.DAYS_OF_MONTH[month];
	var isB = ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
	return (isB?29:28);
}
DateTools.seconds = function(n) {
	return n * 1000.0;
}
DateTools.minutes = function(n) {
	return n * 60.0 * 1000.0;
}
DateTools.hours = function(n) {
	return n * 60.0 * 60.0 * 1000.0;
}
DateTools.days = function(n) {
	return n * 24.0 * 60.0 * 60.0 * 1000.0;
}
DateTools.parse = function(t) {
	var s = t / 1000;
	var m = s / 60;
	var h = m / 60;
	return { ms : t % 1000, seconds : Std["int"](s % 60), minutes : Std["int"](m % 60), hours : Std["int"](h % 24), days : Std["int"](h / 24)}
}
DateTools.make = function(o) {
	return o.ms + 1000.0 * (o.seconds + 60.0 * (o.minutes + 60.0 * (o.hours + 24.0 * o.days)));
}
DateTools.prototype.__class__ = DateTools;
events.UserEvent = function(type,user) { if( type === $_ ) return; {
	events.Event.apply(this,[type]);
	this.user = user;
}}
events.UserEvent.__name__ = ["events","UserEvent"];
events.UserEvent.__super__ = events.Event;
for(var k in events.Event.prototype ) events.UserEvent.prototype[k] = events.Event.prototype[k];
events.UserEvent.prototype.user = null;
events.UserEvent.prototype.__class__ = events.UserEvent;
events.SessionEvent = function(type) { if( type === $_ ) return; {
	events.Event.apply(this,[type]);
}}
events.SessionEvent.__name__ = ["events","SessionEvent"];
events.SessionEvent.__super__ = events.Event;
for(var k in events.Event.prototype ) events.SessionEvent.prototype[k] = events.Event.prototype[k];
events.SessionEvent.prototype.__class__ = events.SessionEvent;
events.ConnectionEvent = function(type) { if( type === $_ ) return; {
	events.Event.apply(this,[type]);
}}
events.ConnectionEvent.__name__ = ["events","ConnectionEvent"];
events.ConnectionEvent.__super__ = events.Event;
for(var k in events.Event.prototype ) events.ConnectionEvent.prototype[k] = events.Event.prototype[k];
events.ConnectionEvent.prototype.__class__ = events.ConnectionEvent;
EReg = function(r,opt) { if( r === $_ ) return; {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
}}
EReg.__name__ = ["EReg"];
EReg.prototype.customReplace = function(s,f) {
	var buf = new StringBuf();
	while(true) {
		if(!this.match(s)) break;
		buf.b[buf.b.length] = this.matchedLeft();
		buf.b[buf.b.length] = f(this);
		s = this.matchedRight();
	}
	buf.b[buf.b.length] = s;
	return buf.b.join("");
}
EReg.prototype.match = function(s) {
	this.r.m = this.r.exec(s);
	this.r.s = s;
	this.r.l = RegExp.leftContext;
	this.r.r = RegExp.rightContext;
	return (this.r.m != null);
}
EReg.prototype.matched = function(n) {
	return (this.r.m != null && n >= 0 && n < this.r.m.length?this.r.m[n]:(function($this) {
		var $r;
		throw "EReg::matched";
		return $r;
	}(this)));
}
EReg.prototype.matchedLeft = function() {
	if(this.r.m == null) throw "No string matched";
	if(this.r.l == null) return this.r.s.substr(0,this.r.m.index);
	return this.r.l;
}
EReg.prototype.matchedPos = function() {
	if(this.r.m == null) throw "No string matched";
	return { pos : this.r.m.index, len : this.r.m[0].length}
}
EReg.prototype.matchedRight = function() {
	if(this.r.m == null) throw "No string matched";
	if(this.r.r == null) {
		var sz = this.r.m.index + this.r.m[0].length;
		return this.r.s.substr(sz,this.r.s.length - sz);
	}
	return this.r.r;
}
EReg.prototype.r = null;
EReg.prototype.replace = function(s,by) {
	return s.replace(this.r,by);
}
EReg.prototype.split = function(s) {
	var d = "#__delim__#";
	return s.replace(this.r,d).split(d);
}
EReg.prototype.__class__ = EReg;
knocknok.PollRequest = function(conn) { if( conn === $_ ) return; {
	knocknok.WebRequest.apply(this,["http://knockserver.chat.unitedfuture.com:8080/poll","GET"]);
	this._id = conn.session.id;
	this.removeParam("callId");
	this.addParam("channel",conn.topic.id);
	this.addParam("sn",conn.user.screenName);
	this.addParam("session",conn.session.id);
	this.addParam("nocache",Std.string(Math.random()));
	this.addParam("jsonp","knocknok.PollRequest.callbacks.get('" + this._id + "')");
	this.setTimeout(35);
}}
knocknok.PollRequest.__name__ = ["knocknok","PollRequest"];
knocknok.PollRequest.__super__ = knocknok.WebRequest;
for(var k in knocknok.WebRequest.prototype ) knocknok.PollRequest.prototype[k] = knocknok.WebRequest.prototype[k];
knocknok.PollRequest.prototype._pollRequestCompleted = function(result) {
	knocknok.WebRequest.prototype.onWebRequestResult.apply(this,[result]);
}
knocknok.PollRequest.prototype.send = function() {
	knocknok.PollRequest.callbacks.set(this._id,$closure(this,"_pollRequestCompleted"));
	knocknok.WebRequest.prototype.send.apply(this,[]);
}
knocknok.PollRequest.prototype.__class__ = knocknok.PollRequest;
knocknok.Source = function(id,host,title,url,terms,referrals) { if( id === $_ ) return; {
	if(referrals == null) referrals = 0;
	this.id = id;
	this.host = host;
	this.title = title;
	this.url = url;
	this.terms = terms;
	this.referrals = referrals;
}}
knocknok.Source.__name__ = ["knocknok","Source"];
knocknok.Source.prototype.host = null;
knocknok.Source.prototype.id = null;
knocknok.Source.prototype.referrals = null;
knocknok.Source.prototype.terms = null;
knocknok.Source.prototype.title = null;
knocknok.Source.prototype.url = null;
knocknok.Source.prototype.__class__ = knocknok.Source;
$Main = function() { }
$Main.__name__ = ["@Main"];
$Main.prototype.__class__ = $Main;
$_ = {}
js.Boot.__res = {}
js.Boot.__init();
{
	Date.now = function() {
		return new Date();
	}
	Date.fromTime = function(t) {
		var d = new Date();
		d["setTime"](t);
		return d;
	}
	Date.fromString = function(s) {
		switch(s.length) {
		case 8:{
			var k = s.split(":");
			var d = new Date();
			d["setTime"](0);
			d["setUTCHours"](k[0]);
			d["setUTCMinutes"](k[1]);
			d["setUTCSeconds"](k[2]);
			return d;
		}break;
		case 10:{
			var k = s.split("-");
			return new Date(k[0],k[1] - 1,k[2],0,0,0);
		}break;
		case 19:{
			var k = s.split(" ");
			var y = k[0].split("-");
			var t = k[1].split(":");
			return new Date(y[0],y[1] - 1,y[2],t[0],t[1],t[2]);
		}break;
		default:{
			throw "Invalid date format : " + s;
		}break;
		}
	}
	Date.prototype["toString"] = function() {
		var date = this;
		var m = date.getMonth() + 1;
		var d = date.getDate();
		var h = date.getHours();
		var mi = date.getMinutes();
		var s = date.getSeconds();
		return date.getFullYear() + "-" + ((m < 10?"0" + m:"" + m)) + "-" + ((d < 10?"0" + d:"" + d)) + " " + ((h < 10?"0" + h:"" + h)) + ":" + ((mi < 10?"0" + mi:"" + mi)) + ":" + ((s < 10?"0" + s:"" + s));
	}
	Date.prototype.__class__ = Date;
	Date.__name__ = ["Date"];
}
{
	String.prototype.__class__ = String;
	String.__name__ = ["String"];
	Array.prototype.__class__ = Array;
	Array.__name__ = ["Array"];
	Int = { __name__ : ["Int"]}
	Dynamic = { __name__ : ["Dynamic"]}
	Float = Number;
	Float.__name__ = ["Float"];
	Bool = { __ename__ : ["Bool"]}
	Class = { __name__ : ["Class"]}
	Enum = { }
	Void = { __ename__ : ["Void"]}
}
{
	Math.NaN = Number["NaN"];
	Math.NEGATIVE_INFINITY = Number["NEGATIVE_INFINITY"];
	Math.POSITIVE_INFINITY = Number["POSITIVE_INFINITY"];
	Math.isFinite = function(i) {
		return isFinite(i);
	}
	Math.isNaN = function(i) {
		return isNaN(i);
	}
	Math.__name__ = ["Math"];
}
{
	js.Lib.document = document;
	js.Lib.window = window;
	onerror = function(msg,url,line) {
		var f = js.Lib.onerror;
		if( f == null )
			return false;
		return f(msg,[url+":"+line]);
	}
}
knocknok.Tag.subscribersTimer = null;
knocknok.Tag.idCounter = 1;
knocknok.Tag.tagRegistry = new Hash();
knocknok.Tag.topics = new Hash();
knocknok.Global.DOJO_LOADED = "dojoLoaded";
knocknok.Global.flashVersion = "";
knocknok.Global.screenResolution = "";
knocknok.Global.userAgent = "";
knocknok.Global.baseURL = "";
knocknok.Global.dojoLoaded = false;
knocknok.Global.useSockets = true;
knocknok.Global.hasFlash = false;
knocknok.WebRequest.Callbacks = new Hash();
knocknok.WebRequest._QueuedRequests = new List();
knocknok.WebRequest._instanceCount = 0;
knocknok.Topic._instances = new Hash();
events.TopicEvent.SUBSCRIBERS_CHANGED = "subscribers_changed";
events.TopicEvent.SUBSCRIBER_COUNT_CHANGED = "subscriber_count_changed";
events.TopicEvent.SOURCES_CHANGED = "sources_changed";
events.SourceEvent.LOADED = "sourceLoaded";
haxe.Timer.arr = new Array();
events.WebRequestEvent.SUCCESS = "success";
events.WebRequestEvent.TIMEOUT = "timeout";
events.WebRequestEvent.ERROR = "error";
js.Lib.onerror = null;
FlashDetect.nav = js.Lib.window.navigator;
FlashDetect.isIE = ((js.Lib.window.navigator.appVersion.indexOf("MSIE") != -1)?true:false);
FlashDetect.isWin = ((js.Lib.window.navigator.appVersion.toLowerCase().indexOf("win") != -1)?true:false);
FlashDetect.isOpera = ((js.Lib.window.navigator.userAgent.indexOf("Opera") != -1)?true:false);
events.MessageEvent.RECEIVED = "received";
events.MessageEvent.SENT = "sent";
knocknok.Base64._keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
DateTools.DAYS_OF_MONTH = [31,28,31,30,31,30,31,31,30,31,30,31];
events.UserEvent.JOIN = "userJoin";
events.UserEvent.LEAVE = "userLeave";
events.SessionEvent.STARTED = "started";
events.SessionEvent.LOGIN_SUCCESS = "loginSuccess";
events.ConnectionEvent.CONNECTED = "connected";
events.ConnectionEvent.DISCONNECTED = "disconnected";
knocknok.PollRequest.callbacks = new Hash();
$Main.init = knocknok.Global.main();
