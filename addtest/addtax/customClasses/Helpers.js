class VariantHelper{
    constructor(){
    }
    static _oDialog;

    static openDialogToSave(that, view, type, content){
        return new Promise((resolve, reject) => {
            
            that.getView().setModel(new sap.ui.model.json.JSONModel({"name":""}), 'variant'); 

            VariantHelper._oDialog = new sap.m.Dialog({
                title: "Save Local Variant",
                content: new sap.m.VBox({
                    items:[
                        new sap.m.Label({text:"Variant Name"}),
                        new sap.m.Input({
                            value:"{variant>/name}"
                        })
                    ]
                }),
                beginButton: new sap.m.Button({
                    type: sap.m.ButtonType.Emphasized,
                    text: "Save",
                    press: function () {
                        var variant = that.getView().getModel('variant').oData;
                        let obj = {
                            "view":view, 
                            "type" : type, 
                            "name" :variant.name, 
                            "date" : new Date(),
                            "content" : content
                        }

                        VariantHelper._saveLocalVariants(obj)
                            .then(persisted =>{
                                resolve(persisted);
                            })
                            .catch(err =>{
                               reject(err);
                            })
                            VariantHelper._oDialog.close();
                            VariantHelper._oDialog.destroy();
                    }.bind(that)
                }),
                endButton: new sap.m.Button({
                    text: "Cancel",
                    press: function () {
                        resolve(false);
                        VariantHelper._oDialog.close();
                        VariantHelper._oDialog.destroy();
                    }.bind(that)
                })
            });
            VariantHelper._oDialog.addStyleClass("sapUiContentPadding")
            that.getView().addDependent(VariantHelper._oDialog);
            VariantHelper._oDialog.open();
        });
    }
    
    static openDialogToList(that, view, type){
        return new Promise((resolve, reject) => {

            VariantHelper._listLocalVariants(view, type)
                .then(data =>{
                    that.getView().setModel(new sap.ui.model.json.JSONModel(data), 'variants'); 

                    var oTable = new sap.m.Table({
                        mode : sap.m.ListMode.SingleSelectMaster,
                        fixedLayout: false,     
                        itemPress :  function ( e ) {
                            var item = e.getSource().getSelectedItem();
                            var idx = item.getBindingContextPath();
                            idx = idx.replaceAll('/','');
                            var variants = that.getView().getModel('variants').oData;
                            resolve( variants[idx].content);
                            VariantHelper._oDialog.close(); 
                            VariantHelper._oDialog.destroy();                          
                        }      
                    })
                    oTable.addColumn(new sap.m.Column({header: new sap.m.Label({text:"Name"})} )); 
                    oTable.addColumn(new sap.m.Column({header: new sap.m.Label({text:"Date"})})); 
                    
                    var colItems = new sap.m.ColumnListItem({type:"Active"});
                    colItems.addCell(new sap.m.Text({text:"{variants>name}",width:"200px"}));
                    colItems.addCell(new sap.m.Text({text:"{variants>dateView}",width:"200px"}));
                    oTable.bindAggregation("items","variants>/",colItems);
                    
                    VariantHelper._oDialog = new sap.m.Dialog({
                        title: "Select Local Variant",
                        content: new sap.m.VBox({
                            items:[
                                oTable
                            ]
                        }),
                        endButton: new sap.m.Button({
                            text: "Cancel",
                            press: function () {
                                resolve(null)        
                                VariantHelper._oDialog.close();
                                VariantHelper._oDialog.destroy();
                            }.bind(that)
                        })
                    }); 
                    //that.oVariantDialog.addStyleClass("sapUiContentPadding")
                    that.getView().addDependent(VariantHelper._oDialog);
                    VariantHelper._oDialog.open();
                })
                .catch(err =>{
                    reject(err);
                });
        });
    }
    static getLastUsedVariant(view, type){
        return new Promise((resolve, reject) => {

            VariantHelper._listLocalVariants(view, type)
                .then(data =>{
                    resolve(data[0])
                })
                .catch(err =>{
                    reject(err);
                });
        });
    }
    static _saveLocalVariants(data){
        return new Promise((resolve, reject) => {
            let idb = window.indexedDB.open('addLocalData',1);    
            
            idb.onupgradeneeded = e =>{
                let conn = e.target.result
                if (conn != undefined) {
                    conn.createObjectStore('variants', {autoIncrement: true})
                }
            }

            idb.onsuccess = e =>{
                let conn = e.target.result;
                let transaction = conn.transaction(['variants'], 'readwrite');
                let store = transaction.objectStore('variants');
                let request = store.add(data);
    
                request.onsuccess = e => {
                    resolve(true);
                }
                request.onerror = e => {
                    reject(e.target.error)
                }
            }
            idb.onerror = e =>{
                reject(e.target.error)
            }
        });
    }

    static _listLocalVariants(view, type){
        return new Promise((resolve, reject) => {
            let idb = window.indexedDB.open('addLocalData',1);    
            
            idb.onupgradeneeded = e =>{
                let conn = e.target.result
                if (conn != undefined) {
                    conn.createObjectStore('variants', {autoIncrement: true})
                }
            }

            idb.onsuccess = e =>{
                let conn = e.target.result;
                let transaction = conn.transaction(['variants'], 'readwrite');
                let store = transaction.objectStore('variants');
                let request = store.getAll();
                
                request.onsuccess = e => {
                    let filtered = request.result.filter(data => data.view == view && data.type == type);
                    let maped = filtered.map(item =>{
                        item.dateView = DateHelper.datefullToText(item.date)
                        return item;
                    });
                    let sorted = maped.slice().sort(function(a,b){
                        return new Date(b.date) - new Date(a.date);
                    });
                    resolve(sorted);
                }
                request.onerror = e => {
                    reject(e.target.error)
                }
            }
            idb.onerror = e =>{
                reject(e.target.error)
            }
        });

    }
}

class TableLayoutHelper{
    constructor(){
    }
    
    static _oDialog;

    static openDialog(that, tablestruct){

        return new Promise((resolve, reject) => {
            
            let struc = tablestruct.map((item, i) => {
                let desc = (item.SELTEXT_L) ? item.SELTEXT_L : (item.SELTEXT_M) ? item.SELTEXT_M : item.SELTEXT_S;
                item.index = i;
                item.visible = (item.VISIBLE == "X") ? true: false;
                item.description = (desc) ? item.FIELDNAME +" - "+desc : item.FIELDNAME;
                return item;
            })
           
            var oModel = new sap.ui.model.json.JSONModel(struc);
           
            var oPanel = new sap.m.P13nColumnsPanel({
           /*     changeColumnsItems: function(e){
                    var items = e.getParameter("items")
                    console.log("changeColumnsItems",items)
                }
            */  
            });
            oPanel.bindAggregation("items",{
                path : "tablestruct>/",
                template: new sap.m.P13nItem({
                    columnKey:"{tablestruct>FIELDNAME}",
                    text:"{tablestruct>description}",
                })
            })
            
            oPanel.bindAggregation("columnsItems",{
                path : "tablestruct>/",
                template: new sap.m.P13nColumnsItem({
                    columnKey:"{tablestruct>FIELDNAME}",
                    index:"{tablestruct>index}",
                    visible:"{tablestruct>visible}"
                })
            })
            
            TableLayoutHelper._oDialog = new sap.m.P13nDialog({
                showReset: false,
                panels: oPanel,
                ok: function ( e ) {
                    
                    var struc = TableLayoutHelper._oDialog.getModel('tablestruct').oData;
                    var strucClone = [...struc];
                    
                    var strucSorted = strucClone.sort((a, b) => {
                        if (a.index === undefined){
                            return 0
                        }
                        if (b.index === undefined){
                            return -1
                        }
                        return a.index - b.index
                    });
                    
                    var strucSMapped = strucSorted.map((item, i) =>{
                        item.VISIBLE = (item.visible) ? "X" : "";
                        item.COL_POS = (i + 1)
                        delete item.description
                        delete item.index
                        delete item.visible
                        
                        return item;
                    });

                    resolve(strucSMapped);
                    TableLayoutHelper._oDialog.close();                           
                    TableLayoutHelper._oDialog.destroy();
                },
                cancel:  function ( e ) {
                    resolve(null);
                    TableLayoutHelper._oDialog.close();
                    TableLayoutHelper._oDialog.destroy();
                }
            });

            TableLayoutHelper._oDialog.setModel(oModel, 'tablestruct')
            TableLayoutHelper._oDialog.setContentWidth("500px")
            that.getView().addDependent(TableLayoutHelper._oDialog);
            TableLayoutHelper._oDialog.open();
        });
    }
}

class DateHelper{

    static textToDate(texto){
        if(!/\d{4}-\d{2}-\d{2}/.test(texto)){
            throw new Error('Data formato errado. Correto é yyyy-MM-dd');
        }
        return new Date(texto.split('-'));
    }
    static dateToText(date){
        return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
    }
    static textfullToDate(texto){
        if(texto === undefined){
            return '';
        }
        return new Date(texto);
    }
    static datefullToText(date){
        if(date === undefined || date === null || date === ''){
            return '';
        }
        return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
    }
    static calculateDifferenceText(begin, end){
        if(end === undefined || end === null || end === ''){
            end = new Date();
        }
        let diff = (end-begin)/1000;
        if(diff <= 60){
            return diff.toFixed(0) + ' s';
        }else if(diff > 60 && diff < 3600){
            return (diff/60).toFixed(0) + ' m';
        }else if(diff >= 3600 && diff < 86400){
            return (diff/60/60).toFixed(0) + ' h';
        }else{
            return (diff/60/60/24).toFixed(0) + ' d';
        }
    }
}