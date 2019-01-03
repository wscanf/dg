window.FBO = {
	
	"addRemoteScriptSync": function (filename) {
		document.write("<script src='https://raw.githubusercontent.com/wscanf/dg/master/" + filename + "'></script>");
	},
	
	"addRawScriptSync": function (content) {
		document.write("<script>" + content + "</script>");
	},
	
	"clickElement": function (ele) {
		ele.scrollIntoView();
		var rec = ele.getBoundingClientRect();
		var x = rec.left + rec.width / 2;
		var y = rec.top + rec.height / 2;
		console.log("base.js", "going to click", x, y, ele);
		callbackObj.clickInWindow(x, y);
	},

	"hoverElement": function (ele) {
		ele.scrollIntoView();
		var rec = ele.getBoundingClientRect();
		var x = rec.left + rec.width / 2;
		var y = rec.top + rec.height / 2;
		console.log("base.js", "going to hover", x, y);
		callbackObj.moveInWindow(x, y);
	},

	"inputElement": function (ele, str) {
		ele.scrollIntoView();
		var rec = ele.getBoundingClientRect();
		var x = rec.left + rec.width / 2;
		var y = rec.top + rec.height / 2;
		console.log("base.js", "going to input", x, y);
		callbackObj.sendInputInWindow(x, y, str, true);
	},

	"checkElementVisibility": function (obj) {
		function _get_ele_top_left(ele) {
			var top = 0;
			var left = 0;
			while(ele){
				top += ele.offsetTop;
				left += ele.offsetLeft;
				ele = ele.offsetParent;
			}
			return {top:top,left:left};
		}
		if (_get_ele_top_left(obj).top + obj.clientHeight > window.pageYOffset 
				&& window.pageYOffset + window.innerHeight > _get_ele_top_left(obj).top) {
			return 1; // visibility
		} else {
			if (window.pageYOffset > _get_ele_top_left(obj).top + obj.clientHeight
				&& window.pageYOffset + window.innerHeight > _get_ele_top_left(obj).top) {
				return -1; // need scroll up
			}
			return -2; // need scroll down
		}
	},

	"tryScrollToElement": function (ele) {
		var nowV = FBO.checkElementVisibility(ele);
		if (nowV == -1) {
			callbackObj.scrollInWindow(240);
		} else if (nowV == -2) {
			callbackObj.scrollInWindow(-240);
		}
		return nowV;
	},

	"reportCookie": function () {
		callbackObj.reportCookie();
	},

	"accessPost": function (pathAndQuery, body, contentType) {
		return callbackObj.accessPost(pathAndQuery, body, contentType);
	},

	"accessGet": function (pathAndQuery) {
		return callbackObj.accessGet(pathAndQuery);
	},

	"getEmailCode": function () {
		return callbackObj.getEmailCode();
	},

	"getImgData": function (imgSrc, referer) {
		return callbackObj.getImgData(imgSrc, referer);
	},

	"getEmailNew": function () {
		return callbackObj.getEmailNew();
	},

	"getPhoneEnd": function (hint) {
		return callbackObj.getPhoneEnd(hint);
	},

	"getPublicName": function () {
		return callbackObj.getPublicName();
	},

	"getPassword": function () {
		return callbackObj.getAmzPwd();
	},

	"getEmail": function () {
		return callbackObj.getEmail();
	},

	"getCcYear": function () {
		return callbackObj.getCcYear();
	},

	"getCcMonth": function () {
		return callbackObj.getCcMonth();
	},

	"writeFile": function (fileName, content) {
		return callbackObj.writeFile(fileName, content);
	},

	"setWindowTitlePrefix": function (content) {
		return callbackObj.setWindowTitlePrefix(content);
	},

	"createFboMessage": function (type, data) {
		window.postMessage({
			"__from__fbo__": true,
			"type": type,
			"data": data
		}, "*");
	},

	"subscribeFboMessage": function (cb) {
		FBO.__fbo__message__listener.push(cb);
	},

	"__fbo__message__listener": [],

	"__init__": function () {
		console.log("base.js fbo obj init");
		window.addEventListener("message", FBO.__fbo__message__handler, false);
	},

	"__fbo__message__handler": function (e) {
		if (e && e.data && e.data.__from__fbo__) {
			for (var i = 0; i < FBO.__fbo__message__listener.length; ++i) {
				try {
					FBO.__fbo__message__listener[i](e.data);
				} catch (error) {
					console.log("cb error", error);
				}
			}
		}
	}
};

window.FBO.__init__();
// load plugins
window.FBO.addRemoteScriptSync("dama.js");
window.FBO.addRemoteScriptSync("auto_login.js");
