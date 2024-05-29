/* eslint-disable prettier/prettier, camelcase, prefer-const, no-unused-vars */
import config from "config";
import utils from "zkp-utils";
import GN from "general-number";
import fs from "fs";

import {
	getContractInstance,
	getContractAddress,
	registerKey,
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

export default async function setStartDateOfContract(
	_startDateOfContractParam,
	_startDateOfContract_newOwnerPublicKey = 0
) {
	// Initialisation of variables:

	const instance = await getContractInstance("SyntheticPpaShield");

	const contractAddr = await getContractAddress("SyntheticPpaShield");

	const msgValue = 0;
	const startDateOfContractParam = generalise(_startDateOfContractParam);
	let startDateOfContract_newOwnerPublicKey = generalise(
		_startDateOfContract_newOwnerPublicKey
	);

	// Read dbs for keys and previous commitment values:

	if (!fs.existsSync(keyDb))
		await registerKey(utils.randomHex(31), "SyntheticPpaShield", true);
	const keys = JSON.parse(
		fs.readFileSync(keyDb, "utf-8", (err) => {
			console.log(err);
		})
	);
	const secretKey = generalise(keys.secretKey);
	const publicKey = generalise(keys.publicKey);

	// Initialise commitment preimage of whole state:

	const startDateOfContract_stateVarId = generalise(13).hex(32);

	let startDateOfContract_commitmentExists = true;
	let startDateOfContract_witnessRequired = true;

	const startDateOfContract_commitment = await getCurrentWholeCommitment(
		startDateOfContract_stateVarId
	);

	let startDateOfContract_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!startDateOfContract_commitment) {
		startDateOfContract_commitmentExists = false;
		startDateOfContract_witnessRequired = false;
	} else {
		startDateOfContract_preimage = startDateOfContract_commitment.preimage;
	}

	// read preimage for whole state
	startDateOfContract_newOwnerPublicKey =
		_startDateOfContract_newOwnerPublicKey === 0
			? generalise(
					await instance.methods
						.zkpPublicKeys(await instance.methods.owner().call())
						.call()
			  )
			: startDateOfContract_newOwnerPublicKey;

	const startDateOfContract_currentCommitment = startDateOfContract_commitmentExists
		? generalise(startDateOfContract_commitment._id)
		: generalise(0);
	const startDateOfContract_prev = generalise(
		startDateOfContract_preimage.value
	);
	const startDateOfContract_prevSalt = generalise(
		startDateOfContract_preimage.salt
	);

	// Extract set membership witness:

	// generate witness for whole state
	const startDateOfContract_emptyPath = new Array(32).fill(0);
	const startDateOfContract_witness = startDateOfContract_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				startDateOfContract_currentCommitment.integer
		  )
		: {
				index: 0,
				path: startDateOfContract_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const startDateOfContract_index = generalise(
		startDateOfContract_witness.index
	);
	const startDateOfContract_root = generalise(startDateOfContract_witness.root);
	const startDateOfContract_path = generalise(startDateOfContract_witness.path)
		.all;

	let startDateOfContract = parseInt(startDateOfContractParam.integer, 10);

	startDateOfContract = generalise(startDateOfContract);

	// Calculate nullifier(s):

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

	// Calculate commitment(s):

	const startDateOfContract_newSalt = generalise(utils.randomHex(31));

	let startDateOfContract_newCommitment = poseidonHash([
		BigInt(startDateOfContract_stateVarId),
		BigInt(startDateOfContract.hex(32)),
		BigInt(startDateOfContract_newOwnerPublicKey.hex(32)),
		BigInt(startDateOfContract_newSalt.hex(32)),
	]);

	startDateOfContract_newCommitment = generalise(
		startDateOfContract_newCommitment.hex(32)
	); // truncate

	// Call Zokrates to generate the proof:

	const allInputs = [
		startDateOfContractParam.integer,
		startDateOfContract_commitmentExists
			? secretKey.integer
			: generalise(0).integer,
		startDateOfContract_nullifier.integer,
		startDateOfContract_prev.integer,
		startDateOfContract_prevSalt.integer,
		startDateOfContract_commitmentExists ? 0 : 1,
		startDateOfContract_root.integer,
		startDateOfContract_index.integer,
		startDateOfContract_path.integer,
		startDateOfContract_newOwnerPublicKey.integer,
		startDateOfContract_newSalt.integer,
		startDateOfContract_newCommitment.integer,
	].flat(Infinity);
	const res = await generateProof("setStartDateOfContract", allInputs);
	const proof = generalise(Object.values(res.proof).flat(Infinity))
		.map((coeff) => coeff.integer)
		.flat(Infinity);

	// Send transaction to the blockchain:

	const txData = await instance.methods
		.setStartDateOfContract(
			[startDateOfContract_nullifier.integer],
			startDateOfContract_root.integer,
			[startDateOfContract_newCommitment.integer],
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

	if (startDateOfContract_commitmentExists)
		await markNullified(
			startDateOfContract_currentCommitment,
			secretKey.hex(32)
		);
	

	await storeCommitment({
		hash: startDateOfContract_newCommitment,
		name: "startDateOfContract",
		mappingKey: null,
		preimage: {
			stateVarId: generalise(startDateOfContract_stateVarId),
			value: startDateOfContract,
			salt: startDateOfContract_newSalt,
			publicKey: startDateOfContract_newOwnerPublicKey,
		},
		secretKey:
			startDateOfContract_newOwnerPublicKey.integer === publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	return { tx, encEvent };
}
