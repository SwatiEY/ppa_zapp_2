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

import { startEventFilter, getSiblingPath } from "./common/timber.mjs";
import fs from "fs";
import GN from "general-number";
import { getAllCommitments } from "./common/commitment-storage.mjs";
import logger from "./common/logger.mjs";
import { decrypt } from "./common/number-theory.mjs";
import web3 from "./common/web3.mjs";

/**
      Welcome to your zApp's integration test!
      Depending on how your functions interact and the range of inputs they expect, the below may need to be changed.
      e.g. Your input contract has two functions, add() and minus(). minus() cannot be called before an initial add() - the compiler won't know this! You'll need to rearrange the below.
      e.g. The function add() only takes numbers greater than 100. The compiler won't know this, so you'll need to change the call to add() below.
      The transpiler automatically fills in any ZKP inputs for you and provides some dummy values for the original zol function.
      NOTE: if any non-secret functions need to be called first, the transpiler won't know! You'll need to add those calls below.
      NOTE: if you'd like to keep track of your commitments, check out ./common/db/preimage. Remember to delete this file if you'd like to start fresh with a newly deployed contract.
      */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const { generalise } = GN;
let leafIndex;
let encryption = {};
// eslint-disable-next-line func-names
describe("SyntheticPpaShield", async function () {
	this.timeout(3660000);
	try {
		await web3.connect();
	} catch (err) {
		throw new Error(err);
	}
	// eslint-disable-next-line func-names
	describe("setStrikePrice", async function () {
		this.timeout(3660000);
		try {
			await web3.connect();
		} catch (err) {
			throw new Error(err);
		}
		// eslint-disable-next-line func-names
		describe("First call", async function () {
			this.timeout(3660000);
			it("should call setStrikePrice", async () => {
				try {
					// this starts up the merkle tree's event filter
					await startEventFilter("SyntheticPpaShield");
					// this calls your function! It returns the tx from the shield contract
					// you can replace the values below - numbers are randomly generated
					const { tx, encEvent } = await setStrikePrice(61);
					// prints the tx
					console.log(tx);
					// reassigns leafIndex to the index of the first commitment added by this function
					if (tx.event) {
						leafIndex = tx.returnValues[0];
						// prints the new leaves (commitments) added by this function call
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
					if (encEvent[0].event) {
						encryption.msgs = encEvent[0].returnValues[0];
						encryption.key = encEvent[0].returnValues[1];
						console.log("EncryptedMsgs:");
						console.log(encEvent[0].returnValues[0]);
					}
					await sleep(10);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
			it("should update the merkle tree", async () => {
				try {
					// this is the path from your new commitment to the root of the tree - it's needed to show the commitment exists when you want to edit your secret state
					const path = await getSiblingPath("SyntheticPpaShield", leafIndex);
					console.log("Queried sibling path:");
					console.table(path, ["value", "nodeIndex"]);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
		// eslint-disable-next-line func-names
		describe("Second Call", async function () {
			this.timeout(3660000);
			it("should call setStrikePrice again", async () => {
				try {
					// this calls your function a second time for incremental cases
					const { tx } = await setStrikePrice(145);
					if (tx.event) {
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
	});

	// eslint-disable-next-line func-names
	describe("setBundlePrice", async function () {
		this.timeout(3660000);
		try {
			await web3.connect();
		} catch (err) {
			throw new Error(err);
		}
		// eslint-disable-next-line func-names
		describe("First call", async function () {
			this.timeout(3660000);
			it("should call setBundlePrice", async () => {
				try {
					// this starts up the merkle tree's event filter
					await startEventFilter("SyntheticPpaShield");
					// this calls your function! It returns the tx from the shield contract
					// you can replace the values below - numbers are randomly generated
					const { tx, encEvent } = await setBundlePrice(50);
					// prints the tx
					console.log(tx);
					// reassigns leafIndex to the index of the first commitment added by this function
					if (tx.event) {
						leafIndex = tx.returnValues[0];
						// prints the new leaves (commitments) added by this function call
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
					if (encEvent[0].event) {
						encryption.msgs = encEvent[0].returnValues[0];
						encryption.key = encEvent[0].returnValues[1];
						console.log("EncryptedMsgs:");
						console.log(encEvent[0].returnValues[0]);
					}
					await sleep(10);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
			it("should update the merkle tree", async () => {
				try {
					// this is the path from your new commitment to the root of the tree - it's needed to show the commitment exists when you want to edit your secret state
					const path = await getSiblingPath("SyntheticPpaShield", leafIndex);
					console.log("Queried sibling path:");
					console.table(path, ["value", "nodeIndex"]);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
		// eslint-disable-next-line func-names
		describe("Second Call", async function () {
			this.timeout(3660000);
			it("should call setBundlePrice again", async () => {
				try {
					// this calls your function a second time for incremental cases
					const { tx } = await setBundlePrice(41);
					if (tx.event) {
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
	});

	// eslint-disable-next-line func-names
	describe("setShortfallThreshold", async function () {
		this.timeout(3660000);
		try {
			await web3.connect();
		} catch (err) {
			throw new Error(err);
		}
		// eslint-disable-next-line func-names
		describe("First call", async function () {
			this.timeout(3660000);
			it("should call setShortfallThreshold", async () => {
				try {
					// this starts up the merkle tree's event filter
					await startEventFilter("SyntheticPpaShield");
					// this calls your function! It returns the tx from the shield contract
					// you can replace the values below - numbers are randomly generated
					const { tx, encEvent } = await setShortfallThreshold(117);
					// prints the tx
					console.log(tx);
					// reassigns leafIndex to the index of the first commitment added by this function
					if (tx.event) {
						leafIndex = tx.returnValues[0];
						// prints the new leaves (commitments) added by this function call
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
					if (encEvent[0].event) {
						encryption.msgs = encEvent[0].returnValues[0];
						encryption.key = encEvent[0].returnValues[1];
						console.log("EncryptedMsgs:");
						console.log(encEvent[0].returnValues[0]);
					}
					await sleep(10);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
			it("should update the merkle tree", async () => {
				try {
					// this is the path from your new commitment to the root of the tree - it's needed to show the commitment exists when you want to edit your secret state
					const path = await getSiblingPath("SyntheticPpaShield", leafIndex);
					console.log("Queried sibling path:");
					console.table(path, ["value", "nodeIndex"]);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
		// eslint-disable-next-line func-names
		describe("Second Call", async function () {
			this.timeout(3660000);
			it("should call setShortfallThreshold again", async () => {
				try {
					// this calls your function a second time for incremental cases
					const { tx } = await setShortfallThreshold(100);
					if (tx.event) {
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
	});

	// eslint-disable-next-line func-names
	describe("setShortfallPeriods", async function () {
		this.timeout(3660000);
		try {
			await web3.connect();
		} catch (err) {
			throw new Error(err);
		}
		// eslint-disable-next-line func-names
		describe("First call", async function () {
			this.timeout(3660000);
			it("should call setShortfallPeriods", async () => {
				try {
					// this starts up the merkle tree's event filter
					await startEventFilter("SyntheticPpaShield");
					// this calls your function! It returns the tx from the shield contract
					// you can replace the values below - numbers are randomly generated
					const { tx, encEvent } = await setShortfallPeriods(101);
					// prints the tx
					console.log(tx);
					// reassigns leafIndex to the index of the first commitment added by this function
					if (tx.event) {
						leafIndex = tx.returnValues[0];
						// prints the new leaves (commitments) added by this function call
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
					if (encEvent[0].event) {
						encryption.msgs = encEvent[0].returnValues[0];
						encryption.key = encEvent[0].returnValues[1];
						console.log("EncryptedMsgs:");
						console.log(encEvent[0].returnValues[0]);
					}
					await sleep(10);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
			it("should update the merkle tree", async () => {
				try {
					// this is the path from your new commitment to the root of the tree - it's needed to show the commitment exists when you want to edit your secret state
					const path = await getSiblingPath("SyntheticPpaShield", leafIndex);
					console.log("Queried sibling path:");
					console.table(path, ["value", "nodeIndex"]);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
		// eslint-disable-next-line func-names
		describe("Second Call", async function () {
			this.timeout(3660000);
			it("should call setShortfallPeriods again", async () => {
				try {
					// this calls your function a second time for incremental cases
					const { tx } = await setShortfallPeriods(76);
					if (tx.event) {
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
	});

	// eslint-disable-next-line func-names
	describe("setSurplusThreshold", async function () {
		this.timeout(3660000);
		try {
			await web3.connect();
		} catch (err) {
			throw new Error(err);
		}
		// eslint-disable-next-line func-names
		describe("First call", async function () {
			this.timeout(3660000);
			it("should call setSurplusThreshold", async () => {
				try {
					// this starts up the merkle tree's event filter
					await startEventFilter("SyntheticPpaShield");
					// this calls your function! It returns the tx from the shield contract
					// you can replace the values below - numbers are randomly generated
					const { tx, encEvent } = await setSurplusThreshold(69);
					// prints the tx
					console.log(tx);
					// reassigns leafIndex to the index of the first commitment added by this function
					if (tx.event) {
						leafIndex = tx.returnValues[0];
						// prints the new leaves (commitments) added by this function call
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
					if (encEvent[0].event) {
						encryption.msgs = encEvent[0].returnValues[0];
						encryption.key = encEvent[0].returnValues[1];
						console.log("EncryptedMsgs:");
						console.log(encEvent[0].returnValues[0]);
					}
					await sleep(10);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
			it("should update the merkle tree", async () => {
				try {
					// this is the path from your new commitment to the root of the tree - it's needed to show the commitment exists when you want to edit your secret state
					const path = await getSiblingPath("SyntheticPpaShield", leafIndex);
					console.log("Queried sibling path:");
					console.table(path, ["value", "nodeIndex"]);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
		// eslint-disable-next-line func-names
		describe("Second Call", async function () {
			this.timeout(3660000);
			it("should call setSurplusThreshold again", async () => {
				try {
					// this calls your function a second time for incremental cases
					const { tx } = await setSurplusThreshold(178);
					if (tx.event) {
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
	});

	// eslint-disable-next-line func-names
	describe("setSurplusPeriods", async function () {
		this.timeout(3660000);
		try {
			await web3.connect();
		} catch (err) {
			throw new Error(err);
		}
		// eslint-disable-next-line func-names
		describe("First call", async function () {
			this.timeout(3660000);
			it("should call setSurplusPeriods", async () => {
				try {
					// this starts up the merkle tree's event filter
					await startEventFilter("SyntheticPpaShield");
					// this calls your function! It returns the tx from the shield contract
					// you can replace the values below - numbers are randomly generated
					const { tx, encEvent } = await setSurplusPeriods(7);
					// prints the tx
					console.log(tx);
					// reassigns leafIndex to the index of the first commitment added by this function
					if (tx.event) {
						leafIndex = tx.returnValues[0];
						// prints the new leaves (commitments) added by this function call
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
					if (encEvent[0].event) {
						encryption.msgs = encEvent[0].returnValues[0];
						encryption.key = encEvent[0].returnValues[1];
						console.log("EncryptedMsgs:");
						console.log(encEvent[0].returnValues[0]);
					}
					await sleep(10);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
			it("should update the merkle tree", async () => {
				try {
					// this is the path from your new commitment to the root of the tree - it's needed to show the commitment exists when you want to edit your secret state
					const path = await getSiblingPath("SyntheticPpaShield", leafIndex);
					console.log("Queried sibling path:");
					console.table(path, ["value", "nodeIndex"]);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
		// eslint-disable-next-line func-names
		describe("Second Call", async function () {
			this.timeout(3660000);
			it("should call setSurplusPeriods again", async () => {
				try {
					// this calls your function a second time for incremental cases
					const { tx } = await setSurplusPeriods(87);
					if (tx.event) {
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
	});

	// eslint-disable-next-line func-names
	describe("setDailyInterestRate", async function () {
		this.timeout(3660000);
		try {
			await web3.connect();
		} catch (err) {
			throw new Error(err);
		}
		// eslint-disable-next-line func-names
		describe("First call", async function () {
			this.timeout(3660000);
			it("should call setDailyInterestRate", async () => {
				try {
					// this starts up the merkle tree's event filter
					await startEventFilter("SyntheticPpaShield");
					// this calls your function! It returns the tx from the shield contract
					// you can replace the values below - numbers are randomly generated
					const { tx, encEvent } = await setDailyInterestRate(137);
					// prints the tx
					console.log(tx);
					// reassigns leafIndex to the index of the first commitment added by this function
					if (tx.event) {
						leafIndex = tx.returnValues[0];
						// prints the new leaves (commitments) added by this function call
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
					if (encEvent[0].event) {
						encryption.msgs = encEvent[0].returnValues[0];
						encryption.key = encEvent[0].returnValues[1];
						console.log("EncryptedMsgs:");
						console.log(encEvent[0].returnValues[0]);
					}
					await sleep(10);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
			it("should update the merkle tree", async () => {
				try {
					// this is the path from your new commitment to the root of the tree - it's needed to show the commitment exists when you want to edit your secret state
					const path = await getSiblingPath("SyntheticPpaShield", leafIndex);
					console.log("Queried sibling path:");
					console.table(path, ["value", "nodeIndex"]);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
		// eslint-disable-next-line func-names
		describe("Second Call", async function () {
			this.timeout(3660000);
			it("should call setDailyInterestRate again", async () => {
				try {
					// this calls your function a second time for incremental cases
					const { tx } = await setDailyInterestRate(165);
					if (tx.event) {
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
	});

	// eslint-disable-next-line func-names
	describe("setExpiryDateOfContract", async function () {
		this.timeout(3660000);
		try {
			await web3.connect();
		} catch (err) {
			throw new Error(err);
		}
		// eslint-disable-next-line func-names
		describe("First call", async function () {
			this.timeout(3660000);
			it("should call setExpiryDateOfContract", async () => {
				try {
					// this starts up the merkle tree's event filter
					await startEventFilter("SyntheticPpaShield");
					// this calls your function! It returns the tx from the shield contract
					// you can replace the values below - numbers are randomly generated
					const { tx, encEvent } = await setExpiryDateOfContract(82);
					// prints the tx
					console.log(tx);
					// reassigns leafIndex to the index of the first commitment added by this function
					if (tx.event) {
						leafIndex = tx.returnValues[0];
						// prints the new leaves (commitments) added by this function call
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
					if (encEvent[0].event) {
						encryption.msgs = encEvent[0].returnValues[0];
						encryption.key = encEvent[0].returnValues[1];
						console.log("EncryptedMsgs:");
						console.log(encEvent[0].returnValues[0]);
					}
					await sleep(10);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
			it("should update the merkle tree", async () => {
				try {
					// this is the path from your new commitment to the root of the tree - it's needed to show the commitment exists when you want to edit your secret state
					const path = await getSiblingPath("SyntheticPpaShield", leafIndex);
					console.log("Queried sibling path:");
					console.table(path, ["value", "nodeIndex"]);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
		// eslint-disable-next-line func-names
		describe("Second Call", async function () {
			this.timeout(3660000);
			it("should call setExpiryDateOfContract again", async () => {
				try {
					// this calls your function a second time for incremental cases
					const { tx } = await setExpiryDateOfContract(67);
					if (tx.event) {
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
	});

	// eslint-disable-next-line func-names
	describe("setVolumeShare", async function () {
		this.timeout(3660000);
		try {
			await web3.connect();
		} catch (err) {
			throw new Error(err);
		}
		// eslint-disable-next-line func-names
		describe("First call", async function () {
			this.timeout(3660000);
			it("should call setVolumeShare", async () => {
				try {
					// this starts up the merkle tree's event filter
					await startEventFilter("SyntheticPpaShield");
					// this calls your function! It returns the tx from the shield contract
					// you can replace the values below - numbers are randomly generated
					const { tx, encEvent } = await setVolumeShare(16);
					// prints the tx
					console.log(tx);
					// reassigns leafIndex to the index of the first commitment added by this function
					if (tx.event) {
						leafIndex = tx.returnValues[0];
						// prints the new leaves (commitments) added by this function call
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
					if (encEvent[0].event) {
						encryption.msgs = encEvent[0].returnValues[0];
						encryption.key = encEvent[0].returnValues[1];
						console.log("EncryptedMsgs:");
						console.log(encEvent[0].returnValues[0]);
					}
					await sleep(10);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
			it("should update the merkle tree", async () => {
				try {
					// this is the path from your new commitment to the root of the tree - it's needed to show the commitment exists when you want to edit your secret state
					const path = await getSiblingPath("SyntheticPpaShield", leafIndex);
					console.log("Queried sibling path:");
					console.table(path, ["value", "nodeIndex"]);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
		// eslint-disable-next-line func-names
		describe("Second Call", async function () {
			this.timeout(3660000);
			it("should call setVolumeShare again", async () => {
				try {
					// this calls your function a second time for incremental cases
					const { tx } = await setVolumeShare(196);
					if (tx.event) {
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
	});

	// eslint-disable-next-line func-names
	describe("setSequenceNumberInterval", async function () {
		this.timeout(3660000);
		try {
			await web3.connect();
		} catch (err) {
			throw new Error(err);
		}
		// eslint-disable-next-line func-names
		describe("First call", async function () {
			this.timeout(3660000);
			it("should call setSequenceNumberInterval", async () => {
				try {
					// this starts up the merkle tree's event filter
					await startEventFilter("SyntheticPpaShield");
					// this calls your function! It returns the tx from the shield contract
					// you can replace the values below - numbers are randomly generated
					const { tx, encEvent } = await setSequenceNumberInterval(49);
					// prints the tx
					console.log(tx);
					// reassigns leafIndex to the index of the first commitment added by this function
					if (tx.event) {
						leafIndex = tx.returnValues[0];
						// prints the new leaves (commitments) added by this function call
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
					if (encEvent[0].event) {
						encryption.msgs = encEvent[0].returnValues[0];
						encryption.key = encEvent[0].returnValues[1];
						console.log("EncryptedMsgs:");
						console.log(encEvent[0].returnValues[0]);
					}
					await sleep(10);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
			it("should update the merkle tree", async () => {
				try {
					// this is the path from your new commitment to the root of the tree - it's needed to show the commitment exists when you want to edit your secret state
					const path = await getSiblingPath("SyntheticPpaShield", leafIndex);
					console.log("Queried sibling path:");
					console.table(path, ["value", "nodeIndex"]);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
		// eslint-disable-next-line func-names
		describe("Second Call", async function () {
			this.timeout(3660000);
			it("should call setSequenceNumberInterval again", async () => {
				try {
					// this calls your function a second time for incremental cases
					const { tx } = await setSequenceNumberInterval(33);
					if (tx.event) {
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
	});

	// eslint-disable-next-line func-names
	describe("initSequenceNumber", async function () {
		this.timeout(3660000);
		try {
			await web3.connect();
		} catch (err) {
			throw new Error(err);
		}
		// eslint-disable-next-line func-names
		describe("First call", async function () {
			this.timeout(3660000);
			it("should call initSequenceNumber", async () => {
				try {
					// this starts up the merkle tree's event filter
					await startEventFilter("SyntheticPpaShield");
					// this calls your function! It returns the tx from the shield contract
					// you can replace the values below - numbers are randomly generated
					const { tx, encEvent } = await initSequenceNumber();
					// prints the tx
					console.log(tx);
					// reassigns leafIndex to the index of the first commitment added by this function
					if (tx.event) {
						leafIndex = tx.returnValues[0];
						// prints the new leaves (commitments) added by this function call
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
					if (encEvent[0].event) {
						encryption.msgs = encEvent[0].returnValues[0];
						encryption.key = encEvent[0].returnValues[1];
						console.log("EncryptedMsgs:");
						console.log(encEvent[0].returnValues[0]);
					}
					await sleep(10);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
			it("should update the merkle tree", async () => {
				try {
					// this is the path from your new commitment to the root of the tree - it's needed to show the commitment exists when you want to edit your secret state
					const path = await getSiblingPath("SyntheticPpaShield", leafIndex);
					console.log("Queried sibling path:");
					console.table(path, ["value", "nodeIndex"]);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
		// eslint-disable-next-line func-names
		describe("Second Call", async function () {
			this.timeout(3660000);
			it("should call initSequenceNumber again", async () => {
				try {
					// this calls your function a second time for incremental cases
					const { tx } = await initSequenceNumber();
					if (tx.event) {
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
	});

	// eslint-disable-next-line func-names
	describe("initSurplusSequenceNumber", async function () {
		this.timeout(3660000);
		try {
			await web3.connect();
		} catch (err) {
			throw new Error(err);
		}
		// eslint-disable-next-line func-names
		describe("First call", async function () {
			this.timeout(3660000);
			it("should call initSurplusSequenceNumber", async () => {
				try {
					// this starts up the merkle tree's event filter
					await startEventFilter("SyntheticPpaShield");
					// this calls your function! It returns the tx from the shield contract
					// you can replace the values below - numbers are randomly generated
					const { tx, encEvent } = await initSurplusSequenceNumber();
					// prints the tx
					console.log(tx);
					// reassigns leafIndex to the index of the first commitment added by this function
					if (tx.event) {
						leafIndex = tx.returnValues[0];
						// prints the new leaves (commitments) added by this function call
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
					if (encEvent[0].event) {
						encryption.msgs = encEvent[0].returnValues[0];
						encryption.key = encEvent[0].returnValues[1];
						console.log("EncryptedMsgs:");
						console.log(encEvent[0].returnValues[0]);
					}
					await sleep(10);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
			it("should update the merkle tree", async () => {
				try {
					// this is the path from your new commitment to the root of the tree - it's needed to show the commitment exists when you want to edit your secret state
					const path = await getSiblingPath("SyntheticPpaShield", leafIndex);
					console.log("Queried sibling path:");
					console.table(path, ["value", "nodeIndex"]);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
		// eslint-disable-next-line func-names
		describe("Second Call", async function () {
			this.timeout(3660000);
			it("should call initSurplusSequenceNumber again", async () => {
				try {
					// this calls your function a second time for incremental cases
					const { tx } = await initSurplusSequenceNumber();
					if (tx.event) {
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
	});

	// eslint-disable-next-line func-names
	describe("setInitialContractParams", async function () {
		this.timeout(3660000);
		try {
			await web3.connect();
		} catch (err) {
			throw new Error(err);
		}
		// eslint-disable-next-line func-names
		describe("First call", async function () {
			this.timeout(3660000);
			it("should call setInitialContractParams", async () => {
				try {
					// this starts up the merkle tree's event filter
					await startEventFilter("SyntheticPpaShield");
					// this calls your function! It returns the tx from the shield contract
					// you can replace the values below - numbers are randomly generated
					const { tx, encEvent } = await setInitialContractParams(
						121,
						168,
						43,
						73,
						76,
						125,
						166,
						105,
						59,
						104,
						49
					);
					// prints the tx
					console.log(tx);
					// reassigns leafIndex to the index of the first commitment added by this function
					if (tx.event) {
						leafIndex = tx.returnValues[0];
						// prints the new leaves (commitments) added by this function call
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
					if (encEvent[0].event) {
						encryption.msgs = encEvent[0].returnValues[0];
						encryption.key = encEvent[0].returnValues[1];
						console.log("EncryptedMsgs:");
						console.log(encEvent[0].returnValues[0]);
					}
					await sleep(10);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
			it("should update the merkle tree", async () => {
				try {
					// this is the path from your new commitment to the root of the tree - it's needed to show the commitment exists when you want to edit your secret state
					const path = await getSiblingPath("SyntheticPpaShield", leafIndex);
					console.log("Queried sibling path:");
					console.table(path, ["value", "nodeIndex"]);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
		// eslint-disable-next-line func-names
		describe("Second Call", async function () {
			this.timeout(3660000);
			it("should call setInitialContractParams again", async () => {
				try {
					// this calls your function a second time for incremental cases
					const { tx } = await setInitialContractParams(
						5,
						153,
						61,
						160,
						172,
						44,
						193,
						119,
						152,
						102,
						138
					);
					if (tx.event) {
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
	});

	// eslint-disable-next-line func-names
	describe("calculateCfd", async function () {
		this.timeout(3660000);
		try {
			await web3.connect();
		} catch (err) {
			throw new Error(err);
		}
		// eslint-disable-next-line func-names
		describe("First call", async function () {
			this.timeout(3660000);
			it("should call calculateCfd", async () => {
				try {
					// this starts up the merkle tree's event filter
					await startEventFilter("SyntheticPpaShield");
					// this calls your function! It returns the tx from the shield contract
					// you can replace the values below - numbers are randomly generated
					const { tx, encEvent } = await calculateCfd(
						169,
						188,
						63,
						61,
						131,
						78,
						109,
						17,
						111,
						0,
						0,
						0,
						0,
						164
					);
					// prints the tx
					console.log(tx);
					// reassigns leafIndex to the index of the first commitment added by this function
					if (tx.event) {
						leafIndex = tx.returnValues[0];
						// prints the new leaves (commitments) added by this function call
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
					if (encEvent[0].event) {
						encryption.msgs = encEvent[0].returnValues[0];
						encryption.key = encEvent[0].returnValues[1];
						console.log("EncryptedMsgs:");
						console.log(encEvent[0].returnValues[0]);
					}
					await sleep(10);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
			it("should update the merkle tree", async () => {
				try {
					// this is the path from your new commitment to the root of the tree - it's needed to show the commitment exists when you want to edit your secret state
					const path = await getSiblingPath("SyntheticPpaShield", leafIndex);
					console.log("Queried sibling path:");
					console.table(path, ["value", "nodeIndex"]);
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
		// eslint-disable-next-line func-names
		describe("Second Call", async function () {
			this.timeout(3660000);
			it("should call calculateCfd again", async () => {
				try {
					// this calls your function a second time for incremental cases
					const { tx } = await calculateCfd(
						32,
						138,
						186,
						137,
						50,
						196,
						87,
						158,
						107,
						0,
						0,
						0,
						0,
						146
					);
					if (tx.event) {
						console.log(`Merkle tree event returnValues:`);
						console.log(tx.returnValues[0]);
					}
				} catch (err) {
					logger.error(err);
					process.exit(1);
				}
			});
		});
	});
});
