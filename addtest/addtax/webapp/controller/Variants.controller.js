sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/NumberFormat",
    "sap/base/strings/formatMessage",
    "sap/base/Log",
    "../add/Variants",
    "../add/AddFormatter",
    "../add/AddUtilitiesWeb"
], function(Controller, JSONModel, NumberFormat, formatMessage, Log, Variants, formatter, AddUtilitiesWeb) {
    "use strict";

    var that = "";
    return Controller.extend("AddPlatform.controller.Variants", {

        formatter: formatter,

        onInit: function() {

            that = this;
            var req =
                '{"INTERFACE": "0000000004","SELECT": {"TABLE": "/ADD/TP0100","FIELDS": "*","WHERE": "ATIVO IN S_ATIVO"},"SPRAS": "PT"}';
            this.fromSAPECC(req, "PROCX");

        },
        onSelectionChangeVPARA: function(oEvent) {

            that.setSelectedIndex(oEvent, "VPARA");

        },
        getSelectedIndex: function(modelName) {
            ///////////////////////////////////////////////////////////////////
            //
            // retorna indice selecionado
            //
            ///////////////////////////////////////////////////////////////////	
            let oModel = sap.ui.getCore().getModel(modelName);

            let oSELECTED = sap.ui.getCore().getModel(modelName + "SELECTED").oData;

            return oSELECTED._index;

        },
        setSelectedIndex: function(oEvent, modelName) {
            ///////////////////////////////////////////////////////////////////
            //
            // armazena índice e linha selecionada 
            //
            ///////////////////////////////////////////////////////////////////			
            let iSelectedIndex = oEvent.mParameters.rowIndex;

            let oTable = sap.ui.getCore().byId("IdTable" + modelName);

            let oItem = oTable.getContextByIndex(iSelectedIndex).getObject();

            oItem._INDEX = iSelectedIndex;

            sap.ui.getCore().setModel(new JSONModel(oItem), modelName + "SELECTED");

            return oItem;
        },
        onSelectionChangePARAM: function(oEvent) {

            var oItem = that.setSelectedIndex(oEvent, "PARAM");

            var procx = that.byId("IdPROCX");
            if (procx) {
                procx = procx.getSelectedKey();
            }

            var varia = oItem.VARIA;
            var param = oItem.PARAM;
            var table = "";
            var where = "VARIA IN S_VARIA AND PARAM IN S_PARAM";
            var screen = '"SCREEN":{"S_PARAM":[{"SIGN":"I","OPTION":"EQ","LOW":"' + oItem.PARAM + '"}]}';

            if (procx !== undefined && procx !== '00000') {

                screen = screen + ',{"S_PROCX":[{"SIGN":"I","OPTION":"EQ","LOW":"' + oItem.PROCX + '"}]}';
                screen = screen + ',{"S_VARIA":[{"SIGN":"I","OPTION":"EQ","LOW":"' + oItem.VARIA + '"}]}';
                if (oItem.PARKY) {
                    screen = screen + ',{"S_PARKY":[{"SIGN":"I","OPTION":"EQ","LOW":"' + oItem.PARKY + '"}]}';
                }
                if (oItem.PARV0) {
                    screen = screen + ',{"S_PARV0":[{"SIGN":"I","OPTION":"EQ","LOW":"' + oItem.PARV0 + '"}]}';
                }
                if (oItem.PARV1) {
                    screen = screen + ',{"S_PARV1":[{"SIGN":"I","OPTION":"EQ","LOW":"' + oItem.PARV1 + '"}]}';
                }

                where = where + " AND PROCX IN S_PROCX";
                where = where + " AND PARKY IN S_PARKY";
                where = where + " AND PARV0 IN S_PARV0";
                where = where + " AND PARV1 IN S_PARV1";

                table = "/ADD/TP0107";

            } else {
                screen = screen + ',{"S_VARIA":[{"SIGN":"I","OPTION":"EQ","LOW":"' + varia + '"}]}';
                table = "/ADD/TP0114";
            }

            var req = '{"INTERFACE":"0000000009",' + screen + ',"SELECT":{"TABLE":"' + table +
                '","FIELDS":"*","WHERE":"' + where + '"},"SPRAS":"PT","UNAME":"EPADILHA"}';
            that.fromSAPECC(req, "VPARA");

        },
        _getSelectedIndex: function(id) {
            var indexOf_ = id.lastIndexOf("-");
            var num = id.substring(indexOf_ + 1, id.length);
            return Number(num);
        },
        handleAction: function(oEvent, modelName) {

            var mPage = this.byId("IdPage");
            mPage.setBusy(true);

            var procx = this.byId("IdPROCX");
            procx = procx.getSelectedKey();

            var oItem = oEvent.getParameter("listItem") || oEvent.getSource();
            var varia = oItem.mAggregations.tooltip;

            var table = "";
            var where = "VARIA IN S_VARIA";
            var screen = '"SCREEN":';
            if (procx !== "00000") {
                screen = screen + '{"S_PROCX":[{"SIGN":"I","OPTION":"EQ","LOW":"' + procx + '"}]}';
                if (varia) {
                    screen = screen + ',{"S_VARIA":[{"SIGN":"I","OPTION":"EQ","LOW":"' + varia + '"}]}'
                    table = "/ADD/TP0106";
                } else {
                    screen = screen + '';
                    table = "/ADD/TP0105";
                }

                where = where + " AND PROCX IN S_PROCX";
            } else {
                if (varia) {
                    screen = screen + '{"S_VARIA":[{"SIGN":"I","OPTION":"EQ","LOW":"' + varia + '"}]}'
                    table = "/ADD/TP0109";
                } else {
                    table = "/ADD/TP0108";
                    screen = screen + '""';
                }

            }

            var req = '{"INTERFACE":"0000000009",' + screen + ',"SELECT":{"TABLE":"' + table +
                '","FIELDS":"*","WHERE":"' + where + '"},"SPRAS":"PT","UNAME":"EPADILHA"}';
            this.fromSAPECC(req, modelName);

        },
        getGlobalVariants: function() {
            var req =
                '{"INTERFACE": "0000000009","SELECT": {"TABLE": "/ADD/TP0108","FIELDS": "*","WHERE": "VARIA IN S_VARIA AND ATIVO IN S_ATIVO"},"SPRAS": "PT"}';
            this.fromSAPECC(req, "VARIA");
        },
        handleChangePROCX: function(oEvent) {
            this.handleAction(oEvent, "VARIA");
        },
        handleChangeProcxVARIA: function(oEvent) {

            var index = this._getSelectedIndex(oEvent.getParameters().id);
            var oSELECTED = oEvent.oSource.mBindingInfos.tooltip.binding.oModel.oData.ALV[index];
            sap.ui.getCore().setModel(new JSONModel(oSELECTED), "PARAMSELECTED");

            this.destroyParam("VPARA");

            this.handleAction(oEvent, "PARAM");

        },
        handleActionPressPARAM: function(oEvent) {

            this.handleAction(oEvent, "VPARA");
        },
        select0106: function() {
            /*this.handleActionPress.bind(this);
            alert("Click") */
        },
        callBackForResult: function(sapResponse, that) {

            var mPage2 = that.byId("IdPage");
            var oModel = new JSONModel(JSON.parse(window.atob(sapResponse)));
            var modelName = that._currentModel;

            that.destroyParam(modelName);

            if (modelName === "PARAM" || modelName === "VPARA") {

                var sModel = JSON.stringify(oModel.oData);
                //	sModel = sModel.replace("ALV", "Process");
                var oModel = new JSONModel();
                oModel.setData(JSON.parse(sModel));
                var oView = that.getView();

                oView.setModel(oModel, modelName);
                sap.ui.getCore().setModel(oModel, modelName);

                var oStrucModel = new JSONModel(oModel.oData.STRUC);
                sap.ui.getCore().setModel(oStrucModel, "AddStruc" + modelName);
                Variants.addDynTable(that, "IdTable" + modelName, "Id" + modelName, modelName, "/ALV", "AddStruc" + modelName, "VAR");

            } else if (modelName !== "") {

                if (modelName === "PROCX") {
                    var nObject = {
                        PROCX: "00000",
                        DESCR: "Global"
                    };

                    oModel.oData.ALV.push(nObject);
                }

                that.getView().setModel(oModel, modelName);

                that.destroyParam("PARAM");
                that.destroyParam("VPARA");

            }
            mPage2.setBusy(false);
        },
        callBackForErrorResult: function(sapResponse, that) {
            var mPage = that.byId("IdPage");
            mPage.setBusy(false);

            var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
            var oMessageManager = sap.ui.getCore().getMessageManager();

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
        fromSAPECC: function(req, modelName) {
            "use strict";
            this._currentModel = modelName;
            AddUtilitiesWeb.callAddtaxSAP(req, this.callBackForResult, this.callBackForErrorResult, this);

        },
        destroyParam: function(modelName) {
            var oPARAM = sap.ui.getCore().byId("IdTable" + modelName);
            if (oPARAM) {
                oPARAM.destroy();
            }
        },
        onNavBack: function() {
            this.getRouter().navTo("backToStartPage");
        },
        getRouter: function() {
            return this.getOwnerComponent().getRouter();
        },
        onSaveTableVariantPress: function() {
            var viewName = oController.getView().getProperty("viewName");
            var content = (sap.ui.getCore().getModel("AddStruc")).oData;
            VariantHelper.openDialogToSave(oController, viewName, 'table', content)
                .then(persisted => {
                    console.log("Gravou variante: ", persisted);
                })
                .catch(err => {
                    console.log("Erro ao gravar variante local: ", err);
                });
        },
        onLoadTableVariantPress: function() {
            var viewName = oController.getView().getProperty("viewName");

            VariantHelper.openDialogToList(oController, viewName, 'table')
                .then(data => {
                    sap.ui.getCore().setModel(new JSONModel(data), "AddStruc");
                    oController.setTable();
                })
                .catch(err => {
                    console.log("Erro ao listar variante local: ", err);
                });
        },
        onEditLayoutTablePress: function(eEvent) {
            //var coreModel = sap.ui.getCore().getModel("CoreNodeAddModel");
            //var struct = coreModel.oData.oData.STRUC;
            var struct = (sap.ui.getCore().getModel("AddStruc")).oData;
            //var struct = TableStruct();

            TableLayoutHelper.openDialog(oController, struct)
                .then(data => {
                    console.log("Table Layout success: ", data);
                    oController._columns = data;
                    sap.ui.getCore().setModel(new JSONModel(data), "AddStruc");
                    oController.setTable();
                })
                .catch(err => {
                    console.log("Table Layout s error: ", err);
                });
        },
        onExportExcel: function(oEvent) {
            Variants.exportToExcel(oController.oView.getModel(), "AddStruc");
        },
        onExit: function() {
            this.destroy();
        }
    })
})