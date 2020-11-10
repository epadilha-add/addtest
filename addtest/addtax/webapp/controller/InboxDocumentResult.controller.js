sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/ToolbarSpacer",
	"sap/ui/thirdparty/jquery"
], function(Controller, JSONModel, MessageToast, ToolbarSpacer,jQuery) {
	"use strict";

	return Controller.extend("AddPlatform.controller.InboxDocumentResult", {

		onInit: function() {
			
			var oJSONModel = this.initDataModel();
			var oView = this.getView();
			oView.setModel(oJSONModel);

			oView.setModel(new JSONModel({
				visibleRowCountMode: "Fixed"
			}), "ui");
			this.onColumnWidthsChange();

			this._messageBuffer = [];
			
			this.router = sap.ui.core.UIComponent.getRouterFor(this); 
			this.router.attachRoutePatternMatched(this.call, this);
		},
		call : function()
		{
			var oProcStartResult = sap.ui.getCore().getModel("InboxStartResult");
			var oData = oProcStartResult.oData.oData.ALV;
			var procCount = 0;
			
			if(oData instanceof Array){
				oData.forEach( function(oValue, i){
					//procCount = procCount + 1;//+ oValue.QUANT;
					//oValue.Status = formatter.formatStatusState(oValue.STATU, oValue.PROCX);  
					
				});
			}
			
			var Nodes2 = {
				"Nodes2": [],
				"TotalText": "TOTAL"
			};
			
			var text = "Total " + procCount; 
			
			var oNodes2 = new JSONModel(Nodes2);
			oNodes2.setProperty("/ALV", oData);
			oNodes2.setProperty("/TotalText", text);
			this.getView().setModel(oNodes2);
			
			
		},		
		onNavToInboxDocumentResult:  function(){
				this.getRouter().navTo("inboxDocumentResult");
		},

		initDataModel : function() {
			var sDataPath = sap.ui.require.toUrl("AddPlatform/model/data") + "/InboxDocumentResult.json";
			var oModel = new JSONModel(sDataPath);
			//this.getView().setModel(oModel);
			return oModel;
		},
		onNavBack: function(){
			history.go(-1);
		},
		onColumnWidthsChange: function(oEvent) {
			var sColumnWidthMode = oEvent ? oEvent.getParameter("item").getKey() : "Static";
			var oWidthData;

			if (sColumnWidthMode == "Flexible") {
				oWidthData = {
					name: "25%",
					category: "25%",
					image: "15%",
					quantity: "10%",
					date: "25%"
				};
			} else {
				oWidthData = {
					name: sColumnWidthMode == "Mixed" ? "20%" : "13rem",
					category: "11rem",
					image: "7rem",
					quantity: "6rem",
					date: "9rem"
				};
			}

			this.getView().getModel("ui").setProperty("/widths", oWidthData);
		},

		onColumnResize: function(oEvent) {
			var oColumn = oEvent.getParameter("column");

			if (this.byId("deliverydate") == oColumn) {
				oEvent.preventDefault();
			} else {
				this._messageBuffer.push("Column '" + oColumn.getLabel().getText() + "' was resized to " + oEvent.getParameter("width") + ".");
				if (this._messageTimer) {
					clearTimeout(this._messageTimer);
				}
				this._messageTimer = setTimeout(function() {
					MessageToast.show(this._messageBuffer.join("\n"));
					this._messageBuffer = [];
					this._messageTimer = null;
				}.bind(this), 50);
			}
		},
			getRouter: function() {
			return this.getOwnerComponent().getRouter();
		}
	});
});