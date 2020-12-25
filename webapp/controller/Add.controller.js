sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment"
], function(Controller,JSONModel, MessageToast, Fragment) {
	"use strict";

	return Controller.extend("tcs.fin.ap.controller.Add", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf tcs.fin.ap.view.Add
		 */
		onInit: function() {
			var oModel = new JSONModel({
						"product": {
							"PRODUCT_ID": "",
							"TYPE_CODE": "PR",
							"CATEGORY": "Notebooks",
							"NAME": "",
							"DESCRIPTION": "",
							"SUPPLIER_ID": "0100000046",
							"SUPPLIER_NAME": "SAP",
							"TAX_TARIF_CODE": "1",
							"PRICE": "9000",
							"CURRENCY_CODE": "USD"
						}
					});
			this.getView().setModel(oModel, "local");
		},
		onSave: function(){
			//Step 1: get the value from UI, Prepare the payload
			var productData = this.getView().getModel("local").getProperty("/product");
			//Step 2: call odata service to post data to backend
			var oDataModel = this.getView().getModel();
			oDataModel.create("/ProductSet", productData, {
				success: function(){
					MessageToast.show("Roger!! mission accomplished");
				},
				error: function(){
					MessageToast.show("Abort!");
				}
			});
			//Step 3: Call back handling for odata POST call
		},
		oValueHelp: null,
		venu: "",
		onConfirm: function(oEvent){
			var oField = sap.ui.getCore().byId(this.venu)	;
			oField.setValue(oEvent.getParameter("selectedItem").getLabel());
			this.getView().byId("mazaaavigiyo").setText(oEvent.getParameter("selectedItem").getValue());
		},
		onSuppReq: function(oEvent){
			var that = this;
			this.venu = oEvent.getSource().getId();
			if(!this.oValueHelp){
				Fragment.load({
					id: this.getView().getId(),
					name: 'tcs.fin.ap.fragments.popup',
					controller: this
				}).then(function(oDialog){
					that.oValueHelp = oDialog;
					that.oValueHelp.bindAggregation("items",{
						path: "/SupplierSet",
						template: new sap.m.DisplayListItem({
							label: "{BP_ID}",
							value: "{COMPANY_NAME}"
						})
					});
					that.oValueHelp.setTitle("Select Supplier");
					that.getView().addDependent(that.oValueHelp);
					that.oValueHelp.setMultiSelect(false);
					that.oValueHelp.open();	
				});
			}else{
				this.oValueHelp.open();
			}
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf tcs.fin.ap.view.Add
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf tcs.fin.ap.view.Add
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf tcs.fin.ap.view.Add
		 */
		//	onExit: function() {
		//
		//	}

	});

});