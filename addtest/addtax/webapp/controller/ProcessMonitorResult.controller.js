sap.ui.define([
	"sap/ui/core/message/ControlMessageProcessor",
	"sap/ui/core/message/Message",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/library",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem",
	"sap/m/MessageToast",
	"../add/AddUtilitiesWeb",
	"../add/AddUtilities",
	"../add/AddFormatter"
], function(ControlMessageProcessor, Message, Controller, coreLibrary, JSONModel, MessagePopover,
	MessagePopoverItem, MessageToast, AddUtilitiesWeb, AddUtilities, formatter) {
	"use strict";

	var MessageType = coreLibrary.MessageType;
	

	var PageController = Controller.extend("AddPlatform.controller.ProcessMonitorResult", {
		// Define initial data in oLogDataInitial structure which is used only in this  example.
		// In productive code, probably any table will be used in order to get the initial column information.
		formatter: formatter,
		AddUtilities: AddUtilities,
		onInit: function() {

			// get data 
			var oModel = this.initSampleDataModel();
			this.getView().setModel(oModel);

			var oModelLog = this.initLogsData();
			sap.ui.getCore().setModel(oModelLog, "LOG");

			// navegation botton
			var fnPress = this.handleActionPress.bind(this);
			this.modes = [{
				key: "Navigation",
				text: "Navigation",
				handler: function() {
					var oTemplate = new sap.ui.table.RowAction({
						items: [
							new sap.ui.table.RowActionItem({
								type: "Navigation",
								press: fnPress,
								visible: "{Available}"
							})
						]
					});
					return [1, oTemplate];
				}
			}];

			this.getView().setModel(new JSONModel({
				items: this.modes
			}), "modes");
			this.switchState("Navigation");

			this.router = sap.ui.core.UIComponent.getRouterFor(this); 
			this.router.attachRoutePatternMatched(this.call, this);

		},
		
		call : function()
		{
			var oProcStartResult = sap.ui.getCore().getModel("ProcStartResult");
			var oData = oProcStartResult.oData.oData.ALV;
			var procCount = 0;
			
			if(oData instanceof Array){
				oData.forEach( function(oValue, i){
					procCount = procCount + oValue.QUANT;
					oValue.Status = formatter.formatStatusState(oValue.STATU, oValue.PROCX);  
					
				});
			}
			
			var Nodes2 = {
				"Nodes2": [],
				"TotalText": "TOTAL"
			};
			
			var text = "Total " + procCount; 
			
			var oNodes2 = new JSONModel(Nodes2);
			oNodes2.setProperty("/Nodes2", oData);
			oNodes2.setProperty("/TotalText", text);
			this.getView().setModel(oNodes2);
			
			
		},
		
		onButtonPress: function(oEvent) {
			var oDialog = oEvent.getSource().getParent();
			oDialog.close();
		},
		onBehaviourModeChange: function(oEvent) {
			this.switchState(oEvent.getParameter("selectedItem").getKey());
		},
		onNavToComplementData: function() {
			//this.getRouter().navTo("processMonitorResultDetailDocument");
			var mPage = this.byId("ObjectPageLayout");
			mPage.setBusy(true);
			
			//var oTable = sap.ui.getCore().byId("table");
			var oTable = this.getView().byId("table");
			var paths = oTable.getSelectedIndices();
			
			var coreModel = sap.ui.getCore().getModel("CoreNodeAddModel");
			var oProcFilter = new JSONModel(JSON.parse(JSON.stringify((sap.ui.getCore().getModel("ProcFilter")).oData)));
			//var oProcFilter = new JSONModel();
			//oProcFilter.oData = ;
			oProcFilter.oData.INTERFACE = "0000000003";
			var sRange = {SIGN:"I",OPTION:"EQ",LOW:"",HIGH:""};
			//Se paths.length for > 0 enviar apenas os itens do PATH E o STRUC
			if(paths.length > 0){
				oProcFilter.oData.SCREEN.S_BUKRS = [];
				oProcFilter.oData.SCREEN.S_PROCX = [];
				oProcFilter.oData.SCREEN.S_ATIVI = [];
				oProcFilter.oData.SCREEN.S_STATU = [];
				paths.forEach(function(oValue, i){
					let oItem = oTable.getContextByIndex(oValue).getObject();
					let filterObj = {SIGN:"I",OPTION:"EQ",LOW:"",HIGH:""};;
					if(oItem.BUKRS){
						if(!oProcFilter.oData.SCREEN.S_BUKRS.some(filter => filter.LOW === oItem.BUKRS)){
							filterObj.LOW = oItem.BUKRS;
							oProcFilter.oData.SCREEN.S_BUKRS.push(filterObj);
						}
					}
					filterObj = {SIGN:"I",OPTION:"EQ",LOW:"",HIGH:""};
					if(oItem.PROCX){
						if(!oProcFilter.oData.SCREEN.S_PROCX.some(filter => filter.LOW === oItem.PROCX)){
							filterObj.LOW = oItem.PROCX;
							oProcFilter.oData.SCREEN.S_PROCX.push(filterObj);
						}
					}
					filterObj = {SIGN:"I",OPTION:"EQ",LOW:"",HIGH:""};
					if(oItem.ATIVI){
						if(!oProcFilter.oData.SCREEN.S_ATIVI.some(filter => filter.LOW === oItem.ATIVI)){
							filterObj.LOW = oItem.ATIVI;
							oProcFilter.oData.SCREEN.S_ATIVI.push(filterObj);
						}
					}
					filterObj = {SIGN:"I",OPTION:"EQ",LOW:"",HIGH:""};
					if(oItem.STATU){
						if(!oProcFilter.oData.SCREEN.S_STATU.some(filter => filter.LOW === oItem.STATU)){
							filterObj.LOW = oItem.STATU;
							oProcFilter.oData.SCREEN.S_STATU.push(filterObj);
						}
					}
				  	
				});	
				if(oProcFilter.oData.SCREEN.S_BUKRS.length === 0)
					oProcFilter.oData.SCREEN.remove("S_BUKRS");
				if(oProcFilter.oData.SCREEN.S_PROCX.length === 0)
					oProcFilter.oData.SCREEN.remove("S_PROCX");
				if(oProcFilter.oData.SCREEN.S_ATIVI.length === 0)
					oProcFilter.oData.SCREEN.remove("S_ATIVI");
				if(oProcFilter.oData.SCREEN.S_STATU.length === 0)
					oProcFilter.oData.SCREEN.remove("S_STATU");
				
			}else{ //No caso do paths.length === 0, será utilizado o mesmo filtro da tela anterior
			}

			sap.ui.getCore().setModel(oProcFilter, "ProcResultFilter");
			var novoBody = JSON.stringify(oProcFilter.oData);
			var filterModel = new JSONModel(JSON.parse(novoBody));
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
				
				that.getRouter().navTo("procMonResDetailDocumentEditFromResult");
			}
		},
		callBackComplementDataError: function(sapResponse, that){
			var mPage = that.byId("ObjectPageLayout");
			mPage.setBusy(false);
			alert('Erro');
		},
		onNavToMonitorLog: function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("AddPlatform.view.fragment.popUp.popUpLogs", this);
			}

			this._oDialog.open();
		},

		switchState: function(sKey) {
			var oTable = this.byId("table");
			var iCount = 0;
			var oTemplate = oTable.getRowActionTemplate();
			if (oTemplate) {
				oTemplate.destroy();
				oTemplate = null;
			}

			for (var i = 0; i < this.modes.length; i++) {
				if (sKey === this.modes[i].key) {
					var aRes = this.modes[i].handler();
					iCount = aRes[0];
					oTemplate = aRes[1];
					break;
				}
			}

			oTable.setRowActionTemplate(oTemplate);
			oTable.setRowActionCount(iCount);
		},

		initLogsData: function() {
			var oModel = new JSONModel();

			jQuery.ajax(sap.ui.require.toUrl("AddPlatform/model/data/") + "ProcessMonitorLog.json", {
				dataType: "json",
				success: function(oData) {
					for (var i = 0; i < oData.length; i++) {
						var oProcess = oData[i];

						if (oProcess.STATUT === "E") {
							oProcess.Status = "Error";
						} else if (oProcess.STATUT === "W") {
							oProcess.Status = "Warning";
						} else if (oProcess.STATUT === "S") {
							oProcess.Status = "Success";
						} else if (oProcess.STATUT === "I") {
							oProcess.Status = "Information";
						} else {
							oProcess.Status = "None";
						}
					}
					oModel.setData(oData);
				},
				error: function() {
					jQuery.sap.log.error("failed to load json");
				}
			});

			return oModel;
		},

		initSampleDataModel: function() {

			var oModel = new JSONModel();

			jQuery.ajax(sap.ui.require.toUrl("AddPlatform/model/data/") + "ProcessMonitorResultMaster.json", {
				dataType: "json",
				success: function(oData) {
					for (var i = 0; i < oData.Nodes.length; i++) {
						var oProcess = oData.Nodes[i];

						if (oProcess.STATUT === "E") {
							oProcess.Status = "Error";
						} else if (oProcess.STATUT === "W") {
							oProcess.Status = "Warning";
						} else if (oProcess.STATUT === "S") {
							oProcess.Status = "Success";
						} else if (oProcess.STATUT === "I") {
							oProcess.Status = "Information";
						} else {
							oProcess.Status = "None";
						}
					}
					oModel.setData(oData);
				},
				error: function() {
					jQuery.sap.log.error("failed to load json");
				}
			});
			//var oModel = sap.ui.getCore().getModel("ProcStartResult");

			return oModel;
		},
		onSelectionChange: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("listItem");
			var oBindingContext = oSelectedItem.getBindingContext();
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("AddPlatform.view.fragment.popUp.popUpLogs", this);
			}
			this._oDialog.setBindingContext(oBindingContext);
			this._oDialog.open();
		},

		onProcessMonitorLogStart: function(oEvent) {

			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("AddPlatform.view.fragment.popUp.popUpLogs", this);
			}

			this._oDialog.open();

		},
		handleActionPress: function(oEvent) {
			/*	var oRow = oEvent.getParameter("row");
				var oItem = oEvent.getParameter("item");
				MessageToast.show("Item " + (oItem.getText() || oItem.getType()) + " pressed for product with id " +
					this.getView().getModel().getProperty("IDEME", oRow.getBindingContext()));*/

			var mPage = this.byId("ObjectPageLayout");
			mPage.setBusy(true);

			var path = oEvent.getSource().getParent().getBindingContext();
        	var oModel = this.getView().getModel().getProperty("",path);
        	
        	var screen = new Map();
        	if(oModel.PROCX !== ""){
        		var aprocx = new Array();
				aprocx.push(oModel.PROCX);	
				screen.set("S_PROCX", aprocx);	
        	}       	
        	if(oModel.BUKRS !== ""){
				var abukrs = new Array();
				abukrs.push(oModel.BUKRS);
				screen.set("S_BUKRS", abukrs);
        	}
			if(oModel.STATU !== ""){
				var astatu = new Array();
				astatu.push(oModel.STATU);
        		screen.set("S_STATU", astatu);
			}
			if(oModel.ATIVI !== ""){
				var aAtivi = new Array();
				aAtivi.push(oModel.ATIVI);
        		screen.set("S_ATIVI", aAtivi);
			}
		
			var oProcFilter = new JSONModel(JSON.parse(JSON.stringify((sap.ui.getCore().getModel("ProcFilter")).oData)));
			//var oProcFilter = new JSONModel();
			//oProcFilter.oData = ().oData;
			oProcFilter.oData.INTERFACE = "0000000003";
			oProcFilter.oData.SCREEN.S_BUKRS = [{SIGN:"I",OPTION:"EQ",LOW:oModel.BUKRS,HIGH:""}];
			oProcFilter.oData.SCREEN.S_PROCX = [{SIGN:"I",OPTION:"EQ",LOW:oModel.PROCX,HIGH:""}];
			oProcFilter.oData.SCREEN.S_STATU = [{SIGN:"I",OPTION:"EQ",LOW:oModel.STATU,HIGH:""}];
			oProcFilter.oData.SCREEN.S_ATIVI = [{SIGN:"I",OPTION:"EQ",LOW:oModel.ATIVI,HIGH:""}];
			sap.ui.getCore().setModel(oProcFilter, "ProcResultFilter");
			sap.ui.getCore().setModel(new JSONModel(oModel), "ProcResultModel");
			//var novoBody = AddUtilitiesWeb.setBodyForInterface("0000000003", "EPADILHA", "PT", screen, null, AddUtilitiesWeb.getDefaultViewsMap());
			var novoBody = JSON.stringify(oProcFilter.oData);
			AddUtilitiesWeb.callAddtaxSAP(novoBody, this.callBackForResult, this.callBackForErrorResult, this); 
		},
		callBackForResult: function(sapResponse, that) {
			if(sapResponse !== undefined){
				var oModel = new JSONModel(JSON.parse(window.atob(sapResponse)));
				sap.ui.getCore().setModel(new JSONModel(oModel),"CoreNodeAddModel");
				var mPage = that.byId("ObjectPageLayout");
				mPage.setBusy(false);
				that.getRouter().navTo("processMonitorResultDetail");
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
		
		onPress: function(oEvent) {
			MessageToast.show("Pressed custom button " + oEvent.getSource().getId());
		},

		onSemanticButtonPress: function(oEvent) {
			var sAction = oEvent.getSource().getMetadata().getName();
			sAction = sAction.replace(oEvent.getSource().getMetadata().getLibraryName() + ".", "");
			MessageToast.show("Pressed: " + sAction);
		},

		onNavBack: function() {
			this .getRouter().navTo("backToProcessMonitorStart");
			//history.go(-1);
		},

		onListItemPress: function() {
			this.getRouter().navTo("processMonitorResultDetail");
			/*var oFCL = this.oView.getParent().getParent();
			oFCL.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);*/
		},
		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},
		onSemanticSelectChange: function(oEvent, oData) {
			var sAction = oEvent.getSource().getMetadata().getName();
			sAction = sAction.replace(oEvent.getSource().getMetadata().getLibraryName() + ".", "");
			var sStatusText = sAction + " by " + oEvent.getSource().getSelectedItem().getText();
			MessageToast.show("Selected: " + sStatusText);
		},

		onPositionChange: function(oEvent) {
			MessageToast.show("Positioned changed to " + oEvent.getParameter("newPosition"));
		},

		onMessagesButtonPress: function(oEvent) {

			var oMessagesButton = oEvent.getSource();
			if (!this._messagePopover) {
				this._messagePopover = new MessagePopover({
					items: {
						path: "message>/",
						template: new MessagePopoverItem({
							description: "{message>description}",
							type: "{message>type}",
							title: "{message>message}"
						})
					}
				});
				oMessagesButton.addDependent(this._messagePopover);
			}
			this._messagePopover.toggle(oMessagesButton);
		},
		onMultiSelectPress: function(oEvent) {
			if (oEvent.getSource().getPressed()) {
				MessageToast.show("MultiSelect Pressed");
			} else {
				MessageToast.show("MultiSelect Unpressed");
			}
		}
	});

	return PageController;
});