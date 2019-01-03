window.document.addEventListener('DOMContentLoaded', function() {
	console.log("dama.js start");

	setTimeout(function() {
		var captchaImg = document.querySelector("div.cvf-captcha-img img");
		if (captchaImg == null) {
			captchaImg = document.querySelector("form[action='/errors/validateCaptcha'] img");
		}

		var captchaInput = document.querySelector("input[name='cvf_captcha_input']");
		if (captchaInput == null) {
			captchaInput = document.querySelector("#captchacharacters");
		}

		if (captchaImg && captchaInput) {
			console.log("find captcha");

			var captchaError = document.querySelector("div.cvf-alert-section");
			// TODO: add more captcha error format
			if (captchaError) {
				var lastId = window.localStorage.getItem("fbo.dama.last_captcha_guess_id");
				if (lastId) {
					console.log("last captch guess failed, will report", lastId);
					FBO.accessGet("/push_for_dama_fail?lastId=" + encodeURIComponent(lastId));
				}
			}

			var bout = FBO.getImgData(captchaImg.src, window.location.href);
			var res = FBO.accessPost("/post_for_dama", bout, "application/json");
			var arr = res.split("|");
			if (arr.length == 2) {
				console.log("got captcha guess result", arr[0], arr[1]);
				captchaInput.value = arr[1];
				window.localStorage.setItem("fbo.dama.last_captcha_guess_id", arr[0]);
				/*var sub = document.querySelector("input[name='cvf_captcha_captcha_action']");
				if (sub == null) {
					sub = document.querySelector("form[action='/errors/validateCaptcha'] button");
				}
				sub.click();*/
				FBO.createFboMessage({
					"type": "CAP",
					"data": "CAP_INPUT"
				});
				return;
			} else {
				console.log("error when try guess captcha", res);
				FBO.createFboMessage({
					"type": "CAP",
					"data": "CAP_ERROR"
				});
				return;
			}
		} else {
			FBO.createFboMessage({
				"type": "CAP",
				"data": "CAP_NO"
			});
			return;
		}
	}, 3000);
});