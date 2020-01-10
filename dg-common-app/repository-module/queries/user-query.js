const checkUserEmailQuery = 'select  user_id,user_role as role, (select role_name from roles where role_id = u.user_role) as native_user_role, concat(first_name, \' \', last_name) as full_name FROM users u where email_id=$1';

const userProfileQuery = 'select u.first_name, u.last_name, u.mobile_no,u.center_id\n' +
    '    , u.address1\n' +
    '    , u.user_role as role\n' +
    '    , (select localized_text from localization where locale_key = (select role_name from roles where role_id = u.user_role) and language = $2) as role_name\n' +
    '    , u.email_id as emailid\n' +
    '    , u.image, u.gender\n' +
    '    ,u.location_id \n' +
    '    , (select localized_text from localization\n' +
    'where locale_key = (select locale_key from location where location_id = u.location_id) and language = $2) as location_name\n' +
    'from users u where u.user_id = $1;\n';

const authenticateUser = 'select (select localized_text from localization where locale_key = (select role_name from roles where role_id = u.user_role) and language = $2) as role_name,u.user_role,password, first_name, last_name, user_id, owner_user_id, email_id, isactive,u.center_id from users u\n' +
    'join roles r on r.role_id = u.user_role\n' +
    'where email_id=$1';

const updateUserProfileQuery = 'update users set first_name=$2,last_name=$3,address1=$4,mobile_no=$5,image=$6) where user_id=$1';

const getUserListQuery = 'select user_id, concat(first_name, \' \', last_name) as full_name, email_id, mobile_no, isactive, (select localized_text from localization where locale_key IN (select role_name from roles where role_id = user_role) and language = $1) as role,user_role as role_id, (select name from centers where center_id = u.center_id) as center, image from users u where isactive = true and owner_user_id IN ';

const getTotalRecordsForListUsersQuery = 'select count(*) from users u where isactive = true and owner_user_id IN ';
const getUserNameFromUserIdQuery = 'select concat(first_name, \' \', last_name) as full_name, (select localized_text from localization where locale_key = (select role_name from roles where role_id = u.user_role) and language = $1) as role_name, user_id, gender, user_role, (select role_name from roles where role_id = u.user_role) as native_user_role, company_id from users u where user_id = $2';
// const getUserNameFromUserIdQuery = 'select concat(first_name, \' \', last_name) as full_name, (select localized_text from localization where locale_key = (select role_name from roles where role_id = u.user_role) and language = $1) as role_name, user_id, gender, user_role, (select role_name from roles where role_id = u.user_role) as native_user_role from users u where user_id = $2';

const insertUserQuery = 'insert into ';

const getUserIdsForSupervisorQuery = 'select concat(first_name, \' \', last_name) as full_name, (select localized_text from localization where locale_key = (select role_name from roles where role_id = u.user_role) and language = $2) as role_name, user_id, gender, user_role from users u where owner_user_id = $1  or user_id = $1';

const getUserIdsForAdminQuery = 'select concat(first_name, \' \', last_name) as full_name, (select localized_text from localization where locale_key = (select role_name from roles where role_id = u.user_role) and language = $2) as role_name, user_id, gender, user_role from users u where owner_user_id IN (select user_id from users where owner_user_id = $1) or user_id = $1';
const getUserIdsForSuperAdminQuery = 'select concat(first_name, \' \', last_name) as full_name,\n' +
    '    (select localized_text from localization where locale_key = (select role_name from roles where role_id = u.user_role) and language = $1) as role_name\n' +
    '    , user_id, gender, user_role \n' +
    '    from users u where isactive = true and location_id = (select location_id from users where user_id = $2) and user_role IN (select role_id from roles where role_name IN (\'ROLE_CLIENT\', \'ROLE_CUSTOMS_ADMIN\', \'ROLE_E_LOCK_ADMIN\', \'ROLE_E_LOCK_COUNTRY_ADMIN\', \'ROLE_ELOCKS_OPERATOR\', \'ROLE_CUSTOMS_OPERATOR\'))';

const getUserIdsForMasterAdminQuery = 'select concat(first_name, \' \', last_name) as full_name,\n' +
    '    (select localized_text from localization where locale_key = (select role_name from roles where role_id = u.user_role) and language = $2) as role_name \n' +
    '    , user_id, gender, user_role\n' +
    '    from users u where location_id = $1';

const getUserIdsForGlobalAdminQuery = 'select concat(first_name, \' \', last_name) as full_name,\n' +
    '    (select localized_text from localization where locale_key = (select role_name from roles where role_id = u.user_role) and language = $1) as role_name\n' +
    '    , user_id, gender, user_role \n' +
    '    from users u where u.isactive = true';


const getUserIdsForCustomsQuery = 'select concat(first_name, \' \', last_name) as full_name,\n' +
    '    (select localized_text from localization where locale_key = (select role_name from roles where role_id = u.user_role) and language = $1) as role_name\n' +
    '    , user_id, gender, user_role \n' +
    '    from users u where u.isactive = true';

//TODO: change below query to accept multiple roles
const listUnassignedClientsQuery = 'select user_id, concat(first_name, \' \', last_name) as full_name from users where (company_id is null or company_id = 0) and user_role IN (select role_id from roles where role_name = $1)';

const listClientsByCompanyIdQuery = 'select user_id, concat(first_name, \' \', last_name) as full_name, email_id, company_id from users where user_role IN (select role_id from roles where role_name = $1) and company_id IN ';
module.exports = {
    listClientsByCompanyIdQuery,
    insertUserQuery,
    listUnassignedClientsQuery,
    getUserIdsForGlobalAdminQuery,
    getUserListQuery,
    checkUserEmailQuery,
    getUserIdsForCustomsQuery,
    userProfileQuery,
    authenticateUser,
    updateUserProfileQuery,
    getUserNameFromUserIdQuery,
    getUserIdsForAdminQuery,
    getUserIdsForMasterAdminQuery,
    getUserIdsForSuperAdminQuery,
    getUserIdsForSupervisorQuery,
    getTotalRecordsForListUsersQuery
};
