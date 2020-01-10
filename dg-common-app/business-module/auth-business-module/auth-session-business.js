const authDataAccessors = require('../../repository-module/data-accesors/user-session-accessor');

const userLoginBusiness = async (req) =>{
    const userSession = await authDataAccessors.getUserSessionAccessor(req);
};

module.exports = {
    userLoginBusiness
};