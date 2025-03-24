  function LTrim( value ) {
    var re = /\s*((\S+\s*)*)/;
    return value.replace(re, "$1");
  }
  function movetofirstRecord(x) {
    document.getElementById(x).focus();
  }
  function RTrim( value ) {
    var re = /((\s*\S+)*)\s*/;
    return value.replace(re, "$1");
  }
  function trim( value ) {
    return LTrim(RTrim(value));
  }

function trim1(s)
{
   return s.replace(/(^\s+)|(\s+$)/g, "");
}


  function ajaxFunction() {
    var xmlHttp;
    try {
      // Firefox, Opera 8.0, Safari
      xmlHttp=new XMLHttpRequest();
    } catch (e){
      // Internet Explorer
      try{
        xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
      } catch (e) {
        try{
          xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {
          alert(1);
        }
      }
    }
    return xmlHttp;
  }

   function uppCase(a) {
    var s=a.value
    if(s!=""){
     var str=""
     var s=a.value
     var l=s.length
     for(i=0;i<l;i++) {
       str=str+s.charAt(i)
     }
     var str1=str.toUpperCase()
     a.value=str1
    }
   }

   function getIP(tbName){
		var ip;
		$.getJSON('http://gd.geobytes.com/GetCityDetails?callback=?', function(data) {
		
			 JSON.stringify(data, null, 2)
			 ip=data.geobytesremoteip;
			 //alert("IPADDRESS : "+ip);
		
		/*$.getJSON('https://api.ipify.org/?format=json', function(data) {
		  JSON.stringify(data, null, 2)
		  ip=data.ip ;*/
			 //alert(tbName+" ~ "+ip);
			 $("#"+tbName+"").val(ip); 
		});
		
		//return ip;
   }
   
   function upperCase(obj)
   {
	   try {
		   obj.value = obj.value.toUpperCase();
	   } catch (err) {alert("upperCase : "+err);}
   }

   function Alpha(x) {
	   if(x.value!=""){
		   var regexLetter = /((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/i;
		   if(!x.value.match(regexLetter)){
    		//alert('Type alphanumeric character');
    		//x.focus();
    		return false;
		   } else {
			   return true;
		   } 
	   }  
   }


  function lowerCase(a) {
    var s=a.value;
    if(s!=""){
      a.value=s.toLowerCase();
    }
  } 
  
  function isEmpty(email){
    return((email==null)||(email.length==0))
  }

  function isWhitespace(email){
    var i;
    if(isEmpty(email)) return true;
    for(i=0;i<email.length;i++) {
      var currchar=email.charAt(i);
      //alert(currchar);
      if(currchar==" ")
        return false;
      }
    return true;
  }

  function isEmail(email) {
      if(isEmpty(email))
      if(isWhitespace(email))
      return false;
      var i=1,j=1;
      var sLength=email.length;
      while((i<sLength)&&(email.charAt(i)!="@")) {
          i++;
      }
      if((i>sLength)||(email.charAt(i)!="@"))
          return false;
      else i+=2;
      while((i<sLength)&&(email.charAt(i)!=".")) {
          i++;
      }
      if((i>=sLength-1)||(email.charAt(i)!="."))
          return false;
      else
          return true;
  }
  
  function validEmail(sText) {
	    if(sText.value!="") {
	      if(!isEmail(sText.value)) {
	        //alert("Enter proper email id like info@soainfotech.co.in / info@soainfotech.com . ");
	     showerr(sText,"Email Id should be proper.","block");  
	        email.focus();
	        return false;
	      }
	    }
	  }



	function checkLength(sText, n) {
		var val=sText.value;
 		var len=val.length;
  		var b=false;
  		if(len!=0) {
    		if(len!=n){
   				showerr(sText,"Length must be " + n + "digit(s)/character(s)");
   				sText.focus();
   				return false;
    		}
  		}
  		return true;
	}
	
	function PANVALUE(sText,n) {
	    if(checkLength(sText,n)){
	      uppCase(sText);
	      if(sText.value!="") {
	      var s="Y";
	      var pval;
	      var ValidChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	      var ValidNos = "0123456789";
	      pval=sText.value;
	        var cn;
	        for(i = 0; i < pval.length ; i++) {
	          cn = pval.charAt(i);
	          if(i<5) {
	            if(ValidChars.indexOf(cn) == -1){
	               var j;
	               j=parseInt(i)+1;
	               //alert("Value must be character at"+j+"th Place");
	               //showerr(sText,"Value must be character at"+j+"th Place","block");
	               if(j==1)
		               showerr(sText,"Value must be character at "+j+"st Place","block");
		               else if(j==2)
			               showerr(sText,"Value must be character at "+j+"nd Place","block");
		               else if(j==3)
			               showerr(sText,"Value must be character at "+j+"rd Place","block");
		               else 
			               showerr(sText,"Value must be character at "+j+"th Place","block");
	               //sText.value="";
	               sText.focus();
	               return false;
	            }
	          }
	          if(i>4 && i<9){
	            if(ValidNos.indexOf(cn) == -1){
	               var k;
	               k=parseInt(i)+1;
	               //alert("Value must be Numeric at "+k+"th Place");
	               showerr(sText,"Value must be Numeric at "+k+"th Place","block");
	               //sText.value="";
	               sText.focus();
	               return false;
	            }
	          }
	          if(i>8 && i<10){
	             if(ValidChars.indexOf(cn) == -1){
	                var l;
	                l=parseInt(i)+1;
	                //alert("Value must be character at"+l+"th Place");
	                showerr(sText,"Value must be character at"+l+"th Place","block");
	                //sText.value="";
	                sText.focus();
	                return false;
	             }
	          }
	        }
	      }
	    }
	  }



  function IsInteger(sText) {
    var ValidChars = "0123456789";
    var IsNumber=true;
    var v = 0;
    var Char;
    for (i = 0; i < sText.value.length && IsNumber == true; i++) { 
      Char = sText.value.charAt(i); 
      if (ValidChars.indexOf(Char) == -1) {
        //alert("Value must be numeric");
        showerr(sText,"Value must be numeric.","block");
        sText.focus();
        return false;
      }
    }
    v = sText.value;
    if(v!="") {
      if (v > 0) {
        return IsNumber;
      } else {
        //alert("Value must be greater than zero(s)");
        showerr(sText,"Value must be greater than zero(s)","block");
        sText.focus();
        return false;
      }
    }  
  }

  function isDecimal(obj,objLength) {
  	var ValidChars = "0123456789.";
  	var IsNumber=true;
  	var v = 0;
  	var Char;
  	try {
  		if(trim1(obj.value)!="") {
  			var j_objLength = obj.value.length;
  			var characterToCount = ".";
  			var counter=0;  			
  			for (i = 0; i < obj.value.length && IsNumber == true; i++) {
  				Char = obj.value.charAt(i);
  				if (ValidChars.indexOf(Char) == -1) {
  					showerr(obj,"Value must be numeric.","block");
  			        obj.focus();
  			        return false;  					
  				}
  			}
  			var myArray = obj.value.split('');
  			for (i=0;i<myArray.length;i++) {
  				if (myArray[i] == characterToCount) {
  					counter++;
  				}
  			}
  			if(counter>1) {
  				showerr(obj,"Invalid value.","block");
  				obj.focus();
  				return false;  					  				
  			}
  			if(parseInt(j_objLength)>parseInt(objLength)) {
  				showerr(obj,"Length should not be greater then "+objLength,"block");
  				obj.focus();
  				return false;  					  				  				
  			}
  			//alert(parseInt(j_objLength));
  			//alert(parseInt(objLength)-3);
  			if(parseInt(j_objLength)<parseInt(objLength)-3) {
  				if(counter<1) {
  					obj.value = parseFloat(obj.value).toFixed(2);
  				}
  			}
		}
  	} catch (err) {
  		alert("isDecimal : "+err.message);
  		return false;
  	}
  	return true;
  }
  
function isValidDate(dateStr) {
	var datePat = /^(\d{1,2})(\/)(\d{1,2})\2(\d{4})$/; // requires 4 digit year
	if(dateStr.value=="") {
		return;
	}
	var dateStr1=dateStr.value;
	var dateStr2=dateStr.value;
	for (i=0;i<dateStr.value.length;i++) {
		dateStr1=dateStr1.replace(' ', '/');
		dateStr1=dateStr1.replace('-', '/');
		dateStr1=dateStr1.replace('\\', '/');
		dateStr1=dateStr1.replace('.', '/');
	}
	if (!(dateStr1.substring(2,3)=="/")) {
		dateStr1=dateStr1.substring(0,2)+"/"+dateStr1.substring(2);
	}
	if (!(dateStr1.substring(5,6)=="/")) {
		dateStr1=dateStr1.substring(0,5)+"/"+dateStr1.substring(5);
	}
	dateStr.value = dateStr1;
	var matchArray = dateStr.value.match(datePat); // is the format ok?
	if (matchArray == null) {
		//alert(dateStr.value + " Date is not in a valid format.\n"+"        (dd/mm/yyyy)");
		showerr(dateStr,dateStr.value + " Date is not in a valid format.\n"+"        (dd/mm/yyyy)");
		dateStr.value=dateStr2;
		dateStr.focus()
		return false;
	}
	month = matchArray[3]; // parse date into variables
	day = matchArray[1];
	year = matchArray[4];
	if (month < 1 || month > 12) { // check month range
		//alert("Month must be between 1 and 12.");
		showerr(dateStr,"Month must be between 1 and 12.");
		dateStr.value=dateStr2;
		dateStr.focus()
		return false;
	}
	if (day < 1 || day > 31) {
		//alert("Day must be between 1 and 31.");
		showerr(dateStr,"Day must be between 1 and 31.");
		dateStr.value=dateStr2;
		dateStr.focus()
		return false;
	}
	if ((month==4 || month==6 || month==9 || month==11) && day==31) {
		//alert("Month "+month+" doesn't have 31 days!");
		showerr(dateStr,"Month "+month+" doesn't have 31 days!");
		dateStr.focus()
		return false;
	}
	if (month == 2) { // check for february 29th
		var isleap = (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0));
		if (day>29 || (day==29 && !isleap)) {
			//alert("February " + year + " doesn't have " + day + " days!");
			showerr(dateStr,"February " + year + " doesn't have " + day + " days!");
			dateStr.value=dateStr2;
			dateStr.focus()
			return false;
		}
	}
	return true;
}      

/*-------- 
Compare two dates, date1 with date2 
Comparator 0:equals, 1:Greater, 2:Lesser
		   10:Greater than equals to
		   20:Lesser than equals to
Both dates should be in dd/mm/yyyy format
date1 and date2 should be object		   	
---------*/
function compareDate(date1,date2,comparator,msg){
	var comp;
	if(comparator!=""){
		if((comparator=="0")||(comparator=="1")||(comparator=="2")||(comparator=="10")||(comparator=="20")){
		} else {
			showerr(date1,"Invalid Date Comparator.");
			return false;
		}
		if(date1.value==""){
			showerr(date1,"Date is mandatory.");
			return false;
		}
		if(date2.value==""){
			showerr(date2,"Comparator Date is mandatory.");
			return false;
		}	
		var a = date1.value;
		var b = date2.value;
		var c=a.substring(6,10)+a.substring(3,5)+a.substring(0,2);
		var d=b.substring(6,10)+b.substring(3,5)+b.substring(0,2);
		if(comparator=="0"){
			if(c==d){
				return true;
			} else {
				showerr(date1,msg);
				return false;
			}
		}
		if(comparator=="1"){
			if(c>d){
				return true;
			} else {
				showerr(date1,msg);
				return false;
			}
		}
		if(comparator=="2"){
			if(c<d){
				return true;
			} else {
				showerr(date1,msg);
				return false;
			}
		}		
		if(comparator=="10"){
			if(c>=d){
				return true;
			} else {
				showerr(date1,msg);
				return false;
			}
		}
		if(comparator=="20"){
			if(c<=d){
				return true;
			} else {
				showerr(date1,msg);
				return false;
			}
		}						
	} else {
		showerr(date1,"Date Comparator is null.");
		return false;
	}
}


function validateWebsite(website)
{
	var web =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
    return web.test(website);
}

function validateEmail(email) {
	  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	  return re.test(email);
}
/*
 * Added by Rajendra to get File size into MB
*/
function convertFileBytToMB(file_len)
{
	return file_len / (1024 * 1024);;
}

/*
 * Added by Rajendra to get File size into KB
*/
function convertFileBytToKB(file_len)
{
	return file_len / 1024;
}

/*
 * Added by Beenu Tyagi to Encypt and Decrypt json object
*/
var iv = CryptoJS.lib.WordArray.random(128/8).toString(CryptoJS.enc.Hex);
var salt = CryptoJS.lib.WordArray.random(128/8).toString(CryptoJS.enc.Hex);
var aesUtil = new AesUtil(128, 10);
function encAESData(key, data){
    var ciphertext = aesUtil.encrypt(salt, iv, key, JSON.stringify(data));
    var aesPassword = (iv + "::" + salt + "::" + ciphertext);
    return btoa(aesPassword);
}

function decAESData(key, data){
	return JSON.parse(aesUtil.decrypt(salt, iv, key, data));
}
