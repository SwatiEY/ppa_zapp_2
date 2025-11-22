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
	splitCommitments,
	markNullified,
} from "./common/commitment-storage.mjs";
import { generateProof } from "./common/zokrates.mjs";
import { getMembershipWitness, getRoot } from "./common/timber.mjs";
import {
	decompressStarlightKey,
	compressStarlightKey,
	encrypt,
	decrypt,
	poseidonHash,
	scalarMult,
} from "./common/number-theory.mjs";

const { generalise } = GN;
const db = "/app/orchestration/common/db/preimage.json";
const keyDb = "/app/orchestration/common/db/key.json";

export class SetSurplusThresholdManager {
	constructor(web3) {
		this.web3 = web3;
	}

	async init() {
		this.instance = await getContractInstance("SyntheticPpaShield");
		this.contractAddr = await getContractAddress("SyntheticPpaShield");
	}

	async setSurplusThreshold(
		_surplusThresholdParam,
		_surplusThreshold_newOwnerPublicKey = 0
	) {
		const instance = this.instance;
		const contractAddr = this.contractAddr;
		const web3 = this.web3;

		const msgValue = 0;
		const surplusThresholdParam = generalise(_surplusThresholdParam);
		let surplusThreshold_newOwnerPublicKey = generalise(
			_surplusThreshold_newOwnerPublicKey
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

		const surplusThreshold_stateVarId = generalise(86).hex(32);

		let surplusThreshold_commitmentExists = true;
		let surplusThreshold_witnessRequired = true;

		const surplusThreshold_commitment = await getCurrentWholeCommitment(
			surplusThreshold_stateVarId
		);

		let surplusThreshold_preimage = {
			value: 0,
			salt: 0,
			commitment: 0,
		};
		if (!surplusThreshold_commitment) {
			surplusThreshold_commitmentExists = false;
			surplusThreshold_witnessRequired = false;
		} else {
			surplusThreshold_preimage = surplusThreshold_commitment.preimage;
		}

		// read preimage for whole state
		surplusThreshold_newOwnerPublicKey =
			_surplusThreshold_newOwnerPublicKey === 0
				? generalise(
						await instance.methods
							.zkpPublicKeys(await instance.methods.owner().call())
							.call()
				  )
				: surplusThreshold_newOwnerPublicKey;

		const surplusThreshold_currentCommitment = surplusThreshold_commitmentExists
			? generalise(surplusThreshold_commitment._id)
			: generalise(0);
		const surplusThreshold_prev = generalise(surplusThreshold_preimage.value);
		const surplusThreshold_prevSalt = generalise(
			surplusThreshold_preimage.salt
		);

		// non-secret line would go here but has been filtered out

		let surplusThreshold = generalise(
			parseInt(surplusThresholdParam.integer, 10)
		);

		// Extract set membership witness:

		// generate witness for whole state
		const surplusThreshold_emptyPath = new Array(32).fill(0);
		const surplusThreshold_witness = surplusThreshold_witnessRequired
			? await getMembershipWitness(
					"SyntheticPpaShield",
					surplusThreshold_currentCommitment.integer
			  )
			: {
					index: 0,
					path: surplusThreshold_emptyPath,
					root: (await getRoot("SyntheticPpaShield")) || 0,
			  };
		const surplusThreshold_index = generalise(surplusThreshold_witness.index);
		const surplusThreshold_root = generalise(surplusThreshold_witness.root);
		const surplusThreshold_path = generalise(surplusThreshold_witness.path).all;

		// Calculate nullifier(s):

		let surplusThreshold_nullifier = surplusThreshold_commitmentExists
			? poseidonHash([
					BigInt(surplusThreshold_stateVarId),
					BigInt(secretKey.hex(32)),
					BigInt(surplusThreshold_prevSalt.hex(32)),
			  ])
			: poseidonHash([
					BigInt(surplusThreshold_stateVarId),
					BigInt(generalise(0).hex(32)),
					BigInt(surplusThreshold_prevSalt.hex(32)),
			  ]);

		surplusThreshold_nullifier = generalise(surplusThreshold_nullifier.hex(32)); // truncate

		// Calculate commitment(s):

		const surplusThreshold_newSalt = generalise(utils.randomHex(31));

		let surplusThreshold_newCommitment = poseidonHash([
			BigInt(surplusThreshold_stateVarId),
			BigInt(surplusThreshold.hex(32)),
			BigInt(surplusThreshold_newOwnerPublicKey.hex(32)),
			BigInt(surplusThreshold_newSalt.hex(32)),
		]);

		surplusThreshold_newCommitment = generalise(
			surplusThreshold_newCommitment.hex(32)
		); // truncate

		// Call Zokrates to generate the proof:

		const allInputs = [
			surplusThresholdParam.integer,
			surplusThreshold_commitmentExists
				? secretKey.integer
				: generalise(0).integer,
			surplusThreshold_nullifier.integer,

			surplusThreshold_prev.integer,
			surplusThreshold_prevSalt.integer,
			surplusThreshold_commitmentExists ? 0 : 1,
			surplusThreshold_root.integer,
			surplusThreshold_index.integer,
			surplusThreshold_path.integer,
			surplusThreshold_newOwnerPublicKey.integer,
			surplusThreshold_newSalt.integer,
			surplusThreshold_newCommitment.integer,
		].flat(Infinity);
		const res = await generateProof("setSurplusThreshold", allInputs);
		const proof = generalise(Object.values(res.proof).flat(Infinity))
			.map((coeff) => coeff.integer)
			.flat(Infinity);

		let BackupData = [];

		// Encrypt pre-image for state variable surplusThreshold as a backup:

		const surplusThreshold_bcipherText = encrypt(
			[
				BigInt(surplusThreshold_newSalt.hex(32)),
				BigInt(surplusThreshold_stateVarId),
				BigInt(surplusThreshold.hex(32)),
			],
			masterZkpSecretKey.hex(32),
			[
				decompressStarlightKey(masterZkpPublicKey)[0].hex(32),
				decompressStarlightKey(masterZkpPublicKey)[1].hex(32),
			]
		);

		let surplusThreshold_cipherText_combined = {
			varName: "surplusThreshold",
			cipherText: surplusThreshold_bcipherText,
			ephPublicKey: masterZkpPublicKey.hex(32),
		};

		BackupData.push(surplusThreshold_cipherText_combined);

		// Send transaction to the blockchain:

		const txData = await instance.methods
			.setSurplusThreshold(
				{
					customInputs: [1],
					newNullifiers: [surplusThreshold_nullifier.integer],
					commitmentRoot: surplusThreshold_root.integer,
					checkNullifiers: [],
					newCommitments: [surplusThreshold_newCommitment.integer],
					cipherText: [],
					encKeys: [],
				},
				proof,
				BackupData
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

		let encBackupEvent = "";

		try {
			encBackupEvent = await instance.getPastEvents("EncryptedBackupData");
		} catch (err) {
			console.log("No encrypted backup event");
		}

		// Write new commitment preimage to db:

		if (surplusThreshold_commitmentExists)
			await markNullified(
				surplusThreshold_currentCommitment,
				secretKey.hex(32)
			);

		await storeCommitment({
			hash: surplusThreshold_newCommitment,
			name: "surplusThreshold",
			mappingKey: null,
			preimage: {
				stateVarId: generalise(surplusThreshold_stateVarId),
				value: surplusThreshold,
				salt: surplusThreshold_newSalt,
				publicKey: surplusThreshold_newOwnerPublicKey,
			},
			secretKey:
				surplusThreshold_newOwnerPublicKey.integer === publicKey.integer
					? secretKey
					: null,
			isNullified: false,
		});

		return { tx, encEvent, encBackupEvent };
	}
}
