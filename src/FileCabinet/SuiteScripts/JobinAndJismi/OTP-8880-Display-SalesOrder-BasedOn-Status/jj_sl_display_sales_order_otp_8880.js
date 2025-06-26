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
          id: "custpage_statuses",
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
            id: "custpage_subsi",
            label: "Subsidiary",
            source: "subsidiary",
        });

        SalesOrdform.addField({
            type: serverWidget.FieldType.SELECT,
            id: "custpage_customers",
            label: "Customer",
            source: "customer",
        });

        SalesOrdform.addField({
            type: serverWidget.FieldType.SELECT,
            id: "custpage_depart",
            label: "Department",
            source: "department",
        });

        let sublist = SalesOrdform.addSublist({
            id: "custpage_sublistid",
            type: serverWidget.SublistType.INLINEEDITOR,
            label: "Sales orders that need to be fulfilled or billed",
        });
          sublist.addField({
            id: "custpage_internal_id",
            type: serverWidget.FieldType.TEXT,
            label: "Internal ID",
          });
          sublist.addField({
            id: "custpage_document_number",
            type: serverWidget.FieldType.TEXT,
            label: "Document Number",
          });
          sublist.addField({
            id: "custpage_date",
            type: serverWidget.FieldType.TEXT,
            label: "Date",
          });
          sublist.addField({
            id: "custpage_status",
            type: serverWidget.FieldType.TEXT,
            label: "Status",
          });
          sublist.addField({
            id: "custpage_customer_name",
            type: serverWidget.FieldType.TEXT,
            label: "Customer Name",
          });
          sublist.addField({
            id: "custpage_subsidiary",
            type: serverWidget.FieldType.TEXT,
            label: "Subsidiary",
          });
          sublist.addField({
            id: "custpage_department",
            type: serverWidget.FieldType.TEXT,
            label: "Department",
          });
          sublist.addField({
            id: "custpage_class",
            type: serverWidget.FieldType.TEXT,
            label: "Class",
          });
          sublist.addField({
            id: "custpage_subtotal",
            type: serverWidget.FieldType.TEXT,
            label: "subtotal",
          });
          sublist.addField({
            id: "custpage_tax",
            type: serverWidget.FieldType.TEXT,
            label: "Tax",
          });
          sublist.addField({
            id: "custpage_total",
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
          SalesOrdform.getField({ id: "custpage_statuses" }).defaultValue = params.cust_Status || "";
          SalesOrdform.getField({ id: "custpage_subsi" }).defaultValue = params.cust_subsidiary || "";
          SalesOrdform.getField({ id: "custpage_customers" }).defaultValue = params.cust_Customer || "";
          SalesOrdform.getField({ id: "custpage_depart" }).defaultValue = params.cust_Department || "";
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
          let filter = [ ["mainline","is","F"], 
                        "AND", 
                        ["taxline","is","F"], 
                        "AND", 
                        ["shipping","is","F"], 
                        "AND", 
                        ["cogs","is","F"], 
                        "AND", 
                        ["item.type","noneof","Discount"] ];

          if (params.cust_Status) filter.push("AND", ["status", "is", params.cust_Status]);
          if (params.cust_Customer) filter.push("AND", ["customermain.internalid", "anyof", params.cust_Customer]);
          if (params.cust_subsidiary) filter.push("AND", ["subsidiary", "is", params.cust_subsidiary]);
          if (params.cust_Department) filter.push("AND", ["department", "is", params.cust_Department]);

          let searchResults = executeSalesOrderSearch(filter);
          populateSublistWithData(SalesOrdform.getSublist({ id: "custpage_sublistid" }), searchResults);
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
                { name: "internalid",summary: "GROUP", label: "Internal ID" },
                { name: "tranid", summary: "GROUP", label: "Document Number" },
                { name: "trandate", summary: "GROUP", label: "Date" },
                { name: "statusref", summary: "GROUP", label: "Status" },
                { name: "entityid", summary: "GROUP", join: "customerMain", label: "Customer Name" },
                { name: "subsidiary", summary: "GROUP", label: "Subsidiary" },
                { name: "department", summary: "GROUP", label: "Department" },
                { name: "saleschannel", summary: "GROUP", label: "Class" },
                { name: "taxtotal",summary: "SUM", label: "Amount (Transaction Tax Total)"},
                { name: "total", summary: "SUM", label: "Amount (Transaction Total)"},
                {name: "grossamount", summary: "SUM", label: "Amount (Gross)"}
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
            sublist.setSublistValue({ id: "custpage_internal_id", line: index, value: result.getValue({name: "internalid",summary: "GROUP"}) || "No Value" });
            sublist.setSublistValue({ id: "custpage_document_number", line: index, value: result.getValue({name: "tranid",summary: "GROUP"}) || "No Value" });
            sublist.setSublistValue({ id: "custpage_date", line: index, value: result.getValue({name: "trandate",summary: "GROUP"}) || "No Value" });
            sublist.setSublistValue({ id: "custpage_status", line: index, value: result.getText({name: "statusref",summary: "GROUP"}) || "No Value" });
            sublist.setSublistValue({id: "custpage_customer_name",line: index, value: result.getValue({ name: "entityid",summary: "GROUP", join: "customerMain" }) || "No Value"});
            sublist.setSublistValue({id: "custpage_subsidiary",line: index, value: result.getText({name: "subsidiary",summary: "GROUP"}) || "No Value",});
            sublist.setSublistValue({id: "custpage_department",line: index,value: result.getText({name: "department",summary: "GROUP"}) || "No Value",});
            sublist.setSublistValue({id: "custpage_class",line: index,value: result.getValue({name: "saleschannel",summary: "GROUP"}) || "No Value",});
            sublist.setSublistValue({id: "custpage_subtotal",line: index,value:result.getValue({name: "grossamount",summary: "SUM"})||'No Value'
            });
            sublist.setSublistValue({id: "custpage_tax",line: index,value: result.getValue({name: "taxtotal",summary: "SUM"}) || "No Value",});
            sublist.setSublistValue({id: "custpage_total",line: index,value: result.getValue({name: "total",summary: "SUM"}) || "No Value",});
        });
        } catch (error) {
        log.error("Error loading item record", error);
      }
    };

    return { onRequest };
});
