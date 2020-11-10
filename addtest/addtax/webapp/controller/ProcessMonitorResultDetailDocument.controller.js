sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/ToolbarSpacer",
	"sap/ui/thirdparty/jquery"
], function(Controller, JSONModel, MessageToast, ToolbarSpacer, jQuery) {
	"use strict";

	return Controller.extend("AddPlatform.controller.ProcessMonitorResultDetailDocument", {

		onInit: function() {


			var oJSONModel = this.initDataModel();
			var oView = this.getView();
			oView.setModel(oJSONModel, "processMonitorResultDetailDocument");

			this._sValidPath = sap.ui.require.toUrl("AddPlatform/model/data/pdf.pdf");

			this._oModel = new JSONModel({
				Source: this._sValidPath,
				Title: "100000704.pdf",
				Height: "100%"
			});
			this.getView().setModel(this._oModel);

			// create JSON model instance

			// JSON sample data
			var Pedidos = {
				itens: [{
					IEBELN: "4500000000",
					LBLNI: "1000000000",
					CHAVE: "350000000000005500000000000000000000000",
					VGBEL: "1.550,00",
					MENGE: "12",
					EBELP: "0010",
					IVA: "I3"
				}, {
					IEBELN: "4500000000",
					LBLNI: "1000000000",
					CHAVE: "350000000000005500000000000000000000000",
					MENGE: "12",
					VGBEL: "1.550,00",
					EBELP: "0010",
					IVA: "I3"
				}, {
					IEBELN: "4500000000",
					LBLNI: "1000000000",
					CHAVE: "350000000000005500000000000000000000000",
					VGBEL: "1.550,00",
					MENGE: "12",
					EBELP: "0010",
					IVA: "I3"
				}, {
					IEBELN: "4500000000",
					LBLNI: "1000000000",
					CHAVE: "350000000000005500000000000000000000000",
					VGBEL: "1.550,00",
					MENGE: "12",
					EBELP: "0010",
					IVA: "I3"
				}, {
					IEBELN: "4500000000",
					LBLNI: "1000000000",
					CHAVE: "350000000000005500000000000000000000000",
					VGBEL: "1.550,00",
					MENGE: "12",
					EBELP: "0010",
					IVA: "I3"
				}]
			};

			this.getView().setModel(new JSONModel(Pedidos), "Pedidos");

			var Impostos = {
				tax: [{
					TYPE: "PIS",
					TAX: "3,5",
					BASE: "1.000,00",
					VALUE: "1.550,00"
				}, {
					TYPE: "COFINS",
					TAX: "3,5",
					BASE: "1.000,00",
					VALUE: "1.550,00"
				}, {
					TYPE: "CSLL",
					TAX: "3,5",
					BASE: "1.000,00",
					VALUE: "1.550,00"
				}, {
					TYPE: "INSS",
					TAX: "3,5",
					BASE: "1.000,00",
					VALUE: "1.550,00"
				}, {
					TYPE: "ISS",
					TAX: "3,5",
					BASE: "1.000,00",
					VALUE: "1.550,00"
				}, {
					TYPE: "ICMS",
					TAX: "3,5",
					BASE: "1.000,00",
					VALUE: "1.550,00"
				}]
			};

			this.getView().setModel(new JSONModel(Impostos), "Impostos");

			/*	var oTable = new sap.ui.table.Table({
					selectionMode: sap.ui.table.SelectionMode.Single,
					selectionBehavior: sap.ui.table.SelectionBehavior.Row
				});

				oTable.placeAt("tabtax");*/

		},

		onButtonPress: function(oEvent) {
			var oDialog = oEvent.getSource().getParent();
			oDialog.close();
		},
		onNavToComplementDataEdit: function() {
			this.getRouter().navTo("processMonitorResultDetailDocumentEdit");
			/*	if (!this._oDialogEdit) {
					this._oDialogEdit = sap.ui.xmlfragment("AddPlatform.view.fragment.popUp.processMonitorResultDetailDocumentEdit", this);
				}
				this._oDialogEdit.open();
			*/
		},
		onNavToComplementData: function() {

			this.getRouter().navTo("ProcessMonitorResultDetailDocument");
		},
		onNavBack: function() {
			history.go(-1);
		},
		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},
		initDataModel: function() {
			var sDataPath = sap.ui.require.toUrl("AddPlatform/model/data") + "/ProcessMonitorResultDetailDocument.json";
			var oModel = new JSONModel(sDataPath);
			//this.getView().setModel(oModel);
			return oModel;
		},

		onCorrectPathClick: function() {
			this._oModel.setProperty("/Source", this._sValidPath);
		}
	});
});