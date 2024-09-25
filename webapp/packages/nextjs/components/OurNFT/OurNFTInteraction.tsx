"use client";

import { useEffect, useState } from "react";
import nftJson from "../../../../../hardhat/artifacts/contracts/BasicOnChainNft.sol/BasicOnChainNft.json";
import { useReadContract } from "wagmi";
import { handleMintNft } from "~~/actions/handleMintNft";
import { OurNFTContractInfo } from "~~/types/app";

type Address = `Ox${string}`;

type TProps = {
  connectedAddress: Address;
  contract: OurNFTContractInfo;
};

export const OurNFTInteraction = (props: TProps) => {
  const { connectedAddress, contract } = props;

  const [errorMinting, setErrorMinting] = useState<Error | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [isMinted, setIsMinted] = useState(false);
  const [secretAnswer, setSecretAnswer] = useState("");
  const [addressTo, setAddressTo] = useState("");

  const {
    data: balance,
    isLoading: isLoadingNftBalance,
    isError: isErrorFetchingBalance,
  } = useReadContract({
    address: contract?.address,
    abi: nftJson.abi,
    args: [connectedAddress],
    functionName: "balanceOf",
  });

  useEffect(() => {
    setIsMinted(balance ? (balance as bigint) > 0n : false);
  }, [connectedAddress, contract?.address, balance]);

  async function mintAndNotify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (isMinting) {
      return;
    }

    setIsMinting(true);
    setErrorMinting(null);

    try {
      const resp = await handleMintNft(formData);
      console.log("Mint response:", resp);
      setIsMinted(true);
      setErrorMinting(null);
    } catch (err) {
      console.error(err);
      setIsMinted(false);
      setErrorMinting(err instanceof Error ? err : new Error("Failed to mint NFT. Please try again."));
    } finally {
      setIsMinting(false);
    }
  }

  const handleReclaimSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement the reclaim functionality
    console.log("Reclaim submitted", { secretAnswer, addressTo });
  };

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "#385183",
        padding: "20px",
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Pane 1: Mint NFT */}
        <div
          style={{
            border: "2px solid #ccc",
            padding: "20px",
            borderRadius: "8px",
            minWidth: "200px",
            backgroundColor: "#385183",
          }}
        >
          <h2 style={{ marginBottom: "15px" }}>
            Mint NFT `{contract?.name}({contract?.symbol})`{" "}
          </h2>
          {contract && <pre>{JSON.stringify(contract, null, 4)}</pre>}
          <form onSubmit={mintAndNotify}>
            <input type="hidden" name="nft_for_address" value={connectedAddress || ""} />
            <p> NFT is already minted, minting disabled </p>
            {!(contract?.tokenCounter && contract?.tokenCounter > 0) && (
              <button
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                disabled={isMinting}
              >
                {isMinting ? "Minting..." : "Mint"}
              </button>
            )}
          </form>
          {isMinted && <p style={{ color: "#2ab441", marginTop: "10px" }}>NFT minted successfully!</p>}
        </div>

        {/* Pane 2: Your NFT */}
        <div
          style={{
            border: "2px solid #ccc",
            padding: "20px",
            borderRadius: "8px",
            minWidth: "200px",
            backgroundColor: "#385183",
          }}
        >
          <h2 style={{ marginBottom: "15px" }}>Your NFT</h2>
          {isLoadingNftBalance ? (
            <p>Loading balance...</p>
          ) : isErrorFetchingBalance ? (
            <p style={{ color: "red" }}>Error fetching balance</p>
          ) : (balance as bigint) > 0n ? (
            <p>You own {balance?.toString()} NFT</p>
          ) : (
            <p>You don&apos;t own any NFTs yet</p>
          )}
        </div>
      </div>

      {/* Pane 3: Reclaim NFT */}
      <div
        style={{
          border: "2px solid #ccc",
          padding: "20px",
          borderRadius: "8px",
          backgroundColor: "#385183",
          marginTop: "20px",
          width: "100%",
        }}
      >
        <h2 style={{ marginBottom: "15px" }}>Reclaim NFT</h2>
        <form onSubmit={handleReclaimSubmit}>
          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="secretAnswer" style={{ display: "block", marginBottom: "5px" }}>
              Secret Answer:
            </label>
            <input
              type="text"
              id="secretAnswer"
              value={secretAnswer}
              onChange={e => setSecretAnswer(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="addressTo" style={{ display: "block", marginBottom: "5px" }}>
              Address To:
            </label>
            <input
              type="text"
              id="addressTo"
              value={addressTo}
              onChange={e => setAddressTo(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Reclaim
          </button>
        </form>
      </div>

      {errorMinting && <p style={{ color: "red" }}>{errorMinting.message}</p>}
    </div>
  );
};
