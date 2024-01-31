/* eslint-disable prettier/prettier, camelcase, prefer-const, no-unused-vars */
import config from "config";
import utils from "zkp-utils";
import GN from "general-number";
import fs from "fs";

import {
	getContractInstance,
	getContractAddress,
	registerKey,
	registerZKPKey
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

export default async function setShortfallThreshold(
	_shortfallThresholdParam,
	_shortfallThreshold_newOwnerPublicKey = 0
) {
	// Initialisation of variables:

	const instance = await getContractInstance("SyntheticPpaShield");

	const contractAddr = await getContractAddress("SyntheticPpaShield");

	const msgValue = 0;
	const shortfallThresholdParam = generalise(_shortfallThresholdParam);
	let shortfallThreshold_newOwnerPublicKey = generalise(
		_shortfallThreshold_newOwnerPublicKey
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

	// Extract set membership witness:

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

	let shortfallThreshold = parseInt(shortfallThresholdParam.integer, 10);

	shortfallThreshold = generalise(shortfallThreshold);

	// Calculate nullifier(s):

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


	// Calculate commitment(s):

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

	// Call Zokrates to generate the proof:

	const allInputs = [
		shortfallThresholdParam.integer,
		shortfallThreshold_commitmentExists
			? secretKey.integer
			: generalise(0).integer,
		shortfallThreshold_nullifier.integer,
		shortfallThreshold_prev.integer,
		shortfallThreshold_prevSalt.integer,
		shortfallThreshold_commitmentExists ? 0 : 1,
		shortfallThreshold_root.integer,
		shortfallThreshold_index.integer,
		shortfallThreshold_path.integer,
		shortfallThreshold_newOwnerPublicKey.integer,
		shortfallThreshold_newSalt.integer,
		shortfallThreshold_newCommitment.integer,
	].flat(Infinity);
	const res = await generateProof("setShortfallThreshold", allInputs);
	const proof = generalise(Object.values(res.proof).flat(Infinity))
		.map((coeff) => coeff.integer)
		.flat(Infinity);

	// Send transaction to the blockchain:

	const txData = await instance.methods
		.setShortfallThreshold(
			[shortfallThreshold_nullifier.integer],
			shortfallThreshold_root.integer,
			[shortfallThreshold_newCommitment.integer],
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

	return { tx, encEvent };
}
