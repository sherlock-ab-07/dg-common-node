var express = require('express');
var router = express.Router();
const {
	METADATA_CONTROLLER,
} = require('../util-module/util-constants/fennix-controller-constants');
const metadataBusiness = require('../business-module/metadata-business-module/metadata-business');

router.get(METADATA_CONTROLLER.METADATA_LIST_CENTERS, (req, res) => {
	let returnObj;
	returnObj = metadataBusiness.listCentersBusiness(req);
	returnObj.then(response => {
		res.send(response);
	});
});
router.get(METADATA_CONTROLLER.METADATA_LIST_COUNTRIES, (req, res) => {
	let returnObj;
	returnObj = metadataBusiness.getCountryListBusiness(req);
	returnObj.then(response => {
		res.send(response);
	});
});
router.post(METADATA_CONTROLLER.METADATA_BASE_METADATA, (req, res) => {
	let returnObj;
	returnObj = metadataBusiness.getBaseMetadataBusiness(req);
	returnObj.then(response => {
		res.send(response);
	});
});

router.post(METADATA_CONTROLLER.METADATA_CARD_METADTA, (req, res) => {
	let returnObj;
	returnObj = metadataBusiness.getCardMetadataForRouteBusiness(req);
	returnObj.then(response => {
		res.send(response);
	});
});

router.get(METADATA_CONTROLLER.METADATA_LIST_LANGUAGES, (req, res) => {
	let returnObj;
	returnObj = metadataBusiness.getLanguagesListBusiness(req);
	returnObj.then(response => {
		res.send(response);
	});
});

router.get(METADATA_CONTROLLER.METADATA_LOGIN_METADATA, (req, res) => {
	let returnObj;
	console.log('login metadata');
	returnObj = metadataBusiness.getLoginMetadataBusiness(req);
	returnObj.then(response => {
		res.send(response);
	});
});

router.get(METADATA_CONTROLLER.METADATA_MODAL_METADATA, (req, res) => {
	let returnObj;
	returnObj = metadataBusiness.getModelMetadataBusiness(req);
	returnObj.then(response => {
		res.send(response);
	});
});

router.get(METADATA_CONTROLLER.METADATA_ALL_ROLES, (req, res) => {
	let returnObj;
	returnObj = metadataBusiness.getRolesBusiness(req);
	returnObj.then(response => {
		res.send(response);
	});
});

router.get(METADATA_CONTROLLER.METADATA_CARD_FILTER, (req, res) => {
	let returnObj;
	returnObj = metadataBusiness.getFilterMetadataBusiness(req, 'roleCardId');
	returnObj.then(response => {
		res.send(response);
	});
});

router.get(METADATA_CONTROLLER.METADATA_WIDGET_FILTER, (req, res) => {
	let returnObj;
	returnObj = metadataBusiness.getFilterMetadataBusiness(
		req,
		'roleCardWidgetId',
	);
	returnObj.then(response => {
		res.send(response);
	});
});

router.get(METADATA_CONTROLLER.METADATA_PAGE_FILTER, (req, res) => {
	let returnObj;
	returnObj = metadataBusiness.getFilterMetadataBusiness(req, 'routeId');
	returnObj.then(response => {
		res.send(response);
	});
});

router.get(METADATA_CONTROLLER.METADATA_ALL_ROLES_FOR_ADMIN, (req, res) => {
	let returnObj;
	returnObj = metadataBusiness.getRolesForAdminBusiness(req);
	returnObj.then(response => {
		res.send(response);
	});
});

router.get(METADATA_CONTROLLER.METADATA_ALL_ROLES_FOR_NON_ADMIN, (req, res) => {
	let returnObj;
	returnObj = metadataBusiness.getRolesForNonAdminsBusiness(req);
	returnObj.then(response => {
		res.send(response);
	});
});

router.get(METADATA_CONTROLLER.METADATA_LIST_LANGUAGES_FOR_GRID, (req, res) => {
	let returnObj;
	returnObj = metadataBusiness.getLanguageListGridBusiness(req);
	returnObj.then(response => {
		res.send(response);
	});
});

router.get(METADATA_CONTROLLER.METADATA_LIST_COUNTRIES_FOR_GRID, (req, res) => {
	let returnObj;
	returnObj = metadataBusiness.getCountryListGridBusiness(req);
	returnObj.then(response => {
		res.send(response);
	});
});

module.exports = router;
