//To interract with the smart contract we need
//Actual contract address
//The contract ABI
//The bytecode
const numberContractAddress = "0x14A1a6730707CeE79bc48DAfCDAfe30c7f30Bd34";
const numberContractABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_number",
				"type": "uint256"
			}
		],
		"name": "updateNumber",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "number",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

async function callContract() {
 const provider = new ethers.providers.Web3Provider(window.ethereum);
 const numberContract = new ethers.Contract(numberContractAddress, numberContractABI, provider);

// await numberContract.updateNumber(20);
 const num = await numberContract.number()
 console.log(num.toString())
}