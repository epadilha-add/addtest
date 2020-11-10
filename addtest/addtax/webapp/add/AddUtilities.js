sap.ui.define([
	'sap/ui/core/util/Export',
	'sap/ui/core/util/ExportTypeCSV',
	"sap/ui/model/json/JSONModel"
], function (Export, ExportTypeCSV, JSONModel) {
	"use strict";

	return {

		formatDateToSAP: function (uData) {
			return sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "YYYYMMdd"
			}).format(uData);
		},
		addDynTable: function (that, tableId, placeAtId, namedModel, rowsModel, strucModelName, tableType) {

			var oTable = sap.ui.getCore().byId(tableId);

			function addColumnsToDynTable(value, index, array) {
				//console.log("INDEX: " + index + "VALUE: " + value.FIELDNAME);
				var vLabel = (value.SELTEXT_S) ? value.SELTEXT_S : value.FIELDNAME;
				//var vVisible = (value.VISIBLE)?value.VISIBLE:true;
				var vVisible = true;
				if (value.VISIBLE === false || value.VISIBLE === "false") {
					vVisible = false;
				}

				oTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: vLabel
					}), // Creates an Header with value defined for the text attribute
					//template: new sap.m.Input({enabled: false}).bindProperty("value", namedModel+value.FIELDNAME), // binds the value into the text field defined using JSON
					template: new sap.m.Text({
						wrapping: false
					}).bindProperty("text", namedModel + value.FIELDNAME), // binds the value into the text field defined using JSON
					sortProperty: value.FIELDNAME, // enables sorting on the column
					filterProperty: value.FIELDNAME, // enables set filter on the column
					//width: value.INTLEN + "px"                  // width of the column
					autoResizable: true,
					visible: vVisible
				}));
			}

			function addColumnsToDynItensTable(value, index, array) {
				//console.log("INDEX: " + index + "VALUE: " + value.FIELDNAME);
				var vLabel = (value.SELTEXT_S) ? value.SELTEXT_S : value.FIELDNAME;
				//var vVisible = (value.VISIBLE)?value.VISIBLE:true;
				var vVisible = true;
				if (value.VISIBLE === false || value.VISIBLE === "false" || value.FIELDNAME == "MANDT" || value.FIELDNAME == "VARIA") {
					vVisible = false;
				}

				var vEditable = false;
				if (value.EDIT === "X")
					vEditable = true;

				oTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: vLabel
					}), // Creates an Header with value defined for the text attribute

					template: new sap.m.Input({
						enabled: vEditable
					}).bindProperty("value", namedModel + value.FIELDNAME), // binds the value into the text field defined using JSON  

					sortProperty: value.FIELDNAME, // enables sorting on the column
					filterProperty: value.FIELDNAME, // enables set filter on the column
					//width: value.INTLEN + "px"                  // width of the column
					autoResizable: true,
					visible: vVisible
				}));
			}

			function addColumnsToDynItensTableVAR(value, index, array) {
				//console.log("INDEX: " + index + "VALUE: " + value.FIELDNAME);
				var vLabel = (value.SELTEXT_S) ? value.SELTEXT_S : value.FIELDNAME;
				//var vVisible = (value.VISIBLE)?value.VISIBLE:true;
				var vVisible = true;
				if (value.VISIBLE === false || value.VISIBLE === "false" || value.FIELDNAME == "MANDT" || value.FIELDNAME == "VARIA") {
					vVisible = false;
				}

				var vEditable = false;
				if (value.EDIT === "X")
					vEditable = true;

				var field = "";

				if (value.FIELDNAME !== "ATIVO") {
					field = new sap.m.Input({
						enabled: vEditable
					}).bindProperty("value", namedModel + value.FIELDNAME);
				} else {
                    //var check = "{= ${"+ namedModel + value.FIELDNAME + "} === null ? true : false }"; 
					field = new sap.ui.commons.CheckBox().bindProperty("checked", value.FIELDNAME).setEnabled(vEditable);
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

			if (!oTable) {
				if (tableType === "ALV") {
					oTable = new sap.ui.table.Table({
						id: tableId,
						//title: "{i18n>BUKRS_text}",
						showNoData: true,
						columnHeaderHeight: 10,
						visibleRowCount: 7,
						extension: new sap.m.OverflowToolbar({
							content: [
								new sap.m.Button().setIcon("sap-icon://pending").setText("Executar Processo").setType("Transparent"),
								new sap.m.Button().setIcon("sap-icon://cancel").setText("Anular Processo").setType("Transparent"),
								new sap.m.Button().setIcon("sap-icon://accounting-document-verification").setText("Dados Complementares").setType(
									"Transparent").attachPress(that.onNavToComplementData),
								new sap.m.ToolbarSpacer(),
								new sap.m.Button().setIcon("sap-icon://ui-notifications").setText("").setType("Transparent"),
								new sap.m.ToolbarSeparator(),
								new sap.m.Button().setIcon("sap-icon://excel-attachment").setType("Transparent").setTooltip("Exportar Excel").attachPress(
									that.onExportExcel),
								new sap.m.ToolbarSeparator(),
								new sap.m.Button().setIcon("sap-icon://key-user-settings").setType("Transparent").setTooltip("Editar Layout da Tabela").attachPress(
									that.onEditLayoutTablePress),
								new sap.m.Button().setIcon("sap-icon://save").setType("Transparent").setTooltip("Gravar variante local").attachPress(that.onSaveTableVariantPress),
								new sap.m.Button().setIcon("sap-icon://customize").setType("Transparent").setTooltip("Buscar variante local").attachPress(
									that.onLoadTableVariantPress)
							]
						}).addStyleClass("sapMTBHeader-CTX")
					});
					oTable.bindRows(namedModel + rowsModel);
				} else if (tableType === "VAR") {
					oTable = new sap.ui.table.Table({
						id: tableId,
						//title: tableTitle,
						selectionMode: "Single",
						rowSelectionChange: that.onSelectionChangePARAM,
						showNoData: true,
						columnHeaderHeight: 10,
						visibleRowCount: 7,
						extension: new sap.m.OverflowToolbar({
							content: [
	/*							new sap.m.Button().setIcon("sap-icon://ui-notifications").setText("").setType("Transparent"),
								new sap.m.ToolbarSeparator(),
								new sap.m.Button().setIcon("sap-icon://excel-attachment").setType("Transparent").setTooltip("Exportar Excel").attachPress(
									that.onExportExcel),
								new sap.m.ToolbarSeparator(),
								new sap.m.Button().setIcon("sap-icon://key-user-settings").setType("Transparent").setTooltip("Editar Layout da Tabela").attachPress(
									that.onEditLayoutTablePress),*/
								new sap.m.Button().setIcon("sap-icon://save").setType("Transparent").setTooltip("Gravar variante local").attachPress(that.onSaveTableVariantPress),
								new sap.m.Button().setIcon("sap-icon://edit").setType("Transparent").setTooltip("Gravar variante local").attachPress(that.onSaveTableVariantPress),
				/*				new sap.m.Button().setIcon("sap-icon://customize").setType("Transparent").setTooltip("Buscar variante local").attachPress(
									that.onLoadTableVariantPress)*/
							]
						}).addStyleClass("sapMTBHeader-CTX")
					});
					//oTable.destroyColumns();
					//oTable.clearSelection(); 
					oTable.bindRows(namedModel + rowsModel);
				//	oTable.setSelectionBehavior('RowSelector');
					/*	var tStruc = (sap.ui.getCore().getModel(strucModelName)).oData;
						tStruc.sort(function(a, b){return a.COL_POS - b.COL_POS;});
						tStruc.forEach(addColumnsToDynItensTable);
						oTable.placeAt(that.getView().createId(placeAtId));
						return;*/
				} else if (tableType === "TDI") {
					oTable = new sap.ui.table.Table({
						id: tableId,
						//title: tableTitle,
						showNoData: true,
						columnHeaderHeight: 10,
						visibleRowCount: 4,
						visibleRowCountMode: 'Fixed',
						extension: new sap.m.OverflowToolbar({
							content: [
								//new sap.m.Button().setIcon("sap-icon://pending").setText("Executar Processo").setType("Transparent"),
								//new sap.m.Button().setIcon("sap-icon://cancel").setText("Anular Processo").setType("Transparent"),
								//new sap.m.Button().setIcon("sap-icon://accounting-document-verification").setText("Dados Complementares").setType("Transparent").attachPress(this.onNavToComplementData),
								new sap.m.ToolbarSpacer(),
								//new sap.m.Button().setIcon("sap-icon://ui-notifications").setText("").setType("Transparent"),
								//new sap.m.ToolbarSeparator(),
								new sap.m.Button().setIcon("sap-icon://excel-attachment").setType("Transparent").setTooltip("Exportar Excel").attachPress(
									that.tdiOnExportExcel),
								new sap.m.ToolbarSeparator(),
								new sap.m.Button().setIcon("sap-icon://key-user-settings").setType("Transparent").setTooltip("Editar Layout da Tabela").attachPress(
									that.tdiOnEditLayoutTablePress),
								new sap.m.Button().setIcon("sap-icon://save").setType("Transparent").setTooltip("Gravar variante local").attachPress(that.tdiOnSaveTableVariantPress),
								new sap.m.Button().setIcon("sap-icon://customize").setType("Transparent").setTooltip("Buscar variante local").attachPress(
									that.tdiOnLoadTableVariantPress),
								new sap.m.ToolbarSeparator(),
								new sap.m.Button().setIcon("sap-icon://sys-add").setType("Transparent").setTooltip("Adicionar Item").attachPress(that.tdiOnAddItem),
								new sap.m.Button().setIcon("sap-icon://sys-minus").setType("Transparent").setTooltip("Remover Item").attachPress(that.tdiOnRemoveItem)
							]
						}).addStyleClass("sapMTBHeader-CTX")
					});
					var aFilters = [];
					var oFilter = new sap.ui.model.Filter("LOEKZ", sap.ui.model.FilterOperator.NE, "X");
					aFilters.push(oFilter);
					oTable.bindRows(namedModel + rowsModel, null, null, aFilters);
				}

			} else {
				var oTable = sap.ui.getCore().byId(tableId);
				oTable.destroyColumns();
				oTable.clearSelection();
			}

			var tStruc = (sap.ui.getCore().getModel(strucModelName)).oData;
			if (tStruc instanceof Array) {
				tStruc.sort(function (a, b) {
					return a.COL_POS - b.COL_POS;
				});

				if (tableType === "TDI") {
					tStruc.forEach(addColumnsToDynItensTable);
				} else if (tableType === "VAR") {
					tStruc.forEach(addColumnsToDynItensTableVAR);
				} else {
					tStruc.forEach(addColumnsToDynTable);
				}
			}

			oTable.placeAt(that.getView().createId(placeAtId));
		},
		getDefaultSTRUCIModel: function () {
			var jStruci = [{
				COL_POS: 2,
				CURRENCY: "",
				DATATYPE: "DEC",
				EDIT: "X",
				FIELDNAME: "IEBELN",
				INTLEN: "000009",
				SELTEXT_L: "Pedido de compra",
				SELTEXT_M: "Pedido de compra",
				SELTEXT_S: "Pedido de compra",
				VISIBLE: ""
			}, {
				COL_POS: 4,
				CURRENCY: "",
				DATATYPE: "DEC",
				EDIT: "X",
				FIELDNAME: "LBLNI",
				INTLEN: "000009",
				SELTEXT_L: "Folha de registro",
				SELTEXT_M: "Folha de registro",
				SELTEXT_S: "Folha de registro",
				VISIBLE: ""
			}, {
				COL_POS: 1,
				CURRENCY: "",
				DATATYPE: "DEC",
				EDIT: "X",
				FIELDNAME: "CHAVE",
				INTLEN: "000009",
				SELTEXT_L: "Chave de acesso transportada",
				SELTEXT_M: "Chave de acesso transportada",
				SELTEXT_S: "Chave de acesso transportada",
				VISIBLE: ""
			}, {
				COL_POS: 274,
				CURRENCY: "",
				DATATYPE: "DEC",
				EDIT: "X",
				FIELDNAME: "VGBEL",
				INTLEN: "000009",
				SELTEXT_L: "Valor Total",
				SELTEXT_M: "Valor Total",
				SELTEXT_S: "Valor Total",
				VISIBLE: ""
			}, {
				COL_POS: 5,
				CURRENCY: "",
				DATATYPE: "DEC",
				EDIT: "X",
				FIELDNAME: "MENGE",
				INTLEN: "000009",
				SELTEXT_L: "Quantidade",
				SELTEXT_M: "Quantidade",
				SELTEXT_S: "Quantidade",
				VISIBLE: ""
			}, {
				COL_POS: 3,
				CURRENCY: "",
				DATATYPE: "DEC",
				EDIT: "X",
				FIELDNAME: "EBELP",
				INTLEN: "000009",
				SELTEXT_L: "item Pedido de Compra",
				SELTEXT_M: "item Pedido de Compra",
				SELTEXT_S: "item Pedido de Compra",
				VISIBLE: ""
			}, {
				COL_POS: 274,
				CURRENCY: "",
				DATATYPE: "DEC",
				EDIT: "X",
				FIELDNAME: "IVA",
				INTLEN: "000009",
				SELTEXT_L: "IVA",
				SELTEXT_M: "IVA",
				SELTEXT_S: "IVA",
				VISIBLE: ""
			}];
			return jStruci;
		},
		getHtmlMediaContent: function (type, data) {
			var htmlContent = "";
			//console.log("Tipo: " + type);
			switch (type) {
			case '.PDF':
			case '.pdf':
				htmlContent = '<iframe src="data:application/pdf;base64,' + data + '" height="100%" width="100%" style="border: none;"></iframe>';
				break;
			case '.JPEG':
			case '.jpeg':
			case '.JPG':
			case '.jpg':
			case '.GIF':
			case '.gif':
				htmlContent = '<div><img src="data:application/jpg;base64,' + data + '" /></div>';
				break;
			case '.TXT':
			case '.txt':
				var texto = window.atob(data);
				//	console.log("Texto: " + texto);
				if (texto.startsWith('<')) {
					texto = texto.replaceAll('<', '&lt;');
					texto = texto.replaceAll('&', '&amp;');
				}
				texto = texto.replaceAll(/\n/g, "<br />");
				texto = texto.replaceAll('"', '\"');
				//htmlContent = '<sap.m.TextArea value="' + texto + '" height="100%" growing="true" width="100%"/>';
				htmlContent = '<code height="100%" width="100%">' + texto + '</code>';
				break;
			case '.XML':
			case '.xml':
				var xmlText = window.atob(data);
				if (xmlText.startsWith('<')) {
					xmlText = xmlText.replaceAll('<', '&lt;');
					xmlText = xmlText.replaceAll('&', '&amp;');
				}
				//	console.log("Texto: " + xmlText);
				//texto =  texto.replace(/\n/g, "<br />");
				htmlContent = '<sap.m.TextArea height="100%" growing="true" width="100%" value="' + xmlText + '"/>';
				//htmlContent = '<pre><code height="100%" width="100%">'+xmlText+'</code></pre>';
				break;
			}
			//console.log(htmlContent);
			return htmlContent;
		},
		getProcessFlowModel: function (sProcx, currentActivity, status) {
			var addParam = sap.ui.getCore().getModel("AddPARAM");
			var procObj = null;
			var procFlow = {
				nodes: [],
				lanes: []
			};
			var encontrouAtivi = false;

			var statuDesc = null;
			var statuTPMSG = "";
			try {
				var a0112 = (addParam.oData.VIEWS['0400'].find(function (x) {
					if (x.PROCP == sProcx) return x;
				}))['0112'];
				if (a0112) {
					a0112 = a0112.find(function (x) {
						if (x.STATU == status) return x;
					});
					statuDesc = status + " - " + a0112.DESCR;
					statuTPMSG = a0112.TPMSG;
				}
			} catch (e) {

			}
			//Caso a variável DESC esteja vazia/undefined tenta buscar na variante de status globais
			try {
				if (statuTPMSG === undefined || statuTPMSG === null || statuTPMSG === "") {
					var a0104 = (addParam.oData.VIEWS['0104'].find(function (x) {
						if (x.STATU == status) return x;
					}));
					statuTPMSG = a0104.TPMSG;
				}
			} catch (e) {

			}

			statuDesc = (statuDesc) ? statuDesc : status;
			var statusState = "Neutral";
			var statusText = "OK";

			switch (statuTPMSG) {
			case "E":
				statusState = "Negative";
				statusText = "ERRO";
				break;
			case "W":
				statusState = "Neutral";
				statusText = "ATENÇÃO";
				break;
			case "S":
				statusState = "Positive";
				statusText = "OK";
				break;
			case "I":
				statusState = "Neutral";
				statusText = "INFO";
				break;
			}

			try {
				var countAtivi = 0;
				procObj = addParam.oData.VIEWS['0100'].find(function (x) {
					if (x.PROCX == sProcx) return x;
				});
				procObj['0102'].forEach(function (oValue, i) {
					if (oValue.PRSAP === "1") {
						countAtivi++;
						var eLane = {
							id: i,
							icon: "sap-icon://process",
							label: oValue.DESCR,
							//label: 'teste',
							position: i
						};
						procFlow.lanes.push(eLane);

						if (!encontrouAtivi && (currentActivity !== "00000")) {
							if (oValue.ATIVI === currentActivity) {
								encontrouAtivi = true;
								var eFinalNode = {
									id: i + 1,
									lane: i,
									//title: "Titulo",
									//titleAbbreviation: "Tit",
									title: statuDesc,
									titleAbbreviation: statuDesc,
									children: [],
									state: statusState,
									stateText: statusText,
									focused: false,
									texts: [statuDesc]
								};
								procFlow.nodes.push(eFinalNode);
							} else {
								var eNodes = {
									id: i + 1,
									lane: i,
									//title: "Titulo",
									//titleAbbreviation: "Tit",
									title: oValue.DESCR,
									titleAbbreviation: oValue.DESCR,
									children: [i + 2],
									state: "Positive",
									stateText: "OK Status",
									focused: true,
									texts: [oValue.DESCR]
								};
								procFlow.nodes.push(eNodes);
							}
						}
					}
				});

				if(procFlow.lanes.length === procFlow.nodes.length){
                	var lnode = procFlow.nodes[procFlow.nodes.length - 1];
                	(procFlow.nodes[procFlow.nodes.length - 1]).children = [];
                }
                    
                    
				(procFlow.lanes[procFlow.lanes.length - 1]).icon = "sap-icon://pixelate";

			} catch (e) {

			}

			return procFlow;
		},
		exportToExcel: function (modelToBeExported, modelStruc) {

			var tStruc = (sap.ui.getCore().getModel(modelStruc)).oData;
			var aColumns = [];
			if (tStruc instanceof Array) {
				tStruc.sort(function (a, b) {
					return a.COL_POS - b.COL_POS;
				});
				tStruc.forEach(function (value, index) {
					var vLabel = (value.SELTEXT_S) ? value.SELTEXT_S : value.FIELDNAME;
					var vStruc = {};
					switch (value.DATATYPE) {
					case ("CHAR"):
					case ("NUMC"):
					case ("DEC"):
					case ("TIMS"):
					case ("CURR"):
						vStruc.name = vLabel;
						vStruc.template = {
							content: {
								parts: [value.FIELDNAME],
								formatter: function (value) {
									return "	" + value;
								}
							}
						};
						break;

					case "DATS":
						vStruc.name = vLabel;
						vStruc.template = {
							content: {
								parts: [value.FIELDNAME],
								formatter: function (value) {
									if (value) {
										return value.substring(0, 4) + "-" + value.substring(4, 6) + "-" + value.substring(6, 8);
									}
									return value;
								}
							}
						};
						break;
					default:
						vStruc.name = vLabel;
						vStruc.template = {
							content: value.FIELDNAME
						};

					}
					aColumns.push(vStruc);
				});
			}

			var oExport = new Export({
				exportType: new ExportTypeCSV({
					separatorChar: ";",
					charset: "utf-8"
				}),
				//models : this.getView().getModel("processes"),
				//models : oController.oView.getModel(),
				models: modelToBeExported,

				rows: {
					path: "/Process"
				},
				columns: aColumns

			});

			// download exported file
			oExport.saveFile().catch(function (oError) {
				sap.m.MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function () {
				oExport.destroy();
			});
		},
		
		addSysLogMessage: function(status, page, message){
			var syslogModel = sap.ui.getCore().getModel("SYSLOG");
			if(!syslogModel)
				syslogModel = new JSONModel([]);
			var date = new Date();
			var data = date.getFullYear() + '.' + date.getMonth() + '.' + date.getDate();
			var hora = date.getHours() + ':' + date.getMinutes() + '.' + date.getSeconds();
 			syslogModel.oData.push({DATE: data, TIME: hora, STATUS: status, PAGE: page, MESSAGE: message, STATUSSTATE: sap.ui.core.MessageType.Error})
			sap.ui.getCore().setModel(syslogModel, "SYSLOG");
		},
		
		
		onShowSysLog: function() {
			var syslogModel = sap.ui.getCore().getModel("SYSLOG");
			if(!syslogModel)
				syslogModel = new JSONModel([]);
			this.getView().setModel(syslogModel, "SYSLOG");
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("AddPlatform.view.fragment.popUp.popUpSystemLogs", this);
			}

			this._oDialog.open();
		},
		
		onCloseSysLogs: function(oEvent) {
			var oDialog = oEvent.getSource().getParent();
			oDialog.close();
		}
	};
});