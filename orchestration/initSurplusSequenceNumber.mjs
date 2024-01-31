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

export default async function initSurplusSequenceNumber(
	_latestSurplusSequenceNumber_newOwnerPublicKey = 0
) {
	// Initialisation of variables:

	const instance = await getContractInstance("SyntheticPpaShield");

	const contractAddr = await getContractAddress("SyntheticPpaShield");

	const msgValue = 0;
	let latestSurplusSequenceNumber_newOwnerPublicKey = generalise(
		_latestSurplusSequenceNumber_newOwnerPublicKey
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

	// Extract set membership witness:

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

	let latestSurplusSequenceNumber = 0;

	latestSurplusSequenceNumber = generalise(latestSurplusSequenceNumber);

	// Calculate nullifier(s):

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

	// Calculate commitment(s):

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

	// Call Zokrates to generate the proof:

	const allInputs = [
		latestSurplusSequenceNumber_commitmentExists
			? secretKey.integer
			: generalise(0).integer,
		latestSurplusSequenceNumber_nullifier.integer,
		latestSurplusSequenceNumber_prev.integer,
		latestSurplusSequenceNumber_prevSalt.integer,
		latestSurplusSequenceNumber_commitmentExists ? 0 : 1,
		latestSurplusSequenceNumber_root.integer,
		latestSurplusSequenceNumber_index.integer,
		latestSurplusSequenceNumber_path.integer,
		latestSurplusSequenceNumber_newOwnerPublicKey.integer,
		latestSurplusSequenceNumber_newSalt.integer,
		latestSurplusSequenceNumber_newCommitment.integer,
	].flat(Infinity);
	const res = await generateProof("initSurplusSequenceNumber", allInputs);
	const proof = generalise(Object.values(res.proof).flat(Infinity))
		.map((coeff) => coeff.integer)
		.flat(Infinity);

	// Send transaction to the blockchain:

	const txData = await instance.methods
		.initSurplusSequenceNumber(
			[latestSurplusSequenceNumber_nullifier.integer],
			latestSurplusSequenceNumber_root.integer,
			[latestSurplusSequenceNumber_newCommitment.integer],
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

	return { tx, encEvent };
}
