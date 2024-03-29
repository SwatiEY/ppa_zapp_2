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

export default async function setBundlePrice(
	_bundlePriceParam,
	_bundlePrice_newOwnerPublicKey = 0
) {
	// Initialisation of variables:

	const instance = await getContractInstance("SyntheticPpaShield");

	const contractAddr = await getContractAddress("SyntheticPpaShield");

	const msgValue = 0;
	const bundlePriceParam = generalise(_bundlePriceParam);
	let bundlePrice_newOwnerPublicKey = generalise(
		_bundlePrice_newOwnerPublicKey
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

	const bundlePrice_stateVarId = generalise(7).hex(32);

	let bundlePrice_commitmentExists = true;
	let bundlePrice_witnessRequired = true;

	const bundlePrice_commitment = await getCurrentWholeCommitment(
		bundlePrice_stateVarId
	);

	let bundlePrice_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!bundlePrice_commitment) {
		bundlePrice_commitmentExists = false;
		bundlePrice_witnessRequired = false;
	} else {
		bundlePrice_preimage = bundlePrice_commitment.preimage;
	}

	// read preimage for whole state
	bundlePrice_newOwnerPublicKey =
		_bundlePrice_newOwnerPublicKey === 0
			? generalise(
					await instance.methods
						.zkpPublicKeys(await instance.methods.owner().call())
						.call()
			  )
			: bundlePrice_newOwnerPublicKey;

	const bundlePrice_currentCommitment = bundlePrice_commitmentExists
		? generalise(bundlePrice_commitment._id)
		: generalise(0);
	const bundlePrice_prev = generalise(bundlePrice_preimage.value);
	const bundlePrice_prevSalt = generalise(bundlePrice_preimage.salt);

	// Extract set membership witness:

	// generate witness for whole state
	const bundlePrice_emptyPath = new Array(32).fill(0);
	const bundlePrice_witness = bundlePrice_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				bundlePrice_currentCommitment.integer
		  )
		: {
				index: 0,
				path: bundlePrice_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const bundlePrice_index = generalise(bundlePrice_witness.index);
	const bundlePrice_root = generalise(bundlePrice_witness.root);
	const bundlePrice_path = generalise(bundlePrice_witness.path).all;

	let bundlePrice = parseInt(bundlePriceParam.integer, 10);

	bundlePrice = generalise(bundlePrice);

	// Calculate nullifier(s):

	let bundlePrice_nullifier = bundlePrice_commitmentExists
		? poseidonHash([
				BigInt(bundlePrice_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(bundlePrice_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(bundlePrice_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(bundlePrice_prevSalt.hex(32)),
		  ]);

	bundlePrice_nullifier = generalise(bundlePrice_nullifier.hex(32)); // truncate


	// Calculate commitment(s):

	const bundlePrice_newSalt = generalise(utils.randomHex(31));

	let bundlePrice_newCommitment = poseidonHash([
		BigInt(bundlePrice_stateVarId),
		BigInt(bundlePrice.hex(32)),
		BigInt(bundlePrice_newOwnerPublicKey.hex(32)),
		BigInt(bundlePrice_newSalt.hex(32)),
	]);

	bundlePrice_newCommitment = generalise(bundlePrice_newCommitment.hex(32)); // truncate

	// Call Zokrates to generate the proof:

	const allInputs = [
		bundlePriceParam.integer,
		bundlePrice_commitmentExists ? secretKey.integer : generalise(0).integer,
		bundlePrice_nullifier.integer,
		bundlePrice_prev.integer,
		bundlePrice_prevSalt.integer,
		bundlePrice_commitmentExists ? 0 : 1,
		bundlePrice_root.integer,
		bundlePrice_index.integer,
		bundlePrice_path.integer,
		bundlePrice_newOwnerPublicKey.integer,
		bundlePrice_newSalt.integer,
		bundlePrice_newCommitment.integer,
	].flat(Infinity);
	const res = await generateProof("setBundlePrice", allInputs);
	const proof = generalise(Object.values(res.proof).flat(Infinity))
		.map((coeff) => coeff.integer)
		.flat(Infinity);

	// Send transaction to the blockchain:

	const txData = await instance.methods
		.setBundlePrice(
			[bundlePrice_nullifier.integer],
			bundlePrice_root.integer,
			[bundlePrice_newCommitment.integer],
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

	if (bundlePrice_commitmentExists)
		await markNullified(bundlePrice_currentCommitment, secretKey.hex(32));
	
	await storeCommitment({
		hash: bundlePrice_newCommitment,
		name: "bundlePrice",
		mappingKey: null,
		preimage: {
			stateVarId: generalise(bundlePrice_stateVarId),
			value: bundlePrice,
			salt: bundlePrice_newSalt,
			publicKey: bundlePrice_newOwnerPublicKey,
		},
		secretKey:
			bundlePrice_newOwnerPublicKey.integer === publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	return { tx, encEvent };
}
