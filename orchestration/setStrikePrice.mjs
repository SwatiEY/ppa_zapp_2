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

export default async function setStrikePrice(
	_strikePriceParam,
	_strikePrice_newOwnerPublicKey = 0
) {
	// Initialisation of variables:

	const instance = await getContractInstance("SyntheticPpaShield");

	const contractAddr = await getContractAddress("SyntheticPpaShield");

	const msgValue = 0;
	const strikePriceParam = generalise(_strikePriceParam);
	let strikePrice_newOwnerPublicKey = generalise(
		_strikePrice_newOwnerPublicKey
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

	const strikePrice_stateVarId = generalise(5).hex(32);

	let strikePrice_commitmentExists = true;
	let strikePrice_witnessRequired = true;

	const strikePrice_commitment = await getCurrentWholeCommitment(
		strikePrice_stateVarId
	);

	let strikePrice_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!strikePrice_commitment) {
		strikePrice_commitmentExists = false;
		strikePrice_witnessRequired = false;
	} else {
		strikePrice_preimage = strikePrice_commitment.preimage;
	}

	// read preimage for whole state
	strikePrice_newOwnerPublicKey =
		_strikePrice_newOwnerPublicKey === 0
			? generalise(
					await instance.methods
						.zkpPublicKeys(await instance.methods.owner().call())
						.call()
			  )
			: strikePrice_newOwnerPublicKey;

	const strikePrice_currentCommitment = strikePrice_commitmentExists
		? generalise(strikePrice_commitment._id)
		: generalise(0);
	const strikePrice_prev = generalise(strikePrice_preimage.value);
	const strikePrice_prevSalt = generalise(strikePrice_preimage.salt);

	// Extract set membership witness:

	// generate witness for whole state
	const strikePrice_emptyPath = new Array(32).fill(0);
	const strikePrice_witness = strikePrice_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				strikePrice_currentCommitment.integer
		  )
		: {
				index: 0,
				path: strikePrice_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const strikePrice_index = generalise(strikePrice_witness.index);
	const strikePrice_root = generalise(strikePrice_witness.root);
	const strikePrice_path = generalise(strikePrice_witness.path).all;

	let strikePrice = parseInt(strikePriceParam.integer, 10);

	strikePrice = generalise(strikePrice);

	// Calculate nullifier(s):

	let strikePrice_nullifier = strikePrice_commitmentExists
		? poseidonHash([
				BigInt(strikePrice_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(strikePrice_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(strikePrice_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(strikePrice_prevSalt.hex(32)),
		  ]);

	strikePrice_nullifier = generalise(strikePrice_nullifier.hex(32)); // truncate

	

	// Calculate commitment(s):

	const strikePrice_newSalt = generalise(utils.randomHex(31));

	let strikePrice_newCommitment = poseidonHash([
		BigInt(strikePrice_stateVarId),
		BigInt(strikePrice.hex(32)),
		BigInt(strikePrice_newOwnerPublicKey.hex(32)),
		BigInt(strikePrice_newSalt.hex(32)),
	]);

	strikePrice_newCommitment = generalise(strikePrice_newCommitment.hex(32)); // truncate

	// Call Zokrates to generate the proof:

	const allInputs = [
		strikePriceParam.integer,
		strikePrice_commitmentExists ? secretKey.integer : generalise(0).integer,
		strikePrice_nullifier.integer,
		strikePrice_prev.integer,
		strikePrice_prevSalt.integer,
		strikePrice_commitmentExists ? 0 : 1,
		strikePrice_root.integer,
		strikePrice_index.integer,
		strikePrice_path.integer,
		strikePrice_newOwnerPublicKey.integer,
		strikePrice_newSalt.integer,
		strikePrice_newCommitment.integer,
	].flat(Infinity);
	const res = await generateProof("setStrikePrice", allInputs);
	const proof = generalise(Object.values(res.proof).flat(Infinity))
		.map((coeff) => coeff.integer)
		.flat(Infinity);

	// Send transaction to the blockchain:

	const txData = await instance.methods
		.setStrikePrice(
			[strikePrice_nullifier.integer],
			strikePrice_root.integer,
			[strikePrice_newCommitment.integer],
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

	if (strikePrice_commitmentExists)
		await markNullified(strikePrice_currentCommitment, secretKey.hex(32));
	
	await storeCommitment({
		hash: strikePrice_newCommitment,
		name: "strikePrice",
		mappingKey: null,
		preimage: {
			stateVarId: generalise(strikePrice_stateVarId),
			value: strikePrice,
			salt: strikePrice_newSalt,
			publicKey: strikePrice_newOwnerPublicKey,
		},
		secretKey:
			strikePrice_newOwnerPublicKey.integer === publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	return { tx, encEvent };
}
