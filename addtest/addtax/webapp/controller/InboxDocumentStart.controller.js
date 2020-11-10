sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/NumberFormat",
	"sap/base/strings/formatMessage",
	"sap/ui/core/UIComponent",
	"sap/m/MessageToast",
	"../add/AddUtilities",
	"../add/AddUtilitiesWeb"
], function (Controller, JSONModel, NumberFormat, formatMessage, UIComponent, MessageToast, AddUtilities, AddUtilitiesWeb) {
	"use strict";

    var oController;

	return Controller.extend("AddPlatform.controller.InboxDocumentStart", {
		AddUtilities: AddUtilities,
		onInit: function () {
			 oController = this;
			this.getView().setModel(new JSONModel({"ADDDATEDTPRC": {}}), "FILTERS");
			this.fromSAPECC("0000000001");
		},
		fromSAPECC: function(interfaceNumber) {
			var body =
				'{"INTERFACE":' + interfaceNumber +
				',"VIEWS":{"0100":"X","0102":"X","0200":"X","0201":"X","0400":"X","0401":"X","0402":"X","0403":"X","0112":"X","0113":"","0600":"","0104":"X","0105":"","0108":""},"SPRAS":"PT","UNAME":"EPADILHA"}';
			var mPage = this.byId("ObjectPageLayout");
			mPage.setBusy(true);
			AddUtilitiesWeb.callAddtaxSAP(body, this.callBackFromSAPECC, this.callBackFromSAPECCError, this); 
			var url = "/destinations/addtax-ecc-service/addui5r/addui5r?context=" + window.btoa(body);
		},
		callBackFromSAPECC: function(data, that){
			var oModel = new JSONModel(JSON.parse(window.atob(data)));
			that.getView().setModel(oModel, "PARAM");
			sap.ui.getCore().setModel(oModel,"AddPARAM");
			var mPage2 = that.byId("ObjectPageLayout");
			mPage2.setBusy(false);
			
		},
		callBackFromSAPECCError: function(error, that){
			var mPage2 = that.byId("ObjectPageLayout");
			mPage2.setBusy(false);
		},
		formatMessage: formatMessage,

		onNavToGo: function () {
			//this.getRouter().navTo("inboxDocumentResult");


			var mPage = this.byId("ObjectPageLayout");
			mPage.setBusy(true);
			
			var fields = new Array();
			fields.push("STATU");
			var filters = oController.oView.getModel("FILTERS");

			//var novoBody = AddUtilitiesWeb.setBodyNew("0000000004", filters.oData, fields, AddUtilitiesWeb.getDefaultViewsMap());

				var novoBody = '{"INTERFACE":"0000000004","UNAME":"EPADILHA","SCREEN":[{"S_DTPRC":[{"SIGN":"I","OPTION":"EQ","LOW":"20200101","HIGH":"20200430"}]}],"SELECT":{"TABLE": "/ADD/TD0000","FIELDS": "*","WHERE": "DTPRC IN S_DTPRC"},"SPRAS":"PT"}';
				//body = body.replace("PIDEMEP", fields);	
				//body = body.replace("PINDOCP", filters);
				//return body;

			var filterModel = new JSONModel(JSON.parse(novoBody));
			sap.ui.getCore().setModel(filterModel,"InboxFilter");

			AddUtilitiesWeb.callAddtaxSAP(novoBody, this.callBackForResult, this.callBackForErrorResult, this); 

		},
		callBackForResult: function(sapResponse, that) {
			if(sapResponse !== undefined){
				var oModel = new JSONModel(JSON.parse(window.atob(sapResponse)));
				sap.ui.getCore().setModel(new JSONModel(oModel),"InboxStartResult");
				var mPage = that.byId("ObjectPageLayout");
				mPage.setBusy(false);
				that.getRouter().navTo("inboxDocumentResult");
			}
		},
		callBackForErrorResult: function(sapResponse, that) {
			var mPage = that.byId("ObjectPageLayout");
			mPage.setBusy(false);
			
			var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
			var oMessageManager  = sap.ui.getCore().getMessageManager();
			
			oMessageManager.registerMessageProcessor(oMessageProcessor);
			
			oMessageManager.addMessages(
			    new sap.ui.core.message.Message({
			        message: "503: Error requesting data from SAP",
			        type: sap.ui.core.MessageType.Error,
			       // target: "/myInputId/value",
			        processor: oMessageProcessor
			     })
			);
			
		},
		
		

		onNavBack: function () {
			history.go(-1);
		},
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		}

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf view.ProcessMonitorStart
		 */
		//	onInit: function() {
		//
		//	},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf view.ProcessMonitorStart
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf view.ProcessMonitorStart
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf view.ProcessMonitorStart
		 */
		//	onExit: function() {
		//
		//	}

	});

});