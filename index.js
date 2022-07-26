let provider = new ethers.providers.Web3Provider(window.ethereum);
let signer

//Connect the metamask with Dapp{
async function connectMetamask(){
    //Metamask requires requesting permission of access to user accounts
    await provider.send("eth_requestAccounts", []);

    signer = await provider.getSigner();

    console.log("Account Address:", await signer.getAddress());
}
async function getBalance(){
    const balance = await signer.getBalance();
    const convertToEth = 1e6;

    console.log("account's balance in ether:", balance.toString()/convertToEth);
}

//You need three things to read data from contract
//1. Contract Address
//2. ABI
//3. Signer0x13512979ADE267AB5100878E2e0f485B568328a4
const usdtAddress = "0x13512979ADE267AB5100878E2e0f485B568328a4";

const usdtAbi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address) view returns (uint256)",
    "function totalSupply() view returns (uint256)",
    "function transfer(address to , uint256 value) returns (bool)",
]

async function readDataFromSmartContract(){
    const usdtContract = new ethers.Contract(usdtAddress, usdtAbi, signer);
    
    const name = await usdtContract.name();
    const symbol = await usdtContract.symbol();
    const decimals = await usdtContract.decimals();
    const balance = await usdtContract.balanceOf(signer.getAddress());
    const totalSupply = await usdtContract.totalSupply();

    console.log(`name = ${name}`);
    console.log(`symbol = ${symbol}`);
    console.log(`decimals = ${decimals}`);
    console.log(`balance = ${balance}`);
    console.log(`totalSupply = ${totalSupply/1e6}`);

}
//Send Usdt from one account to another
async function sendUsdtToAccount(){
    const usdtContract = new ethers.Contract(usdtAddress, usdtAbi, signer);
    usdtContract.connect(signer).transfer("0xA964c459224B9c56404c98c98F5483FEBb648Bd4", "500000000");
}

async function deployContract(){
    const abi= 
    [
        {
            "inputs": [],
            "name": "deposit",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "emitEvent",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "incrementNumber",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "randomNumber",
                    "type": "uint256"
                }
            ],
            "name": "MyEvent",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "getBalance",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
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
    const numberContractBytecode =  "6080604052600160005534801561001557600080fd5b5061023e806100256000396000f3fe60806040526004361061004a5760003560e01c806312065fe01461004f578063273ea3e31461007a5780637b0cb839146100915780638381f58a146100a8578063d0e30db0146100d3575b600080fd5b34801561005b57600080fd5b506100646100dd565b604051610071919061015e565b60405180910390f35b34801561008657600080fd5b5061008f6100e5565b005b34801561009d57600080fd5b506100a6610100565b005b3480156100b457600080fd5b506100bd610147565b6040516100ca919061015e565b60405180910390f35b6100db61014d565b005b600047905090565b60016000808282546100f79190610179565b92505081905550565b60633373ffffffffffffffffffffffffffffffffffffffff167fdf50c7bb3b25f812aedef81bc334454040e7b27e27de95a79451d663013b7e1760405160405180910390a3565b60005481565b565b610158816101cf565b82525050565b6000602082019050610173600083018461014f565b92915050565b6000610184826101cf565b915061018f836101cf565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff038211156101c4576101c36101d9565b5b828201905092915050565b6000819050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fdfea2646970667358221220de2269ae5543b32a120676d510ae3fda15bb15a8908b79f315a53638beb10f5564736f6c63430008070033"
    const factory = new ethers.ContractFactory(abi, numberContractBytecode, signer);
    const numberContract = await factory.deploy();
    const transactionReceipt = await numberContract.deployTransaction.wait();

    console.log(transactionReceipt);
}
async function incrementNumberOnSmartContract(){
    const numberContractAddress = "0x3021111730FE38bF23dF1B65989F3F1674FE61fC";
    const numberContractAbi = [
        "function number() view returns (uint256)",
        "function incrementNumber() external"
    ]
    const numberContract = new ethers.Contract(numberContractAddress, numberContractAbi, provider);

    let number = await numberContract.number();

    console.log(`Initial number ${number.toString()}`);

    const txResponse = await numberContract.connect(signer).incrementNumber();
    await txResponse.wait();
    number = await numberContract.number();
    console.log("Updated number = ", number.toString());
}
//Emit an event, print out the event immediately aftter being emitted
async function emitEvent(){
    const numberContractAddress = "0x3021111730FE38bF23dF1B65989F3F1674FE61fC";
    const numberContractAbi = [
      "function emitEvent() external",
    ]
    const numberContract = new ethers.Contract(numberContractAddress, numberContractAbi, provider);

    const tx = await numberContract.connect(signer).emitEvent();
    txReceipt = await tx.wait();
    console.log("Event emitted");
    console.log(txReceipt.events[0]);
}

async function listenToEvents(){
    //Subscribe to the event calling listener when they occur
    const numberContractAddress = "0x3021111730FE38bF23dF1B65989F3F1674FE61fC";
    const numberContractAbi = [
        {
            "inputs": [],
            "name": "deposit",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "emitEvent",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "incrementNumber",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "randomNumber",
                    "type": "uint256"
                }
            ],
            "name": "MyEvent",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "getBalance",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
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
    //The contract object
    const numberContract = new ethers.Contract(numberContractAddress, numberContractAbi, provider);
    numberContract.on("MyEvent", (from, number)=>{
        console.log(`Address emiing event ${from}`);
        console.log(`Number from event = ${number.toString()}`);
    })
}

async function sendEtherWhenCallingFunction(){
    const numberContractAddress = "0x3021111730FE38bF23dF1B65989F3F1674FE61fC";
    const numberContractAbi = [
        {
            "inputs": [],
            "name": "deposit",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "emitEvent",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "incrementNumber",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "randomNumber",
                    "type": "uint256"
                }
            ],
            "name": "MyEvent",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "getBalance",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
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
    //The contract object
    const numberContract =new ethers.Contract(numberContractAddress, numberContractAbi, provider);
    const options = {value: ethers.utils.parseEther("0.00005")};
    const txResponse = await numberContract.connect(signer).deposit(options);
    await txResponse.wait();

    const balance = await numberContract.getBalance();
    console.log("Balance = ", balance.toString());
}