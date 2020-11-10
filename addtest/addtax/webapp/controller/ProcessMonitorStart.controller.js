sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/NumberFormat",
	"sap/base/strings/formatMessage",
	"sap/ui/core/UIComponent",
	"sap/m/MessageToast",
	"../add/AddUtilities",
	"../add/AddUtilitiesWeb"
], function(Controller, JSONModel, NumberFormat, formatMessage, UIComponent, MessageToast, AddUtilities, AddUtilitiesWeb) {
	"use strict";
	
	var oController;

	return Controller.extend("AddPlatform.controller.ProcessMonitorStart", {
		AddUtilities: AddUtilities,
		onInit: function() {
			oController = this;
			this.getView().setModel(new JSONModel({"ADDDATEDTPRC": {}}), "FILTERS");

			this.fromSAPECC("0000000001");

		},
		ontimeout: function(e) {
			MessageToast.show(e);
		},
		handleChangeDTPRC: function(oEvent) {
			return this.getDataValue("DTPRC");
		},
		getDataValue: function (field){
		},
		fromSAPECC: function(interfaceNumber) {
			var body =
				'{"INTERFACE":' + interfaceNumber +
				',"VIEWS":{"0100":"X","0102":"X","0200":"X","0201":"X","0400":"X","0401":"X","0402":"X","0403":"X","0112":"X","0113":"","0600":"","0104":"X","0105":"","0108":""},"SPRAS":"PT","UNAME":"EPADILHA"}';
			var mPage = this.byId("ObjectPageLayout");
			mPage.setBusy(true);
			AddUtilitiesWeb.callAddtaxSAP(body, this.callBackFromSAPECC, this.callBackFromSAPECCError, this); 
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
		setUpData: function() {
		},
		handleSelectionChangePROCX: function() {
			var keys = this.byId("PROCX").getSelectedKeys();
			var i = 0;
			//this.byId("idPage").destroy(true);
			for (i = 0; i < keys.length; i++) {
				var path = "AddPlatform/view/fragment/customProcess/" + keys[i];
				MessageToast.show(path);
				/*	if (this.byId(keys[i])) {
						this.byId(keys[i]).destroy(true);
					}*/
				//TODO
				//20201022-MFX
				//COMENTADO para não gerar erros
				//this.onAddFragment(path);
			}

		},
		onAddFragment: function(path) {
			var form = this.getView().getId("idPage");
			var oFragment = sap.ui.xmlfragment(form, path, this);
			this.byId("idPage").addContent(oFragment);
		},
		formatMessage: formatMessage,

		onNavToGo: function() {
			var mPage = this.byId("ObjectPageLayout");
			mPage.setBusy(true);
			
			var fields = new Array();
			fields.push("STATU");
			var filters = oController.oView.getModel("FILTERS");

			//var novoBody = AddUtilitiesWeb.setBodyNew("0000000002", filters.oData, fields, AddUtilitiesWeb.getDefaultViewsMap());
			var novoBody = AddUtilitiesWeb.setBodyNew("0000000002", filters.oData, "", AddUtilitiesWeb.getDefaultViewsMap());
			var filterModel = new JSONModel(JSON.parse(novoBody));
			sap.ui.getCore().setModel(filterModel,"ProcFilter");

			AddUtilitiesWeb.callAddtaxSAP(novoBody, this.callBackForResult, this.callBackForErrorResult, this); 
		},
		callBackForResult: function(sapResponse, that) {
			if(sapResponse !== undefined){
				var oModel = new JSONModel(JSON.parse(window.atob(sapResponse)));
				sap.ui.getCore().setModel(new JSONModel(oModel),"ProcStartResult");
				var mPage = that.byId("ObjectPageLayout");
				mPage.setBusy(false);
				that.getRouter().navTo("processMonitorResult");
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
		
		onNavBack: function() {
			this.getRouter().navTo("backToStartPage");
			//history.go(-1);
		},
		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},
		onSaveFilterVariantPress: function(){
			var viewName = this.getView().getProperty("viewName");
			//var content = this._getFilterContent();
			var content = oController.oView.getModel("FILTERS").oData;
			VariantHelper.openDialogToSave(this, viewName, 'filter', content)
				.then(persisted =>{
					console.log("Gravou variante: ", persisted);
				})
				.catch(err =>{
			   		console.log("Erro ao gravar variante local: ", err);
				});
		},
		onLoadFilterVariantPress: function(){
			var viewName = this.getView().getProperty("viewName");

			VariantHelper.openDialogToList(this, viewName, 'filter')
				.then(data =>{
					if(data)
						oController.getView().setModel(new JSONModel(data), "FILTERS")
				})
				.catch(err =>{
					console.log("Erro ao listar variante local: ", err);
				});
		},
		onExecuteProcess: function(){
			var filters = oController.oView.getModel("FILTERS");
			var novoBody = AddUtilitiesWeb.setBodyNew("0000000002", filters.oData);
			AddUtilities.addSysLogMessage('info', 'ProcessMonitorStart', 'teste quem sabe faz ao vivo');
			console.log("BODY: " + novoBody);
		},
		onNavToComplementData: function(){
			var mPage = this.byId("ObjectPageLayout");
			mPage.setBusy(true);
			
			var fields = new Array();
			fields.push("STATU");
			var filters = oController.oView.getModel("FILTERS");

			var novoBody = AddUtilitiesWeb.setBodyNew("0000000003", filters.oData, fields, AddUtilitiesWeb.getDefaultViewsMap());
			var filterModel = new JSONModel(JSON.parse(novoBody));
			sap.ui.getCore().setModel(filterModel,"ProcFilter");

			AddUtilitiesWeb.callAddtaxSAP(novoBody, this.callBackComplementData, this.callBackComplementDataError, this); 
		},
		callBackComplementData: function(sapResponse, that){
			if(sapResponse !== undefined){
				var oResponse = JSON.parse(window.atob(sapResponse));
				
				var oModel = new JSONModel();
				oModel.setData(JSON.parse('{"Process": [], "STRUC": []}'));
				oModel.oData.Process = oResponse.ALV;
				oModel.oData.STRUC = oResponse.STRUC;
				sap.ui.getCore().setModel(new JSONModel(oModel),"AddDetailDocumentEditModel");
				sap.ui.getCore().setModel(new JSONModel(oResponse), 'CoreNodeAddModel');
				var mPage = that.byId("ObjectPageLayout");
				mPage.setBusy(false);
				
				that.getRouter().navTo("procMonResDetailDocumentEditFromStart");
			}
		},
		callBackComplementDataError: function(sapResponse, that){
			var mPage = that.byId("ObjectPageLayout");
			mPage.setBusy(false);
			alert('Erro: ', sapResponse);
		}
		
		
	});

});