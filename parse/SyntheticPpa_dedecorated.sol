// SPDX-License-Identifier: CC0

pragma solidity ^0.8.0;
contract SyntheticPpa {
address public immutable owner;
uint256 private strikePrice;
uint256 private bundlePrice;
uint256 private volumeShare;
uint256 private dailyInterestRate;
uint256 private startDateOfContract;
uint256 private expiryDateOfContract;
bool public isContractTerminated;

mapping(uint256 => VolumeGap) private shortfalls;
uint256 private latestShortfallSequenceNumber;

mapping(uint256 => VolumeGap) private surpluses;
uint256 private latestSurplusSequenceNumber;

uint256 private sequenceNumberInterval;

struct VolumeGap {
uint256 billNumber;
uint256 volume;
uint256 price;
}

mapping(uint256 => uint256) private generatorCharges;
mapping(uint256 => uint256) private offtakerCharges;
mapping(uint256 => uint256) private generatorInterest;
mapping(uint256 => uint256) private offtakerInterest;
mapping(uint256 => uint256) private negativePriceCharges;

uint256 private numberOfConsecutivePeriodsForShortfall;
uint256 private shortfallThreshold;
uint256 private shortfallChargeSum;
uint256 private shortfallIndex;
mapping(uint256 => uint256) private shortfallCharges;

uint256 private numberOfConsecutivePeriodsForSurplus;
uint256 private surplusThreshold;
uint256 private surplusChargeSum;
uint256 private surplusIndex;
mapping(uint256 => uint256) private surplusCharges;

modifier onlyOwner() {
require(
msg.sender == owner
);
_;
}

constructor() {
owner = msg.sender;
}


function setStrikePrice(uint256 strikePriceParam) public onlyOwner {
require(
msg.sender == owner
);

strikePrice = strikePriceParam;
}

function setBundlePrice(uint256 bundlePriceParam) public onlyOwner {
require(
msg.sender == owner
);

bundlePrice = bundlePriceParam;
}

function setShortfallThreshold(uint256 shortfallThresholdParam) public onlyOwner {
require(
msg.sender == owner
);

shortfallThreshold = shortfallThresholdParam;
}

function setShortfallPeriods(uint256 shortfallPeriods) public onlyOwner {
require(
msg.sender == owner
);

numberOfConsecutivePeriodsForShortfall = shortfallPeriods;
}

function setSurplusThreshold(uint256 surplusThresholdParam) public onlyOwner {
require(
msg.sender == owner
);

surplusThreshold = surplusThresholdParam;
}

function setSurplusPeriods(uint256 surplusPeriods) public onlyOwner {
require(
msg.sender == owner
);

numberOfConsecutivePeriodsForSurplus = surplusPeriods;
}

function setDailyInterestRate(uint256 dailyInterestRateParam) public onlyOwner {
require(
msg.sender == owner
);

dailyInterestRate = dailyInterestRateParam;
}

function setStartDateOfContract(uint256 startDateOfContractParam) public onlyOwner {
require(
msg.sender == owner
);

startDateOfContract = startDateOfContractParam;
}

function setExpiryDateOfContract(uint256 expiryDateOfContractParam) public onlyOwner {
require(
msg.sender == owner
);

expiryDateOfContract = expiryDateOfContractParam;
}

function setVolumeShare(uint256 volumeShareParam) public onlyOwner {
require(
msg.sender == owner
);

volumeShare = volumeShareParam;
}

function setSequenceNumberInterval(uint256 sequenceNumberIntervalParam) public onlyOwner {
require(
msg.sender == owner
);

sequenceNumberInterval = sequenceNumberIntervalParam;
}

function initSequenceNumber() public onlyOwner {
require(
msg.sender == owner
);

latestShortfallSequenceNumber = 0;
latestSurplusSequenceNumber = 0;
}


function setInitialContractParams(


uint256 strikePriceParam,
uint256 bundlePriceParam,
uint256 volumeShareParam,
uint256 numberOfConsecutivePeriodsForShortfallParam,
uint256 shortfallThresholdParam,
uint256 numberOfConsecutivePeriodsForSurplusParam,
uint256 surplusThresholdParam,
uint256 dailyInterestRateParam,
uint256 startDateOfContractParam,
uint256 expiryDateOfContractParam,
uint256 sequenceNumberIntervalParam
) public onlyOwner {
require(isContractTerminated == false);


volumeShare = volumeShareParam;
strikePrice = strikePriceParam;
bundlePrice = bundlePriceParam;
numberOfConsecutivePeriodsForShortfall = numberOfConsecutivePeriodsForShortfallParam;
shortfallThreshold = shortfallThresholdParam;
numberOfConsecutivePeriodsForSurplus = numberOfConsecutivePeriodsForSurplusParam;
surplusThreshold = surplusThresholdParam;
dailyInterestRate = dailyInterestRateParam;
startDateOfContract = startDateOfContractParam;
expiryDateOfContract = expiryDateOfContractParam;
sequenceNumberInterval = sequenceNumberIntervalParam;
latestShortfallSequenceNumber = 0;
latestSurplusSequenceNumber = 0;
}


function calculateCfd(


uint256 billNumber,
uint256 sequenceNumber,
uint256 totalGeneratedVolume,
uint256 expectedVolume,
uint256 averagePrice,
uint256 marginalLossFactor,
uint256 floatingAmount,
uint256 positiveAdjustment,
uint256 negativeAdjustment,
uint256[5] calldata outstandingGeneratorAmount,
uint256[5] calldata outstandingOfftakerAmount,
uint256[5] calldata generatorDelayDays,
uint256[5] calldata offtakerDelayDays,
bool negativePriceOccurredParam,
uint256 referenceDate
) public onlyOwner
returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256) {

require(referenceDate >= startDateOfContract);
require(referenceDate < expiryDateOfContract);
require(!isContractTerminated);

uint256 offtakerVolume = totalGeneratedVolume * volumeShare;
uint256 fixedAmount = offtakerVolume * bundlePrice * marginalLossFactor;

uint256 netPositiveAdjustment = 0;
uint256 netNegativeAdjustment = 0;
if(negativeAdjustment > positiveAdjustment) {
netNegativeAdjustment = negativeAdjustment - positiveAdjustment;
}
else {
netPositiveAdjustment = positiveAdjustment - negativeAdjustment;
}

// Positive adjustment means that the price has been retroactively increased;
// therefore, it's a debt for the offtaker to the generator.
// Since a higher fixed amount is also a debt for the offtaker to the generator,
// positive adjustment and fixed amount can be added together.
// Negative adjustment works the same with the floating amount.
// The logic and calculations below need to sacrifice readability in order to
// avoid nested ifs, brackets and negative numbers.

if (floatingAmount + netNegativeAdjustment > fixedAmount + netPositiveAdjustment) {
generatorCharges[billNumber] = floatingAmount + netNegativeAdjustment - fixedAmount - netPositiveAdjustment;
} else {
offtakerCharges[billNumber] = fixedAmount + netPositiveAdjustment - floatingAmount - netNegativeAdjustment;
}

bool shortfallSequence = false;
if(sequenceNumber == latestShortfallSequenceNumber + sequenceNumberInterval ||
latestShortfallSequenceNumber == 0 ||
sequenceNumber == 0
) {
shortfallSequence = true;
}

bool surplusSequence = false;
if(sequenceNumber == latestSurplusSequenceNumber + sequenceNumberInterval ||
latestSurplusSequenceNumber == 0 ||
sequenceNumber == 0
) {
surplusSequence = true;
}

uint256 priceDifference = 0;
if(averagePrice > strikePrice) {
priceDifference = averagePrice - strikePrice;
} else {
priceDifference = strikePrice - averagePrice;
}

// Shortfall and surplus difference
uint256 volumeDifference = 0;
if(expectedVolume > offtakerVolume) { 
volumeDifference = expectedVolume - totalGeneratedVolume;
} else {
volumeDifference = totalGeneratedVolume - expectedVolume;
}

// Shortfall calculation
uint256 index = shortfallIndex + 1;
if (shortfallSequence && expectedVolume > offtakerVolume && volumeDifference >= shortfallThreshold) {
shortfalls[index].billNumber = billNumber;
shortfalls[index].price = averagePrice;
shortfalls[index].volume = expectedVolume - offtakerVolume;
shortfallChargeSum += shortfalls[index].volume * priceDifference;
shortfallIndex += 1;
latestShortfallSequenceNumber = sequenceNumber;
} 

if (shortfallSequence && expectedVolume < offtakerVolume || volumeDifference <= shortfallThreshold) {
shortfallChargeSum = 0;
shortfallIndex = 0;
latestShortfallSequenceNumber = 0;
}

if (shortfallIndex >= numberOfConsecutivePeriodsForShortfall) {
shortfallCharges[billNumber] = shortfallChargeSum;
shortfallChargeSum = 0;
shortfallIndex = 0;
latestShortfallSequenceNumber = 0;
}

// Surplus calculation
index = surplusIndex + 1;
if (surplusSequence && expectedVolume < offtakerVolume && volumeDifference >= surplusThreshold) {
surpluses[index].billNumber = billNumber;
surpluses[index].price = averagePrice;
surpluses[index].volume = offtakerVolume - expectedVolume;
surplusChargeSum += surpluses[index].volume * priceDifference;
surplusIndex += 1;
latestSurplusSequenceNumber = sequenceNumber;
} 

if (surplusSequence && expectedVolume > offtakerVolume || volumeDifference <= surplusThreshold) {
surplusChargeSum = 0;
surplusIndex = 0;
latestSurplusSequenceNumber = 0;
}

if (surplusIndex >= numberOfConsecutivePeriodsForSurplus) {
surplusCharges[billNumber] = surplusChargeSum;
surplusChargeSum = 0;
surplusIndex = 0;
latestSurplusSequenceNumber = 0;
}

for (uint256 i = 0; i < 5; i++) {
if (outstandingGeneratorAmount[i] > 0) {
generatorInterest[billNumber] += outstandingGeneratorAmount[i] * generatorDelayDays[i] * dailyInterestRate;
} if (outstandingOfftakerAmount[i] > 0) {
offtakerInterest[billNumber] += outstandingOfftakerAmount[i] * offtakerDelayDays[i] * dailyInterestRate;
}
}

if(negativePriceOccurredParam && expectedVolume >= totalGeneratedVolume) {
negativePriceCharges[billNumber] = expectedVolume * strikePrice - totalGeneratedVolume * strikePrice;
}

return (
generatorCharges[billNumber],
offtakerCharges[billNumber],
generatorInterest[billNumber],
offtakerInterest[billNumber],
shortfallCharges[billNumber],
surplusCharges[billNumber],
negativePriceCharges[billNumber]
);
}


function terminateContract() public onlyOwner {
require(
msg.sender == owner
);

isContractTerminated = true;
}
}