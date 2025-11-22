/* eslint-disable prettier/prettier, camelcase, prefer-const, no-unused-vars */
import config from "config";
import assert from "assert";

import { TerminateContractManager } from "./terminateContract.mjs";
import { CalculateCfdManager } from "./calculateCfd.mjs";
import { SetInitialContractParamsManager } from "./setInitialContractParams.mjs";
import { InitSequenceNumberManager } from "./initSequenceNumber.mjs";
import { SetSequenceNumberIntervalManager } from "./setSequenceNumberInterval.mjs";
import { SetVolumeShareManager } from "./setVolumeShare.mjs";
import { SetExpiryDateOfContractManager } from "./setExpiryDateOfContract.mjs";
import { SetStartDateOfContractManager } from "./setStartDateOfContract.mjs";
import { SetDailyInterestRateManager } from "./setDailyInterestRate.mjs";
import { SetSurplusPeriodsManager } from "./setSurplusPeriods.mjs";
import { SetSurplusThresholdManager } from "./setSurplusThreshold.mjs";
import { SetShortfallPeriodsManager } from "./setShortfallPeriods.mjs";
import { SetShortfallThresholdManager } from "./setShortfallThreshold.mjs";
import { SetBundlePriceManager } from "./setBundlePrice.mjs";
import { SetStrikePriceManager } from "./setStrikePrice.mjs";
import { startEventFilter, getSiblingPath } from "./common/timber.mjs";
import fs from "fs";
import logger from "./common/logger.mjs";
import { decrypt } from "./common/number-theory.mjs";
import {
	getAllCommitments,
	getCommitmentsByState,
	reinstateNullifiers,
	getBalance,
	getSharedSecretskeys,
	getBalanceByState,
	addConstructorNullifiers,
} from "./common/commitment-storage.mjs";
import { backupDataRetriever } from "./BackupDataRetriever.mjs";
import { backupVariable } from "./BackupVariable.mjs";
import web3 from "./common/web3.mjs";

/**
      NOTE: this is the api service file, if you need to call any function use the correct url and if Your input contract has two functions, add() and minus().
      minus() cannot be called before an initial add(). */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let leafIndex;
let encryption = {};
// eslint-disable-next-line func-names

export class ServiceManager {
	constructor(web3) {
		this.web3 = web3;

		this.setStrikePrice = new SetStrikePriceManager(web3);
		this.setBundlePrice = new SetBundlePriceManager(web3);
		this.setShortfallThreshold = new SetShortfallThresholdManager(web3);
		this.setShortfallPeriods = new SetShortfallPeriodsManager(web3);
		this.setSurplusThreshold = new SetSurplusThresholdManager(web3);
		this.setSurplusPeriods = new SetSurplusPeriodsManager(web3);
		this.setDailyInterestRate = new SetDailyInterestRateManager(web3);
		this.setStartDateOfContract = new SetStartDateOfContractManager(web3);
		this.setExpiryDateOfContract = new SetExpiryDateOfContractManager(web3);
		this.setVolumeShare = new SetVolumeShareManager(web3);
		this.setSequenceNumberInterval = new SetSequenceNumberIntervalManager(web3);
		this.initSequenceNumber = new InitSequenceNumberManager(web3);
		this.setInitialContractParams = new SetInitialContractParamsManager(web3);
		this.calculateCfd = new CalculateCfdManager(web3);
		this.terminateContract = new TerminateContractManager(web3);
	}
	async init() {
		await this.setStrikePrice.init();
		await this.setBundlePrice.init();
		await this.setShortfallThreshold.init();
		await this.setShortfallPeriods.init();
		await this.setSurplusThreshold.init();
		await this.setSurplusPeriods.init();
		await this.setDailyInterestRate.init();
		await this.setStartDateOfContract.init();
		await this.setExpiryDateOfContract.init();
		await this.setVolumeShare.init();
		await this.setSequenceNumberInterval.init();
		await this.initSequenceNumber.init();
		await this.setInitialContractParams.init();
		await this.calculateCfd.init();
		await this.terminateContract.init();
	}

	// eslint-disable-next-line func-names
	async service_setStrikePrice(req, res, next) {
		try {
			await startEventFilter("SyntheticPpaShield");
			const { strikePriceParam } = req.body;
			const strikePrice_newOwnerPublicKey =
				req.body.strikePrice_newOwnerPublicKey || 0;
			const { tx, encEvent, encBackupEvent } =
				await this.setStrikePrice.setStrikePrice(
					strikePriceParam,
					strikePrice_newOwnerPublicKey
				);
			// prints the tx
			console.log(tx);
			res.send({ tx, encEvent, encBackupEvent });
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
	async service_setBundlePrice(req, res, next) {
		try {
			await startEventFilter("SyntheticPpaShield");
			const { bundlePriceParam } = req.body;
			const bundlePrice_newOwnerPublicKey =
				req.body.bundlePrice_newOwnerPublicKey || 0;
			const { tx, encEvent, encBackupEvent } =
				await this.setBundlePrice.setBundlePrice(
					bundlePriceParam,
					bundlePrice_newOwnerPublicKey
				);
			// prints the tx
			console.log(tx);
			res.send({ tx, encEvent, encBackupEvent });
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
	async service_setShortfallThreshold(req, res, next) {
		try {
			await startEventFilter("SyntheticPpaShield");
			const { shortfallThresholdParam } = req.body;
			const shortfallThreshold_newOwnerPublicKey =
				req.body.shortfallThreshold_newOwnerPublicKey || 0;
			const { tx, encEvent, encBackupEvent } =
				await this.setShortfallThreshold.setShortfallThreshold(
					shortfallThresholdParam,
					shortfallThreshold_newOwnerPublicKey
				);
			// prints the tx
			console.log(tx);
			res.send({ tx, encEvent, encBackupEvent });
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
	async service_setShortfallPeriods(req, res, next) {
		try {
			await startEventFilter("SyntheticPpaShield");
			const { shortfallPeriods } = req.body;
			const numberOfConsecutivePeriodsForShortfall_newOwnerPublicKey =
				req.body.numberOfConsecutivePeriodsForShortfall_newOwnerPublicKey || 0;
			const { tx, encEvent, encBackupEvent } =
				await this.setShortfallPeriods.setShortfallPeriods(
					shortfallPeriods,
					numberOfConsecutivePeriodsForShortfall_newOwnerPublicKey
				);
			// prints the tx
			console.log(tx);
			res.send({ tx, encEvent, encBackupEvent });
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
	async service_setSurplusThreshold(req, res, next) {
		try {
			await startEventFilter("SyntheticPpaShield");
			const { surplusThresholdParam } = req.body;
			const surplusThreshold_newOwnerPublicKey =
				req.body.surplusThreshold_newOwnerPublicKey || 0;
			const { tx, encEvent, encBackupEvent } =
				await this.setSurplusThreshold.setSurplusThreshold(
					surplusThresholdParam,
					surplusThreshold_newOwnerPublicKey
				);
			// prints the tx
			console.log(tx);
			res.send({ tx, encEvent, encBackupEvent });
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
	async service_setSurplusPeriods(req, res, next) {
		try {
			await startEventFilter("SyntheticPpaShield");
			const { surplusPeriods } = req.body;
			const numberOfConsecutivePeriodsForSurplus_newOwnerPublicKey =
				req.body.numberOfConsecutivePeriodsForSurplus_newOwnerPublicKey || 0;
			const { tx, encEvent, encBackupEvent } =
				await this.setSurplusPeriods.setSurplusPeriods(
					surplusPeriods,
					numberOfConsecutivePeriodsForSurplus_newOwnerPublicKey
				);
			// prints the tx
			console.log(tx);
			res.send({ tx, encEvent, encBackupEvent });
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
	async service_setDailyInterestRate(req, res, next) {
		try {
			await startEventFilter("SyntheticPpaShield");
			const { dailyInterestRateParam } = req.body;
			const dailyInterestRate_newOwnerPublicKey =
				req.body.dailyInterestRate_newOwnerPublicKey || 0;
			const { tx, encEvent, encBackupEvent } =
				await this.setDailyInterestRate.setDailyInterestRate(
					dailyInterestRateParam,
					dailyInterestRate_newOwnerPublicKey
				);
			// prints the tx
			console.log(tx);
			res.send({ tx, encEvent, encBackupEvent });
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
	async service_setStartDateOfContract(req, res, next) {
		try {
			await startEventFilter("SyntheticPpaShield");
			const { startDateOfContractParam } = req.body;
			const startDateOfContract_newOwnerPublicKey =
				req.body.startDateOfContract_newOwnerPublicKey || 0;
			const { tx, encEvent, encBackupEvent } =
				await this.setStartDateOfContract.setStartDateOfContract(
					startDateOfContractParam,
					startDateOfContract_newOwnerPublicKey
				);
			// prints the tx
			console.log(tx);
			res.send({ tx, encEvent, encBackupEvent });
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
	async service_setExpiryDateOfContract(req, res, next) {
		try {
			await startEventFilter("SyntheticPpaShield");
			const { expiryDateOfContractParam } = req.body;
			const expiryDateOfContract_newOwnerPublicKey =
				req.body.expiryDateOfContract_newOwnerPublicKey || 0;
			const { tx, encEvent, encBackupEvent } =
				await this.setExpiryDateOfContract.setExpiryDateOfContract(
					expiryDateOfContractParam,
					expiryDateOfContract_newOwnerPublicKey
				);
			// prints the tx
			console.log(tx);
			res.send({ tx, encEvent, encBackupEvent });
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
	async service_setVolumeShare(req, res, next) {
		try {
			await startEventFilter("SyntheticPpaShield");
			const { volumeShareParam } = req.body;
			const volumeShare_newOwnerPublicKey =
				req.body.volumeShare_newOwnerPublicKey || 0;
			const { tx, encEvent, encBackupEvent } =
				await this.setVolumeShare.setVolumeShare(
					volumeShareParam,
					volumeShare_newOwnerPublicKey
				);
			// prints the tx
			console.log(tx);
			res.send({ tx, encEvent, encBackupEvent });
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
	async service_setSequenceNumberInterval(req, res, next) {
		try {
			await startEventFilter("SyntheticPpaShield");
			const { sequenceNumberIntervalParam } = req.body;
			const sequenceNumberInterval_newOwnerPublicKey =
				req.body.sequenceNumberInterval_newOwnerPublicKey || 0;
			const { tx, encEvent, encBackupEvent } =
				await this.setSequenceNumberInterval.setSequenceNumberInterval(
					sequenceNumberIntervalParam,
					sequenceNumberInterval_newOwnerPublicKey
				);
			// prints the tx
			console.log(tx);
			res.send({ tx, encEvent, encBackupEvent });
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
	async service_initSequenceNumber(req, res, next) {
		try {
			await startEventFilter("SyntheticPpaShield");
			const latestShortfallSequenceNumber_newOwnerPublicKey =
				req.body.latestShortfallSequenceNumber_newOwnerPublicKey || 0;
			const latestSurplusSequenceNumber_newOwnerPublicKey =
				req.body.latestSurplusSequenceNumber_newOwnerPublicKey || 0;
			const { tx, encEvent, encBackupEvent } =
				await this.initSequenceNumber.initSequenceNumber(
					latestShortfallSequenceNumber_newOwnerPublicKey,
					latestSurplusSequenceNumber_newOwnerPublicKey
				);
			// prints the tx
			console.log(tx);
			res.send({ tx, encEvent, encBackupEvent });
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
	async service_setInitialContractParams(req, res, next) {
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
			const { startDateOfContractParam } = req.body;
			const { expiryDateOfContractParam } = req.body;
			const { sequenceNumberIntervalParam } = req.body;
			const strikePrice_newOwnerPublicKey =
				req.body.strikePrice_newOwnerPublicKey || 0;
			const bundlePrice_newOwnerPublicKey =
				req.body.bundlePrice_newOwnerPublicKey || 0;
			const volumeShare_newOwnerPublicKey =
				req.body.volumeShare_newOwnerPublicKey || 0;
			const dailyInterestRate_newOwnerPublicKey =
				req.body.dailyInterestRate_newOwnerPublicKey || 0;
			const startDateOfContract_newOwnerPublicKey =
				req.body.startDateOfContract_newOwnerPublicKey || 0;
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
			const { tx, encEvent, encBackupEvent } =
				await this.setInitialContractParams.setInitialContractParams(
					strikePriceParam,
					bundlePriceParam,
					volumeShareParam,
					numberOfConsecutivePeriodsForShortfallParam,
					shortfallThresholdParam,
					numberOfConsecutivePeriodsForSurplusParam,
					surplusThresholdParam,
					dailyInterestRateParam,
					startDateOfContractParam,
					expiryDateOfContractParam,
					sequenceNumberIntervalParam,
					strikePrice_newOwnerPublicKey,
					bundlePrice_newOwnerPublicKey,
					volumeShare_newOwnerPublicKey,
					dailyInterestRate_newOwnerPublicKey,
					startDateOfContract_newOwnerPublicKey,
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
			res.send({ tx, encEvent, encBackupEvent });
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
	async service_calculateCfd(req, res, next) {
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
			const { negativePriceOccurredParam } = req.body;
			const { referenceDate } = req.body;
			const shortfalls_index_newOwnerPublicKey =
				req.body.shortfalls_index_newOwnerPublicKey || 0;
			const latestShortfallSequenceNumber_newOwnerPublicKey =
				req.body.latestShortfallSequenceNumber_newOwnerPublicKey || 0;
			const surpluses_index_1_newOwnerPublicKey =
				req.body.surpluses_index_1_newOwnerPublicKey || 0;
			const latestSurplusSequenceNumber_newOwnerPublicKey =
				req.body.latestSurplusSequenceNumber_newOwnerPublicKey || 0;
			const generatorCfdNetPosition_billNumber_newOwnerPublicKey =
				req.body.generatorCfdNetPosition_billNumber_newOwnerPublicKey || 0;
			const offtakerCfdNetPosition_billNumber_newOwnerPublicKey =
				req.body.offtakerCfdNetPosition_billNumber_newOwnerPublicKey || 0;
			const generatorInterest_billNumber_newOwnerPublicKey =
				req.body.generatorInterest_billNumber_newOwnerPublicKey || 0;
			const offtakerInterest_billNumber_newOwnerPublicKey =
				req.body.offtakerInterest_billNumber_newOwnerPublicKey || 0;
			const offtakerNegativePriceCharges_billNumber_newOwnerPublicKey =
				req.body.offtakerNegativePriceCharges_billNumber_newOwnerPublicKey || 0;
			const generatorNegativePriceCharges_billNumber_newOwnerPublicKey =
				req.body.generatorNegativePriceCharges_billNumber_newOwnerPublicKey ||
				0;
			const shortfallPositiveChargeSum_newOwnerPublicKey =
				req.body.shortfallPositiveChargeSum_newOwnerPublicKey || 0;
			const shortfallNegativeChargeSum_newOwnerPublicKey =
				req.body.shortfallNegativeChargeSum_newOwnerPublicKey || 0;
			const shortfallIndex_newOwnerPublicKey =
				req.body.shortfallIndex_newOwnerPublicKey || 0;
			const shortfallPositiveCharges_billNumber_newOwnerPublicKey =
				req.body.shortfallPositiveCharges_billNumber_newOwnerPublicKey || 0;
			const shortfallNegativeCharges_billNumber_newOwnerPublicKey =
				req.body.shortfallNegativeCharges_billNumber_newOwnerPublicKey || 0;
			const surplusPositiveChargeSum_newOwnerPublicKey =
				req.body.surplusPositiveChargeSum_newOwnerPublicKey || 0;
			const surplusNegativeChargeSum_newOwnerPublicKey =
				req.body.surplusNegativeChargeSum_newOwnerPublicKey || 0;
			const surplusIndex_newOwnerPublicKey =
				req.body.surplusIndex_newOwnerPublicKey || 0;
			const surplusPositiveCharges_billNumber_newOwnerPublicKey =
				req.body.surplusPositiveCharges_billNumber_newOwnerPublicKey || 0;
			const surplusNegativeCharges_billNumber_newOwnerPublicKey =
				req.body.surplusNegativeCharges_billNumber_newOwnerPublicKey || 0;
			const {
				tx,
				encEvent,
				encBackupEvent,
				generatorCfdNetPosition_billNumber_newCommitmentValue,
				offtakerCfdNetPosition_billNumber_newCommitmentValue,
				generatorInterest_billNumber_newCommitmentValue,
				offtakerInterest_billNumber_newCommitmentValue,
				shortfallPositiveCharges_billNumber_newCommitmentValue,
				shortfallNegativeCharges_billNumber_newCommitmentValue,
				surplusPositiveCharges_billNumber_newCommitmentValue,
				surplusNegativeCharges_billNumber_newCommitmentValue,
				generatorNegativePriceCharges_billNumber_newCommitmentValue,
				offtakerNegativePriceCharges_billNumber_newCommitmentValue,
			} = await this.calculateCfd.calculateCfd(
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
				negativePriceOccurredParam,
				referenceDate,
				shortfalls_index_newOwnerPublicKey,
				latestShortfallSequenceNumber_newOwnerPublicKey,
				surpluses_index_1_newOwnerPublicKey,
				latestSurplusSequenceNumber_newOwnerPublicKey,
				generatorCfdNetPosition_billNumber_newOwnerPublicKey,
				offtakerCfdNetPosition_billNumber_newOwnerPublicKey,
				generatorInterest_billNumber_newOwnerPublicKey,
				offtakerInterest_billNumber_newOwnerPublicKey,
				offtakerNegativePriceCharges_billNumber_newOwnerPublicKey,
				generatorNegativePriceCharges_billNumber_newOwnerPublicKey,
				shortfallPositiveChargeSum_newOwnerPublicKey,
				shortfallNegativeChargeSum_newOwnerPublicKey,
				shortfallIndex_newOwnerPublicKey,
				shortfallPositiveCharges_billNumber_newOwnerPublicKey,
				shortfallNegativeCharges_billNumber_newOwnerPublicKey,
				surplusPositiveChargeSum_newOwnerPublicKey,
				surplusNegativeChargeSum_newOwnerPublicKey,
				surplusIndex_newOwnerPublicKey,
				surplusPositiveCharges_billNumber_newOwnerPublicKey,
				surplusNegativeCharges_billNumber_newOwnerPublicKey
			);
			// prints the tx
			console.log(tx);
			res.send({
				tx,
				encEvent,
				encBackupEvent,
				generatorCfdNetPosition_billNumber_newCommitmentValue,
				offtakerCfdNetPosition_billNumber_newCommitmentValue,
				generatorInterest_billNumber_newCommitmentValue,
				offtakerInterest_billNumber_newCommitmentValue,
				shortfallPositiveCharges_billNumber_newCommitmentValue,
				shortfallNegativeCharges_billNumber_newCommitmentValue,
				surplusPositiveCharges_billNumber_newCommitmentValue,
				surplusNegativeCharges_billNumber_newCommitmentValue,
				generatorNegativePriceCharges_billNumber_newCommitmentValue,
				offtakerNegativePriceCharges_billNumber_newCommitmentValue,
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

	// eslint-disable-next-line func-names
	async service_terminateContract(req, res, next) {
		const { tx } = await this.terminateContract.terminateContract();
		// prints the tx
		console.log(tx);
		res.send({ tx });

		if (tx.event) {
			console.log(tx.returnValues);
		}
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
export async function service_getBalance(req, res, next) {
	try {
		const sum = await getBalance();
		res.send({ " Total Balance": sum });
	} catch (error) {
		console.error("Error in calculation :", error);
		res.status(500).send({ error: err.message });
	}
}

export async function service_getBalanceByState(req, res, next) {
	try {
		const { name, mappingKey } = req.body;
		const balance = await getBalanceByState(name, mappingKey);
		res.send({ " Total Balance": balance });
	} catch (error) {
		console.error("Error in calculation :", error);
		res.status(500).send({ error: err.message });
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

export async function service_reinstateNullifiers(req, res, next) {
	try {
		await reinstateNullifiers();
		res.send("Complete");
		await sleep(10);
	} catch (err) {
		logger.error(err);
		res.send({ errors: [err.message] });
	}
}

export async function service_backupData(req, res, next) {
	try {
		await backupDataRetriever();
		res.send("Complete");
		await sleep(10);
	} catch (err) {
		logger.error(err);
		res.send({ errors: [err.message] });
	}
}
export async function service_backupVariable(req, res, next) {
	try {
		const { name } = req.body;
		await backupVariable(name);
		res.send("Complete");
		await sleep(10);
	} catch (err) {
		logger.error(err);
		res.send({ errors: [err.message] });
	}
}
export async function service_getSharedKeys(req, res, next) {
	try {
		const { recipientAddress } = req.body;
		const recipientPubKey = req.body.recipientPubKey || 0;
		const SharedKeys = await getSharedSecretskeys(
			recipientAddress,
			recipientPubKey
		);
		res.send({ SharedKeys });
		await sleep(10);
	} catch (err) {
		logger.error(err);
		res.send({ errors: [err.message] });
	}
}
