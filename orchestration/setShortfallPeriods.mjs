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
	getnullifierMembershipWitness,
	getupdatedNullifierPaths,
	temporaryUpdateNullifier,
	updateNullifierTree,
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

export default async function setShortfallPeriods(
	_shortfallPeriods,
	_numberOfConsecutivePeriodsForShortfall_newOwnerPublicKey = 0
) {
	// Initialisation of variables:

	const instance = await getContractInstance("SyntheticPpaShield");

	const contractAddr = await getContractAddress("SyntheticPpaShield");

	const msgValue = 0;
	const shortfallPeriods = generalise(_shortfallPeriods);
	let numberOfConsecutivePeriodsForShortfall_newOwnerPublicKey = generalise(
		_numberOfConsecutivePeriodsForShortfall_newOwnerPublicKey
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

	// Extract set membership witness:

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

	let numberOfConsecutivePeriodsForShortfall = parseInt(
		shortfallPeriods.integer,
		10
	);

	numberOfConsecutivePeriodsForShortfall = generalise(
		numberOfConsecutivePeriodsForShortfall
	);

	// Calculate nullifier(s):

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


	// Calculate commitment(s):

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

	// Call Zokrates to generate the proof:

	const allInputs = [
		shortfallPeriods.integer,
		numberOfConsecutivePeriodsForShortfall_commitmentExists
			? secretKey.integer
			: generalise(0).integer,
		numberOfConsecutivePeriodsForShortfall_nullifier.integer,
		numberOfConsecutivePeriodsForShortfall_prev.integer,
		numberOfConsecutivePeriodsForShortfall_prevSalt.integer,
		numberOfConsecutivePeriodsForShortfall_commitmentExists ? 0 : 1,
		numberOfConsecutivePeriodsForShortfall_root.integer,
		numberOfConsecutivePeriodsForShortfall_index.integer,
		numberOfConsecutivePeriodsForShortfall_path.integer,
		numberOfConsecutivePeriodsForShortfall_newOwnerPublicKey.integer,
		numberOfConsecutivePeriodsForShortfall_newSalt.integer,
		numberOfConsecutivePeriodsForShortfall_newCommitment.integer,
	].flat(Infinity);
	const res = await generateProof("setShortfallPeriods", allInputs);
	const proof = generalise(Object.values(res.proof).flat(Infinity))
		.map((coeff) => coeff.integer)
		.flat(Infinity);

	// Send transaction to the blockchain:

	const txData = await instance.methods
		.setShortfallPeriods(
			[numberOfConsecutivePeriodsForShortfall_nullifier.integer],
			numberOfConsecutivePeriodsForShortfall_root.integer,
			[numberOfConsecutivePeriodsForShortfall_newCommitment.integer],
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

	return { tx, encEvent };
}
