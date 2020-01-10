const postgresDBLocal = {
	user: 'postgres',
	host: 'localhost',
	database: 'sofia_new_fennix_dev',
	password: 'postgres',
	port: 5432,
};

const postgresDBDev = {
	user: 'postgres',
	host: '45.25.128.244',
	database: 'dvignite_dev',
	password: 'DvPGSQL12',
	port: 5432,
	max: 1000,
};
const postgresSofiaDev = {
	user: 'postgres',
	host: '45.25.128.244',
	database: 'dvignite_dev',
	password: 'DvPGSQL12',
	port: 5432,
	max: 1000,
};
const imageLocalLocation = 'E:/DB/';

const imageDBLocation = '../fennix-images/';

const mongoLocal =
	'mongodb://dvignite:DvAdmin!@45.25.128.243:27017/dvignite_dev_mongo';

const mongoDev =
	'mongodb://dvignite:DvAdmin!@45.25.128.243:27017/dvignite_dev_mongo';
const mongoSofiaDev = 'mongodb://127.0.0.1:27017/dvignite_dev_mongo';
const mongoLab = 'mongodb://arup:hello123@ds131743.mlab.com:31743/fennix-360';

const TCPBeneficiaryPORT = '3100';
const TCPELockPORT = '3150';
const SocketLocPORT = '3180';

module.exports = {
	postgresDBLocal,
	postgresDBDev,
	mongoDev,
	mongoLocal,
	mongoSofiaDev,
	mongoLab,
	postgresSofiaDev,
	imageLocalLocation,
	imageDBLocation,
	SocketLocPORT,
	TCPBeneficiaryPORT,
	TCPELockPORT,
};
