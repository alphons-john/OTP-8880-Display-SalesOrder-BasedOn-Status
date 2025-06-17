/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
/**********************************************************************************************
* 
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
*Description:This script is designed to create a custom form that displays sales orders requiring fulfillment or billing. It includes a Sublist
*with multiple columns and filters, such as Status, Subsidiary, Customer, and Department, ensuring that the displayed data dynamically updates
*based on the selected filters. 
*
** REVISION HISTORY
 *
* @version 1.0 17-June-2025 : Created the initial build by JJ0403
*/
define(['N/record', 'N/url','N/currentRecord'],
/**
 * @param{record} record
 * @param{url} url
 * @param{currentRecord} currentRecord
 */
function(record, url,currentRecord) {
    

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        console.log("fieldChanged triggered");
        let fieldId = scriptContext.fieldId;
        let curRecord = scriptContext.currentRecord;

        if(fieldId === 'subsi'||fieldId === 'customers'||fieldId === 'status'||fieldId === 'depart'){
            let suiteletUrl = generateSuiteletUrl(curRecord);
            navigateToSuitelet(suiteletUrl);
        }
    }

    /**
     * Generates the Suitelet URL with necessary parameters.
     * @param {Record} curRecord - Current form record
     * @returns {string} - Resolved Suitelet URL
     */
    function generateSuiteletUrl(curRecord) {
        return url.resolveScript({
            scriptId: 'customscript_jj_sl_display_sales_order',
            deploymentId: 'customdeploy_jj_sl_display_sales_order',
            params: {
                'cust_subsidiary': curRecord.getValue('subsi'),
                'cust_Customer': curRecord.getValue('customers'),
                'cust_Status': curRecord.getValue('status'),
                'cust_Department': curRecord.getValue('depart')
            }
        });
    }

    /**
     * Redirects to the generated Suitelet URL.
     * @param {string} suiteletUrl - URL to navigate to
     */
    function navigateToSuitelet(suiteletUrl) {
        window.location.href = suiteletUrl;
    }

    return {
        fieldChanged: fieldChanged
    };

});