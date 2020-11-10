sap.ui.define([], function() {
	"use strict";

	return {

		soapClient: function(interfaceNumber) {

			var request =
				'{"INTERFACE":"00000000001","VIEWS":{"0100":"X","0102":"X","0200":"X","0201":"X","0400":"X","0401":"X","0402":"X","0403":"X","0112":"X","0113":"","0600":"","0104":"","0105":"","0108":""},"SPRAS":"PT","UNAME":"EPADILHA"}';

			var sr =
				"<?xml version='1.0' encoding='utf-8'?>" +
				"<Envelope xmlns='{i18n>URI_SOAP_ENVELOP}'>" +
				"<soapenv:Body>" +
				"<_-addy_-fui50000 xmlns='urn:sap-com:document:sap:soap:functions:mc-style'>" +
				"<Interface xmlns=''>" + interfaceNumber + "</Interface>" +
				"<Request xmlns=''>" + request + "</Request>" +
				"</_-addy_-fui50000>" +
				"</Body>" +
				"</Envelope>";
				
			var req = new XMLHttpRequest();
			req.open("POST", "http:////172.22.0.21:8080//addui5", false);
			req.setRequestHeader("Authorization", this.authenticateUser("EPADILHA", "S1lkr0adoo"));
			req.send(sr);
			// view request status
			jQuery.sap.log.error(req.status);
			jQuery.sap.log.error(req.responseText);

		},
		authenticateUser: function(user, password) {
			var token = user + ":" + password;

			// Should i be encoding this value????? does it matter???
			// Base64 Encoding -> btoa
			var hash = btoa(token);

			return "Basic " + hash;
		},
		taskTypeIcon: function(sStatus) {
			//var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

			switch (sStatus) {
				case "TASK_AUTOMATIC":
					return "sap-icon://action-settings";
				case "TASK_HUMAN":
					return "sap-icon://group";
				default:
					return "sap-icon://sys-help-2";
			}
		},

		taskTypeIconColor: function(sStatus) {
			switch (sStatus) {
				case "TASK_AUTOMATIC":
					return "#9fa9a3";
				case "TASK_HUMAN":
					return "#7B68EE";
				default:
					return "#8c8c8c";
			}
		}
	};
});