import { contractAddresses, abi } from "../constants";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useEffect, useState } from "react";
import { useNotification } from "web3uikit";
import { ethers } from "ethers";
export default function LotteryEntrance(){
  const {Moralis, isWeb3Enabled, chainId: chainIdhex} = useMoralis()
  const chainId = parseInt(chainIdhex)
  const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
  // https://stackoverflow.com/questions/58252454/react-hooks-using-usestate-vs-just-variables
  const [entranceFee, setEntranceFee] = useState("0")
  const [numberOfPlayers, setNumberOfPlayers] = useState("0")
  const [recentWinner, setRecentWinner] = useState("0")
  const dispatch = useNotification()
  const {
    runContractFunction: enterRaffle,
    data: enteTxResponse,
  } = useWeb3Contract({
    abi: abi,
    contractAddresses: raffleAddress,
    functionName: "enterRaffle",
    msgValue: entranceFee,
    params: {},
  })
  async function updateUIValues(){
    const entranceFeeFromCall = (await getEntranceFee()).toString()
    const numberPlayersFromCall = (await getPlayersNumber()).toString()
    const recentWinnerFromCall = await getRecentWinner()
    setEntranceFee(entranceFeeFromCall)
    setNumberOfPlayers(numPlayersFromCall)
    setRecentWinner(recentWinnerFromCall)
  }
  useEffect(() => {
    if(isWeb3Enabled){
      updateUIValues()
    }
  }, [isWeb3Enabled])
  const handleNewNotification = () => {
    dispatch({
      type: "info",
      message: "Transaction Complete !",
      title: "Transaction Notification",
      position: "topR",
      icon: "bell",
    })
  }
  const handleSuccess = async(tx) => {
    try {
      await tx.wait(1)
      updateUIValues()
      handleNewNotification(tx)
    }
    catch(error){
      console.log(error)
    }
  }
  return(
    <div className = "p-5">
        <h1 className = "py-4 px-4 font-bold text-3xl">
          Lottery
        </h1>
        {raffleAddress ? (
          <>
            <button
              className = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
              onClick = {async() =>
                await enterRaffle({
                  onSuccess: handleSuccess,
                  onError: (error) => console.log(error),
                })
              }
              disabled={isLoading || isFetching}
            >
              {isLoading || isFetching ? (
                <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
              ) : (
                "Enter Raffle"
              )}
            </button>
            <div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")}ETH</div>
            <div>The current number of players is: {numberOfPlayers}</div>
            <div>The most previous winner was: {recentWinner}</div>
          </>
        ) : (
          <div>
            Please connect to a supported chain
          </div>
        )}
    </div>
  )
}