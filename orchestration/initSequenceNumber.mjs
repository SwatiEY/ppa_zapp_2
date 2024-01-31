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

export default async function initSequenceNumber(
	_latestShortfallSequenceNumber_newOwnerPublicKey = 0
) {
	// Initialisation of variables:

	const instance = await getContractInstance("SyntheticPpaShield");

	const contractAddr = await getContractAddress("SyntheticPpaShield");

	const msgValue = 0;
	let latestShortfallSequenceNumber_newOwnerPublicKey = generalise(
		_latestShortfallSequenceNumber_newOwnerPublicKey
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

	// Extract set membership witness:

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

	let latestShortfallSequenceNumber = 0;

	latestShortfallSequenceNumber = generalise(latestShortfallSequenceNumber);

	// Calculate nullifier(s):

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


	// Calculate commitment(s):

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

	// Call Zokrates to generate the proof:

	const allInputs = [
		latestShortfallSequenceNumber_commitmentExists
			? secretKey.integer
			: generalise(0).integer,
		latestShortfallSequenceNumber_nullifier.integer,
		latestShortfallSequenceNumber_prev.integer,
		latestShortfallSequenceNumber_prevSalt.integer,
		latestShortfallSequenceNumber_commitmentExists ? 0 : 1,
		latestShortfallSequenceNumber_root.integer,
		latestShortfallSequenceNumber_index.integer,
		latestShortfallSequenceNumber_path.integer,
		latestShortfallSequenceNumber_newOwnerPublicKey.integer,
		latestShortfallSequenceNumber_newSalt.integer,
		latestShortfallSequenceNumber_newCommitment.integer,
	].flat(Infinity);
	const res = await generateProof("initSequenceNumber", allInputs);
	const proof = generalise(Object.values(res.proof).flat(Infinity))
		.map((coeff) => coeff.integer)
		.flat(Infinity);

	// Send transaction to the blockchain:

	const txData = await instance.methods
		.initSequenceNumber(
			[latestShortfallSequenceNumber_nullifier.integer],
			latestShortfallSequenceNumber_root.integer,
			[latestShortfallSequenceNumber_newCommitment.integer],
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

	return { tx, encEvent };
}
