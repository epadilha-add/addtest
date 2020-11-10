sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/NumberFormat",
	"sap/base/strings/formatMessage",
	"sap/base/Log"
], function (Controller, JSONModel, NumberFormat, formatMessage, Log) {
	"use strict";

	return Controller.extend("AddPlatform.controller.Startpage", {
		onInit: function () {

			/********************************************************************		
	
					DYNAMIC MENU
	
			/*********************************************************************
			 * 
			/********************************************************************		
	
					XML TO JSON TEST
	
			/*********************************************************************
			var xmlString = "<root><0100><bukrs>0005</bukrs><bukrs>0006</bukrs></0100></root>";
					var parser = new DOMParser();
					var xml = parser.parseFromString(xmlString, "text/xml");
					var obj = this.xmlToJson(xml);

					//	var json = this.xmlToJson(JSON.stringify("<root><0100><bukrs>0005</bukrs></0100></root>"));
					Log.info(obj.toString());
					var rrr = obj;*/

		},

		formatMessage: formatMessage,

		getProgressDocuments: function (aNodes) {
			if (!aNodes || aNodes.length === 0) {
				return 0;
			}
			var iSum = 0;
			for (var i = 0; i < aNodes.length; i++) {
				if (aNodes[i].STATU !== "P1000-Processo finalizado") {
					iSum++;
				}
			}
			//var fPercent = (iSum / aNodes.length) * 100;
			var fPercent = iSum;
			return fPercent.toFixed(0);
		},
		getProgressDomains: function (aNodes) {
			if (!aNodes || aNodes.length === 0) {
				return 0;
			}
			var iSum = 0;
			for (var i = 0; i < aNodes.length; i++) {
				if (aNodes[i].ATIVO === "1") {
					iSum++;
				}
			}

			var fPercent = iSum;
			return fPercent.toFixed(0);
		},

		getEntityCount: function (entities) {
			return entities && entities.length || 0;
		},

		formatNumber: function (value) {
			var oFloatFormatter = NumberFormat.getFloatInstance({
				style: "short",
				decimals: 1
			});
			return oFloatFormatter.format(value);
		},

		formatJSONDate: function (date) {
			var oDate = new Date(Date.parse(date));
			return oDate.toLocaleDateString();
		},

		onNavToProcessMonitor: function () {
			this.getRouter().navTo("processMonitorStart");
		},
		onNavToInboxDocument: function () {
			this.getRouter().navTo("inboxDocumentStart");
		},
		onNavToVariants: function () {
			this.getRouter().navTo("variantsStart");
		},
		onNavToStatus: function () {
			this.getRouter().navTo("statusStart");
		},
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},
		// Changes XML to JSON
		xmlToJson: function (xml) {
			"use strict";

			// Create the return object
			var obj = {};

			// console.log(xml.nodeType, xml.nodeName );

			if (xml.nodeType == 1) { // element
				// do attributes
				if (xml.attributes.length > 0) {
					obj["@attributes"] = {};
					for (var j = 0; j < xml.attributes.length; j++) {
						var attribute = xml.attributes.item(j);
						obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
					}
				}
			} else if (xml.nodeType == 4) { // cdata section
				obj = xml.nodeValue;
			}

			// do children
			if (xml.hasChildNodes()) {
				for (var i = 0; i < xml.childNodes.length; i++) {
					var item = xml.childNodes.item(i);
					var nodeName = item.nodeName;
					if (typeof (obj[nodeName]) == "undefined") {
						obj[nodeName] = this.xmlToJson(item);
					} else {
						if (typeof (obj[nodeName].length) == "undefined") {
							var old = obj[nodeName];
							obj[nodeName] = [];
							obj[nodeName].push(old);
						}
						if (typeof (obj[nodeName]) === 'object') {
							obj[nodeName].push(this.xmlToJson(item));
						}
					}
				}
			}
			return obj;
		}
	});
});