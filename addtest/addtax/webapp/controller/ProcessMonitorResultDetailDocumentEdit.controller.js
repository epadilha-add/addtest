sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/ToolbarSpacer",
	"sap/ui/thirdparty/jquery",
	"../add/AddFormatter",
	"../add/AddUtilities",
	"../add/AddUtilitiesWeb"
], function(Controller, JSONModel, MessageToast, ToolbarSpacer, jQuery, formatter, AddUtilities, AddUtilitiesWeb) {
	"use strict";
	
	var countRender;
	var oController;
	var currentIndex;
	var docInUpdate;
	var oRoute;

	return Controller.extend("AddPlatform.controller.ProcessMonitorResultDetailDocumentEdit", {
		formatter: formatter,
		AddUtilities: AddUtilities,
		onInit: function() {
			countRender = 0;
			currentIndex = 0;
			docInUpdate = false;
			oRoute = "";

			oController = this;
			let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("procMonResDetailDocumentEditFromStart").attachMatched(this.callProcMonResDetailDocEditFromStart, this);
			oRouter.getRoute("procMonResDetailDocumentEditFromResult").attachMatched(this.callProcMonResDetailDocEditFromResult, this); 
			oRouter.getRoute("processMonitorResultDetailDocumentEdit").attachMatched(this.callProcMonResDetailDocEditFromDetail, this); 
			
		},
		callProcMonResDetailDocEditFromStart : function()
		{
			oRoute = 'procMonResDetailDocumentEditFromStart';
			this.callProcMonResDetailDocEdit();
		},
		callProcMonResDetailDocEditFromResult : function()
		{
			oRoute = 'procMonResDetailDocumentEditFromResult';
			this.callProcMonResDetailDocEdit();
		},
		callProcMonResDetailDocEditFromDetail : function()
		{
			oRoute = 'processMonitorResultDetailDocumentEdit';
			this.callProcMonResDetailDocEdit();
		},
		callProcMonResDetailDocEdit : function()
		{
			var oProcModel = sap.ui.getCore().getModel("AddDetailDocumentEditModel");
			var oProcModelData = "";
			if(oProcModel.oData.oData)
				oProcModelData = oProcModel.oData.oData;
			else
				oProcModelData = oProcModel.oData;
			var sModel = JSON.stringify(oProcModelData);
			var oView = this.getView();
			var indexWidth = (oProcModelData.Process.length <= 99)?40:60;
			
			var pageIndex = {
				CURRENTINDEX: 1,
				MAXVALUE: "/ " + oProcModelData.Process.length,
				WIDTH: indexWidth + "px"
			}
			this.getView().getContent()[0].setModel(new JSONModel(pageIndex), "PageIndex");
			var oProcModel = new JSONModel(oProcModelData.Process[0]);
			this.getView().getContent()[0].setModel(oProcModel, "Process");
			
			currentIndex = 0;
			docInUpdate = false;
			
			this.setBasicData();	
			this.updateTaxTable(oProcModel);
			this.updateDocItens(oProcModel);
			
			//Adiciona o evento "onSapEnter" no Input com o número da página
			if(oController.byId("addInputIndex")){
				oController.byId("addInputIndex").onsapenter = function(e) {
		        	oController.onChangePageValue();
		    	}
			}
			
			var oProcCoreModel = sap.ui.getCore().getModel("CoreNodeAddModel");
			var oProcCoreModelData = "";
			if(oProcCoreModel.oData.oData)
				oProcCoreModelData = oProcCoreModel.oData.oData;
			else
				oProcCoreModelData = oProcCoreModel.oData;
			var oStruciModel = new JSONModel(oProcCoreModelData.STRUCI);
			sap.ui.getCore().setModel(oStruciModel, "AddStruci");
			
		},
		onNavToMonitorLog: function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("AddPlatform.view.fragment.popUp.popUpLogs", this);
			}

			this._oDialog.open();
		},
		
		setBasicData: function() {
			var oContainer = oController.getView().byId("EditBasicData");
			if(oContainer !== undefined){ 
				oContainer.destroyContent();
				countRender = 0;
			}
			
			var oLayout = new sap.ui.commons.layout.VerticalLayout({id: "BasicDataLayout", width: '100%'});
			
			function addBasicDataFields(value, index, array) {
				var vEditable = false;
				if (value.EDIT === "X")
					vEditable = true;
				if(!((value.FIELDNAME.startsWith("AL"))||(value.FIELDNAME.startsWith("VL"))||(value.FIELDNAME.startsWith("BA")))){
					var oLabel = new sap.m.Label({labelFor:value.FIELDNAME, width:"100%"}).setText(value.FIELDNAME);
					var oInput = new sap.m.Input ({
									id:value.FIELDNAME,
									width: '100%',
									layoutData: new sap.m.FlexItemData({ growFactor: 1}),
									enabled: vEditable,
								    value: {
										path:"Process>/" + value.FIELDNAME,
										//mode:sap.ui.model.BindingMode.TwoWay, //O Default é TwoWay, então não precisa desse
										//valueLiveUpdate:"true",
										enabled:"true"
									}
								});
					oInput.addStyleClass("sapUiSmallMarginBottom");
					oLayout.addContent(oLabel);
					oLayout.addContent(oInput);
				}
		    }	
			
			if(countRender === 0)
			{	
				countRender = 1;
				var coreModel = sap.ui.getCore().getModel("CoreNodeAddModel");
				var tStruc = "";
				if(coreModel.oData.oData)
					tStruc = coreModel.oData.oData.STRUC;
				else
					tStruc = coreModel.oData.STRUC;
			    if(tStruc instanceof Array){
			    	tStruc.forEach(addBasicDataFields);
			    }
				oLayout.placeAt((oController.getView().byId("EditBasicData")));
				 
			}
		},
		onNavToComplementDataEdit: function() {
			this.getRouter().navTo("processMonitorResultDetailDocumentEdit");
		},
		onNavToFirstItem: function() {
			var oCoreModel = sap.ui.getCore().getModel("AddDetailDocumentEditModel");
			var oView = oController.getView();
			currentIndex = 0;
			var oProcModel = new JSONModel(oCoreModel.oData.oData.Process[currentIndex]);
			oView.getContent()[0].setModel(oProcModel, "Process");
			this.updateTaxTable(oProcModel);
			this.updateDocItens(oProcModel);
			var oPageIndex = oView.getContent()[0].getModel("PageIndex");
			oPageIndex.oData.CURRENTINDEX = currentIndex + 1;
			oView.setModel(oPageIndex, "PageIndex");
			oPageIndex.refresh(true);
		},
		onNavToPreviousItem: function() {
			var oCoreModel = sap.ui.getCore().getModel("AddDetailDocumentEditModel");
			var oView = oController.getView();
			if(currentIndex > 0){
				currentIndex = currentIndex - 1;
				var oProcModel = new JSONModel(oCoreModel.oData.oData.Process[currentIndex]);
				oView.getContent()[0].setModel(oProcModel, "Process");
				this.updateTaxTable(oProcModel);
				this.updateDocItens(oProcModel);
				var oPageIndex = oView.getContent()[0].getModel("PageIndex");
				oPageIndex.oData.CURRENTINDEX = currentIndex + 1;
				oView.setModel(oPageIndex, "PageIndex");
				oPageIndex.refresh(true);
			}
		},
		onNavToNextItem: function() {
			var oCoreModel = sap.ui.getCore().getModel("AddDetailDocumentEditModel");
			var oView = oController.getView();
			if(currentIndex < ( oCoreModel.oData.oData.Process.length - 1)){
				currentIndex = currentIndex + 1;
				var oProcModel = new JSONModel(oCoreModel.oData.oData.Process[currentIndex]);
				oView.getContent()[0].setModel(oProcModel, "Process");
				this.updateTaxTable(oProcModel);
				this.updateDocItens(oProcModel);
				var oPageIndex = oView.getContent()[0].getModel("PageIndex");
				oPageIndex.oData.CURRENTINDEX = currentIndex + 1;
				oView.getContent()[0].setModel(oPageIndex, "PageIndex");
				oPageIndex.refresh(true);
			}
		},
		onNavToLastItem: function() {
			var oCoreModel = sap.ui.getCore().getModel("AddDetailDocumentEditModel");
			var oView = oController.getView();
			currentIndex = oCoreModel.oData.oData.Process.length - 1;
			var oProcModel = new JSONModel(oCoreModel.oData.oData.Process[currentIndex]);
			oView.getContent()[0].setModel(oProcModel, "Process");
			this.updateTaxTable(oProcModel);
			this.updateDocItens(oProcModel);
			var oPageIndex = oView.getContent()[0].getModel("PageIndex");
			oPageIndex.oData.CURRENTINDEX = currentIndex + 1;
			oView.setModel(oPageIndex, "PageIndex");
			oPageIndex.refresh(true);
		},
		onChangePageValue: function() {
			var oCoreModel = sap.ui.getCore().getModel("AddDetailDocumentEditModel");
			var oView = oController.getView();
			var oPageIndex = oView.getContent()[0].getModel("PageIndex");
			var inputValue = oView.byId("addInputIndex").getValue();
			if((inputValue > 0) && (inputValue <= ( oCoreModel.oData.oData.Process.length))){
				currentIndex = inputValue - 1;
				var oProcModel = new JSONModel(oCoreModel.oData.oData.Process[currentIndex]);
				oView.getContent()[0].setModel(oProcModel, "Process");
				this.updateTaxTable(oProcModel);
				this.updateDocItens(oProcModel);
				var oPageIndex = oView.getContent()[0].getModel("PageIndex");
				oPageIndex.oData.CURRENTINDEX = currentIndex + 1;
				oView.setModel(oPageIndex, "PageIndex");
				oPageIndex.refresh(true);
			}else{
				var oPageIndex = oView.getContent()[0].getModel("PageIndex");
				oPageIndex.oData.CURRENTINDEX = currentIndex + 1;
				oView.getContent()[0].setModel(oPageIndex, "PageIndex");
				oPageIndex.refresh(true);	
			}
		},
		onPressTreeItem: function(oEvent) {
			var fs = oEvent.getSource().getBindingContext("DOCUMENT").getPath();
			var oTree = oController.getView().byId("Tree");
			var oModel = oController.getView().getModel('DOCUMENT').getProperty(fs);
			var oHtml = this.getView().byId("idFrame");
			var sIFrame = AddUtilities.getHtmlMediaContent(oModel.TYPE, oModel.ATTACHB);
			oHtml.setContent(sIFrame);
		},
		onNavToComplementData: function() {
			this.getRouter().navTo("ProcessMonitorResultDetailDocument");
		},
		updateTaxTable: function(procModel){
			var coreModel = sap.ui.getCore().getModel("CoreNodeAddModel");
			var tStruc = "";
				if(coreModel.oData.oData)
					tStruc = coreModel.oData.oData.STRUC;
				else
					tStruc = coreModel.oData.STRUC;
			var Impostos = {
				tax: []
			};

			function updateTaxModel(value, index, array) {
				if(value.FIELDNAME.startsWith("AL")){
					var taxType = value.FIELDNAME.substring(2, value.FIELDNAME.length);
					var eachTax = {
						TYPE: taxType,
						TAX: procModel.oData[value.FIELDNAME],
						BASE: procModel.oData["BA"+taxType],
						VALUE: procModel.oData["VL"+taxType]
					};
					Impostos.tax.push(eachTax);	
				}
		    }	
		    if(tStruc instanceof Array){
		    	tStruc.forEach(updateTaxModel);
		    }
		    this.getView().setModel(new JSONModel(Impostos), "Impostos");
		},

		onNavBack: function() {
			switch(oRoute){
				case "procMonResDetailDocumentEditFromStart":
					this.getRouter().navTo("backToProcessMonitorStart");
					break;
				case "procMonResDetailDocumentEditFromResult":
					this.getRouter().navTo("backToProcessMonitorResult");
					break;
				case "processMonitorResultDetailDocumentEdit":
					this.getRouter().navTo("backToProcessMonitorResultDetail");
					break;
				default:
					this.getRouter().navTo("backToProcessMonitorStart");
					break;
			}
			//history.go(-1);
		},
		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},
		initDataModel: function() {
			var sDataPath = sap.ui.require.toUrl("AddPlatform/model/data") + "/ProcessMonitorResultDetailDocument.json";
			var oModel = new JSONModel(sDataPath);
			return oModel;
		},

		onCorrectPathClick: function() {
			this._oModel.setProperty("/Source", this._sValidPath);
		},
		updateDocItens: function(oProcModel){
			
			var mPage = this.byId("ProcessMonitorResultDetailDocumentEdit");
			mPage.setBusy(true);
			var fields;
			if(oProcModel.oData.IDEME !== undefined){
				fields = oProcModel.oData.IDEME;
			}else{
				fields = '';
			}
			var indoc;
			if(oProcModel.oData.INDOC !== undefined){
				indoc = oProcModel.oData.INDOC;
			}else{
				indoc = '';
			}
			
			var novoBody = AddUtilitiesWeb.setBodyNew("0000000007", indoc, fields, AddUtilitiesWeb.getDefaultViewsMap());
			var oHtml = this.getView().byId("idFrame");
			oHtml.setContent("");
			AddUtilitiesWeb.callAddtaxSAP(novoBody, this.callBackForResult, this.callBackForErrorResult, this); 
			
		},
		callBackForResult: function(sapResponse, that) {
			if(sapResponse !== undefined){
				var oModel;
				try{
					var sResponse = JSON.parse(window.atob(sapResponse));
					oModel = new JSONModel(sResponse);
				}catch (err){
					alert("Erro ao obter itens e anexos do documento: " + window.atob(sapResponse))
				}
				if(!oModel){
					oModel = {oData: {TD0000: {TDI: []}}};
				}
				
				
				var Pedidos = {
				itens: []};
				Pedidos.itens = oModel.oData.TD0000.TDI;
				if(Pedidos.itens){
					Pedidos.itens.forEach(function(oValue, i){
				    	if(!oValue.LOEKZ)
				    	    oValue.LOEKZ = "";
				    });	
				}
				that.getView().setModel(new JSONModel(Pedidos), "Pedidos");
			
				
				var coreModel = sap.ui.getCore().getModel("CoreNodeAddModel");
				AddUtilities.addDynTable(oController, "AddDynItens", "idPnl", "Pedidos>", "/itens", "AddStruci", "TDI");

				var Document = {TD0000: []};
				oModel.oData.TD0000.NOME = oModel.oData.TD0000.SUBJE;
				delete oModel.oData.TD0000["TDI"];
				Document.TD0000.push(oModel.oData.TD0000);
				that.getView().setModel(new JSONModel(Document), "DOCUMENT");
				
				
				var mPage = that.byId("ProcessMonitorResultDetailDocumentEdit");
				mPage.setBusy(false);
				
				var oHtml = that.getView().byId("idFrame");
				if(oModel && oModel.oData && oModel.oData.TD0000 && oModel.oData.TD0000.TD0002 && oModel.oData.TD0000.TD0002[0]){
					var sIFrame = AddUtilities.getHtmlMediaContent(oModel.oData.TD0000.TD0002[0].TYPE, oModel.oData.TD0000.TD0002[0].ATTACHB);
					oHtml.setContent(sIFrame);
				}
			}
		},
		callBackForErrorResult: function(sapResponse, that) {
			var mPage = that.byId("ProcessMonitorResultDetailDocumentEdit");
			mPage.setBusy(false);
			
			var Pedidos = {
				itens: []};
			
			//sap.ui.getCore().setModel(new JSONModel(oModel),"ProcStartResult");
			that.getView().setModel(new JSONModel(Pedidos), "Pedidos");
			
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
		tdiOnAddItem: function(oEvent){
			var coreModel = oController.getView().getModel("Pedidos");
			if(coreModel.oData.itens)
				coreModel.oData.itens.push({LOEKZ: ""});
			else{
				var itens = [{LOEKZ: ""}];
				coreModel.oData.itens = itens;
			}
			coreModel.refresh(true);
		},
		tdiOnRemoveItem: function(oEvent){
			var oTable = sap.ui.getCore().byId("AddDynItens");
			var paths = oTable.getSelectedIndices();
			
			var selectedItens = [];
			var coreModel = oController.getView().getModel("Pedidos");
            if(coreModel.oData.itens){
			    if(paths.length > 0){
				    paths.forEach(function(oValue, i){
				    	(oTable.getContextByIndex(oValue).getObject()).LOEKZ = "X";
				  	    //coreModel.oData.itens.splice(oValue - i, 1);
				    });	
				    oTable.clearSelection();
                    coreModel.refresh(true);				    			
			    }
            }
		},
		onSaveItem: function(oEvent){
			var body = "";
			var screen = oController.getView().getContent()[0].getModel("Process");
			var impostos = oController.getView().getModel("Impostos");
			if(impostos !== undefined && impostos.oData !== undefined && impostos.oData.tax !== undefined){
				if(impostos.oData.tax.length > 0){
					impostos.oData.tax.forEach(function(oValue, i){
						var type = oValue.TYPE;
						screen.oData["AL" + type] = oValue.TAX;
						screen.oData["VL" + type] = oValue.VALUE;
					});
				}
			}
			var fields = oController.getView().getModel("Pedidos");
			if(fields === undefined || fields.oData === undefined || fields.oData.itens === undefined){
				fields = [];
			}
			var body = AddUtilitiesWeb.setBodyForInterface("0000000008", "EPADILHA", "PT", window.atob(JSON.stringify(screen.oData)), JSON.stringify(fields.oData.itens), null);
			var mPage = this.byId("ProcessMonitorResultDetailDocumentEdit");
			mPage.setBusy(true);
			AddUtilitiesWeb.callAddtaxSAP(body, this.callBackForSaveResult, this.callBackForErrorSaveResult, this); 
		},
		callBackForSaveResult: function(sapResponse, that) {
			var mPage = that.byId("ProcessMonitorResultDetailDocumentEdit");
			mPage.setBusy(false);
			if(sapResponse !== undefined){
				var oModel = new JSONModel(JSON.parse(window.atob(sapResponse)));
			}
		},
		callBackForErrorSaveResult: function(sapResponse, that) {
			var mPage = that.byId("ProcessMonitorResultDetailDocumentEdit");
			mPage.setBusy(false);
		},
		tdiOnSaveTableVariantPress: function(){
			var viewName = oController.getView().getProperty("viewName");
			var content = (sap.ui.getCore().getModel("AddStruc")).oData;
			VariantHelper.openDialogToSave(oController, viewName, 'table', content)
				.then(persisted =>{
					console.log("Gravou variante: ", persisted);
				})
				.catch(err =>{
			   		console.log("Erro ao gravar variante local: ", err);
				});
		},
		tdiOnLoadTableVariantPress: function(){
			var viewName = oController.getView().getProperty("viewName");

			VariantHelper.openDialogToList(oController, viewName, 'table')
				.then(data =>{
					sap.ui.getCore().setModel(new JSONModel(data), "AddStruc");
					oController.setTable();
				})
				.catch(err =>{
					console.log("Erro ao listar variante local: ", err);
				});
		},
		tdiOnEditLayoutTablePress : function(eEvent){
			//var coreModel = sap.ui.getCore().getModel("CoreNodeAddModel");
			//var struct = coreModel.oData.oData.STRUC;
			var struct = (sap.ui.getCore().getModel("AddStruc")).oData;
			//var struct = TableStruct();

			TableLayoutHelper.openDialog(oController, struct)
				.then(data =>{
					console.log("Table Layout success: ", data);
					oController._columns = data;
					sap.ui.getCore().setModel(new JSONModel(data), "AddStruc");
					oController.setTable();
				})
				.catch(err =>{
					console.log("Table Layout s error: ", err);
				});
		},
		
		tdiOnExportExcel : function(oEvent){
			AddUtilities.exportToExcel(oController.oView.getModel(), "AddStruc");
		},
		onButtonPress: function(oEvent) {
			var oDialog = oEvent.getSource().getParent();
			oDialog.close();
		}
	});
});