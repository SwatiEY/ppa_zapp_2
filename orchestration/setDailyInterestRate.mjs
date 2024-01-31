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

export default async function setDailyInterestRate(
	_dailyInterestRateParam,
	_dailyInterestRate_newOwnerPublicKey = 0
) {
	// Initialisation of variables:

	const instance = await getContractInstance("SyntheticPpaShield");

	const contractAddr = await getContractAddress("SyntheticPpaShield");

	const msgValue = 0;
	const dailyInterestRateParam = generalise(_dailyInterestRateParam);
	let dailyInterestRate_newOwnerPublicKey = generalise(
		_dailyInterestRate_newOwnerPublicKey
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

	const dailyInterestRate_stateVarId = generalise(11).hex(32);

	let dailyInterestRate_commitmentExists = true;
	let dailyInterestRate_witnessRequired = true;

	const dailyInterestRate_commitment = await getCurrentWholeCommitment(
		dailyInterestRate_stateVarId
	);

	let dailyInterestRate_preimage = {
		value: 0,
		salt: 0,
		commitment: 0,
	};
	if (!dailyInterestRate_commitment) {
		dailyInterestRate_commitmentExists = false;
		dailyInterestRate_witnessRequired = false;
	} else {
		dailyInterestRate_preimage = dailyInterestRate_commitment.preimage;
	}

	// read preimage for whole state
	dailyInterestRate_newOwnerPublicKey =
		_dailyInterestRate_newOwnerPublicKey === 0
			? generalise(
					await instance.methods
						.zkpPublicKeys(await instance.methods.owner().call())
						.call()
			  )
			: dailyInterestRate_newOwnerPublicKey;

	const dailyInterestRate_currentCommitment = dailyInterestRate_commitmentExists
		? generalise(dailyInterestRate_commitment._id)
		: generalise(0);
	const dailyInterestRate_prev = generalise(dailyInterestRate_preimage.value);
	const dailyInterestRate_prevSalt = generalise(
		dailyInterestRate_preimage.salt
	);

	// Extract set membership witness:

	// generate witness for whole state
	const dailyInterestRate_emptyPath = new Array(32).fill(0);
	const dailyInterestRate_witness = dailyInterestRate_witnessRequired
		? await getMembershipWitness(
				"SyntheticPpaShield",
				dailyInterestRate_currentCommitment.integer
		  )
		: {
				index: 0,
				path: dailyInterestRate_emptyPath,
				root: (await getRoot("SyntheticPpaShield")) || 0,
		  };
	const dailyInterestRate_index = generalise(dailyInterestRate_witness.index);
	const dailyInterestRate_root = generalise(dailyInterestRate_witness.root);
	const dailyInterestRate_path = generalise(dailyInterestRate_witness.path).all;

	let dailyInterestRate = parseInt(dailyInterestRateParam.integer, 10);

	dailyInterestRate = generalise(dailyInterestRate);

	// Calculate nullifier(s):

	let dailyInterestRate_nullifier = dailyInterestRate_commitmentExists
		? poseidonHash([
				BigInt(dailyInterestRate_stateVarId),
				BigInt(secretKey.hex(32)),
				BigInt(dailyInterestRate_prevSalt.hex(32)),
		  ])
		: poseidonHash([
				BigInt(dailyInterestRate_stateVarId),
				BigInt(generalise(0).hex(32)),
				BigInt(dailyInterestRate_prevSalt.hex(32)),
		  ]);

	dailyInterestRate_nullifier = generalise(dailyInterestRate_nullifier.hex(32)); // truncate

	// Calculate commitment(s):

	const dailyInterestRate_newSalt = generalise(utils.randomHex(31));

	let dailyInterestRate_newCommitment = poseidonHash([
		BigInt(dailyInterestRate_stateVarId),
		BigInt(dailyInterestRate.hex(32)),
		BigInt(dailyInterestRate_newOwnerPublicKey.hex(32)),
		BigInt(dailyInterestRate_newSalt.hex(32)),
	]);

	dailyInterestRate_newCommitment = generalise(
		dailyInterestRate_newCommitment.hex(32)
	); // truncate

	// Call Zokrates to generate the proof:

	const allInputs = [
		dailyInterestRateParam.integer,
		dailyInterestRate_commitmentExists
			? secretKey.integer
			: generalise(0).integer,
		dailyInterestRate_nullifier.integer,
		dailyInterestRate_prev.integer,
		dailyInterestRate_prevSalt.integer,
		dailyInterestRate_commitmentExists ? 0 : 1,
		dailyInterestRate_root.integer,
		dailyInterestRate_index.integer,
		dailyInterestRate_path.integer,
		dailyInterestRate_newOwnerPublicKey.integer,
		dailyInterestRate_newSalt.integer,
		dailyInterestRate_newCommitment.integer,
	].flat(Infinity);
	const res = await generateProof("setDailyInterestRate", allInputs);
	const proof = generalise(Object.values(res.proof).flat(Infinity))
		.map((coeff) => coeff.integer)
		.flat(Infinity);

	// Send transaction to the blockchain:

	const txData = await instance.methods
		.setDailyInterestRate(
			[dailyInterestRate_nullifier.integer],
			dailyInterestRate_root.integer,
			[dailyInterestRate_newCommitment.integer],
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

	if (dailyInterestRate_commitmentExists)
		await markNullified(dailyInterestRate_currentCommitment, secretKey.hex(32));
	

	await storeCommitment({
		hash: dailyInterestRate_newCommitment,
		name: "dailyInterestRate",
		mappingKey: null,
		preimage: {
			stateVarId: generalise(dailyInterestRate_stateVarId),
			value: dailyInterestRate,
			salt: dailyInterestRate_newSalt,
			publicKey: dailyInterestRate_newOwnerPublicKey,
		},
		secretKey:
			dailyInterestRate_newOwnerPublicKey.integer === publicKey.integer
				? secretKey
				: null,
		isNullified: false,
	});

	return { tx, encEvent };
}
