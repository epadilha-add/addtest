sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/jquery",
	"../add/AddUtilities",
	"../add/AddUtilitiesWeb",
	"../add/AddFormatter"
], function(Controller, JSONModel, jQuery, AddUtilities, AddUtilitiesWeb, formatter) {
	"use strict";
	var countRender;
	var oController;

	return Controller.extend("AddPlatform.controller.ProcessMonitorResultDetail", {
		
		formatter: formatter,
		AddUtilities: AddUtilities,

		onInit: function() {
			countRender = 0;

			var oModelLog = this.initLogsData();
			sap.ui.getCore().setModel(oModelLog, "LOG");

			oController = this;
			
			let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("processMonitorResultDetail").attachMatched(this.call, this);  

		},
		
		call : function()
		{
			var oProcModel = sap.ui.getCore().getModel("CoreNodeAddModel");
			
			var sModel = JSON.stringify(oProcModel.oData.oData);
			sModel = sModel.replace("ALV", "Process");
			var oModel = new JSONModel();
			oModel.setData(JSON.parse(sModel));
			
			oModel.setProperty("/TotalText", "Total " + oModel.oData.Process.length);
			var oView = this.getView();
			oView.setModel(oModel);
			
			var oStrucModel = new JSONModel(oProcModel.oData.oData.STRUC);
			sap.ui.getCore().setModel(oStrucModel, "AddStruc");
			
			this.setTable();
			
			var oProcResultModel = sap.ui.getCore().getModel("ProcResultModel");
			oProcResultModel.oData.STATUSTATE = this.formatter.formatStatusState(oProcResultModel.oData.STATU, oProcResultModel.oData.PROCX);            
			this.getView().setModel(oProcResultModel, "PROCINFO");
			var procFlow = AddUtilities.getProcessFlowModel(oProcResultModel.oData.PROCX, oProcResultModel.oData.ATIVI, oProcResultModel.oData.STATU)
			var PFModel = new JSONModel(procFlow);
			this.getView().setModel(PFModel, "PF");
			
			this.oProcessFlow = this.getView().byId("processflow");
			this.oProcessFlow.updateModel();
		},

		onButtonPress: function(oEvent) {
			var oDialog = oEvent.getSource().getParent();
			oDialog.close();
		},

		onProcessMonitorLogStart: function(oEvent) {

			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("AddPlatform.view.fragment.popUp.popUpLogs", this);
			}

			this._oDialog.open();

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

			jQuery.ajax(sap.ui.require.toUrl("AddPlatform/model/data/") + "ProcessMonitorResultDetail.json", {
				dataType: "json",
				success: function(oData) {
					for (var i = 0; i < oData.Process.length; i++) {
						var oProcess = oData.Process[i];

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

		onBehaviourModeChange: function(oEvent) {
			this.switchState(oEvent.getParameter("selectedItem").getKey());
		},

		switchState: function(sKey) {
			// var oTable = this.byId("table");
			// var iCount = 0;
			// var oTemplate = oTable.getRowActionTemplate();
			// if (oTemplate) {
			// 	oTemplate.destroy();
			// 	oTemplate = null;
			// }

			// for (var i = 0; i < this.modes.length; i++) {
			// 	if (sKey === this.modes[i].key) {
			// 		var aRes = this.modes[i].handler();
			// 		iCount = aRes[0];
			// 		oTemplate = aRes[1];
			// 		break;
			// 	}
			// }

			// oTable.setRowActionTemplate(oTemplate);
			// oTable.setRowActionCount(iCount);
		},

		handleActionPress: function(oEvent) {
			/*	var oRow = oEvent.getParameter("row");
				var oItem = oEvent.getParameter("item");
				MessageToast.show("Item " + (oItem.getText() || oItem.getType()) + " pressed for product with id " +
					this.getView().getModel().getProperty("IDEME", oRow.getBindingContext()));*/

			this.getRouter().navTo("processMonitorResultDetailDocumentEdit");
		},
		onNavToComplementData: function(oEvent) {
			
			var oTable = sap.ui.getCore().byId("AddDynTable");
			var paths = oTable.getSelectedIndices();
			
			var selectedItens = [];
			var coreModel = sap.ui.getCore().getModel("CoreNodeAddModel");
			//Se paths.length for > 0 enviar apenas os itens do PATH E o STRUC
			if(paths.length > 0){
				var oItem = oTable.getContextByIndex(paths[0]).getObject();
				//Busca todos os models selecionados
				paths.forEach(function(oValue, i){
				  	selectedItens.push(oTable.getContextByIndex(oValue).getObject());
				});				
			}else{ //No caso do paths.length === 0, enviar todos os itens do model
				selectedItens = coreModel.oData.oData.ALV;
			}
			
			var oModel = new JSONModel();
			oModel.setData(JSON.parse('{"Process": [], "STRUC": []}'));
			oModel.oData.Process = selectedItens;
			oModel.oData.STRUC = coreModel.oData.oData.STRUC;
			sap.ui.getCore().setModel(new JSONModel(oModel),"AddDetailDocumentEditModel");
			oController.getRouter().navTo("processMonitorResultDetailDocumentEdit");
		},

		initDataModel: function() {
			var sDataPath = sap.ui.require.toUrl("AddPlatform/model/data") + "/ProcessMonitorResultDetail.json";
			var oModel = new JSONModel(sDataPath);
			//this.getView().setModel(oModel);
			return oModel;
		},
		onNavBack: function() {
			oController.getRouter().navTo("backToProcessMonitorResult");
			//history.go(-1);
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
		
		
		setTable: function() {
			AddUtilities.addDynTable(oController, "AddDynTable", "idPnl", "", "/Process", "AddStruc", "ALV");
		},
		onSaveTableVariantPress: function(){
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
		onLoadTableVariantPress: function(){
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
		
		onEditLayoutTablePress : function(eEvent){
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
		
		onExportExcel : function(oEvent){
			AddUtilities.exportToExcel(oController.oView.getModel(), "AddStruc");
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
					//MessageToast.show(this._messageBuffer.join("\n"));
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