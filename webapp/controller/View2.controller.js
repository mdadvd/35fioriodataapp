sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Controller, MessageBox, MessageToast, Fragment, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("tcs.fin.ap.controller.View2", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf tcs.fin.ap.view.View2
		 */
		onInit: function() {
			this.oRouter = this.getOwnerComponent().getRouter();
			//this.oRouter.attachRoutePatternMatched(this.herculis, this);
			this.oRouter.getRoute("detail").attachMatched(this.herculis, this);
		},
		onDelete: function(){
			//step 1: ask confirmation if they want to really delete
			var that = this;
			MessageBox.confirm("Are you sure to delete?",{
				title: "confirmation",
				onClose: function(confirmation){
					if(confirmation === "OK"){
						//step 2: fire call to backend to delete the product
						var oDataModel = that.getView().getModel();
						oDataModel.remove(that.navya,{
							success: function(){
								MessageToast.show("The player is out of the game");
							}
						});
					}
				}
			});
			
			
		},
		navya : "",
		herculis: function(oEvent){
			var productId = oEvent.getParameter("arguments").productId;
			var sPath = "/" + productId;
			this.navya = sPath;
			debugger;
			this.imagePath = this.getOwnerComponent().getManifest()["sap.app"].dataSources.ZSEP_ODATA_SRV.uri + productId + "/$value";
			this.getView().byId("zkas").setSrc(this.imagePath);
			
			var that = this;
			//  --> /ProductSet('HT-1000')
			this.getView().bindElement(sPath, {
					expand: 'ToSupplier'
				}
			);
		},
		onClick: function(){
			//MessageToast.show("it was just a test");
			this.oSuppDialog.open();
		},
		venu: null,
		onValueHelp: function(oEvent){
			var that = this;
			this.venu = oEvent.getSource().getId();
			if(!this.oValueHelp){
				Fragment.load({
					id: 'city',
					name: 'tcs.fin.ap.fragments.popup',
					controller: this
				}).then(function(oDialog){
					that.oValueHelp = oDialog;
					that.oValueHelp.bindAggregation("items",{
						path: "/cities",
						template: new sap.m.DisplayListItem({
							label: "{name}",
							value: "{famousFor}"
						})
					});
					that.oValueHelp.setTitle("Cities");
					that.getView().addDependent(that.oValueHelp);
					that.oValueHelp.setMultiSelect(false);
					that.oValueHelp.open();	
				});
			}else{
				this.oValueHelp.open();
			}
		},
		onSearch: function(oEvent){
			//var oDialog = oEvent.getSource();
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("name", FilterOperator.Contains, sValue);
			this.oSuppDialog.getBinding("items").filter([oFilter]);
		},
		onConfirm: function(oEvent){
			//Step 1: read the selectedItem object
			var oSelectedItem = oEvent.getParameter("selectedItem");
			//Step 2: Create a filter object
			var sTitle = oSelectedItem.getLabel();
			debugger;
			var popupname = oEvent.getSource().getTitle();
			if(popupname === "Cities"){
				sap.ui.getCore().byId(this.venu).setValue(sTitle);
			}else{
				var aSelectedItems = oEvent.getParameter("selectedItems");
				var aFilter = [];
				
				for (var i=0; i<aSelectedItems.length; i++) {
					var sTitle = aSelectedItems[i].getLabel();
					var oFilter = new Filter("name", FilterOperator.EQ, sTitle);
					aFilter.push(oFilter);
				}
				var oFilterMain = new Filter({
					filters : aFilter,
					and: false
				});
				//Step 3: inject the object inside the table as a filter
				this.getView().byId("idSupp").getBinding("items").filter(oFilterMain);	
			}
		},
		oValueHelp: null,
		oSuppDialog: null,
		onFilter: function(){
			var that = this;
			if(!this.oSuppDialog){
				Fragment.load({
					id: 'supplier',
					name: 'tcs.fin.ap.fragments.popup',
					controller: this
				}).then(function(oDialog){
					that.oSuppDialog = oDialog;
					that.oSuppDialog.bindAggregation("items",{
						path: "/suppliers",
						template: new sap.m.DisplayListItem({
							label: "{name}",
							value: "{city}"
						})
					});
					that.oSuppDialog.setTitle("Suppliers");
					that.getView().addDependent(that.oSuppDialog);
					that.oSuppDialog.open();	
				});
			}else{
				this.oSuppDialog.open();
			}
			
		},
		onBack: function(){
			//Step 1: Get The Container object for this view
			//var oParent = this.getView().getParent();
			//Step 2: use that to navigate to second view
			//oParent.to("idView1");
			this.oRouter.navTo("master");
		},
		onSave: function(){
			
			// //Step 1: we need to access the object of parent
			// var oAppCon = this.getView().getParent();
			// //Step 2: go to view 1 from parent
			// var oView1 = oAppCon.getPages()[0];
			// //Step 3: get the child of the view1 (viz. search field )
			// var oSearch = oView1.byId("idSearch");
			// //Step 4: get the value
			// var sValue = oSearch.getValue();
			var that = this;
			MessageBox.confirm("Hey dude! shall i save? ",{
				title: "Maza Aavigiyo",
				onClose: function(status){
					if(status === "OK"){
						var payload  = {
							"PRODUCT_ID": "HT-1000",
							"NAME": that.getView().byId("prodname").getValue(),
							"DESCRIPTION": that.getView().byId("proddesc").getValue()
						};
						var oDataModel = that.getView().getModel();
						oDataModel.update(that.navya, payload,{
							success: function(){
								MessageToast.show("Product has been changed Roger!!");		
							}
						});
					}else{
						MessageBox.error("You break my heart :(");
					}
				}
			});
		}
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf tcs.fin.ap.view.View2
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf tcs.fin.ap.view.View2
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf tcs.fin.ap.view.View2
		 */
		//	onExit: function() {
		//
		//	}

	});

});