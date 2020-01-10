const getDropdownDataQuery = 'select d.dropdown_type, d.dropdown_name, d.dropdown_id\n' +
    '    , ds.dropdown_set_id, ds.dropdown_key, (select localized_text from localization where locale_key = ds.dropdown_value and language = $2) as dropdown_value, ds.is_disable\n' +
    '    ,ds.is_primary_action, ds.dropdown_action_button_icon_value, ds.dropdown_action_button_icon_key, ds.is_action_button, ds.dropdown_action_button_modal_id,ds.dropdown_transfer_key\n' +
    '    , dse.endpoint, dse.endpoint_mandatory_request_params, dse.endpoint_request_type\n' +
    '    , r.route_id, r.route_url, (select localized_text from localization where locale_key = r.route_name and language = $2) as route_name\n' +
    '    , a.action_name\n' +
    '    from dropdown d\n' +
    '    join dropdown_set ds on d.dropdown_id = ds.dropdown_id and d.dropdown_id = $1\n' +
    '    left outer join endpoints dse on dse.endpoint_id = ds.dropdown_action_button_submit_endpoint\n' +
    '    left outer join route r on r.route_id = dropdown_action_button_route_id \n' +
    '    left outer join action a on a.action_id = ds.on_change_action;\n';

const getDownloadMapperQuery = 'select mapping_key, localized_key from download_mapper';

const getContainerCheckboxMetadataQuery = 'select ccs.checkbox_container_set_name, ccs.checkbox_container_set_id\n' +
    '    , cdd.request_mapping_key, cdd.default_value\n' +
    '    , (select localized_text from localization where locale_key = cdd.element_title and language = $2) as element_title, cdd.element_primary_value, cdd.element_width, cdd.element_secondary_value\n' +
    '    , cdd.checkbox_deviceattributes_dynamiccontainer_id\n' +
    '    , checkbox_deviceattributes_dynamiccontainer_order_id\n' +
    '    , wa.widget_attribute_id, wa.element_type as widget_element_type, wa.sub_type as widget_sub_type\n' +
    '    from checkbox_deviceattributes_dynamiccontainer cdd \n' +
    '    join checkbox_container_set ccs\n' +
    '    on cdd.checkbox_container_set_id = ccs.checkbox_container_set_id and cdd.checkbox_container_set_id = $1\n' +
    '    left join widget_attributes wa \n' +
    '    on cdd.widget_attribute_id = wa.widget_attribute_id';


const getDropdownValueByDropdownIdQuery = 'select localized_text as dropdown_value from localization where locale_key = (select dropdown_value from dropdown_set where dropdown_set_id = $1) and language = \'EN_US\'';

module.exports = {
    getDropdownDataQuery,
    getDropdownValueByDropdownIdQuery,
    getDownloadMapperQuery,
    getContainerCheckboxMetadataQuery
};