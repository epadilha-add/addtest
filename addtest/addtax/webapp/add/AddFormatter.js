sap.ui.define([], function () {
	"use strict";
	return {
		formatProcx: function (sProcx) {
			
			var addParam = sap.ui.getCore().getModel("AddPARAM");
			var desc = null;
			try{
				desc = (addParam.oData.VIEWS['0400'].find(function(x) {if(x.PROCP == sProcx) return x;})).DESCR;
			}catch(e){
				
			}
			
			return (desc)?desc:sProcx;
			
		},
		formatBukrs: function (sBukrs) {
			
			var addParam = sap.ui.getCore().getModel("AddPARAM");
			var desc = null;
			try{
				desc = (addParam.oData.VIEWS['0200'].find(function(x) {if(x.BUKRS == sBukrs) return x;})).DESCR;
			}catch(e){
				
			}
			return (desc)?desc:sBukrs;
			
		},
		formatStatus: function (sSTATU, sProcx) {
			
			var addParam = sap.ui.getCore().getModel("AddPARAM");
			var desc = null;
			try{
				var a0112 = (addParam.oData.VIEWS['0400'].find(function(x) {if(x.PROCP == sProcx) return x;}))['0112'];
				if(a0112){
					desc = a0112.find(function(x) {if(x.STATU == sSTATU) return x;});
					desc = sSTATU + " - " + desc.DESCR;
				}
			}catch(e){
				
			}
			
			//Caso a variável DESC esteja vazia/undefined tenta buscar na variante de status globais
			try{
				if(desc === undefined || desc === null)
				{
					var a0104 = (addParam.oData.VIEWS['0104'].find(function(x) {if(x.STATU == sSTATU) return x;}));
					desc = sSTATU + " - " + a0104.DESCR;
				}
			}catch(e){
				
			}
			return (desc)?desc:sSTATU;
			
		},
		formatStatusState: function (sSTATU, sProcx) {
			
			var addParam = sap.ui.getCore().getModel("AddPARAM");
			var tpMSG = "";
			try{
				var a0112 = (addParam.oData.VIEWS['0400'].find(function(x) {if(x.PROCP == sProcx) return x;}))['0112'];
				if(a0112){
					tpMSG = a0112.find(function(x) {if(x.STATU == sSTATU) return x;});
					tpMSG = tpMSG.TPMSG;
				}
			}catch(e){
				
			}
			
			//Caso a variável DESC esteja vazia/undefined tenta buscar na variante de status globais
			try{
				if(tpMSG === undefined || tpMSG === null || tpMSG === "")
				{
					var a0104 = (addParam.oData.VIEWS['0104'].find(function(x) {if(x.STATU == sSTATU) return x;}));
					tpMSG = a0104.TPMSG;
				}
			}catch(e){
				
			}
			
			var state = "None";
			switch (tpMSG){
				case "E":
					state = "Error";
					break;
				case "W":
					state = "Warning";
					break;
				case "S":
					state = "Success";
					break;
				case "I":
					state = "Information";
					break;
			}
			/*if(sSTATU.startsWith("E")) {
    			state = "Error";
    		} else if (sSTATU.startsWith("W")) {
				state = "Warning";
			} else if (sSTATU.startsWith("S")) {
				state = "Success";
			} else if (sSTATU.startsWith("I")) {
				state = "Information";
			}*/
			return state;
			
		},
		formatAtivi: function (sAtivi, sProcx) {
			var addParam = sap.ui.getCore().getModel("AddPARAM");
			var desc = null;
			try{
				var a0102 = (addParam.oData.VIEWS['0100'].find(function(x) {if(x.PROCX == sProcx) return x;}))['0102'];
				if(a0102){
					desc = a0102.find(function(x) {if(x.ATIVI == sAtivi) return x;});
					desc = sAtivi + " - " + desc.DESCR;
				}
			}catch(e){
				
			}
			return (desc)?desc:sAtivi;
			
		}
		
		
	};
});