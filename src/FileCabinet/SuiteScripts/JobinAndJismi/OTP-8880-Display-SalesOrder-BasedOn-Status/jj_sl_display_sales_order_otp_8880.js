/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
/**********************************************************************************************
************* 
*
*
*
${OTP-8880}:{Custom page for display sales order based on the status}
*
*
**************************************************************************************************
*
*Author:Jobin and Jismi IT Services
*
*Date Created:17-June-2025
*
*Description:This script is designed to create a custom form that displays sales orders requiring 
*fulfillment or billing. It includes a Sublist with multiple columns and filters, such as Status, 
*Subsidiary, Customer, and Department, ensuring that the displayed data dynamically updates based
* on the selected filters. 
*
** REVISION HISTORY
 *
* @version 1.0 17-June-2025 : Created the initial build by JJ0403
****************************************************************************************************
*************/

define(["N/log", "N/record", "N/search", "N/ui/serverWidget"], 
/**
 * @param{log} log
 * @param{record} record
 * @param{search} search
 * @param{serverWidget} serverWidget
 */
(log, record, search, serverWidget) => {

    /**
     * Defines the Suitelet script trigger point.
     * @param {Object} scriptContext
     * @param {ServerRequest} scriptContext.request - Incoming request
     * @param {ServerResponse} scriptContext.response - Suitelet response
     * @since 2015.2
     */
    const onRequest = (scriptContext) => {
        try {
            let SalesOrdform = createForm();
            applyDefaultValues(SalesOrdform, scriptContext);
            populateSublist(SalesOrdform, scriptContext);
            SalesOrdform.addSubmitButton({ label: "Submit" });
            SalesOrdform.addResetButton({label: 'Reset'});
            scriptContext.response.writePage(SalesOrdform);
        } catch (error) {
            log.error("Error loading item record", error);
        }
    };

    /**
     * Creates the main form structure.
     * @returns {serverWidget.Form} - NetSuite form object
     */
    const createForm = () => {
      try {
     
        let SalesOrdform = serverWidget.createForm({
            title: "Sales Orders to Fulfill or Bill",
        });

        SalesOrdform.clientScriptFileId = 1398;

        let OpenStatus = SalesOrdform.addField({
          type: serverWidget.FieldType.SELECT,
          id: "status",
          label: "Status",
        });
        OpenStatus.addSelectOption({
          value: "",
          text: "",
        });
        OpenStatus.addSelectOption({
          value: "SalesOrd:B",
          text: "Pending Fulfillment",
        });
        OpenStatus.addSelectOption({
          value: "SalesOrd:D",
          text: "Partially Fulfilled",
        });
        OpenStatus.addSelectOption({
          value: "SalesOrd:E",
          text: "Pending Billing/Partially Fulfilled",
        });
        OpenStatus.addSelectOption({
          value: "SalesOrd:F",
          text: "Pending Billing",
        });

        SalesOrdform.addField({
            type: serverWidget.FieldType.SELECT,
            id: "subsi",
            label: "Subsidiary",
            source: "subsidiary",
        });

        SalesOrdform.addField({
            type: serverWidget.FieldType.SELECT,
            id: "customers",
            label: "Customer",
            source: "customer",
        });

        SalesOrdform.addField({
            type: serverWidget.FieldType.SELECT,
            id: "depart",
            label: "Department",
            source: "department",
        });

        let sublist = SalesOrdform.addSublist({
            id: "sublistid",
            type: serverWidget.SublistType.INLINEEDITOR,
            label: "Sales orders that need to be fulfilled or billed",
        });
          sublist.addField({
            id: "internal_id",
            type: serverWidget.FieldType.TEXT,
            label: "Internal ID",
          });
          sublist.addField({
            id: "document_number",
            type: serverWidget.FieldType.TEXT,
            label: "Document Number",
          });
          sublist.addField({
            id: "date",
            type: serverWidget.FieldType.TEXT,
            label: "Date",
          });
          sublist.addField({
            id: "status",
            type: serverWidget.FieldType.TEXT,
            label: "Status",
          });
          sublist.addField({
            id: "customer_name",
            type: serverWidget.FieldType.TEXT,
            label: "Customer Name",
          });
          sublist.addField({
            id: "subsidiary",
            type: serverWidget.FieldType.TEXT,
            label: "Subsidiary",
          });
          sublist.addField({
            id: "department",
            type: serverWidget.FieldType.TEXT,
            label: "Department",
          });
          sublist.addField({
            id: "class",
            type: serverWidget.FieldType.TEXT,
            label: "Class",
          });
          sublist.addField({
            id: "subtotal",
            type: serverWidget.FieldType.TEXT,
            label: "subtotal",
          });
          sublist.addField({
            id: "tax",
            type: serverWidget.FieldType.TEXT,
            label: "Tax",
          });
          sublist.addField({
            id: "total",
            type: serverWidget.FieldType.TEXT,
            label: "Total",
          });

        return SalesOrdform;
           
      } catch (error) {
        log.error("Error loading item record", error);
      }
    };

    /**
     * Applies default values to the form fields based on request parameters.
     * @param {serverWidget.Form} form - NetSuite form object
     * @param {Object} scriptContext - Suitelet request context
     */
    const applyDefaultValues = (SalesOrdform, scriptContext) => {
      try{
          let params = scriptContext.request.parameters;
          SalesOrdform.getField({ id: "status" }).defaultValue = params.cust_Status || "";
          SalesOrdform.getField({ id: "subsi" }).defaultValue = params.cust_subsidiary || "";
          SalesOrdform.getField({ id: "customers" }).defaultValue = params.cust_Customer || "";
          SalesOrdform.getField({ id: "depart" }).defaultValue = params.cust_Department || "";
        } catch (error) {
        log.error("Error loading item record", error);
      }
    };

    /**
     * Populates the sublist with search results based on filters.
     * @param {serverWidget.Form} form - NetSuite form object
     * @param {Object} scriptContext - Suitelet request context
     */
    const populateSublist = (SalesOrdform, scriptContext) => {
      try{
          let params = scriptContext.request.parameters;
          let filter = [["mainline", "is", "T"], ];

          if (params.cust_Status) filter.push("AND", ["status", "is", params.cust_Status]);
          if (params.cust_Customer) filter.push("AND", ["customermain.internalid", "anyof", params.cust_Customer]);
          if (params.cust_subsidiary) filter.push("AND", ["subsidiary", "is", params.cust_subsidiary]);
          if (params.cust_Department) filter.push("AND", ["department", "is", params.cust_Department]);

          let searchResults = executeSalesOrderSearch(filter);
          populateSublistWithData(SalesOrdform.getSublist({ id: "sublistid" }), searchResults);
        } catch (error) {
        log.error("Error loading item record", error);
      }
    };

    /**
     * Executes a saved search for sales orders based on filters.
     * @param {Array} filter - Search filter criteria
     * @returns {Array} - Search results
     */
    const executeSalesOrderSearch = (filter) => {
      try{
        return search.create({
            title: "Sales Orders to Fulfill or Bill JJ",
            id: "customsearch_jj_salesord_to_fulfill",
            type: "salesorder",
            filters: filter,
            columns: [
                { name: "internalid", label: "Internal ID" },
                { name: "tranid", label: "Document Number" },
                { name: "trandate", label: "Date" },
                { name: "statusref", label: "Status" },
                { name: "entityid", join: "customerMain", label: "Customer Name" },
                { name: "subsidiary", label: "Subsidiary" },
                { name: "department", label: "Department" },
                { name: "saleschannel", label: "Class" },
                {
                name: "formulanumeric",
                formula:
                  "NVL2({taxtotal},{fxamount} - {taxtotal}/{currency.exchangerate},{fxamount})",
                label: "Subtotal",
                },
                { name: "taxtotal", label: "Tax" },
                {name: "total", label: "Total"},
            ].map(col => search.createColumn(col)),
        }).run().getRange({ start: 0, end: 1000 });
      } catch (error) {
        log.error("Error loading item record", error);
      }
    };

    /**
     * Populates the sublist with retrieved search results.
     * @param {serverWidget.Sublist} sublist - Sublist object
     * @param {Array} searchResults - Array of search result objects
     */
    const populateSublistWithData = (sublist, searchResults) => {
      try{
        searchResults.forEach((result, index) => {
            sublist.setSublistValue({ id: "internal_id", line: index, value: result.getValue("internalid") || "No Value" });
            sublist.setSublistValue({ id: "document_number", line: index, value: result.getValue("tranid") || "No Value" });
            sublist.setSublistValue({ id: "date", line: index, value: result.getValue("trandate") || "No Value" });
            sublist.setSublistValue({ id: "status", line: index, value: result.getValue("statusref") || "No Value" });
            sublist.setSublistValue({id: "customer_name",line: index, value: result.getValue({ name: "entityid", join: "customerMain" }) || "No Value"});
            sublist.setSublistValue({id: "subsidiary",line: index, value: result.getText("subsidiary") || "No Value",});
            sublist.setSublistValue({id: "department",line: index,value: result.getText("department") || "No Value",});
            sublist.setSublistValue({id: "class",line: index,value: result.getValue("saleschannel") || "No Value",});
            sublist.setSublistValue({id: "subtotal",line: index,value:Number(result.getValue({ name: "formulanumeric" })).toFixed(2)||'No Value'
            });
            sublist.setSublistValue({id: "tax",line: index,value: result.getValue("taxtotal") || "No Value",});
            sublist.setSublistValue({id: "total",line: index,value: result.getValue("total") || "No Value",});
        });
        } catch (error) {
        log.error("Error loading item record", error);
      }
    };

    return { onRequest };
});
