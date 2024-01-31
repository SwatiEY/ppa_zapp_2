// SPDX-License-Identifier: CC0

pragma solidity ^0.8.0;

import "./verify/IVerifier.sol";
import "./merkle-tree/MerkleTree.sol";

contract SyntheticPpaShield is MerkleTree {


          enum FunctionNames { setStrikePrice, setBundlePrice, setShortfallThreshold, setShortfallPeriods, setSurplusThreshold, setSurplusPeriods, setDailyInterestRate, setExpiryDateOfContract, setVolumeShare, setSequenceNumberInterval, initSequenceNumber, initSurplusSequenceNumber, setInitialContractParams, calculateCfd }

          IVerifier private verifier;

          mapping(uint256 => uint256[]) public vks; // indexed to by an enum uint(FunctionNames)

          mapping(uint256 => uint256) public nullifiers;

          mapping(uint256 => uint256) public commitmentRoots;

          uint256 public latestRoot;

          mapping(address => uint256) public zkpPublicKeys;

          struct Inputs {
            uint[] newNullifiers;
						uint[] checkNullifiers;
						uint commitmentRoot;
						uint[] newCommitments;
						uint[] customInputs;
          }



        function registerZKPPublicKey(uint256 pk) external {
      		zkpPublicKeys[msg.sender] = pk;
      	}
        


        function verify(
      		uint256[] memory proof,
      		uint256 functionId,
      		Inputs memory _inputs
      	) private {
        
          uint[] memory customInputs = _inputs.customInputs;

          uint[] memory newNullifiers = _inputs.newNullifiers;

          uint[] memory checkNullifiers = _inputs.checkNullifiers;

          uint[] memory newCommitments = _inputs.newCommitments;

          for (uint i; i < newNullifiers.length; i++) {
      			uint n = newNullifiers[i];
      			require(nullifiers[n] == 0, "Nullifier already exists");
      			nullifiers[n] = n;
      		}

          for (uint i; i < checkNullifiers.length; i++) {
            uint n = checkNullifiers[i];
            require(nullifiers[n] == 0, "Nullifier already exists");
          }

          require(commitmentRoots[_inputs.commitmentRoot] == _inputs.commitmentRoot, "Input commitmentRoot does not exist.");
          
uint256[] memory inputs = new uint256[](customInputs.length + newNullifiers.length + checkNullifiers.length + (newNullifiers.length > 0 ? 1 : 0) + newCommitments.length);
         
          
          if (functionId == uint(FunctionNames.setStrikePrice)) {
            uint k = 0;
            
            inputs[k++] = newNullifiers[0];
            inputs[k++] = _inputs.commitmentRoot;
            inputs[k++] = newCommitments[0];
            inputs[k++] = 1;
            
          }

          if (functionId == uint(FunctionNames.setBundlePrice)) {
            uint k = 0;
             
            inputs[k++] = newNullifiers[0];
            inputs[k++] = _inputs.commitmentRoot;
            inputs[k++] = newCommitments[0];
            inputs[k++] = 1;
            
          }

          if (functionId == uint(FunctionNames.setShortfallThreshold)) {
            uint k = 0;
            
            inputs[k++] = newNullifiers[0];
            inputs[k++] = _inputs.commitmentRoot;
            inputs[k++] = newCommitments[0];
            inputs[k++] = 1;
            
          }

          if (functionId == uint(FunctionNames.setShortfallPeriods)) {
            uint k = 0;
            
            inputs[k++] = newNullifiers[0];
            inputs[k++] = _inputs.commitmentRoot;
            inputs[k++] = newCommitments[0];
            inputs[k++] = 1;
            
          }

          if (functionId == uint(FunctionNames.setSurplusThreshold)) {
            uint k = 0;
             
            inputs[k++] = newNullifiers[0];
            inputs[k++] = _inputs.commitmentRoot;
            inputs[k++] = newCommitments[0];
            inputs[k++] = 1;
            
          }

          if (functionId == uint(FunctionNames.setSurplusPeriods)) {
            uint k = 0;
 
            inputs[k++] = newNullifiers[0];
            inputs[k++] = _inputs.commitmentRoot;
            inputs[k++] = newCommitments[0];
            inputs[k++] = 1;
            
          }

          if (functionId == uint(FunctionNames.setDailyInterestRate)) {
            uint k = 0;
            inputs[k++] = newNullifiers[0];
            inputs[k++] = _inputs.commitmentRoot;
            inputs[k++] = newCommitments[0];
            inputs[k++] = 1;
            
          }

          if (functionId == uint(FunctionNames.setExpiryDateOfContract)) {
            uint k = 0;

            inputs[k++] = newNullifiers[0];
            inputs[k++] = _inputs.commitmentRoot;
            inputs[k++] = newCommitments[0];
            inputs[k++] = 1;
            
          }

          if (functionId == uint(FunctionNames.setVolumeShare)) {
            uint k = 0;

            inputs[k++] = newNullifiers[0];
            inputs[k++] = _inputs.commitmentRoot;
            inputs[k++] = newCommitments[0];
            inputs[k++] = 1;
            
          }

          if (functionId == uint(FunctionNames.setSequenceNumberInterval)) {
            uint k = 0;
  
            inputs[k++] = newNullifiers[0];
            inputs[k++] = _inputs.commitmentRoot;
            inputs[k++] = newCommitments[0];
            inputs[k++] = 1;
            
          }

          if (functionId == uint(FunctionNames.initSequenceNumber)) {
            uint k = 0;
  
            inputs[k++] = newNullifiers[0];
            inputs[k++] = _inputs.commitmentRoot;
            inputs[k++] = newCommitments[0];
            inputs[k++] = 1;
            
          }

          if (functionId == uint(FunctionNames.initSurplusSequenceNumber)) {
            uint k = 0;
 
            inputs[k++] = newNullifiers[0];
            inputs[k++] = _inputs.commitmentRoot;
            inputs[k++] = newCommitments[0];
            inputs[k++] = 1;
            
          }

          if (functionId == uint(FunctionNames.setInitialContractParams)) {
            uint k = 0;
            inputs[k++] = newNullifiers[0];
            inputs[k++] = _inputs.commitmentRoot;
            inputs[k++] = newCommitments[0];
            inputs[k++] = newNullifiers[1];
            inputs[k++] = newCommitments[1];
            inputs[k++] = newNullifiers[2];
            inputs[k++] = newCommitments[2];
            inputs[k++] = newNullifiers[3];
            inputs[k++] = newCommitments[3];
            inputs[k++] = newNullifiers[4];
            inputs[k++] = newCommitments[4];
            inputs[k++] = newNullifiers[5];
            inputs[k++] = newCommitments[5];
            inputs[k++] = newNullifiers[6];
            inputs[k++] = newCommitments[6];
            inputs[k++] = newNullifiers[7];
            inputs[k++] = newCommitments[7];
            inputs[k++] = newNullifiers[8];
            inputs[k++] = newCommitments[8];
            inputs[k++] = newNullifiers[9];
            inputs[k++] = newCommitments[9];
            inputs[k++] = newNullifiers[10];
            inputs[k++] = newCommitments[10];
            inputs[k++] = newNullifiers[11];
            inputs[k++] = newCommitments[11];
            inputs[k++] = 1;
            
          }

          if (functionId == uint(FunctionNames.calculateCfd)) {
            uint k = 0;

            inputs[k++] = checkNullifiers[0]; 
            inputs[k++] = _inputs.commitmentRoot;
            inputs[k++] = checkNullifiers[1];
            inputs[k++] = checkNullifiers[2];
            inputs[k++] = checkNullifiers[3];
            inputs[k++] = checkNullifiers[4];


            inputs[k++] = newNullifiers[0];
            inputs[k++] = newCommitments[0];
            inputs[k++] = newNullifiers[1];
            inputs[k++] = newCommitments[1];
            inputs[k++] = newNullifiers[2];
            inputs[k++] = newCommitments[2];
            inputs[k++] = newNullifiers[3];
            inputs[k++] = newCommitments[3];

            inputs[k++] = checkNullifiers[5];
            inputs[k++] = newNullifiers[4];
            inputs[k++] = newCommitments[4];
            inputs[k++] = newNullifiers[5];
            inputs[k++] = newCommitments[5];
            inputs[k++] = newNullifiers[6];
            inputs[k++] = newCommitments[6];
            inputs[k++] = newNullifiers[7];
            inputs[k++] = newCommitments[7];
            inputs[k++] = newNullifiers[8];
            inputs[k++] = newCommitments[8];

            inputs[k++] = checkNullifiers[6];
           inputs[k++] = checkNullifiers[7];
            inputs[k++] = newNullifiers[9];
            inputs[k++] = newCommitments[9];
            inputs[k++] = newNullifiers[10];
            inputs[k++] = newCommitments[10];
            inputs[k++] = newNullifiers[11];
            inputs[k++] = newCommitments[11];
          inputs[k++] = checkNullifiers[8];
          inputs[k++] = checkNullifiers[9];
          inputs[k++] = newNullifiers[12];
            inputs[k++] = newCommitments[12];
            inputs[k++] = newNullifiers[13];
            inputs[k++] = newCommitments[13];
            inputs[k++] = newNullifiers[14];
            inputs[k++] = newCommitments[14];

             inputs[k++] = newCommitments[4];
              inputs[k++] = newCommitments[5];
              inputs[k++] = newCommitments[6];
              inputs[k++] = newCommitments[7];
              inputs[k++] = newCommitments[11];
              inputs[k++] = newCommitments[14];
              inputs[k++] = newCommitments[8];

            
          }
          
          bool result = verifier.verify(proof, inputs, vks[functionId]);

          require(result, "The proof has not been verified by the contract");

          if (newCommitments.length > 0) {
      			latestRoot = insertLeaves(newCommitments);
      			commitmentRoots[latestRoot] = latestRoot;
      		}
        }



        address public owner;












        bool public isContractTerminated;











struct Shortfall {
        
        uint256 billNumber;

        uint256 volume;

        uint256 price;
      }
































      constructor  (address verifierAddress, uint256[][] memory vk)   {

         verifier = IVerifier(verifierAddress);
    		  for (uint i = 0; i < vk.length; i++) {
    			  vks[i] = vk[i];
    		  }
owner = msg.sender;
      }


      function setStrikePrice (uint256[] calldata newNullifiers, uint256 commitmentRoot, uint256[] calldata newCommitments, uint256[] calldata proof) public  {

        require(msg.sender == owner, "Caller is unauthorised, it must be the owner");


          Inputs memory inputs;

          inputs.customInputs = new uint[](1);
        	inputs.customInputs[0] = 1;


          inputs.newNullifiers = newNullifiers;
           

          inputs.commitmentRoot = commitmentRoot;

          inputs.newCommitments = newCommitments;

           verify(proof, uint(FunctionNames.setStrikePrice), inputs);
      }


      function setBundlePrice (uint256[] calldata newNullifiers, uint256 commitmentRoot, uint256[] calldata newCommitments, uint256[] calldata proof) public  {

        require(msg.sender == owner, "Caller is unauthorised, it must be the owner");


          Inputs memory inputs;

          inputs.customInputs = new uint[](1);
        	inputs.customInputs[0] = 1;
 

          inputs.newNullifiers = newNullifiers;
           

          inputs.commitmentRoot = commitmentRoot;

          inputs.newCommitments = newCommitments;

           verify(proof, uint(FunctionNames.setBundlePrice), inputs);
      }


      function setShortfallThreshold (uint256[] calldata newNullifiers, uint256 commitmentRoot, uint256[] calldata newCommitments, uint256[] calldata proof) public  {

        require(msg.sender == owner, "Caller is unauthorised, it must be the owner");


          Inputs memory inputs;

          inputs.customInputs = new uint[](1);
        	inputs.customInputs[0] = 1;

 

          inputs.newNullifiers = newNullifiers;
           

          inputs.commitmentRoot = commitmentRoot;

          inputs.newCommitments = newCommitments;

           verify(proof, uint(FunctionNames.setShortfallThreshold), inputs);
      }


      function setShortfallPeriods (uint256[] calldata newNullifiers, uint256 commitmentRoot, uint256[] calldata newCommitments, uint256[] calldata proof) public  {

        require(msg.sender == owner, "Caller is unauthorised, it must be the owner");


          Inputs memory inputs;

          inputs.customInputs = new uint[](1);
        	inputs.customInputs[0] = 1;

      

          inputs.newNullifiers = newNullifiers;
           

          inputs.commitmentRoot = commitmentRoot;

          inputs.newCommitments = newCommitments;

           verify(proof, uint(FunctionNames.setShortfallPeriods), inputs);
      }


      function setSurplusThreshold (uint256[] calldata newNullifiers, uint256 commitmentRoot, uint256[] calldata newCommitments, uint256[] calldata proof) public  {

        require(msg.sender == owner, "Caller is unauthorised, it must be the owner");


          Inputs memory inputs;

          inputs.customInputs = new uint[](1);
        	inputs.customInputs[0] = 1;

        

          inputs.newNullifiers = newNullifiers;
           

          inputs.commitmentRoot = commitmentRoot;

          inputs.newCommitments = newCommitments;

           verify(proof, uint(FunctionNames.setSurplusThreshold), inputs);
      }


      function setSurplusPeriods (uint256[] calldata newNullifiers, uint256 commitmentRoot, uint256[] calldata newCommitments, uint256[] calldata proof) public  {

        require(msg.sender == owner, "Caller is unauthorised, it must be the owner");


          Inputs memory inputs;

          inputs.customInputs = new uint[](1);
        	inputs.customInputs[0] = 1;

       

          inputs.newNullifiers = newNullifiers;
           

          inputs.commitmentRoot = commitmentRoot;

          inputs.newCommitments = newCommitments;

           verify(proof, uint(FunctionNames.setSurplusPeriods), inputs);
      }


      function setDailyInterestRate (uint256[] calldata newNullifiers, uint256 commitmentRoot, uint256[] calldata newCommitments, uint256[] calldata proof) public  {

        require(msg.sender == owner, "Caller is unauthorised, it must be the owner");


          Inputs memory inputs;

          inputs.customInputs = new uint[](1);
        	inputs.customInputs[0] = 1;


          inputs.newNullifiers = newNullifiers;
           

          inputs.commitmentRoot = commitmentRoot;

          inputs.newCommitments = newCommitments;

           verify(proof, uint(FunctionNames.setDailyInterestRate), inputs);
      }


      function setExpiryDateOfContract (uint256[] calldata newNullifiers, uint256 commitmentRoot, uint256[] calldata newCommitments, uint256[] calldata proof) public  {

        require(msg.sender == owner, "Caller is unauthorised, it must be the owner");


          Inputs memory inputs;

          inputs.customInputs = new uint[](1);
        	inputs.customInputs[0] = 1;



          inputs.newNullifiers = newNullifiers;
           

          inputs.commitmentRoot = commitmentRoot;

          inputs.newCommitments = newCommitments;

           verify(proof, uint(FunctionNames.setExpiryDateOfContract), inputs);
      }


      function setVolumeShare (uint256[] calldata newNullifiers, uint256 commitmentRoot, uint256[] calldata newCommitments, uint256[] calldata proof) public  {

        require(msg.sender == owner, "Caller is unauthorised, it must be the owner");


          Inputs memory inputs;

          inputs.customInputs = new uint[](1);
        	inputs.customInputs[0] = 1;


          inputs.newNullifiers = newNullifiers;
           

          inputs.commitmentRoot = commitmentRoot;

          inputs.newCommitments = newCommitments;

           verify(proof, uint(FunctionNames.setVolumeShare), inputs);
      }


      function setSequenceNumberInterval (uint256[] calldata newNullifiers, uint256 commitmentRoot, uint256[] calldata newCommitments, uint256[] calldata proof) public  {

        require(msg.sender == owner, "Caller is unauthorised, it must be the owner");


          Inputs memory inputs;

          inputs.customInputs = new uint[](1);
        	inputs.customInputs[0] = 1;


          inputs.newNullifiers = newNullifiers;
           

          inputs.commitmentRoot = commitmentRoot;

          inputs.newCommitments = newCommitments;

           verify(proof, uint(FunctionNames.setSequenceNumberInterval), inputs);
      }


      function initSequenceNumber (uint256[] calldata newNullifiers, uint256 commitmentRoot, uint256[] calldata newCommitments, uint256[] calldata proof) public  {

        require(msg.sender == owner, "Caller is unauthorised, it must be the owner");


          Inputs memory inputs;

          inputs.customInputs = new uint[](1);
        	inputs.customInputs[0] = 1;

    

          inputs.newNullifiers = newNullifiers;
           

          inputs.commitmentRoot = commitmentRoot;

          inputs.newCommitments = newCommitments;

           verify(proof, uint(FunctionNames.initSequenceNumber), inputs);
      }


      function initSurplusSequenceNumber (uint256[] calldata newNullifiers, uint256 commitmentRoot, uint256[] calldata newCommitments, uint256[] calldata proof) public  {

        require(msg.sender == owner, "Caller is unauthorised, it must be the owner");


          Inputs memory inputs;

          inputs.customInputs = new uint[](1);
        	inputs.customInputs[0] = 1;


          inputs.newNullifiers = newNullifiers;
           

          inputs.commitmentRoot = commitmentRoot;

          inputs.newCommitments = newCommitments;

           verify(proof, uint(FunctionNames.initSurplusSequenceNumber), inputs);
      }


      function setInitialContractParams (uint256[] calldata newNullifiers, uint256 commitmentRoot, uint256[] calldata newCommitments, uint256[] calldata proof) public  {

        
require(isContractTerminated == false, "The contract is terminated!");

          Inputs memory inputs;

          inputs.customInputs = new uint[](1);
        	inputs.customInputs[0] = 1;



          inputs.newNullifiers = newNullifiers;
           

          inputs.commitmentRoot = commitmentRoot;

          inputs.newCommitments = newCommitments;

           verify(proof, uint(FunctionNames.setInitialContractParams), inputs);
      }


      function calculateCfd (uint256[] calldata newNullifiers, uint256 commitmentRoot, uint256[] calldata newCommitments, uint256[] calldata checkNullifiers, uint256[] calldata proof) public  {

        
require(isContractTerminated == false, "The contract is terminated!");

 

          Inputs memory inputs;

          inputs.customInputs = new uint[](7);
          inputs.customInputs[0] = newCommitments[4];
            inputs.customInputs[1] = newCommitments[5];
            inputs.customInputs[2] = newCommitments[6];
            inputs.customInputs[3] = newCommitments[7];
            inputs.customInputs[4] = newCommitments[11];
            inputs.customInputs[5] = newCommitments[14];
            inputs.customInputs[6] = newCommitments[8];
      
              

          inputs.newNullifiers = newNullifiers;
           

        inputs.checkNullifiers = checkNullifiers;

          inputs.commitmentRoot = commitmentRoot;

          inputs.newCommitments = newCommitments;

           verify(proof, uint(FunctionNames.calculateCfd), inputs);
      }


      function terminateContract () public  {

         require(msg.sender == owner, "Caller is unauthorised, it must be the owner");
isContractTerminated = true;
      }
}