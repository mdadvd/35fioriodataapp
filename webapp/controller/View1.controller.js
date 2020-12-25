sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"tcs/fin/ap/util/formatter",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/ui/layout/form/SimpleForm",
	"sap/m/Text",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/Button",
	"sap/m/MessageBox"
], function(Controller, Formatter, MessageToast, JSONModel, Dialog, SimpleForm, Text, Label, Input, Button, MessageBox) {
	"use strict";

	return Controller.extend("tcs.fin.ap.controller.View1", {
		formatter: Formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf tcs.fin.ap.view.View1
		 */
		onInit: function() {
			//get the router object from Component.js
			this.oRouter = this.getOwnerComponent().getRouter();	
			var oModel = this.getOwnerComponent().getModel();
			oModel.attachRequestFailed(this.errorHandler, this);
			var oModel = new JSONModel({
				"product": {
					"PRODUCT_ID": "",
					"TYPE_CODE": "",
					"CATEGORY": "",
					"NAME": "",
					"DESCRIPTION": "",
					"SUPPLIER_ID": "",
					"SUPPLIER_NAME": "",
					"TAX_TARIF_CODE": " ",
					"PRICE": "",
					"CURRENCY_CODE": ""
				}
			});
			this.getView().setModel(oModel, "local");
		},
		onProductRequest: function(oEvent){
			//step 1: get the odata model object 
			var oSource = oEvent.getSource();
			var oDataModel = this.getView().getModel();
			//Step 2: read value from screen and construct the path for firing call
			var productId = this.getView().getModel("local").getProperty("/product/PRODUCT_ID");
			if(productId === " "){
				MessageBox.error("Please enter a valid product id");
				return;
			}
			var sPath = "/ProductSet('" + productId + "')";
			//step 3: call the READ method to read single product
			var that = this;
			oDataModel.read(sPath,{
				//Step 4: handle the success and error call backs
				success: function(data)	{
					that.getView().getModel("local").setProperty("/product", data);
					oSource.setValueState("None");
				},
				error: function(oError){
					debugger;
					oSource.setValueState("Error");
					MessageBox.error(JSON.parse(oError.responseText).error.innererror.errordetails[0].message);
				}
			});
		},
		onAdd: function(){
			this.getOwnerComponent().getRouter().navTo("add");
		},
		onMostExpRequest: function (oEvent) {
			//step 1: get the odata model object 
			var oSource = oEvent.getSource();
			var oDataModel = this.getView().getModel();
			//Step 2: read value from screen and construct the path for firing call
			var category = this.getView().getModel("local").getProperty("/product/CATEGORY");
			if(category === " "){
				MessageBox.error("Please enter a valid Category");
				return;
			}
			var that = this;
			debugger;

			// oDataModel.callFunction("/GetMostExpensiveProduct",{
			// 	urlParameters: {
			// 		"I_CATEGORY": category
			// 	},
			// 	success: function(data){
			// 		that.getView().getModel("local").setProperty("/product", data);
			// 	}
			
			oDataModel.callFunction("/GetMostExpensiveProduct",{
				urlParameters: {
					"I_CATEGORY" : category
				},
				success : function(data) {
					that.getView().getModel("local").setProperty("/product", data);
				},
				error: function(oError){
					// debugger;
					oSource.setValueState("Error");
					MessageBox.error(JSON.parse(oError.responseText).error.innererror.errordetails[0].message);
				}				
			});
			/*var sPath = "/ProductSet('" + productId + "')";
			//step 3: call the READ method to read single product
			var that = this;
			oDataModel.read(sPath,{
				//Step 4: handle the success and error call backs
				success: function(data)	{
					that.getView().getModel("local").setProperty("/product", data);
					oSource.setValueState("None");
				},
				error: function(oError){
					debugger;
					oSource.setValueState("Error");
					MessageBox.error(JSON.parse(oError.responseText).error.innererror.errordetails[0].message);
				}
			});			*/
		},
		onLaunch: function(){
			if (!this.oDefaultDialog) {
				this.oDefaultDialog = new Dialog({
					title: "Search Product",
					content: new SimpleForm({
						content: [
							new Label({text: "Category"}),
							new Input({id: "mip", value: "{local>/product/CATEGORY}",
									   change: [this.onMostExpRequest, this]
							}),							
							new Label({text: "Product Id"}),
							new Input({id: "pid", value: "{local>/product/PRODUCT_ID}",
									   change: [this.onProductRequest, this]
							}),
							new Label({text: "Name"}),
							new Text({text: "{local>/product/NAME}"}),
							new Label({text: "Price"}),
							new Text({text: "{local>/product/PRICE}"}),
							new Label({text: "Currency"}),
							new Text({text: "{local>/product/CURRENCY_CODE}"})
						]
					}),
					beginButton: new Button({
						type: "Emphasized",
						text: "OK",
						press: function () {
							this.oDefaultDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Close",
						press: function () {
							this.oDefaultDialog.close();
						}.bind(this)
					})
				});
	
				// to get access to the controller's model
				this.getView().addDependent(this.oDefaultDialog);
			}

			this.oDefaultDialog.open();	
		},
		errorHandler: function(oerr){
			debugger;
			var resXML = oerr.getParameter("response").responseText;
			var parser = new DOMParser();
			var xmlDoc = parser.parseFromString(resXML,"text/xml");
			var msgText =  xmlDoc.getElementsByTagName("message")[0].childNodes[0].nodeValue;
			MessageToast.show(msgText);
		},
		onItemSelect: function(oEvent){
			var oSelectedItem = oEvent.getParameter("listItem");
			var sTitle = oSelectedItem.getTitle();
			this.onNext(sTitle);	
		},
		oRouter: null,
		onSelectChange: function(oEvent){
			var oList = oEvent.getSource();
			// var aItems = oList.getSelectedItems();
			// for (var i=0; i<aItems.length; i++) {
			// 	console.log(aItems[i].getTitle());
			// }
			//Technique 1: to send data but can only send FIELD by FIELD
			//if we have 100 fields, we will have 100 lines of code and multiply
			// var sTitle = oList.getSelectedItem().getTitle();
			// this.onNext(sTitle);
			
			//Technique 2: Bind the complete View 2 with the element selected
			// --> /fruits/2 -- {name: '', color: '', ....}
			var sPath = oList.getSelectedItem().getBindingContextPath();
			var sIndex = sPath.split("/")[sPath.split("/").length - 1];
			this.onNext(sIndex);
			// var oView2 = this.getView().getParent().getParent().getDetailPages()[1];
			// oView2.bindElement(sPath);
			
		},
		onSearch: function(oEvent){
			//Step 1: get the value entered by user on screen
			var sSearchValue = oEvent.getParameter("query");
			if(!sSearchValue){
				sSearchValue = oEvent.getParameter("newValue");
			}
			var oFilter = {};
			if(sSearchValue.indexOf("-") !== -1){
				oFilter = new sap.ui.model.Filter("PRODUCT_ID", sap.ui.model.FilterOperator.EQ, sSearchValue);	
			}else{
				//Step 2: prepare a filter object - 2 operands and 1 operator
				oFilter = new sap.ui.model.Filter("CATEGORY", sap.ui.model.FilterOperator.EQ, sSearchValue);	
			}
			// var oFilter2 = new sap.ui.model.Filter("type", sap.ui.model.FilterOperator.Contains, sSearchValue);
			// var aFilter = [oFilter, oFilter2];
			// var oFilterFinal = new sap.ui.model.Filter({
			// 	filters: aFilter,
			// 	and: false
			// });
			//Step 3: get the control on which filter needs to be applied (List)
			var oList = this.getView().byId("idList");
			//step 4: Inject the filter into the binding of list
			oList.getBinding("items").filter([oFilter]);
		},
		onNext: function(sIndex){
			// WHO IS RESPONSIBLE FOR NAVIGATION
			this.oRouter.navTo("detail",{
				productId: sIndex
			});
			//Step 1: Get The Container object for this view
			//Now it is Split App Container Object
			// var oParent = this.getView().getParent().getParent();
			
			// //Step 2: go to view 1 from parent
			// var oView2 = oParent.getDetailPages()[1];
			// //Step 3: get the child of the view1 (viz. search field )
			// var oPage = oView2.getContent()[0];
			// //Step 4: get the value
			// oPage.setTitle(sTitle);
			
			// //Step 2: use that to navigate to second view
			// oParent.toDetail("idView2");
		}
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf tcs.fin.ap.view.View1
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf tcs.fin.ap.view.View1
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf tcs.fin.ap.view.View1
		 */
		//	onExit: function() {
		//
		//	}

	});

});