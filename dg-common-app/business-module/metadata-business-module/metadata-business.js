const {objectHasPropertyCheck, arrayNotEmptyCheck} = require('../../util-module/data-validators');
const {fennixResponse, dropdownCreator} = require('../../util-module/custom-request-reponse-modifiers/response-creator');
const {statusCodeConstants} = require('../../util-module/response-status-constants/status-code-constants');
const metadataAccessor = require('../../repository-module/data-accesors/metadata-accesor');
const {getCountryListAccessor} = require('../../repository-module/data-accesors/location-accesor');
const {getUserNameFromUserIdAccessor} = require('../../repository-module/data-accesors/user-accesor');
const COMMON_CONSTANTS = require('../../util-module/util-constants/fennix-common-constants');

const getBaseMetadataBusiness = async (req) => {
    let responseObj, headerResponse, sideNavResponse, composedData = {}, request;
    request = [req.body.userId, req.body.lang];
    headerResponse = await metadataAccessor.getHeaderMetadataAccessor(request);
    sideNavResponse = await metadataAccessor.getSideNavMetadataAccessor(request);
    if (objectHasPropertyCheck(headerResponse, COMMON_CONSTANTS.FENNIX_ROWS) && objectHasPropertyCheck(sideNavResponse, COMMON_CONSTANTS.FENNIX_ROWS)) {
        let headerObj = routeDataModifier(headerResponse);
        let sideNavObj = routeDataModifier(sideNavResponse);
        composedData['header'] = Object.keys(headerObj).map(dataItem => headerObj[dataItem]);
        composedData['sideNav'] = Object.keys(sideNavObj).map(dataItem => sideNavObj[dataItem]).sort((item, prevItem) => (item.sideNavOrder - prevItem.sideNavOrder));
        composedData['sideNav'].forEach((parent) => {
            if (parent.childItems) {
                parent.childItems.sort((item, prevItem) => (item.childOrderId - prevItem.childOrderId))
            }
        });
        responseObj = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', composedData);
    } else {
        responseObj = fennixResponse(statusCodeConstants.STATUS_NO_CARDS_FOR_USER_ID, 'EN_US', composedData);
    }
    return responseObj;
};

const getCardMetadataForRouteBusiness = async (req) => {
    let responseObj, cardResponse, request;
    request = [req.body.userId, req.body.routeId, req.body.lang];
    cardResponse = await metadataAccessor.getCardMetadataAccessor(request);
    if (objectHasPropertyCheck(cardResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(cardResponse.rows)) {
        let returnObj;
        returnObj = cardResponse.rows.reduce(function (init, item) {
            if (objectHasPropertyCheck(init, 'widgetCards') && !objectHasPropertyCheck(init.widgetCards, item['role_cards_widgets_id'])) {
                const widgetObj = {};
                widgetObj[item['role_cards_widgets_id']] = {};
                init['widgetCards'][item['role_cards_widgets_id']] = {
                    cardId: 'C_' + item['role_card_id'],
                    cardSize: item['card_size'],
                    cardHeader: item['card_header'],
                    cardOrderId: item['card_order_id'],
                    modalCardTypeId: item['modal_card_type_id'],
                    modalCardTypeName: item['modal_card_type_name'],
                    widgets: widgetObj
                }
            }
            if (objectHasPropertyCheck(init['widgetCards'][item['role_cards_widgets_id']], 'widgets') && !objectHasPropertyCheck(init['widgetCards']['widgets'], item['role_cards_widgets_id'])) {
                let widgetSectionsObj = {...init['widgetCards'][item['role_cards_widgets_id']]['widgets'][item['role_cards_widgets_id']].widgetSections} || {};
                widgetSectionsObj = widgetSectionCreator(item, widgetSectionsObj);
                init['widgetCards'][item['role_cards_widgets_id']]['widgets'][item['role_cards_widgets_id']] = {
                    widgetId: 'W_' + item['role_cards_widgets_id'],
                    widgetOrderId: item['widget_order_id'],
                    widgetSize: item['widget_size'],
                    widgetSections: {...widgetSectionsObj},
                    widgetEndpoint: item['widget_endpoint'],
                    widgetInitSort: item['widget_init_sort'],
                    widgetReqType: item['widget_req_type'],
                    widgetReqParams: item['widget_req_params']
                }
            }
            return init;
        }, {widgetCards: {}});
        returnObj.widgetCards = Object.keys(returnObj.widgetCards).map((card) => {
            returnObj.widgetCards[card]['widgets'] = Object.keys(returnObj.widgetCards[card]['widgets']).map((widget) => {
                returnObj.widgetCards[card]['widgets'][widget]['widgetSections'] = Object.keys(returnObj.widgetCards[card]['widgets'][widget]['widgetSections']).map((section) => {
                    returnObj.widgetCards[card]['widgets'][widget]['widgetSections'][section]['widgetSubSections'] = Object.keys(returnObj.widgetCards[card]['widgets'][widget]['widgetSections'][section]['widgetSubSections']).map((subsection) => {
                        returnObj.widgetCards[card]['widgets'][widget]['widgetSections'][section]['widgetSubSections'][subsection]['widgetSectionRows'] = Object.keys(returnObj.widgetCards[card]['widgets'][widget]['widgetSections'][section]['widgetSubSections'][subsection]['widgetSectionRows']).map((row) => {
                            returnObj.widgetCards[card]['widgets'][widget]['widgetSections'][section]['widgetSubSections'][subsection]['widgetSectionRows'][row]['sectionCols'].sort((current, previous) => current.widgetColId - previous.widgetColId);
                            return returnObj.widgetCards[card]['widgets'][widget]['widgetSections'][section]['widgetSubSections'][subsection]['widgetSectionRows'][row]
                        });
                        return returnObj.widgetCards[card]['widgets'][widget]['widgetSections'][section]['widgetSubSections'][subsection]
                    });
                    return returnObj.widgetCards[card]['widgets'][widget]['widgetSections'][section];
                });
                return returnObj.widgetCards[card]['widgets'][widget];
            });
            return returnObj.widgetCards[card];
        });
        responseObj = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', returnObj.widgetCards);
    } else {
        responseObj = fennixResponse(statusCodeConstants.STATUS_NO_CARDS_FOR_USER_ID, 'EN_US', []);
    }
    return responseObj;
};

const getFilterMetadataBusiness = async (req, colName) => {
    let request = [req.query.id], filterResponse, response;
    filterResponse = await metadataAccessor.getFilterMetadataAccessor(request, colName);
    if (objectHasPropertyCheck(filterResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(filterResponse.rows)) {
        response = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', filterResponse);
    } else {
        response = fennixResponse(statusCodeConstants.STATUS_NO_FILTERS_FOR_ID, 'EN_US', []);
    }
    return response;
};

const getLoginMetadataBusiness = async (req) => {
    let responseObj, loginMetadtaResponse = {widgetSections: {}};
    // console.log(req.query);
    responseObj = await metadataAccessor.getLoginMetadataAccessor(req.query.location);
    if (objectHasPropertyCheck(responseObj, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(responseObj.rows)) {
        loginMetadtaResponse.widgetSections = responseObj.rows.reduce((init, item) => {
            init = {...init, ...widgetSectionCreator(item, init)};
            return init;
        }, {});
        loginMetadtaResponse['widgetSections'] = Object.keys(loginMetadtaResponse.widgetSections).map((section) => {
            loginMetadtaResponse.widgetSections[section]['widgetSubSections'] = Object.keys(loginMetadtaResponse.widgetSections[section]['widgetSubSections']).map((subsection) => {
                loginMetadtaResponse.widgetSections[section]['widgetSubSections'][subsection]['widgetSectionRows'] = Object.keys(loginMetadtaResponse.widgetSections[section]['widgetSubSections'][subsection]['widgetSectionRows']).map((rows) => {
                    loginMetadtaResponse['widgetSections'][section]['widgetSubSections'][subsection]['widgetSectionRows'][rows]['sectionCols'].sort((current, previous) => current.widgetColId - previous.widgetColId);
                    return loginMetadtaResponse.widgetSections[section]['widgetSubSections'][subsection]['widgetSectionRows'][rows];
                });
                return loginMetadtaResponse.widgetSections[section]['widgetSubSections'][subsection];
            });
            return loginMetadtaResponse.widgetSections[section];
        });
    }
    return fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', loginMetadtaResponse);
};

const getLanguagesListBusiness = async () => {
    let responseObj, languageListResponse = {dropdownList: []};
    responseObj = await metadataAccessor.getLanguagesDropdownAccessor();
    if (objectHasPropertyCheck(responseObj, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(responseObj.rows)) {
        responseObj.rows.forEach((item) => {
            languageListResponse.dropdownList.push(dropdownCreator(item.language_code, item.language_name, false));
        });
    }
    return fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', languageListResponse);
};

const getModelMetadataBusiness = async (req) => {
    let response, responseMap = {modalHeader: '', modalBody: {widgetSections: {}}}, request;
    request = [req.query.modalId, req.query.languageId];
    response = await metadataAccessor.getModalMetadataAccessor(request);
    if (objectHasPropertyCheck(response, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(response.rows)) {
        response.rows.forEach((item) => {
            responseMap.modalHeader = responseMap.modalHeader || item['modal_header'];
            responseMap.modalBody = {
                modalDataEndpoint: item['modal_data_endpoint'],
                modalDataReqType: item['modal_data_request_type'],
                modalDataReqParams: item['modal_data_request_params'],
                modalWidth: item['modal_width'],
                modalCardTypeId: item['modal_card_type_id'],
                modalCardTypeName: item['modal_card_type_name'],
                widgetSections: widgetSectionCreator(item, responseMap.modalBody.widgetSections)
            }
        });
        responseMap.modalBody.widgetSections = Object.keys(responseMap.modalBody.widgetSections).map((section) => {
            responseMap.modalBody.widgetSections[section]['widgetSubSections'] = Object.keys(responseMap.modalBody.widgetSections[section]['widgetSubSections']).map((subsection) => {
                responseMap.modalBody.widgetSections[section]['widgetSubSections'][subsection]['widgetSectionRows'] = Object.keys(responseMap.modalBody.widgetSections[section]['widgetSubSections'][subsection]['widgetSectionRows']).map((row) => {
                    responseMap.modalBody.widgetSections[section]['widgetSubSections'][subsection]['widgetSectionRows'][row]['sectionCols'].sort((previous, current) => previous['widgetColId'] - current['widgetColId']);
                    return responseMap.modalBody.widgetSections[section]['widgetSubSections'][subsection]['widgetSectionRows'][row]
                });
                return responseMap.modalBody.widgetSections[section]['widgetSubSections'][subsection];
            });
            return responseMap.modalBody.widgetSections[section];
        });
        response = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', responseMap);
    } else {
        response = fennixResponse(statusCodeConstants.STATUS_NO_ROLES, 'EN_US', []);
    }
    return response;
};

// const getLanguageListGridBusiness = async (req) => {
//     let responseObj, languageListResponse = {gridData: []};
//     responseObj = await metadataAccessor.getLanguagesAccessor();
//     if (objectHasPropertyCheck(responseObj, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(responseObj.rows)) {
//         responseObj.rows.forEach((item) => {
//             const languageObj = {
//                 languageId: item['language_id'],
//                 language: item['language_name'],
//                 languageIso: item['iso_code'],
//                 activeStatus: item['isactive']
//             };
//             languageListResponse['gridData'].push(languageObj);
//         });
//     }
//     return fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', languageListResponse);
// };

const getLanguageListGridBusiness = async (req) => {
    let responseObj, languageListResponse = {gridData: []}, totalNoOfLangauges,
        request = [req.query.skip, req.query.limit];
    totalNoOfLangauges = await metadataAccessor.getTotalNoOfLanguagesAccessor();
    responseObj = await metadataAccessor.getLanguagesAccessor(request);
    if (objectHasPropertyCheck(responseObj, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(responseObj.rows)) {
        responseObj.rows.forEach((item) => {
            const languageObj = {
                languageId: item['language_id'],
                language: item['language_name'],
                languageIso: item['iso_code'],
                activeStatus: item['isactive']
            };
            languageListResponse['gridData'].push(languageObj);
            languageListResponse.totalNoOfRecords = objectHasPropertyCheck(totalNoOfLangauges, 'rows') && arrayNotEmptyCheck(totalNoOfLangauges.rows) ? totalNoOfLangauges.rows[0]['count'] : 0;
        });
    }
    return fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', languageListResponse);
};

const getRolesForAdminBusiness = async (req) => {
    let request = [req.query.userRoleId, req.query.languageId, true], response, finalResponse;
    response = await metadataAccessor.getRolesForRoleIdAccessor(request);
    if (objectHasPropertyCheck(response, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(response.rows)) {
        if (req.query.isDropdownFlag) {
            const dropdownObj = {dropdownList: []};
            response.rows.forEach((role) => {
                dropdownObj.dropdownList.push(dropdownCreator(role['role_id'], role['role_name'], true));
            });
            finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', dropdownObj);
        } else {
            finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', response.rows);
        }
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_ROLES_FOR_ID, 'EN_US', []);
    }
    return finalResponse;
};

const getRolesForNonAdminsBusiness = async (req) => {
    let request = [req.query.userRoleId, req.query.languageId, false], response, finalResponse;
    response = await metadataAccessor.getRolesForRoleIdAccessor(request);
    if (objectHasPropertyCheck(response, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(response.rows)) {
        if (req.query.isDropdownFlag) {
            const dropdownObj = {dropdownList: []};
            response.rows.forEach((role) => {
                dropdownObj.dropdownList.push(dropdownCreator(role['role_id'], role['role_name'], false));
            });
            finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', dropdownObj);
        } else {
            finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', response.rows);
        }
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_ROLES_FOR_ID, 'EN_US', []);
    }
    return finalResponse;
};


const getRolesBusiness = async (req) => {
    let response, rolesResponse;
    rolesResponse = metadataAccessor.getRolesAccessor([req.query.languageId]);
    if (objectHasPropertyCheck(rolesResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(rolesResponse.rows)) {
        let rolesResponse = rolesResponse.rows[0];
        response = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', rolesResponse);
    } else {
        response = fennixResponse(statusCodeConstants.STATUS_NO_ROLES, 'EN_US', []);
    }
    return response;
};

const listCentersBusiness = async (req) => {
    let centerIdResponse, finalResponse, centerIdList = {dropdownList: []};
    centerIdResponse = await metadataAccessor.getCenterIdsAccessor(req);
    console.log(centerIdResponse);
    if (objectHasPropertyCheck(centerIdResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(centerIdResponse.rows)) {
        centerIdResponse.rows.forEach(item => {
            centerIdList.dropdownList.push(dropdownCreator(item['location_id'], item['location_name'], false));
        });
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', centerIdList);
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_CENTERS_FOR_ID, 'EN_US', []);
    }
    return finalResponse;
};

const getCountryListBusiness = async (req) => {
    let request = {userId: req.query.userId, languageId: req.query.languageId}, userDetailsResponse,
        countryListResponse, finalResponse, countryIdList = {dropdownList: []};
    userDetailsResponse = await getUserNameFromUserIdAccessor([req.query.languageId, req.query.userId]);
    if (objectHasPropertyCheck(userDetailsResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(userDetailsResponse.rows)) {
        request.userRole = userDetailsResponse.rows[0]['native_user_role'];
        console.log(request);
        countryListResponse = await getCountryListAccessor(request);
        console.log(countryListResponse);
    }
    if (objectHasPropertyCheck(countryListResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(countryListResponse.rows)) {
        countryListResponse.rows.forEach(item => {
            countryIdList.dropdownList.push(dropdownCreator(item['location_id'], item['country_name'], false));
        });
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', countryIdList);
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_COUNTRIES_FOR_ID, 'EN_US', []);
    }

    return finalResponse;
};

//Private methods to modify the data for the way we need in the response
const widgetSectionCreator = (widgetItem, widgetSectionObj) => {
    let widgetSectionFinalObj = {};
    if (!objectHasPropertyCheck(widgetSectionObj, widgetItem['widget_section_order_id'])) {
        let widgetSectionBaseObj = {[widgetItem['widget_section_order_id']]: {}};
        widgetSectionBaseObj[widgetItem['widget_section_order_id']] = {
            sectionId: widgetItem['widget_section_order_id'],
            sectionTitle: widgetItem['widget_section_title'],
            sectionType: widgetItem['widget_section_type'],
            sectionOrientation: objectHasPropertyCheck(widgetItem, 'section_orientation') ? widgetItem['section_orientation'] : 'V',
            sectionSubType: widgetItem['widget_section_subtype'],
            widgetSubSections: widgetSubSectionCreator(widgetItem, {})
        };
        widgetSectionFinalObj = {...widgetSectionObj, ...widgetSectionBaseObj};
    } else {
        widgetSectionObj[widgetItem['widget_section_order_id']]['widgetSubSections'] = widgetSubSectionCreator(widgetItem, widgetSectionObj[widgetItem['widget_section_order_id']]['widgetSubSections']);
        widgetSectionFinalObj = widgetSectionObj;
    }
    return widgetSectionFinalObj;
};

const widgetSubSectionCreator = (widgetSubSectionItem, subSectionObj) => {
    let widgetSubSectionFinalObj = {};
    if (!objectHasPropertyCheck(subSectionObj, widgetSubSectionItem['widget_sub_section_order_id'])) {
        let widgetSubSectionBaseObj = {[widgetSubSectionItem['widget_sub_section_order_id']]: {}};
        widgetSubSectionBaseObj[widgetSubSectionItem['widget_sub_section_order_id']] = {
            subSectionType: widgetSubSectionItem['widget_sub_section_type'],
            subSectionOrderId: widgetSubSectionItem['widget_sub_section_order_id'],
            subSectionTitle: widgetSubSectionItem['widget_sub_section_title'],
            subSectionMandatoryFlag: widgetSubSectionItem['sub_section_mandatory_flag'],
            subSectionWidth: widgetSubSectionItem['sub_section_width'],
            subSectionOrientation: objectHasPropertyCheck(widgetSubSectionItem, 'sub_section_orientation') ? widgetSubSectionItem['sub_section_orientation'] : 'V',
            widgetSectionRows: {...widgetSectionRowCreator(widgetSubSectionItem, {})}
        };
        widgetSubSectionFinalObj = {...subSectionObj, ...widgetSubSectionBaseObj};
    } else {
        subSectionObj[widgetSubSectionItem['widget_sub_section_order_id']]['widgetSectionRows'] = {...subSectionObj[widgetSubSectionItem['widget_sub_section_order_id']]['widgetSectionRows'], ...widgetSectionRowCreator(widgetSubSectionItem, subSectionObj[widgetSubSectionItem['widget_sub_section_order_id']]['widgetSectionRows'])};
        widgetSubSectionFinalObj = subSectionObj;
    }
    return widgetSubSectionFinalObj;
};

const widgetSectionRowCreator = (widgetRowItem, sectionRowObj) => {
    let widgetSectionRowFinalObj = {};
    if (!objectHasPropertyCheck(sectionRowObj, widgetRowItem['widget_row_count'])) {
        let widgetSectionRowBaseObj = {[widgetRowItem['widget_row_count']]: {}};
        widgetSectionRowBaseObj[widgetRowItem['widget_row_count']] = {
            sectionRowId: widgetRowItem['widget_row_count'],
            sectionCols: [widgetColElementCreator(widgetRowItem)]
        };
        widgetSectionRowFinalObj = {...sectionRowObj, ...widgetSectionRowBaseObj};
    } else {
        const originalCol = [...sectionRowObj[widgetRowItem['widget_row_count']]['sectionCols']];
        originalCol.push(widgetColElementCreator(widgetRowItem));
        sectionRowObj[widgetRowItem['widget_row_count']] = {
            sectionRowId: widgetRowItem['widget_row_count'],
            sectionCols: [...originalCol]
        };
        widgetSectionRowFinalObj = sectionRowObj;
    }
    return widgetSectionRowFinalObj;
};

const widgetColElementCreator = (widgetColItem) => {
    let widgetBaseColItem = {
        widgetColId: widgetColItem['widget_col_count'],
        widgetColType: widgetColItem['widget_element_type'],
        widgetColSubType: widgetColItem['widget_element_subtype']
    };
    switch (widgetColItem['widget_section_type'].toLowerCase()) {
        case 'grid':
            widgetBaseColItem = {...widgetBaseColItem, ...widgetGridElementCreator(widgetColItem)};
            break;
        case 'chart':
            widgetBaseColItem = {...widgetBaseColItem, ...widgetChartElementCreator(widgetColItem)};
            break;
        case 'form':
            widgetBaseColItem = {...widgetBaseColItem, ...widgetFormElementCreator(widgetColItem)};
            break;
        case 'details':
            widgetBaseColItem = {...widgetBaseColItem, ...widgetDetailElementCreator(widgetColItem)};
            break;
        case 'map':
            widgetBaseColItem = {...widgetBaseColItem, ...widgetMapElementCreator(widgetColItem)};
            break;
    }
    return widgetBaseColItem;
};

const widgetGridElementCreator = (widgetElementItem) => {
    let returnObj = {
        gridElementAction: widgetElementItem['element_action_type'],
        gridHeaderOrderId: widgetElementItem['widget_col_count'],
        gridHeaderMappingKey: widgetElementItem['request_mapping_key'],
        gridColType: widgetElementItem['element_type'],
        gridColSubType: widgetElementItem['element_subtype'],
        subWidgetColId: widgetElementItem['widget_col_count'],
        subWidgetRowId: widgetElementItem['widget_row_count'],
        gridColSortableFlag: widgetElementItem['is_editable__sort'],
        gridHeaderColName: widgetElementItem['element_title'],
        gridHeaderWidth: widgetElementItem['attribute_width']
    };
    switch (widgetElementItem['element_subtype'].toLowerCase()) {
        case 'modal-pill':
        case 'device-list':
        case 'destination-text':
        case 'status-indicator':
        case 'progress-indicator':
        case 'duration':
        case 'time-duration':
            returnObj = {
                ...returnObj,
                primaryValue: widgetElementItem['element_primary_value__validation'],
                secondaryValue: widgetElementItem['element_secondary_value__async_validation'],
                hoverValue: widgetElementItem['default_value__hover_value'],
                accentValue: widgetElementItem['default_key__accent_value'],
                iconValue: widgetElementItem['element_icon_value'],
                gridModalId: widgetElementItem['element_modal_id'],
                elementTitle: widgetElementItem['element_title'],
                gridModalDataKey: widgetElementItem['request_mapping_key']
            };
            break;
        case 'action-button':
            returnObj = {
                ...returnObj,
                onElementChangeAction: widgetElementItem['element_action_type'],
                defaultValue: widgetElementItem['default_value__hover_value'],
                defaultKey: widgetElementItem['default_key__accent_value'],
                elementTitle: widgetElementItem['element_title'],
                requestMappingKey: widgetElementItem['request_mapping_key'],
                dropdownEndpoint: widgetElementItem['dropdown_endpoint'],
                dropdownReqType: widgetElementItem['dropdown_request_type'],
                dropdownRequestParams: widgetElementItem['dropdown_request_params'],
                dropdownId: widgetElementItem['dropdown_id'],
            };
            break;
        case 'navigate-link':
            returnObj = {
                ...returnObj,
                gridModalId: widgetElementItem['element_modal_id'],
                gridNavigationRouteUrl: widgetElementItem['route_url'],
                gridNavigationRouteId: widgetElementItem['route_id'],
                gridNavigationRouteName: widgetElementItem['route_name']
            };
            break;
        case 'modal-link':
            returnObj = {
                ...returnObj,
                gridModalId: widgetElementItem['element_modal_id'],
                gridSubmitEndpoint: widgetElementItem['submit_endpoint'],
                gridNavigationRouteUrl: widgetElementItem['route_url'],
                gridNavigationRouteName: widgetElementItem['route_name']
            };
            break;
        case 'text':
        case 'text-number':
            returnObj = {
                ...returnObj,
                gridDefaultValue: widgetElementItem['default_value__hover_value'],
                gridDefaultKey: widgetElementItem['default_key__accent_value']
            };
            break;
        case 'color-cell':
            returnObj = {
                ...returnObj,
                gridBgColor: widgetElementItem['default_value__hover_value'],
                gridTextColor: widgetElementItem['default_key__accent_value']
            };
            break;
        case 'btn-link':
            returnObj = {
                ...returnObj,
                iconValue: widgetElementItem['element_icon_value'],
                gridModalId: widgetElementItem['element_modal_id'],
                btnName: widgetElementItem['element_label'],
                gridSubmitEndpoint: widgetElementItem['submit_endpoint'],
                gridNavigationRouteUrl: widgetElementItem['route_url'],
                gridNavigationRouteName: widgetElementItem['route_name']
            };
            break;
    }
    return returnObj;
};

const widgetChartElementCreator = (widgetElementItem) => {
    let widgetElementData = {
        elementColumnId: widgetElementItem['widget_col_count'],
        attributeId: widgetElementItem['role_card_widget_attribute_id'],
        elementType: widgetElementItem['element_type'],
        elementSubType: widgetElementItem['element_subtype'],
        colorKey: widgetElementItem['request_mapping_key'],
        colorValue: widgetElementItem['default_value__hover_value']
    };
    return widgetElementData;
};
const widgetFormElementCreator = (widgetElementItem) => {
    let widgetElementData = {};
    if (objectHasPropertyCheck(widgetElementItem, 'element_type')) {
        widgetElementData = {
            elementColumnId: widgetElementItem['widget_col_count'],
            attributeId: widgetElementItem['role_card_widget_attribute_id'],
            elementType: widgetElementItem['element_type'],
            elementSubType: widgetElementItem['element_subtype'],
            syncValidations: widgetElementItem['element_primary_value__validation'],
            asyncValidations: widgetElementItem['element_secondary_value__async_validation'],
            elementIsEditableFlag: widgetElementItem['is_editable__sort'],
            elementIsDisabledFlag: widgetElementItem['disable_flag'],
            onElementChangeAction: widgetElementItem['element_action_type'],
            formElementWidth: widgetElementItem['attribute_width']
        };
        switch (widgetElementItem['element_type'].toLowerCase()) {
            case 'map':
            case 'input':
                widgetElementData = {
                    ...widgetElementData, ...{
                        elementLabel: widgetElementItem['element_label'],
                        defaultValue: widgetElementItem['default_value__hover_value'],
                        elementTitle: widgetElementItem['element_title'],
                        requestMappingKey: widgetElementItem['request_mapping_key'],
                        elementIcon: widgetElementItem['element_icon_value']
                    }
                };
                break;
            case 'checkbox':
                widgetElementData = {
                    ...widgetElementData, ...{
                        elementCheckboxId: widgetElementItem['checkbox_container_set_id'],
                        defaultValue: widgetElementItem['default_value__hover_value'],
                        elementTitle: widgetElementItem['element_title'],
                        requestMappingKey: widgetElementItem['request_mapping_key'],
                        elementLabel: widgetElementItem['element_label']
                    }
                };
                break;
            case 'date':
                widgetElementData = {
                    ...widgetElementData, ...{
                        defaultValue: widgetElementItem['default_value__hover_value'],
                        elementTitle: widgetElementItem['element_title'],
                        requestMappingKey: widgetElementItem['request_mapping_key'],
                        elementLabel: widgetElementItem['element_label']
                    }
                };
                break;
            case 'dropdown':
                widgetElementData = {
                    ...widgetElementData, ...{
                        defaultValue: widgetElementItem['default_value__hover_value'],
                        defaultKey: widgetElementItem['default_key__accent_value'],
                        elementTitle: widgetElementItem['element_title'],
                        requestMappingKey: widgetElementItem['request_mapping_key'],
                        dropdownEndpoint: widgetElementItem['dropdown_endpoint'],
                        dropdownReqType: widgetElementItem['dropdown_request_type'],
                        dropdownRequestParams: widgetElementItem['dropdown_request_params'],
                        submitEndpoint: widgetElementItem['submit_endpoint'],
                        submitReqType: widgetElementItem['submit_request_type'],
                        submitRequestParams: widgetElementItem['submit_request_params'],
                        dropdownId: widgetElementItem['dropdown_id']
                    }
                };
                break;
            case 'button':
                widgetElementData = {
                    ...widgetElementData, ...{
                        navigationRouteUrl: widgetElementItem['route_url'],
                        navigationRouteName: widgetElementItem['route_name'],
                        submitReqType: widgetElementItem['submit_request_type'],
                        submitRequestParams: widgetElementItem['submit_request_params'],
                        submitEndpoint: widgetElementItem['submit_endpoint'],
                        elementLabel: widgetElementItem['element_label']
                    }
                };
                break;
            case 'container':
                widgetElementData = {
                    ...widgetElementData, ...{
                        elementContainerReqUrl: widgetElementItem['checkbox_container_endpoint'],
                        elementContainerReqType: widgetElementItem['checkbox_container_req_type'],
                        elementContainerReqParams: widgetElementItem['checkbox_container_req_params'],
                        elementContainerId: widgetElementItem['checkbox_container_set_id'],
                        elementTitle: widgetElementItem['element_title'],
                        submitReqType: widgetElementItem['submit_request_type'],
                        submitRequestParams: widgetElementItem['submit_request_params'],
                        submitEndpoint: widgetElementItem['submit_endpoint'],
                        elementLabel: widgetElementItem['element_label'],
                        elementIcon: widgetElementItem['element_icon_value'],
                        elementModalId: widgetElementItem['element_modal_id'],
                        requestMappingKey: widgetElementItem['request_mapping_key'],
                        dataEndpoint: widgetElementItem['dropdown_endpoint'],
                        dataReqType: widgetElementItem['dropdown_request_type'],
                        dataRequestParams: widgetElementItem['dropdown_request_params']
                    }
                };
                break;
            case 'data_container':
                widgetElementData = {
                    ...widgetElementData, ...{
                        elementContainerReqUrl: widgetElementItem['checkbox_container_endpoint'],
                        elementContainerReqType: widgetElementItem['checkbox_container_req_type'],
                        elementContainerReqParams: widgetElementItem['checkbox_container_req_params'],
                        elementContainerId: widgetElementItem['checkbox_container_set_id'],
                        elementTitle: widgetElementItem['element_title'],
                        dataMappingKey: widgetElementItem['default_value__hover_value'],
                        submitReqType: widgetElementItem['submit_request_type'],
                        submitRequestParams: widgetElementItem['submit_request_params'],
                        submitEndpoint: widgetElementItem['submit_endpoint'],
                        elementLabel: widgetElementItem['element_label'],
                        elementIcon: widgetElementItem['element_icon_value'],
                        elementModalId: widgetElementItem['element_modal_id'],
                        requestMappingKey: widgetElementItem['request_mapping_key'],
                        dataEndpoint: widgetElementItem['dropdown_endpoint'],
                        dataReqType: widgetElementItem['dropdown_request_type'],
                        dataRequestParams: widgetElementItem['dropdown_request_params']
                    }
                };
                break;

            case 'text-link':
            case 'detail-text':
                widgetElementData = {
                    ...widgetElementData, ...{
                        navigationRouteUrl: widgetElementItem['route_url'],
                        navigationRouteName: widgetElementItem['route_name'],
                        elementLabel: widgetElementItem['element_label']
                    }
                };
                break;
        }
    }
    return widgetElementData;
};
const widgetDetailElementCreator = (widgetElementItem) => {
    let widgetElementData = {
        elementColumnId: widgetElementItem['widget_col_count'],
        attributeId: widgetElementItem['role_card_widget_attribute_id'],
        elementType: widgetElementItem['element_type'],
        elementSubType: widgetElementItem['element_subtype'],
        elementTitle: widgetElementItem['element_title'],
        valueMappingKey: widgetElementItem['request_mapping_key'],
        elementWidth: widgetElementItem['attribute_width'],
        primaryValue: widgetElementItem['element_primary_value__validation'],
        secondaryValue: widgetElementItem['element_secondary_value__async_validation']
    };
    switch (widgetElementItem['element_subtype'].toLowerCase()) {
        case 'tile-link':
        case 'link':
            widgetElementData = {
                ...widgetElementData,
                elementChangeAction: widgetElementItem['element_action_type'],
                navigationRouteUrl: widgetElementItem['route_url'],
                navigationRouteName: widgetElementItem['route_name']
            };
            break;
        case 'image-round-tile':
            widgetElementData = {
                ...widgetElementData,
                imageValue: widgetElementItem['default_value__hover_value']
            };
            break;
        case 'role-pill':
            widgetElementData = {
                ...widgetElementData,
                roleValue: widgetElementItem['default_value__hover_value'],
                iconValue: widgetElementItem['element_icon_value']
            };
            break;
        case 'gender-pill':
            widgetElementData = {
                ...widgetElementData,
                genderValue: widgetElementItem['default_value__hover_value'],
                iconValue: widgetElementItem['element_icon_value']
            };
            break;
        case 'tile':
            widgetElementData = {
                ...widgetElementData,
                colorValue: widgetElementItem['default_value__hover_value'],
                iconValue: widgetElementItem['element_icon_value'],
                colorKey: widgetElementItem['default_key__accent_value']
            };
            break;
    }
    return widgetElementData;
};
const widgetMapElementCreator = (widgetElementItem) => {
    let widgetElementData = {
        elementColumnId: widgetElementItem['widget_col_count'],
        attributeId: widgetElementItem['role_card_widget_attribute_id'],
        elementType: widgetElementItem['element_type'],
        elementSubType: widgetElementItem['element_subtype'],
        elementTitle: widgetElementItem['element_title'],
        elementLabel: widgetElementItem['element_label'],
        valueMappingKey: widgetElementItem['request_mapping_key'],
        elementWidth: widgetElementItem['attribute_width'],
        elementIcon: widgetElementItem['element_icon_value']
    };
    switch (widgetElementItem['element_subtype'].toLowerCase()) {
        case 'marker':
            widgetElementData = {
                ...widgetElementData,
                elementSubType: widgetElementItem['element_subtype'],
                markerMappingKey: widgetElementItem['request_mapping_key']
            };
            break;
        case 'marker-details':
            widgetElementData = {
                ...widgetElementData,
                elementSubType: widgetElementItem['element_subtype'],
                markerPrimaryDetails: widgetElementItem['default_key__accent_value'],
                markerDetailModalId: widgetElementItem['element_modal_id']
            };
            break;
        case 'history':
            widgetElementData = {
                ...widgetElementData,
                elementSubType: widgetElementItem['element_subtype'],
                markerPrimaryDetails: widgetElementItem['default_key__accent_value'],
                markerDetailModalId: widgetElementItem['element_modal_id']
            };
            break;
    }
    return widgetElementData;
};

const routeDataModifier = (arrayResponse) => {
    let modifiedRouteObj = {};
    if (arrayNotEmptyCheck(arrayResponse.rows)) {
        arrayResponse.rows.forEach((item) => {
            const parentRouteId = item['parent_route_id'];
            if (objectHasPropertyCheck(item, 'child_route_id') && objectHasPropertyCheck(modifiedRouteObj, parentRouteId)) {
                const childItem = childRouteCreator(item);
                modifiedRouteObj[parentRouteId]['childItems'] = modifiedRouteObj[parentRouteId]['childItems'] || [];
                modifiedRouteObj[parentRouteId]['childItems'].push(childItem);
            } else {
                const parentItem = {
                    itemId: item['parent_route_id'],
                    routeId: item['parent_route_id'],
                    routeModalId: item['parent_route_modal_id'],
                    action: item['parent_action'],
                    icon: item['parent_icon'],
                    position: item['route_position'],
                    routeType: item['parent_route_type'],
                    routeHoverTooltip: item['parent_route_hover_tooltip'],
                    routeOrderId: item['route_order_id'],
                    routeName: item['parent_route_name'],
                    routeUrl: item['parent_route_url'],
                    sideNavOrder: item['sidenav_order_id']
                };
                if (objectHasPropertyCheck(item, 'child_route_id')) {
                    parentItem['childItems'] = [childRouteCreator(item)];
                }
                modifiedRouteObj[parentRouteId] = parentItem;
            }
        });
    }
    return modifiedRouteObj;
};
const childRouteCreator = (item) => {
    const childItem = {
        itemId: item['child_route_id'],
        routeId: item['child_route_id'],
        action: item['child_action'],
        icon: item['child_icon'],
        routeModalId: item['child_route_modal_id'],
        position: item['route_position'],
        routeName: item['child_route_name'],
        routeUrl: item['child_route_url'],
        childOrderId: item['child_order_id']
    };
    return childItem;
};
const getCountryListGridBusiness = async (req) => {
    let request = {userId: req.query.userId, languageId: req.query.languageId}, userDetailsResponse,
        countryListResponse, finalResponse, countryIdList = {gridData: []};
    userDetailsResponse = await getUserNameFromUserIdAccessor([req.query.languageId, req.query.userId]);
    if (objectHasPropertyCheck(userDetailsResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(userDetailsResponse.rows)) {
        request.userRole = userDetailsResponse.rows[0]['native_user_role'];
        countryListResponse = await getCountryListAccessor(request);
    }
    if (objectHasPropertyCheck(countryListResponse, COMMON_CONSTANTS.FENNIX_ROWS) && arrayNotEmptyCheck(countryListResponse.rows)) {
        countryListResponse.rows.forEach(item => {
            let obj = {
                countryId: item['location_id'],
                countryName: item['country_name']
            };
            countryIdList.gridData.push(obj);
        });
        countryIdList.totalNoOfRecords = countryListResponse.rows.length;
        finalResponse = fennixResponse(statusCodeConstants.STATUS_OK, 'EN_US', countryIdList);
    } else {
        finalResponse = fennixResponse(statusCodeConstants.STATUS_NO_COUNTRIES_FOR_ID, 'EN_US', []);
    }
    return finalResponse;
};
module.exports = {
    getFilterMetadataBusiness,
    getBaseMetadataBusiness,
    getCardMetadataForRouteBusiness,
    getLoginMetadataBusiness,
    getModelMetadataBusiness,
    getLanguagesListBusiness,
    getRolesBusiness,
    listCentersBusiness,
    getLanguageListGridBusiness,
    getRolesForAdminBusiness,
    getCountryListBusiness,
    getCountryListGridBusiness,
    getRolesForNonAdminsBusiness
};
