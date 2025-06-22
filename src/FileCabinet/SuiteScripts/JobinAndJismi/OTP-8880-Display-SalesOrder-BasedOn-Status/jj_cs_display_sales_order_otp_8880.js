/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
/**********************************************************************************************
**************** 
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

**************************************************************************************************
****************/
define(['N/record', 'N/url','N/currentRecord'],
/**
 * @param{record} record
 * @param{url} url
 * @param{currentRecord} currentRecord
 */
function(record, url,currentRecord) {
    


    /**
      * Validation function to be executed when record is saved.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.currentRecord - Current form record
      * @returns {boolean} Return true if record is valid
      *
      * @since 2015.2
      */
        function saveRecord(scriptContext) {
        try {
            
            let curRecord = scriptContext.currentRecord;

                let suiteletUrl = generateSuiteletUrl(curRecord);
                navigateToSuitelet(suiteletUrl);
        } catch (error) {
            log.error("Error loading item record", error);
        }
    }


    /**
     * Generates the Suitelet URL with necessary parameters.
     * @param {Record} curRecord - Current form record
     * @returns {string} - Resolved Suitelet URL
     */
    function generateSuiteletUrl(curRecord) {
        try{
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
        } catch (error) {
            log.error("Error loading item record", error);
        }
    }


    /**
     * Redirects to the generated Suitelet URL.
     * @param {string} suiteletUrl - URL to navigate to
     */
    function navigateToSuitelet(suiteletUrl) {
        try{
            window.onbeforeunload = null; 
            window.location.href = suiteletUrl;
        } catch (error) {
            log.error("Error loading item record", error);
        }
    }

    return {
            saveRecord: saveRecord,

    };

});