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

export default async function setExpiryDateOfContract(
	_expiryDateOfContractParam,
	_expiryDateOfContract_newOwnerPublicKey = 0
) {
	// Initialisation of variables:

	const instance = await getContractInstance("SyntheticPpaShield");

	const contractAddr = await getContractAddress("SyntheticPpaShield");

	const msgValue = 0;
	const expiryDateOfContractParam = generalise(_expiryDateOfContractParam);
	let expiryDateOfContract_newOwnerPublicKey = generalise(
		_expiryDateOfContract_newOwnerPublicKey
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

	const expiryDateOfContract_stateVarId = generalise(15).hex(32);

	let expiryDateOfContract_commitmentExists = true;
	let expiryDateOfContract_witnessRequired = true;

	const expiryDateOfContract_commitment = await getCurrentWholeCommitment(
		expiryDateOfContract_stateVarId
	);

	let expiryDateOfContract_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!expiryDateOfContract_commitment) {
		expiryDateOfContract_commitmentExists = false;
		expiryDateOfContract_witnessRequired = false;
	} else {
		expiryDateOfContract_preimage = expiryDateOfContract_commitment.preimage;
	}

	// read preimage for whole state
	expiryDateOfContract_newOwnerPublicKey =
		_expiryDateOfContract_newOwnerPublicKey === 0
			? generalise(
					await instance.methods
						.zkpPublicKeys(await instance.methods.owner().call())
						.call()
			  )
			: expiryDateOfContract_newOwnerPublicKey;

	const expiryDateOfContract_currentCommitment = expiryDateOfContract_commitmentExists
		? generalise(expiryDateOfContract_commitment._id)
		: generalise(0);
	const expiryDateOfContract_prev = generalise(
		expiryDateOfContract_preimage.value
	);
	const expiryDateOfContract_prevSalt = generalise(
		expiryDateOfContract_preimage.salt
	);

	// Extract set membership witness:

	// generate witness for whole state
	const expiryDateOfContract_emptyPath = new Array(32).fill(0);
	const expiryDateOfContract_witness = expiryDateOfContract_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				expiryDateOfContract_currentCommitment.integer
		  )
		: {
				index: 0,
				path: expiryDateOfContract_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const expiryDateOfContract_index = generalise(
		expiryDateOfContract_witness.index
	);
	const expiryDateOfContract_root = generalise(
		expiryDateOfContract_witness.root
	);
	const expiryDateOfContract_path = generalise(
		expiryDateOfContract_witness.path
	).all;

	let expiryDateOfContract = parseInt(expiryDateOfContractParam.integer, 10);

	expiryDateOfContract = generalise(expiryDateOfContract);

	// Calculate nullifier(s):

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


	// Calculate commitment(s):

	const expiryDateOfContract_newSalt = generalise(utils.randomHex(31));

	let expiryDateOfContract_newCommitment = poseidonHash([
		BigInt(expiryDateOfContract_stateVarId),
		BigInt(expiryDateOfContract.hex(32)),
		BigInt(expiryDateOfContract_newOwnerPublicKey.hex(32)),
		BigInt(expiryDateOfContract_newSalt.hex(32)),
	]);

	expiryDateOfContract_newCommitment = generalise(
		expiryDateOfContract_newCommitment.hex(32)
	); // truncate

	// Call Zokrates to generate the proof:

	const allInputs = [
		expiryDateOfContractParam.integer,
		expiryDateOfContract_commitmentExists
			? secretKey.integer
			: generalise(0).integer,
		expiryDateOfContract_nullifier.integer,
		expiryDateOfContract_prev.integer,
		expiryDateOfContract_prevSalt.integer,
		expiryDateOfContract_commitmentExists ? 0 : 1,
		expiryDateOfContract_root.integer,
		expiryDateOfContract_index.integer,
		expiryDateOfContract_path.integer,
		expiryDateOfContract_newOwnerPublicKey.integer,
		expiryDateOfContract_newSalt.integer,
		expiryDateOfContract_newCommitment.integer,
	].flat(Infinity);
	const res = await generateProof("setExpiryDateOfContract", allInputs);
	const proof = generalise(Object.values(res.proof).flat(Infinity))
		.map((coeff) => coeff.integer)
		.flat(Infinity);

	// Send transaction to the blockchain:

	const txData = await instance.methods
		.setExpiryDateOfContract(
			[expiryDateOfContract_nullifier.integer],
			expiryDateOfContract_root.integer,
			[expiryDateOfContract_newCommitment.integer],
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

	if (expiryDateOfContract_commitmentExists)
		await markNullified(
			expiryDateOfContract_currentCommitment,
			secretKey.hex(32)
		);
	

	await storeCommitment({
		hash: expiryDateOfContract_newCommitment,
		name: "expiryDateOfContract",
		mappingKey: null,
		preimage: {
			stateVarId: generalise(expiryDateOfContract_stateVarId),
			value: expiryDateOfContract,
			salt: expiryDateOfContract_newSalt,
			publicKey: expiryDateOfContract_newOwnerPublicKey,
		},
		secretKey:
			expiryDateOfContract_newOwnerPublicKey.integer === publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	return { tx, encEvent };
}
