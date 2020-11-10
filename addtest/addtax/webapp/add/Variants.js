sap.ui.define([
	'sap/ui/core/util/Export',
	'sap/ui/core/util/ExportTypeCSV',
	"sap/ui/model/json/JSONModel",
], function (Export, ExportTypeCSV, JSONModel) {
	"use strict";

	var vThat = "";
	var vThis = "";

	return {
		onApproveDialog: function (oEvent, callBackApprove, nameModel, strucModelName, vThis) {

			var bButton = new sap.m.Button({
				type: sap.m.ButtonType.Emphasized,
				text: "Sim",
				press: function () {
					callBackApprove(oEvent, nameModel, strucModelName, vThat);
					this.oApproveDialog.close();
				}.bind(this)
			});

			this.oApproveDialog = new sap.m.Dialog({
				type: sap.m.DialogType.Message,
				title: "Eliminar",
				content: new sap.m.Text({
					text: "Confirmar?"
				}),
				beginButton: bButton,
				endButton: new sap.m.Button({
					text: "Cancelar",
					press: function () {
						this.oApproveDialog.close();
					}.bind(this)
				})
			});

			this.oApproveDialog.open();
		},
		editParam: function (oEvent, modelName, strucModelName, vThis) {

			//Get the Model.
			var oModel = sap.ui.getCore().getModel(modelName);
			var oStruc = (sap.ui.getCore().getModel(strucModelName)).oData;
			var PARAMSELECTED = sap.ui.getCore().getModel(modelName + "SELECTED").oData;
			var lALV = PARAMSELECTED;
			var vFields = [];

			function addFields(value, index, array) {

				if (value.VISIBLE !== "X") {
					return;
				}
				var vLabel = (value.SELTEXT_S) ? value.SELTEXT_S : value.FIELDNAME;
				vFields.push(new sap.m.Label({
					text: vLabel
				}));
				var vVisible = true;
				if (value.VISIBLE === false || value.VISIBLE === "false") {
					vVisible = false;
				}

				var vEditable = true;
				if (!value.EDIT || value.KEY === 'X') {
					vEditable = false;
				}
				var field = "";

				if (value.FIELDNAME !== "ATIVO") {

					field = new sap.m.Input({
						id: 'fld' + value.FIELDNAME,
						value: eval('PARAMSELECTED.' + value.FIELDNAME),
						maxLength: Number.parseInt(value.INTLEN),
						enabled: vEditable
					});

				} else {
					field = new sap.ui.commons.CheckBox({
						id: 'fld' + value.FIELDNAME,
						checked: eval('PARAMSELECTED.' + value.FIELDNAME)
					}).setEnabled(vEditable);
				}
				vFields.push(field);
			}

			function getValues(value, index, array) {

				var val = sap.ui.getCore().byId("fld" + value.FIELDNAME);

				if (value.FIELDNAME !== 'ATIVO') {
					if (val) {
						eval('lALV.' + value.FIELDNAME + ' = val._lastValue');
					} else {
						eval('lALV.' + value.FIELDNAME + ' = ' + 'PARAMSELECTED.' + value.FIELDNAME)
					}
				} else {
					if (val) {
						eval('lALV.' + value.FIELDNAME + ' = val.getChecked()');
					} else {
						lALV.ATIVO = false;
					}
					return;
				}
			}

			oStruc.forEach(addFields);

			var dialog = new sap.m.Dialog({
				title: "Modificar registro",
				type: "Message",
				content: [new sap.ui.layout.HorizontalLayout({
					content: [new sap.ui.layout.VerticalLayout({
						width: "350px",
						content: vFields
					})]
				})],
				beginButton: new sap.m.Button({
					text: "Modificar",
					press: function () {
						oStruc.forEach(getValues);
						var vPath = "/ALV/" + PARAMSELECTED._INDEX;
						oModel.setProperty(vPath, lALV);
						sap.ui.getCore().setModel(new JSONModel(lALV), modelName + "SELECTED");

						lALV.TABLE = vThat.tableDefine(lALV, modelName);

						var req =
							'{"INTERFACE": "0000000010","TABLE":"' +
							PARAMSELECTED.TABLE + '","OPERA":"M", "DATA":"' +
							window.btoa(JSON.stringify(lALV)) +
							'","SPRAS":"PT"}';

						vThis.fromSAPECC(req, "");

						dialog.close();
					}
				}),
				endButton: new sap.m.Button({
					text: "Cancelar",
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});
			dialog.open();
		},
		tableDefine: function (modelSelected, type) {

			if (type === "PARAM") {
				if (modelSelected.PROCX) {
					return "/ADD/TP0106";
				} else {
					return "/ADD/TP0109";
				}
			} else {
				if (modelSelected.PROCX) {
					return "/ADD/TP0107";
				} else {
					return "/ADD/TP0114";
				}
			}
		},
		delParam: function (oEvent, modelName, strucModelName, vThat) {

			//Get the Model.
			var oModel = sap.ui.getCore().getModel(modelName);

			var oSELECTED = sap.ui.getCore().getModel(modelName + "SELECTED").oData;
			// Configure the Path /Employees/EmployeeIdSelected
			//Get the OData 
			var oALV = oModel.getProperty("/ALV");
			// Delete the record from the oEmployees Object

			oALV.splice(oSELECTED._INDEX, 1);
			// Update the Model
			oModel.setProperty("/ALV", oALV);

			oSELECTED.TABLE = vThat.tableDefine(oSELECTED, modelName);

			var req =
				'{"INTERFACE": "0000000010","TABLE":"' +
				oSELECTED.TABLE + '","OPERA":"D", "DATA":"' +
				window.btoa(JSON.stringify(oSELECTED)) +
				'","SPRAS":"PT"}';

			vThis.fromSAPECC(req, "");

			if (modelName == "PARAM") {
				vThis.destroyParam("VPARA");
			}

		},
		addParam: function (modelName, strucModelName) {

			var oModel = sap.ui.getCore().getModel(modelName);
			var oStruc = (sap.ui.getCore().getModel(strucModelName)).oData;
			var PARAMSELECTED = sap.ui.getCore().getModel("PARAMSELECTED").oData;
			var lALV = {};
			var tALV = oModel.getProperty("/ALV");
			var vFields = [];

			function addFields(value, index, array, vThat) {

				if ( (value.VISIBLE !== "X" || value.FIELDNAME === "MANDT" )
				|| ((value.FIELDNAME === "USMOD" || 
				     value.FIELDNAME === "DTMOD" || 
				     value.FIELDNAME === "HRMOD") && value.EDIT ==="")) {
					return;
				}
				var vLabel = (value.SELTEXT_S) ? value.SELTEXT_S : value.FIELDNAME;
				vFields.push(new sap.m.Label({
					text: vLabel
				}));
				var vVisible = true;
				if (value.VISIBLE === false || value.VISIBLE === "false") {
					vVisible = false;
				}
				var vEditable = true;
				var vValue    = "";
				var field     = "";
				
				if(modelName==="PARAM"){
					if(value.FIELDNAME ==="VARIA"){
						vEditable = false;
						vValue = eval('PARAMSELECTED.' + value.FIELDNAME)
					}
				}else if(modelName==="VPARA"){
					if(value.FIELDNAME ==="VARIA" || value.FIELDNAME ==="PARAM"){
						vEditable = false;
						vValue = eval('PARAMSELECTED.' + value.FIELDNAME)
					}
				}
			

				if (value.FIELDNAME !== "ATIVO") {

					field = new sap.m.Input({
						id: 'fld' + value.FIELDNAME,
						maxLength: Number.parseInt(value.INTLEN),
						value: vValue,
						enabled: vEditable
					});

				} else {
					field = new sap.ui.commons.CheckBox({
						id: 'fld' + value.FIELDNAME
					}).setEnabled(vEditable);
				}
				vFields.push(field);
			}

			function getValues(value, index, array) {

				var val = sap.ui.getCore().byId("fld" + value.FIELDNAME);

				if (value.FIELDNAME !== 'ATIVO') {
					if (val) {
						eval('lALV.' + value.FIELDNAME + ' = val._lastValue');
					} else {
						eval('lALV.' + value.FIELDNAME + ' = ""')
					}
				} else {
					if (val) {
						eval('lALV.' + value.FIELDNAME + ' = val.getChecked()');
					} else {
						lALV.ATIVO = false;
					}
					return;
				}

				if (eval('!lALV.' + value.FIELDNAME) && value.KEY === "X") {
					if (eval('PARAMSELECTED.' + value.FIELDNAME)) {
						eval('lALV.' + value.FIELDNAME + ' = PARAMSELECTED.' + value.FIELDNAME);
					} else {
						eval('lALV.' + value.FIELDNAME + ' = ""')
					}
				}
			}

			oStruc.forEach(addFields);

			var dialog = new sap.m.Dialog({
				title: "Inserir novo registro",
				type: "Message",
				content: [new sap.ui.layout.HorizontalLayout({
					content: [new sap.ui.layout.VerticalLayout({
						width: "350px",
						content: vFields
					})]
				})],
				beginButton: new sap.m.Button({
					text: "Salvar",
					icon: "save",
					press: function () {
						oStruc.forEach(getValues);
						tALV.push(lALV);
						oModel.setProperty("/ALV", tALV);

						PARAMSELECTED.TABLE = vThat.tableDefine(PARAMSELECTED, modelName);

						var req =
							'{"INTERFACE": "0000000010","TABLE":"' +
							PARAMSELECTED.TABLE + '","OPERA":"M", "DATA":"' +
							window.btoa(JSON.stringify(lALV)) +
							'","SPRAS":"PT"}';

						vThis.fromSAPECC(req, "");

						dialog.close();
					}
				}),
				endButton: new sap.m.Button({
					text: "Cancelar",
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});
			dialog.open();
		},
		onModifTableVariantPressVPARA: function (oEvent) {
			vThat.editParam(oEvent, "VPARA", "AddStrucVPARA", vThis);
		},
		onDeletTableVariantPressVPARA: function (oEvent) {
			vThat.onApproveDialog(oEvent, vThat.delParam, "VPARA", "AddStrucVPARA", vThis);
		},
		onInserTableVariantPressVPARA: function (oEvent) {
			vThat.addParam("VPARA", "AddStrucVPARA", vThis);
		},
		onModifTableVariantPressPARAM: function (oEvent) {
			vThat.editParam(oEvent, "PARAM", "AddStrucPARAM", vThis);
		},
		onDeletTableVariantPressPARAM: function (oEvent) {
			vThat.onApproveDialog(oEvent, vThat.delParam, "PARAM", "AddStrucPARAM", vThis);
		},
		onInserTableVariantPressPARAM: function (oEvent) {
			vThat.addParam("PARAM", "AddStrucPARAM", vThis);
		},
		formatDateToSAP: function (uData) {
			return sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "YYYYMMdd"
			}).format(uData);
		},
		addDynTable: function (that, tableId, placeAtId, namedModel, rowsModel, strucModelName, tableType) {

			vThis = that;
			vThat = this;

			var oTable = sap.ui.getCore().byId(tableId);

			if (oTable) {
				//	oTable.destroyColumns();
				//	oTable.clearSelection();
				oTable.destroy();
			}

			function addColumnsToDynItensTableVAR(value, index, array) {
				//console.log("INDEX: " + index + "VALUE: " + value.FIELDNAME);
				var vLabel = (value.SELTEXT_S) ? value.SELTEXT_S : value.FIELDNAME;
				//var vVisible = (value.VISIBLE)?value.VISIBLE:true;
				var vVisible = true;

				if ((value.VISIBLE === false || value.VISIBLE === "false" ||
						value.VISIBLE !== 'X' || value.FIELDNAME === "MANDT" ||
						value.FIELDNAME === "VARIA") || 
					( namedModel==="VPARA" && value.FIELDNAME === "PARAM")){
					return;
				}

				var vEditable = false;
				/*		if (value.EDIT === "X")
							vEditable = true;*/

				var field = "";

				if (value.FIELDNAME !== "ATIVO") {
					field = new sap.m.Text({
						wrapping: false
					}).bindProperty("text", namedModel + ">" + value.FIELDNAME);
				} else {
					//var check = "{= ${"+ namedModel + value.FIELDNAME + "} === null ? true : false }"; 
					field = new sap.ui.commons.CheckBox().bindProperty("checked", namedModel + ">" + value.FIELDNAME).setEnabled(vEditable);
				}

				oTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: vLabel
					}), // Creates an Header with value defined for the text attribute
					template: field, // binds the value into the text field defined using JSON  
					sortProperty: value.FIELDNAME, // enables sorting on the column
					filterProperty: value.FIELDNAME, // enables set filter on the column
					//width: value.INTLEN + "px"         // width of the column
					autoResizable: true,
					visible: vVisible
				}));
			}

			var oConfig = (sap.ui.getCore().getModel(namedModel)).oData;
			var tStruc = (sap.ui.getCore().getModel(strucModelName)).oData;

			var vContent = [];
			var vBt = "";
			var vF = "";

			if (oConfig.INSER) {
				vF = 'this.onInserTableVariantPress' + namedModel;
				vBt = new sap.m.Button().setIcon("sap-icon://add").setType("Transparent").setTooltip("Inserir").attachPress(eval(vF));
				vContent.push(vBt);
			}

			if (oConfig.MODIF) {
				vF = 'this.onModifTableVariantPress' + namedModel;
				vBt = new sap.m.Button().setIcon("sap-icon://edit").setType("Transparent").setTooltip("Editar").attachPress(eval(vF));
				vContent.push(vBt);
			}

			if (oConfig.DELET) {
				vF = 'this.onDeletTableVariantPress' + namedModel;
				vBt = new sap.m.Button().setIcon("sap-icon://delete").setType("Transparent").setTooltip("Eliminar").attachPress(eval(vF));
				vContent.push(vBt);
			}

			if (vContent.length > 0) {
				var bButtonEdit = new sap.m.OverflowToolbar({
					content: vContent
				}).addStyleClass("sapMTBHeader-CTX");
			}

			var vRowSelectionChange = "";
			var vTitle = "{"+namedModel+">/TITLE}";

			vRowSelectionChange = eval('that.onSelectionChange' + namedModel);

			oTable = new sap.ui.table.Table({
				id: tableId,
				title:  vTitle,
				selectionMode: "Single",
				rowSelectionChange: vRowSelectionChange,
				showNoData: true,
				columnHeaderHeight: 10,
				visibleRowCount: 7,
				extension: bButtonEdit
			});

			oTable.bindRows(namedModel + ">" + rowsModel);

			if (tStruc instanceof Array) {
				tStruc.sort(function (a, b) {
					return a.COL_POS - b.COL_POS;
				});
				tStruc.forEach(addColumnsToDynItensTableVAR);
			}

			oTable.placeAt(that.getView().createId(placeAtId));
		}
	};
});