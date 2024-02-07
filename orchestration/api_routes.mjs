import { service_setStrikePrice } from "./api_services.mjs";

import { service_setBundlePrice } from "./api_services.mjs";

import { service_setShortfallThreshold } from "./api_services.mjs";

import { service_setShortfallPeriods } from "./api_services.mjs";

import { service_setSurplusThreshold } from "./api_services.mjs";

import { service_setSurplusPeriods } from "./api_services.mjs";

import { service_setDailyInterestRate } from "./api_services.mjs";

import { service_setExpiryDateOfContract } from "./api_services.mjs";

import { service_setVolumeShare } from "./api_services.mjs";

import { service_setSequenceNumberInterval } from "./api_services.mjs";

import { service_initSequenceNumber } from "./api_services.mjs";

import { service_initSurplusSequenceNumber } from "./api_services.mjs";

import { service_setInitialContractParams } from "./api_services.mjs";

import { service_calculateCfd } from "./api_services.mjs";
import { service_terminateContract } from "./api_services.mjs";

import {
	service_allCommitments,
	service_getCommitmentsByState,
} from "./api_services.mjs";

import express from "express";

const router = express.Router();

// eslint-disable-next-line func-names
router.post("/setStrikePrice", service_setStrikePrice);

// eslint-disable-next-line func-names
router.post("/setBundlePrice", service_setBundlePrice);

// eslint-disable-next-line func-names
router.post("/setShortfallThreshold", service_setShortfallThreshold);

// eslint-disable-next-line func-names
router.post("/setShortfallPeriods", service_setShortfallPeriods);

// eslint-disable-next-line func-names
router.post("/setSurplusThreshold", service_setSurplusThreshold);

// eslint-disable-next-line func-names
router.post("/setSurplusPeriods", service_setSurplusPeriods);

// eslint-disable-next-line func-names
router.post("/setDailyInterestRate", service_setDailyInterestRate);

// eslint-disable-next-line func-names
router.post("/setExpiryDateOfContract", service_setExpiryDateOfContract);

// eslint-disable-next-line func-names
router.post("/setVolumeShare", service_setVolumeShare);

// eslint-disable-next-line func-names
router.post("/setSequenceNumberInterval", service_setSequenceNumberInterval);

// eslint-disable-next-line func-names
router.post("/initSequenceNumber", service_initSequenceNumber);

// eslint-disable-next-line func-names
router.post("/initSurplusSequenceNumber", service_initSurplusSequenceNumber);

// eslint-disable-next-line func-names
router.post("/setInitialContractParams", service_setInitialContractParams);

// eslint-disable-next-line func-names
router.post("/calculateCfd", service_calculateCfd);

router.post("/terminateContract", service_terminateContract);

// commitment getter routes
router.get("/getAllCommitments", service_allCommitments);
router.get("/getCommitmentsByVariableName", service_getCommitmentsByState);
// nullifier route


export default router;
