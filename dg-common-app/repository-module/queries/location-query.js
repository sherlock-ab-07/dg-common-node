const {locationDetails, locationCounter} = require('../models/beneficiary-location-model');

const selectCenterIdsForLoggedInUserAndSubUsersQuery = 'select distinct center_id, (select name from centers where center_id = u.center_id) as center_name from users u where user_id IN ';

const getBeneficiaryLocationList = (query) => {
    return locationDetails.aggregate()
        .match({beneficiaryId: {$in: query}})
        .sort({"deviceDate": -1})
        .project({
            beneficiaryId: 1,
            latitude: 1,
            longitude: 1,
            locationId: 1
        })
        .group({
            _id: "$beneficiaryId",
            latestBeneficiaryLocation: {"$first": "$$CURRENT"}
        });
};

// const locationCounterQuery = () => {
//     return locationCounter.find({})
// };
//
// const insertNextPrimaryKeyQuery = (req) => {
//     locationCounter.update({_id: req}, {$inc: {counter: 1}}).then(doc => {
//         if (!doc) {
//             console.log('error');
//         }
//         // else {
//         //     console.log('success');
//         // }
//     });
// };
const locationCounterQuery = () => {
    return locationCounter.findOneAndUpdate({}, {$inc: {counter: 1}});
};

const getBeneficiaryMapHistoryQuery = (req) => {
    return locationDetails.find(
        {
            deviceDate: {
                $gte: new Date(`${req.fromDate}`),
                $lte: new Date(`${req.toDate}`)
            },
            beneficiaryId: req.beneficiaryId
        }).sort({deviceDate: -1});
};

const locationDetailsUpdateQuery = (req) => {
    let location = new locationDetails({
        _id: req._id,
        beneficiaryId: req.beneficiaryId,
        deviceDate: req.deviceDate,
        latitude: req.latitude,
        longitude: req.longitude,
        speed: req.speed
    });
    location.save(function (err) {
        if (err) return console.error(err);
    });
};

//SUPERVISOR & ADMIN
const selectCountryForSupervisorAndAdminQuery = 'select (select localized_text from localization where locale_key = loc.locale_key and language = $2) as country_name,location_id, loc.locale_key from location loc where location_id = (select location_id from users where user_id = $1)';

//SUPER_ADMIN
const selectCountryForSuperAdminQuery = 'select (select localized_text from localization where locale_key = loc.locale_key and language = $2) as country_name,location_id, loc.locale_key from location loc where location_id IN (select location_id from users where user_id = $1)';

//MASTER_ADMIN
const selectAllCountriesForMasterAdminQuery = 'select (select localized_text from localization where locale_key = loc.locale_key and language = $1) as country_name,location_id, loc.locale_key from location loc where location_level = 3';

//OPERATOR
const selectCenterIdsForOperatorQuery = 'select c.location_id, (select name from centers where location_id = c.location_id) as location_name from location c where parent_location_id IN (select location_id from users where user_id = $1)';

//SUPERVISOR
// const selectCenterIdsForSupervisorQuery = 'select c.location_id, (select name from centers where location_id = c.location_id) as location_name from location c where parent_location_id IN (select location_id from location where parent_location_id IN (select location_id from users where user_id = $1))';
// const selectCenterIdsForSupervisorQuery = 'select center_id as location_id, name as location_name from centers where center_id = (select center_id from users where user_id = $1)';
const selectCenterIdsForSupervisorQuery = 'select center_id as location_id, name as location_name from centers where location_id in (select location_id from location where parent_location_id IN (select location_id from users where user_id = $1) and location_level = 0)';
//ADMIN
const selectCenterIdsForAdminQuery = 'select c.location_id, (select name from centers where location_id = c.location_id) as location_name from location c where parent_location_id IN (select location_id from location where parent_location_id IN (select location_id from location where parent_location_id IN (select location_id from users where user_id = $1)))';

//SUPER_ADMIN
const selectCenterIdsForSuperAdminQuery = 'select loc.center_id as location_id, loc.name as location_name from centers loc where center_id = (select center_id from users where user_id = $1)';

//MASTER_ADMIN
const selectAllCenterIdsForMasterAdminQuery = 'select c.location_id, (select name from centers where location_id = c.location_id) as location_name from location c where location_level = 0';

//GLOBAL_ADMIN
const selectAllCountriesForGlobalAdminQuery = 'select (select localized_text from localization where locale_key = loc.locale_key and language = $1) as country_name,location_id, loc.locale_key from location loc where location_level = 3';

//GLOBAL_ADMIN
const selectAllCenterIdsForGlobalAdminQuery = 'select c.location_id, (select name from centers where location_id = c.location_id) as location_name from location c where location_level = 0';

const selectCenterIdsForGivenUserIdQuery = 'select location_id from location where parent_location_id = (select location_id from location where parent_location_id = (select location_id from users where user_id = $1))';

const getCountryCodeByLocationIdQuery = 'select location_code from location where location_id = $1';

module.exports = {
    getBeneficiaryLocationList,
    selectCenterIdsForSupervisorQuery,
    selectCenterIdsForAdminQuery,
    selectCenterIdsForSuperAdminQuery,
    selectAllCenterIdsForMasterAdminQuery,
    selectCenterIdsForGivenUserIdQuery,
    selectCenterIdsForOperatorQuery,
    selectCountryForSupervisorAndAdminQuery,
    selectCountryForSuperAdminQuery,
    locationDetailsUpdateQuery,
    locationCounterQuery,
    getCountryCodeByLocationIdQuery,
    selectAllCountriesForMasterAdminQuery,
    selectCenterIdsForLoggedInUserAndSubUsersQuery,
    selectAllCountriesForGlobalAdminQuery,
    selectAllCenterIdsForGlobalAdminQuery,
    getBeneficiaryMapHistoryQuery
};
