sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/NumberFormat",
    "sap/base/strings/formatMessage",
    /*	"sap/ui/core/message/Message",
    	"sap/ui/core/library",*/
    "sap/base/Log",
    "../add/Status",
    "../add/AddFormatter",
    "../add/AddUtilitiesWeb"
], function(Controller, JSONModel, NumberFormat, formatMessage, Log, Status, formatter, AddUtilitiesWeb) {
    "use strict";

    var that = "";
    return Controller.extend("AddPlatform.controller.Status", {

        formatter: formatter,

        onInit: function() {

            that = this;

            var req =
                '{"INTERFACE": "0000000004","SELECT": {"TABLE": "/ADD/TP0100","FIELDS": "*","WHERE": "ATIVO IN S_ATIVO"},"SPRAS": "PT"}';
            this.fromSAPECC(req, "PROCX");

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

            that._currentModel = modelName;

            return oItem;
        },
        onSelectionChangeSTATUS: function(oEvent) {

            var oItem = that.setSelectedIndex(oEvent, "STATUS");
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

            var table = "";
            var where = "STATU IN S_STATU";
            var screen = '"SCREEN":';

            if (procx !== "00000") {
                screen = screen + '{"S_PROCX":[{"SIGN":"I","OPTION":"EQ","LOW":"' + procx + '"}]}';
                table = "/ADD/TP0112";
                where = where + " AND PROCP IN S_PROCX";
            } else {
                table = "/ADD/TP0104";
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
            this.handleAction(oEvent, "STATUS");
        },
        handleChangeProcxVARIA: function(oEvent) {

            var index = this._getSelectedIndex(oEvent.getParameters().id);
            var oSELECTED = oEvent.oSource.mBindingInfos.tooltip.binding.oModel.oData.ALV[index];
            sap.ui.getCore().setModel(new JSONModel(oSELECTED), "PARAMSELECTED");

            this.handleAction(oEvent, "PARAM");

        },
        callBackForResult: function(sapResponse, that) {
            var mPage2 = that.byId("IdPage");
            var oModel = new JSONModel(JSON.parse(window.atob(sapResponse)));
            var modelName = that._currentModel;

            that.destroyParam(modelName);

            if (modelName === "STATUS") {

                var sModel = JSON.stringify(oModel.oData);
                //	sModel = sModel.replace("ALV", "Process");
                var oModel = new JSONModel();
                oModel.setData(JSON.parse(sModel));
                var oView = that.getView();

                oView.setModel(oModel, modelName);
                sap.ui.getCore().setModel(oModel, modelName);

                var oStrucModel = new JSONModel(oModel.oData.STRUC);
                sap.ui.getCore().setModel(oStrucModel, "AddStruc" + modelName);
                Status.addDynTable(that, "IdTable" + modelName, "Id" + modelName, modelName, "/ALV", "AddStruc" + modelName, "VAR");

            } else if (modelName !== "") {

                if (modelName === "PROCX") {
                    var nObject = {
                        PROCX: "00000",
                        DESCR: "Global"
                    };

                    oModel.oData.ALV.push(nObject);
                }

                that.getView().setModel(oModel, modelName);

                that.destroyParam("STATUS");

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