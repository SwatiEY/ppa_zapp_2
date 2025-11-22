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
	splitCommitments,
	markNullified,
} from "./common/commitment-storage.mjs";
import { generateProof } from "./common/zokrates.mjs";
import { getMembershipWitness, getRoot } from "./common/timber.mjs";
import {
	decompressStarlightKey,
	compressStarlightKey,
	encrypt,
	decrypt,
	poseidonHash,
	scalarMult,
} from "./common/number-theory.mjs";

const { generalise } = GN;
const db = "/app/orchestration/common/db/preimage.json";
const keyDb = "/app/orchestration/common/db/key.json";

export class CalculateCfdManager {
	constructor(web3) {
		this.web3 = web3;
	}

	async init() {
		this.instance = await getContractInstance("SyntheticPpaShield");
		this.contractAddr = await getContractAddress("SyntheticPpaShield");
	}

	async calculateCfd(
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
		_shortfalls_index_newOwnerPublicKey = 0,
		_latestShortfallSequenceNumber_newOwnerPublicKey = 0,
		_surpluses_index_1_newOwnerPublicKey = 0,
		_latestSurplusSequenceNumber_newOwnerPublicKey = 0,
		_generatorCfdNetPosition_billNumber_newOwnerPublicKey = 0,
		_offtakerCfdNetPosition_billNumber_newOwnerPublicKey = 0,
		_generatorInterest_billNumber_newOwnerPublicKey = 0,
		_offtakerInterest_billNumber_newOwnerPublicKey = 0,
		_offtakerNegativePriceCharges_billNumber_newOwnerPublicKey = 0,
		_generatorNegativePriceCharges_billNumber_newOwnerPublicKey = 0,
		_shortfallPositiveChargeSum_newOwnerPublicKey = 0,
		_shortfallNegativeChargeSum_newOwnerPublicKey = 0,
		_shortfallIndex_newOwnerPublicKey = 0,
		_shortfallPositiveCharges_billNumber_newOwnerPublicKey = 0,
		_shortfallNegativeCharges_billNumber_newOwnerPublicKey = 0,
		_surplusPositiveChargeSum_newOwnerPublicKey = 0,
		_surplusNegativeChargeSum_newOwnerPublicKey = 0,
		_surplusIndex_newOwnerPublicKey = 0,
		_surplusPositiveCharges_billNumber_newOwnerPublicKey = 0,
		_surplusNegativeCharges_billNumber_newOwnerPublicKey = 0
	) {
		const instance = this.instance;
		const contractAddr = this.contractAddr;
		const web3 = this.web3;

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
		let generatorCfdNetPosition_billNumber_newOwnerPublicKey = generalise(
			_generatorCfdNetPosition_billNumber_newOwnerPublicKey
		);
		let offtakerCfdNetPosition_billNumber_newOwnerPublicKey = generalise(
			_offtakerCfdNetPosition_billNumber_newOwnerPublicKey
		);
		let generatorInterest_billNumber_newOwnerPublicKey = generalise(
			_generatorInterest_billNumber_newOwnerPublicKey
		);
		let offtakerInterest_billNumber_newOwnerPublicKey = generalise(
			_offtakerInterest_billNumber_newOwnerPublicKey
		);
		let offtakerNegativePriceCharges_billNumber_newOwnerPublicKey = generalise(
			_offtakerNegativePriceCharges_billNumber_newOwnerPublicKey
		);
		let generatorNegativePriceCharges_billNumber_newOwnerPublicKey = generalise(
			_generatorNegativePriceCharges_billNumber_newOwnerPublicKey
		);
		let shortfallPositiveChargeSum_newOwnerPublicKey = generalise(
			_shortfallPositiveChargeSum_newOwnerPublicKey
		);
		let shortfallNegativeChargeSum_newOwnerPublicKey = generalise(
			_shortfallNegativeChargeSum_newOwnerPublicKey
		);
		let shortfallIndex_newOwnerPublicKey = generalise(
			_shortfallIndex_newOwnerPublicKey
		);
		let shortfallPositiveCharges_billNumber_newOwnerPublicKey = generalise(
			_shortfallPositiveCharges_billNumber_newOwnerPublicKey
		);
		let shortfallNegativeCharges_billNumber_newOwnerPublicKey = generalise(
			_shortfallNegativeCharges_billNumber_newOwnerPublicKey
		);
		let surplusPositiveChargeSum_newOwnerPublicKey = generalise(
			_surplusPositiveChargeSum_newOwnerPublicKey
		);
		let surplusNegativeChargeSum_newOwnerPublicKey = generalise(
			_surplusNegativeChargeSum_newOwnerPublicKey
		);
		let surplusIndex_newOwnerPublicKey = generalise(
			_surplusIndex_newOwnerPublicKey
		);
		let surplusPositiveCharges_billNumber_newOwnerPublicKey = generalise(
			_surplusPositiveCharges_billNumber_newOwnerPublicKey
		);
		let surplusNegativeCharges_billNumber_newOwnerPublicKey = generalise(
			_surplusNegativeCharges_billNumber_newOwnerPublicKey
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

		// Initialise commitment preimage of whole accessed state:

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

		const startDateOfContract_preimage =
			startDateOfContract_commitment.preimage;

		const startDateOfContract = generalise(startDateOfContract_preimage.value);

		// Initialise commitment preimage of whole accessed state:

		const expiryDateOfContract_stateVarId = generalise(15).hex(32);

		let expiryDateOfContract_commitmentExists = true;

		const expiryDateOfContract_commitment = await getCurrentWholeCommitment(
			expiryDateOfContract_stateVarId
		);

		const expiryDateOfContract_preimage =
			expiryDateOfContract_commitment.preimage;

		const expiryDateOfContract = generalise(
			expiryDateOfContract_preimage.value
		);

		// Initialise commitment preimage of whole state:

		const shortfallIndex_stateVarId = generalise(74).hex(32);

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

	let index = generalise(parseInt(shortfallIndex.integer, 10) + 0);


		// Initialise commitment preimage of whole state:

		let shortfalls_index_stateVarIdInit = 22;

		const shortfalls_index_stateVarId_key = index;

		let shortfalls_index_stateVarId = generalise(
			utils.mimcHash(
				[
					generalise(shortfalls_index_stateVarIdInit).bigInt,
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

		const latestShortfallSequenceNumber_stateVarId = generalise(24).hex(32);

		let latestShortfallSequenceNumber_commitmentExists = true;
		let latestShortfallSequenceNumber_witnessRequired = true;

		const latestShortfallSequenceNumber_commitment =
			await getCurrentWholeCommitment(latestShortfallSequenceNumber_stateVarId);

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

	const surplusIndex_stateVarId = generalise(92).hex(32);

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

let index_1 = generalise(parseInt(surplusIndex.integer, 10) + 0);

		// Initialise commitment preimage of whole state:

		let surpluses_index_1_stateVarIdInit = 29;

		const surpluses_index_1_stateVarId_key = index_1;

		let surpluses_index_1_stateVarId = generalise(
			utils.mimcHash(
				[
					generalise(surpluses_index_1_stateVarIdInit).bigInt,
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

		const latestSurplusSequenceNumber_stateVarId = generalise(31).hex(32);

		let latestSurplusSequenceNumber_commitmentExists = true;
		let latestSurplusSequenceNumber_witnessRequired = true;

		const latestSurplusSequenceNumber_commitment =
			await getCurrentWholeCommitment(latestSurplusSequenceNumber_stateVarId);

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

		const sequenceNumberInterval_stateVarId = generalise(33).hex(32);

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

		let generatorCfdNetPosition_billNumber_stateVarIdInit = 44;

		const generatorCfdNetPosition_billNumber_stateVarId_key = billNumber;

		let generatorCfdNetPosition_billNumber_stateVarId = generalise(
			utils.mimcHash(
				[
					generalise(generatorCfdNetPosition_billNumber_stateVarIdInit).bigInt,
					generatorCfdNetPosition_billNumber_stateVarId_key.bigInt,
				],
				"ALT_BN_254"
			)
		).hex(32);

		let generatorCfdNetPosition_billNumber_commitmentExists = true;
		let generatorCfdNetPosition_billNumber_witnessRequired = true;

		const generatorCfdNetPosition_billNumber_commitment =
			await getCurrentWholeCommitment(
				generatorCfdNetPosition_billNumber_stateVarId
			);

		let generatorCfdNetPosition_billNumber_preimage = {
			value: 0,
			salt: 0,
			commitment: 0,
		};
		if (!generatorCfdNetPosition_billNumber_commitment) {
			generatorCfdNetPosition_billNumber_commitmentExists = false;
			generatorCfdNetPosition_billNumber_witnessRequired = false;
		} else {
			generatorCfdNetPosition_billNumber_preimage =
				generatorCfdNetPosition_billNumber_commitment.preimage;
		}

		// Initialise commitment preimage of whole state:

		let offtakerCfdNetPosition_billNumber_stateVarIdInit = 48;

		const offtakerCfdNetPosition_billNumber_stateVarId_key = billNumber;

		let offtakerCfdNetPosition_billNumber_stateVarId = generalise(
			utils.mimcHash(
				[
					generalise(offtakerCfdNetPosition_billNumber_stateVarIdInit).bigInt,
					offtakerCfdNetPosition_billNumber_stateVarId_key.bigInt,
				],
				"ALT_BN_254"
			)
		).hex(32);

		let offtakerCfdNetPosition_billNumber_commitmentExists = true;
		let offtakerCfdNetPosition_billNumber_witnessRequired = true;

		const offtakerCfdNetPosition_billNumber_commitment =
			await getCurrentWholeCommitment(
				offtakerCfdNetPosition_billNumber_stateVarId
			);

		let offtakerCfdNetPosition_billNumber_preimage = {
			value: 0,
			salt: 0,
			commitment: 0,
		};
		if (!offtakerCfdNetPosition_billNumber_commitment) {
			offtakerCfdNetPosition_billNumber_commitmentExists = false;
			offtakerCfdNetPosition_billNumber_witnessRequired = false;
		} else {
			offtakerCfdNetPosition_billNumber_preimage =
				offtakerCfdNetPosition_billNumber_commitment.preimage;
		}

		// Initialise commitment preimage of whole state:

		let generatorInterest_billNumber_stateVarIdInit = 52;

		const generatorInterest_billNumber_stateVarId_key = billNumber;

		let generatorInterest_billNumber_stateVarId = generalise(
			utils.mimcHash(
				[
					generalise(generatorInterest_billNumber_stateVarIdInit).bigInt,
					generatorInterest_billNumber_stateVarId_key.bigInt,
				],
				"ALT_BN_254"
			)
		).hex(32);

		let generatorInterest_billNumber_commitmentExists = true;
		let generatorInterest_billNumber_witnessRequired = true;

		const generatorInterest_billNumber_commitment =
			await getCurrentWholeCommitment(generatorInterest_billNumber_stateVarId);

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

		let offtakerInterest_billNumber_stateVarIdInit = 56;

		const offtakerInterest_billNumber_stateVarId_key = billNumber;

		let offtakerInterest_billNumber_stateVarId = generalise(
			utils.mimcHash(
				[
					generalise(offtakerInterest_billNumber_stateVarIdInit).bigInt,
					offtakerInterest_billNumber_stateVarId_key.bigInt,
				],
				"ALT_BN_254"
			)
		).hex(32);

		let offtakerInterest_billNumber_commitmentExists = true;
		let offtakerInterest_billNumber_witnessRequired = true;

		const offtakerInterest_billNumber_commitment =
			await getCurrentWholeCommitment(offtakerInterest_billNumber_stateVarId);

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

		let offtakerNegativePriceCharges_billNumber_stateVarIdInit = 60;

		const offtakerNegativePriceCharges_billNumber_stateVarId_key = billNumber;

		let offtakerNegativePriceCharges_billNumber_stateVarId = generalise(
			utils.mimcHash(
				[
					generalise(offtakerNegativePriceCharges_billNumber_stateVarIdInit)
						.bigInt,
					offtakerNegativePriceCharges_billNumber_stateVarId_key.bigInt,
				],
				"ALT_BN_254"
			)
		).hex(32);

		let offtakerNegativePriceCharges_billNumber_commitmentExists = true;
		let offtakerNegativePriceCharges_billNumber_witnessRequired = true;

		const offtakerNegativePriceCharges_billNumber_commitment =
			await getCurrentWholeCommitment(
				offtakerNegativePriceCharges_billNumber_stateVarId
			);

		let offtakerNegativePriceCharges_billNumber_preimage = {
			value: 0,
			salt: 0,
			commitment: 0,
		};
		if (!offtakerNegativePriceCharges_billNumber_commitment) {
			offtakerNegativePriceCharges_billNumber_commitmentExists = false;
			offtakerNegativePriceCharges_billNumber_witnessRequired = false;
		} else {
			offtakerNegativePriceCharges_billNumber_preimage =
				offtakerNegativePriceCharges_billNumber_commitment.preimage;
		}

		// Initialise commitment preimage of whole state:

		let generatorNegativePriceCharges_billNumber_stateVarIdInit = 64;

		const generatorNegativePriceCharges_billNumber_stateVarId_key = billNumber;

		let generatorNegativePriceCharges_billNumber_stateVarId = generalise(
			utils.mimcHash(
				[
					generalise(generatorNegativePriceCharges_billNumber_stateVarIdInit)
						.bigInt,
					generatorNegativePriceCharges_billNumber_stateVarId_key.bigInt,
				],
				"ALT_BN_254"
			)
		).hex(32);

		let generatorNegativePriceCharges_billNumber_commitmentExists = true;
		let generatorNegativePriceCharges_billNumber_witnessRequired = true;

		const generatorNegativePriceCharges_billNumber_commitment =
			await getCurrentWholeCommitment(
				generatorNegativePriceCharges_billNumber_stateVarId
			);

		let generatorNegativePriceCharges_billNumber_preimage = {
			value: 0,
			salt: 0,
			commitment: 0,
		};
		if (!generatorNegativePriceCharges_billNumber_commitment) {
			generatorNegativePriceCharges_billNumber_commitmentExists = false;
			generatorNegativePriceCharges_billNumber_witnessRequired = false;
		} else {
			generatorNegativePriceCharges_billNumber_preimage =
				generatorNegativePriceCharges_billNumber_commitment.preimage;
		}

		// Initialise commitment preimage of whole accessed state:

		const numberOfConsecutivePeriodsForShortfall_stateVarId =
			generalise(66).hex(32);

		let numberOfConsecutivePeriodsForShortfall_commitmentExists = true;

		const numberOfConsecutivePeriodsForShortfall_commitment =
			await getCurrentWholeCommitment(
				numberOfConsecutivePeriodsForShortfall_stateVarId
			);

		const numberOfConsecutivePeriodsForShortfall_preimage =
			numberOfConsecutivePeriodsForShortfall_commitment.preimage;

		const numberOfConsecutivePeriodsForShortfall = generalise(
			numberOfConsecutivePeriodsForShortfall_preimage.value
		);

		// Initialise commitment preimage of whole accessed state:

		const shortfallThreshold_stateVarId = generalise(68).hex(32);

		let shortfallThreshold_commitmentExists = true;

		const shortfallThreshold_commitment = await getCurrentWholeCommitment(
			shortfallThreshold_stateVarId
		);

		const shortfallThreshold_preimage = shortfallThreshold_commitment.preimage;

		const shortfallThreshold = generalise(shortfallThreshold_preimage.value);

		// Initialise commitment preimage of whole state:

		const shortfallPositiveChargeSum_stateVarId = generalise(70).hex(32);

		let shortfallPositiveChargeSum_commitmentExists = true;
		let shortfallPositiveChargeSum_witnessRequired = true;

		const shortfallPositiveChargeSum_commitment =
			await getCurrentWholeCommitment(shortfallPositiveChargeSum_stateVarId);

		let shortfallPositiveChargeSum_preimage = {
			value: 0,
			salt: 0,
			commitment: 0,
		};
		if (!shortfallPositiveChargeSum_commitment) {
			shortfallPositiveChargeSum_commitmentExists = false;
			shortfallPositiveChargeSum_witnessRequired = false;
		} else {
			shortfallPositiveChargeSum_preimage =
				shortfallPositiveChargeSum_commitment.preimage;
		}

		// Initialise commitment preimage of whole state:

		const shortfallNegativeChargeSum_stateVarId = generalise(72).hex(32);

		let shortfallNegativeChargeSum_commitmentExists = true;
		let shortfallNegativeChargeSum_witnessRequired = true;

		const shortfallNegativeChargeSum_commitment =
			await getCurrentWholeCommitment(shortfallNegativeChargeSum_stateVarId);

		let shortfallNegativeChargeSum_preimage = {
			value: 0,
			salt: 0,
			commitment: 0,
		};
		if (!shortfallNegativeChargeSum_commitment) {
			shortfallNegativeChargeSum_commitmentExists = false;
			shortfallNegativeChargeSum_witnessRequired = false;
		} else {
			shortfallNegativeChargeSum_preimage =
				shortfallNegativeChargeSum_commitment.preimage;
		}

		
		// Initialise commitment preimage of whole state:

		let shortfallPositiveCharges_billNumber_stateVarIdInit = 78;

		const shortfallPositiveCharges_billNumber_stateVarId_key = billNumber;

		let shortfallPositiveCharges_billNumber_stateVarId = generalise(
			utils.mimcHash(
				[
					generalise(shortfallPositiveCharges_billNumber_stateVarIdInit).bigInt,
					shortfallPositiveCharges_billNumber_stateVarId_key.bigInt,
				],
				"ALT_BN_254"
			)
		).hex(32);

		let shortfallPositiveCharges_billNumber_commitmentExists = true;
		let shortfallPositiveCharges_billNumber_witnessRequired = true;

		const shortfallPositiveCharges_billNumber_commitment =
			await getCurrentWholeCommitment(
				shortfallPositiveCharges_billNumber_stateVarId
			);

		let shortfallPositiveCharges_billNumber_preimage = {
			value: 0,
			salt: 0,
			commitment: 0,
		};
		if (!shortfallPositiveCharges_billNumber_commitment) {
			shortfallPositiveCharges_billNumber_commitmentExists = false;
			shortfallPositiveCharges_billNumber_witnessRequired = false;
		} else {
			shortfallPositiveCharges_billNumber_preimage =
				shortfallPositiveCharges_billNumber_commitment.preimage;
		}

		// Initialise commitment preimage of whole state:

		let shortfallNegativeCharges_billNumber_stateVarIdInit = 82;

		const shortfallNegativeCharges_billNumber_stateVarId_key = billNumber;

		let shortfallNegativeCharges_billNumber_stateVarId = generalise(
			utils.mimcHash(
				[
					generalise(shortfallNegativeCharges_billNumber_stateVarIdInit).bigInt,
					shortfallNegativeCharges_billNumber_stateVarId_key.bigInt,
				],
				"ALT_BN_254"
			)
		).hex(32);

		let shortfallNegativeCharges_billNumber_commitmentExists = true;
		let shortfallNegativeCharges_billNumber_witnessRequired = true;

		const shortfallNegativeCharges_billNumber_commitment =
			await getCurrentWholeCommitment(
				shortfallNegativeCharges_billNumber_stateVarId
			);

		let shortfallNegativeCharges_billNumber_preimage = {
			value: 0,
			salt: 0,
			commitment: 0,
		};
		if (!shortfallNegativeCharges_billNumber_commitment) {
			shortfallNegativeCharges_billNumber_commitmentExists = false;
			shortfallNegativeCharges_billNumber_witnessRequired = false;
		} else {
			shortfallNegativeCharges_billNumber_preimage =
				shortfallNegativeCharges_billNumber_commitment.preimage;
		}

		// Initialise commitment preimage of whole accessed state:

		const numberOfConsecutivePeriodsForSurplus_stateVarId =
			generalise(84).hex(32);

		let numberOfConsecutivePeriodsForSurplus_commitmentExists = true;

		const numberOfConsecutivePeriodsForSurplus_commitment =
			await getCurrentWholeCommitment(
				numberOfConsecutivePeriodsForSurplus_stateVarId
			);

		const numberOfConsecutivePeriodsForSurplus_preimage =
			numberOfConsecutivePeriodsForSurplus_commitment.preimage;

		const numberOfConsecutivePeriodsForSurplus = generalise(
			numberOfConsecutivePeriodsForSurplus_preimage.value
		);

		// Initialise commitment preimage of whole accessed state:

		const surplusThreshold_stateVarId = generalise(86).hex(32);

		let surplusThreshold_commitmentExists = true;

		const surplusThreshold_commitment = await getCurrentWholeCommitment(
			surplusThreshold_stateVarId
		);

		const surplusThreshold_preimage = surplusThreshold_commitment.preimage;

		const surplusThreshold = generalise(surplusThreshold_preimage.value);

		// Initialise commitment preimage of whole state:

		const surplusPositiveChargeSum_stateVarId = generalise(88).hex(32);

		let surplusPositiveChargeSum_commitmentExists = true;
		let surplusPositiveChargeSum_witnessRequired = true;

		const surplusPositiveChargeSum_commitment = await getCurrentWholeCommitment(
			surplusPositiveChargeSum_stateVarId
		);

		let surplusPositiveChargeSum_preimage = {
			value: 0,
			salt: 0,
			commitment: 0,
		};
		if (!surplusPositiveChargeSum_commitment) {
			surplusPositiveChargeSum_commitmentExists = false;
			surplusPositiveChargeSum_witnessRequired = false;
		} else {
			surplusPositiveChargeSum_preimage =
				surplusPositiveChargeSum_commitment.preimage;
		}

		// Initialise commitment preimage of whole state:

		const surplusNegativeChargeSum_stateVarId = generalise(90).hex(32);

		let surplusNegativeChargeSum_commitmentExists = true;
		let surplusNegativeChargeSum_witnessRequired = true;

		const surplusNegativeChargeSum_commitment = await getCurrentWholeCommitment(
			surplusNegativeChargeSum_stateVarId
		);

		let surplusNegativeChargeSum_preimage = {
			value: 0,
			salt: 0,
			commitment: 0,
		};
		if (!surplusNegativeChargeSum_commitment) {
			surplusNegativeChargeSum_commitmentExists = false;
			surplusNegativeChargeSum_witnessRequired = false;
		} else {
			surplusNegativeChargeSum_preimage =
				surplusNegativeChargeSum_commitment.preimage;
		}

	

		// Initialise commitment preimage of whole state:

		let surplusPositiveCharges_billNumber_stateVarIdInit = 96;

		const surplusPositiveCharges_billNumber_stateVarId_key = billNumber;

		let surplusPositiveCharges_billNumber_stateVarId = generalise(
			utils.mimcHash(
				[
					generalise(surplusPositiveCharges_billNumber_stateVarIdInit).bigInt,
					surplusPositiveCharges_billNumber_stateVarId_key.bigInt,
				],
				"ALT_BN_254"
			)
		).hex(32);

		let surplusPositiveCharges_billNumber_commitmentExists = true;
		let surplusPositiveCharges_billNumber_witnessRequired = true;

		const surplusPositiveCharges_billNumber_commitment =
			await getCurrentWholeCommitment(
				surplusPositiveCharges_billNumber_stateVarId
			);

		let surplusPositiveCharges_billNumber_preimage = {
			value: 0,
			salt: 0,
			commitment: 0,
		};
		if (!surplusPositiveCharges_billNumber_commitment) {
			surplusPositiveCharges_billNumber_commitmentExists = false;
			surplusPositiveCharges_billNumber_witnessRequired = false;
		} else {
			surplusPositiveCharges_billNumber_preimage =
				surplusPositiveCharges_billNumber_commitment.preimage;
		}

		// Initialise commitment preimage of whole state:

		let surplusNegativeCharges_billNumber_stateVarIdInit = 100;

		const surplusNegativeCharges_billNumber_stateVarId_key = billNumber;

		let surplusNegativeCharges_billNumber_stateVarId = generalise(
			utils.mimcHash(
				[
					generalise(surplusNegativeCharges_billNumber_stateVarIdInit).bigInt,
					surplusNegativeCharges_billNumber_stateVarId_key.bigInt,
				],
				"ALT_BN_254"
			)
		).hex(32);

		let surplusNegativeCharges_billNumber_commitmentExists = true;
		let surplusNegativeCharges_billNumber_witnessRequired = true;

		const surplusNegativeCharges_billNumber_commitment =
			await getCurrentWholeCommitment(
				surplusNegativeCharges_billNumber_stateVarId
			);

		let surplusNegativeCharges_billNumber_preimage = {
			value: 0,
			salt: 0,
			commitment: 0,
		};
		if (!surplusNegativeCharges_billNumber_commitment) {
			surplusNegativeCharges_billNumber_commitmentExists = false;
			surplusNegativeCharges_billNumber_witnessRequired = false;
		} else {
			surplusNegativeCharges_billNumber_preimage =
				surplusNegativeCharges_billNumber_commitment.preimage;
		}

		// read preimage for accessed state

		const strikePrice_currentCommitment = generalise(
			strikePrice_commitment._id
		);
		const strikePrice_prev = generalise(strikePrice_preimage.value);
		const strikePrice_prevSalt = generalise(strikePrice_preimage.salt);

		// read preimage for accessed state

		const bundlePrice_currentCommitment = generalise(
			bundlePrice_commitment._id
		);
		const bundlePrice_prev = generalise(bundlePrice_preimage.value);
		const bundlePrice_prevSalt = generalise(bundlePrice_preimage.salt);

		// read preimage for accessed state

		const volumeShare_currentCommitment = generalise(
			volumeShare_commitment._id
		);
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
		const shortfalls_index_prevSalt = generalise(
			shortfalls_index_preimage.salt
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

		const latestShortfallSequenceNumber_currentCommitment =
			latestShortfallSequenceNumber_commitmentExists
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

		const surpluses_index_1_currentCommitment =
			surpluses_index_1_commitmentExists
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

		const latestSurplusSequenceNumber_currentCommitment =
			latestSurplusSequenceNumber_commitmentExists
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
		generatorCfdNetPosition_billNumber_newOwnerPublicKey =
			_generatorCfdNetPosition_billNumber_newOwnerPublicKey === 0
				? publicKey
				: generatorCfdNetPosition_billNumber_newOwnerPublicKey;

		const generatorCfdNetPosition_billNumber_currentCommitment =
			generatorCfdNetPosition_billNumber_commitmentExists
				? generalise(generatorCfdNetPosition_billNumber_commitment._id)
				: generalise(0);
		const generatorCfdNetPosition_billNumber_prev = generalise(
			generatorCfdNetPosition_billNumber_preimage.value
		);
		const generatorCfdNetPosition_billNumber_prevSalt = generalise(
			generatorCfdNetPosition_billNumber_preimage.salt
		);

		// read preimage for whole state
		offtakerCfdNetPosition_billNumber_newOwnerPublicKey =
			_offtakerCfdNetPosition_billNumber_newOwnerPublicKey === 0
				? publicKey
				: offtakerCfdNetPosition_billNumber_newOwnerPublicKey;

		const offtakerCfdNetPosition_billNumber_currentCommitment =
			offtakerCfdNetPosition_billNumber_commitmentExists
				? generalise(offtakerCfdNetPosition_billNumber_commitment._id)
				: generalise(0);
		const offtakerCfdNetPosition_billNumber_prev = generalise(
			offtakerCfdNetPosition_billNumber_preimage.value
		);
		const offtakerCfdNetPosition_billNumber_prevSalt = generalise(
			offtakerCfdNetPosition_billNumber_preimage.salt
		);

		// read preimage for whole state
		generatorInterest_billNumber_newOwnerPublicKey =
			_generatorInterest_billNumber_newOwnerPublicKey === 0
				? publicKey
				: generatorInterest_billNumber_newOwnerPublicKey;

		const generatorInterest_billNumber_currentCommitment =
			generatorInterest_billNumber_commitmentExists
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

		const offtakerInterest_billNumber_currentCommitment =
			offtakerInterest_billNumber_commitmentExists
				? generalise(offtakerInterest_billNumber_commitment._id)
				: generalise(0);
		const offtakerInterest_billNumber_prev = generalise(
			offtakerInterest_billNumber_preimage.value
		);
		const offtakerInterest_billNumber_prevSalt = generalise(
			offtakerInterest_billNumber_preimage.salt
		);

		// read preimage for whole state
		offtakerNegativePriceCharges_billNumber_newOwnerPublicKey =
			_offtakerNegativePriceCharges_billNumber_newOwnerPublicKey === 0
				? publicKey
				: offtakerNegativePriceCharges_billNumber_newOwnerPublicKey;

		const offtakerNegativePriceCharges_billNumber_currentCommitment =
			offtakerNegativePriceCharges_billNumber_commitmentExists
				? generalise(offtakerNegativePriceCharges_billNumber_commitment._id)
				: generalise(0);
		const offtakerNegativePriceCharges_billNumber_prev = generalise(
			offtakerNegativePriceCharges_billNumber_preimage.value
		);
		const offtakerNegativePriceCharges_billNumber_prevSalt = generalise(
			offtakerNegativePriceCharges_billNumber_preimage.salt
		);

		// read preimage for whole state
		generatorNegativePriceCharges_billNumber_newOwnerPublicKey =
			_generatorNegativePriceCharges_billNumber_newOwnerPublicKey === 0
				? publicKey
				: generatorNegativePriceCharges_billNumber_newOwnerPublicKey;

		const generatorNegativePriceCharges_billNumber_currentCommitment =
			generatorNegativePriceCharges_billNumber_commitmentExists
				? generalise(generatorNegativePriceCharges_billNumber_commitment._id)
				: generalise(0);
		const generatorNegativePriceCharges_billNumber_prev = generalise(
			generatorNegativePriceCharges_billNumber_preimage.value
		);
		const generatorNegativePriceCharges_billNumber_prevSalt = generalise(
			generatorNegativePriceCharges_billNumber_preimage.salt
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

		// read preimage for accessed state

		const shortfallThreshold_currentCommitment = generalise(
			shortfallThreshold_commitment._id
		);
		const shortfallThreshold_prev = generalise(
			shortfallThreshold_preimage.value
		);
		const shortfallThreshold_prevSalt = generalise(
			shortfallThreshold_preimage.salt
		);

		// read preimage for whole state
		shortfallPositiveChargeSum_newOwnerPublicKey =
			_shortfallPositiveChargeSum_newOwnerPublicKey === 0
				? publicKey
				: shortfallPositiveChargeSum_newOwnerPublicKey;

		const shortfallPositiveChargeSum_currentCommitment =
			shortfallPositiveChargeSum_commitmentExists
				? generalise(shortfallPositiveChargeSum_commitment._id)
				: generalise(0);
		const shortfallPositiveChargeSum_prev = generalise(
			shortfallPositiveChargeSum_preimage.value
		);
		const shortfallPositiveChargeSum_prevSalt = generalise(
			shortfallPositiveChargeSum_preimage.salt
		);

		// read preimage for whole state
		shortfallNegativeChargeSum_newOwnerPublicKey =
			_shortfallNegativeChargeSum_newOwnerPublicKey === 0
				? publicKey
				: shortfallNegativeChargeSum_newOwnerPublicKey;

		const shortfallNegativeChargeSum_currentCommitment =
			shortfallNegativeChargeSum_commitmentExists
				? generalise(shortfallNegativeChargeSum_commitment._id)
				: generalise(0);
		const shortfallNegativeChargeSum_prev = generalise(
			shortfallNegativeChargeSum_preimage.value
		);
		const shortfallNegativeChargeSum_prevSalt = generalise(
			shortfallNegativeChargeSum_preimage.salt
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
		shortfallPositiveCharges_billNumber_newOwnerPublicKey =
			_shortfallPositiveCharges_billNumber_newOwnerPublicKey === 0
				? publicKey
				: shortfallPositiveCharges_billNumber_newOwnerPublicKey;

		const shortfallPositiveCharges_billNumber_currentCommitment =
			shortfallPositiveCharges_billNumber_commitmentExists
				? generalise(shortfallPositiveCharges_billNumber_commitment._id)
				: generalise(0);
		const shortfallPositiveCharges_billNumber_prev = generalise(
			shortfallPositiveCharges_billNumber_preimage.value
		);
		const shortfallPositiveCharges_billNumber_prevSalt = generalise(
			shortfallPositiveCharges_billNumber_preimage.salt
		);

		// read preimage for whole state
		shortfallNegativeCharges_billNumber_newOwnerPublicKey =
			_shortfallNegativeCharges_billNumber_newOwnerPublicKey === 0
				? publicKey
				: shortfallNegativeCharges_billNumber_newOwnerPublicKey;

		const shortfallNegativeCharges_billNumber_currentCommitment =
			shortfallNegativeCharges_billNumber_commitmentExists
				? generalise(shortfallNegativeCharges_billNumber_commitment._id)
				: generalise(0);
		const shortfallNegativeCharges_billNumber_prev = generalise(
			shortfallNegativeCharges_billNumber_preimage.value
		);
		const shortfallNegativeCharges_billNumber_prevSalt = generalise(
			shortfallNegativeCharges_billNumber_preimage.salt
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

		// read preimage for accessed state

		const surplusThreshold_currentCommitment = generalise(
			surplusThreshold_commitment._id
		);
		const surplusThreshold_prev = generalise(surplusThreshold_preimage.value);
		const surplusThreshold_prevSalt = generalise(
			surplusThreshold_preimage.salt
		);

		// read preimage for whole state
		surplusPositiveChargeSum_newOwnerPublicKey =
			_surplusPositiveChargeSum_newOwnerPublicKey === 0
				? publicKey
				: surplusPositiveChargeSum_newOwnerPublicKey;

		const surplusPositiveChargeSum_currentCommitment =
			surplusPositiveChargeSum_commitmentExists
				? generalise(surplusPositiveChargeSum_commitment._id)
				: generalise(0);
		const surplusPositiveChargeSum_prev = generalise(
			surplusPositiveChargeSum_preimage.value
		);
		const surplusPositiveChargeSum_prevSalt = generalise(
			surplusPositiveChargeSum_preimage.salt
		);

		// read preimage for whole state
		surplusNegativeChargeSum_newOwnerPublicKey =
			_surplusNegativeChargeSum_newOwnerPublicKey === 0
				? publicKey
				: surplusNegativeChargeSum_newOwnerPublicKey;

		const surplusNegativeChargeSum_currentCommitment =
			surplusNegativeChargeSum_commitmentExists
				? generalise(surplusNegativeChargeSum_commitment._id)
				: generalise(0);
		const surplusNegativeChargeSum_prev = generalise(
			surplusNegativeChargeSum_preimage.value
		);
		const surplusNegativeChargeSum_prevSalt = generalise(
			surplusNegativeChargeSum_preimage.salt
		);

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
		surplusPositiveCharges_billNumber_newOwnerPublicKey =
			_surplusPositiveCharges_billNumber_newOwnerPublicKey === 0
				? publicKey
				: surplusPositiveCharges_billNumber_newOwnerPublicKey;

		const surplusPositiveCharges_billNumber_currentCommitment =
			surplusPositiveCharges_billNumber_commitmentExists
				? generalise(surplusPositiveCharges_billNumber_commitment._id)
				: generalise(0);
		const surplusPositiveCharges_billNumber_prev = generalise(
			surplusPositiveCharges_billNumber_preimage.value
		);
		const surplusPositiveCharges_billNumber_prevSalt = generalise(
			surplusPositiveCharges_billNumber_preimage.salt
		);

		// read preimage for whole state
		surplusNegativeCharges_billNumber_newOwnerPublicKey =
			_surplusNegativeCharges_billNumber_newOwnerPublicKey === 0
				? publicKey
				: surplusNegativeCharges_billNumber_newOwnerPublicKey;

		const surplusNegativeCharges_billNumber_currentCommitment =
			surplusNegativeCharges_billNumber_commitmentExists
				? generalise(surplusNegativeCharges_billNumber_commitment._id)
				: generalise(0);
		const surplusNegativeCharges_billNumber_prev = generalise(
			surplusNegativeCharges_billNumber_preimage.value
		);
		const surplusNegativeCharges_billNumber_prevSalt = generalise(
			surplusNegativeCharges_billNumber_preimage.salt
		);

		let offtakerInterest_billNumber = generalise(
			offtakerInterest_billNumber_preimage.value
		);

		let generatorInterest_billNumber = generalise(
			generatorInterest_billNumber_preimage.value
		);

		let surplusNegativeCharges_billNumber = generalise(
			surplusNegativeCharges_billNumber_preimage.value
		);

		let surplusPositiveCharges_billNumber = generalise(
			surplusPositiveCharges_billNumber_preimage.value
		);

		let latestSurplusSequenceNumber = generalise(
			latestSurplusSequenceNumber_preimage.value
		);

		let surplusNegativeChargeSum = generalise(
			surplusNegativeChargeSum_preimage.value
		);

		let surplusPositiveChargeSum = generalise(
			surplusPositiveChargeSum_preimage.value
		);

		let surpluses_index_1 = generalise(surpluses_index_1_preimage.value);

		let shortfallNegativeCharges_billNumber = generalise(
			shortfallNegativeCharges_billNumber_preimage.value
		);

		let shortfallPositiveCharges_billNumber = generalise(
			shortfallPositiveCharges_billNumber_preimage.value
		);

		let latestShortfallSequenceNumber = generalise(
			latestShortfallSequenceNumber_preimage.value
		);

		let shortfallNegativeChargeSum = generalise(
			shortfallNegativeChargeSum_preimage.value
		);

		let shortfallPositiveChargeSum = generalise(
			shortfallPositiveChargeSum_preimage.value
		);

		let shortfalls_index = generalise(shortfalls_index_preimage.value);

		let offtakerNegativePriceCharges_billNumber = generalise(
			offtakerNegativePriceCharges_billNumber_preimage.value
		);

		let generatorNegativePriceCharges_billNumber = generalise(
			generatorNegativePriceCharges_billNumber_preimage.value
		);

		let offtakerCfdNetPosition_billNumber = generalise(
			offtakerCfdNetPosition_billNumber_preimage.value
		);

		let generatorCfdNetPosition_billNumber = generalise(
			generatorCfdNetPosition_billNumber_preimage.value
		);

		if (
			!(
				parseInt(referenceDate.integer, 10) >=
				parseInt(startDateOfContract.integer, 10)
			)
		) {
			throw new Error("Require statement not satisfied.");
		}
		if (
			!(
				parseInt(referenceDate.integer, 10) <=
				parseInt(expiryDateOfContract.integer, 10)
			)
		) {
			throw new Error("Require statement not satisfied.");
		}
		// non-secret line would go here but has been filtered out

		let offtakerVolume = generalise(
			parseInt(totalGeneratedVolume.integer, 10) *
				parseInt(volumeShare.integer, 10) *
				parseInt(marginalLossFactor.integer, 10)
		);

		let fixedAmount = generalise(0);

		if (parseInt(bundlePrice.integer, 10) <= 0) {
			fixedAmount = generalise(
				parseInt(offtakerVolume.integer, 10) * parseInt(strikePrice.integer, 10)
			);
		} else {
			fixedAmount = generalise(
				parseInt(offtakerVolume.integer, 10) * parseInt(bundlePrice.integer, 10)
			);
		}

		let netPositiveAdjustment = generalise(0);

		let netNegativeAdjustment = generalise(0);

		if (
			parseInt(negativeAdjustment.integer, 10) >
			parseInt(positiveAdjustment.integer, 10)
		) {
			netNegativeAdjustment = generalise(
				parseInt(negativeAdjustment.integer, 10) -
					parseInt(positiveAdjustment.integer, 10)
			);
		} else {
			netPositiveAdjustment = generalise(
				parseInt(positiveAdjustment.integer, 10) -
					parseInt(negativeAdjustment.integer, 10)
			);
		}

		if (
			parseInt(floatingAmount.integer, 10) +
				parseInt(netNegativeAdjustment.integer, 10) >
			parseInt(fixedAmount.integer, 10) +
				parseInt(netPositiveAdjustment.integer, 10)
		) {
			generatorCfdNetPosition_billNumber = generalise(
				parseInt(floatingAmount.integer, 10) +
					parseInt(netNegativeAdjustment.integer, 10) -
					parseInt(fixedAmount.integer, 10) -
					parseInt(netPositiveAdjustment.integer, 10)
			);
		} else {
			offtakerCfdNetPosition_billNumber = generalise(
				parseInt(fixedAmount.integer, 10) +
					parseInt(netPositiveAdjustment.integer, 10) -
					parseInt(floatingAmount.integer, 10) -
					parseInt(netNegativeAdjustment.integer, 10)
			);
		}

		let shortfallSequence = generalise(0);

		if (
			parseInt(sequenceNumber.integer, 10) ==
				parseInt(latestShortfallSequenceNumber.integer, 10) +
					parseInt(sequenceNumberInterval.integer, 10) ||
			parseInt(latestShortfallSequenceNumber.integer, 10) == 0 ||
			parseInt(sequenceNumber.integer, 10) == 0
		) {
			shortfallSequence = generalise(1);
		}

		let surplusSequence = generalise(0);

		if (
			parseInt(sequenceNumber.integer, 10) ==
				parseInt(latestSurplusSequenceNumber.integer, 10) +
					parseInt(sequenceNumberInterval.integer, 10) ||
			parseInt(latestSurplusSequenceNumber.integer, 10) == 0 ||
			parseInt(sequenceNumber.integer, 10) == 0
		) {
			surplusSequence = generalise(1);
		}

		let positivePriceDifference = generalise(0);

		let negativePriceDifference = generalise(0);

		if (
			parseInt(averagePrice.integer, 10) > parseInt(strikePrice.integer, 10)
		) {
			positivePriceDifference = generalise(
				parseInt(averagePrice.integer, 10) - parseInt(strikePrice.integer, 10)
			);
		} else {
			negativePriceDifference = generalise(
				parseInt(strikePrice.integer, 10) - parseInt(averagePrice.integer, 10)
			);
		}

		let volumeDifference = generalise(0);

		if (
			parseInt(expectedVolume.integer, 10) >
			parseInt(offtakerVolume.integer, 10)
		) {
			volumeDifference = generalise(
				parseInt(expectedVolume.integer, 10) -
					parseInt(offtakerVolume.integer, 10)
			);
		} else {
			volumeDifference = generalise(
				parseInt(offtakerVolume.integer, 10) -
					parseInt(expectedVolume.integer, 10)
			);
		}

		if (
			!(parseInt(negativePriceOccurredParam.integer, 10) === 0) &&
			parseInt(expectedVolume.integer, 10) >
				parseInt(offtakerVolume.integer, 10)
		) {
			generatorNegativePriceCharges_billNumber = generalise(
				parseInt(volumeDifference.integer, 10) *
					parseInt(strikePrice.integer, 10)
			);
		}

		if (
			!(parseInt(negativePriceOccurredParam.integer, 10) === 0) &&
			parseInt(expectedVolume.integer, 10) <=
				parseInt(offtakerVolume.integer, 10)
		) {
			offtakerNegativePriceCharges_billNumber = generalise(
				parseInt(volumeDifference.integer, 10) *
					parseInt(strikePrice.integer, 10)
			);
		}

		if (
			parseInt(shortfallSequence.integer, 10) != 0 &&
			parseInt(expectedVolume.integer, 10) >
				parseInt(offtakerVolume.integer, 10) &&
			parseInt(volumeDifference.integer, 10) >=
				parseInt(shortfallThreshold.integer, 10) &&
			parseInt(numberOfConsecutivePeriodsForShortfall.integer, 10) > 0
		) {
			shortfalls_index.billNumber = generalise(
				parseInt(billNumber.integer, 10)
			);

			shortfalls_index.price = generalise(parseInt(averagePrice.integer, 10));

			shortfalls_index.volume = generalise(
				parseInt(volumeDifference.integer, 10)
			);

			shortfallPositiveChargeSum = generalise(
				parseInt(shortfallPositiveChargeSum.integer, 10) +
					parseInt(shortfalls_index.volume.integer, 10) *
						parseInt(positivePriceDifference.integer, 10)
			);

			shortfallNegativeChargeSum = generalise(
				parseInt(shortfallNegativeChargeSum.integer, 10) +
					parseInt(shortfalls_index.volume.integer, 10) *
						parseInt(negativePriceDifference.integer, 10)
			);

			shortfallIndex = generalise(parseInt(shortfallIndex.integer, 10) + 1);

			latestShortfallSequenceNumber = generalise(
				parseInt(sequenceNumber.integer, 10)
			);
		}

		if (
			parseInt(shortfallSequence.integer, 10) != 0 &&
			(parseInt(expectedVolume.integer, 10) <=
				parseInt(offtakerVolume.integer, 10) ||
				parseInt(volumeDifference.integer, 10) <
					parseInt(shortfallThreshold.integer, 10))
		) {
			shortfallPositiveChargeSum = generalise(0);

			shortfallNegativeChargeSum = generalise(0);

			shortfallIndex = generalise(0);

			latestShortfallSequenceNumber = generalise(0);
		}

		if (
			parseInt(shortfallIndex.integer, 10) >=
				parseInt(numberOfConsecutivePeriodsForShortfall.integer, 10) &&
			parseInt(numberOfConsecutivePeriodsForShortfall.integer, 10) > 0
		) {
			shortfallPositiveCharges_billNumber = generalise(
				parseInt(shortfallPositiveChargeSum.integer, 10)
			);

			shortfallNegativeCharges_billNumber = generalise(
				parseInt(shortfallNegativeChargeSum.integer, 10)
			);

			shortfallPositiveChargeSum = generalise(0);

			shortfallNegativeChargeSum = generalise(0);

			shortfallIndex = generalise(0);

			latestShortfallSequenceNumber = generalise(0);
		}

		

		if (
			parseInt(surplusSequence.integer, 10) != 0 &&
			parseInt(expectedVolume.integer, 10) <
				parseInt(offtakerVolume.integer, 10) &&
			parseInt(volumeDifference.integer, 10) >=
				parseInt(surplusThreshold.integer, 10) &&
			parseInt(numberOfConsecutivePeriodsForSurplus.integer, 10) > 0
		) {
			surpluses_index_1.billNumber = generalise(
				parseInt(billNumber.integer, 10)
			);

			surpluses_index_1.price = generalise(parseInt(averagePrice.integer, 10));

			surpluses_index_1.volume = generalise(
				parseInt(volumeDifference.integer, 10)
			);

			surplusPositiveChargeSum = generalise(
				parseInt(surplusPositiveChargeSum.integer, 10) +
					parseInt(surpluses_index_1.volume.integer, 10) *
						parseInt(positivePriceDifference.integer, 10)
			);

			surplusNegativeChargeSum = generalise(
				parseInt(surplusNegativeChargeSum.integer, 10) +
					parseInt(surpluses_index_1.volume.integer, 10) *
						parseInt(negativePriceDifference.integer, 10)
			);

			surplusIndex = generalise(parseInt(surplusIndex.integer, 10) + 1);

			latestSurplusSequenceNumber = generalise(
				parseInt(sequenceNumber.integer, 10)
			);
		}

		if (
			parseInt(surplusSequence.integer, 10) != 0 &&
			(parseInt(expectedVolume.integer, 10) >=
				parseInt(offtakerVolume.integer, 10) ||
				parseInt(volumeDifference.integer, 10) <
					parseInt(surplusThreshold.integer, 10))
		) {
			surplusPositiveChargeSum = generalise(0);

			surplusNegativeChargeSum = generalise(0);

			surplusIndex = generalise(0);

			latestSurplusSequenceNumber = generalise(0);
		}

		if (
			parseInt(surplusIndex.integer, 10) >=
				parseInt(numberOfConsecutivePeriodsForSurplus.integer, 10) &&
			parseInt(numberOfConsecutivePeriodsForSurplus.integer, 10) > 0
		) {
			surplusPositiveCharges_billNumber = generalise(
				parseInt(surplusPositiveChargeSum.integer, 10)
			);

			surplusNegativeCharges_billNumber = generalise(
				parseInt(surplusNegativeChargeSum.integer, 10)
			);

			surplusPositiveChargeSum = generalise(0);

			surplusNegativeChargeSum = generalise(0);

			surplusIndex = generalise(0);

			latestSurplusSequenceNumber = generalise(0);
		}

		for (let i = 0; i < 5; i++) {
			if (parseInt(outstandingGeneratorAmount[i].integer, 10) > 0) {
				generatorInterest_billNumber = generalise(
					parseInt(generatorInterest_billNumber.integer, 10) +
						parseInt(outstandingGeneratorAmount[i].integer, 10) *
							parseInt(generatorDelayDays[i].integer, 10) *
							parseInt(dailyInterestRate.integer, 10)
				);
				generatorInterest_billNumber = generalise(generatorInterest_billNumber);
			}

			if (parseInt(outstandingOfftakerAmount[i].integer, 10) > 0) {
				offtakerInterest_billNumber = generalise(
					parseInt(offtakerInterest_billNumber.integer, 10) +
						parseInt(outstandingOfftakerAmount[i].integer, 10) *
							parseInt(offtakerDelayDays[i].integer, 10) *
							parseInt(dailyInterestRate.integer, 10)
				);
				offtakerInterest_billNumber = generalise(offtakerInterest_billNumber);
			}
		}

		// Extract set membership witness:

		// generate witness for whole accessed state
		const strikePrice_witness = await getMembershipWitness(
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
		const dailyInterestRate_path = generalise(
			dailyInterestRate_witness.path
		).all;

		// generate witness for whole accessed state
		const startDateOfContract_witness = await getMembershipWitness(
			"SyntheticPpaShield",
			startDateOfContract_currentCommitment.integer
		);
		const startDateOfContract_index = generalise(
			startDateOfContract_witness.index
		);
		const startDateOfContract_root = generalise(
			startDateOfContract_witness.root
		);
		const startDateOfContract_path = generalise(
			startDateOfContract_witness.path
		).all;

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
		const latestShortfallSequenceNumber_witness =
			latestShortfallSequenceNumber_witnessRequired
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
		const surpluses_index_1_path = generalise(
			surpluses_index_1_witness.path
		).all;

		// generate witness for whole state
		const latestSurplusSequenceNumber_emptyPath = new Array(32).fill(0);
		const latestSurplusSequenceNumber_witness =
			latestSurplusSequenceNumber_witnessRequired
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
		const generatorCfdNetPosition_billNumber_emptyPath = new Array(32).fill(0);
		const generatorCfdNetPosition_billNumber_witness =
			generatorCfdNetPosition_billNumber_witnessRequired
				? await getMembershipWitness(
						"SyntheticPpaShield",
						generatorCfdNetPosition_billNumber_currentCommitment.integer
				  )
				: {
						index: 0,
						path: generatorCfdNetPosition_billNumber_emptyPath,
						root: (await getRoot("SyntheticPpaShield")) || 0,
				  };
		const generatorCfdNetPosition_billNumber_index = generalise(
			generatorCfdNetPosition_billNumber_witness.index
		);
		const generatorCfdNetPosition_billNumber_root = generalise(
			generatorCfdNetPosition_billNumber_witness.root
		);
		const generatorCfdNetPosition_billNumber_path = generalise(
			generatorCfdNetPosition_billNumber_witness.path
		).all;

		// generate witness for whole state
		const offtakerCfdNetPosition_billNumber_emptyPath = new Array(32).fill(0);
		const offtakerCfdNetPosition_billNumber_witness =
			offtakerCfdNetPosition_billNumber_witnessRequired
				? await getMembershipWitness(
						"SyntheticPpaShield",
						offtakerCfdNetPosition_billNumber_currentCommitment.integer
				  )
				: {
						index: 0,
						path: offtakerCfdNetPosition_billNumber_emptyPath,
						root: (await getRoot("SyntheticPpaShield")) || 0,
				  };
		const offtakerCfdNetPosition_billNumber_index = generalise(
			offtakerCfdNetPosition_billNumber_witness.index
		);
		const offtakerCfdNetPosition_billNumber_root = generalise(
			offtakerCfdNetPosition_billNumber_witness.root
		);
		const offtakerCfdNetPosition_billNumber_path = generalise(
			offtakerCfdNetPosition_billNumber_witness.path
		).all;

		// generate witness for whole state
		const generatorInterest_billNumber_emptyPath = new Array(32).fill(0);
		const generatorInterest_billNumber_witness =
			generatorInterest_billNumber_witnessRequired
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
		const offtakerInterest_billNumber_witness =
			offtakerInterest_billNumber_witnessRequired
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
		const offtakerNegativePriceCharges_billNumber_emptyPath = new Array(
			32
		).fill(0);
		const offtakerNegativePriceCharges_billNumber_witness =
			offtakerNegativePriceCharges_billNumber_witnessRequired
				? await getMembershipWitness(
						"SyntheticPpaShield",
						offtakerNegativePriceCharges_billNumber_currentCommitment.integer
				  )
				: {
						index: 0,
						path: offtakerNegativePriceCharges_billNumber_emptyPath,
						root: (await getRoot("SyntheticPpaShield")) || 0,
				  };
		const offtakerNegativePriceCharges_billNumber_index = generalise(
			offtakerNegativePriceCharges_billNumber_witness.index
		);
		const offtakerNegativePriceCharges_billNumber_root = generalise(
			offtakerNegativePriceCharges_billNumber_witness.root
		);
		const offtakerNegativePriceCharges_billNumber_path = generalise(
			offtakerNegativePriceCharges_billNumber_witness.path
		).all;

		// generate witness for whole state
		const generatorNegativePriceCharges_billNumber_emptyPath = new Array(
			32
		).fill(0);
		const generatorNegativePriceCharges_billNumber_witness =
			generatorNegativePriceCharges_billNumber_witnessRequired
				? await getMembershipWitness(
						"SyntheticPpaShield",
						generatorNegativePriceCharges_billNumber_currentCommitment.integer
				  )
				: {
						index: 0,
						path: generatorNegativePriceCharges_billNumber_emptyPath,
						root: (await getRoot("SyntheticPpaShield")) || 0,
				  };
		const generatorNegativePriceCharges_billNumber_index = generalise(
			generatorNegativePriceCharges_billNumber_witness.index
		);
		const generatorNegativePriceCharges_billNumber_root = generalise(
			generatorNegativePriceCharges_billNumber_witness.root
		);
		const generatorNegativePriceCharges_billNumber_path = generalise(
			generatorNegativePriceCharges_billNumber_witness.path
		).all;

		// generate witness for whole accessed state
		const numberOfConsecutivePeriodsForShortfall_witness =
			await getMembershipWitness(
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

		// generate witness for whole accessed state
		const shortfallThreshold_witness = await getMembershipWitness(
			"SyntheticPpaShield",
			shortfallThreshold_currentCommitment.integer
		);
		const shortfallThreshold_index = generalise(
			shortfallThreshold_witness.index
		);
		const shortfallThreshold_root = generalise(shortfallThreshold_witness.root);
		const shortfallThreshold_path = generalise(
			shortfallThreshold_witness.path
		).all;

		// generate witness for whole state
		const shortfallPositiveChargeSum_emptyPath = new Array(32).fill(0);
		const shortfallPositiveChargeSum_witness =
			shortfallPositiveChargeSum_witnessRequired
				? await getMembershipWitness(
						"SyntheticPpaShield",
						shortfallPositiveChargeSum_currentCommitment.integer
				  )
				: {
						index: 0,
						path: shortfallPositiveChargeSum_emptyPath,
						root: (await getRoot("SyntheticPpaShield")) || 0,
				  };
		const shortfallPositiveChargeSum_index = generalise(
			shortfallPositiveChargeSum_witness.index
		);
		const shortfallPositiveChargeSum_root = generalise(
			shortfallPositiveChargeSum_witness.root
		);
		const shortfallPositiveChargeSum_path = generalise(
			shortfallPositiveChargeSum_witness.path
		).all;

		// generate witness for whole state
		const shortfallNegativeChargeSum_emptyPath = new Array(32).fill(0);
		const shortfallNegativeChargeSum_witness =
			shortfallNegativeChargeSum_witnessRequired
				? await getMembershipWitness(
						"SyntheticPpaShield",
						shortfallNegativeChargeSum_currentCommitment.integer
				  )
				: {
						index: 0,
						path: shortfallNegativeChargeSum_emptyPath,
						root: (await getRoot("SyntheticPpaShield")) || 0,
				  };
		const shortfallNegativeChargeSum_index = generalise(
			shortfallNegativeChargeSum_witness.index
		);
		const shortfallNegativeChargeSum_root = generalise(
			shortfallNegativeChargeSum_witness.root
		);
		const shortfallNegativeChargeSum_path = generalise(
			shortfallNegativeChargeSum_witness.path
		).all;

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
		const shortfallPositiveCharges_billNumber_emptyPath = new Array(32).fill(0);
		const shortfallPositiveCharges_billNumber_witness =
			shortfallPositiveCharges_billNumber_witnessRequired
				? await getMembershipWitness(
						"SyntheticPpaShield",
						shortfallPositiveCharges_billNumber_currentCommitment.integer
				  )
				: {
						index: 0,
						path: shortfallPositiveCharges_billNumber_emptyPath,
						root: (await getRoot("SyntheticPpaShield")) || 0,
				  };
		const shortfallPositiveCharges_billNumber_index = generalise(
			shortfallPositiveCharges_billNumber_witness.index
		);
		const shortfallPositiveCharges_billNumber_root = generalise(
			shortfallPositiveCharges_billNumber_witness.root
		);
		const shortfallPositiveCharges_billNumber_path = generalise(
			shortfallPositiveCharges_billNumber_witness.path
		).all;

		// generate witness for whole state
		const shortfallNegativeCharges_billNumber_emptyPath = new Array(32).fill(0);
		const shortfallNegativeCharges_billNumber_witness =
			shortfallNegativeCharges_billNumber_witnessRequired
				? await getMembershipWitness(
						"SyntheticPpaShield",
						shortfallNegativeCharges_billNumber_currentCommitment.integer
				  )
				: {
						index: 0,
						path: shortfallNegativeCharges_billNumber_emptyPath,
						root: (await getRoot("SyntheticPpaShield")) || 0,
				  };
		const shortfallNegativeCharges_billNumber_index = generalise(
			shortfallNegativeCharges_billNumber_witness.index
		);
		const shortfallNegativeCharges_billNumber_root = generalise(
			shortfallNegativeCharges_billNumber_witness.root
		);
		const shortfallNegativeCharges_billNumber_path = generalise(
			shortfallNegativeCharges_billNumber_witness.path
		).all;

		// generate witness for whole accessed state
		const numberOfConsecutivePeriodsForSurplus_witness =
			await getMembershipWitness(
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

		// generate witness for whole accessed state
		const surplusThreshold_witness = await getMembershipWitness(
			"SyntheticPpaShield",
			surplusThreshold_currentCommitment.integer
		);
		const surplusThreshold_index = generalise(surplusThreshold_witness.index);
		const surplusThreshold_root = generalise(surplusThreshold_witness.root);
		const surplusThreshold_path = generalise(surplusThreshold_witness.path).all;

		// generate witness for whole state
		const surplusPositiveChargeSum_emptyPath = new Array(32).fill(0);
		const surplusPositiveChargeSum_witness =
			surplusPositiveChargeSum_witnessRequired
				? await getMembershipWitness(
						"SyntheticPpaShield",
						surplusPositiveChargeSum_currentCommitment.integer
				  )
				: {
						index: 0,
						path: surplusPositiveChargeSum_emptyPath,
						root: (await getRoot("SyntheticPpaShield")) || 0,
				  };
		const surplusPositiveChargeSum_index = generalise(
			surplusPositiveChargeSum_witness.index
		);
		const surplusPositiveChargeSum_root = generalise(
			surplusPositiveChargeSum_witness.root
		);
		const surplusPositiveChargeSum_path = generalise(
			surplusPositiveChargeSum_witness.path
		).all;

		// generate witness for whole state
		const surplusNegativeChargeSum_emptyPath = new Array(32).fill(0);
		const surplusNegativeChargeSum_witness =
			surplusNegativeChargeSum_witnessRequired
				? await getMembershipWitness(
						"SyntheticPpaShield",
						surplusNegativeChargeSum_currentCommitment.integer
				  )
				: {
						index: 0,
						path: surplusNegativeChargeSum_emptyPath,
						root: (await getRoot("SyntheticPpaShield")) || 0,
				  };
		const surplusNegativeChargeSum_index = generalise(
			surplusNegativeChargeSum_witness.index
		);
		const surplusNegativeChargeSum_root = generalise(
			surplusNegativeChargeSum_witness.root
		);
		const surplusNegativeChargeSum_path = generalise(
			surplusNegativeChargeSum_witness.path
		).all;

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
		const surplusPositiveCharges_billNumber_emptyPath = new Array(32).fill(0);
		const surplusPositiveCharges_billNumber_witness =
			surplusPositiveCharges_billNumber_witnessRequired
				? await getMembershipWitness(
						"SyntheticPpaShield",
						surplusPositiveCharges_billNumber_currentCommitment.integer
				  )
				: {
						index: 0,
						path: surplusPositiveCharges_billNumber_emptyPath,
						root: (await getRoot("SyntheticPpaShield")) || 0,
				  };
		const surplusPositiveCharges_billNumber_index = generalise(
			surplusPositiveCharges_billNumber_witness.index
		);
		const surplusPositiveCharges_billNumber_root = generalise(
			surplusPositiveCharges_billNumber_witness.root
		);
		const surplusPositiveCharges_billNumber_path = generalise(
			surplusPositiveCharges_billNumber_witness.path
		).all;

		// generate witness for whole state
		const surplusNegativeCharges_billNumber_emptyPath = new Array(32).fill(0);
		const surplusNegativeCharges_billNumber_witness =
			surplusNegativeCharges_billNumber_witnessRequired
				? await getMembershipWitness(
						"SyntheticPpaShield",
						surplusNegativeCharges_billNumber_currentCommitment.integer
				  )
				: {
						index: 0,
						path: surplusNegativeCharges_billNumber_emptyPath,
						root: (await getRoot("SyntheticPpaShield")) || 0,
				  };
		const surplusNegativeCharges_billNumber_index = generalise(
			surplusNegativeCharges_billNumber_witness.index
		);
		const surplusNegativeCharges_billNumber_root = generalise(
			surplusNegativeCharges_billNumber_witness.root
		);
		const surplusNegativeCharges_billNumber_path = generalise(
			surplusNegativeCharges_billNumber_witness.path
		).all;

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

		dailyInterestRate_nullifier = generalise(
			dailyInterestRate_nullifier.hex(32)
		); // truncate

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

		let latestShortfallSequenceNumber_nullifier =
			latestShortfallSequenceNumber_commitmentExists
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

		surpluses_index_1_nullifier = generalise(
			surpluses_index_1_nullifier.hex(32)
		); // truncate

		let latestSurplusSequenceNumber_nullifier =
			latestSurplusSequenceNumber_commitmentExists
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

		let sequenceNumberInterval_nullifier =
			sequenceNumberInterval_commitmentExists
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

		let generatorCfdNetPosition_billNumber_nullifier =
			generatorCfdNetPosition_billNumber_commitmentExists
				? poseidonHash([
						BigInt(generatorCfdNetPosition_billNumber_stateVarId),
						BigInt(secretKey.hex(32)),
						BigInt(generatorCfdNetPosition_billNumber_prevSalt.hex(32)),
				  ])
				: poseidonHash([
						BigInt(generatorCfdNetPosition_billNumber_stateVarId),
						BigInt(generalise(0).hex(32)),
						BigInt(generatorCfdNetPosition_billNumber_prevSalt.hex(32)),
				  ]);

		generatorCfdNetPosition_billNumber_nullifier = generalise(
			generatorCfdNetPosition_billNumber_nullifier.hex(32)
		); // truncate

		let offtakerCfdNetPosition_billNumber_nullifier =
			offtakerCfdNetPosition_billNumber_commitmentExists
				? poseidonHash([
						BigInt(offtakerCfdNetPosition_billNumber_stateVarId),
						BigInt(secretKey.hex(32)),
						BigInt(offtakerCfdNetPosition_billNumber_prevSalt.hex(32)),
				  ])
				: poseidonHash([
						BigInt(offtakerCfdNetPosition_billNumber_stateVarId),
						BigInt(generalise(0).hex(32)),
						BigInt(offtakerCfdNetPosition_billNumber_prevSalt.hex(32)),
				  ]);

		offtakerCfdNetPosition_billNumber_nullifier = generalise(
			offtakerCfdNetPosition_billNumber_nullifier.hex(32)
		); // truncate

		let generatorInterest_billNumber_nullifier =
			generatorInterest_billNumber_commitmentExists
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

		let offtakerInterest_billNumber_nullifier =
			offtakerInterest_billNumber_commitmentExists
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

		let offtakerNegativePriceCharges_billNumber_nullifier =
			offtakerNegativePriceCharges_billNumber_commitmentExists
				? poseidonHash([
						BigInt(offtakerNegativePriceCharges_billNumber_stateVarId),
						BigInt(secretKey.hex(32)),
						BigInt(offtakerNegativePriceCharges_billNumber_prevSalt.hex(32)),
				  ])
				: poseidonHash([
						BigInt(offtakerNegativePriceCharges_billNumber_stateVarId),
						BigInt(generalise(0).hex(32)),
						BigInt(offtakerNegativePriceCharges_billNumber_prevSalt.hex(32)),
				  ]);

		offtakerNegativePriceCharges_billNumber_nullifier = generalise(
			offtakerNegativePriceCharges_billNumber_nullifier.hex(32)
		); // truncate

		let generatorNegativePriceCharges_billNumber_nullifier =
			generatorNegativePriceCharges_billNumber_commitmentExists
				? poseidonHash([
						BigInt(generatorNegativePriceCharges_billNumber_stateVarId),
						BigInt(secretKey.hex(32)),
						BigInt(generatorNegativePriceCharges_billNumber_prevSalt.hex(32)),
				  ])
				: poseidonHash([
						BigInt(generatorNegativePriceCharges_billNumber_stateVarId),
						BigInt(generalise(0).hex(32)),
						BigInt(generatorNegativePriceCharges_billNumber_prevSalt.hex(32)),
				  ]);

		generatorNegativePriceCharges_billNumber_nullifier = generalise(
			generatorNegativePriceCharges_billNumber_nullifier.hex(32)
		); // truncate

		let numberOfConsecutivePeriodsForShortfall_nullifier =
			numberOfConsecutivePeriodsForShortfall_commitmentExists
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

		let shortfallPositiveChargeSum_nullifier =
			shortfallPositiveChargeSum_commitmentExists
				? poseidonHash([
						BigInt(shortfallPositiveChargeSum_stateVarId),
						BigInt(secretKey.hex(32)),
						BigInt(shortfallPositiveChargeSum_prevSalt.hex(32)),
				  ])
				: poseidonHash([
						BigInt(shortfallPositiveChargeSum_stateVarId),
						BigInt(generalise(0).hex(32)),
						BigInt(shortfallPositiveChargeSum_prevSalt.hex(32)),
				  ]);

		shortfallPositiveChargeSum_nullifier = generalise(
			shortfallPositiveChargeSum_nullifier.hex(32)
		); // truncate

		let shortfallNegativeChargeSum_nullifier =
			shortfallNegativeChargeSum_commitmentExists
				? poseidonHash([
						BigInt(shortfallNegativeChargeSum_stateVarId),
						BigInt(secretKey.hex(32)),
						BigInt(shortfallNegativeChargeSum_prevSalt.hex(32)),
				  ])
				: poseidonHash([
						BigInt(shortfallNegativeChargeSum_stateVarId),
						BigInt(generalise(0).hex(32)),
						BigInt(shortfallNegativeChargeSum_prevSalt.hex(32)),
				  ]);

		shortfallNegativeChargeSum_nullifier = generalise(
			shortfallNegativeChargeSum_nullifier.hex(32)
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

		let shortfallPositiveCharges_billNumber_nullifier =
			shortfallPositiveCharges_billNumber_commitmentExists
				? poseidonHash([
						BigInt(shortfallPositiveCharges_billNumber_stateVarId),
						BigInt(secretKey.hex(32)),
						BigInt(shortfallPositiveCharges_billNumber_prevSalt.hex(32)),
				  ])
				: poseidonHash([
						BigInt(shortfallPositiveCharges_billNumber_stateVarId),
						BigInt(generalise(0).hex(32)),
						BigInt(shortfallPositiveCharges_billNumber_prevSalt.hex(32)),
				  ]);

		shortfallPositiveCharges_billNumber_nullifier = generalise(
			shortfallPositiveCharges_billNumber_nullifier.hex(32)
		); // truncate

		let shortfallNegativeCharges_billNumber_nullifier =
			shortfallNegativeCharges_billNumber_commitmentExists
				? poseidonHash([
						BigInt(shortfallNegativeCharges_billNumber_stateVarId),
						BigInt(secretKey.hex(32)),
						BigInt(shortfallNegativeCharges_billNumber_prevSalt.hex(32)),
				  ])
				: poseidonHash([
						BigInt(shortfallNegativeCharges_billNumber_stateVarId),
						BigInt(generalise(0).hex(32)),
						BigInt(shortfallNegativeCharges_billNumber_prevSalt.hex(32)),
				  ]);

		shortfallNegativeCharges_billNumber_nullifier = generalise(
			shortfallNegativeCharges_billNumber_nullifier.hex(32)
		); // truncate

		let numberOfConsecutivePeriodsForSurplus_nullifier =
			numberOfConsecutivePeriodsForSurplus_commitmentExists
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

		let surplusPositiveChargeSum_nullifier =
			surplusPositiveChargeSum_commitmentExists
				? poseidonHash([
						BigInt(surplusPositiveChargeSum_stateVarId),
						BigInt(secretKey.hex(32)),
						BigInt(surplusPositiveChargeSum_prevSalt.hex(32)),
				  ])
				: poseidonHash([
						BigInt(surplusPositiveChargeSum_stateVarId),
						BigInt(generalise(0).hex(32)),
						BigInt(surplusPositiveChargeSum_prevSalt.hex(32)),
				  ]);

		surplusPositiveChargeSum_nullifier = generalise(
			surplusPositiveChargeSum_nullifier.hex(32)
		); // truncate

		let surplusNegativeChargeSum_nullifier =
			surplusNegativeChargeSum_commitmentExists
				? poseidonHash([
						BigInt(surplusNegativeChargeSum_stateVarId),
						BigInt(secretKey.hex(32)),
						BigInt(surplusNegativeChargeSum_prevSalt.hex(32)),
				  ])
				: poseidonHash([
						BigInt(surplusNegativeChargeSum_stateVarId),
						BigInt(generalise(0).hex(32)),
						BigInt(surplusNegativeChargeSum_prevSalt.hex(32)),
				  ]);

		surplusNegativeChargeSum_nullifier = generalise(
			surplusNegativeChargeSum_nullifier.hex(32)
		); // truncate

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

		let surplusPositiveCharges_billNumber_nullifier =
			surplusPositiveCharges_billNumber_commitmentExists
				? poseidonHash([
						BigInt(surplusPositiveCharges_billNumber_stateVarId),
						BigInt(secretKey.hex(32)),
						BigInt(surplusPositiveCharges_billNumber_prevSalt.hex(32)),
				  ])
				: poseidonHash([
						BigInt(surplusPositiveCharges_billNumber_stateVarId),
						BigInt(generalise(0).hex(32)),
						BigInt(surplusPositiveCharges_billNumber_prevSalt.hex(32)),
				  ]);

		surplusPositiveCharges_billNumber_nullifier = generalise(
			surplusPositiveCharges_billNumber_nullifier.hex(32)
		); // truncate

		let surplusNegativeCharges_billNumber_nullifier =
			surplusNegativeCharges_billNumber_commitmentExists
				? poseidonHash([
						BigInt(surplusNegativeCharges_billNumber_stateVarId),
						BigInt(secretKey.hex(32)),
						BigInt(surplusNegativeCharges_billNumber_prevSalt.hex(32)),
				  ])
				: poseidonHash([
						BigInt(surplusNegativeCharges_billNumber_stateVarId),
						BigInt(generalise(0).hex(32)),
						BigInt(surplusNegativeCharges_billNumber_prevSalt.hex(32)),
				  ]);

		surplusNegativeCharges_billNumber_nullifier = generalise(
			surplusNegativeCharges_billNumber_nullifier.hex(32)
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

		const latestShortfallSequenceNumber_newSalt = generalise(
			utils.randomHex(31)
		);

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

		const generatorCfdNetPosition_billNumber_newSalt = generalise(
			utils.randomHex(31)
		);

		let generatorCfdNetPosition_billNumber_newCommitment = poseidonHash([
			BigInt(generatorCfdNetPosition_billNumber_stateVarId),
			BigInt(generatorCfdNetPosition_billNumber.hex(32)),
			BigInt(generatorCfdNetPosition_billNumber_newOwnerPublicKey.hex(32)),
			BigInt(generatorCfdNetPosition_billNumber_newSalt.hex(32)),
		]);

		generatorCfdNetPosition_billNumber_newCommitment = generalise(
			generatorCfdNetPosition_billNumber_newCommitment.hex(32)
		); // truncate

		const offtakerCfdNetPosition_billNumber_newSalt = generalise(
			utils.randomHex(31)
		);

		let offtakerCfdNetPosition_billNumber_newCommitment = poseidonHash([
			BigInt(offtakerCfdNetPosition_billNumber_stateVarId),
			BigInt(offtakerCfdNetPosition_billNumber.hex(32)),
			BigInt(offtakerCfdNetPosition_billNumber_newOwnerPublicKey.hex(32)),
			BigInt(offtakerCfdNetPosition_billNumber_newSalt.hex(32)),
		]);

		offtakerCfdNetPosition_billNumber_newCommitment = generalise(
			offtakerCfdNetPosition_billNumber_newCommitment.hex(32)
		); // truncate

		const generatorInterest_billNumber_newSalt = generalise(
			utils.randomHex(31)
		);

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

		const offtakerNegativePriceCharges_billNumber_newSalt = generalise(
			utils.randomHex(31)
		);

		let offtakerNegativePriceCharges_billNumber_newCommitment = poseidonHash([
			BigInt(offtakerNegativePriceCharges_billNumber_stateVarId),
			BigInt(offtakerNegativePriceCharges_billNumber.hex(32)),
			BigInt(offtakerNegativePriceCharges_billNumber_newOwnerPublicKey.hex(32)),
			BigInt(offtakerNegativePriceCharges_billNumber_newSalt.hex(32)),
		]);

		offtakerNegativePriceCharges_billNumber_newCommitment = generalise(
			offtakerNegativePriceCharges_billNumber_newCommitment.hex(32)
		); // truncate

		const generatorNegativePriceCharges_billNumber_newSalt = generalise(
			utils.randomHex(31)
		);

		let generatorNegativePriceCharges_billNumber_newCommitment = poseidonHash([
			BigInt(generatorNegativePriceCharges_billNumber_stateVarId),
			BigInt(generatorNegativePriceCharges_billNumber.hex(32)),
			BigInt(
				generatorNegativePriceCharges_billNumber_newOwnerPublicKey.hex(32)
			),
			BigInt(generatorNegativePriceCharges_billNumber_newSalt.hex(32)),
		]);

		generatorNegativePriceCharges_billNumber_newCommitment = generalise(
			generatorNegativePriceCharges_billNumber_newCommitment.hex(32)
		); // truncate

		const shortfallPositiveChargeSum_newSalt = generalise(utils.randomHex(31));

		let shortfallPositiveChargeSum_newCommitment = poseidonHash([
			BigInt(shortfallPositiveChargeSum_stateVarId),
			BigInt(shortfallPositiveChargeSum.hex(32)),
			BigInt(shortfallPositiveChargeSum_newOwnerPublicKey.hex(32)),
			BigInt(shortfallPositiveChargeSum_newSalt.hex(32)),
		]);

		shortfallPositiveChargeSum_newCommitment = generalise(
			shortfallPositiveChargeSum_newCommitment.hex(32)
		); // truncate

		const shortfallNegativeChargeSum_newSalt = generalise(utils.randomHex(31));

		let shortfallNegativeChargeSum_newCommitment = poseidonHash([
			BigInt(shortfallNegativeChargeSum_stateVarId),
			BigInt(shortfallNegativeChargeSum.hex(32)),
			BigInt(shortfallNegativeChargeSum_newOwnerPublicKey.hex(32)),
			BigInt(shortfallNegativeChargeSum_newSalt.hex(32)),
		]);

		shortfallNegativeChargeSum_newCommitment = generalise(
			shortfallNegativeChargeSum_newCommitment.hex(32)
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

		const shortfallPositiveCharges_billNumber_newSalt = generalise(
			utils.randomHex(31)
		);

		let shortfallPositiveCharges_billNumber_newCommitment = poseidonHash([
			BigInt(shortfallPositiveCharges_billNumber_stateVarId),
			BigInt(shortfallPositiveCharges_billNumber.hex(32)),
			BigInt(shortfallPositiveCharges_billNumber_newOwnerPublicKey.hex(32)),
			BigInt(shortfallPositiveCharges_billNumber_newSalt.hex(32)),
		]);

		shortfallPositiveCharges_billNumber_newCommitment = generalise(
			shortfallPositiveCharges_billNumber_newCommitment.hex(32)
		); // truncate

		const shortfallNegativeCharges_billNumber_newSalt = generalise(
			utils.randomHex(31)
		);

		let shortfallNegativeCharges_billNumber_newCommitment = poseidonHash([
			BigInt(shortfallNegativeCharges_billNumber_stateVarId),
			BigInt(shortfallNegativeCharges_billNumber.hex(32)),
			BigInt(shortfallNegativeCharges_billNumber_newOwnerPublicKey.hex(32)),
			BigInt(shortfallNegativeCharges_billNumber_newSalt.hex(32)),
		]);

		shortfallNegativeCharges_billNumber_newCommitment = generalise(
			shortfallNegativeCharges_billNumber_newCommitment.hex(32)
		); // truncate

		const surplusPositiveChargeSum_newSalt = generalise(utils.randomHex(31));

		let surplusPositiveChargeSum_newCommitment = poseidonHash([
			BigInt(surplusPositiveChargeSum_stateVarId),
			BigInt(surplusPositiveChargeSum.hex(32)),
			BigInt(surplusPositiveChargeSum_newOwnerPublicKey.hex(32)),
			BigInt(surplusPositiveChargeSum_newSalt.hex(32)),
		]);

		surplusPositiveChargeSum_newCommitment = generalise(
			surplusPositiveChargeSum_newCommitment.hex(32)
		); // truncate

		const surplusNegativeChargeSum_newSalt = generalise(utils.randomHex(31));

		let surplusNegativeChargeSum_newCommitment = poseidonHash([
			BigInt(surplusNegativeChargeSum_stateVarId),
			BigInt(surplusNegativeChargeSum.hex(32)),
			BigInt(surplusNegativeChargeSum_newOwnerPublicKey.hex(32)),
			BigInt(surplusNegativeChargeSum_newSalt.hex(32)),
		]);

		surplusNegativeChargeSum_newCommitment = generalise(
			surplusNegativeChargeSum_newCommitment.hex(32)
		); // truncate

		const surplusIndex_newSalt = generalise(utils.randomHex(31));

		let surplusIndex_newCommitment = poseidonHash([
			BigInt(surplusIndex_stateVarId),
			BigInt(surplusIndex.hex(32)),
			BigInt(surplusIndex_newOwnerPublicKey.hex(32)),
			BigInt(surplusIndex_newSalt.hex(32)),
		]);

		surplusIndex_newCommitment = generalise(surplusIndex_newCommitment.hex(32)); // truncate

		const surplusPositiveCharges_billNumber_newSalt = generalise(
			utils.randomHex(31)
		);

		let surplusPositiveCharges_billNumber_newCommitment = poseidonHash([
			BigInt(surplusPositiveCharges_billNumber_stateVarId),
			BigInt(surplusPositiveCharges_billNumber.hex(32)),
			BigInt(surplusPositiveCharges_billNumber_newOwnerPublicKey.hex(32)),
			BigInt(surplusPositiveCharges_billNumber_newSalt.hex(32)),
		]);

		surplusPositiveCharges_billNumber_newCommitment = generalise(
			surplusPositiveCharges_billNumber_newCommitment.hex(32)
		); // truncate

		const surplusNegativeCharges_billNumber_newSalt = generalise(
			utils.randomHex(31)
		);

		let surplusNegativeCharges_billNumber_newCommitment = poseidonHash([
			BigInt(surplusNegativeCharges_billNumber_stateVarId),
			BigInt(surplusNegativeCharges_billNumber.hex(32)),
			BigInt(surplusNegativeCharges_billNumber_newOwnerPublicKey.hex(32)),
			BigInt(surplusNegativeCharges_billNumber_newSalt.hex(32)),
		]);

		surplusNegativeCharges_billNumber_newCommitment = generalise(
			surplusNegativeCharges_billNumber_newCommitment.hex(32)
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

			generatorCfdNetPosition_billNumber_commitmentExists
				? secretKey.integer
				: generalise(0).integer,
			generatorCfdNetPosition_billNumber_nullifier.integer,

			generatorCfdNetPosition_billNumber_prev.integer,
			generatorCfdNetPosition_billNumber_prevSalt.integer,
			generatorCfdNetPosition_billNumber_commitmentExists ? 0 : 1,

			generatorCfdNetPosition_billNumber_index.integer,
			generatorCfdNetPosition_billNumber_path.integer,
			generatorCfdNetPosition_billNumber_newOwnerPublicKey.integer,
			generatorCfdNetPosition_billNumber_newSalt.integer,
			generatorCfdNetPosition_billNumber_newCommitment.integer,
			offtakerCfdNetPosition_billNumber_commitmentExists
				? secretKey.integer
				: generalise(0).integer,
			offtakerCfdNetPosition_billNumber_nullifier.integer,

			offtakerCfdNetPosition_billNumber_prev.integer,
			offtakerCfdNetPosition_billNumber_prevSalt.integer,
			offtakerCfdNetPosition_billNumber_commitmentExists ? 0 : 1,

			offtakerCfdNetPosition_billNumber_index.integer,
			offtakerCfdNetPosition_billNumber_path.integer,
			offtakerCfdNetPosition_billNumber_newOwnerPublicKey.integer,
			offtakerCfdNetPosition_billNumber_newSalt.integer,
			offtakerCfdNetPosition_billNumber_newCommitment.integer,
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
			offtakerNegativePriceCharges_billNumber_commitmentExists
				? secretKey.integer
				: generalise(0).integer,
			offtakerNegativePriceCharges_billNumber_nullifier.integer,

			offtakerNegativePriceCharges_billNumber_prev.integer,
			offtakerNegativePriceCharges_billNumber_prevSalt.integer,
			offtakerNegativePriceCharges_billNumber_commitmentExists ? 0 : 1,

			offtakerNegativePriceCharges_billNumber_index.integer,
			offtakerNegativePriceCharges_billNumber_path.integer,
			offtakerNegativePriceCharges_billNumber_newOwnerPublicKey.integer,
			offtakerNegativePriceCharges_billNumber_newSalt.integer,
			offtakerNegativePriceCharges_billNumber_newCommitment.integer,
			generatorNegativePriceCharges_billNumber_commitmentExists
				? secretKey.integer
				: generalise(0).integer,
			generatorNegativePriceCharges_billNumber_nullifier.integer,

			generatorNegativePriceCharges_billNumber_prev.integer,
			generatorNegativePriceCharges_billNumber_prevSalt.integer,
			generatorNegativePriceCharges_billNumber_commitmentExists ? 0 : 1,

			generatorNegativePriceCharges_billNumber_index.integer,
			generatorNegativePriceCharges_billNumber_path.integer,
			generatorNegativePriceCharges_billNumber_newOwnerPublicKey.integer,
			generatorNegativePriceCharges_billNumber_newSalt.integer,
			generatorNegativePriceCharges_billNumber_newCommitment.integer,
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

			shortfallPositiveChargeSum_commitmentExists
				? secretKey.integer
				: generalise(0).integer,
			shortfallPositiveChargeSum_nullifier.integer,

			shortfallPositiveChargeSum_prev.integer,
			shortfallPositiveChargeSum_prevSalt.integer,
			shortfallPositiveChargeSum_commitmentExists ? 0 : 1,

			shortfallPositiveChargeSum_index.integer,
			shortfallPositiveChargeSum_path.integer,
			shortfallPositiveChargeSum_newOwnerPublicKey.integer,
			shortfallPositiveChargeSum_newSalt.integer,
			shortfallPositiveChargeSum_newCommitment.integer,
			shortfallNegativeChargeSum_commitmentExists
				? secretKey.integer
				: generalise(0).integer,
			shortfallNegativeChargeSum_nullifier.integer,

			shortfallNegativeChargeSum_prev.integer,
			shortfallNegativeChargeSum_prevSalt.integer,
			shortfallNegativeChargeSum_commitmentExists ? 0 : 1,

			shortfallNegativeChargeSum_index.integer,
			shortfallNegativeChargeSum_path.integer,
			shortfallNegativeChargeSum_newOwnerPublicKey.integer,
			shortfallNegativeChargeSum_newSalt.integer,
			shortfallNegativeChargeSum_newCommitment.integer,
			shortfallIndex_commitmentExists
				? secretKey.integer
				: generalise(0).integer,
			shortfallIndex_nullifier.integer,

			shortfallIndex_prev.integer,
			shortfallIndex_prevSalt.integer,
			shortfallIndex_commitmentExists ? 0 : 1,

			shortfallIndex_index.integer,
			shortfallIndex_path.integer,
			shortfallIndex_newOwnerPublicKey.integer,
			shortfallIndex_newSalt.integer,
			shortfallIndex_newCommitment.integer,
			shortfallPositiveCharges_billNumber_commitmentExists
				? secretKey.integer
				: generalise(0).integer,
			shortfallPositiveCharges_billNumber_nullifier.integer,

			shortfallPositiveCharges_billNumber_prev.integer,
			shortfallPositiveCharges_billNumber_prevSalt.integer,
			shortfallPositiveCharges_billNumber_commitmentExists ? 0 : 1,

			shortfallPositiveCharges_billNumber_index.integer,
			shortfallPositiveCharges_billNumber_path.integer,
			shortfallPositiveCharges_billNumber_newOwnerPublicKey.integer,
			shortfallPositiveCharges_billNumber_newSalt.integer,
			shortfallPositiveCharges_billNumber_newCommitment.integer,
			shortfallNegativeCharges_billNumber_commitmentExists
				? secretKey.integer
				: generalise(0).integer,
			shortfallNegativeCharges_billNumber_nullifier.integer,

			shortfallNegativeCharges_billNumber_prev.integer,
			shortfallNegativeCharges_billNumber_prevSalt.integer,
			shortfallNegativeCharges_billNumber_commitmentExists ? 0 : 1,

			shortfallNegativeCharges_billNumber_index.integer,
			shortfallNegativeCharges_billNumber_path.integer,
			shortfallNegativeCharges_billNumber_newOwnerPublicKey.integer,
			shortfallNegativeCharges_billNumber_newSalt.integer,
			shortfallNegativeCharges_billNumber_newCommitment.integer,
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

			surplusPositiveChargeSum_commitmentExists
				? secretKey.integer
				: generalise(0).integer,
			surplusPositiveChargeSum_nullifier.integer,

			surplusPositiveChargeSum_prev.integer,
			surplusPositiveChargeSum_prevSalt.integer,
			surplusPositiveChargeSum_commitmentExists ? 0 : 1,

			surplusPositiveChargeSum_index.integer,
			surplusPositiveChargeSum_path.integer,
			surplusPositiveChargeSum_newOwnerPublicKey.integer,
			surplusPositiveChargeSum_newSalt.integer,
			surplusPositiveChargeSum_newCommitment.integer,
			surplusNegativeChargeSum_commitmentExists
				? secretKey.integer
				: generalise(0).integer,
			surplusNegativeChargeSum_nullifier.integer,

			surplusNegativeChargeSum_prev.integer,
			surplusNegativeChargeSum_prevSalt.integer,
			surplusNegativeChargeSum_commitmentExists ? 0 : 1,

			surplusNegativeChargeSum_index.integer,
			surplusNegativeChargeSum_path.integer,
			surplusNegativeChargeSum_newOwnerPublicKey.integer,
			surplusNegativeChargeSum_newSalt.integer,
			surplusNegativeChargeSum_newCommitment.integer,
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
			surplusPositiveCharges_billNumber_commitmentExists
				? secretKey.integer
				: generalise(0).integer,
			surplusPositiveCharges_billNumber_nullifier.integer,

			surplusPositiveCharges_billNumber_prev.integer,
			surplusPositiveCharges_billNumber_prevSalt.integer,
			surplusPositiveCharges_billNumber_commitmentExists ? 0 : 1,

			surplusPositiveCharges_billNumber_index.integer,
			surplusPositiveCharges_billNumber_path.integer,
			surplusPositiveCharges_billNumber_newOwnerPublicKey.integer,
			surplusPositiveCharges_billNumber_newSalt.integer,
			surplusPositiveCharges_billNumber_newCommitment.integer,
			surplusNegativeCharges_billNumber_commitmentExists
				? secretKey.integer
				: generalise(0).integer,
			surplusNegativeCharges_billNumber_nullifier.integer,

			surplusNegativeCharges_billNumber_prev.integer,
			surplusNegativeCharges_billNumber_prevSalt.integer,
			surplusNegativeCharges_billNumber_commitmentExists ? 0 : 1,

			surplusNegativeCharges_billNumber_index.integer,
			surplusNegativeCharges_billNumber_path.integer,
			surplusNegativeCharges_billNumber_newOwnerPublicKey.integer,
			surplusNegativeCharges_billNumber_newSalt.integer,
			surplusNegativeCharges_billNumber_newCommitment.integer,
		].flat(Infinity);

		console.log(allInputs.join(' '));

		const res = await generateProof("calculateCfd", allInputs);
		const proof = generalise(Object.values(res.proof).flat(Infinity))
			.map((coeff) => coeff.integer)
			.flat(Infinity);

		let BackupData = [];

		// Encrypt pre-image for state variable shortfalls_index as a backup:

				const shortfalls_index_bcipherText = encrypt(
			[
				BigInt(shortfalls_index_newSalt.hex(32)),
				BigInt(generalise(index).hex(32)),
				BigInt(generalise(shortfalls_index_stateVarIdInit).hex(32)),
				BigInt(shortfalls_index.billNumber.hex(32)),
				BigInt(shortfalls_index.volume.hex(32)),
				BigInt(shortfalls_index.price.hex(32)),
			],
			masterZkpSecretKey.hex(32),
			[
				decompressStarlightKey(masterZkpPublicKey)[0].hex(32),
				decompressStarlightKey(masterZkpPublicKey)[1].hex(32),
			]
		);

		let shortfalls_index_cipherText_combined = {
			varName: "shortfalls a",
			cipherText: shortfalls_index_bcipherText,
			ephPublicKey: masterZkpPublicKey.hex(32),
		};

		BackupData.push(shortfalls_index_cipherText_combined);

		// Encrypt pre-image for state variable latestShortfallSequenceNumber as a backup:

		const latestShortfallSequenceNumber_bcipherText = encrypt(
			[
				BigInt(latestShortfallSequenceNumber_newSalt.hex(32)),
				BigInt(latestShortfallSequenceNumber_stateVarId),
				BigInt(latestShortfallSequenceNumber.hex(32)),
			],
			masterZkpSecretKey.hex(32),
			[
				decompressStarlightKey(masterZkpPublicKey)[0].hex(32),
				decompressStarlightKey(masterZkpPublicKey)[1].hex(32),
			]
		);

		let latestShortfallSequenceNumber_cipherText_combined = {
			varName: "latestShortfallSequenceNumber",
			cipherText: latestShortfallSequenceNumber_bcipherText,
			ephPublicKey: masterZkpSecretKey.hex(32),
		};

		BackupData.push(latestShortfallSequenceNumber_cipherText_combined);

		// Encrypt pre-image for state variable surpluses_index_1 as a backup:


		const surpluses_index_1_bcipherText = encrypt(
			[
				BigInt(surpluses_index_1_newSalt.hex(32)),
				BigInt(generalise(index).hex(32)),
				BigInt(generalise(surpluses_index_1_stateVarIdInit).hex(32)),
				BigInt(surpluses_index_1.billNumber.hex(32)),
				BigInt(surpluses_index_1.volume.hex(32)),
				BigInt(surpluses_index_1.price.hex(32)),
			],
			masterZkpSecretKey.hex(32),
			[
				decompressStarlightKey(masterZkpPublicKey)[0].hex(32),
				decompressStarlightKey(masterZkpPublicKey)[1].hex(32),
			]
		);

		let surpluses_index_1_cipherText_combined = {
			varName: "surpluses a",
			cipherText: surpluses_index_1_bcipherText,
			ephPublicKey: masterZkpPublicKey.hex(32),
		};

		BackupData.push(surpluses_index_1_cipherText_combined);

		// Encrypt pre-image for state variable latestSurplusSequenceNumber as a backup:

		
		const latestSurplusSequenceNumber_bcipherText = encrypt(
			[
				BigInt(latestSurplusSequenceNumber_newSalt.hex(32)),
				BigInt(latestSurplusSequenceNumber_stateVarId),
				BigInt(latestSurplusSequenceNumber.hex(32)),
			],
			masterZkpSecretKey.hex(32),
			[
				decompressStarlightKey(masterZkpPublicKey)[0].hex(32),
				decompressStarlightKey(masterZkpPublicKey)[1].hex(32),
			]
		);

		let latestSurplusSequenceNumber_cipherText_combined = {
			varName: "latestSurplusSequenceNumber",
			cipherText: latestSurplusSequenceNumber_bcipherText,
			ephPublicKey: masterZkpPublicKey.hex(32),
		};

		BackupData.push(latestSurplusSequenceNumber_cipherText_combined);

		// Encrypt pre-image for state variable generatorCfdNetPosition_billNumber as a backup:

		const generatorCfdNetPosition_billNumber_bcipherText = encrypt(
			[
				BigInt(generatorCfdNetPosition_billNumber_newSalt.hex(32)),
				BigInt(generalise(billNumber).hex(32)),
				BigInt(
					generalise(generatorCfdNetPosition_billNumber_stateVarIdInit).hex(32)
				),
				BigInt(generatorCfdNetPosition_billNumber.hex(32)),
			],
			masterZkpSecretKey.hex(32),
			[
				decompressStarlightKey(masterZkpPublicKey)[0].hex(32),
				decompressStarlightKey(masterZkpPublicKey)[1].hex(32),
			]
		);

		let generatorCfdNetPosition_billNumber_cipherText_combined = {
			varName: "generatorCfdNetPosition a",
			cipherText: generatorCfdNetPosition_billNumber_bcipherText,
			ephPublicKey: masterZkpPublicKey.hex(32),
		};

		BackupData.push(generatorCfdNetPosition_billNumber_cipherText_combined);

		// Encrypt pre-image for state variable offtakerCfdNetPosition_billNumber as a backup:

		const offtakerCfdNetPosition_billNumber_bcipherText = encrypt(
			[
				BigInt(offtakerCfdNetPosition_billNumber_newSalt.hex(32)),
				BigInt(generalise(billNumber).hex(32)),
				BigInt(
					generalise(offtakerCfdNetPosition_billNumber_stateVarIdInit).hex(32)
				),
				BigInt(offtakerCfdNetPosition_billNumber.hex(32)),
			],
			masterZkpSecretKey.hex(32),
			[
				decompressStarlightKey(masterZkpPublicKey)[0].hex(32),
				decompressStarlightKey(masterZkpPublicKey)[1].hex(32),
			]
		);

		let offtakerCfdNetPosition_billNumber_cipherText_combined = {
			varName: "offtakerCfdNetPosition a",
			cipherText: offtakerCfdNetPosition_billNumber_bcipherText,
			ephPublicKey: masterZkpPublicKey.hex(32),
		};

		BackupData.push(offtakerCfdNetPosition_billNumber_cipherText_combined);

		// Encrypt pre-image for state variable generatorInterest_billNumber as a backup:

		const generatorInterest_billNumber_bcipherText = encrypt(
			[
				BigInt(generatorInterest_billNumber_newSalt.hex(32)),
				BigInt(generalise(billNumber).hex(32)),
				BigInt(generalise(generatorInterest_billNumber_stateVarIdInit).hex(32)),
				BigInt(generatorInterest_billNumber.hex(32)),
			],
			masterZkpSecretKey.hex(32),
			[
				decompressStarlightKey(masterZkpPublicKey)[0].hex(32),
				decompressStarlightKey(masterZkpPublicKey)[1].hex(32),
			]
		);

		let generatorInterest_billNumber_cipherText_combined = {
			varName: "generatorInterest a",
			cipherText: generatorInterest_billNumber_bcipherText,
			ephPublicKey: masterZkpPublicKey.hex(32),
		};

		BackupData.push(generatorInterest_billNumber_cipherText_combined);

		// Encrypt pre-image for state variable offtakerInterest_billNumber as a backup:

		

		const offtakerInterest_billNumber_bcipherText = encrypt(
			[
				BigInt(offtakerInterest_billNumber_newSalt.hex(32)),
				BigInt(generalise(billNumber).hex(32)),
				BigInt(generalise(offtakerInterest_billNumber_stateVarIdInit).hex(32)),
				BigInt(offtakerInterest_billNumber.hex(32)),
			],
			masterZkpSecretKey.hex(32),
			[
				decompressStarlightKey(masterZkpPublicKey)[0].hex(32),
				decompressStarlightKey(masterZkpPublicKey)[1].hex(32),
			]
		);

		let offtakerInterest_billNumber_cipherText_combined = {
			varName: "offtakerInterest a",
			cipherText: offtakerInterest_billNumber_bcipherText,
			ephPublicKey: masterZkpPublicKey.hex(32),
		};

		BackupData.push(offtakerInterest_billNumber_cipherText_combined);

		// Encrypt pre-image for state variable offtakerNegativePriceCharges_billNumber as a backup:


		const offtakerNegativePriceCharges_billNumber_bcipherText = encrypt(
			[
				BigInt(offtakerNegativePriceCharges_billNumber_newSalt.hex(32)),
				BigInt(generalise(billNumber).hex(32)),
				BigInt(
					generalise(
						offtakerNegativePriceCharges_billNumber_stateVarIdInit
					).hex(32)
				),
				BigInt(offtakerNegativePriceCharges_billNumber.hex(32)),
			],
			masterZkpSecretKey.hex(32),
			[
				decompressStarlightKey(masterZkpPublicKey)[0].hex(32),
				decompressStarlightKey(masterZkpPublicKey)[1].hex(32),
			]
		);

		let offtakerNegativePriceCharges_billNumber_cipherText_combined = {
			varName: "offtakerNegativePriceCharges a",
			cipherText: offtakerNegativePriceCharges_billNumber_bcipherText,
			ephPublicKey:
				masterZkpPublicKey.hex(32),
		};

		BackupData.push(
			offtakerNegativePriceCharges_billNumber_cipherText_combined
		);

		// Encrypt pre-image for state variable generatorNegativePriceCharges_billNumber as a backup:

		const generatorNegativePriceCharges_billNumber_bcipherText = encrypt(
			[
				BigInt(generatorNegativePriceCharges_billNumber_newSalt.hex(32)),
				BigInt(generalise(billNumber).hex(32)),
				BigInt(
					generalise(
						generatorNegativePriceCharges_billNumber_stateVarIdInit
					).hex(32)
				),
				BigInt(generatorNegativePriceCharges_billNumber.hex(32)),
			],
			masterZkpSecretKey.hex(32),
			[
				decompressStarlightKey(masterZkpPublicKey)[0].hex(32),
				decompressStarlightKey(masterZkpPublicKey)[1].hex(32),
			]
		);

		let generatorNegativePriceCharges_billNumber_cipherText_combined = {
			varName: "generatorNegativePriceCharges a",
			cipherText: generatorNegativePriceCharges_billNumber_bcipherText,
			ephPublicKey:
				masterZkpPublicKey.hex(32),
		};

		BackupData.push(
			generatorNegativePriceCharges_billNumber_cipherText_combined
		);

		// Encrypt pre-image for state variable shortfallPositiveChargeSum as a backup:

		const shortfallPositiveChargeSum_bcipherText = encrypt(
			[
				BigInt(shortfallPositiveChargeSum_newSalt.hex(32)),
				BigInt(shortfallPositiveChargeSum_stateVarId),
				BigInt(shortfallPositiveChargeSum.hex(32)),
			],
			masterZkpSecretKey.hex(32),
			[
				decompressStarlightKey(masterZkpPublicKey)[0].hex(32),
				decompressStarlightKey(masterZkpPublicKey)[1].hex(32),
			]
		);

		let shortfallPositiveChargeSum_cipherText_combined = {
			varName: "shortfallPositiveChargeSum",
			cipherText: shortfallPositiveChargeSum_bcipherText,
			ephPublicKey: masterZkpPublicKey.hex(32),
		};

		BackupData.push(shortfallPositiveChargeSum_cipherText_combined);

		// Encrypt pre-image for state variable shortfallNegativeChargeSum as a backup:

		const shortfallNegativeChargeSum_bcipherText = encrypt(
			[
				BigInt(shortfallNegativeChargeSum_newSalt.hex(32)),
				BigInt(shortfallNegativeChargeSum_stateVarId),
				BigInt(shortfallNegativeChargeSum.hex(32)),
			],
			masterZkpSecretKey.hex(32),
			[
				decompressStarlightKey(masterZkpPublicKey)[0].hex(32),
				decompressStarlightKey(masterZkpPublicKey)[1].hex(32),
			]
		);

		let shortfallNegativeChargeSum_cipherText_combined = {
			varName: "shortfallNegativeChargeSum",
			cipherText: shortfallNegativeChargeSum_bcipherText,
			ephPublicKey: masterZkpPublicKey.hex(32),
		};

		BackupData.push(shortfallNegativeChargeSum_cipherText_combined);

		// Encrypt pre-image for state variable shortfallIndex as a backup:

		const shortfallIndex_bcipherText = encrypt(
			[
				BigInt(shortfallIndex_newSalt.hex(32)),
				BigInt(shortfallIndex_stateVarId),
				BigInt(shortfallIndex.hex(32)),
			],
			masterZkpSecretKey.hex(32),
			[
				decompressStarlightKey(masterZkpPublicKey)[0].hex(32),
				decompressStarlightKey(masterZkpPublicKey)[1].hex(32),
			]
		);

		let shortfallIndex_cipherText_combined = {
			varName: "shortfallIndex",
			cipherText: shortfallIndex_bcipherText,
			ephPublicKey: masterZkpPublicKey.hex(32),
		};

		BackupData.push(shortfallIndex_cipherText_combined);

		// Encrypt pre-image for state variable shortfallPositiveCharges_billNumber as a backup:

		const shortfallPositiveCharges_billNumber_bcipherText = encrypt(
			[
				BigInt(shortfallPositiveCharges_billNumber_newSalt.hex(32)),
				BigInt(generalise(billNumber).hex(32)),
				BigInt(
					generalise(shortfallPositiveCharges_billNumber_stateVarIdInit).hex(32)
				),
				BigInt(shortfallPositiveCharges_billNumber.hex(32)),
			],
			masterZkpSecretKey.hex(32),
			[
				decompressStarlightKey(masterZkpPublicKey)[0].hex(32),
				decompressStarlightKey(masterZkpPublicKey)[1].hex(32),
			]
		);

		let shortfallPositiveCharges_billNumber_cipherText_combined = {
			varName: "shortfallPositiveCharges a",
			cipherText: shortfallPositiveCharges_billNumber_bcipherText,
			ephPublicKey: masterZkpPublicKey.hex(32),
		};

		BackupData.push(shortfallPositiveCharges_billNumber_cipherText_combined);

		// Encrypt pre-image for state variable shortfallNegativeCharges_billNumber as a backup:

		const shortfallNegativeCharges_billNumber_bcipherText = encrypt(
			[
				BigInt(shortfallNegativeCharges_billNumber_newSalt.hex(32)),
				BigInt(generalise(billNumber).hex(32)),
				BigInt(
					generalise(shortfallNegativeCharges_billNumber_stateVarIdInit).hex(32)
				),
				BigInt(shortfallNegativeCharges_billNumber.hex(32)),
			],
			masterZkpSecretKey.hex(32),
			[
				decompressStarlightKey(masterZkpPublicKey)[0].hex(32),
				decompressStarlightKey(masterZkpPublicKey)[1].hex(32),
			]
		);

		let shortfallNegativeCharges_billNumber_cipherText_combined = {
			varName: "shortfallNegativeCharges a",
			cipherText: shortfallNegativeCharges_billNumber_bcipherText,
			ephPublicKey: masterZkpPublicKey.hex(32),
		};

		BackupData.push(shortfallNegativeCharges_billNumber_cipherText_combined);

		// Encrypt pre-image for state variable surplusPositiveChargeSum as a backup:

		const surplusPositiveChargeSum_bcipherText = encrypt(
			[
				BigInt(surplusPositiveChargeSum_newSalt.hex(32)),
				BigInt(surplusPositiveChargeSum_stateVarId),
				BigInt(surplusPositiveChargeSum.hex(32)),
			],
			masterZkpSecretKey.hex(32),
			[
				decompressStarlightKey(masterZkpPublicKey)[0].hex(32),
				decompressStarlightKey(masterZkpPublicKey)[1].hex(32),
			]
		);

		let surplusPositiveChargeSum_cipherText_combined = {
			varName: "surplusPositiveChargeSum",
			cipherText: surplusPositiveChargeSum_bcipherText,
			ephPublicKey: masterZkpPublicKey.hex(32),
		};

		BackupData.push(surplusPositiveChargeSum_cipherText_combined);

		// Encrypt pre-image for state variable surplusNegativeChargeSum as a backup:

		const surplusNegativeChargeSum_bcipherText = encrypt(
			[
				BigInt(surplusNegativeChargeSum_newSalt.hex(32)),
				BigInt(surplusNegativeChargeSum_stateVarId),
				BigInt(surplusNegativeChargeSum.hex(32)),
			],
			masterZkpSecretKey.hex(32),
			[
				decompressStarlightKey(masterZkpPublicKey)[0].hex(32),
				decompressStarlightKey(masterZkpPublicKey)[1].hex(32),
			]
		);

		let surplusNegativeChargeSum_cipherText_combined = {
			varName: "surplusNegativeChargeSum",
			cipherText: surplusNegativeChargeSum_bcipherText,
			ephPublicKey: masterZkpPublicKey.hex(32),
		};

		BackupData.push(surplusNegativeChargeSum_cipherText_combined);

		// Encrypt pre-image for state variable surplusIndex as a backup:

		const surplusIndex_bcipherText = encrypt(
			[
				BigInt(surplusIndex_newSalt.hex(32)),
				BigInt(surplusIndex_stateVarId),
				BigInt(surplusIndex.hex(32)),
			],
			masterZkpSecretKey.hex(32),
			[
				decompressStarlightKey(masterZkpPublicKey)[0].hex(32),
				decompressStarlightKey(masterZkpPublicKey)[1].hex(32),
			]
		);

		let surplusIndex_cipherText_combined = {
			varName: "surplusIndex",
			cipherText: surplusIndex_bcipherText,
			ephPublicKey: masterZkpPublicKey.hex(32),
		};

		BackupData.push(surplusIndex_cipherText_combined);

		// Encrypt pre-image for state variable surplusPositiveCharges_billNumber as a backup:

		const surplusPositiveCharges_billNumber_bcipherText = encrypt(
			[
				BigInt(surplusPositiveCharges_billNumber_newSalt.hex(32)),
				BigInt(generalise(billNumber).hex(32)),
				BigInt(
					generalise(surplusPositiveCharges_billNumber_stateVarIdInit).hex(32)
				),
				BigInt(surplusPositiveCharges_billNumber.hex(32)),
			],
			masterZkpSecretKey.hex(32),
			[
				decompressStarlightKey(masterZkpPublicKey)[0].hex(32),
				decompressStarlightKey(masterZkpPublicKey)[1].hex(32),
			]
		);

		let surplusPositiveCharges_billNumber_cipherText_combined = {
			varName: "surplusPositiveCharges a",
			cipherText: surplusPositiveCharges_billNumber_bcipherText,
			ephPublicKey: masterZkpPublicKey.hex(32),
		};

		BackupData.push(surplusPositiveCharges_billNumber_cipherText_combined);

		// Encrypt pre-image for state variable surplusNegativeCharges_billNumber as a backup:

		const surplusNegativeCharges_billNumber_bcipherText = encrypt(
			[
				BigInt(surplusNegativeCharges_billNumber_newSalt.hex(32)),
				BigInt(generalise(billNumber).hex(32)),
				BigInt(
					generalise(surplusNegativeCharges_billNumber_stateVarIdInit).hex(32)
				),
				BigInt(surplusNegativeCharges_billNumber.hex(32)),
			],
			masterZkpSecretKey.hex(32),
			[
				decompressStarlightKey(masterZkpPublicKey)[0].hex(32),
				decompressStarlightKey(masterZkpPublicKey)[1].hex(32),
			].hex(32),
		);

		let surplusNegativeCharges_billNumber_cipherText_combined = {
			varName: "surplusNegativeCharges a",
			cipherText: surplusNegativeCharges_billNumber_bcipherText,
			ephPublicKey: masterZkpPublicKey.hex(32),
		};

		BackupData.push(surplusNegativeCharges_billNumber_cipherText_combined);

		// Send transaction to the blockchain:

		const txData = await instance.methods
			.calculateCfd(
				{
					customInputs: [
						generatorCfdNetPosition_billNumber_newCommitment,
						offtakerCfdNetPosition_billNumber_newCommitment,
						generatorInterest_billNumber_newCommitment,
						offtakerInterest_billNumber_newCommitment,
						shortfallPositiveCharges_billNumber_newCommitment,
						shortfallNegativeCharges_billNumber_newCommitment,
						surplusPositiveCharges_billNumber_newCommitment,
						surplusNegativeCharges_billNumber_newCommitment,
						generatorNegativePriceCharges_billNumber_newCommitment,
						offtakerNegativePriceCharges_billNumber_newCommitment,
					],
					newNullifiers: [
						shortfalls_index_nullifier.integer,
						latestShortfallSequenceNumber_nullifier.integer,
						surpluses_index_1_nullifier.integer,
						latestSurplusSequenceNumber_nullifier.integer,
						generatorCfdNetPosition_billNumber_nullifier.integer,
						offtakerCfdNetPosition_billNumber_nullifier.integer,
						generatorInterest_billNumber_nullifier.integer,
						offtakerInterest_billNumber_nullifier.integer,
						offtakerNegativePriceCharges_billNumber_nullifier.integer,
						generatorNegativePriceCharges_billNumber_nullifier.integer,
						shortfallPositiveChargeSum_nullifier.integer,
						shortfallNegativeChargeSum_nullifier.integer,
						shortfallIndex_nullifier.integer,
						shortfallPositiveCharges_billNumber_nullifier.integer,
						shortfallNegativeCharges_billNumber_nullifier.integer,
						surplusPositiveChargeSum_nullifier.integer,
						surplusNegativeChargeSum_nullifier.integer,
						surplusIndex_nullifier.integer,
						surplusPositiveCharges_billNumber_nullifier.integer,
						surplusNegativeCharges_billNumber_nullifier.integer,
					],
					commitmentRoot: strikePrice_root.integer,
					checkNullifiers: [
						strikePrice_nullifier.integer,
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
					newCommitments: [
						shortfalls_index_newCommitment.integer,
						latestShortfallSequenceNumber_newCommitment.integer,
						surpluses_index_1_newCommitment.integer,
						latestSurplusSequenceNumber_newCommitment.integer,
						generatorCfdNetPosition_billNumber_newCommitment.integer,
						offtakerCfdNetPosition_billNumber_newCommitment.integer,
						generatorInterest_billNumber_newCommitment.integer,
						offtakerInterest_billNumber_newCommitment.integer,
						offtakerNegativePriceCharges_billNumber_newCommitment.integer,
						generatorNegativePriceCharges_billNumber_newCommitment.integer,
						shortfallPositiveChargeSum_newCommitment.integer,
						shortfallNegativeChargeSum_newCommitment.integer,
						shortfallIndex_newCommitment.integer,
						shortfallPositiveCharges_billNumber_newCommitment.integer,
						shortfallNegativeCharges_billNumber_newCommitment.integer,
						surplusPositiveChargeSum_newCommitment.integer,
						surplusNegativeChargeSum_newCommitment.integer,
						surplusIndex_newCommitment.integer,
						surplusPositiveCharges_billNumber_newCommitment.integer,
						surplusNegativeCharges_billNumber_newCommitment.integer,
					],
					cipherText: [],
					encKeys: [],
				},
				proof,
				BackupData
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

		let encBackupEvent = "";

		try {
			encBackupEvent = await instance.getPastEvents("EncryptedBackupData");
		} catch (err) {
			console.log("No encrypted backup event");
		}

		// Write new commitment preimage to db:

		if (shortfalls_index_commitmentExists)
			await markNullified(
				shortfalls_index_currentCommitment,
				secretKey.hex(32)
			);

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
			name: "surpluses",
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

		if (generatorCfdNetPosition_billNumber_commitmentExists)
			await markNullified(
				generatorCfdNetPosition_billNumber_currentCommitment,
				secretKey.hex(32)
			);

		await storeCommitment({
			hash: generatorCfdNetPosition_billNumber_newCommitment,
			name: "generatorCfdNetPosition",
			mappingKey: generatorCfdNetPosition_billNumber_stateVarId_key.integer,
			preimage: {
				stateVarId: generalise(generatorCfdNetPosition_billNumber_stateVarId),
				value: generatorCfdNetPosition_billNumber,
				salt: generatorCfdNetPosition_billNumber_newSalt,
				publicKey: generatorCfdNetPosition_billNumber_newOwnerPublicKey,
			},
			secretKey:
				generatorCfdNetPosition_billNumber_newOwnerPublicKey.integer ===
				publicKey.integer
					? secretKey
					: null,
			isNullified: false,
		});

		if (offtakerCfdNetPosition_billNumber_commitmentExists)
			await markNullified(
				offtakerCfdNetPosition_billNumber_currentCommitment,
				secretKey.hex(32)
			);

		await storeCommitment({
			hash: offtakerCfdNetPosition_billNumber_newCommitment,
			name: "offtakerCfdNetPosition",
			mappingKey: offtakerCfdNetPosition_billNumber_stateVarId_key.integer,
			preimage: {
				stateVarId: generalise(offtakerCfdNetPosition_billNumber_stateVarId),
				value: offtakerCfdNetPosition_billNumber,
				salt: offtakerCfdNetPosition_billNumber_newSalt,
				publicKey: offtakerCfdNetPosition_billNumber_newOwnerPublicKey,
			},
			secretKey:
				offtakerCfdNetPosition_billNumber_newOwnerPublicKey.integer ===
				publicKey.integer
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

		if (offtakerNegativePriceCharges_billNumber_commitmentExists)
			await markNullified(
				offtakerNegativePriceCharges_billNumber_currentCommitment,
				secretKey.hex(32)
			);

		await storeCommitment({
			hash: offtakerNegativePriceCharges_billNumber_newCommitment,
			name: "offtakerNegativePriceCharges",
			mappingKey:
				offtakerNegativePriceCharges_billNumber_stateVarId_key.integer,
			preimage: {
				stateVarId: generalise(
					offtakerNegativePriceCharges_billNumber_stateVarId
				),
				value: offtakerNegativePriceCharges_billNumber,
				salt: offtakerNegativePriceCharges_billNumber_newSalt,
				publicKey: offtakerNegativePriceCharges_billNumber_newOwnerPublicKey,
			},
			secretKey:
				offtakerNegativePriceCharges_billNumber_newOwnerPublicKey.integer ===
				publicKey.integer
					? secretKey
					: null,
			isNullified: false,
		});

		if (generatorNegativePriceCharges_billNumber_commitmentExists)
			await markNullified(
				generatorNegativePriceCharges_billNumber_currentCommitment,
				secretKey.hex(32)
			);

		await storeCommitment({
			hash: generatorNegativePriceCharges_billNumber_newCommitment,
			name: "generatorNegativePriceCharges",
			mappingKey:
				generatorNegativePriceCharges_billNumber_stateVarId_key.integer,
			preimage: {
				stateVarId: generalise(
					generatorNegativePriceCharges_billNumber_stateVarId
				),
				value: generatorNegativePriceCharges_billNumber,
				salt: generatorNegativePriceCharges_billNumber_newSalt,
				publicKey: generatorNegativePriceCharges_billNumber_newOwnerPublicKey,
			},
			secretKey:
				generatorNegativePriceCharges_billNumber_newOwnerPublicKey.integer ===
				publicKey.integer
					? secretKey
					: null,
			isNullified: false,
		});

		if (shortfallPositiveChargeSum_commitmentExists)
			await markNullified(
				shortfallPositiveChargeSum_currentCommitment,
				secretKey.hex(32)
			);

		await storeCommitment({
			hash: shortfallPositiveChargeSum_newCommitment,
			name: "shortfallPositiveChargeSum",
			mappingKey: null,
			preimage: {
				stateVarId: generalise(shortfallPositiveChargeSum_stateVarId),
				value: shortfallPositiveChargeSum,
				salt: shortfallPositiveChargeSum_newSalt,
				publicKey: shortfallPositiveChargeSum_newOwnerPublicKey,
			},
			secretKey:
				shortfallPositiveChargeSum_newOwnerPublicKey.integer ===
				publicKey.integer
					? secretKey
					: null,
			isNullified: false,
		});

		if (shortfallNegativeChargeSum_commitmentExists)
			await markNullified(
				shortfallNegativeChargeSum_currentCommitment,
				secretKey.hex(32)
			);

		await storeCommitment({
			hash: shortfallNegativeChargeSum_newCommitment,
			name: "shortfallNegativeChargeSum",
			mappingKey: null,
			preimage: {
				stateVarId: generalise(shortfallNegativeChargeSum_stateVarId),
				value: shortfallNegativeChargeSum,
				salt: shortfallNegativeChargeSum_newSalt,
				publicKey: shortfallNegativeChargeSum_newOwnerPublicKey,
			},
			secretKey:
				shortfallNegativeChargeSum_newOwnerPublicKey.integer ===
				publicKey.integer
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

		if (shortfallPositiveCharges_billNumber_commitmentExists)
			await markNullified(
				shortfallPositiveCharges_billNumber_currentCommitment,
				secretKey.hex(32)
			);

		await storeCommitment({
			hash: shortfallPositiveCharges_billNumber_newCommitment,
			name: "shortfallPositiveCharges",
			mappingKey: shortfallPositiveCharges_billNumber_stateVarId_key.integer,
			preimage: {
				stateVarId: generalise(shortfallPositiveCharges_billNumber_stateVarId),
				value: shortfallPositiveCharges_billNumber,
				salt: shortfallPositiveCharges_billNumber_newSalt,
				publicKey: shortfallPositiveCharges_billNumber_newOwnerPublicKey,
			},
			secretKey:
				shortfallPositiveCharges_billNumber_newOwnerPublicKey.integer ===
				publicKey.integer
					? secretKey
					: null,
			isNullified: false,
		});

		if (shortfallNegativeCharges_billNumber_commitmentExists)
			await markNullified(
				shortfallNegativeCharges_billNumber_currentCommitment,
				secretKey.hex(32)
			);

		await storeCommitment({
			hash: shortfallNegativeCharges_billNumber_newCommitment,
			name: "shortfallNegativeCharges",
			mappingKey: shortfallNegativeCharges_billNumber_stateVarId_key.integer,
			preimage: {
				stateVarId: generalise(shortfallNegativeCharges_billNumber_stateVarId),
				value: shortfallNegativeCharges_billNumber,
				salt: shortfallNegativeCharges_billNumber_newSalt,
				publicKey: shortfallNegativeCharges_billNumber_newOwnerPublicKey,
			},
			secretKey:
				shortfallNegativeCharges_billNumber_newOwnerPublicKey.integer ===
				publicKey.integer
					? secretKey
					: null,
			isNullified: false,
		});

		if (surplusPositiveChargeSum_commitmentExists)
			await markNullified(
				surplusPositiveChargeSum_currentCommitment,
				secretKey.hex(32)
			);

		await storeCommitment({
			hash: surplusPositiveChargeSum_newCommitment,
			name: "surplusPositiveChargeSum",
			mappingKey: null,
			preimage: {
				stateVarId: generalise(surplusPositiveChargeSum_stateVarId),
				value: surplusPositiveChargeSum,
				salt: surplusPositiveChargeSum_newSalt,
				publicKey: surplusPositiveChargeSum_newOwnerPublicKey,
			},
			secretKey:
				surplusPositiveChargeSum_newOwnerPublicKey.integer === publicKey.integer
					? secretKey
					: null,
			isNullified: false,
		});

		if (surplusNegativeChargeSum_commitmentExists)
			await markNullified(
				surplusNegativeChargeSum_currentCommitment,
				secretKey.hex(32)
			);

		await storeCommitment({
			hash: surplusNegativeChargeSum_newCommitment,
			name: "surplusNegativeChargeSum",
			mappingKey: null,
			preimage: {
				stateVarId: generalise(surplusNegativeChargeSum_stateVarId),
				value: surplusNegativeChargeSum,
				salt: surplusNegativeChargeSum_newSalt,
				publicKey: surplusNegativeChargeSum_newOwnerPublicKey,
			},
			secretKey:
				surplusNegativeChargeSum_newOwnerPublicKey.integer === publicKey.integer
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

		if (surplusPositiveCharges_billNumber_commitmentExists)
			await markNullified(
				surplusPositiveCharges_billNumber_currentCommitment,
				secretKey.hex(32)
			);

		await storeCommitment({
			hash: surplusPositiveCharges_billNumber_newCommitment,
			name: "surplusPositiveCharges",
			mappingKey: surplusPositiveCharges_billNumber_stateVarId_key.integer,
			preimage: {
				stateVarId: generalise(surplusPositiveCharges_billNumber_stateVarId),
				value: surplusPositiveCharges_billNumber,
				salt: surplusPositiveCharges_billNumber_newSalt,
				publicKey: surplusPositiveCharges_billNumber_newOwnerPublicKey,
			},
			secretKey:
				surplusPositiveCharges_billNumber_newOwnerPublicKey.integer ===
				publicKey.integer
					? secretKey
					: null,
			isNullified: false,
		});

		if (surplusNegativeCharges_billNumber_commitmentExists)
			await markNullified(
				surplusNegativeCharges_billNumber_currentCommitment,
				secretKey.hex(32)
			);

		await storeCommitment({
			hash: surplusNegativeCharges_billNumber_newCommitment,
			name: "surplusNegativeCharges",
			mappingKey: surplusNegativeCharges_billNumber_stateVarId_key.integer,
			preimage: {
				stateVarId: generalise(surplusNegativeCharges_billNumber_stateVarId),
				value: surplusNegativeCharges_billNumber,
				salt: surplusNegativeCharges_billNumber_newSalt,
				publicKey: surplusNegativeCharges_billNumber_newOwnerPublicKey,
			},
			secretKey:
				surplusNegativeCharges_billNumber_newOwnerPublicKey.integer ===
				publicKey.integer
					? secretKey
					: null,
			isNullified: false,
		});

		return {
			tx,
			encEvent,
			encBackupEvent,
			generatorCfdNetPosition_billNumber_newCommitmentValue:
				generatorCfdNetPosition_billNumber.integer,
			offtakerCfdNetPosition_billNumber_newCommitmentValue:
				offtakerCfdNetPosition_billNumber.integer,
			generatorInterest_billNumber_newCommitmentValue:
				generatorInterest_billNumber.integer,
			offtakerInterest_billNumber_newCommitmentValue:
				offtakerInterest_billNumber.integer,
			shortfallPositiveCharges_billNumber_newCommitmentValue:
				shortfallPositiveCharges_billNumber.integer,
			shortfallNegativeCharges_billNumber_newCommitmentValue:
				shortfallNegativeCharges_billNumber.integer,
			surplusPositiveCharges_billNumber_newCommitmentValue:
				surplusPositiveCharges_billNumber.integer,
			surplusNegativeCharges_billNumber_newCommitmentValue:
				surplusNegativeCharges_billNumber.integer,
			generatorNegativePriceCharges_billNumber_newCommitmentValue:
				generatorNegativePriceCharges_billNumber.integer,
			offtakerNegativePriceCharges_billNumber_newCommitmentValue:
				offtakerNegativePriceCharges_billNumber.integer,
		};
	}
}
