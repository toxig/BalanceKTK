function GTMEvent(){var a=this;var b={};function c(e,d){if(e){b[e]=d?d.toString():"null"}return a}this.event=function(d){return c("event",d)};this.eventCode=function(d){return c("eventCode",d)};this.context=function(d){return c("eventContext",d)};this.popup=function(d){if(!d){d="popup"}return c("eventPopup",d)};this.category=function(d){return c("eventCategory",d)};this.action=function(d){return c("eventAction",d)};this.label=function(d){return c("eventLabel",d)};this.url=function(d){return c("eventURL",d)};this.location=function(d){return c("eventLocation",d)};this.eventTab=function(d){return c("eventTab",d)};this.count=function(d){return c("eventCount",d)};this.date=function(d){return c("eventDate",d)};this.period=function(d){return c("eventPeriod",d)};this.eventServiceID=function(d){return c("eventServiceID",d)};this.eventServiceName=function(d){return c("eventServiceName",d)};this.eventTariffID=function(d){return c("eventTariffID",d)};this.eventTariffName=function(d){return c("eventTariffName",d)};this.price=function(d){return c("eventPrice",d)};this.serviceID=function(d){return c("eventServiceID",d)};this.serviceName=function(d){return c("eventServiceName",d)};this.pushTo=function(d){if(d){d.push(b)}};this.push=function(){if(typeof dataLayer!="undefined"&&dataLayer!=null){this.pushTo(dataLayer)}};this.obj=b}function newGtmEvent(){return new GTMEvent().event("OWOX")}function interaction(){return newGtmEvent().category("Interactions")}function headerCategory(a){interaction().action("click").location("header category").label(a).push()}function interactionClick(a,b){var c=interaction().action("click").label(a);if(b){c.context(b)}c.push()}function interactionGoLink(b,a){var c=interaction().action("goLink");if(b){c.label(b)}if(a){c.url(a)}return c}function getCurrentDate(){var c=new Array("01","02","03","04","05","06","07","08","09","10","11","12");var e=new Date();var a;if(e.getDate()<10){a="0"+e.getDate()}else{a=e.getDate()}var b=a+"/"+c[e.getMonth()]+"/"+e.getFullYear();return b}function getFinInfoEventPeriod(b,c){var a={ONE_DAY:"last day",WEEK:"last week",TWO_WEEKS:"last two weeks",MONTH:"last month",PERIOD:""};if(b=="PERIOD"){c=parseInt(c)+1;if(c<10){return"0"+c+a[b]}else{return c+a[b]}}return a[b]}function getFacetName(a){var b={serviceCol:"service",dateCol:"date",mobileNumCol:"mobileNumber",volumeCol:"scopeOfServices"};return b[a]}function getPaymentEventPeriod(a){if(a<10){return"0"+a}else{return a}}function getServicesType(b){var a={ALL:"all services",CONNECTED:"apply services",AVAILABLE:"available services"};return a[b]}function interactionChange(b,a){interaction().action("change").location(b).label(a).push()}function getDetailName(b){var a={VOICE_CALLS:"calls",MMS:"mms",SMS:"sms",INTERNATIONAL_ROAMING:"roaming",ROAMING_IN_RUSSIA:"roaming",SERVICES_PAYMENTS_AND_MOBILE_TRANSFERS:"paymentForServices"};return a[b]}function loginMet(a){return new function(){dataLayer=[{pageType:"Authorization",account:a}]}}function recoverypassGmetrics(a){return new function(){dataLayer=[{pageType:"GetPassword",step:"Step2",account:a}]}}function videoGmetrics(a){return new function(){dataLayer=[{pageType:"VideoTour",account:a}]}}function mainGmetrics(g,d,h,c,l,f,j,a,k,e,b){return new function(){var m=false;for(i=0;i<dataLayer.length;i++){if(typeof dataLayer[i].pageType!="undefined"){m=true}}if(!m){dataLayer.push({pageType:g})}if(d=="true"){dataLayer.push({account:h})}else{dataLayer.push({mainAccount:h,additionalAccount:c})}dataLayer.push({cabinetType:l,userType:f,accountsCount:j,regionName:a,regionId:k,tariffId:e,tariffName:b})}}function balanceGmetrics(a){return new function(){a=a&&!(0===a.length)?a:"null";for(i=0;i<dataLayer.length;i++){if(typeof dataLayer[i].balance!="undefined"){dataLayer[i].balance=a;return}}dataLayer.push({balance:a})}}function requestIDGmetrics(a){return new function(){if(a||!(0===a.length)){dataLayer.push({requestId:a})}}}function tariffsAmountGmetrics(a){return new function(){if(a){if(!(0===a.length)){dataLayer.push({tariffsCount:a})}}}}function servicesAmountGmetrics(a){return new function(){if(a){if(!(0===a.length)){dataLayer.push({servicesCount:a})}}}}function getSelectValueByName(a){var b=$("select[name='"+a+"_input'] option:selected");return b.val()}function getSelectLabelByName(a){var b=$("label[id='"+a+"_label']");return b.text()}function getRadioValueByName(a){var b=$("input[name='"+a+"']:checked");return b.val().toLowerCase()}function getValueForSaveType(c,g,f){var e;var b=$("#"+c);var a=b.find("input[name*='"+g+"_input']")[0].checked;var d=b.find("input[name*='"+f+"_input']")[0].checked;if(a&&!d){e="downloadFile"}else{if(!a&&!d){e="orderedDetalisations"}else{e="sentToEmail"}}return e}function isAvailableServicesMetricLoaded(){for(i=0;i<dataLayer.length;i++){if(typeof dataLayer[i].availableServices!="undefined"){return true}}return false}function interactionWithTariffInfo(c,a,b){interactionWithInfo(true,c,a,getUssMetricsHelper().currentPP,getUssMetricsHelper().currentPPDesc,b)}function interactionWithInfo(a,f,c,g,b,d){var e=interaction().action(f).label(c);if(d){e.context(d)}if(a==="true"){e.eventTariffID(g);e.eventTariffName(b)}else{e.eventServiceID(g);e.eventServiceName(b)}e.push()}function initMetrics(){if(typeof ussMetrics=="undefined"){ussMetrics={SDB8:function(a,c,b){interactionWithInfo(a,"send","invitation",c,b)},SDB13L:function(a,c,b){interactionWithInfo(a,"click","forSeveralDevices",c,b,"list")},SDB13C:function(a,c,b){interactionWithInfo(a,"click","forSeveralDevices",c,b,a?"tariffCard":"serviceCard")},SDB14:function(a,c,b){interactionWithInfo(a,"update","devideInternet",c,b,"step1")},SDB16:function(a,c,b){interactionWithInfo(a,"confirm","step1",c,b)},SDB17:function(a,c,b){interactionWithInfo(a,"click","identifyNumber",c,b,"step1")},SDB18:function(a,c,b){interactionWithInfo(a,"click","noSimcard",c,b,"step1")},SDB19T:function(b,a){interactionWithInfo(true,"click","details",b,a,"step1")},SDB19S:function(b,a){interactionWithInfo(false,"click","details",b,a,"step1")},SDB20C:function(){interactionWithTariffInfo("click","tab","cost")},SDB20D:function(){interactionWithTariffInfo("click","tab","details")},SDB22:function(a,c,b){interactionWithInfo(a,"cancel","step1",c,b)},SDB23:function(a,c,b){interactionWithInfo(a,"click","backRequest",c,b,"step2")},SDB24:function(a,c,b){interactionWithInfo(a,"click","cancelRequest",c,b,"step2")},SDB25:function(a,c,b){interactionWithInfo(a,"confirm","step2",c,b)},SDB26:function(a,c,b){interactionWithInfo(a,"click","switchWiFiOff",c,b,"step2")},SDB27:function(a,c,b){interactionWithInfo(a,"click","noInvitation",c,b,"step2")},SDB28:function(a,c,b){interactionWithInfo(a,"switchOff","device",c,b,"step2")},SDB29I:function(){interactionWithTariffInfo("click","terms","step3")},SDB29E:function(a,c,b){interactionWithInfo(a,"click","terms",c,b,"step2")},SDB30:function(){interactionWithTariffInfo("click","refuseInvitation","step3")},SDB31:function(){interactionWithTariffInfo("confirm","step3")},SDB32:function(){interactionWithTariffInfo("close","message","step4")},AP9VK:function(){newGtmEvent().category("SocialInteractions").action("auth").label("socialAuth").context("vk").push()},AP9FB:function(){newGtmEvent().category("SocialInteractions").action("auth").label("socialAuth").context("fb").push()},AP5T:function(){interactionClick("device","tablet")},AP5UM:function(){interactionClick("device","usbModem")},AP5SN:function(){interactionClick("device","severalNumbers")},AP4:function(){interactionClick("videoTour")},AP10:function(){interactionClick("cabinetPresentation")},AP8:function(){interactionClick("getPassword")},AP7:function(){interactionClick("enter")}}}}function metrica(b){initMetrics();var a=Array.prototype.slice.call(arguments,1);ussMetrics[b].apply(this,a)};