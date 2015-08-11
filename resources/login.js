function backFocusTelNumber(a) {
  if ((a.keyCode == 8) && ($('.telNumber').val().replace(new RegExp('_', 'g'), '').length == 0)) {
    $('.telCode').focus()
  }
}
function toFocusTelNumber(a) {
  if (($('.telCode').val().match(/\d{3}/)) && (a.keyCode != 8)) {
    $('.telNumber').focus()
  }
}
function toggleVisible() {
  for (var a = 0; a < arguments.length; a++) {
    $(arguments[a]).toggle()
  }
}
function togglePasswordField(a) {
  a = $(a);
  a.toggleClass('open');
  var b = a.parent();
  sharePasswordValue(b);
  $('.password-input', b).toggle()
}
function sharePasswordValue(a) {
  $('input.password-input:hidden', a).val($('input:visible', a).val())
}
function processKeyPressed(c, b, a) {
  if (b.keyCode == 13) {
    a(c)
  }
}
function prepareB2BPasswordForSubmit(c, b) {
  var a = $('.' + b + '.password-visible', c);
  var d = $('.' + b + '.password-hidden', c);
  a.val(d.val());
  d.val('')
}
function processSubmitB2BPasswordChange(b) {
  var a = $(PrimeFaces.escapeClientId(b));
  prepareB2BPasswordForSubmit(a, 'password-old');
  prepareB2BPasswordForSubmit(a, 'password');
  prepareB2BPasswordForSubmit(a, 'password-confirm');
  a.submit()
}
function processSubmit(c) {
  var a = $(PrimeFaces.escapeClientId(c));
  var b = $('.password-field .field', a);
  sharePasswordValue(b);
  $('input.password-hidden', b).val('');
  a.submit()
}
$(document).ready(function () {
  if ($('.login-page').hasClass('b2c-mode')) {
    if ($('.b2c-content').hasClass('tablet')) {
      $('.kaptchaValue').focus();
      if ($('.kaptchaValue').hasClass('ui-state-error')) {
        softScrollIntoView('.kaptchaValue', 500)
      }
    } else {
      $('#loginFormB2C\\:loginForm\\:login').focus()
    }
    $('form.mobile-version-link').show()
  } else {
    $('#loginFormB2B\\:loginForm\\:login').focus()
  }
  if (badbrowsers()) {
    $('#old-browser').show()
  }
});
function setCookie(a, c, b) {
  var d = new Date();
  if (b) {
    d.setDate(d.getDate() + b)
  }
  createCookie(a, c, null, null, b ? d.toUTCString()  : null, isSecure())
}
function createCookie(b, d, c, f, a, e) {
  document.cookie = b + '=' + escape(d) + (c ? '; domain=' + c : '') + (f ? '; path=' + f : '') + (a ? '; expires=' + a : '') + (e ? ' ; secure' : '')
}
function getCookie(b) {
  var c,
  a,
  e,
  d = document.cookie.split(';');
  for (c = 0; c < d.length; c++) {
    a = d[c].substr(0, d[c].indexOf('='));
    e = d[c].substr(d[c].indexOf('=') + 1);
    a = a.replace(/^\s+|\s+$/g, '');
    if (a == b) {
      return unescape(e)
    }
  }
}
function parentDomain() {
  var b = location.hostname;
  var a = b.indexOf('.');
  if (a >= 0) {
    var c = b.lastIndexOf('.');
    if (c != a) {
      return b.substring(a)
    } else {
      return '.' + b
    }
  } else {
    return b
  }
}
function isSecure() {
  return location.protocol == 'https:'
}
function badbrowsers() {
  var a = navigator.userAgent.toLowerCase();
  $.browser.chrome = /chrome/.test(navigator.userAgent.toLowerCase());
  if ($.browser.msie) {
    a = $.browser.version;
    a = a.substring(0, a.indexOf('.'));
    if (a < 7) {
      return true
    }
  }
  if ($.browser.chrome) {
    a = a.substring(a.indexOf('chrome/') + 7);
    a = a.substring(0, a.indexOf('.'));
    if (a < 10) {
      return true
    }
  }
  if ($.browser.safari) {
    a = a.substring(a.indexOf('version/') + 8);
    a = a.substring(0, a.indexOf('.'));
    if (!$.browser.chrome && a < 5) {
      return true
    }
  }
  if ($.browser.mozilla) {
    a = a.substring(a.indexOf('firefox/') + 8);
    a = a.substring(0, a.indexOf('.'));
    if (a < 3.6) {
      return true
    }
  }
  if ($.browser.opera) {
    a = a.substring(a.indexOf('version/') + 8);
    a = a.substring(0, a.indexOf('.'));
    if (a < 11) {
      return true
    }
  }
  return false
}
function softScrollIntoView(b, a) {
  a = a || 0;
  try {
    if (!$(b).length) {
      return
    }
    $('html, body').animate({
      scrollTop: $(b).offset().top - a
    }, 400)
  } catch (c) {
  }
}
function hImage() {
  $('.slide.multiple-items').each(function () {
    var a = 0;
    $(this).find('.images img').hide();
    $(this).find('.images img:first').show();
    $(this).find('.images img').each(function () {
      if ($(this).height() > a) {
        a = $(this).height()
      }
    });
    if (a > 0) {
      $(this).find('.images').height(a)
    } else {
      $(this).find('.images').height('500')
    }
  })
}
function hideErrors() {
  $('.login-page div.field-container.error').removeClass('error');
  $('.login-page div.field-container .ui-message-error, .login-page div.field-container .ui-messages-error').hide();
  $('.login-page div.wrong-pass-descr').hide()
}
function changeLoginFormByParam(b, a) {
  if (getCookie('userType') == 'B2B') {
    $('div.login-page').removeClass('b2c-mode')
  }
  if (b) {
    if (b == 'b2b') {
      $('div.login-page, #footer').removeClass('b2c-mode');
      setCookie('userType', 'B2B', a)
    } else {
      $('div.login-page, #footer').addClass('b2c-mode');
      setCookie('userType', 'B2C', a)
    }
  }
}
function showB2CLoginForm(a) {
  interactionClick('cabinetType', 'b2c');
  $('div.login-page, #footer').addClass('b2c-mode');
  $('#loginFormB2C\\:loginForm\\:login').focus();
  setCookie('userType', 'B2C', a);
  hideErrors();
  hImage()
}
function showB2BLoginForm(a) {
  interactionClick('cabinetType', 'b2b');
  $('div.login-page, #footer').removeClass('b2c-mode');
  $('#loginFormB2B\\:loginForm\\:login').focus();
  setCookie('userType', 'B2B', a);
  hideErrors()
}
function welcomeB2CMenuInit() {
  $('.slide-menu li').click(function () {
    if ($(this).hasClass('item-detalization')) {
      interactionChange('costs monitoring', 'detalisation')
    } else {
      if ($(this).hasClass('item-billcompare')) {
        interactionChange('costs monitoring', 'accountsComparison')
      } else {
        if ($(this).hasClass('item-control')) {
          interactionChange('costs monitoring', 'control')
        } else {
          if ($(this).hasClass('item-payment')) {
            interactionChange('costs monitoring', 'refillAccount')
          } else {
            if ($(this).hasClass('item-onenum')) {
              interactionChange('several numbers', 'one number')
            } else {
              if ($(this).hasClass('item-multiplenum')) {
                interactionChange('several numbers', 'severalNumbers')
              } else {
                if ($(this).hasClass('item-blocking')) {
                  interactionChange('several numbers', 'blocking')
                }
              }
            }
          }
        }
      }
    }
    if ($(this).hasClass('active')) {
      return
    }
    var a = $(this).parent();
    a.find('li.active').removeClass('active');
    $(this).addClass('active');
    var b = a.find('li').index(this);
    a.parent().find('div.images img:visible').fadeOut('fast', function () {
      $(a.parent().find('div.images img').get(b)).fadeIn('fast')
    })
  })
}
function lightingLoginFields(a) {
  if ($('#' + a + '\\:loginForm\\:login').hasClass('ui-state-error')) {
    $('#' + a + '\\:loginForm\\:login').parent().parent().addClass('error')
  }
  if ($('#' + a + '\\:loginForm .ui-messages-error').length) {
    $('#' + a + '\\:loginForm .field-container').addClass('error');
    $('.wrong-pass-descr').show()
  }
}
function initSuggestedLogin(b, a) {
  var c = $(PrimeFaces.escapeClientId(b));
  if ((!c.val() || !c.val().length) && !c.hasClass('ui-state-error')) {
    c.val(a)
  }
}
function startWaitingForXbrResponse(a) {
  setTimeout(xbrTimeoutReached, a)
}
function xbrResponseReceived() {
  createCookie('token', '', null, '/', 'Thu, 01 Jan 1970 00:00:01 GMT', isSecure());
  window.location.href = '/login.xhtml'
}
function xbrTimeoutReached() {
  createCookie('token', '', null, '/', 'Thu, 01 Jan 1970 00:00:01 GMT', isSecure());
  window.location.href = '/noXbr.xhtml'
};
