const {fennixResponse, dropdownActionButtonCreator} = require('../../util-module/custom-request-reponse-modifiers/response-creator');
const {statusCodeConstants} = require('../../util-module/response-status-constants/status-code-constants');
const {imageDBLocation, imageLocalLocation} = require('../../util-module/connection-constants');
const {getDropdownAccessor, getDropdownValueByDropdownIdAccessor, getContainerCheckboxMetadataAccessor} = require('../../repository-module/data-accesors/common-accessor');
const {objectHasPropertyCheck, arrayNotEmptyCheck, notNullCheck} = require('../../util-module/data-validators');
const nodeMailer = require('nodemailer');
const tripBusiness = require('../trip-business-module/trip-business');
const {getCountryCodeByLocationIdAccessor} = require('../../repository-module/data-accesors/location-accesor');
const {roleHTMLCreator, roleMailBody} = require('../../util-module/util-constants/fennix-email-html-conatants');
const fetch = require('isomorphic-fetch');
const dropbox = require('dropbox').Dropbox;
const dropBoxItem = new dropbox({
    accessToken: '6-m7U_h1YeAAAAAAAAAAV0CNy7fXzgtcE3i1PSumhkQaaW2QfdioPQEZGSq3VXbf',
    fetch: fetch
});

const dropDownBusiness = async (req) => {
    let request = [req.query.dropdownId, req.query.languageId], dropdownResponse,
        returnResponse = {dropdownList: [], isCommonDropdownFlag: true};
    dropdownResponse = await getDropdownAccessor(request);
    if (objectHasPropertyCheck(dropdownResponse, 'rows') && arrayNotEmptyCheck(dropdownResponse.rows)) {
        dropdownResponse.rows.forEach((item) => {
            returnResponse.dropdownList.push(dropdownActionButtonCreator(item));
        });
        returnResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', returnResponse);
    } else {
        returnResponse = fennixResponse(statusCodeConstants.STATUS_NO_DROPDOWN, 'EN_US', []);
    }
    return returnResponse;
};

const getContainerCheckboxMetadataBusiness = async (req) => {
    let request = [req.query.containerSetId, req.query.languageId], response, modifiedResponse = [], finalResponse;
    response = await getContainerCheckboxMetadataAccessor(request);
    if (objectHasPropertyCheck(response, 'rows') && arrayNotEmptyCheck(response.rows)) {
        response.rows.forEach((item) => {
            let obj = {
                checkBoxContainerSetName: item['checkbox_container_set_name'],
                checkBoxContainerSetId: item['checkbox_container_set_id'],
                requestMappingKey: item['request_mapping_key'],
                defaultValue: item['default_value'],
                elementTitle: item['element_title'],
                elementWidth: item['element_width'],
                elementPrimaryValue: item['element_primary_value'],
                elementSecondaryValue: item['element_secondary_value'],
                checkBoxDynamicContainerId: item['checkbox_deviceattributes_dynamiccontainer_id'],
                checkBoxDynamicContainerOrderId: item['checkbox_deviceattributes_dynamiccontainer_order_id'],
                widgetAttributeId: item['widget_attribute_id'],
                widgetElementType: item['widget_element_type'],
                widgetElementSubType: item['widget_sub_type']
            };
            modifiedResponse.push(obj);
        });
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', modifiedResponse);
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_DROPDOWN, 'EN_US', []);
    }
    return finalResponse;
};

const imageStorageBusiness = async (imageUpload, folderBasePath, folderName, createFolderFlag) => {
    let sharePath, fileUploadResponse;
    const profileResponse = createFolderFlag ? await createDropboxFolderBusiness(folderBasePath, 'profile') : {
        folderLocation: `${folderBasePath}/profile`,
        folderCreationFlag: true
    };
    if (notNullCheck(imageUpload) && profileResponse.folderCreationFlag) {
        fileUploadResponse = await uploadToDropboxBusiness(profileResponse.folderLocation, imageUpload, folderName);
        if (fileUploadResponse.uploadSuccessFlag) {
            sharePath = await shareDropboxLinkBusiness(fileUploadResponse.docUploadResponse.path_lower, true);
            // let shareLink = await dropBoxItem.sharingCreateSharedLinkWithSettings({path: fileUploadResponse.docUploadResponse.path_lower}).catch((err) => {
            //     console.log('sharing error');
            //     console.log(err);
            // });
            // let replaceLink = shareLink.url.split('\/s\/')[1];
            // sharePath = `https://dl.dropboxusercontent.com/s/${replaceLink}`;
        }
    }
    return {sharePath, folderBasePath};
};

const shareDropboxLinkBusiness = async (dropboxPath, replaceLinkFlag) => {
    let sharePath,
        shareLink = await dropBoxItem.sharingCreateSharedLinkWithSettings({path: dropboxPath}).catch((err) => {
            console.log('sharing error');
            console.log(err);
        });
    let replaceLink = shareLink.url.split('\/s\/')[1];
    sharePath = replaceLinkFlag ? `https://dl.dropboxusercontent.com/s/${replaceLink}` : shareLink.url;
    return sharePath;
};
const createDropboxFolderBusiness = async (basePath, categoryFolder) => {
    let folderCreationFlag = false, folderLocation;
    const folderResponse = await dropBoxItem.filesCreateFolderV2({path: `${basePath}/${categoryFolder}`}).catch((err) => {
        console.log(err);
    });
    console.log('create folder response');
    console.log(folderResponse);
    if (notNullCheck(folderResponse) && objectHasPropertyCheck(folderResponse, 'metadata') && objectHasPropertyCheck(folderResponse['metadata'], 'path_lower')) {
        folderCreationFlag = true;
        folderLocation = folderResponse['metadata']['path_lower'];
    }
    return {folderCreationFlag, folderLocation};
};

const getDropdownNameFromKeyBusiness = async (dropdownId) => {
    let dropdownResponse;
    dropdownResponse = await getDropdownValueByDropdownIdAccessor(dropdownId);
    return dropdownResponse;
};
const uploadToDropboxBusiness = async (documentPath, document, fileNameInit) => {
    console.log('upload to dropbox');
    console.log(documentPath);
    console.log(fileNameInit);
    const fileFormat = document.match(/:(.*?);/)[1].split('/')[1];
    let documentUpload = document, docUploadResponse, uploadSuccessFlag = false;
    documentUpload = dataURLtoFile(documentUpload);
    const fileName = `${fileNameInit}.${fileFormat}`;
    docUploadResponse = await dropBoxItem.filesUpload({
        path: `${documentPath}/${fileName}`,
        contents: documentUpload
    }).catch((err) => {
        console.log(err)
    });
    console.log('upload dropbox response');
    console.log('file Name', fileName);
    if (notNullCheck(docUploadResponse)) {
        uploadSuccessFlag = true;
    }
    return {uploadSuccessFlag, docUploadResponse};
};

const dataURLtoFile = (dataurl) => {
    let newArray = dataurl.split(',')[1];
    return new Buffer(newArray, 'base64');
};

const forgotPasswordemailBusiness = async (emailId, fullName, roleId) => {
    const subject = `Hi ${fullName}.Reset your password to Sofia`;
    let body = roleHTMLCreator('Forgot Password?', 'No worries.Please click on the button below to reset the password', 'Reset Password', `http://patdoj.fennix.global:4200/newLogin?emailId=${emailId}&roleId=${roleId}&fullName=${fullName}`);
    nodeMailerTransport(subject, emailId, body);
};

const emailSendBusiness = async (emailId, roleId, fullName) => {
    const subject = `Hi ${fullName}. Welcome to Sofia`;
    let body;
    body = mailModifier(emailId, roleId, fullName);
    nodeMailerTransport(subject, emailId, body);
    // const transporter = nodeMailer.createTransport({
    //     port: 465,
    //     host: 'smtp.gmail.com',
    //     service: 'gmail',
    //     auth: {
    //         user: 'fennixtest@gmail.com',
    //         pass: 'Fennix@gmail'
    //     },
    // });
    //
    // const mailOptions = {
    //     from: 'fennixtest@gmail.com',
    //     to: emailId,
    //     subject: subject,
    //     html: body
    // };
    //
    // transporter.sendMail(mailOptions, function (error, info) {
    //     if (error) {
    //         console.log(error);
    //     } else {
    //         // console.log(info);
    //     }
    // });
};

const notificationEmailBusiness = async (emailId, notificationType, containerDetails) => {


    let subject = notificationModifier(notificationType);
    let body;
    // console.log('container Details');
    console.log(containerDetails);
    body = roleMailBody[notificationType];
    nodeMailerTransport(subject, emailId, body);
};

const notificationModifier = (notificationType) => {
    const notificationBodyMap = {
        start_trip: 'Sofia - Your Container Trip Has Started',
        end_trip: 'Sofia - Your Container Trip Has Ended',
        unlock_device: 'Sofia - The Container being transported has been unlocked',
        geo_fence: 'Sofia - Your Container Trip Has some geofence violation',
    };
    return notificationBodyMap[notificationType];
};

const nodeMailerTransport = (subject, emailId, body) => {
    const transporter = nodeMailer.createTransport({
        port: 465,
        host: 'smtp.gmail.com',
        service: 'gmail',
        auth: {
            user: 'fennixtest@gmail.com',
            pass: 'Fennix@gmail'
        },
    });

    const mailOptions = {
        from: 'fennixtest@gmail.com',
        to: emailId,
        subject: subject,
        html: body
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            // console.log(info);
        }
    });
};
const mailModifier = (email, roleId, fullName) => {
    let body, url, urlName, header, returnMailBody;
    url = `${roleMailBody[roleId].url}?emailId=${email}&roleId=${roleId}&fullName=${fullName}`;
    body = roleMailBody[roleId].body;
    urlName = roleMailBody[roleId].urlName;
    header = roleMailBody[roleId].header;
    returnMailBody = roleHTMLCreator(header, body, urlName, url);
    return returnMailBody;
};
getLocationCodeBusiness = async (locationId) => {
    let returnObj;
    returnObj = await getCountryCodeByLocationIdAccessor(locationId);
    return returnObj;
};
module.exports = {
    dropDownBusiness,
    imageStorageBusiness,
    emailSendBusiness,
    createDropboxFolderBusiness,
    uploadToDropboxBusiness,
    getLocationCodeBusiness,
    shareDropboxLinkBusiness,
    notificationEmailBusiness,
    forgotPasswordemailBusiness,
    getContainerCheckboxMetadataBusiness,
    getDropdownNameFromKeyBusiness
};