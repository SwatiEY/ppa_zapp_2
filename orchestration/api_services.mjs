/* eslint-disable prettier/prettier, camelcase, prefer-const, no-unused-vars */
import config from "config";
import assert from "assert";

import calculateCfd from "./calculateCfd.mjs";

import setInitialContractParams from "./setInitialContractParams.mjs";

import initSurplusSequenceNumber from "./initSurplusSequenceNumber.mjs";

import initSequenceNumber from "./initSequenceNumber.mjs";

import setSequenceNumberInterval from "./setSequenceNumberInterval.mjs";

import setVolumeShare from "./setVolumeShare.mjs";

import setExpiryDateOfContract from "./setExpiryDateOfContract.mjs";

import setDailyInterestRate from "./setDailyInterestRate.mjs";

import setSurplusPeriods from "./setSurplusPeriods.mjs";

import setSurplusThreshold from "./setSurplusThreshold.mjs";

import setShortfallPeriods from "./setShortfallPeriods.mjs";

import setShortfallThreshold from "./setShortfallThreshold.mjs";

import setBundlePrice from "./setBundlePrice.mjs";

import setStrikePrice from "./setStrikePrice.mjs";

import { startEventFilter, getSiblingPath} from "./common/timber.mjs";
import { getContractInstance } from "./common/contract.mjs";
import fs from "fs";
import logger from "./common/logger.mjs";
import { decrypt } from "./common/number-theory.mjs";
import {
	getAllCommitments,
	getCommitmentsByState,
	reinstateNullifiers,
} from "./common/commitment-storage.mjs";
import web3 from "./common/web3.mjs";

/**
      NOTE: this is the api service file, if you need to call any function use the correct url and if Your input contract has two functions, add() and minus().
      minus() cannot be called before an initial add(). */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let leafIndex;
let encryption = {};
// eslint-disable-next-line func-names

export async function SyntheticPpaShield() {
	try {
		await web3.connect();
	} catch (err) {
		throw new Error(err);
	}
}
// eslint-disable-next-line func-names
export async function service_setStrikePrice(req, res, next) {
	try {
		await web3.connect();
		await new Promise((resolve) => setTimeout(() => resolve(), 3000));
	} catch (err) {
		throw new Error(err);
	}
	try {
		await startEventFilter("SyntheticPpaShield");
		const { strikePriceParam } = req.body;
		const strikePrice_newOwnerPublicKey =
			req.body.strikePrice_newOwnerPublicKey || 0;
		const { tx, encEvent } = await setStrikePrice(
			strikePriceParam,
			strikePrice_newOwnerPublicKey
		);
		// prints the tx
		console.log(tx);
		res.send({ tx, encEvent });
		// reassigns leafIndex to the index of the first commitment added by this function
		if (tx.event) {
			leafIndex = tx.returnValues[0];
			// prints the new leaves (commitments) added by this function call
			console.log(`Merkle tree event returnValues:`);
			console.log(tx.returnValues);
		}
		if (encEvent.event) {
			encryption.msgs = encEvent[0].returnValues[0];
			encryption.key = encEvent[0].returnValues[1];
			console.log("EncryptedMsgs:");
			console.log(encEvent[0].returnValues[0]);
		}
		await sleep(10);
	} catch (err) {
		logger.error(err);
		res.send({ errors: [err.message] });
	}
}

// eslint-disable-next-line func-names
export async function service_setBundlePrice(req, res, next) {
	try {
		await web3.connect();
		await new Promise((resolve) => setTimeout(() => resolve(), 3000));
	} catch (err) {
		throw new Error(err);
	}
	try {
		await startEventFilter("SyntheticPpaShield");
		const { bundlePriceParam } = req.body;
		const bundlePrice_newOwnerPublicKey =
			req.body.bundlePrice_newOwnerPublicKey || 0;
		const { tx, encEvent } = await setBundlePrice(
			bundlePriceParam,
			bundlePrice_newOwnerPublicKey
		);
		// prints the tx
		console.log(tx);
		res.send({ tx, encEvent });
		// reassigns leafIndex to the index of the first commitment added by this function
		if (tx.event) {
			leafIndex = tx.returnValues[0];
			// prints the new leaves (commitments) added by this function call
			console.log(`Merkle tree event returnValues:`);
			console.log(tx.returnValues);
		}
		if (encEvent.event) {
			encryption.msgs = encEvent[0].returnValues[0];
			encryption.key = encEvent[0].returnValues[1];
			console.log("EncryptedMsgs:");
			console.log(encEvent[0].returnValues[0]);
		}
		await sleep(10);
	} catch (err) {
		logger.error(err);
		res.send({ errors: [err.message] });
	}
}

// eslint-disable-next-line func-names
export async function service_setShortfallThreshold(req, res, next) {
	try {
		await web3.connect();
		await new Promise((resolve) => setTimeout(() => resolve(), 3000));
	} catch (err) {
		throw new Error(err);
	}
	try {
		await startEventFilter("SyntheticPpaShield");
		const { shortfallThresholdParam } = req.body;
		const shortfallThreshold_newOwnerPublicKey =
			req.body.shortfallThreshold_newOwnerPublicKey || 0;
		const { tx, encEvent } = await setShortfallThreshold(
			shortfallThresholdParam,
			shortfallThreshold_newOwnerPublicKey
		);
		// prints the tx
		console.log(tx);
		res.send({ tx, encEvent });
		// reassigns leafIndex to the index of the first commitment added by this function
		if (tx.event) {
			leafIndex = tx.returnValues[0];
			// prints the new leaves (commitments) added by this function call
			console.log(`Merkle tree event returnValues:`);
			console.log(tx.returnValues);
		}
		if (encEvent.event) {
			encryption.msgs = encEvent[0].returnValues[0];
			encryption.key = encEvent[0].returnValues[1];
			console.log("EncryptedMsgs:");
			console.log(encEvent[0].returnValues[0]);
		}
		await sleep(10);
	} catch (err) {
		logger.error(err);
		res.send({ errors: [err.message] });
	}
}

// eslint-disable-next-line func-names
export async function service_setShortfallPeriods(req, res, next) {
	try {
		await web3.connect();
		await new Promise((resolve) => setTimeout(() => resolve(), 3000));
	} catch (err) {
		throw new Error(err);
	}
	try {
		await startEventFilter("SyntheticPpaShield");
		const { shortfallPeriods } = req.body;
		const numberOfConsecutivePeriodsForShortfall_newOwnerPublicKey =
			req.body.numberOfConsecutivePeriodsForShortfall_newOwnerPublicKey || 0;
		const { tx, encEvent } = await setShortfallPeriods(
			shortfallPeriods,
			numberOfConsecutivePeriodsForShortfall_newOwnerPublicKey
		);
		// prints the tx
		console.log(tx);
		res.send({ tx, encEvent });
		// reassigns leafIndex to the index of the first commitment added by this function
		if (tx.event) {
			leafIndex = tx.returnValues[0];
			// prints the new leaves (commitments) added by this function call
			console.log(`Merkle tree event returnValues:`);
			console.log(tx.returnValues);
		}
		if (encEvent.event) {
			encryption.msgs = encEvent[0].returnValues[0];
			encryption.key = encEvent[0].returnValues[1];
			console.log("EncryptedMsgs:");
			console.log(encEvent[0].returnValues[0]);
		}
		await sleep(10);
	} catch (err) {
		logger.error(err);
		res.send({ errors: [err.message] });
	}
}

// eslint-disable-next-line func-names
export async function service_setSurplusThreshold(req, res, next) {
	try {
		await web3.connect();
		await new Promise((resolve) => setTimeout(() => resolve(), 3000));
	} catch (err) {
		throw new Error(err);
	}
	try {
		await startEventFilter("SyntheticPpaShield");
		const { surplusThresholdParam } = req.body;
		const surplusThreshold_newOwnerPublicKey =
			req.body.surplusThreshold_newOwnerPublicKey || 0;
		const { tx, encEvent } = await setSurplusThreshold(
			surplusThresholdParam,
			surplusThreshold_newOwnerPublicKey
		);
		// prints the tx
		console.log(tx);
		res.send({ tx, encEvent });
		// reassigns leafIndex to the index of the first commitment added by this function
		if (tx.event) {
			leafIndex = tx.returnValues[0];
			// prints the new leaves (commitments) added by this function call
			console.log(`Merkle tree event returnValues:`);
			console.log(tx.returnValues);
		}
		if (encEvent.event) {
			encryption.msgs = encEvent[0].returnValues[0];
			encryption.key = encEvent[0].returnValues[1];
			console.log("EncryptedMsgs:");
			console.log(encEvent[0].returnValues[0]);
		}
		await sleep(10);
	} catch (err) {
		logger.error(err);
		res.send({ errors: [err.message] });
	}
}

// eslint-disable-next-line func-names
export async function service_setSurplusPeriods(req, res, next) {
	try {
		await web3.connect();
		await new Promise((resolve) => setTimeout(() => resolve(), 3000));
	} catch (err) {
		throw new Error(err);
	}
	try {
		await startEventFilter("SyntheticPpaShield");
		const { surplusPeriods } = req.body;
		const numberOfConsecutivePeriodsForSurplus_newOwnerPublicKey =
			req.body.numberOfConsecutivePeriodsForSurplus_newOwnerPublicKey || 0;
		const { tx, encEvent } = await setSurplusPeriods(
			surplusPeriods,
			numberOfConsecutivePeriodsForSurplus_newOwnerPublicKey
		);
		// prints the tx
		console.log(tx);
		res.send({ tx, encEvent });
		// reassigns leafIndex to the index of the first commitment added by this function
		if (tx.event) {
			leafIndex = tx.returnValues[0];
			// prints the new leaves (commitments) added by this function call
			console.log(`Merkle tree event returnValues:`);
			console.log(tx.returnValues);
		}
		if (encEvent.event) {
			encryption.msgs = encEvent[0].returnValues[0];
			encryption.key = encEvent[0].returnValues[1];
			console.log("EncryptedMsgs:");
			console.log(encEvent[0].returnValues[0]);
		}
		await sleep(10);
	} catch (err) {
		logger.error(err);
		res.send({ errors: [err.message] });
	}
}

// eslint-disable-next-line func-names
export async function service_setDailyInterestRate(req, res, next) {
	try {
		await web3.connect();
		await new Promise((resolve) => setTimeout(() => resolve(), 3000));
	} catch (err) {
		throw new Error(err);
	}
	try {
		await startEventFilter("SyntheticPpaShield");
		const { dailyInterestRateParam } = req.body;
		const dailyInterestRate_newOwnerPublicKey =
			req.body.dailyInterestRate_newOwnerPublicKey || 0;
		const { tx, encEvent } = await setDailyInterestRate(
			dailyInterestRateParam,
			dailyInterestRate_newOwnerPublicKey
		);
		// prints the tx
		console.log(tx);
		res.send({ tx, encEvent });
		// reassigns leafIndex to the index of the first commitment added by this function
		if (tx.event) {
			leafIndex = tx.returnValues[0];
			// prints the new leaves (commitments) added by this function call
			console.log(`Merkle tree event returnValues:`);
			console.log(tx.returnValues);
		}
		if (encEvent.event) {
			encryption.msgs = encEvent[0].returnValues[0];
			encryption.key = encEvent[0].returnValues[1];
			console.log("EncryptedMsgs:");
			console.log(encEvent[0].returnValues[0]);
		}
		await sleep(10);
	} catch (err) {
		logger.error(err);
		res.send({ errors: [err.message] });
	}
}

// eslint-disable-next-line func-names
export async function service_setExpiryDateOfContract(req, res, next) {
	try {
		await web3.connect();
		await new Promise((resolve) => setTimeout(() => resolve(), 3000));
	} catch (err) {
		throw new Error(err);
	}
	try {
		await startEventFilter("SyntheticPpaShield");
		const { expiryDateOfContractParam } = req.body;
		const expiryDateOfContract_newOwnerPublicKey =
			req.body.expiryDateOfContract_newOwnerPublicKey || 0;
		const { tx, encEvent } = await setExpiryDateOfContract(
			expiryDateOfContractParam,
			expiryDateOfContract_newOwnerPublicKey
		);
		// prints the tx
		console.log(tx);
		res.send({ tx, encEvent });
		// reassigns leafIndex to the index of the first commitment added by this function
		if (tx.event) {
			leafIndex = tx.returnValues[0];
			// prints the new leaves (commitments) added by this function call
			console.log(`Merkle tree event returnValues:`);
			console.log(tx.returnValues);
		}
		if (encEvent.event) {
			encryption.msgs = encEvent[0].returnValues[0];
			encryption.key = encEvent[0].returnValues[1];
			console.log("EncryptedMsgs:");
			console.log(encEvent[0].returnValues[0]);
		}
		await sleep(10);
	} catch (err) {
		logger.error(err);
		res.send({ errors: [err.message] });
	}
}

// eslint-disable-next-line func-names
export async function service_setVolumeShare(req, res, next) {
	try {
		await web3.connect();
		await new Promise((resolve) => setTimeout(() => resolve(), 3000));
	} catch (err) {
		throw new Error(err);
	}
	try {
		await startEventFilter("SyntheticPpaShield");
		const { volumeShareParam } = req.body;
		const volumeShare_newOwnerPublicKey =
			req.body.volumeShare_newOwnerPublicKey || 0;
		const { tx, encEvent } = await setVolumeShare(
			volumeShareParam,
			volumeShare_newOwnerPublicKey
		);
		// prints the tx
		console.log(tx);
		res.send({ tx, encEvent });
		// reassigns leafIndex to the index of the first commitment added by this function
		if (tx.event) {
			leafIndex = tx.returnValues[0];
			// prints the new leaves (commitments) added by this function call
			console.log(`Merkle tree event returnValues:`);
			console.log(tx.returnValues);
		}
		if (encEvent.event) {
			encryption.msgs = encEvent[0].returnValues[0];
			encryption.key = encEvent[0].returnValues[1];
			console.log("EncryptedMsgs:");
			console.log(encEvent[0].returnValues[0]);
		}
		await sleep(10);
	} catch (err) {
		logger.error(err);
		res.send({ errors: [err.message] });
	}
}

// eslint-disable-next-line func-names
export async function service_setSequenceNumberInterval(req, res, next) {
	try {
		await web3.connect();
		await new Promise((resolve) => setTimeout(() => resolve(), 3000));
	} catch (err) {
		throw new Error(err);
	}
	try {
		await startEventFilter("SyntheticPpaShield");
		const { sequenceNumberIntervalParam } = req.body;
		const sequenceNumberInterval_newOwnerPublicKey =
			req.body.sequenceNumberInterval_newOwnerPublicKey || 0;
		const { tx, encEvent } = await setSequenceNumberInterval(
			sequenceNumberIntervalParam,
			sequenceNumberInterval_newOwnerPublicKey
		);
		// prints the tx
		console.log(tx);
		res.send({ tx, encEvent });
		// reassigns leafIndex to the index of the first commitment added by this function
		if (tx.event) {
			leafIndex = tx.returnValues[0];
			// prints the new leaves (commitments) added by this function call
			console.log(`Merkle tree event returnValues:`);
			console.log(tx.returnValues);
		}
		if (encEvent.event) {
			encryption.msgs = encEvent[0].returnValues[0];
			encryption.key = encEvent[0].returnValues[1];
			console.log("EncryptedMsgs:");
			console.log(encEvent[0].returnValues[0]);
		}
		await sleep(10);
	} catch (err) {
		logger.error(err);
		res.send({ errors: [err.message] });
	}
}

// eslint-disable-next-line func-names
export async function service_initSequenceNumber(req, res, next) {
	try {
		await web3.connect();
		await new Promise((resolve) => setTimeout(() => resolve(), 3000));
	} catch (err) {
		throw new Error(err);
	}
	try {
		await startEventFilter("SyntheticPpaShield");
		const latestShortfallSequenceNumber_newOwnerPublicKey =
			req.body.latestShortfallSequenceNumber_newOwnerPublicKey || 0;
		const { tx, encEvent } = await initSequenceNumber(
			latestShortfallSequenceNumber_newOwnerPublicKey
		);
		// prints the tx
		console.log(tx);
		res.send({ tx, encEvent });
		// reassigns leafIndex to the index of the first commitment added by this function
		if (tx.event) {
			leafIndex = tx.returnValues[0];
			// prints the new leaves (commitments) added by this function call
			console.log(`Merkle tree event returnValues:`);
			console.log(tx.returnValues);
		}
		if (encEvent.event) {
			encryption.msgs = encEvent[0].returnValues[0];
			encryption.key = encEvent[0].returnValues[1];
			console.log("EncryptedMsgs:");
			console.log(encEvent[0].returnValues[0]);
		}
		await sleep(10);
	} catch (err) {
		logger.error(err);
		res.send({ errors: [err.message] });
	}
}

// eslint-disable-next-line func-names
export async function service_initSurplusSequenceNumber(req, res, next) {
	try {
		await web3.connect();
		await new Promise((resolve) => setTimeout(() => resolve(), 3000));
	} catch (err) {
		throw new Error(err);
	}
	try {
		await startEventFilter("SyntheticPpaShield");
		const latestSurplusSequenceNumber_newOwnerPublicKey =
			req.body.latestSurplusSequenceNumber_newOwnerPublicKey || 0;
		const { tx, encEvent } = await initSurplusSequenceNumber(
			latestSurplusSequenceNumber_newOwnerPublicKey
		);
		// prints the tx
		console.log(tx);
		res.send({ tx, encEvent });
		// reassigns leafIndex to the index of the first commitment added by this function
		if (tx.event) {
			leafIndex = tx.returnValues[0];
			// prints the new leaves (commitments) added by this function call
			console.log(`Merkle tree event returnValues:`);
			console.log(tx.returnValues);
		}
		if (encEvent.event) {
			encryption.msgs = encEvent[0].returnValues[0];
			encryption.key = encEvent[0].returnValues[1];
			console.log("EncryptedMsgs:");
			console.log(encEvent[0].returnValues[0]);
		}
		await sleep(10);
	} catch (err) {
		logger.error(err);
		res.send({ errors: [err.message] });
	}
}

// eslint-disable-next-line func-names
export async function service_setInitialContractParams(req, res, next) {
	try {
		await web3.connect();
		await new Promise((resolve) => setTimeout(() => resolve(), 3000));
	} catch (err) {
		throw new Error(err);
	}
	try {
		await startEventFilter("SyntheticPpaShield");
		const { strikePriceParam } = req.body;
		const { bundlePriceParam } = req.body;
		const { volumeShareParam } = req.body;
		const { numberOfConsecutivePeriodsForShortfallParam } = req.body;
		const { shortfallThresholdParam } = req.body;
		const { numberOfConsecutivePeriodsForSurplusParam } = req.body;
		const { surplusThresholdParam } = req.body;
		const { dailyInterestRateParam } = req.body;
		const { expiryDateOfContractParam } = req.body;
		const { sequenceNumberIntervalParam } = req.body;
		const { referenceDate } = req.body;
		const strikePrice_newOwnerPublicKey =
			req.body.strikePrice_newOwnerPublicKey || 0;
		const bundlePrice_newOwnerPublicKey =
			req.body.bundlePrice_newOwnerPublicKey || 0;
		const volumeShare_newOwnerPublicKey =
			req.body.volumeShare_newOwnerPublicKey || 0;
		const dailyInterestRate_newOwnerPublicKey =
			req.body.dailyInterestRate_newOwnerPublicKey || 0;
		const expiryDateOfContract_newOwnerPublicKey =
			req.body.expiryDateOfContract_newOwnerPublicKey || 0;
		const latestShortfallSequenceNumber_newOwnerPublicKey =
			req.body.latestShortfallSequenceNumber_newOwnerPublicKey || 0;
		const latestSurplusSequenceNumber_newOwnerPublicKey =
			req.body.latestSurplusSequenceNumber_newOwnerPublicKey || 0;
		const sequenceNumberInterval_newOwnerPublicKey =
			req.body.sequenceNumberInterval_newOwnerPublicKey || 0;
		const numberOfConsecutivePeriodsForShortfall_newOwnerPublicKey =
			req.body.numberOfConsecutivePeriodsForShortfall_newOwnerPublicKey || 0;
		const shortfallThreshold_newOwnerPublicKey =
			req.body.shortfallThreshold_newOwnerPublicKey || 0;
		const numberOfConsecutivePeriodsForSurplus_newOwnerPublicKey =
			req.body.numberOfConsecutivePeriodsForSurplus_newOwnerPublicKey || 0;
		const surplusThreshold_newOwnerPublicKey =
			req.body.surplusThreshold_newOwnerPublicKey || 0;
		const { tx, encEvent } = await setInitialContractParams(
			strikePriceParam,
			bundlePriceParam,
			volumeShareParam,
			numberOfConsecutivePeriodsForShortfallParam,
			shortfallThresholdParam,
			numberOfConsecutivePeriodsForSurplusParam,
			surplusThresholdParam,
			dailyInterestRateParam,
			expiryDateOfContractParam,
			sequenceNumberIntervalParam,
			referenceDate,
			strikePrice_newOwnerPublicKey,
			bundlePrice_newOwnerPublicKey,
			volumeShare_newOwnerPublicKey,
			dailyInterestRate_newOwnerPublicKey,
			expiryDateOfContract_newOwnerPublicKey,
			latestShortfallSequenceNumber_newOwnerPublicKey,
			latestSurplusSequenceNumber_newOwnerPublicKey,
			sequenceNumberInterval_newOwnerPublicKey,
			numberOfConsecutivePeriodsForShortfall_newOwnerPublicKey,
			shortfallThreshold_newOwnerPublicKey,
			numberOfConsecutivePeriodsForSurplus_newOwnerPublicKey,
			surplusThreshold_newOwnerPublicKey
		);
		// prints the tx
		console.log(tx);
		res.send({ tx, encEvent });
		// reassigns leafIndex to the index of the first commitment added by this function
		if (tx.event) {
			leafIndex = tx.returnValues[0];
			// prints the new leaves (commitments) added by this function call
			console.log(`Merkle tree event returnValues:`);
			console.log(tx.returnValues);
		}
		if (encEvent.event) {
			encryption.msgs = encEvent[0].returnValues[0];
			encryption.key = encEvent[0].returnValues[1];
			console.log("EncryptedMsgs:");
			console.log(encEvent[0].returnValues[0]);
		}
		await sleep(10);
	} catch (err) {
		logger.error(err);
		res.send({ errors: [err.message] });
	}
}

// eslint-disable-next-line func-names
export async function service_calculateCfd(req, res, next) {
	try {
		await web3.connect();
		await new Promise((resolve) => setTimeout(() => resolve(), 3000));
	} catch (err) {
		throw new Error(err);
	}
	try {
		await startEventFilter("SyntheticPpaShield");
		const { billNumber } = req.body;
		const { sequenceNumber } = req.body;
		const { totalGeneratedVolume } = req.body;
		const { expectedVolume } = req.body;
		const { averagePrice } = req.body;
		const { marginalLossFactor } = req.body;
		const { floatingAmount } = req.body;
		const { positiveAdjustment } = req.body;
		const { negativeAdjustment } = req.body;
		const { outstandingGeneratorAmount } = req.body;
		const { outstandingOfftakerAmount } = req.body;
		const { generatorDelayDays } = req.body;
		const { offtakerDelayDays } = req.body;
		const { referenceDate } = req.body;
		const strikePrice_newOwnerPublicKey =
			req.body.strikePrice_newOwnerPublicKey || 0;
		const shortfalls_index_newOwnerPublicKey =
			req.body.shortfalls_index_newOwnerPublicKey || 0;
		const latestShortfallSequenceNumber_newOwnerPublicKey =
			req.body.latestShortfallSequenceNumber_newOwnerPublicKey || 0;
		const surplus_tempSurplusIndex_newOwnerPublicKey =
			req.body.surplus_tempSurplusIndex_newOwnerPublicKey || 0;
		const latestSurplusSequenceNumber_newOwnerPublicKey =
			req.body.latestSurplusSequenceNumber_newOwnerPublicKey || 0;
		const generatorCharges_billNumber_newOwnerPublicKey =
			req.body.generatorCharges_billNumber_newOwnerPublicKey || 0;
		const offtakerCharges_billNumber_newOwnerPublicKey =
			req.body.offtakerCharges_billNumber_newOwnerPublicKey || 0;
		const generatorInterest_billNumber_newOwnerPublicKey =
			req.body.generatorInterest_billNumber_newOwnerPublicKey || 0;
		const offtakerInterest_billNumber_newOwnerPublicKey =
			req.body.offtakerInterest_billNumber_newOwnerPublicKey || 0;
		const negativePriceCharges_billNumber_newOwnerPublicKey =
			req.body.negativePriceCharges_billNumber_newOwnerPublicKey || 0;
		const shortfallThreshold_newOwnerPublicKey =
			req.body.shortfallThreshold_newOwnerPublicKey || 0;
		const shortfallChargeSum_newOwnerPublicKey =
			req.body.shortfallChargeSum_newOwnerPublicKey || 0;
		const shortfallIndex_newOwnerPublicKey =
			req.body.shortfallIndex_newOwnerPublicKey || 0;
		const shortfallCharges_billNumber_newOwnerPublicKey =
			req.body.shortfallCharges_billNumber_newOwnerPublicKey || 0;
		const surplusThreshold_newOwnerPublicKey =
			req.body.surplusThreshold_newOwnerPublicKey || 0;
		const surplusChargeSum_newOwnerPublicKey =
			req.body.surplusChargeSum_newOwnerPublicKey || 0;
		const surplusIndex_newOwnerPublicKey =
			req.body.surplusIndex_newOwnerPublicKey || 0;
		const surplusCharges_billNumber_newOwnerPublicKey =
			req.body.surplusCharges_billNumber_newOwnerPublicKey || 0;
		const {
			tx,
			encEvent,
			generatorCharges_billNumber_newCommitment,
			offtakerCharges_billNumber_newCommitment,
			generatorInterest_billNumber_newCommitment,
			offtakerInterest_billNumber_newCommitment,
			shortfallCharges_billNumber_newCommitment,
			surplusCharges_billNumber_newCommitment,
			negativePriceCharges_billNumber_newCommitment,
		} = await calculateCfd(
			billNumber,
			sequenceNumber,
			totalGeneratedVolume,
			expectedVolume,
			averagePrice,
			marginalLossFactor,
			floatingAmount,
			positiveAdjustment,
			negativeAdjustment,
			outstandingGeneratorAmount,
			outstandingOfftakerAmount,
			generatorDelayDays,
			offtakerDelayDays,
			referenceDate,
			strikePrice_newOwnerPublicKey,
			shortfalls_index_newOwnerPublicKey,
			latestShortfallSequenceNumber_newOwnerPublicKey,
			surplus_tempSurplusIndex_newOwnerPublicKey,
			latestSurplusSequenceNumber_newOwnerPublicKey,
			generatorCharges_billNumber_newOwnerPublicKey,
			offtakerCharges_billNumber_newOwnerPublicKey,
			generatorInterest_billNumber_newOwnerPublicKey,
			offtakerInterest_billNumber_newOwnerPublicKey,
			negativePriceCharges_billNumber_newOwnerPublicKey,
			shortfallThreshold_newOwnerPublicKey,
			shortfallChargeSum_newOwnerPublicKey,
			shortfallIndex_newOwnerPublicKey,
			shortfallCharges_billNumber_newOwnerPublicKey,
			surplusThreshold_newOwnerPublicKey,
			surplusChargeSum_newOwnerPublicKey,
			surplusIndex_newOwnerPublicKey,
			surplusCharges_billNumber_newOwnerPublicKey
		);
		// prints the tx
		console.log(tx);
		res.send({
			tx,
			encEvent,
			generatorCharges_billNumber_newCommitment,
			offtakerCharges_billNumber_newCommitment,
			generatorInterest_billNumber_newCommitment,
			offtakerInterest_billNumber_newCommitment,
			shortfallCharges_billNumber_newCommitment,
			surplusCharges_billNumber_newCommitment,
			negativePriceCharges_billNumber_newCommitment,
		});
		// reassigns leafIndex to the index of the first commitment added by this function
		if (tx.event) {
			leafIndex = tx.returnValues[0];
			// prints the new leaves (commitments) added by this function call
			console.log(`Merkle tree event returnValues:`);
			console.log(tx.returnValues);
		}
		if (encEvent.event) {
			encryption.msgs = encEvent[0].returnValues[0];
			encryption.key = encEvent[0].returnValues[1];
			console.log("EncryptedMsgs:");
			console.log(encEvent[0].returnValues[0]);
		}
		await sleep(10);
	} catch (err) {
		logger.error(err);
		res.send({ errors: [err.message] });
	}
}

export async function service_allCommitments(req, res, next) {
	try {
		const commitments = await getAllCommitments();
		res.send({ commitments });
		await sleep(10);
	} catch (err) {
		logger.error(err);
		res.send({ errors: [err.message] });
	}
}

export async function service_getCommitmentsByState(req, res, next) {
	try {
		const { name, mappingKey } = req.body;
		const commitments = await getCommitmentsByState(name, mappingKey);
		res.send({ commitments });
		await sleep(10);
	} catch (err) {
		logger.error(err);
		res.send({ errors: [err.message] });
	}
}



export async function service_terminateContract(req, res, next) {
	try {
			await web3.connect();;
			const instance = await getContractInstance("SyntheticPpaShield");
			await instance.methods.terminateContract().send( {from: config.web3.options.defaultAccount} );
			res.send("Contract Terminated");
	} catch (err) {
		logger.error(err);
		res.send({ errors: [err.message] });
	}
}
