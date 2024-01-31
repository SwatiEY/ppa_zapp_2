/* eslint-disable prettier/prettier, camelcase, prefer-const, no-unused-vars */
import config from "config";
import utils from "zkp-utils";
import GN from "general-number";
import fs from "fs";

import {
	getContractInstance,
	getContractAddress,
	registerKey,
	registerZKPKey,
} from "./common/contract.mjs";
import {
	storeCommitment,
	getCurrentWholeCommitment,
	getCommitmentsById,
	getAllCommitments,
	getInputCommitments,
	joinCommitments,
	markNullified,
} from "./common/commitment-storage.mjs";
import { generateProof } from "./common/zokrates.mjs";
import { getMembershipWitness, getRoot } from "./common/timber.mjs";
import Web3 from "./common/web3.mjs";
import {
	decompressStarlightKey,
	poseidonHash,
} from "./common/number-theory.mjs";

const { generalise } = GN;
const db = "/app/orchestration/common/db/preimage.json";
const web3 = Web3.connection();
const keyDb = "/app/orchestration/common/db/key.json";

export default async function setInitialContractParams(
	_strikePriceParam,
	_bundlePriceParam,
	_volumeShareParam,
	_numberOfConsecutivePeriodsForShortfallParam,
	_shortfallThresholdParam,
	_numberOfConsecutivePeriodsForSurplusParam,
	_surplusThresholdParam,
	_dailyInterestRateParam,
	_expiryDateOfContractParam,
	_sequenceNumberIntervalParam,
	_referenceDate,
	_strikePrice_newOwnerPublicKey = 0,
	_bundlePrice_newOwnerPublicKey = 0,
	_volumeShare_newOwnerPublicKey = 0,
	_dailyInterestRate_newOwnerPublicKey = 0,
	_expiryDateOfContract_newOwnerPublicKey = 0,
	_latestShortfallSequenceNumber_newOwnerPublicKey = 0,
	_latestSurplusSequenceNumber_newOwnerPublicKey = 0,
	_sequenceNumberInterval_newOwnerPublicKey = 0,
	_numberOfConsecutivePeriodsForShortfall_newOwnerPublicKey = 0,
	_shortfallThreshold_newOwnerPublicKey = 0,
	_numberOfConsecutivePeriodsForSurplus_newOwnerPublicKey = 0,
	_surplusThreshold_newOwnerPublicKey = 0
) {
	// Initialisation of variables:

	const instance = await getContractInstance("SyntheticPpaShield");

	const contractAddr = await getContractAddress("SyntheticPpaShield");

	const msgValue = 0;
	const strikePriceParam = generalise(_strikePriceParam);
	const bundlePriceParam = generalise(_bundlePriceParam);
	const volumeShareParam = generalise(_volumeShareParam);
	const numberOfConsecutivePeriodsForShortfallParam = generalise(
		_numberOfConsecutivePeriodsForShortfallParam
	);
	const shortfallThresholdParam = generalise(_shortfallThresholdParam);
	const numberOfConsecutivePeriodsForSurplusParam = generalise(
		_numberOfConsecutivePeriodsForSurplusParam
	);
	const surplusThresholdParam = generalise(_surplusThresholdParam);
	const dailyInterestRateParam = generalise(_dailyInterestRateParam);
	const expiryDateOfContractParam = generalise(_expiryDateOfContractParam);
	const sequenceNumberIntervalParam = generalise(_sequenceNumberIntervalParam);
	const referenceDate = generalise(_referenceDate);
	let strikePrice_newOwnerPublicKey = generalise(
		_strikePrice_newOwnerPublicKey
	);
	let bundlePrice_newOwnerPublicKey = generalise(
		_bundlePrice_newOwnerPublicKey
	);
	let volumeShare_newOwnerPublicKey = generalise(
		_volumeShare_newOwnerPublicKey
	);
	let dailyInterestRate_newOwnerPublicKey = generalise(
		_dailyInterestRate_newOwnerPublicKey
	);
	let expiryDateOfContract_newOwnerPublicKey = generalise(
		_expiryDateOfContract_newOwnerPublicKey
	);
	let latestShortfallSequenceNumber_newOwnerPublicKey = generalise(
		_latestShortfallSequenceNumber_newOwnerPublicKey
	);
	let latestSurplusSequenceNumber_newOwnerPublicKey = generalise(
		_latestSurplusSequenceNumber_newOwnerPublicKey
	);
	let sequenceNumberInterval_newOwnerPublicKey = generalise(
		_sequenceNumberInterval_newOwnerPublicKey
	);
	let numberOfConsecutivePeriodsForShortfall_newOwnerPublicKey = generalise(
		_numberOfConsecutivePeriodsForShortfall_newOwnerPublicKey
	);
	let shortfallThreshold_newOwnerPublicKey = generalise(
		_shortfallThreshold_newOwnerPublicKey
	);
	let numberOfConsecutivePeriodsForSurplus_newOwnerPublicKey = generalise(
		_numberOfConsecutivePeriodsForSurplus_newOwnerPublicKey
	);
	let surplusThreshold_newOwnerPublicKey = generalise(
		_surplusThreshold_newOwnerPublicKey
	);

	// Read dbs for keys and previous commitment values:

	if (!fs.existsSync(keyDb))
		await registerKey(utils.randomHex(31), "SyntheticPpaShield", true);
	await registerZKPKey(keyDb, "SyntheticPpaShield");
	const keys = JSON.parse(
		fs.readFileSync(keyDb, "utf-8", (err) => {
			console.log(err);
		})
	);
	const secretKey = generalise(keys.secretKey);
	const publicKey = generalise(keys.publicKey);

	// Initialise commitment preimage of whole state:

	const strikePrice_stateVarId = generalise(5).hex(32);

	let strikePrice_commitmentExists = true;
	let strikePrice_witnessRequired = true;

	const strikePrice_commitment = await getCurrentWholeCommitment(
		strikePrice_stateVarId
	);

	let strikePrice_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!strikePrice_commitment) {
		strikePrice_commitmentExists = false;
		strikePrice_witnessRequired = false;
	} else {
		strikePrice_preimage = strikePrice_commitment.preimage;
	}

	// Initialise commitment preimage of whole state:

	const bundlePrice_stateVarId = generalise(7).hex(32);

	let bundlePrice_commitmentExists = true;
	let bundlePrice_witnessRequired = true;

	const bundlePrice_commitment = await getCurrentWholeCommitment(
		bundlePrice_stateVarId
	);

	let bundlePrice_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!bundlePrice_commitment) {
		bundlePrice_commitmentExists = false;
		bundlePrice_witnessRequired = false;
	} else {
		bundlePrice_preimage = bundlePrice_commitment.preimage;
	}

	// Initialise commitment preimage of whole state:

	const volumeShare_stateVarId = generalise(9).hex(32);

	let volumeShare_commitmentExists = true;
	let volumeShare_witnessRequired = true;

	const volumeShare_commitment = await getCurrentWholeCommitment(
		volumeShare_stateVarId
	);

	let volumeShare_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!volumeShare_commitment) {
		volumeShare_commitmentExists = false;
		volumeShare_witnessRequired = false;
	} else {
		volumeShare_preimage = volumeShare_commitment.preimage;
	}

	// Initialise commitment preimage of whole state:

	const dailyInterestRate_stateVarId = generalise(11).hex(32);

	let dailyInterestRate_commitmentExists = true;
	let dailyInterestRate_witnessRequired = true;

	const dailyInterestRate_commitment = await getCurrentWholeCommitment(
		dailyInterestRate_stateVarId
	);

	let dailyInterestRate_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!dailyInterestRate_commitment) {
		dailyInterestRate_commitmentExists = false;
		dailyInterestRate_witnessRequired = false;
	} else {
		dailyInterestRate_preimage = dailyInterestRate_commitment.preimage;
	}

	// Initialise commitment preimage of whole state:

	const expiryDateOfContract_stateVarId = generalise(13).hex(32);

	let expiryDateOfContract_commitmentExists = true;
	let expiryDateOfContract_witnessRequired = true;

	const expiryDateOfContract_commitment = await getCurrentWholeCommitment(
		expiryDateOfContract_stateVarId
	);

	let expiryDateOfContract_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!expiryDateOfContract_commitment) {
		expiryDateOfContract_commitmentExists = false;
		expiryDateOfContract_witnessRequired = false;
	} else {
		expiryDateOfContract_preimage = expiryDateOfContract_commitment.preimage;
	}

	// Initialise commitment preimage of whole state:

	const latestShortfallSequenceNumber_stateVarId = generalise(22).hex(32);

	let latestShortfallSequenceNumber_commitmentExists = true;
	let latestShortfallSequenceNumber_witnessRequired = true;

	const latestShortfallSequenceNumber_commitment = await getCurrentWholeCommitment(
		latestShortfallSequenceNumber_stateVarId
	);

	let latestShortfallSequenceNumber_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!latestShortfallSequenceNumber_commitment) {
		latestShortfallSequenceNumber_commitmentExists = false;
		latestShortfallSequenceNumber_witnessRequired = false;
	} else {
		latestShortfallSequenceNumber_preimage =
			latestShortfallSequenceNumber_commitment.preimage;
	}

	// Initialise commitment preimage of whole state:

	const latestSurplusSequenceNumber_stateVarId = generalise(29).hex(32);

	let latestSurplusSequenceNumber_commitmentExists = true;
	let latestSurplusSequenceNumber_witnessRequired = true;

	const latestSurplusSequenceNumber_commitment = await getCurrentWholeCommitment(
		latestSurplusSequenceNumber_stateVarId
	);

	let latestSurplusSequenceNumber_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!latestSurplusSequenceNumber_commitment) {
		latestSurplusSequenceNumber_commitmentExists = false;
		latestSurplusSequenceNumber_witnessRequired = false;
	} else {
		latestSurplusSequenceNumber_preimage =
			latestSurplusSequenceNumber_commitment.preimage;
	}

	// Initialise commitment preimage of whole state:

	const sequenceNumberInterval_stateVarId = generalise(31).hex(32);

	let sequenceNumberInterval_commitmentExists = true;
	let sequenceNumberInterval_witnessRequired = true;

	const sequenceNumberInterval_commitment = await getCurrentWholeCommitment(
		sequenceNumberInterval_stateVarId
	);

	let sequenceNumberInterval_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!sequenceNumberInterval_commitment) {
		sequenceNumberInterval_commitmentExists = false;
		sequenceNumberInterval_witnessRequired = false;
	} else {
		sequenceNumberInterval_preimage =
			sequenceNumberInterval_commitment.preimage;
	}

	// Initialise commitment preimage of whole state:

	const numberOfConsecutivePeriodsForShortfall_stateVarId = generalise(60).hex(
		32
	);

	let numberOfConsecutivePeriodsForShortfall_commitmentExists = true;
	let numberOfConsecutivePeriodsForShortfall_witnessRequired = true;

	const numberOfConsecutivePeriodsForShortfall_commitment = await getCurrentWholeCommitment(
		numberOfConsecutivePeriodsForShortfall_stateVarId
	);

	let numberOfConsecutivePeriodsForShortfall_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!numberOfConsecutivePeriodsForShortfall_commitment) {
		numberOfConsecutivePeriodsForShortfall_commitmentExists = false;
		numberOfConsecutivePeriodsForShortfall_witnessRequired = false;
	} else {
		numberOfConsecutivePeriodsForShortfall_preimage =
			numberOfConsecutivePeriodsForShortfall_commitment.preimage;
	}

	// Initialise commitment preimage of whole state:

	const shortfallThreshold_stateVarId = generalise(62).hex(32);

	let shortfallThreshold_commitmentExists = true;
	let shortfallThreshold_witnessRequired = true;

	const shortfallThreshold_commitment = await getCurrentWholeCommitment(
		shortfallThreshold_stateVarId
	);

	let shortfallThreshold_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!shortfallThreshold_commitment) {
		shortfallThreshold_commitmentExists = false;
		shortfallThreshold_witnessRequired = false;
	} else {
		shortfallThreshold_preimage = shortfallThreshold_commitment.preimage;
	}

	// Initialise commitment preimage of whole state:

	const numberOfConsecutivePeriodsForSurplus_stateVarId = generalise(72).hex(
		32
	);

	let numberOfConsecutivePeriodsForSurplus_commitmentExists = true;
	let numberOfConsecutivePeriodsForSurplus_witnessRequired = true;

	const numberOfConsecutivePeriodsForSurplus_commitment = await getCurrentWholeCommitment(
		numberOfConsecutivePeriodsForSurplus_stateVarId
	);

	let numberOfConsecutivePeriodsForSurplus_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!numberOfConsecutivePeriodsForSurplus_commitment) {
		numberOfConsecutivePeriodsForSurplus_commitmentExists = false;
		numberOfConsecutivePeriodsForSurplus_witnessRequired = false;
	} else {
		numberOfConsecutivePeriodsForSurplus_preimage =
			numberOfConsecutivePeriodsForSurplus_commitment.preimage;
	}

	// Initialise commitment preimage of whole state:

	const surplusThreshold_stateVarId = generalise(74).hex(32);

	let surplusThreshold_commitmentExists = true;
	let surplusThreshold_witnessRequired = true;

	const surplusThreshold_commitment = await getCurrentWholeCommitment(
		surplusThreshold_stateVarId
	);

	let surplusThreshold_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!surplusThreshold_commitment) {
		surplusThreshold_commitmentExists = false;
		surplusThreshold_witnessRequired = false;
	} else {
		surplusThreshold_preimage = surplusThreshold_commitment.preimage;
	}

	// read preimage for whole state
	strikePrice_newOwnerPublicKey =
		_strikePrice_newOwnerPublicKey === 0
			? generalise(
					await instance.methods
						.zkpPublicKeys(await instance.methods.owner().call())
						.call()
			  )
			: strikePrice_newOwnerPublicKey;

	const strikePrice_currentCommitment = strikePrice_commitmentExists
		? generalise(strikePrice_commitment._id)
		: generalise(0);
	const strikePrice_prev = generalise(strikePrice_preimage.value);
	const strikePrice_prevSalt = generalise(strikePrice_preimage.salt);

	// read preimage for whole state
	bundlePrice_newOwnerPublicKey =
		_bundlePrice_newOwnerPublicKey === 0
			? generalise(
					await instance.methods
						.zkpPublicKeys(await instance.methods.owner().call())
						.call()
			  )
			: bundlePrice_newOwnerPublicKey;

	const bundlePrice_currentCommitment = bundlePrice_commitmentExists
		? generalise(bundlePrice_commitment._id)
		: generalise(0);
	const bundlePrice_prev = generalise(bundlePrice_preimage.value);
	const bundlePrice_prevSalt = generalise(bundlePrice_preimage.salt);

	// read preimage for whole state
	volumeShare_newOwnerPublicKey =
		_volumeShare_newOwnerPublicKey === 0
			? generalise(
					await instance.methods
						.zkpPublicKeys(await instance.methods.owner().call())
						.call()
			  )
			: volumeShare_newOwnerPublicKey;

	const volumeShare_currentCommitment = volumeShare_commitmentExists
		? generalise(volumeShare_commitment._id)
		: generalise(0);
	const volumeShare_prev = generalise(volumeShare_preimage.value);
	const volumeShare_prevSalt = generalise(volumeShare_preimage.salt);

	// read preimage for whole state
	dailyInterestRate_newOwnerPublicKey =
		_dailyInterestRate_newOwnerPublicKey === 0
			? generalise(
					await instance.methods
						.zkpPublicKeys(await instance.methods.owner().call())
						.call()
			  )
			: dailyInterestRate_newOwnerPublicKey;

	const dailyInterestRate_currentCommitment = dailyInterestRate_commitmentExists
		? generalise(dailyInterestRate_commitment._id)
		: generalise(0);
	const dailyInterestRate_prev = generalise(dailyInterestRate_preimage.value);
	const dailyInterestRate_prevSalt = generalise(
		dailyInterestRate_preimage.salt
	);

	// read preimage for whole state
	expiryDateOfContract_newOwnerPublicKey =
		_expiryDateOfContract_newOwnerPublicKey === 0
			? generalise(
					await instance.methods
						.zkpPublicKeys(await instance.methods.owner().call())
						.call()
			  )
			: expiryDateOfContract_newOwnerPublicKey;

	const expiryDateOfContract_currentCommitment = expiryDateOfContract_commitmentExists
		? generalise(expiryDateOfContract_commitment._id)
		: generalise(0);
	const expiryDateOfContract_prev = generalise(
		expiryDateOfContract_preimage.value
	);
	const expiryDateOfContract_prevSalt = generalise(
		expiryDateOfContract_preimage.salt
	);

	// read preimage for whole state
	latestShortfallSequenceNumber_newOwnerPublicKey =
		_latestShortfallSequenceNumber_newOwnerPublicKey === 0
			? generalise(
					await instance.methods
						.zkpPublicKeys(await instance.methods.owner().call())
						.call()
			  )
			: latestShortfallSequenceNumber_newOwnerPublicKey;

	const latestShortfallSequenceNumber_currentCommitment = latestShortfallSequenceNumber_commitmentExists
		? generalise(latestShortfallSequenceNumber_commitment._id)
		: generalise(0);
	const latestShortfallSequenceNumber_prev = generalise(
		latestShortfallSequenceNumber_preimage.value
	);
	const latestShortfallSequenceNumber_prevSalt = generalise(
		latestShortfallSequenceNumber_preimage.salt
	);

	// read preimage for whole state
	latestSurplusSequenceNumber_newOwnerPublicKey =
		_latestSurplusSequenceNumber_newOwnerPublicKey === 0
			? generalise(
					await instance.methods
						.zkpPublicKeys(await instance.methods.owner().call())
						.call()
			  )
			: latestSurplusSequenceNumber_newOwnerPublicKey;

	const latestSurplusSequenceNumber_currentCommitment = latestSurplusSequenceNumber_commitmentExists
		? generalise(latestSurplusSequenceNumber_commitment._id)
		: generalise(0);
	const latestSurplusSequenceNumber_prev = generalise(
		latestSurplusSequenceNumber_preimage.value
	);
	const latestSurplusSequenceNumber_prevSalt = generalise(
		latestSurplusSequenceNumber_preimage.salt
	);

	// read preimage for whole state
	sequenceNumberInterval_newOwnerPublicKey =
		_sequenceNumberInterval_newOwnerPublicKey === 0
			? generalise(
					await instance.methods
						.zkpPublicKeys(await instance.methods.owner().call())
						.call()
			  )
			: sequenceNumberInterval_newOwnerPublicKey;

	const sequenceNumberInterval_currentCommitment = sequenceNumberInterval_commitmentExists
		? generalise(sequenceNumberInterval_commitment._id)
		: generalise(0);
	const sequenceNumberInterval_prev = generalise(
		sequenceNumberInterval_preimage.value
	);
	const sequenceNumberInterval_prevSalt = generalise(
		sequenceNumberInterval_preimage.salt
	);

	// read preimage for whole state
	numberOfConsecutivePeriodsForShortfall_newOwnerPublicKey =
		_numberOfConsecutivePeriodsForShortfall_newOwnerPublicKey === 0
			? generalise(
					await instance.methods
						.zkpPublicKeys(await instance.methods.owner().call())
						.call()
			  )
			: numberOfConsecutivePeriodsForShortfall_newOwnerPublicKey;

	const numberOfConsecutivePeriodsForShortfall_currentCommitment = numberOfConsecutivePeriodsForShortfall_commitmentExists
		? generalise(numberOfConsecutivePeriodsForShortfall_commitment._id)
		: generalise(0);
	const numberOfConsecutivePeriodsForShortfall_prev = generalise(
		numberOfConsecutivePeriodsForShortfall_preimage.value
	);
	const numberOfConsecutivePeriodsForShortfall_prevSalt = generalise(
		numberOfConsecutivePeriodsForShortfall_preimage.salt
	);

	// read preimage for whole state
	shortfallThreshold_newOwnerPublicKey =
		_shortfallThreshold_newOwnerPublicKey === 0
			? generalise(
					await instance.methods
						.zkpPublicKeys(await instance.methods.owner().call())
						.call()
			  )
			: shortfallThreshold_newOwnerPublicKey;

	const shortfallThreshold_currentCommitment = shortfallThreshold_commitmentExists
		? generalise(shortfallThreshold_commitment._id)
		: generalise(0);
	const shortfallThreshold_prev = generalise(shortfallThreshold_preimage.value);
	const shortfallThreshold_prevSalt = generalise(
		shortfallThreshold_preimage.salt
	);

	// read preimage for whole state
	numberOfConsecutivePeriodsForSurplus_newOwnerPublicKey =
		_numberOfConsecutivePeriodsForSurplus_newOwnerPublicKey === 0
			? generalise(
					await instance.methods
						.zkpPublicKeys(await instance.methods.owner().call())
						.call()
			  )
			: numberOfConsecutivePeriodsForSurplus_newOwnerPublicKey;

	const numberOfConsecutivePeriodsForSurplus_currentCommitment = numberOfConsecutivePeriodsForSurplus_commitmentExists
		? generalise(numberOfConsecutivePeriodsForSurplus_commitment._id)
		: generalise(0);
	const numberOfConsecutivePeriodsForSurplus_prev = generalise(
		numberOfConsecutivePeriodsForSurplus_preimage.value
	);
	const numberOfConsecutivePeriodsForSurplus_prevSalt = generalise(
		numberOfConsecutivePeriodsForSurplus_preimage.salt
	);

	// read preimage for whole state
	surplusThreshold_newOwnerPublicKey =
		_surplusThreshold_newOwnerPublicKey === 0
			? generalise(
					await instance.methods
						.zkpPublicKeys(await instance.methods.owner().call())
						.call()
			  )
			: surplusThreshold_newOwnerPublicKey;

	const surplusThreshold_currentCommitment = surplusThreshold_commitmentExists
		? generalise(surplusThreshold_commitment._id)
		: generalise(0);
	const surplusThreshold_prev = generalise(surplusThreshold_preimage.value);
	const surplusThreshold_prevSalt = generalise(surplusThreshold_preimage.salt);

	// Extract set membership witness:

	// generate witness for whole state
	const strikePrice_emptyPath = new Array(32).fill(0);
	const strikePrice_witness = strikePrice_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				strikePrice_currentCommitment.integer
		  )
		: {
				index: 0,
				path: strikePrice_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const strikePrice_index = generalise(strikePrice_witness.index);
	const strikePrice_root = generalise(strikePrice_witness.root);
	const strikePrice_path = generalise(strikePrice_witness.path).all;

	// generate witness for whole state
	const bundlePrice_emptyPath = new Array(32).fill(0);
	const bundlePrice_witness = bundlePrice_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				bundlePrice_currentCommitment.integer
		  )
		: {
				index: 0,
				path: bundlePrice_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const bundlePrice_index = generalise(bundlePrice_witness.index);
	const bundlePrice_root = generalise(bundlePrice_witness.root);
	const bundlePrice_path = generalise(bundlePrice_witness.path).all;

	// generate witness for whole state
	const volumeShare_emptyPath = new Array(32).fill(0);
	const volumeShare_witness = volumeShare_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				volumeShare_currentCommitment.integer
		  )
		: {
				index: 0,
				path: volumeShare_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const volumeShare_index = generalise(volumeShare_witness.index);
	const volumeShare_root = generalise(volumeShare_witness.root);
	const volumeShare_path = generalise(volumeShare_witness.path).all;

	// generate witness for whole state
	const dailyInterestRate_emptyPath = new Array(32).fill(0);
	const dailyInterestRate_witness = dailyInterestRate_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				dailyInterestRate_currentCommitment.integer
		  )
		: {
				index: 0,
				path: dailyInterestRate_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const dailyInterestRate_index = generalise(dailyInterestRate_witness.index);
	const dailyInterestRate_root = generalise(dailyInterestRate_witness.root);
	const dailyInterestRate_path = generalise(dailyInterestRate_witness.path).all;

	// generate witness for whole state
	const expiryDateOfContract_emptyPath = new Array(32).fill(0);
	const expiryDateOfContract_witness = expiryDateOfContract_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				expiryDateOfContract_currentCommitment.integer
		  )
		: {
				index: 0,
				path: expiryDateOfContract_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const expiryDateOfContract_index = generalise(
		expiryDateOfContract_witness.index
	);
	const expiryDateOfContract_root = generalise(
		expiryDateOfContract_witness.root
	);
	const expiryDateOfContract_path = generalise(
		expiryDateOfContract_witness.path
	).all;

	// generate witness for whole state
	const latestShortfallSequenceNumber_emptyPath = new Array(32).fill(0);
	const latestShortfallSequenceNumber_witness = latestShortfallSequenceNumber_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				latestShortfallSequenceNumber_currentCommitment.integer
		  )
		: {
				index: 0,
				path: latestShortfallSequenceNumber_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const latestShortfallSequenceNumber_index = generalise(
		latestShortfallSequenceNumber_witness.index
	);
	const latestShortfallSequenceNumber_root = generalise(
		latestShortfallSequenceNumber_witness.root
	);
	const latestShortfallSequenceNumber_path = generalise(
		latestShortfallSequenceNumber_witness.path
	).all;

	// generate witness for whole state
	const latestSurplusSequenceNumber_emptyPath = new Array(32).fill(0);
	const latestSurplusSequenceNumber_witness = latestSurplusSequenceNumber_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				latestSurplusSequenceNumber_currentCommitment.integer
		  )
		: {
				index: 0,
				path: latestSurplusSequenceNumber_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const latestSurplusSequenceNumber_index = generalise(
		latestSurplusSequenceNumber_witness.index
	);
	const latestSurplusSequenceNumber_root = generalise(
		latestSurplusSequenceNumber_witness.root
	);
	const latestSurplusSequenceNumber_path = generalise(
		latestSurplusSequenceNumber_witness.path
	).all;

	// generate witness for whole state
	const sequenceNumberInterval_emptyPath = new Array(32).fill(0);
	const sequenceNumberInterval_witness = sequenceNumberInterval_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				sequenceNumberInterval_currentCommitment.integer
		  )
		: {
				index: 0,
				path: sequenceNumberInterval_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const sequenceNumberInterval_index = generalise(
		sequenceNumberInterval_witness.index
	);
	const sequenceNumberInterval_root = generalise(
		sequenceNumberInterval_witness.root
	);
	const sequenceNumberInterval_path = generalise(
		sequenceNumberInterval_witness.path
	).all;

	// generate witness for whole state
	const numberOfConsecutivePeriodsForShortfall_emptyPath = new Array(32).fill(
		0
	);
	const numberOfConsecutivePeriodsForShortfall_witness = numberOfConsecutivePeriodsForShortfall_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				numberOfConsecutivePeriodsForShortfall_currentCommitment.integer
		  )
		: {
				index: 0,
				path: numberOfConsecutivePeriodsForShortfall_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const numberOfConsecutivePeriodsForShortfall_index = generalise(
		numberOfConsecutivePeriodsForShortfall_witness.index
	);
	const numberOfConsecutivePeriodsForShortfall_root = generalise(
		numberOfConsecutivePeriodsForShortfall_witness.root
	);
	const numberOfConsecutivePeriodsForShortfall_path = generalise(
		numberOfConsecutivePeriodsForShortfall_witness.path
	).all;

	// generate witness for whole state
	const shortfallThreshold_emptyPath = new Array(32).fill(0);
	const shortfallThreshold_witness = shortfallThreshold_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				shortfallThreshold_currentCommitment.integer
		  )
		: {
				index: 0,
				path: shortfallThreshold_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const shortfallThreshold_index = generalise(shortfallThreshold_witness.index);
	const shortfallThreshold_root = generalise(shortfallThreshold_witness.root);
	const shortfallThreshold_path = generalise(shortfallThreshold_witness.path)
		.all;

	// generate witness for whole state
	const numberOfConsecutivePeriodsForSurplus_emptyPath = new Array(32).fill(0);
	const numberOfConsecutivePeriodsForSurplus_witness = numberOfConsecutivePeriodsForSurplus_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				numberOfConsecutivePeriodsForSurplus_currentCommitment.integer
		  )
		: {
				index: 0,
				path: numberOfConsecutivePeriodsForSurplus_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const numberOfConsecutivePeriodsForSurplus_index = generalise(
		numberOfConsecutivePeriodsForSurplus_witness.index
	);
	const numberOfConsecutivePeriodsForSurplus_root = generalise(
		numberOfConsecutivePeriodsForSurplus_witness.root
	);
	const numberOfConsecutivePeriodsForSurplus_path = generalise(
		numberOfConsecutivePeriodsForSurplus_witness.path
	).all;

	// generate witness for whole state
	const surplusThreshold_emptyPath = new Array(32).fill(0);
	const surplusThreshold_witness = surplusThreshold_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				surplusThreshold_currentCommitment.integer
		  )
		: {
				index: 0,
				path: surplusThreshold_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const surplusThreshold_index = generalise(surplusThreshold_witness.index);
	const surplusThreshold_root = generalise(surplusThreshold_witness.root);
	const surplusThreshold_path = generalise(surplusThreshold_witness.path).all;

	let expiryDateOfContract = generalise(expiryDateOfContract_preimage.value);

	let volumeShare = parseInt(volumeShareParam.integer, 10);

	volumeShare = generalise(volumeShare);

	let strikePrice = parseInt(strikePriceParam.integer, 10);

	strikePrice = generalise(strikePrice);

	let bundlePrice = parseInt(bundlePriceParam.integer, 10);

	bundlePrice = generalise(bundlePrice);

	let numberOfConsecutivePeriodsForShortfall = parseInt(
		numberOfConsecutivePeriodsForShortfallParam.integer,
		10
	);

	numberOfConsecutivePeriodsForShortfall = generalise(
		numberOfConsecutivePeriodsForShortfall
	);

	let shortfallThreshold = parseInt(shortfallThresholdParam.integer, 10);

	shortfallThreshold = generalise(shortfallThreshold);

	let numberOfConsecutivePeriodsForSurplus = parseInt(
		numberOfConsecutivePeriodsForSurplusParam.integer,
		10
	);

	numberOfConsecutivePeriodsForSurplus = generalise(
		numberOfConsecutivePeriodsForSurplus
	);

	let surplusThreshold = parseInt(surplusThresholdParam.integer, 10);

	surplusThreshold = generalise(surplusThreshold);

	let dailyInterestRate = parseInt(dailyInterestRateParam.integer, 10);

	dailyInterestRate = generalise(dailyInterestRate);

	expiryDateOfContract = parseInt(expiryDateOfContractParam.integer, 10);

	expiryDateOfContract = generalise(expiryDateOfContract);

	let sequenceNumberInterval = parseInt(
		sequenceNumberIntervalParam.integer,
		10
	);

	sequenceNumberInterval = generalise(sequenceNumberInterval);

	let latestShortfallSequenceNumber = 0;

	latestShortfallSequenceNumber = generalise(latestShortfallSequenceNumber);

	let latestSurplusSequenceNumber = 0;

	latestSurplusSequenceNumber = generalise(latestSurplusSequenceNumber);

	// Calculate nullifier(s):

	let strikePrice_nullifier = strikePrice_commitmentExists
		? poseidonHash([
				BigInt(strikePrice_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(strikePrice_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(strikePrice_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(strikePrice_prevSalt.hex(32)),
		  ]);

	strikePrice_nullifier = generalise(strikePrice_nullifier.hex(32)); // truncate

	

	let bundlePrice_nullifier = bundlePrice_commitmentExists
		? poseidonHash([
				BigInt(bundlePrice_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(bundlePrice_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(bundlePrice_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(bundlePrice_prevSalt.hex(32)),
		  ]);

	bundlePrice_nullifier = generalise(bundlePrice_nullifier.hex(32)); // truncate

	

	let volumeShare_nullifier = volumeShare_commitmentExists
		? poseidonHash([
				BigInt(volumeShare_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(volumeShare_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(volumeShare_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(volumeShare_prevSalt.hex(32)),
		  ]);

	volumeShare_nullifier = generalise(volumeShare_nullifier.hex(32)); // truncate

	
	let dailyInterestRate_nullifier = dailyInterestRate_commitmentExists
		? poseidonHash([
				BigInt(dailyInterestRate_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(dailyInterestRate_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(dailyInterestRate_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(dailyInterestRate_prevSalt.hex(32)),
		  ]);

	dailyInterestRate_nullifier = generalise(dailyInterestRate_nullifier.hex(32)); // truncate

	

	let expiryDateOfContract_nullifier = expiryDateOfContract_commitmentExists
		? poseidonHash([
				BigInt(expiryDateOfContract_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(expiryDateOfContract_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(expiryDateOfContract_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(expiryDateOfContract_prevSalt.hex(32)),
		  ]);

	expiryDateOfContract_nullifier = generalise(
		expiryDateOfContract_nullifier.hex(32)
	); // truncate

	
	let latestShortfallSequenceNumber_nullifier = latestShortfallSequenceNumber_commitmentExists
		? poseidonHash([
				BigInt(latestShortfallSequenceNumber_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(latestShortfallSequenceNumber_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(latestShortfallSequenceNumber_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(latestShortfallSequenceNumber_prevSalt.hex(32)),
		  ]);

	latestShortfallSequenceNumber_nullifier = generalise(
		latestShortfallSequenceNumber_nullifier.hex(32)
	); // truncate

	

	let latestSurplusSequenceNumber_nullifier = latestSurplusSequenceNumber_commitmentExists
		? poseidonHash([
				BigInt(latestSurplusSequenceNumber_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(latestSurplusSequenceNumber_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(latestSurplusSequenceNumber_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(latestSurplusSequenceNumber_prevSalt.hex(32)),
		  ]);

	latestSurplusSequenceNumber_nullifier = generalise(
		latestSurplusSequenceNumber_nullifier.hex(32)
	); // truncate

	

	let sequenceNumberInterval_nullifier = sequenceNumberInterval_commitmentExists
		? poseidonHash([
				BigInt(sequenceNumberInterval_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(sequenceNumberInterval_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(sequenceNumberInterval_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(sequenceNumberInterval_prevSalt.hex(32)),
		  ]);

	sequenceNumberInterval_nullifier = generalise(
		sequenceNumberInterval_nullifier.hex(32)
	); // truncate

	
	let numberOfConsecutivePeriodsForShortfall_nullifier = numberOfConsecutivePeriodsForShortfall_commitmentExists
		? poseidonHash([
				BigInt(numberOfConsecutivePeriodsForShortfall_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(numberOfConsecutivePeriodsForShortfall_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(numberOfConsecutivePeriodsForShortfall_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(numberOfConsecutivePeriodsForShortfall_prevSalt.hex(32)),
		  ]);

	numberOfConsecutivePeriodsForShortfall_nullifier = generalise(
		numberOfConsecutivePeriodsForShortfall_nullifier.hex(32)
	); // truncate

	

	let shortfallThreshold_nullifier = shortfallThreshold_commitmentExists
		? poseidonHash([
				BigInt(shortfallThreshold_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(shortfallThreshold_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(shortfallThreshold_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(shortfallThreshold_prevSalt.hex(32)),
		  ]);

	shortfallThreshold_nullifier = generalise(
		shortfallThreshold_nullifier.hex(32)
	); // truncate

	

	let numberOfConsecutivePeriodsForSurplus_nullifier = numberOfConsecutivePeriodsForSurplus_commitmentExists
		? poseidonHash([
				BigInt(numberOfConsecutivePeriodsForSurplus_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(numberOfConsecutivePeriodsForSurplus_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(numberOfConsecutivePeriodsForSurplus_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(numberOfConsecutivePeriodsForSurplus_prevSalt.hex(32)),
		  ]);

	numberOfConsecutivePeriodsForSurplus_nullifier = generalise(
		numberOfConsecutivePeriodsForSurplus_nullifier.hex(32)
	); // truncate

	

	let surplusThreshold_nullifier = surplusThreshold_commitmentExists
		? poseidonHash([
				BigInt(surplusThreshold_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(surplusThreshold_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(surplusThreshold_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(surplusThreshold_prevSalt.hex(32)),
		  ]);

	surplusThreshold_nullifier = generalise(surplusThreshold_nullifier.hex(32)); // truncate

	
	

	// Calculate commitment(s):

	const strikePrice_newSalt = generalise(utils.randomHex(31));

	let strikePrice_newCommitment = poseidonHash([
		BigInt(strikePrice_stateVarId),
		BigInt(strikePrice.hex(32)),
		BigInt(strikePrice_newOwnerPublicKey.hex(32)),
		BigInt(strikePrice_newSalt.hex(32)),
	]);

	strikePrice_newCommitment = generalise(strikePrice_newCommitment.hex(32)); // truncate

	const bundlePrice_newSalt = generalise(utils.randomHex(31));

	let bundlePrice_newCommitment = poseidonHash([
		BigInt(bundlePrice_stateVarId),
		BigInt(bundlePrice.hex(32)),
		BigInt(bundlePrice_newOwnerPublicKey.hex(32)),
		BigInt(bundlePrice_newSalt.hex(32)),
	]);

	bundlePrice_newCommitment = generalise(bundlePrice_newCommitment.hex(32)); // truncate

	const volumeShare_newSalt = generalise(utils.randomHex(31));

	let volumeShare_newCommitment = poseidonHash([
		BigInt(volumeShare_stateVarId),
		BigInt(volumeShare.hex(32)),
		BigInt(volumeShare_newOwnerPublicKey.hex(32)),
		BigInt(volumeShare_newSalt.hex(32)),
	]);

	volumeShare_newCommitment = generalise(volumeShare_newCommitment.hex(32)); // truncate

	const dailyInterestRate_newSalt = generalise(utils.randomHex(31));

	let dailyInterestRate_newCommitment = poseidonHash([
		BigInt(dailyInterestRate_stateVarId),
		BigInt(dailyInterestRate.hex(32)),
		BigInt(dailyInterestRate_newOwnerPublicKey.hex(32)),
		BigInt(dailyInterestRate_newSalt.hex(32)),
	]);

	dailyInterestRate_newCommitment = generalise(
		dailyInterestRate_newCommitment.hex(32)
	); // truncate

	const expiryDateOfContract_newSalt = generalise(utils.randomHex(31));

	let expiryDateOfContract_newCommitment = poseidonHash([
		BigInt(expiryDateOfContract_stateVarId),
		BigInt(expiryDateOfContract.hex(32)),
		BigInt(expiryDateOfContract_newOwnerPublicKey.hex(32)),
		BigInt(expiryDateOfContract_newSalt.hex(32)),
	]);

	expiryDateOfContract_newCommitment = generalise(
		expiryDateOfContract_newCommitment.hex(32)
	); // truncate

	const latestShortfallSequenceNumber_newSalt = generalise(utils.randomHex(31));

	let latestShortfallSequenceNumber_newCommitment = poseidonHash([
		BigInt(latestShortfallSequenceNumber_stateVarId),
		BigInt(latestShortfallSequenceNumber.hex(32)),
		BigInt(latestShortfallSequenceNumber_newOwnerPublicKey.hex(32)),
		BigInt(latestShortfallSequenceNumber_newSalt.hex(32)),
	]);

	latestShortfallSequenceNumber_newCommitment = generalise(
		latestShortfallSequenceNumber_newCommitment.hex(32)
	); // truncate

	const latestSurplusSequenceNumber_newSalt = generalise(utils.randomHex(31));

	let latestSurplusSequenceNumber_newCommitment = poseidonHash([
		BigInt(latestSurplusSequenceNumber_stateVarId),
		BigInt(latestSurplusSequenceNumber.hex(32)),
		BigInt(latestSurplusSequenceNumber_newOwnerPublicKey.hex(32)),
		BigInt(latestSurplusSequenceNumber_newSalt.hex(32)),
	]);

	latestSurplusSequenceNumber_newCommitment = generalise(
		latestSurplusSequenceNumber_newCommitment.hex(32)
	); // truncate

	const sequenceNumberInterval_newSalt = generalise(utils.randomHex(31));

	let sequenceNumberInterval_newCommitment = poseidonHash([
		BigInt(sequenceNumberInterval_stateVarId),
		BigInt(sequenceNumberInterval.hex(32)),
		BigInt(sequenceNumberInterval_newOwnerPublicKey.hex(32)),
		BigInt(sequenceNumberInterval_newSalt.hex(32)),
	]);

	sequenceNumberInterval_newCommitment = generalise(
		sequenceNumberInterval_newCommitment.hex(32)
	); // truncate

	const numberOfConsecutivePeriodsForShortfall_newSalt = generalise(
		utils.randomHex(31)
	);

	let numberOfConsecutivePeriodsForShortfall_newCommitment = poseidonHash([
		BigInt(numberOfConsecutivePeriodsForShortfall_stateVarId),
		BigInt(numberOfConsecutivePeriodsForShortfall.hex(32)),
		BigInt(numberOfConsecutivePeriodsForShortfall_newOwnerPublicKey.hex(32)),
		BigInt(numberOfConsecutivePeriodsForShortfall_newSalt.hex(32)),
	]);

	numberOfConsecutivePeriodsForShortfall_newCommitment = generalise(
		numberOfConsecutivePeriodsForShortfall_newCommitment.hex(32)
	); // truncate

	const shortfallThreshold_newSalt = generalise(utils.randomHex(31));

	let shortfallThreshold_newCommitment = poseidonHash([
		BigInt(shortfallThreshold_stateVarId),
		BigInt(shortfallThreshold.hex(32)),
		BigInt(shortfallThreshold_newOwnerPublicKey.hex(32)),
		BigInt(shortfallThreshold_newSalt.hex(32)),
	]);

	shortfallThreshold_newCommitment = generalise(
		shortfallThreshold_newCommitment.hex(32)
	); // truncate

	const numberOfConsecutivePeriodsForSurplus_newSalt = generalise(
		utils.randomHex(31)
	);

	let numberOfConsecutivePeriodsForSurplus_newCommitment = poseidonHash([
		BigInt(numberOfConsecutivePeriodsForSurplus_stateVarId),
		BigInt(numberOfConsecutivePeriodsForSurplus.hex(32)),
		BigInt(numberOfConsecutivePeriodsForSurplus_newOwnerPublicKey.hex(32)),
		BigInt(numberOfConsecutivePeriodsForSurplus_newSalt.hex(32)),
	]);

	numberOfConsecutivePeriodsForSurplus_newCommitment = generalise(
		numberOfConsecutivePeriodsForSurplus_newCommitment.hex(32)
	); // truncate

	const surplusThreshold_newSalt = generalise(utils.randomHex(31));

	let surplusThreshold_newCommitment = poseidonHash([
		BigInt(surplusThreshold_stateVarId),
		BigInt(surplusThreshold.hex(32)),
		BigInt(surplusThreshold_newOwnerPublicKey.hex(32)),
		BigInt(surplusThreshold_newSalt.hex(32)),
	]);

	surplusThreshold_newCommitment = generalise(
		surplusThreshold_newCommitment.hex(32)
	); // truncate

	// Call Zokrates to generate the proof:

	const allInputs = [
		strikePriceParam.integer,
		bundlePriceParam.integer,
		volumeShareParam.integer,
		numberOfConsecutivePeriodsForShortfallParam.integer,
		shortfallThresholdParam.integer,
		numberOfConsecutivePeriodsForSurplusParam.integer,
		surplusThresholdParam.integer,
		dailyInterestRateParam.integer,
		expiryDateOfContractParam.integer,
		sequenceNumberIntervalParam.integer,
		referenceDate.integer,
		strikePrice_commitmentExists ? secretKey.integer : generalise(0).integer,
		strikePrice_nullifier.integer,
		strikePrice_prev.integer,
		strikePrice_prevSalt.integer,
		strikePrice_commitmentExists ? 0 : 1,
		strikePrice_root.integer,
		strikePrice_index.integer,
		strikePrice_path.integer,
		strikePrice_newOwnerPublicKey.integer,
		strikePrice_newSalt.integer,
		strikePrice_newCommitment.integer,
		bundlePrice_commitmentExists ? secretKey.integer : generalise(0).integer,

		bundlePrice_nullifier.integer,
		bundlePrice_prev.integer,
		bundlePrice_prevSalt.integer,
		bundlePrice_commitmentExists ? 0 : 1,

		bundlePrice_index.integer,
		bundlePrice_path.integer,
		bundlePrice_newOwnerPublicKey.integer,
		bundlePrice_newSalt.integer,
		bundlePrice_newCommitment.integer,
		volumeShare_commitmentExists ? secretKey.integer : generalise(0).integer,

		volumeShare_nullifier.integer,
		volumeShare_prev.integer,
		volumeShare_prevSalt.integer,
		volumeShare_commitmentExists ? 0 : 1,

		volumeShare_index.integer,
		volumeShare_path.integer,
		volumeShare_newOwnerPublicKey.integer,
		volumeShare_newSalt.integer,
		volumeShare_newCommitment.integer,
		dailyInterestRate_commitmentExists
			? secretKey.integer
			: generalise(0).integer,

		dailyInterestRate_nullifier.integer,
		dailyInterestRate_prev.integer,
		dailyInterestRate_prevSalt.integer,
		dailyInterestRate_commitmentExists ? 0 : 1,

		dailyInterestRate_index.integer,
		dailyInterestRate_path.integer,
		dailyInterestRate_newOwnerPublicKey.integer,
		dailyInterestRate_newSalt.integer,
		dailyInterestRate_newCommitment.integer,
		expiryDateOfContract_commitmentExists
			? secretKey.integer
			: generalise(0).integer,

		expiryDateOfContract_nullifier.integer,
		expiryDateOfContract_prev.integer,
		expiryDateOfContract_prevSalt.integer,
		expiryDateOfContract_commitmentExists ? 0 : 1,

		expiryDateOfContract_index.integer,
		expiryDateOfContract_path.integer,
		expiryDateOfContract_newOwnerPublicKey.integer,
		expiryDateOfContract_newSalt.integer,
		expiryDateOfContract_newCommitment.integer,
		latestShortfallSequenceNumber_commitmentExists
			? secretKey.integer
			: generalise(0).integer,

		latestShortfallSequenceNumber_nullifier.integer,
		latestShortfallSequenceNumber_prev.integer,
		latestShortfallSequenceNumber_prevSalt.integer,
		latestShortfallSequenceNumber_commitmentExists ? 0 : 1,

		latestShortfallSequenceNumber_index.integer,
		latestShortfallSequenceNumber_path.integer,
		latestShortfallSequenceNumber_newOwnerPublicKey.integer,
		latestShortfallSequenceNumber_newSalt.integer,
		latestShortfallSequenceNumber_newCommitment.integer,
		latestSurplusSequenceNumber_commitmentExists
			? secretKey.integer
			: generalise(0).integer,

		latestSurplusSequenceNumber_nullifier.integer,
		latestSurplusSequenceNumber_prev.integer,
		latestSurplusSequenceNumber_prevSalt.integer,
		latestSurplusSequenceNumber_commitmentExists ? 0 : 1,

		latestSurplusSequenceNumber_index.integer,
		latestSurplusSequenceNumber_path.integer,
		latestSurplusSequenceNumber_newOwnerPublicKey.integer,
		latestSurplusSequenceNumber_newSalt.integer,
		latestSurplusSequenceNumber_newCommitment.integer,
		sequenceNumberInterval_commitmentExists
			? secretKey.integer
			: generalise(0).integer,

		sequenceNumberInterval_nullifier.integer,
		sequenceNumberInterval_prev.integer,
		sequenceNumberInterval_prevSalt.integer,
		sequenceNumberInterval_commitmentExists ? 0 : 1,

		sequenceNumberInterval_index.integer,
		sequenceNumberInterval_path.integer,
		sequenceNumberInterval_newOwnerPublicKey.integer,
		sequenceNumberInterval_newSalt.integer,
		sequenceNumberInterval_newCommitment.integer,
		numberOfConsecutivePeriodsForShortfall_commitmentExists
			? secretKey.integer
			: generalise(0).integer,

		numberOfConsecutivePeriodsForShortfall_nullifier.integer,
		numberOfConsecutivePeriodsForShortfall_prev.integer,
		numberOfConsecutivePeriodsForShortfall_prevSalt.integer,
		numberOfConsecutivePeriodsForShortfall_commitmentExists ? 0 : 1,

		numberOfConsecutivePeriodsForShortfall_index.integer,
		numberOfConsecutivePeriodsForShortfall_path.integer,
		numberOfConsecutivePeriodsForShortfall_newOwnerPublicKey.integer,
		numberOfConsecutivePeriodsForShortfall_newSalt.integer,
		numberOfConsecutivePeriodsForShortfall_newCommitment.integer,
		shortfallThreshold_commitmentExists
			? secretKey.integer
			: generalise(0).integer,

		shortfallThreshold_nullifier.integer,
		shortfallThreshold_prev.integer,
		shortfallThreshold_prevSalt.integer,
		shortfallThreshold_commitmentExists ? 0 : 1,

		shortfallThreshold_index.integer,
		shortfallThreshold_path.integer,
		shortfallThreshold_newOwnerPublicKey.integer,
		shortfallThreshold_newSalt.integer,
		shortfallThreshold_newCommitment.integer,
		numberOfConsecutivePeriodsForSurplus_commitmentExists
			? secretKey.integer
			: generalise(0).integer,

		numberOfConsecutivePeriodsForSurplus_nullifier.integer,
		numberOfConsecutivePeriodsForSurplus_prev.integer,
		numberOfConsecutivePeriodsForSurplus_prevSalt.integer,
		numberOfConsecutivePeriodsForSurplus_commitmentExists ? 0 : 1,

		numberOfConsecutivePeriodsForSurplus_index.integer,
		numberOfConsecutivePeriodsForSurplus_path.integer,
		numberOfConsecutivePeriodsForSurplus_newOwnerPublicKey.integer,
		numberOfConsecutivePeriodsForSurplus_newSalt.integer,
		numberOfConsecutivePeriodsForSurplus_newCommitment.integer,
		surplusThreshold_commitmentExists
			? secretKey.integer
			: generalise(0).integer,

		surplusThreshold_nullifier.integer,
		surplusThreshold_prev.integer,
		surplusThreshold_prevSalt.integer,
		surplusThreshold_commitmentExists ? 0 : 1,

		surplusThreshold_index.integer,
		surplusThreshold_path.integer,
		surplusThreshold_newOwnerPublicKey.integer,
		surplusThreshold_newSalt.integer,
		surplusThreshold_newCommitment.integer,
	].flat(Infinity);
	const res = await generateProof("setInitialContractParams", allInputs);
	const proof = generalise(Object.values(res.proof).flat(Infinity))
		.map((coeff) => coeff.integer)
		.flat(Infinity);

	// Send transaction to the blockchain:

	const txData = await instance.methods
		.setInitialContractParams(
			[
				strikePrice_nullifier.integer,
				bundlePrice_nullifier.integer,
				volumeShare_nullifier.integer,
				dailyInterestRate_nullifier.integer,
				expiryDateOfContract_nullifier.integer,
				latestShortfallSequenceNumber_nullifier.integer,
				latestSurplusSequenceNumber_nullifier.integer,
				sequenceNumberInterval_nullifier.integer,
				numberOfConsecutivePeriodsForShortfall_nullifier.integer,
				shortfallThreshold_nullifier.integer,
				numberOfConsecutivePeriodsForSurplus_nullifier.integer,
				surplusThreshold_nullifier.integer,
			],
			strikePrice_root.integer,
			[
				strikePrice_newCommitment.integer,
				bundlePrice_newCommitment.integer,
				volumeShare_newCommitment.integer,
				dailyInterestRate_newCommitment.integer,
				expiryDateOfContract_newCommitment.integer,
				latestShortfallSequenceNumber_newCommitment.integer,
				latestSurplusSequenceNumber_newCommitment.integer,
				sequenceNumberInterval_newCommitment.integer,
				numberOfConsecutivePeriodsForShortfall_newCommitment.integer,
				shortfallThreshold_newCommitment.integer,
				numberOfConsecutivePeriodsForSurplus_newCommitment.integer,
				surplusThreshold_newCommitment.integer,
			],
			proof
		)
		.encodeABI();

	let txParams = {
		from: config.web3.options.defaultAccount,
		to: contractAddr,
		gas: config.web3.options.defaultGas,
		gasPrice: config.web3.options.defaultGasPrice,
		data: txData,
		chainId: await web3.eth.net.getId(),
	};

	const key = config.web3.key;

	const signed = await web3.eth.accounts.signTransaction(txParams, key);

	const sendTxn = await web3.eth.sendSignedTransaction(signed.rawTransaction);

	let tx = await instance.getPastEvents("NewLeaves");

	tx = tx[0];

	if (!tx) {
		throw new Error(
			"Tx failed - the commitment was not accepted on-chain, or the contract is not deployed."
		);
	}

	let encEvent = "";

	try {
		encEvent = await instance.getPastEvents("EncryptedData");
	} catch (err) {
		console.log("No encrypted event");
	}

	// Write new commitment preimage to db:

	if (strikePrice_commitmentExists)
		await markNullified(strikePrice_currentCommitment, secretKey.hex(32));


	await storeCommitment({
		hash: strikePrice_newCommitment,
		name: "strikePrice",
		mappingKey: null,
		preimage: {
			stateVarId: generalise(strikePrice_stateVarId),
			value: strikePrice,
			salt: strikePrice_newSalt,
			publicKey: strikePrice_newOwnerPublicKey,
		},
		secretKey:
			strikePrice_newOwnerPublicKey.integer === publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	if (bundlePrice_commitmentExists)
		await markNullified(bundlePrice_currentCommitment, secretKey.hex(32));


	await storeCommitment({
		hash: bundlePrice_newCommitment,
		name: "bundlePrice",
		mappingKey: null,
		preimage: {
			stateVarId: generalise(bundlePrice_stateVarId),
			value: bundlePrice,
			salt: bundlePrice_newSalt,
			publicKey: bundlePrice_newOwnerPublicKey,
		},
		secretKey:
			bundlePrice_newOwnerPublicKey.integer === publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	if (volumeShare_commitmentExists)
		await markNullified(volumeShare_currentCommitment, secretKey.hex(32));


	await storeCommitment({
		hash: volumeShare_newCommitment,
		name: "volumeShare",
		mappingKey: null,
		preimage: {
			stateVarId: generalise(volumeShare_stateVarId),
			value: volumeShare,
			salt: volumeShare_newSalt,
			publicKey: volumeShare_newOwnerPublicKey,
		},
		secretKey:
			volumeShare_newOwnerPublicKey.integer === publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	if (dailyInterestRate_commitmentExists)
		await markNullified(dailyInterestRate_currentCommitment, secretKey.hex(32));


	await storeCommitment({
		hash: dailyInterestRate_newCommitment,
		name: "dailyInterestRate",
		mappingKey: null,
		preimage: {
			stateVarId: generalise(dailyInterestRate_stateVarId),
			value: dailyInterestRate,
			salt: dailyInterestRate_newSalt,
			publicKey: dailyInterestRate_newOwnerPublicKey,
		},
		secretKey:
			dailyInterestRate_newOwnerPublicKey.integer === publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	if (expiryDateOfContract_commitmentExists)
		await markNullified(
			expiryDateOfContract_currentCommitment,
			secretKey.hex(32)
		);


	await storeCommitment({
		hash: expiryDateOfContract_newCommitment,
		name: "expiryDateOfContract",
		mappingKey: null,
		preimage: {
			stateVarId: generalise(expiryDateOfContract_stateVarId),
			value: expiryDateOfContract,
			salt: expiryDateOfContract_newSalt,
			publicKey: expiryDateOfContract_newOwnerPublicKey,
		},
		secretKey:
			expiryDateOfContract_newOwnerPublicKey.integer === publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	if (latestShortfallSequenceNumber_commitmentExists)
		await markNullified(
			latestShortfallSequenceNumber_currentCommitment,
			secretKey.hex(32)
		);


	await storeCommitment({
		hash: latestShortfallSequenceNumber_newCommitment,
		name: "latestShortfallSequenceNumber",
		mappingKey: null,
		preimage: {
			stateVarId: generalise(latestShortfallSequenceNumber_stateVarId),
			value: latestShortfallSequenceNumber,
			salt: latestShortfallSequenceNumber_newSalt,
			publicKey: latestShortfallSequenceNumber_newOwnerPublicKey,
		},
		secretKey:
			latestShortfallSequenceNumber_newOwnerPublicKey.integer ===
			publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	if (latestSurplusSequenceNumber_commitmentExists)
		await markNullified(
			latestSurplusSequenceNumber_currentCommitment,
			secretKey.hex(32)
		);


	await storeCommitment({
		hash: latestSurplusSequenceNumber_newCommitment,
		name: "latestSurplusSequenceNumber",
		mappingKey: null,
		preimage: {
			stateVarId: generalise(latestSurplusSequenceNumber_stateVarId),
			value: latestSurplusSequenceNumber,
			salt: latestSurplusSequenceNumber_newSalt,
			publicKey: latestSurplusSequenceNumber_newOwnerPublicKey,
		},
		secretKey:
			latestSurplusSequenceNumber_newOwnerPublicKey.integer ===
			publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	if (sequenceNumberInterval_commitmentExists)
		await markNullified(
			sequenceNumberInterval_currentCommitment,
			secretKey.hex(32)
		);


	await storeCommitment({
		hash: sequenceNumberInterval_newCommitment,
		name: "sequenceNumberInterval",
		mappingKey: null,
		preimage: {
			stateVarId: generalise(sequenceNumberInterval_stateVarId),
			value: sequenceNumberInterval,
			salt: sequenceNumberInterval_newSalt,
			publicKey: sequenceNumberInterval_newOwnerPublicKey,
		},
		secretKey:
			sequenceNumberInterval_newOwnerPublicKey.integer === publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	if (numberOfConsecutivePeriodsForShortfall_commitmentExists)
		await markNullified(
			numberOfConsecutivePeriodsForShortfall_currentCommitment,
			secretKey.hex(32)
		);


	await storeCommitment({
		hash: numberOfConsecutivePeriodsForShortfall_newCommitment,
		name: "numberOfConsecutivePeriodsForShortfall",
		mappingKey: null,
		preimage: {
			stateVarId: generalise(numberOfConsecutivePeriodsForShortfall_stateVarId),
			value: numberOfConsecutivePeriodsForShortfall,
			salt: numberOfConsecutivePeriodsForShortfall_newSalt,
			publicKey: numberOfConsecutivePeriodsForShortfall_newOwnerPublicKey,
		},
		secretKey:
			numberOfConsecutivePeriodsForShortfall_newOwnerPublicKey.integer ===
			publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	if (shortfallThreshold_commitmentExists)
		await markNullified(
			shortfallThreshold_currentCommitment,
			secretKey.hex(32)
		);


	await storeCommitment({
		hash: shortfallThreshold_newCommitment,
		name: "shortfallThreshold",
		mappingKey: null,
		preimage: {
			stateVarId: generalise(shortfallThreshold_stateVarId),
			value: shortfallThreshold,
			salt: shortfallThreshold_newSalt,
			publicKey: shortfallThreshold_newOwnerPublicKey,
		},
		secretKey:
			shortfallThreshold_newOwnerPublicKey.integer === publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	if (numberOfConsecutivePeriodsForSurplus_commitmentExists)
		await markNullified(
			numberOfConsecutivePeriodsForSurplus_currentCommitment,
			secretKey.hex(32)
		);


	await storeCommitment({
		hash: numberOfConsecutivePeriodsForSurplus_newCommitment,
		name: "numberOfConsecutivePeriodsForSurplus",
		mappingKey: null,
		preimage: {
			stateVarId: generalise(numberOfConsecutivePeriodsForSurplus_stateVarId),
			value: numberOfConsecutivePeriodsForSurplus,
			salt: numberOfConsecutivePeriodsForSurplus_newSalt,
			publicKey: numberOfConsecutivePeriodsForSurplus_newOwnerPublicKey,
		},
		secretKey:
			numberOfConsecutivePeriodsForSurplus_newOwnerPublicKey.integer ===
			publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	if (surplusThreshold_commitmentExists)
		await markNullified(surplusThreshold_currentCommitment, secretKey.hex(32));
	

	await storeCommitment({
		hash: surplusThreshold_newCommitment,
		name: "surplusThreshold",
		mappingKey: null,
		preimage: {
			stateVarId: generalise(surplusThreshold_stateVarId),
			value: surplusThreshold,
			salt: surplusThreshold_newSalt,
			publicKey: surplusThreshold_newOwnerPublicKey,
		},
		secretKey:
			surplusThreshold_newOwnerPublicKey.integer === publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	return { tx, encEvent };
}
