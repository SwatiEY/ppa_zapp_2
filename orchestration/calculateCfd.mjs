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

export default async function calculateCfd(
	_billNumber,
	_sequenceNumber,
	_totalGeneratedVolume,
	_expectedVolume,
	_averagePrice,
	_marginalLossFactor,
	_floatingAmount,
	_positiveAdjustment,
	_negativeAdjustment,
	_outstandingGeneratorAmount,
	_outstandingOfftakerAmount,
	_generatorDelayDays,
	_offtakerDelayDays,
	_negativePriceOccurredParam,
	_referenceDate,
	_strikePrice_newOwnerPublicKey = 0,
	_shortfalls_index_newOwnerPublicKey = 0,
	_latestShortfallSequenceNumber_newOwnerPublicKey = 0,
	_surpluses_index_1_newOwnerPublicKey = 0,
	_latestSurplusSequenceNumber_newOwnerPublicKey = 0,
	_generatorCharges_billNumber_newOwnerPublicKey = 0,
	_offtakerCharges_billNumber_newOwnerPublicKey = 0,
	_generatorInterest_billNumber_newOwnerPublicKey = 0,
	_offtakerInterest_billNumber_newOwnerPublicKey = 0,
	_negativePriceCharges_billNumber_newOwnerPublicKey = 0,
	_shortfallThreshold_newOwnerPublicKey = 0,
	_shortfallChargeSum_newOwnerPublicKey = 0,
	_shortfallIndex_newOwnerPublicKey = 0,
	_shortfallCharges_billNumber_newOwnerPublicKey = 0,
	_surplusThreshold_newOwnerPublicKey = 0,
	_surplusChargeSum_newOwnerPublicKey = 0,
	_surplusIndex_newOwnerPublicKey = 0,
	_surplusCharges_billNumber_newOwnerPublicKey = 0
) {
	// Initialisation of variables:

	const instance = await getContractInstance("SyntheticPpaShield");

	const contractAddr = await getContractAddress("SyntheticPpaShield");

	const msgValue = 0;
	const billNumber = generalise(_billNumber);
	const sequenceNumber = generalise(_sequenceNumber);
	const totalGeneratedVolume = generalise(_totalGeneratedVolume);
	const expectedVolume = generalise(_expectedVolume);
	const averagePrice = generalise(_averagePrice);
	const marginalLossFactor = generalise(_marginalLossFactor);
	const floatingAmount = generalise(_floatingAmount);
	const positiveAdjustment = generalise(_positiveAdjustment);
	const negativeAdjustment = generalise(_negativeAdjustment);
	const outstandingGeneratorAmount = generalise(_outstandingGeneratorAmount);
	const outstandingOfftakerAmount = generalise(_outstandingOfftakerAmount);
	const generatorDelayDays = generalise(_generatorDelayDays);
	const offtakerDelayDays = generalise(_offtakerDelayDays);
	const negativePriceOccurredParam = generalise(_negativePriceOccurredParam);
	const referenceDate = generalise(_referenceDate);
	
	let shortfalls_index_newOwnerPublicKey = generalise(
		_shortfalls_index_newOwnerPublicKey
	);
	let latestShortfallSequenceNumber_newOwnerPublicKey = generalise(
		_latestShortfallSequenceNumber_newOwnerPublicKey
	);
	let surpluses_index_1_newOwnerPublicKey = generalise(
		_surpluses_index_1_newOwnerPublicKey
	);
	let latestSurplusSequenceNumber_newOwnerPublicKey = generalise(
		_latestSurplusSequenceNumber_newOwnerPublicKey
	);
	let generatorCharges_billNumber_newOwnerPublicKey = generalise(
		_generatorCharges_billNumber_newOwnerPublicKey
	);
	let offtakerCharges_billNumber_newOwnerPublicKey = generalise(
		_offtakerCharges_billNumber_newOwnerPublicKey
	);
	let generatorInterest_billNumber_newOwnerPublicKey = generalise(
		_generatorInterest_billNumber_newOwnerPublicKey
	);
	let offtakerInterest_billNumber_newOwnerPublicKey = generalise(
		_offtakerInterest_billNumber_newOwnerPublicKey
	);
	let negativePriceCharges_billNumber_newOwnerPublicKey = generalise(
		_negativePriceCharges_billNumber_newOwnerPublicKey
	);
	
	let shortfallChargeSum_newOwnerPublicKey = generalise(
		_shortfallChargeSum_newOwnerPublicKey
	);
	let shortfallIndex_newOwnerPublicKey = generalise(
		_shortfallIndex_newOwnerPublicKey
	);
	let shortfallCharges_billNumber_newOwnerPublicKey = generalise(
		_shortfallCharges_billNumber_newOwnerPublicKey
	);
	
	let surplusChargeSum_newOwnerPublicKey = generalise(
		_surplusChargeSum_newOwnerPublicKey
	);
	let surplusIndex_newOwnerPublicKey = generalise(
		_surplusIndex_newOwnerPublicKey
	);
	let surplusCharges_billNumber_newOwnerPublicKey = generalise(
		_surplusCharges_billNumber_newOwnerPublicKey
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
	
	const strikePrice_commitment = await getCurrentWholeCommitment(
		strikePrice_stateVarId
	);
	const strikePrice_preimage = strikePrice_commitment.preimage;

    const strikePrice = generalise(strikePrice_preimage.value);

	

	// Initialise commitment preimage of whole accessed state:

	const bundlePrice_stateVarId = generalise(7).hex(32);

	let bundlePrice_commitmentExists = true;

	const bundlePrice_commitment = await getCurrentWholeCommitment(
		bundlePrice_stateVarId
	);

	const bundlePrice_preimage = bundlePrice_commitment.preimage;

	const bundlePrice = generalise(bundlePrice_preimage.value);

	// Initialise commitment preimage of whole accessed state:

	const volumeShare_stateVarId = generalise(9).hex(32);

	let volumeShare_commitmentExists = true;

	const volumeShare_commitment = await getCurrentWholeCommitment(
		volumeShare_stateVarId
	);

	const volumeShare_preimage = volumeShare_commitment.preimage;

	const volumeShare = generalise(volumeShare_preimage.value);

	// Initialise commitment preimage of whole accessed state:

	const dailyInterestRate_stateVarId = generalise(11).hex(32);

	let dailyInterestRate_commitmentExists = true;

	const dailyInterestRate_commitment = await getCurrentWholeCommitment(
		dailyInterestRate_stateVarId
	);

	const dailyInterestRate_preimage = dailyInterestRate_commitment.preimage;

	const dailyInterestRate = generalise(dailyInterestRate_preimage.value);

	// Initialise commitment preimage of whole accessed state:

	const startDateOfContract_stateVarId = generalise(13).hex(32);

	let startDateOfContract_commitmentExists = true;

	const startDateOfContract_commitment = await getCurrentWholeCommitment(
		startDateOfContract_stateVarId
	);

	const startDateOfContract_preimage = startDateOfContract_commitment.preimage;

	const startDateOfContract = generalise(startDateOfContract_preimage.value);

	// Initialise commitment preimage of whole accessed state:

	const expiryDateOfContract_stateVarId = generalise(15).hex(32);

	let expiryDateOfContract_commitmentExists = true;

	const expiryDateOfContract_commitment = await getCurrentWholeCommitment(
		expiryDateOfContract_stateVarId
	);

	const expiryDateOfContract_preimage =
		expiryDateOfContract_commitment.preimage;

	const expiryDateOfContract = generalise(expiryDateOfContract_preimage.value);

	// Initialise commitment preimage of whole state:

	const shortfallIndex_stateVarId = generalise(66).hex(32);

	let shortfallIndex_commitmentExists = true;
	let shortfallIndex_witnessRequired = true;

	const shortfallIndex_commitment = await getCurrentWholeCommitment(
		shortfallIndex_stateVarId
	);

	let shortfallIndex_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!shortfallIndex_commitment) {
		shortfallIndex_commitmentExists = false;
		shortfallIndex_witnessRequired = false;
	} else {
		shortfallIndex_preimage = shortfallIndex_commitment.preimage;
	}

	let shortfallIndex = generalise(shortfallIndex_preimage.value);

	let index = generalise(parseInt(shortfallIndex.integer, 10) + 1);


	// Initialise commitment preimage of whole state:

	let shortfalls_index_stateVarId = 20;

	const shortfalls_index_stateVarId_key = index;

	shortfalls_index_stateVarId = generalise(
		utils.mimcHash(
			[
				generalise(shortfalls_index_stateVarId).bigInt,
				shortfalls_index_stateVarId_key.bigInt,
			],
			"ALT_BN_254"
		)
	).hex(32);

	let shortfalls_index_commitmentExists = true;
	let shortfalls_index_witnessRequired = true;

	const shortfalls_index_commitment = await getCurrentWholeCommitment(
		shortfalls_index_stateVarId
	);

	let shortfalls_index_preimage = {
		value: { billNumber: 0, price: 0, volume: 0 },
		salt: 0,
		commitment: 0,
	};
	if (!shortfalls_index_commitment) {
		shortfalls_index_commitmentExists = false;
		shortfalls_index_witnessRequired = false;
	} else {
		shortfalls_index_preimage = shortfalls_index_commitment.preimage;
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

const surplusIndex_stateVarId = generalise(78).hex(32);

let surplusIndex_commitmentExists = true;
let surplusIndex_witnessRequired = true;

const surplusIndex_commitment = await getCurrentWholeCommitment(
	surplusIndex_stateVarId
);

let surplusIndex_preimage = {
	value: 0,
	salt: 0,
	commitment: 0,
};
if (!surplusIndex_commitment) {
	surplusIndex_commitmentExists = false;
	surplusIndex_witnessRequired = false;
} else {
	surplusIndex_preimage = surplusIndex_commitment.preimage;
}

let surplusIndex = generalise(surplusIndex_preimage.value);

let index_1 = generalise(parseInt(surplusIndex.integer, 10) + 1);
	// Initialise commitment preimage of whole state:

	let surpluses_index_1_stateVarId = 27;

	const surpluses_index_1_stateVarId_key = index_1;

	surpluses_index_1_stateVarId = generalise(
		utils.mimcHash(
			[
				generalise(surpluses_index_1_stateVarId).bigInt,
				surpluses_index_1_stateVarId_key.bigInt,
			],
			"ALT_BN_254"
		)
	).hex(32);

	let surpluses_index_1_commitmentExists = true;
	let surpluses_index_1_witnessRequired = true;

	const surpluses_index_1_commitment = await getCurrentWholeCommitment(
		surpluses_index_1_stateVarId
	);

	let surpluses_index_1_preimage = {
		value: { billNumber: 0, price: 0, volume: 0 },
		salt: 0,
		commitment: 0,
	};
	if (!surpluses_index_1_commitment) {
		surpluses_index_1_commitmentExists = false;
		surpluses_index_1_witnessRequired = false;
	} else {
		surpluses_index_1_preimage = surpluses_index_1_commitment.preimage;
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

	// Initialise commitment preimage of whole accessed state:

	const sequenceNumberInterval_stateVarId = generalise(31).hex(32);

	let sequenceNumberInterval_commitmentExists = true;

	const sequenceNumberInterval_commitment = await getCurrentWholeCommitment(
		sequenceNumberInterval_stateVarId
	);

	const sequenceNumberInterval_preimage =
		sequenceNumberInterval_commitment.preimage;

	const sequenceNumberInterval = generalise(
		sequenceNumberInterval_preimage.value
	);

	// Initialise commitment preimage of whole state:

	let generatorCharges_billNumber_stateVarId = 42;

	const generatorCharges_billNumber_stateVarId_key = billNumber;

	generatorCharges_billNumber_stateVarId = generalise(
		utils.mimcHash(
			[
				generalise(generatorCharges_billNumber_stateVarId).bigInt,
				generatorCharges_billNumber_stateVarId_key.bigInt,
			],
			"ALT_BN_254"
		)
	).hex(32);

	let generatorCharges_billNumber_commitmentExists = true;
	let generatorCharges_billNumber_witnessRequired = true;

	const generatorCharges_billNumber_commitment = await getCurrentWholeCommitment(
		generatorCharges_billNumber_stateVarId
	);

	let generatorCharges_billNumber_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!generatorCharges_billNumber_commitment) {
		generatorCharges_billNumber_commitmentExists = false;
		generatorCharges_billNumber_witnessRequired = false;
	} else {
		generatorCharges_billNumber_preimage =
			generatorCharges_billNumber_commitment.preimage;
	}

	// Initialise commitment preimage of whole state:

	let offtakerCharges_billNumber_stateVarId = 46;

	const offtakerCharges_billNumber_stateVarId_key = billNumber;

	offtakerCharges_billNumber_stateVarId = generalise(
		utils.mimcHash(
			[
				generalise(offtakerCharges_billNumber_stateVarId).bigInt,
				offtakerCharges_billNumber_stateVarId_key.bigInt,
			],
			"ALT_BN_254"
		)
	).hex(32);

	let offtakerCharges_billNumber_commitmentExists = true;
	let offtakerCharges_billNumber_witnessRequired = true;

	const offtakerCharges_billNumber_commitment = await getCurrentWholeCommitment(
		offtakerCharges_billNumber_stateVarId
	);

	let offtakerCharges_billNumber_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!offtakerCharges_billNumber_commitment) {
		offtakerCharges_billNumber_commitmentExists = false;
		offtakerCharges_billNumber_witnessRequired = false;
	} else {
		offtakerCharges_billNumber_preimage =
			offtakerCharges_billNumber_commitment.preimage;
	}

	// Initialise commitment preimage of whole state:

	let generatorInterest_billNumber_stateVarId = 50;

	const generatorInterest_billNumber_stateVarId_key = billNumber;

	generatorInterest_billNumber_stateVarId = generalise(
		utils.mimcHash(
			[
				generalise(generatorInterest_billNumber_stateVarId).bigInt,
				generatorInterest_billNumber_stateVarId_key.bigInt,
			],
			"ALT_BN_254"
		)
	).hex(32);

	let generatorInterest_billNumber_commitmentExists = true;
	let generatorInterest_billNumber_witnessRequired = true;

	const generatorInterest_billNumber_commitment = await getCurrentWholeCommitment(
		generatorInterest_billNumber_stateVarId
	);

	let generatorInterest_billNumber_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!generatorInterest_billNumber_commitment) {
		generatorInterest_billNumber_commitmentExists = false;
		generatorInterest_billNumber_witnessRequired = false;
	} else {
		generatorInterest_billNumber_preimage =
			generatorInterest_billNumber_commitment.preimage;
	}

	// Initialise commitment preimage of whole state:

	let offtakerInterest_billNumber_stateVarId = 54;

	const offtakerInterest_billNumber_stateVarId_key = billNumber;

	offtakerInterest_billNumber_stateVarId = generalise(
		utils.mimcHash(
			[
				generalise(offtakerInterest_billNumber_stateVarId).bigInt,
				offtakerInterest_billNumber_stateVarId_key.bigInt,
			],
			"ALT_BN_254"
		)
	).hex(32);

	let offtakerInterest_billNumber_commitmentExists = true;
	let offtakerInterest_billNumber_witnessRequired = true;

	const offtakerInterest_billNumber_commitment = await getCurrentWholeCommitment(
		offtakerInterest_billNumber_stateVarId
	);

	let offtakerInterest_billNumber_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!offtakerInterest_billNumber_commitment) {
		offtakerInterest_billNumber_commitmentExists = false;
		offtakerInterest_billNumber_witnessRequired = false;
	} else {
		offtakerInterest_billNumber_preimage =
			offtakerInterest_billNumber_commitment.preimage;
	}

	// Initialise commitment preimage of whole state:

	let negativePriceCharges_billNumber_stateVarId = 58;

	const negativePriceCharges_billNumber_stateVarId_key = billNumber;

	negativePriceCharges_billNumber_stateVarId = generalise(
		utils.mimcHash(
			[
				generalise(negativePriceCharges_billNumber_stateVarId).bigInt,
				negativePriceCharges_billNumber_stateVarId_key.bigInt,
			],
			"ALT_BN_254"
		)
	).hex(32);

	let negativePriceCharges_billNumber_commitmentExists = true;
	let negativePriceCharges_billNumber_witnessRequired = true;

	const negativePriceCharges_billNumber_commitment = await getCurrentWholeCommitment(
		negativePriceCharges_billNumber_stateVarId
	);

	let negativePriceCharges_billNumber_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!negativePriceCharges_billNumber_commitment) {
		negativePriceCharges_billNumber_commitmentExists = false;
		negativePriceCharges_billNumber_witnessRequired = false;
	} else {
		negativePriceCharges_billNumber_preimage =
			negativePriceCharges_billNumber_commitment.preimage;
	}

	// Initialise commitment preimage of whole accessed state:

	const numberOfConsecutivePeriodsForShortfall_stateVarId = generalise(60).hex(
		32
	);

	let numberOfConsecutivePeriodsForShortfall_commitmentExists = true;

	const numberOfConsecutivePeriodsForShortfall_commitment = await getCurrentWholeCommitment(
		numberOfConsecutivePeriodsForShortfall_stateVarId
	);

	const numberOfConsecutivePeriodsForShortfall_preimage =
		numberOfConsecutivePeriodsForShortfall_commitment.preimage;

	const numberOfConsecutivePeriodsForShortfall = generalise(
		numberOfConsecutivePeriodsForShortfall_preimage.value
	);

	// Initialise commitment preimage of whole state:

	const shortfallThreshold_stateVarId = generalise(62).hex(32);

	let shortfallThreshold_commitmentExists = true;

	const shortfallThreshold_commitment = await getCurrentWholeCommitment(
		shortfallThreshold_stateVarId
	);

	const shortfallThreshold_preimage = shortfallThreshold_commitment.preimage;
	const shortfallThreshold = generalise(shortfallThreshold_commitment.preimage.value);
	// Initialise commitment preimage of whole state:

	const shortfallChargeSum_stateVarId = generalise(64).hex(32);

	let shortfallChargeSum_commitmentExists = true;
	let shortfallChargeSum_witnessRequired = true;

	const shortfallChargeSum_commitment = await getCurrentWholeCommitment(
		shortfallChargeSum_stateVarId
	);

	let shortfallChargeSum_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!shortfallChargeSum_commitment) {
		shortfallChargeSum_commitmentExists = false;
		shortfallChargeSum_witnessRequired = false;
	} else {
		shortfallChargeSum_preimage = shortfallChargeSum_commitment.preimage;
	}

	
	// Initialise commitment preimage of whole state:

	let shortfallCharges_billNumber_stateVarId = 70;

	const shortfallCharges_billNumber_stateVarId_key = billNumber;

	shortfallCharges_billNumber_stateVarId = generalise(
		utils.mimcHash(
			[
				generalise(shortfallCharges_billNumber_stateVarId).bigInt,
				shortfallCharges_billNumber_stateVarId_key.bigInt,
			],
			"ALT_BN_254"
		)
	).hex(32);

	let shortfallCharges_billNumber_commitmentExists = true;
	let shortfallCharges_billNumber_witnessRequired = true;

	const shortfallCharges_billNumber_commitment = await getCurrentWholeCommitment(
		shortfallCharges_billNumber_stateVarId
	);

	let shortfallCharges_billNumber_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!shortfallCharges_billNumber_commitment) {
		shortfallCharges_billNumber_commitmentExists = false;
		shortfallCharges_billNumber_witnessRequired = false;
	} else {
		shortfallCharges_billNumber_preimage =
			shortfallCharges_billNumber_commitment.preimage;
	}

	// Initialise commitment preimage of whole accessed state:

	const numberOfConsecutivePeriodsForSurplus_stateVarId = generalise(72).hex(
		32
	);

	let numberOfConsecutivePeriodsForSurplus_commitmentExists = true;

	const numberOfConsecutivePeriodsForSurplus_commitment = await getCurrentWholeCommitment(
		numberOfConsecutivePeriodsForSurplus_stateVarId
	);

	const numberOfConsecutivePeriodsForSurplus_preimage =
		numberOfConsecutivePeriodsForSurplus_commitment.preimage;

	const numberOfConsecutivePeriodsForSurplus = generalise(
		numberOfConsecutivePeriodsForSurplus_preimage.value
	);
	


	// Initialise commitment preimage of whole state:

	const surplusThreshold_stateVarId = generalise(74).hex(32);

	let surplusThreshold_commitmentExists = true;
	const surplusThreshold_commitment = await getCurrentWholeCommitment(
		surplusThreshold_stateVarId
	);


	const surplusThreshold_preimage = surplusThreshold_commitment.preimage;
	const surplusThreshold = generalise(surplusThreshold_commitment.preimage.value);

	// Initialise commitment preimage of whole state:

	const surplusChargeSum_stateVarId = generalise(76).hex(32);

	let surplusChargeSum_commitmentExists = true;
	let surplusChargeSum_witnessRequired = true;

	const surplusChargeSum_commitment = await getCurrentWholeCommitment(
		surplusChargeSum_stateVarId
	);

	let surplusChargeSum_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!surplusChargeSum_commitment) {
		surplusChargeSum_commitmentExists = false;
		surplusChargeSum_witnessRequired = false;
	} else {
		surplusChargeSum_preimage = surplusChargeSum_commitment.preimage;
	}

	
	// Initialise commitment preimage of whole state:

	let surplusCharges_billNumber_stateVarId = 82;

	const surplusCharges_billNumber_stateVarId_key = billNumber;

	surplusCharges_billNumber_stateVarId = generalise(
		utils.mimcHash(
			[
				generalise(surplusCharges_billNumber_stateVarId).bigInt,
				surplusCharges_billNumber_stateVarId_key.bigInt,
			],
			"ALT_BN_254"
		)
	).hex(32);

	let surplusCharges_billNumber_commitmentExists = true;
	let surplusCharges_billNumber_witnessRequired = true;

	const surplusCharges_billNumber_commitment = await getCurrentWholeCommitment(
		surplusCharges_billNumber_stateVarId
	);

	let surplusCharges_billNumber_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!surplusCharges_billNumber_commitment) {
		surplusCharges_billNumber_commitmentExists = false;
		surplusCharges_billNumber_witnessRequired = false;
	} else {
		surplusCharges_billNumber_preimage =
			surplusCharges_billNumber_commitment.preimage;
	}

	// read preimage for whole state
	const strikePrice_currentCommitment = generalise(strikePrice_commitment._id);
	const strikePrice_prev = generalise(strikePrice_preimage.value);
	const strikePrice_prevSalt = generalise(strikePrice_preimage.salt);

	// read preimage for accessed state

	const bundlePrice_currentCommitment = generalise(bundlePrice_commitment._id);
	const bundlePrice_prev = generalise(bundlePrice_preimage.value);
	const bundlePrice_prevSalt = generalise(bundlePrice_preimage.salt);

	// read preimage for accessed state

	const volumeShare_currentCommitment = generalise(volumeShare_commitment._id);
	const volumeShare_prev = generalise(volumeShare_preimage.value);
	const volumeShare_prevSalt = generalise(volumeShare_preimage.salt);

	// read preimage for accessed state

	const dailyInterestRate_currentCommitment = generalise(
		dailyInterestRate_commitment._id
	);
	const dailyInterestRate_prev = generalise(dailyInterestRate_preimage.value);
	const dailyInterestRate_prevSalt = generalise(
		dailyInterestRate_preimage.salt
	);

	// read preimage for accessed state

	const startDateOfContract_currentCommitment = generalise(
		startDateOfContract_commitment._id
	);
	const startDateOfContract_prev = generalise(
		startDateOfContract_preimage.value
	);
	const startDateOfContract_prevSalt = generalise(
		startDateOfContract_preimage.salt
	);

	// read preimage for accessed state

	const expiryDateOfContract_currentCommitment = generalise(
		expiryDateOfContract_commitment._id
	);
	const expiryDateOfContract_prev = generalise(
		expiryDateOfContract_preimage.value
	);
	const expiryDateOfContract_prevSalt = generalise(
		expiryDateOfContract_preimage.salt
	);

	// read preimage for whole state
	shortfalls_index_newOwnerPublicKey =
		_shortfalls_index_newOwnerPublicKey === 0
			? publicKey
			: shortfalls_index_newOwnerPublicKey;

	const shortfalls_index_currentCommitment = shortfalls_index_commitmentExists
		? generalise(shortfalls_index_commitment._id)
		: generalise(0);
	const shortfalls_index_prev = generalise(shortfalls_index_preimage.value);
	const shortfalls_index_prevSalt = generalise(shortfalls_index_preimage.salt);

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
	surpluses_index_1_newOwnerPublicKey =
		_surpluses_index_1_newOwnerPublicKey === 0
			? publicKey
			: surpluses_index_1_newOwnerPublicKey;

	const surpluses_index_1_currentCommitment = surpluses_index_1_commitmentExists
		? generalise(surpluses_index_1_commitment._id)
		: generalise(0);
	const surpluses_index_1_prev = generalise(surpluses_index_1_preimage.value);
	const surpluses_index_1_prevSalt = generalise(
		surpluses_index_1_preimage.salt
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

	// read preimage for accessed state

	const sequenceNumberInterval_currentCommitment = generalise(
		sequenceNumberInterval_commitment._id
	);
	const sequenceNumberInterval_prev = generalise(
		sequenceNumberInterval_preimage.value
	);
	const sequenceNumberInterval_prevSalt = generalise(
		sequenceNumberInterval_preimage.salt
	);

	// read preimage for whole state
	generatorCharges_billNumber_newOwnerPublicKey =
		_generatorCharges_billNumber_newOwnerPublicKey === 0
			? publicKey
			: generatorCharges_billNumber_newOwnerPublicKey;

	const generatorCharges_billNumber_currentCommitment = generatorCharges_billNumber_commitmentExists
		? generalise(generatorCharges_billNumber_commitment._id)
		: generalise(0);
	const generatorCharges_billNumber_prev = generalise(
		generatorCharges_billNumber_preimage.value
	);
	const generatorCharges_billNumber_prevSalt = generalise(
		generatorCharges_billNumber_preimage.salt
	);

	// read preimage for whole state
	offtakerCharges_billNumber_newOwnerPublicKey =
		_offtakerCharges_billNumber_newOwnerPublicKey === 0
			? publicKey
			: offtakerCharges_billNumber_newOwnerPublicKey;

	const offtakerCharges_billNumber_currentCommitment = offtakerCharges_billNumber_commitmentExists
		? generalise(offtakerCharges_billNumber_commitment._id)
		: generalise(0);
	const offtakerCharges_billNumber_prev = generalise(
		offtakerCharges_billNumber_preimage.value
	);
	const offtakerCharges_billNumber_prevSalt = generalise(
		offtakerCharges_billNumber_preimage.salt
	);

	// read preimage for whole state
	generatorInterest_billNumber_newOwnerPublicKey =
		_generatorInterest_billNumber_newOwnerPublicKey === 0
			? publicKey
			: generatorInterest_billNumber_newOwnerPublicKey;

	const generatorInterest_billNumber_currentCommitment = generatorInterest_billNumber_commitmentExists
		? generalise(generatorInterest_billNumber_commitment._id)
		: generalise(0);
	const generatorInterest_billNumber_prev = generalise(
		generatorInterest_billNumber_preimage.value
	);
	const generatorInterest_billNumber_prevSalt = generalise(
		generatorInterest_billNumber_preimage.salt
	);

	// read preimage for whole state
	offtakerInterest_billNumber_newOwnerPublicKey =
		_offtakerInterest_billNumber_newOwnerPublicKey === 0
			? publicKey
			: offtakerInterest_billNumber_newOwnerPublicKey;

	const offtakerInterest_billNumber_currentCommitment = offtakerInterest_billNumber_commitmentExists
		? generalise(offtakerInterest_billNumber_commitment._id)
		: generalise(0);
	const offtakerInterest_billNumber_prev = generalise(
		offtakerInterest_billNumber_preimage.value
	);
	const offtakerInterest_billNumber_prevSalt = generalise(
		offtakerInterest_billNumber_preimage.salt
	);

	// read preimage for whole state
	negativePriceCharges_billNumber_newOwnerPublicKey =
		_negativePriceCharges_billNumber_newOwnerPublicKey === 0
			? publicKey
			: negativePriceCharges_billNumber_newOwnerPublicKey;

	const negativePriceCharges_billNumber_currentCommitment = negativePriceCharges_billNumber_commitmentExists
		? generalise(negativePriceCharges_billNumber_commitment._id)
		: generalise(0);
	const negativePriceCharges_billNumber_prev = generalise(
		negativePriceCharges_billNumber_preimage.value
	);
	const negativePriceCharges_billNumber_prevSalt = generalise(
		negativePriceCharges_billNumber_preimage.salt
	);

	// read preimage for accessed state

	const numberOfConsecutivePeriodsForShortfall_currentCommitment = generalise(
		numberOfConsecutivePeriodsForShortfall_commitment._id
	);
	const numberOfConsecutivePeriodsForShortfall_prev = generalise(
		numberOfConsecutivePeriodsForShortfall_preimage.value
	);
	const numberOfConsecutivePeriodsForShortfall_prevSalt = generalise(
		numberOfConsecutivePeriodsForShortfall_preimage.salt
	);

	// read preimage for whole state
	const shortfallThreshold_currentCommitment = generalise(
        shortfallThreshold_commitment._id); 
	const shortfallThreshold_prev = generalise(shortfallThreshold_preimage.value);
	const shortfallThreshold_prevSalt = generalise(
		shortfallThreshold_preimage.salt
	);

	// read preimage for whole state
	shortfallChargeSum_newOwnerPublicKey =
		_shortfallChargeSum_newOwnerPublicKey === 0
			? publicKey
			: shortfallChargeSum_newOwnerPublicKey;

	const shortfallChargeSum_currentCommitment = shortfallChargeSum_commitmentExists
		? generalise(shortfallChargeSum_commitment._id)
		: generalise(0);
	const shortfallChargeSum_prev = generalise(shortfallChargeSum_preimage.value);
	const shortfallChargeSum_prevSalt = generalise(
		shortfallChargeSum_preimage.salt
	);

	// read preimage for whole state
	shortfallIndex_newOwnerPublicKey =
		_shortfallIndex_newOwnerPublicKey === 0
			? publicKey
			: shortfallIndex_newOwnerPublicKey;

	const shortfallIndex_currentCommitment = shortfallIndex_commitmentExists
		? generalise(shortfallIndex_commitment._id)
		: generalise(0);
	const shortfallIndex_prev = generalise(shortfallIndex_preimage.value);
	const shortfallIndex_prevSalt = generalise(shortfallIndex_preimage.salt);

	// read preimage for whole state
	shortfallCharges_billNumber_newOwnerPublicKey =
		_shortfallCharges_billNumber_newOwnerPublicKey === 0
			? publicKey
			: shortfallCharges_billNumber_newOwnerPublicKey;

	const shortfallCharges_billNumber_currentCommitment = shortfallCharges_billNumber_commitmentExists
		? generalise(shortfallCharges_billNumber_commitment._id)
		: generalise(0);
	const shortfallCharges_billNumber_prev = generalise(
		shortfallCharges_billNumber_preimage.value
	);
	const shortfallCharges_billNumber_prevSalt = generalise(
		shortfallCharges_billNumber_preimage.salt
	);

	// read preimage for accessed state

	const numberOfConsecutivePeriodsForSurplus_currentCommitment = generalise(
		numberOfConsecutivePeriodsForSurplus_commitment._id
	);
	const numberOfConsecutivePeriodsForSurplus_prev = generalise(
		numberOfConsecutivePeriodsForSurplus_preimage.value
	);
	const numberOfConsecutivePeriodsForSurplus_prevSalt = generalise(
		numberOfConsecutivePeriodsForSurplus_preimage.salt
	);

	// read preimage for whole state
	const surplusThreshold_currentCommitment = generalise(surplusThreshold_commitment._id);
	const surplusThreshold_prev = generalise(surplusThreshold_preimage.value);
	const surplusThreshold_prevSalt = generalise(surplusThreshold_preimage.salt);

	// read preimage for whole state
	surplusChargeSum_newOwnerPublicKey =
		_surplusChargeSum_newOwnerPublicKey === 0
			? publicKey
			: surplusChargeSum_newOwnerPublicKey;

	const surplusChargeSum_currentCommitment = surplusChargeSum_commitmentExists
		? generalise(surplusChargeSum_commitment._id)
		: generalise(0);
	const surplusChargeSum_prev = generalise(surplusChargeSum_preimage.value);
	const surplusChargeSum_prevSalt = generalise(surplusChargeSum_preimage.salt);

	// read preimage for whole state
	surplusIndex_newOwnerPublicKey =
		_surplusIndex_newOwnerPublicKey === 0
			? publicKey
			: surplusIndex_newOwnerPublicKey;

	const surplusIndex_currentCommitment = surplusIndex_commitmentExists
		? generalise(surplusIndex_commitment._id)
		: generalise(0);
	const surplusIndex_prev = generalise(surplusIndex_preimage.value);
	const surplusIndex_prevSalt = generalise(surplusIndex_preimage.salt);

	// read preimage for whole state
	surplusCharges_billNumber_newOwnerPublicKey =
		_surplusCharges_billNumber_newOwnerPublicKey === 0
			? publicKey
			: surplusCharges_billNumber_newOwnerPublicKey;

	const surplusCharges_billNumber_currentCommitment = surplusCharges_billNumber_commitmentExists
		? generalise(surplusCharges_billNumber_commitment._id)
		: generalise(0);
	const surplusCharges_billNumber_prev = generalise(
		surplusCharges_billNumber_preimage.value
	);
	const surplusCharges_billNumber_prevSalt = generalise(
		surplusCharges_billNumber_preimage.salt
	);

	// Extract set membership witness:

	// generate witness for whole state
	const strikePrice_emptyPath = new Array(32).fill(0);
	const strikePrice_witness =  await getMembershipWitness(
		"SyntheticPpaShield",
		strikePrice_currentCommitment.integer
  );
	const strikePrice_index = generalise(strikePrice_witness.index);
	const strikePrice_root = generalise(strikePrice_witness.root);
	const strikePrice_path = generalise(strikePrice_witness.path).all;

	// generate witness for whole accessed state
	const bundlePrice_witness = await getMembershipWitness(
		"SyntheticPpaShield",
		bundlePrice_currentCommitment.integer
	);
	const bundlePrice_index = generalise(bundlePrice_witness.index);
	const bundlePrice_root = generalise(bundlePrice_witness.root);
	const bundlePrice_path = generalise(bundlePrice_witness.path).all;

	// generate witness for whole accessed state
	const volumeShare_witness = await getMembershipWitness(
		"SyntheticPpaShield",
		volumeShare_currentCommitment.integer
	);
	const volumeShare_index = generalise(volumeShare_witness.index);
	const volumeShare_root = generalise(volumeShare_witness.root);
	const volumeShare_path = generalise(volumeShare_witness.path).all;

	// generate witness for whole accessed state
	const dailyInterestRate_witness = await getMembershipWitness(
		"SyntheticPpaShield",
		dailyInterestRate_currentCommitment.integer
	);
	const dailyInterestRate_index = generalise(dailyInterestRate_witness.index);
	const dailyInterestRate_root = generalise(dailyInterestRate_witness.root);
	const dailyInterestRate_path = generalise(dailyInterestRate_witness.path).all;

	// generate witness for whole accessed state
	const startDateOfContract_witness = await getMembershipWitness(
		"SyntheticPpaShield",
		startDateOfContract_currentCommitment.integer
	);
	const startDateOfContract_index = generalise(
		startDateOfContract_witness.index
	);
	const startDateOfContract_root = generalise(startDateOfContract_witness.root);
	const startDateOfContract_path = generalise(startDateOfContract_witness.path)
		.all;

	// generate witness for whole accessed state
	const expiryDateOfContract_witness = await getMembershipWitness(
		"SyntheticPpaShield",
		expiryDateOfContract_currentCommitment.integer
	);
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
	const shortfalls_index_emptyPath = new Array(32).fill(0);
	const shortfalls_index_witness = shortfalls_index_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				shortfalls_index_currentCommitment.integer
		  )
		: {
				index: 0,
				path: shortfalls_index_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const shortfalls_index_index = generalise(shortfalls_index_witness.index);
	const shortfalls_index_root = generalise(shortfalls_index_witness.root);
	const shortfalls_index_path = generalise(shortfalls_index_witness.path).all;

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
	const surpluses_index_1_emptyPath = new Array(32).fill(0);
	const surpluses_index_1_witness = surpluses_index_1_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				surpluses_index_1_currentCommitment.integer
		  )
		: {
				index: 0,
				path: surpluses_index_1_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const surpluses_index_1_index = generalise(surpluses_index_1_witness.index);
	const surpluses_index_1_root = generalise(surpluses_index_1_witness.root);
	const surpluses_index_1_path = generalise(surpluses_index_1_witness.path).all;


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

	// generate witness for whole accessed state
	const sequenceNumberInterval_witness = await getMembershipWitness(
		"SyntheticPpaShield",
		sequenceNumberInterval_currentCommitment.integer
	);
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
	const generatorCharges_billNumber_emptyPath = new Array(32).fill(0);
	const generatorCharges_billNumber_witness = generatorCharges_billNumber_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				generatorCharges_billNumber_currentCommitment.integer
		  )
		: {
				index: 0,
				path: generatorCharges_billNumber_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const generatorCharges_billNumber_index = generalise(
		generatorCharges_billNumber_witness.index
	);
	const generatorCharges_billNumber_root = generalise(
		generatorCharges_billNumber_witness.root
	);
	const generatorCharges_billNumber_path = generalise(
		generatorCharges_billNumber_witness.path
	).all;

	// generate witness for whole state
	const offtakerCharges_billNumber_emptyPath = new Array(32).fill(0);
	const offtakerCharges_billNumber_witness = offtakerCharges_billNumber_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				offtakerCharges_billNumber_currentCommitment.integer
		  )
		: {
				index: 0,
				path: offtakerCharges_billNumber_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const offtakerCharges_billNumber_index = generalise(
		offtakerCharges_billNumber_witness.index
	);
	const offtakerCharges_billNumber_root = generalise(
		offtakerCharges_billNumber_witness.root
	);
	const offtakerCharges_billNumber_path = generalise(
		offtakerCharges_billNumber_witness.path
	).all;

	// generate witness for whole state
	const generatorInterest_billNumber_emptyPath = new Array(32).fill(0);
	const generatorInterest_billNumber_witness = generatorInterest_billNumber_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				generatorInterest_billNumber_currentCommitment.integer
		  )
		: {
				index: 0,
				path: generatorInterest_billNumber_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const generatorInterest_billNumber_index = generalise(
		generatorInterest_billNumber_witness.index
	);
	const generatorInterest_billNumber_root = generalise(
		generatorInterest_billNumber_witness.root
	);
	const generatorInterest_billNumber_path = generalise(
		generatorInterest_billNumber_witness.path
	).all;

	// generate witness for whole state
	const offtakerInterest_billNumber_emptyPath = new Array(32).fill(0);
	const offtakerInterest_billNumber_witness = offtakerInterest_billNumber_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				offtakerInterest_billNumber_currentCommitment.integer
		  )
		: {
				index: 0,
				path: offtakerInterest_billNumber_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const offtakerInterest_billNumber_index = generalise(
		offtakerInterest_billNumber_witness.index
	);
	const offtakerInterest_billNumber_root = generalise(
		offtakerInterest_billNumber_witness.root
	);
	const offtakerInterest_billNumber_path = generalise(
		offtakerInterest_billNumber_witness.path
	).all;

	// generate witness for whole state
	const negativePriceCharges_billNumber_emptyPath = new Array(32).fill(0);
	const negativePriceCharges_billNumber_witness = negativePriceCharges_billNumber_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				negativePriceCharges_billNumber_currentCommitment.integer
		  )
		: {
				index: 0,
				path: negativePriceCharges_billNumber_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const negativePriceCharges_billNumber_index = generalise(
		negativePriceCharges_billNumber_witness.index
	);
	const negativePriceCharges_billNumber_root = generalise(
		negativePriceCharges_billNumber_witness.root
	);
	const negativePriceCharges_billNumber_path = generalise(
		negativePriceCharges_billNumber_witness.path
	).all;

	// generate witness for whole accessed state
	const numberOfConsecutivePeriodsForShortfall_witness = await getMembershipWitness(
		"SyntheticPpaShield",
		numberOfConsecutivePeriodsForShortfall_currentCommitment.integer
	);
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
	const shortfallThreshold_witness = await getMembershipWitness(
		"SyntheticPpaShield",
		shortfallThreshold_currentCommitment.integer
  );
	const shortfallThreshold_index = generalise(shortfallThreshold_witness.index);
	const shortfallThreshold_root = generalise(shortfallThreshold_witness.root);
	const shortfallThreshold_path = generalise(shortfallThreshold_witness.path)
		.all;

	// generate witness for whole state
	const shortfallChargeSum_emptyPath = new Array(32).fill(0);
	const shortfallChargeSum_witness = shortfallChargeSum_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				shortfallChargeSum_currentCommitment.integer
		  )
		: {
				index: 0,
				path: shortfallChargeSum_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const shortfallChargeSum_index = generalise(shortfallChargeSum_witness.index);
	const shortfallChargeSum_root = generalise(shortfallChargeSum_witness.root);
	const shortfallChargeSum_path = generalise(shortfallChargeSum_witness.path)
		.all;

	// generate witness for whole state
	const shortfallIndex_emptyPath = new Array(32).fill(0);
	const shortfallIndex_witness = shortfallIndex_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				shortfallIndex_currentCommitment.integer
		  )
		: {
				index: 0,
				path: shortfallIndex_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const shortfallIndex_index = generalise(shortfallIndex_witness.index);
	const shortfallIndex_root = generalise(shortfallIndex_witness.root);
	const shortfallIndex_path = generalise(shortfallIndex_witness.path).all;

	// generate witness for whole state
	const shortfallCharges_billNumber_emptyPath = new Array(32).fill(0);
	const shortfallCharges_billNumber_witness = shortfallCharges_billNumber_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				shortfallCharges_billNumber_currentCommitment.integer
		  )
		: {
				index: 0,
				path: shortfallCharges_billNumber_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const shortfallCharges_billNumber_index = generalise(
		shortfallCharges_billNumber_witness.index
	);
	const shortfallCharges_billNumber_root = generalise(
		shortfallCharges_billNumber_witness.root
	);
	const shortfallCharges_billNumber_path = generalise(
		shortfallCharges_billNumber_witness.path
	).all;

	// generate witness for whole accessed state
	const numberOfConsecutivePeriodsForSurplus_witness = await getMembershipWitness(
		"SyntheticPpaShield",
		numberOfConsecutivePeriodsForSurplus_currentCommitment.integer
	);
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
	const surplusThreshold_witness =  await getMembershipWitness(
				"SyntheticPpaShield",
				surplusThreshold_currentCommitment.integer
		  );
	const surplusThreshold_index = generalise(surplusThreshold_witness.index);
	const surplusThreshold_root = generalise(surplusThreshold_witness.root);
	const surplusThreshold_path = generalise(surplusThreshold_witness.path).all;

	// generate witness for whole state
	const surplusChargeSum_emptyPath = new Array(32).fill(0);
	const surplusChargeSum_witness = surplusChargeSum_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				surplusChargeSum_currentCommitment.integer
		  )
		: {
				index: 0,
				path: surplusChargeSum_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const surplusChargeSum_index = generalise(surplusChargeSum_witness.index);
	const surplusChargeSum_root = generalise(surplusChargeSum_witness.root);
	const surplusChargeSum_path = generalise(surplusChargeSum_witness.path).all;

	// generate witness for whole state
	const surplusIndex_emptyPath = new Array(32).fill(0);
	const surplusIndex_witness = surplusIndex_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				surplusIndex_currentCommitment.integer
		  )
		: {
				index: 0,
				path: surplusIndex_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const surplusIndex_index = generalise(surplusIndex_witness.index);
	const surplusIndex_root = generalise(surplusIndex_witness.root);
	const surplusIndex_path = generalise(surplusIndex_witness.path).all;

	// generate witness for whole state
	const surplusCharges_billNumber_emptyPath = new Array(32).fill(0);
	const surplusCharges_billNumber_witness = surplusCharges_billNumber_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				surplusCharges_billNumber_currentCommitment.integer
		  )
		: {
				index: 0,
				path: surplusCharges_billNumber_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const surplusCharges_billNumber_index = generalise(
		surplusCharges_billNumber_witness.index
	);
	const surplusCharges_billNumber_root = generalise(
		surplusCharges_billNumber_witness.root
	);
	const surplusCharges_billNumber_path = generalise(
		surplusCharges_billNumber_witness.path
	).all;

	let negativePriceCharges_billNumber = generalise(
		negativePriceCharges_billNumber_preimage.value
	);

	let offtakerInterest_billNumber = generalise(
		offtakerInterest_billNumber_preimage.value
	);

	let generatorInterest_billNumber = generalise(
		generatorInterest_billNumber_preimage.value
	);

	let surplusCharges_billNumber = generalise(
		surplusCharges_billNumber_preimage.value
	);

	let latestSurplusSequenceNumber = generalise(
		latestSurplusSequenceNumber_preimage.value
	);

	surplusIndex = generalise(surplusIndex_preimage.value);

	let surplusChargeSum = generalise(surplusChargeSum_preimage.value);

	let surpluses_index_1 = generalise(
		surpluses_index_1_preimage.value
	);

	let shortfallCharges_billNumber = generalise(
		shortfallCharges_billNumber_preimage.value
	);

	let latestShortfallSequenceNumber = generalise(
		latestShortfallSequenceNumber_preimage.value
	);


	let shortfallChargeSum = generalise(shortfallChargeSum_preimage.value);

	let shortfalls_index = generalise(shortfalls_index_preimage.value);

	let offtakerCharges_billNumber = generalise(
		offtakerCharges_billNumber_preimage.value
	);

	let generatorCharges_billNumber = generalise(
		generatorCharges_billNumber_preimage.value
	);

	let offtakerVolume = generalise(
		parseInt(totalGeneratedVolume.integer, 10) *
			parseInt(volumeShare.integer, 10)
	);

	let fixedAmount = generalise(
		parseInt(offtakerVolume.integer, 10) *
			parseInt(bundlePrice.integer, 10) *
			parseInt(marginalLossFactor.integer, 10)
	);


	// Added check : if bills are not in correct sequence

	if(parseInt(sequenceNumber.integer, 10) != (parseInt(latestShortfallSequenceNumber.integer, 10) + parseInt(sequenceNumberInterval.integer, 10))){
		throw new Error(
		"Bills are not in a correct sequence. Please make sure they are in a order."
	   );
    }

	let netPositiveAdjustment = generalise(0);

	let netNegativeAdjustment = generalise(0);

	if (
		parseInt(negativeAdjustment.integer, 10) >
		parseInt(positiveAdjustment.integer, 10)
	) {
		netNegativeAdjustment =
			parseInt(negativeAdjustment.integer, 10) -
			parseInt(positiveAdjustment.integer, 10);
	} else {
		netPositiveAdjustment =
			parseInt(positiveAdjustment.integer, 10) -
			parseInt(negativeAdjustment.integer, 10);
	}

	netPositiveAdjustment = generalise(netPositiveAdjustment);
	netNegativeAdjustment = generalise(netNegativeAdjustment);


	
	if (
		(parseInt(floatingAmount.integer, 10) +
			parseInt(netNegativeAdjustment.integer, 10)) >
		(parseInt(fixedAmount.integer, 10) +
			parseInt(netPositiveAdjustment.integer, 10))
	) {
		generatorCharges_billNumber =
			parseInt(floatingAmount.integer, 10) -
			parseInt(fixedAmount.integer, 10) +
			parseInt(positiveAdjustment.integer, 10) -
			parseInt(negativeAdjustment.integer, 10);
	} else {
		offtakerCharges_billNumber =
			parseInt(fixedAmount.integer, 10) -
			parseInt(floatingAmount.integer, 10) +
			parseInt(positiveAdjustment.integer, 10) -
			parseInt(negativeAdjustment.integer, 10);
	}

	generatorCharges_billNumber = generalise(generatorCharges_billNumber);

	offtakerCharges_billNumber = generalise(offtakerCharges_billNumber);

	let shortfallSequence = generalise(false);

	if (
		parseInt(sequenceNumber.integer, 10) ==
			parseInt(latestShortfallSequenceNumber.integer, 10) +
				parseInt(sequenceNumberInterval.integer, 10) ||
		parseInt(latestShortfallSequenceNumber.integer, 10) == 0 ||
		parseInt(sequenceNumber.integer, 10) == 0
	) {
		shortfallSequence = true;
	}

	let surplusSequence = generalise(false);

	if (
		parseInt(sequenceNumber.integer, 10) ==
			parseInt(latestSurplusSequenceNumber.integer, 10) +
				parseInt(sequenceNumberInterval.integer, 10) ||
		parseInt(latestSurplusSequenceNumber.integer, 10) == 0 ||
		parseInt(sequenceNumber.integer, 10) == 0
	) {
		surplusSequence = true;
	}

	let priceDifference = generalise(0);

	if (parseInt(averagePrice.integer, 10) > parseInt(strikePrice.integer, 10)) {
		priceDifference =
			parseInt(averagePrice.integer, 10) - parseInt(strikePrice.integer, 10);
	} else {
		priceDifference =
			parseInt(strikePrice.integer, 10) - parseInt(averagePrice.integer, 10);
	}

	let volumeDifference = generalise(0);

	if (
		parseInt(expectedVolume.integer, 10) > parseInt(offtakerVolume.integer, 10)
	) {
		volumeDifference =
			parseInt(expectedVolume.integer, 10) -
			parseInt(totalGeneratedVolume.integer, 10);
	} else {
		volumeDifference =
			parseInt(totalGeneratedVolume.integer, 10) -
			parseInt(expectedVolume.integer, 10);
	}

	if (
		parseInt(shortfallSequence.integer, 10) === 0
			? false
			: true &&
			  parseInt(expectedVolume.integer, 10) >
					parseInt(offtakerVolume.integer, 10) &&
			  parseInt(volumeDifference.integer, 10) >=
					parseInt(shortfallThreshold.integer, 10)
	) {
		shortfalls_index.billNumber = billNumber;

		shortfalls_index.price = parseInt(averagePrice.integer, 10);

		shortfalls_index.volume =
			parseInt(expectedVolume.integer, 10) -
			parseInt(offtakerVolume.integer, 10);

		shortfallChargeSum =
			parseInt(shortfallChargeSum.integer, 10) +
			parseInt(shortfalls_index.volume.integer, 10) *
				parseInt(priceDifference.integer, 10);

		shortfallIndex = parseInt(shortfallIndex.integer, 10) + 1;

		latestShortfallSequenceNumber = parseInt(sequenceNumber.integer, 10);
	}

	shortfalls_index = generalise(shortfalls_index);

	shortfalls_index = generalise(shortfalls_index);

	shortfalls_index = generalise(shortfalls_index);

	shortfallChargeSum = generalise(shortfallChargeSum);

	shortfallIndex = generalise(shortfallIndex);

	latestShortfallSequenceNumber = generalise(latestShortfallSequenceNumber);

	if (
		parseInt(shortfallSequence.integer, 10) === 0
			? false
			: (true &&
					(parseInt(expectedVolume.integer, 10) <
						parseInt(offtakerVolume.integer, 10)) ||
			  parseInt(volumeDifference.integer, 10) <=
					parseInt(shortfallThreshold.integer, 10))
	) {
		shortfallChargeSum = 0;

		shortfallIndex = 0;

		latestShortfallSequenceNumber = 0;
	}

	shortfallChargeSum = generalise(shortfallChargeSum);

	shortfallIndex = generalise(shortfallIndex);

	latestShortfallSequenceNumber = generalise(latestShortfallSequenceNumber);

	if (
		parseInt(shortfallIndex.integer, 10) >=
		parseInt(numberOfConsecutivePeriodsForShortfall.integer, 10)
	) {
		shortfallCharges_billNumber = parseInt(shortfallChargeSum.integer, 10);

		shortfallChargeSum = 0;

		shortfallIndex = 0;

		latestShortfallSequenceNumber = 0;
	}

	shortfallCharges_billNumber = generalise(shortfallCharges_billNumber);

	shortfallChargeSum = generalise(shortfallChargeSum);

	shortfallIndex = generalise(shortfallIndex);

	latestShortfallSequenceNumber = generalise(latestShortfallSequenceNumber);

	if (
		parseInt(surplusSequence.integer, 10) === 0
			? false
			: true &&
			  parseInt(expectedVolume.integer, 10) <
					parseInt(offtakerVolume.integer, 10) &&
			  parseInt(volumeDifference.integer, 10) >=
					parseInt(surplusThreshold.integer, 10)
	) {
		surpluses_index_1.billNumber = parseInt(billNumber.integer, 10);

		surpluses_index_1.price = parseInt(averagePrice.integer, 10);

		surpluses_index_1.volume =
		parseInt(offtakerVolume.integer, 10) -
		parseInt(expectedVolume.integer, 10);

		surplusChargeSum =
			parseInt(surplusChargeSum.integer, 10) +
			parseInt(surplus_tempSurplusIndex.volume.integer, 10) *
				parseInt(priceDifference.integer, 10);

		surplusIndex = parseInt(surplusIndex.integer, 10) + 1;

		latestSurplusSequenceNumber = parseInt(sequenceNumber.integer, 10);
	}

	surpluses_index_1 = generalise(surpluses_index_1);

	surplusChargeSum = generalise(surplusChargeSum);

	surplusIndex = generalise(surplusIndex);

	latestSurplusSequenceNumber = generalise(latestSurplusSequenceNumber);

	if (
		parseInt(surplusSequence.integer, 10) === 0
			? false
			: true &&
					(parseInt(expectedVolume.integer, 10) >
						parseInt(offtakerVolume.integer, 10) ||
			  parseInt(volumeDifference.integer, 10) <=
					parseInt(surplusThreshold.integer, 10))
	) {
		surplusChargeSum = 0;

		surplusIndex = 0;

		latestSurplusSequenceNumber = 0;
	}

	surplusChargeSum = generalise(surplusChargeSum);

	surplusIndex = generalise(surplusIndex);

	latestSurplusSequenceNumber = generalise(latestSurplusSequenceNumber);

	if (
		parseInt(surplusIndex.integer, 10) >=
		parseInt(numberOfConsecutivePeriodsForSurplus.integer, 10)
	) {
		surplusCharges_billNumber = parseInt(surplusChargeSum.integer, 10);

		surplusChargeSum = 0;

		surplusIndex = 0;

		latestSurplusSequenceNumber = 0;
	}

	surplusCharges_billNumber = generalise(surplusCharges_billNumber);

	surplusChargeSum = generalise(surplusChargeSum);

	surplusIndex = generalise(surplusIndex);

	latestSurplusSequenceNumber = generalise(latestSurplusSequenceNumber);

	for (let i = 0; i < 5; i++) {
		if (parseInt(outstandingGeneratorAmount[i].integer, 10) > 0) {
			generatorInterest_billNumber =
				parseInt(generatorInterest_billNumber.integer, 10) +
				parseInt(outstandingGeneratorAmount[i].integer, 10) *
					parseInt(generatorDelayDays[i].integer, 10) *
					parseInt(dailyInterestRate.integer, 10);
			generatorInterest_billNumber = generalise(generatorInterest_billNumber);
		}

		if (parseInt(outstandingOfftakerAmount[i].integer, 10) > 0) {
			offtakerInterest_billNumber =
				parseInt(offtakerInterest_billNumber.integer, 10) +
				parseInt(outstandingOfftakerAmount[i].integer, 10) *
					parseInt(offtakerDelayDays[i].integer, 10) *
					parseInt(dailyInterestRate.integer, 10);
			offtakerInterest_billNumber = generalise(offtakerInterest_billNumber);
		}
	}

	generatorInterest_billNumber = generalise(generatorInterest_billNumber);

	offtakerInterest_billNumber = generalise(offtakerInterest_billNumber);

	if (
		parseInt(negativePriceOccurredParam.integer, 10) === 0
			? false
			: true &&
			  parseInt(expectedVolume.integer, 10) >=
					parseInt(totalGeneratedVolume.integer, 10)
	) {
		negativePriceCharges_billNumber =
			parseInt(expectedVolume.integer, 10) * parseInt(strikePrice.integer, 10) -
			parseInt(totalGeneratedVolume.integer, 10) *
				parseInt(strikePrice.integer, 10);
	}

	negativePriceCharges_billNumber = generalise(negativePriceCharges_billNumber);


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

	let startDateOfContract_nullifier = startDateOfContract_commitmentExists
		? poseidonHash([
				BigInt(startDateOfContract_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(startDateOfContract_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(startDateOfContract_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(startDateOfContract_prevSalt.hex(32)),
		  ]);

	startDateOfContract_nullifier = generalise(
		startDateOfContract_nullifier.hex(32)
	); // truncate

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

	let shortfalls_index_nullifier = shortfalls_index_commitmentExists
		? poseidonHash([
				BigInt(shortfalls_index_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(shortfalls_index_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(shortfalls_index_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(shortfalls_index_prevSalt.hex(32)),
		  ]);

	shortfalls_index_nullifier = generalise(shortfalls_index_nullifier.hex(32)); // truncate

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

	let surpluses_index_1_nullifier = surpluses_index_1_commitmentExists
		? poseidonHash([
				BigInt(surpluses_index_1_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(surpluses_index_1_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(surpluses_index_1_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(surpluses_index_1_prevSalt.hex(32)),
		  ]);

	surpluses_index_1_nullifier = generalise(surpluses_index_1_nullifier.hex(32)); // truncate


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


	let generatorCharges_billNumber_nullifier = generatorCharges_billNumber_commitmentExists
		? poseidonHash([
				BigInt(generatorCharges_billNumber_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(generatorCharges_billNumber_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(generatorCharges_billNumber_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(generatorCharges_billNumber_prevSalt.hex(32)),
		  ]);

	generatorCharges_billNumber_nullifier = generalise(
		generatorCharges_billNumber_nullifier.hex(32)
	); // truncate

	let offtakerCharges_billNumber_nullifier = offtakerCharges_billNumber_commitmentExists
		? poseidonHash([
				BigInt(offtakerCharges_billNumber_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(offtakerCharges_billNumber_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(offtakerCharges_billNumber_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(offtakerCharges_billNumber_prevSalt.hex(32)),
		  ]);

	offtakerCharges_billNumber_nullifier = generalise(
		offtakerCharges_billNumber_nullifier.hex(32)
	); // truncate

	
	let generatorInterest_billNumber_nullifier = generatorInterest_billNumber_commitmentExists
		? poseidonHash([
				BigInt(generatorInterest_billNumber_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(generatorInterest_billNumber_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(generatorInterest_billNumber_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(generatorInterest_billNumber_prevSalt.hex(32)),
		  ]);

	generatorInterest_billNumber_nullifier = generalise(
		generatorInterest_billNumber_nullifier.hex(32)
	); // truncate


	let offtakerInterest_billNumber_nullifier = offtakerInterest_billNumber_commitmentExists
		? poseidonHash([
				BigInt(offtakerInterest_billNumber_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(offtakerInterest_billNumber_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(offtakerInterest_billNumber_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(offtakerInterest_billNumber_prevSalt.hex(32)),
		  ]);

	offtakerInterest_billNumber_nullifier = generalise(
		offtakerInterest_billNumber_nullifier.hex(32)
	); // truncate


	let negativePriceCharges_billNumber_nullifier = negativePriceCharges_billNumber_commitmentExists
		? poseidonHash([
				BigInt(negativePriceCharges_billNumber_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(negativePriceCharges_billNumber_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(negativePriceCharges_billNumber_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(negativePriceCharges_billNumber_prevSalt.hex(32)),
		  ]);

	negativePriceCharges_billNumber_nullifier = generalise(
		negativePriceCharges_billNumber_nullifier.hex(32)
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


	let shortfallChargeSum_nullifier = shortfallChargeSum_commitmentExists
		? poseidonHash([
				BigInt(shortfallChargeSum_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(shortfallChargeSum_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(shortfallChargeSum_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(shortfallChargeSum_prevSalt.hex(32)),
		  ]);

	shortfallChargeSum_nullifier = generalise(
		shortfallChargeSum_nullifier.hex(32)
	); // truncate

	
	let shortfallIndex_nullifier = shortfallIndex_commitmentExists
		? poseidonHash([
				BigInt(shortfallIndex_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(shortfallIndex_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(shortfallIndex_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(shortfallIndex_prevSalt.hex(32)),
		  ]);

	shortfallIndex_nullifier = generalise(shortfallIndex_nullifier.hex(32)); // truncate

	

	let shortfallCharges_billNumber_nullifier = shortfallCharges_billNumber_commitmentExists
		? poseidonHash([
				BigInt(shortfallCharges_billNumber_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(shortfallCharges_billNumber_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(shortfallCharges_billNumber_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(shortfallCharges_billNumber_prevSalt.hex(32)),
		  ]);

	shortfallCharges_billNumber_nullifier = generalise(
		shortfallCharges_billNumber_nullifier.hex(32)
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

	let surplusChargeSum_nullifier = surplusChargeSum_commitmentExists
		? poseidonHash([
				BigInt(surplusChargeSum_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(surplusChargeSum_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(surplusChargeSum_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(surplusChargeSum_prevSalt.hex(32)),
		  ]);

	surplusChargeSum_nullifier = generalise(surplusChargeSum_nullifier.hex(32)); // truncate

	let surplusIndex_nullifier = surplusIndex_commitmentExists
		? poseidonHash([
				BigInt(surplusIndex_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(surplusIndex_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(surplusIndex_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(surplusIndex_prevSalt.hex(32)),
		  ]);

	surplusIndex_nullifier = generalise(surplusIndex_nullifier.hex(32)); // truncate


	let surplusCharges_billNumber_nullifier = surplusCharges_billNumber_commitmentExists
		? poseidonHash([
				BigInt(surplusCharges_billNumber_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(surplusCharges_billNumber_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(surplusCharges_billNumber_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(surplusCharges_billNumber_prevSalt.hex(32)),
		  ]);

	surplusCharges_billNumber_nullifier = generalise(
		surplusCharges_billNumber_nullifier.hex(32)
	); // truncate

	

	

	// Calculate commitment(s):


	shortfalls_index.billNumber = shortfalls_index.billNumber
		? shortfalls_index.billNumber
		: shortfalls_index_prev.billNumber;
	shortfalls_index.volume = shortfalls_index.volume
		? shortfalls_index.volume
		: shortfalls_index_prev.volume;
	shortfalls_index.price = shortfalls_index.price
		? shortfalls_index.price
		: shortfalls_index_prev.price;

	const shortfalls_index_newSalt = generalise(utils.randomHex(31));

	let shortfalls_index_newCommitment = poseidonHash([
		BigInt(shortfalls_index_stateVarId),
		BigInt(shortfalls_index.billNumber.hex(32)),
		BigInt(shortfalls_index.volume.hex(32)),
		BigInt(shortfalls_index.price.hex(32)),
		BigInt(shortfalls_index_newOwnerPublicKey.hex(32)),
		BigInt(shortfalls_index_newSalt.hex(32)),
	]);

	shortfalls_index_newCommitment = generalise(
		shortfalls_index_newCommitment.hex(32)
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

	surpluses_index_1.billNumber = surpluses_index_1.billNumber
		? surpluses_index_1.billNumber
		: surpluses_index_1_prev.billNumber;
	surpluses_index_1.volume = surpluses_index_1.volume
		? surpluses_index_1.volume
		: surpluses_index_1_prev.volume;
	surpluses_index_1.price = surpluses_index_1.price
		? surpluses_index_1.price
		: surpluses_index_1_prev.price;

	const surpluses_index_1_newSalt = generalise(utils.randomHex(31));

	let surpluses_index_1_newCommitment = poseidonHash([
		BigInt(surpluses_index_1_stateVarId),
		BigInt(surpluses_index_1.billNumber.hex(32)),
		BigInt(surpluses_index_1.volume.hex(32)),
		BigInt(surpluses_index_1.price.hex(32)),
		BigInt(surpluses_index_1_newOwnerPublicKey.hex(32)),
		BigInt(surpluses_index_1_newSalt.hex(32)),
	]);

	surpluses_index_1_newCommitment = generalise(
		surpluses_index_1_newCommitment.hex(32)
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

	const generatorCharges_billNumber_newSalt = generalise(utils.randomHex(31));

	let generatorCharges_billNumber_newCommitment = poseidonHash([
		BigInt(generatorCharges_billNumber_stateVarId),
		BigInt(generatorCharges_billNumber.hex(32)),
		BigInt(generatorCharges_billNumber_newOwnerPublicKey.hex(32)),
		BigInt(generatorCharges_billNumber_newSalt.hex(32)),
	]);

	generatorCharges_billNumber_newCommitment = generalise(
		generatorCharges_billNumber_newCommitment.hex(32)
	); // truncate

	const offtakerCharges_billNumber_newSalt = generalise(utils.randomHex(31));

	let offtakerCharges_billNumber_newCommitment = poseidonHash([
		BigInt(offtakerCharges_billNumber_stateVarId),
		BigInt(offtakerCharges_billNumber.hex(32)),
		BigInt(offtakerCharges_billNumber_newOwnerPublicKey.hex(32)),
		BigInt(offtakerCharges_billNumber_newSalt.hex(32)),
	]);

	offtakerCharges_billNumber_newCommitment = generalise(
		offtakerCharges_billNumber_newCommitment.hex(32)
	); // truncate

	const generatorInterest_billNumber_newSalt = generalise(utils.randomHex(31));

	let generatorInterest_billNumber_newCommitment = poseidonHash([
		BigInt(generatorInterest_billNumber_stateVarId),
		BigInt(generatorInterest_billNumber.hex(32)),
		BigInt(generatorInterest_billNumber_newOwnerPublicKey.hex(32)),
		BigInt(generatorInterest_billNumber_newSalt.hex(32)),
	]);

	generatorInterest_billNumber_newCommitment = generalise(
		generatorInterest_billNumber_newCommitment.hex(32)
	); // truncate

	const offtakerInterest_billNumber_newSalt = generalise(utils.randomHex(31));

	let offtakerInterest_billNumber_newCommitment = poseidonHash([
		BigInt(offtakerInterest_billNumber_stateVarId),
		BigInt(offtakerInterest_billNumber.hex(32)),
		BigInt(offtakerInterest_billNumber_newOwnerPublicKey.hex(32)),
		BigInt(offtakerInterest_billNumber_newSalt.hex(32)),
	]);

	offtakerInterest_billNumber_newCommitment = generalise(
		offtakerInterest_billNumber_newCommitment.hex(32)
	); // truncate

	const negativePriceCharges_billNumber_newSalt = generalise(
		utils.randomHex(31)
	);

	let negativePriceCharges_billNumber_newCommitment = poseidonHash([
		BigInt(negativePriceCharges_billNumber_stateVarId),
		BigInt(negativePriceCharges_billNumber.hex(32)),
		BigInt(negativePriceCharges_billNumber_newOwnerPublicKey.hex(32)),
		BigInt(negativePriceCharges_billNumber_newSalt.hex(32)),
	]);

	negativePriceCharges_billNumber_newCommitment = generalise(
		negativePriceCharges_billNumber_newCommitment.hex(32)
	); // truncate

	const shortfallChargeSum_newSalt = generalise(utils.randomHex(31));

	let shortfallChargeSum_newCommitment = poseidonHash([
		BigInt(shortfallChargeSum_stateVarId),
		BigInt(shortfallChargeSum.hex(32)),
		BigInt(shortfallChargeSum_newOwnerPublicKey.hex(32)),
		BigInt(shortfallChargeSum_newSalt.hex(32)),
	]);

	shortfallChargeSum_newCommitment = generalise(
		shortfallChargeSum_newCommitment.hex(32)
	); // truncate

	const shortfallIndex_newSalt = generalise(utils.randomHex(31));

	let shortfallIndex_newCommitment = poseidonHash([
		BigInt(shortfallIndex_stateVarId),
		BigInt(shortfallIndex.hex(32)),
		BigInt(shortfallIndex_newOwnerPublicKey.hex(32)),
		BigInt(shortfallIndex_newSalt.hex(32)),
	]);

	shortfallIndex_newCommitment = generalise(
		shortfallIndex_newCommitment.hex(32)
	); // truncate

	const shortfallCharges_billNumber_newSalt = generalise(utils.randomHex(31));

	let shortfallCharges_billNumber_newCommitment = poseidonHash([
		BigInt(shortfallCharges_billNumber_stateVarId),
		BigInt(shortfallCharges_billNumber.hex(32)),
		BigInt(shortfallCharges_billNumber_newOwnerPublicKey.hex(32)),
		BigInt(shortfallCharges_billNumber_newSalt.hex(32)),
	]);

	shortfallCharges_billNumber_newCommitment = generalise(
		shortfallCharges_billNumber_newCommitment.hex(32)
	); // truncate

	const surplusChargeSum_newSalt = generalise(utils.randomHex(31));

	let surplusChargeSum_newCommitment = poseidonHash([
		BigInt(surplusChargeSum_stateVarId),
		BigInt(surplusChargeSum.hex(32)),
		BigInt(surplusChargeSum_newOwnerPublicKey.hex(32)),
		BigInt(surplusChargeSum_newSalt.hex(32)),
	]);

	surplusChargeSum_newCommitment = generalise(
		surplusChargeSum_newCommitment.hex(32)
	); // truncate

	const surplusIndex_newSalt = generalise(utils.randomHex(31));

	let surplusIndex_newCommitment = poseidonHash([
		BigInt(surplusIndex_stateVarId),
		BigInt(surplusIndex.hex(32)),
		BigInt(surplusIndex_newOwnerPublicKey.hex(32)),
		BigInt(surplusIndex_newSalt.hex(32)),
	]);

	surplusIndex_newCommitment = generalise(surplusIndex_newCommitment.hex(32)); // truncate

	const surplusCharges_billNumber_newSalt = generalise(utils.randomHex(31));

	let surplusCharges_billNumber_newCommitment = poseidonHash([
		BigInt(surplusCharges_billNumber_stateVarId),
		BigInt(surplusCharges_billNumber.hex(32)),
		BigInt(surplusCharges_billNumber_newOwnerPublicKey.hex(32)),
		BigInt(surplusCharges_billNumber_newSalt.hex(32)),
	]);

	surplusCharges_billNumber_newCommitment = generalise(
		surplusCharges_billNumber_newCommitment.hex(32)
	); // truncate

	// Call Zokrates to generate the proof:

	const allInputs = [
		billNumber.integer,
		sequenceNumber.integer,
		totalGeneratedVolume.integer,
		expectedVolume.integer,
		averagePrice.integer,
		marginalLossFactor.integer,
		floatingAmount.integer,
		positiveAdjustment.integer,
		negativeAdjustment.integer,
		outstandingGeneratorAmount.all.integer,
		outstandingOfftakerAmount.all.integer,
		generatorDelayDays.all.integer,
		offtakerDelayDays.all.integer,
		negativePriceOccurredParam.integer,
		referenceDate.integer,
		secretKey.integer,
		strikePrice_nullifier.integer,
		strikePrice_prev.integer,
		strikePrice_prevSalt.integer,
		strikePrice_root.integer,
		strikePrice_index.integer,
		strikePrice_path.integer,
		secretKey.integer,
		bundlePrice_nullifier.integer,
		bundlePrice_prev.integer,
		bundlePrice_prevSalt.integer,
		bundlePrice_index.integer,
		bundlePrice_path.integer,

		secretKey.integer,
		volumeShare_nullifier.integer,
		volumeShare_prev.integer,
		volumeShare_prevSalt.integer,

		volumeShare_index.integer,
		volumeShare_path.integer,

		secretKey.integer,
		dailyInterestRate_nullifier.integer,
		dailyInterestRate_prev.integer,
		dailyInterestRate_prevSalt.integer,

		dailyInterestRate_index.integer,
		dailyInterestRate_path.integer,

		secretKey.integer,

		startDateOfContract_nullifier.integer,
		startDateOfContract_prev.integer,
		startDateOfContract_prevSalt.integer,

		startDateOfContract_index.integer,
		startDateOfContract_path.integer,

		secretKey.integer,
		expiryDateOfContract_nullifier.integer,
		expiryDateOfContract_prev.integer,
		expiryDateOfContract_prevSalt.integer,

		expiryDateOfContract_index.integer,
		expiryDateOfContract_path.integer,

		shortfalls_index_commitmentExists
			? secretKey.integer
			: generalise(0).integer,
		shortfalls_index_nullifier.integer,
		shortfalls_index_prev.billNumber.integer,
		shortfalls_index_prev.volume.integer,
		shortfalls_index_prev.price.integer,
		shortfalls_index_prevSalt.integer,
		shortfalls_index_commitmentExists ? 0 : 1,

		shortfalls_index_index.integer,
		shortfalls_index_path.integer,
		shortfalls_index_newOwnerPublicKey.integer,
		shortfalls_index_newSalt.integer,
		shortfalls_index_newCommitment.integer,
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
		surpluses_index_1_commitmentExists
			? secretKey.integer
			: generalise(0).integer,

		surpluses_index_1_nullifier.integer,
		surpluses_index_1_prev.billNumber.integer,
		surpluses_index_1_prev.volume.integer,
		surpluses_index_1_prev.price.integer,
		surpluses_index_1_prevSalt.integer,
		surpluses_index_1_commitmentExists ? 0 : 1,

		surpluses_index_1_index.integer,
		surpluses_index_1_path.integer,
		surpluses_index_1_newOwnerPublicKey.integer,
		surpluses_index_1_newSalt.integer,
		surpluses_index_1_newCommitment.integer,
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
		secretKey.integer,

		sequenceNumberInterval_nullifier.integer,
		sequenceNumberInterval_prev.integer,
		sequenceNumberInterval_prevSalt.integer,

		sequenceNumberInterval_index.integer,
		sequenceNumberInterval_path.integer,

		generatorCharges_billNumber_commitmentExists
			? secretKey.integer
			: generalise(0).integer,

		generatorCharges_billNumber_nullifier.integer,
		generatorCharges_billNumber_prev.integer,
		generatorCharges_billNumber_prevSalt.integer,
		generatorCharges_billNumber_commitmentExists ? 0 : 1,

		generatorCharges_billNumber_index.integer,
		generatorCharges_billNumber_path.integer,
		generatorCharges_billNumber_newOwnerPublicKey.integer,
		generatorCharges_billNumber_newSalt.integer,
		generatorCharges_billNumber_newCommitment.integer,
		offtakerCharges_billNumber_commitmentExists
			? secretKey.integer
			: generalise(0).integer,

		offtakerCharges_billNumber_nullifier.integer,
		offtakerCharges_billNumber_prev.integer,
		offtakerCharges_billNumber_prevSalt.integer,
		offtakerCharges_billNumber_commitmentExists ? 0 : 1,

		offtakerCharges_billNumber_index.integer,
		offtakerCharges_billNumber_path.integer,
		offtakerCharges_billNumber_newOwnerPublicKey.integer,
		offtakerCharges_billNumber_newSalt.integer,
		offtakerCharges_billNumber_newCommitment.integer,
		generatorInterest_billNumber_commitmentExists
			? secretKey.integer
			: generalise(0).integer,

		generatorInterest_billNumber_nullifier.integer,
		generatorInterest_billNumber_prev.integer,
		generatorInterest_billNumber_prevSalt.integer,
		generatorInterest_billNumber_commitmentExists ? 0 : 1,

		generatorInterest_billNumber_index.integer,
		generatorInterest_billNumber_path.integer,
		generatorInterest_billNumber_newOwnerPublicKey.integer,
		generatorInterest_billNumber_newSalt.integer,
		generatorInterest_billNumber_newCommitment.integer,
		offtakerInterest_billNumber_commitmentExists
			? secretKey.integer
			: generalise(0).integer,

		offtakerInterest_billNumber_nullifier.integer,
		offtakerInterest_billNumber_prev.integer,
		offtakerInterest_billNumber_prevSalt.integer,
		offtakerInterest_billNumber_commitmentExists ? 0 : 1,

		offtakerInterest_billNumber_index.integer,
		offtakerInterest_billNumber_path.integer,
		offtakerInterest_billNumber_newOwnerPublicKey.integer,
		offtakerInterest_billNumber_newSalt.integer,
		offtakerInterest_billNumber_newCommitment.integer,
		negativePriceCharges_billNumber_commitmentExists
			? secretKey.integer
			: generalise(0).integer,

		negativePriceCharges_billNumber_nullifier.integer,
		negativePriceCharges_billNumber_prev.integer,
		negativePriceCharges_billNumber_prevSalt.integer,
		negativePriceCharges_billNumber_commitmentExists ? 0 : 1,

		negativePriceCharges_billNumber_index.integer,
		negativePriceCharges_billNumber_path.integer,
		negativePriceCharges_billNumber_newOwnerPublicKey.integer,
		negativePriceCharges_billNumber_newSalt.integer,
		negativePriceCharges_billNumber_newCommitment.integer,
		secretKey.integer,

		numberOfConsecutivePeriodsForShortfall_nullifier.integer,
		numberOfConsecutivePeriodsForShortfall_prev.integer,
		numberOfConsecutivePeriodsForShortfall_prevSalt.integer,

		numberOfConsecutivePeriodsForShortfall_index.integer,
		numberOfConsecutivePeriodsForShortfall_path.integer,

		secretKey.integer,
		shortfallThreshold_nullifier.integer,
		shortfallThreshold_prev.integer,
		shortfallThreshold_prevSalt.integer,

		shortfallThreshold_index.integer,
		shortfallThreshold_path.integer,
		shortfallChargeSum_commitmentExists
			? secretKey.integer
			: generalise(0).integer,

		shortfallChargeSum_nullifier.integer,
		shortfallChargeSum_prev.integer,
		shortfallChargeSum_prevSalt.integer,
		shortfallChargeSum_commitmentExists ? 0 : 1,

		shortfallChargeSum_index.integer,
		shortfallChargeSum_path.integer,
		shortfallChargeSum_newOwnerPublicKey.integer,
		shortfallChargeSum_newSalt.integer,
		shortfallChargeSum_newCommitment.integer,
		shortfallIndex_commitmentExists ? secretKey.integer : generalise(0).integer,

		shortfallIndex_nullifier.integer,
		shortfallIndex_prev.integer,
		shortfallIndex_prevSalt.integer,
		shortfallIndex_commitmentExists ? 0 : 1,

		shortfallIndex_index.integer,
		shortfallIndex_path.integer,
		shortfallIndex_newOwnerPublicKey.integer,
		shortfallIndex_newSalt.integer,
		shortfallIndex_newCommitment.integer,
		shortfallCharges_billNumber_commitmentExists
			? secretKey.integer
			: generalise(0).integer,

		shortfallCharges_billNumber_nullifier.integer,
		shortfallCharges_billNumber_prev.integer,
		shortfallCharges_billNumber_prevSalt.integer,
		shortfallCharges_billNumber_commitmentExists ? 0 : 1,

		shortfallCharges_billNumber_index.integer,
		shortfallCharges_billNumber_path.integer,
		shortfallCharges_billNumber_newOwnerPublicKey.integer,
		shortfallCharges_billNumber_newSalt.integer,
		shortfallCharges_billNumber_newCommitment.integer,
		secretKey.integer,

		numberOfConsecutivePeriodsForSurplus_nullifier.integer,
		numberOfConsecutivePeriodsForSurplus_prev.integer,
		numberOfConsecutivePeriodsForSurplus_prevSalt.integer,

		numberOfConsecutivePeriodsForSurplus_index.integer,
		numberOfConsecutivePeriodsForSurplus_path.integer,

		secretKey.integer,

		surplusThreshold_nullifier.integer,
		surplusThreshold_prev.integer,
		surplusThreshold_prevSalt.integer,

		surplusThreshold_index.integer,
		surplusThreshold_path.integer,
		surplusChargeSum_commitmentExists
			? secretKey.integer
			: generalise(0).integer,

		surplusChargeSum_nullifier.integer,
		surplusChargeSum_prev.integer,
		surplusChargeSum_prevSalt.integer,
		surplusChargeSum_commitmentExists ? 0 : 1,

		surplusChargeSum_index.integer,
		surplusChargeSum_path.integer,
		surplusChargeSum_newOwnerPublicKey.integer,
		surplusChargeSum_newSalt.integer,
		surplusChargeSum_newCommitment.integer,
		surplusIndex_commitmentExists ? secretKey.integer : generalise(0).integer,

		surplusIndex_nullifier.integer,
		surplusIndex_prev.integer,
		surplusIndex_prevSalt.integer,
		surplusIndex_commitmentExists ? 0 : 1,

		surplusIndex_index.integer,
		surplusIndex_path.integer,
		surplusIndex_newOwnerPublicKey.integer,
		surplusIndex_newSalt.integer,
		surplusIndex_newCommitment.integer,
		surplusCharges_billNumber_commitmentExists
			? secretKey.integer
			: generalise(0).integer,

		surplusCharges_billNumber_nullifier.integer,
		surplusCharges_billNumber_prev.integer,
		surplusCharges_billNumber_prevSalt.integer,
		surplusCharges_billNumber_commitmentExists ? 0 : 1,

		surplusCharges_billNumber_index.integer,
		surplusCharges_billNumber_path.integer,
		surplusCharges_billNumber_newOwnerPublicKey.integer,
		surplusCharges_billNumber_newSalt.integer,
		surplusCharges_billNumber_newCommitment.integer,
	].flat(Infinity);

	console.log(allInputs.join(' '));
	
	const res = await generateProof("calculateCfd", allInputs);
	const proof = generalise(Object.values(res.proof).flat(Infinity))
		.map((coeff) => coeff.integer)
		.flat(Infinity);

	// Send transaction to the blockchain:

	const txData = await instance.methods
		.calculateCfd(
			[
				shortfalls_index_nullifier.integer,
				latestShortfallSequenceNumber_nullifier.integer,
				surpluses_index_1_nullifier.integer,
				latestSurplusSequenceNumber_nullifier.integer,
				generatorCharges_billNumber_nullifier.integer,
				offtakerCharges_billNumber_nullifier.integer,
				generatorInterest_billNumber_nullifier.integer,
				offtakerInterest_billNumber_nullifier.integer,
				negativePriceCharges_billNumber_nullifier.integer,
				shortfallChargeSum_nullifier.integer,
				shortfallIndex_nullifier.integer,
				shortfallCharges_billNumber_nullifier.integer,
				surplusChargeSum_nullifier.integer,
				surplusIndex_nullifier.integer,
				surplusCharges_billNumber_nullifier.integer,
			],
			strikePrice_root.integer,
			[
				shortfalls_index_newCommitment.integer,
				latestShortfallSequenceNumber_newCommitment.integer,
				surpluses_index_1_newCommitment.integer,
				latestSurplusSequenceNumber_newCommitment.integer,
				generatorCharges_billNumber_newCommitment.integer,
				offtakerCharges_billNumber_newCommitment.integer,
				generatorInterest_billNumber_newCommitment.integer,
				offtakerInterest_billNumber_newCommitment.integer,
				negativePriceCharges_billNumber_newCommitment.integer,
				shortfallChargeSum_newCommitment.integer,
				shortfallIndex_newCommitment.integer,
				shortfallCharges_billNumber_newCommitment.integer,
				surplusChargeSum_newCommitment.integer,
				surplusIndex_newCommitment.integer,
				surplusCharges_billNumber_newCommitment.integer,
			],
			[   strikePrice_nullifier.integer,
				bundlePrice_nullifier.integer,
				volumeShare_nullifier.integer,
				dailyInterestRate_nullifier.integer,
				startDateOfContract_nullifier.integer,
				expiryDateOfContract_nullifier.integer,
				sequenceNumberInterval_nullifier.integer,
				numberOfConsecutivePeriodsForShortfall_nullifier.integer,
				shortfallThreshold_nullifier.integer,
				numberOfConsecutivePeriodsForSurplus_nullifier.integer,
				surplusThreshold_nullifier.integer,
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

	if (shortfalls_index_commitmentExists)
		await markNullified(shortfalls_index_currentCommitment, secretKey.hex(32));

	await storeCommitment({
		hash: shortfalls_index_newCommitment,
		name: "shortfalls",
		mappingKey: shortfalls_index_stateVarId_key.integer,
		preimage: {
			stateVarId: generalise(shortfalls_index_stateVarId),
			value: {
				billNumber: shortfalls_index.billNumber,
				volume: shortfalls_index.volume,
				price: shortfalls_index.price,
			},
			salt: shortfalls_index_newSalt,
			publicKey: shortfalls_index_newOwnerPublicKey,
		},
		secretKey:
			shortfalls_index_newOwnerPublicKey.integer === publicKey.integer
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

	if (surpluses_index_1_commitmentExists)
		await markNullified(
			surpluses_index_1_currentCommitment,
			secretKey.hex(32)
		);
	

	await storeCommitment({
		hash: surpluses_index_1_newCommitment,
		name: "surplus",
		mappingKey: surpluses_index_1_stateVarId_key.integer,
		preimage: {
			stateVarId: generalise(surpluses_index_1_stateVarId),
			value: {
				billNumber: surpluses_index_1.billNumber,
				volume: surpluses_index_1.volume,
				price: surpluses_index_1.price,
			},
			salt: surpluses_index_1_newSalt,
			publicKey: surpluses_index_1_newOwnerPublicKey,
		},
		secretKey:
			surpluses_index_1_newOwnerPublicKey.integer === publicKey.integer
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

	if (generatorCharges_billNumber_commitmentExists)
		await markNullified(
			generatorCharges_billNumber_currentCommitment,
			secretKey.hex(32)
		);
	

	await storeCommitment({
		hash: generatorCharges_billNumber_newCommitment,
		name: "generatorCharges",
		mappingKey: generatorCharges_billNumber_stateVarId_key.integer,
		preimage: {
			stateVarId: generalise(generatorCharges_billNumber_stateVarId),
			value: generatorCharges_billNumber,
			salt: generatorCharges_billNumber_newSalt,
			publicKey: generatorCharges_billNumber_newOwnerPublicKey,
		},
		secretKey:
			generatorCharges_billNumber_newOwnerPublicKey.integer ===
			publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	if (offtakerCharges_billNumber_commitmentExists)
		await markNullified(
			offtakerCharges_billNumber_currentCommitment,
			secretKey.hex(32)
		);
	

	await storeCommitment({
		hash: offtakerCharges_billNumber_newCommitment,
		name: "offtakerCharges",
		mappingKey: offtakerCharges_billNumber_stateVarId_key.integer,
		preimage: {
			stateVarId: generalise(offtakerCharges_billNumber_stateVarId),
			value: offtakerCharges_billNumber,
			salt: offtakerCharges_billNumber_newSalt,
			publicKey: offtakerCharges_billNumber_newOwnerPublicKey,
		},
		secretKey:
			offtakerCharges_billNumber_newOwnerPublicKey.integer === publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	if (generatorInterest_billNumber_commitmentExists)
		await markNullified(
			generatorInterest_billNumber_currentCommitment,
			secretKey.hex(32)
		);
	
	await storeCommitment({
		hash: generatorInterest_billNumber_newCommitment,
		name: "generatorInterest",
		mappingKey: generatorInterest_billNumber_stateVarId_key.integer,
		preimage: {
			stateVarId: generalise(generatorInterest_billNumber_stateVarId),
			value: generatorInterest_billNumber,
			salt: generatorInterest_billNumber_newSalt,
			publicKey: generatorInterest_billNumber_newOwnerPublicKey,
		},
		secretKey:
			generatorInterest_billNumber_newOwnerPublicKey.integer ===
			publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	if (offtakerInterest_billNumber_commitmentExists)
		await markNullified(
			offtakerInterest_billNumber_currentCommitment,
			secretKey.hex(32)
		);
	

	await storeCommitment({
		hash: offtakerInterest_billNumber_newCommitment,
		name: "offtakerInterest",
		mappingKey: offtakerInterest_billNumber_stateVarId_key.integer,
		preimage: {
			stateVarId: generalise(offtakerInterest_billNumber_stateVarId),
			value: offtakerInterest_billNumber,
			salt: offtakerInterest_billNumber_newSalt,
			publicKey: offtakerInterest_billNumber_newOwnerPublicKey,
		},
		secretKey:
			offtakerInterest_billNumber_newOwnerPublicKey.integer ===
			publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	if (negativePriceCharges_billNumber_commitmentExists)
		await markNullified(
			negativePriceCharges_billNumber_currentCommitment,
			secretKey.hex(32)
		);
	

	await storeCommitment({
		hash: negativePriceCharges_billNumber_newCommitment,
		name: "negativePriceCharges",
		mappingKey: negativePriceCharges_billNumber_stateVarId_key.integer,
		preimage: {
			stateVarId: generalise(negativePriceCharges_billNumber_stateVarId),
			value: negativePriceCharges_billNumber,
			salt: negativePriceCharges_billNumber_newSalt,
			publicKey: negativePriceCharges_billNumber_newOwnerPublicKey,
		},
		secretKey:
			negativePriceCharges_billNumber_newOwnerPublicKey.integer ===
			publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	if (shortfallChargeSum_commitmentExists)
		await markNullified(
			shortfallChargeSum_currentCommitment,
			secretKey.hex(32)
		);
	

	await storeCommitment({
		hash: shortfallChargeSum_newCommitment,
		name: "shortfallChargeSum",
		mappingKey: null,
		preimage: {
			stateVarId: generalise(shortfallChargeSum_stateVarId),
			value: shortfallChargeSum,
			salt: shortfallChargeSum_newSalt,
			publicKey: shortfallChargeSum_newOwnerPublicKey,
		},
		secretKey:
			shortfallChargeSum_newOwnerPublicKey.integer === publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	if (shortfallIndex_commitmentExists)
		await markNullified(shortfallIndex_currentCommitment, secretKey.hex(32));
	

	await storeCommitment({
		hash: shortfallIndex_newCommitment,
		name: "shortfallIndex",
		mappingKey: null,
		preimage: {
			stateVarId: generalise(shortfallIndex_stateVarId),
			value: shortfallIndex,
			salt: shortfallIndex_newSalt,
			publicKey: shortfallIndex_newOwnerPublicKey,
		},
		secretKey:
			shortfallIndex_newOwnerPublicKey.integer === publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	if (shortfallCharges_billNumber_commitmentExists)
		await markNullified(
			shortfallCharges_billNumber_currentCommitment,
			secretKey.hex(32)
		);
	

	await storeCommitment({
		hash: shortfallCharges_billNumber_newCommitment,
		name: "shortfallCharges",
		mappingKey: shortfallCharges_billNumber_stateVarId_key.integer,
		preimage: {
			stateVarId: generalise(shortfallCharges_billNumber_stateVarId),
			value: shortfallCharges_billNumber,
			salt: shortfallCharges_billNumber_newSalt,
			publicKey: shortfallCharges_billNumber_newOwnerPublicKey,
		},
		secretKey:
			shortfallCharges_billNumber_newOwnerPublicKey.integer ===
			publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});


	if (surplusChargeSum_commitmentExists)
		await markNullified(surplusChargeSum_currentCommitment, secretKey.hex(32));
	

	await storeCommitment({
		hash: surplusChargeSum_newCommitment,
		name: "surplusChargeSum",
		mappingKey: null,
		preimage: {
			stateVarId: generalise(surplusChargeSum_stateVarId),
			value: surplusChargeSum,
			salt: surplusChargeSum_newSalt,
			publicKey: surplusChargeSum_newOwnerPublicKey,
		},
		secretKey:
			surplusChargeSum_newOwnerPublicKey.integer === publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	if (surplusIndex_commitmentExists)
		await markNullified(surplusIndex_currentCommitment, secretKey.hex(32));
	

	await storeCommitment({
		hash: surplusIndex_newCommitment,
		name: "surplusIndex",
		mappingKey: null,
		preimage: {
			stateVarId: generalise(surplusIndex_stateVarId),
			value: surplusIndex,
			salt: surplusIndex_newSalt,
			publicKey: surplusIndex_newOwnerPublicKey,
		},
		secretKey:
			surplusIndex_newOwnerPublicKey.integer === publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	if (surplusCharges_billNumber_commitmentExists)
		await markNullified(
			surplusCharges_billNumber_currentCommitment,
			secretKey.hex(32)
		);
	

	await storeCommitment({
		hash: surplusCharges_billNumber_newCommitment,
		name: "surplusCharges",
		mappingKey: surplusCharges_billNumber_stateVarId_key.integer,
		preimage: {
			stateVarId: generalise(surplusCharges_billNumber_stateVarId),
			value: surplusCharges_billNumber,
			salt: surplusCharges_billNumber_newSalt,
			publicKey: surplusCharges_billNumber_newOwnerPublicKey,
		},
		secretKey:
			surplusCharges_billNumber_newOwnerPublicKey.integer === publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});


	return {
		tx,
		encEvent,
		generatorCharges_billNumber_newCommitmentValue:
			generatorCharges_billNumber.integer,
		offtakerCharges_billNumber_newCommitmentValue:
			offtakerCharges_billNumber.integer,
		generatorInterest_billNumber_newCommitmentValue:
			generatorInterest_billNumber.integer,
		offtakerInterest_billNumber_newCommitmentValue:
			offtakerInterest_billNumber.integer,
		shortfallCharges_billNumber_newCommitmentValue:
			shortfallCharges_billNumber.integer,
		surplusCharges_billNumber_newCommitmentValue:
			surplusCharges_billNumber.integer,
		negativePriceCharges_billNumber_newCommitmentValue:
			negativePriceCharges_billNumber.integer,
	};
}
