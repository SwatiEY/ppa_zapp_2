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

export default async function setVolumeShare(
	_volumeShareParam,
	_volumeShare_newOwnerPublicKey = 0
) {
	// Initialisation of variables:

	const instance = await getContractInstance("SyntheticPpaShield");

	const contractAddr = await getContractAddress("SyntheticPpaShield");

	const msgValue = 0;
	const volumeShareParam = generalise(_volumeShareParam);
	let volumeShare_newOwnerPublicKey = generalise(
		_volumeShare_newOwnerPublicKey
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

	const volumeShare_stateVarId = generalise(9).hex(32);

	let volumeShare_commitmentExists = true;
	let volumeShare_witnessRequired = true;

	const volumeShare_commitment = await getCurrentWholeCommitment(
		volumeShare_stateVarId
	);

	let volumeShare_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!volumeShare_commitment) {
		volumeShare_commitmentExists = false;
		volumeShare_witnessRequired = false;
	} else {
		volumeShare_preimage = volumeShare_commitment.preimage;
	}

	// read preimage for whole state
	volumeShare_newOwnerPublicKey =
		_volumeShare_newOwnerPublicKey === 0
			? generalise(
					await instance.methods
						.zkpPublicKeys(await instance.methods.owner().call())
						.call()
			  )
			: volumeShare_newOwnerPublicKey;

	const volumeShare_currentCommitment = volumeShare_commitmentExists
		? generalise(volumeShare_commitment._id)
		: generalise(0);
	const volumeShare_prev = generalise(volumeShare_preimage.value);
	const volumeShare_prevSalt = generalise(volumeShare_preimage.salt);

	// Extract set membership witness:

	// generate witness for whole state
	const volumeShare_emptyPath = new Array(32).fill(0);
	const volumeShare_witness = volumeShare_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				volumeShare_currentCommitment.integer
		  )
		: {
				index: 0,
				path: volumeShare_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const volumeShare_index = generalise(volumeShare_witness.index);
	const volumeShare_root = generalise(volumeShare_witness.root);
	const volumeShare_path = generalise(volumeShare_witness.path).all;

	let volumeShare = parseInt(volumeShareParam.integer, 10);

	volumeShare = generalise(volumeShare);

	// Calculate nullifier(s):

	let volumeShare_nullifier = volumeShare_commitmentExists
		? poseidonHash([
				BigInt(volumeShare_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(volumeShare_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(volumeShare_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(volumeShare_prevSalt.hex(32)),
		  ]);

	volumeShare_nullifier = generalise(volumeShare_nullifier.hex(32)); // truncate


	// Calculate commitment(s):

	const volumeShare_newSalt = generalise(utils.randomHex(31));

	let volumeShare_newCommitment = poseidonHash([
		BigInt(volumeShare_stateVarId),
		BigInt(volumeShare.hex(32)),
		BigInt(volumeShare_newOwnerPublicKey.hex(32)),
		BigInt(volumeShare_newSalt.hex(32)),
	]);

	volumeShare_newCommitment = generalise(volumeShare_newCommitment.hex(32)); // truncate

	// Call Zokrates to generate the proof:

	const allInputs = [
		volumeShareParam.integer,
		volumeShare_commitmentExists ? secretKey.integer : generalise(0).integer,
		volumeShare_nullifier.integer,
		volumeShare_prev.integer,
		volumeShare_prevSalt.integer,
		volumeShare_commitmentExists ? 0 : 1,
		volumeShare_root.integer,
		volumeShare_index.integer,
		volumeShare_path.integer,
		volumeShare_newOwnerPublicKey.integer,
		volumeShare_newSalt.integer,
		volumeShare_newCommitment.integer,
	].flat(Infinity);
	const res = await generateProof("setVolumeShare", allInputs);
	const proof = generalise(Object.values(res.proof).flat(Infinity))
		.map((coeff) => coeff.integer)
		.flat(Infinity);

	// Send transaction to the blockchain:

	const txData = await instance.methods
		.setVolumeShare(
			[volumeShare_nullifier.integer],
			volumeShare_root.integer,
			[volumeShare_newCommitment.integer],
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

	if (volumeShare_commitmentExists)
		await markNullified(volumeShare_currentCommitment, secretKey.hex(32));

	await storeCommitment({
		hash: volumeShare_newCommitment,
		name: "volumeShare",
		mappingKey: null,
		preimage: {
			stateVarId: generalise(volumeShare_stateVarId),
			value: volumeShare,
			salt: volumeShare_newSalt,
			publicKey: volumeShare_newOwnerPublicKey,
		},
		secretKey:
			volumeShare_newOwnerPublicKey.integer === publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	return { tx, encEvent };
}
