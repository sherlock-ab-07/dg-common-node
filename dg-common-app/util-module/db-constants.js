const TABLE_USERS = 'users';
const TABLE_BENEFICIARIES = 'beneficiaries';
const TABLE_FAMILY_INFO = 'family_info';
const TABLE_ACCOUNTING = 'accounting';
const TABLE_ROLES = 'roles';
const TABLE_LOCATION = 'location';
const TABLE_CONTAINER = 'container';
const TABLE_COMPANY = 'company';

const dbTableColMap = {
    users: {
        locationId: 'location_id',
        address: 'address1',
        center: 'center_id',
        country: 'location_id',
        firstName: 'first_name',
        lastName: 'last_name',
        emailId: 'email_id',
        password:'password',
        phoneNo: 'mobile_no',
        gender: 'gender',
        image: 'image',
        companyId: 'company_id',
        created_date:'created_date',
        updated_date:'updated_date',
        first_time_login:'first_time_login',
        role: 'user_role',
        isActive:'isactive',
        userId: 'owner_user_id'
    },
    company: {
        companyId: 'company_id',//state,country,telephone,tax_id,city,addr1,addr2
        companyName: 'company_name',
        companyType: 'company_type',
        companyAddress: 'company_address',
        companyPhone: 'company_phone',
        userId: 'owner_user_id',
        companyEmail: 'company_email',
        companyState: 'company_state',
        companyCity: 'company_city',
        companyCountry: 'company_country',
        customsId: 'customs_id',
        isActive: 'isactive',
        createdBy: 'created_by',
        createdDate: 'created_date',
        updatedDate: 'updated_date',
        updatedBy: 'updated_by',
        noOfRoutes: 'no_of_routes',
        noOfClients: 'no_of_clients'
    },
    beneficiaries: {
        firstName: 'firstname',
        middleName: 'middle_name',
        secondName: 'second_last_name',
        lastName: 'first_last_name',
        emailId: 'emailid',
        mobileNo: 'mobileno',
        gender: 'gender',
        image: 'image',
        locationId: 'location_id',
        height: 'height',
        weight: 'weight',
        role: 'beneficiary_role',
        hairColor: 'hair_color',
        eyeColor: 'eye_color',
        crimeId: 'crime_id',
        deviceId: 'device_id',
        documentId: 'document_id',
        ethnicityId: 'ethnicity_id',
        centerId: 'center_id',
        languageId: 'language_id',
        riskId: 'risk_id',
        scar: 'scars_marks_tatoos',
        dob: 'dob',
        hasHouseArrest: 'hashousearrest',
        address: 'address1',
        violationTypeId: 'violation_type_id',
        timeZone: 'time_zone_id',
        zipCode: 'postal_code',
        operatorId: 'owner_user_id',
        center: 'center_id',
        accountingId: 'accounting_id',
        lawyerId: 'lawyer_id',
        tutorId: 'tutor_id',
        whatsAppNo: 'whatsapp_number',
        districtAttorney: 'district_attorney',
        judge: 'judge',
        courtHouse: 'court_house',
        sentenceCountry: 'sentence_country',
        sentenceCity: 'sentence_city',
        sentenceHouseArrest: 'sentence_house_arrest',
        sentenceRestrainingOrder: 'sentence_restraining_order',
        location0: 'location_0',
        location1: 'location_1',
        location2: 'location_2',
        location3: 'location_3',
        location4: 'location_4',
        country: 'location_3',
        isActive: 'isactive',
        baseFolderPath: 'dropbox_base_path',
        endDate: 'end_date',
        startDate: 'start_date',
        createdDate: 'created_date',
        updatedDate: 'updated_date',
        deactivatedBy: 'deactivated_by',
        updatedBy: 'updated_by',
        createdBy: 'created_by',
        deviceAssignedBy: 'device_assigned_by',
        customsId: 'customs_id',
        appType: 'app_type',
        appCode: 'app_code'
    },
    family_info: {
        familyPrimaryName: 'primary_name',
        familyPrimaryPhoneNo: 'primary_phone_no',
        familyPrimaryGender: 'primary_gender',
        familyPrimaryRelation: 'primary_relation',
        familySecondaryName: 'secondary_name',
        familySecondaryPhoneNo: 'secondary_phone_no',
        familySecondaryGender: 'secondary_gender',
        familySecondaryRelation: 'secondary_relation',
        beneficiaryId: 'beneficiaryid'
    },
    container: {
        containerName: 'container_name',
        containerType: 'container_type',
        companyName: 'company_name',
        companyId: 'company_id',
        containerColor: 'container_color',
        containerLength: 'container_length',
        containerWidth: 'container_width',
        containerHeight: 'container_height',
        containerUnitType: 'container_unit_type',
        containerCapacity: 'container_capacity',
        containerVolume: 'container_volume',
        userId: 'owner_user_id',
        deviceId: 'device_id',
        createdDate: 'created_date',
        updatedDate: 'updated_date',
        startDate: 'start_date',
        endDate: 'end_date',
        createdBy: 'created_by',
        updatedBy: 'updated_by',
        deactivatedBy: 'deactivated_by',
        field1: 'field1',
        field2: 'field2',
        field3: 'field3',
        dropboxBasePath: 'dropbox_base_path',
        containerImage: 'container_image',
        isActive: 'isactive',
        country: 'country',
        centerId: 'center_id',
        documentId: 'document_id',
        containerId: 'container_id',
        masterPassword: 'master_password',
        activePassword: 'active_password',
        containerLockStatus: 'container_lock_status',
        containerUniqueId: 'container_unique_id'
    },
    accounting: {
        creditCard: 'credit_card',
        cvCode: 'cv_code',
        startDate: 'starting_date',
        expiryDate: 'expiration_date',
        beneficiaryId: 'beneficiaryid'
    },
    filterset: {
        roleCardId: 'role_card_id',
        routeId: 'route_id',
        roleCardWidgetId: 'role_card_widget_id'
    }
};
const dbDownloadTableMapper = {
    beneficiaries: {
        beneficiaryId: 'beneficiaryid',
        beneficiaryName: 'full_name',
        emailId: 'emailid',
        mobileNo: 'mobileno',
        role: 'role_name',
        gender: 'gender',
        crimeId: 'crime_id',
        documentId: 'document_id',
        center: 'center_name'
    },
    devices: {
        deviceId: '_id',
        deviceType: 'deviceType',
        deviceName: 'name',
        imei: 'imei'
    },
    users: {
        userId: 'user_id',
        userName: 'full_name',
        emailId: 'email_id',
        mobileNo: 'mobile_no',
        role: 'role',
        center: 'center'
    },
    tickets: {
        ticketId: 'ticketId',
        ticketName: 'ticketName',
        userName: 'userName',
        userRole: 'userRole',
        beneficiaryName: 'beneficiaryName',
        beneficiaryRole: 'beneficiaryRole',
        imei: 'imeiNumber'
    }
};

const tableKeyMap = {
    beneficiaries: {key: 'beneficiaryid'},
    users: {key: 'user_id'},
    tickets: {key: 'ticketId'},
    family_info: {key: 'family_info_id'},
    accounting: {key: 'accounting_id'},
    container: {key: 'container_id'},
    company: {key: 'company_id'}
};
const filtersMapping = {
    containerFilters: {
        companyId: 'company_id',
        containerType: 'container_type'
    }
};
const tableDefaultSortMap = {
    beneficiaries: {sortBy: 'beneficiaryid', sortOrder: 'desc'},
    users: {sortBy: 'user_id', sortOrder: 'desc'},
    tickets: {sortBy: 'ticketId', sortOrder: 'desc'},
    family_info: {sortBy: 'family_info_id', sortOrder: 'desc'},
    accounting: {sortBy: 'accounting_id', sortOrder: 'desc'},
    container: {sortBy: 'start_date', sortOrder: 'desc'}
};
module.exports = {
    TABLE_BENEFICIARIES,
    TABLE_LOCATION,
    TABLE_ROLES,
    TABLE_USERS,
    TABLE_CONTAINER,
    TABLE_COMPANY,
    TABLE_FAMILY_INFO,
    TABLE_ACCOUNTING,
    dbTableColMap,
    tableKeyMap,
    filtersMapping,
    tableDefaultSortMap,
    dbDownloadTableMapper
};
