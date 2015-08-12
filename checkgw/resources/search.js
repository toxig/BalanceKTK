var request = new Object();
	var rq_link = "balance"; 	// http://localhost/check/balance	
	var rq_resault_obj = 'desk-info-label';

	var img_numbers = {
			0:'img/nums/0@2x.png',
			1:'img/nums/1@2x.png',
			2:'img/nums/2@2x.png',
			3:'img/nums/3@2x.png',
			4:'img/nums/4@2x.png',
			5:'img/nums/5@2x.png',
			6:'img/nums/6@2x.png',
			7:'img/nums/7@2x.png',
			8:'img/nums/8@2x.png',
			9:'img/nums/9@2x.png',			
			empty:'img/nums/empty@2x.png',
			empty_small:'img/nums/empty.png',
			conn:'img/nums/connect@2x.png',
			conn_err:'img/nums/connect_err@2x.png',
			minus:'img/nums/dash@2x.png',			
			up:'img/nums/up@2x.png',
			quest:'img/nums/quest@2x.png',
			undefined: 'img/nums/quest@2x.png'
	}
		
	var img_numbers_small = {
			0:'img/nums/0.png',
			1:'img/nums/1.png',
			2:'img/nums/2.png',
			3:'img/nums/3.png',
			4:'img/nums/4.png',
			5:'img/nums/5.png',
			6:'img/nums/6.png',
			7:'img/nums/7.png',
			8:'img/nums/8.png',
			9:'img/nums/9.png',			
			empty:'img/nums/empty.png',			
			conn:'img/nums/connect@2x.png',
			conn_err:'img/nums/connect_err@2x.png',
			minus:'img/nums/dash.png',			
			up:'img/nums/up@2x.png',			
			quest:'img/nums/quest@2x.png',
			undefined: 'img/nums/quest@2x.png'
	}
	
	function getData() {		// Формируем запрос		
	  request.userid = document.getElementById("userid_input").value;	  
	  
	  rq_link = rq_link.replace("_debug","");
	  if (request.userid.indexOf("d:")==0)	{  //debug mode		
		request.userid = request.userid.replace("d:","");
		rq_link += "_debug"; 
	  }	  
	  var ret = 	  
		 "<request>" + 
		 "  <userid>" + (request.userid) + "</userid>" +		 
		 "</request>"
		 ;  //escape
		return ret;
	}	
	
	function BarNumber_Clear() {		
		var num_empty = img_numbers['empty'];			
		document.getElementById("bar_number_1").src = num_empty;
		document.getElementById("bar_number_2").src = num_empty;
		document.getElementById("bar_number_3").src = num_empty;
		document.getElementById("bar_number_4").src = num_empty;
		document.getElementById("bar_number_5").src = num_empty;
		
		document.getElementById("bar_number_kop_1").src = img_numbers['empty_small'];
		document.getElementById("bar_number_kop_2").src = img_numbers['empty_small'];		
		
		document.getElementById("bar-numbers-header").innerHTML = "Баланс:";
	}
	
	function BarNumber_Set(pos,value){
				
		var img_list = img_numbers;		
		
		//if (pos.indexOf('k')!= -1) img_list = img_numbers_small;
		//else img_list = img_numbers;				
		
		var num_img = img_list[value];		
		
		if (value =='-') num_img = img_list['minus'];				
		if (num_img == null) num_img = img_list['quest'];
		
		switch (pos)
		{	case 'r1' : document.getElementById("bar_number_1").src = num_img; break;// 1 rub
			case 'r2' : document.getElementById("bar_number_2").src = num_img; break;// 10 rub
			case 'r3' : document.getElementById("bar_number_3").src = num_img; break;// 100 rub
			case 'r4' : document.getElementById("bar_number_4").src = num_img; break;// 1000
			case 'r5' : document.getElementById("bar_number_5").src = num_img; break;// 10000
			case 'k1' : document.getElementById("bar_number_kop_1").src = num_img; break;// 10 kop
			case 'k2' : document.getElementById("bar_number_kop_2").src = num_img; break;// 1 kop
		}
	}			
	
	function drawBalanceNum(value) {
	
		BarNumber_Clear();		
		
		if (value == undefined) {
			BarNumber_Set('r3','quest');
			return;
		}
				 
		value =	value.replace(/,/g,".");
		value =	value.replace(" ","");
		if (value[0]==".") { value = "0"+value; }
		
		var is_num = /^\-?[0-9]+[\.|\,]?\d*$/;		
						
		if (is_num.test(value)) {
			var rub_res = value.match(/^\-?[0-9]+/); // regexp - rub
			var kop_res = value.match(/[\.|\,][0-9]+$/); // regexp - kop
			var rub =rub_res[0];
			
			if (rub.length <=5 ) {			
				// копейки
				var kop = "00";
				if (kop_res != null) kop =(kop_res[0]+"00").substring(1, 3);								
				
				// отрисовка копеек
				BarNumber_Set('k2',kop[1]); //0.01
				BarNumber_Set('k1',kop[0]);	//0.10
				
				// отрисовка рублей
				if (rub.length > 0) BarNumber_Set('r1',rub[rub.length-1]); //00001.00
				if (rub.length > 1) BarNumber_Set('r2',rub[rub.length-2]); //00010.00
				if (rub.length > 2) BarNumber_Set('r3',rub[rub.length-3]); //00100.00
				if (rub.length > 3) BarNumber_Set('r4',rub[rub.length-4]); //01000.00
				if (rub.length > 4) BarNumber_Set('r5',rub[rub.length-5]); //10000.00
			}
			else
			{
				document.getElementById("bar-numbers-header").innerHTML = "Баланс:  " + value + " руб.";
				BarNumber_Set('r3','up');
			}			
		}				
		else
		{
			document.getElementById("bar-numbers-header").innerHTML = "Результат:  " + value;
			BarNumber_Set('r3','quest');
		}
	}
	
	function GetNodeValue(data, node_name) {	
		try{
			var Node_text = $(data).find(node_name).text();
			return Node_text;
		} 
		catch(i){	
			return  "";
		}
		
		// var Node = $(data).find(node_name).first();				
		// if(Node) return Node.text();		
	}
	
	function GetNodeData(str_data, node_name) {
		var pos_start = str_data.indexOf('<'+node_name+'>');
		var pos_end = str_data.indexOf('</'+node_name+'>');
		var res = "";
		
		if (pos_start >= 0) {
			res = str_data.substring(pos_start+node_name.length+2, pos_end);
		}		
		return res;
	}
		
	function drawResData(data) {

		if (rq_link.indexOf('debug') >= 0) {
			document.getElementById("debug-info").innerHTML = "<plaintext>"+data+"</plaintext>"; //debug			
		} else {document.getElementById("debug-info").innerHTML = "";}				
				
		data = data.substring(data.indexOf('<response>'), data.indexOf('</response>')+11);		
								
		//var xml_data = $.parseXML(data);		
		//var rc = GetNodeValue(xml_data,'rc'); //$(xml_data).find('rc').first().text(); // 1
		
		var rc = GetNodeData(data,'rc');//
		var id_status  = GetNodeData(data,'id_status');
		var id_type_name = GetNodeData(data,'id_type_name'); // $(xml_data).find('id_type_name').first().text(); // Краснодар проводной тел.
		var msg = GetNodeData(data,'msg'); //$(xml_data).find('msg').first().text(); // Подкючение: 8612786079
		var nmbplan = GetNodeData(data,'nmbplan'); //$(xml_data).find('nmbplan').first().text(); // КТК-Абонентский PSTN ф. ВК
		var rbalance = GetNodeData(data,'rbalance'); //$(xml_data).find('rbalance').first().text(); // -410		
		var str = GetNodeData(data,'str'); //$(xml_data).find('str').first().text(); // system text
		var sum_abon = GetNodeData(data,'sum_abon'); //$(xml_data).find('sum_abon').first().text(); // 410
		var timestamp = GetNodeData(data,'timestamp'); //$(xml_data).find('timestamp').first().text(); // 2015.03.16 16:30:02
		var user_uid = GetNodeData(data,'user_uid'); //$(xml_data).find('user_uid').first().text(); // 0861419968				
		
		if (rc == 1) { // клиент найден
			$$(rq_resault_obj,
				'<br>'+
				msg +'<br>'+								
				id_type_name +'<br>'+							
				id_status +'<br>'+				
				//'Баланс: '+rbalance+' руб.<br>'+	
				'Абон. плата: '+ sum_abon +' руб./мес.<br>'+
				'UID (плат идентиф): ' + user_uid +'<br>'
				//'ТП: '+nmbplan +'<br>'+							
				//'Дата проверки: '+timestamp
			 );
			 drawBalanceNum(rbalance);
		}
		else { // клиент не найден
			$$(rq_resault_obj,
				'<br><br>'+
				id_type_name +'<br>'+
				msg +'<br><br>'+
				timestamp				
			  );
			  BarNumber_Clear();
			  BarNumber_Set('r3','quest');
		}
		
		return true;
	}
	
	// точка входа
	function SendGet() {
		if ( !checkInputs() ) return; // проверка введенных данных
		
		$$(rq_resault_obj,'<br><br><br>Запрос информации ...');
		var now = new Date();		
		
		// отправляю GET запрос и получаю ответ
		$$a({
			type:'get',//тип запроса: get,post либо head
			data:{'document':getData(),'date':(now.format("yyyymmddHHMMss"))},//параметры запроса
			url: rq_link,//url адрес файла обработчика			
			response:'text',//тип возвращаемого ответа text (req.responseText) либо xml (req.responseXML)
			success:function (data) {//возвращаемый результат от сервера				
				// $$(rq_resault_obj,'Result:<br>'	+ data +'<br>');
				drawResData(data);				
			},
			endstatus: function (number) { // статус Ajax запроса
				var now = new Date();
				$$('desk-time-label',now.format("HH:MM:ss"));
				if (number == 200) { // без ошибок
					return true; // ok
				}
				else if(number == 404) {
					$$(rq_resault_obj,'<br><br>Сервер недоступен, попробуйте позже ... <br>'+										
										now.format("dd.mm.yyyy HH:MM:ss")+
										'<br><br>link: '+window.location.href+rq_link+'<br>'
					  );
					  drawBalanceNum('conn_err');
				}				
				else {
					$$(rq_resault_obj,'<br><br><br>Ошибка ['+number+'] <br>'+now.format("dd.mm.yyyy HH:MM:ss"));
					drawBalanceNum();
				}								
			}						
		});
		document.getElementById("button_request").focus();		
	}
	
	// Это может быть исправлено путем перемещения ресурса в тот же домен или включением CORS

	function SendPost() {
		//отправляю POST запрос и получаю ответ
		$$a({
			type:'post',//тип запроса: get,post либо head
			url:'ajax.php',//url адрес файла обработчика
			data:{'z':'1','x':'2'},//параметры запроса
			response:'text',//тип возвращаемого ответа text либо xml
			success:function (data) {//возвращаемый результат от сервера
				//$$('result-text',$$('result-text').innerHTML+'<br />Res POST: '+data);
				$$('desk-info-label','Res POST : '+data);
			}
		});
	}

	function SendHead() {
		//отправляю HEAD запрос и получаю заголовок
		$$a({
			type:'head',//тип запроса: get,post либо head
			url:'ajax.php',//url адрес файла обработчика			
			response:'text',//тип возвращаемого ответа text либо xml
			success:function (data) {//возвращаемый результат от сервера
				$$('desk-info-label','Res HEAD : '+data);
			}			
		});
	}
	
	function checkInputs() {    // проверяем ввод на отсутствие пустых полей
		var ret = true;
		var phone = document.getElementById("userid_input").value;
		phone = phone.replace(" ","");
		
		if ( phone == "") {
			$$('desk-info-label','<br><br><br>Заполните поле поиска!');
			document.getElementById("userid_input").value = "";
			document.getElementById("userid_input").focus();			
			// alert('Заполните поле поиска!');
			ret = false; 
		}	
		return ret ;
	}		