sap.ui.define([
	"sap/ui/core/UIComponent",
	"./model/models",
	"sap/ui/model/json/JSONModel"
], function(UIComponent, models, JSONModel) {
	"use strict";

	return UIComponent.extend("AddPlatform", {
		
		metadata: {
			manifest: "json",
		    config: { fullWidth: true } 
		},
		
	
		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			// create the views based on the url/hash
			this.getRouter().initialize();
		},
		createContent: function() {
			// create root view
			return sap.ui.view("AppView", {
				viewName: "AddPlatform.view.App",
				type: "XML"
			});
		}
	});
});